package com.geoscene.ar;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.location.Location;
import android.util.Log;
import org.javatuples.Pair;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
import com.geoscene.data_access.CacheManager;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.elevation.Elevation;
import com.geoscene.elevation.Raster;
import com.geoscene.geography.LocationUtils;
import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.places.Places;
import com.geoscene.places.fov_analyzer.FOVAnalyzer;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.viewshed.ViewShed;
import com.google.ar.core.Frame;
import com.google.ar.core.TrackingState;
import com.google.ar.sceneform.ArSceneView;
import com.google.ar.sceneform.Node;
import com.google.ar.sceneform.rendering.ViewRenderable;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.observers.DisposableSingleObserver;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class ARNodesInitializer {

    public boolean hasFinishedLoading = false;
    private ViewRenderable locationMarkerRenderable;

    private ArSceneView arSceneView;
    private LocationScene locationScene;
    private DeviceSensors sensors;
    private ReactContext context;
    private Map<String, HashSet<String>> placesTypes;

    private ARFragment arFragment;
    private boolean determineViewshed;
    private int radiusKM;

    public ARNodesInitializer(ReactContext context, DeviceSensors sensors, ArSceneView arSceneView, boolean determineViewshed, int radiusKM, Map<String, HashSet<String>> placesTypes, ARFragment arFragment) {
        this.arSceneView = arSceneView;
        this.sensors = sensors;
        this.context = context;
        this.arFragment = arFragment;
        hasFinishedLoading = true;
        this.determineViewshed = determineViewshed;
        this.radiusKM = radiusKM;
        this.placesTypes = placesTypes;
    }

    private void getAndRenderMarkerInformation() {
        Location deviceLocation = sensors.getDeviceLocation();
        BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()), LocationConstants.OBSERVER_BBOX); //PADDING_KM);
        PersistLocationObject cachedLocationInfo = CacheManager.fetchFromCache(bbox);

        if(cachedLocationInfo != null) {
            arFragment.dispatchUseCache();
            Raster raster = cachedLocationInfo.getRaster(context);
            raster.setViewshed(determineViewshed? ViewShed.calculateViewshed(raster, deviceLocation.getLatitude(), deviceLocation.getLongitude()) : null);
            raster.setBoundingBox(bbox);
            PointsOfInterest pois = cachedLocationInfo.getPois();
            renderFOVMarkers(raster, pois);
        } else requestLocationInformation(radiusKM);
    }

    private Single<ElevationLocationData> subscribeAPICalls(Coordinate center, int radiusKM) {
        Elevation elevation = new Elevation();
        Places places = new Places();
        Location deviceLocation = sensors.getDeviceLocation();
        final CompositeDisposable disposable = new CompositeDisposable();
        dispatchLoadingProgress("Retrieving places and elevation data around you.");
        Single<Raster> elevationData = elevation.fetchElevationRaster(center, radiusKM, determineViewshed)
                .doOnSuccess(s -> dispatchLoadingProgress("Elevation data retrieved and analyzed"))
                .subscribeOn(Schedulers.computation()); // computation
        Single<PointsOfInterest> placesData = places.searchPlaces(center, radiusKM)
                .doOnSuccess(s -> dispatchLoadingProgress("Places around you retrieved."))
                .subscribeOn(Schedulers.io());
        return elevationData.zipWith(placesData, ElevationLocationData::new)
                .subscribeOn(Schedulers.io());
    }

    private void requestLocationInformation(int radiusKM) {
        Location deviceLocation = sensors.getDeviceLocation();
        Coordinate center = new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude());
        Single<ElevationLocationData> chainedAPICall = subscribeAPICalls(center, radiusKM);

        chainedAPICall
            .observeOn(AndroidSchedulers.mainThread())
            .subscribeWith(new DisposableSingleObserver<ElevationLocationData>() {
                @Override
                public void onSuccess(@NonNull ElevationLocationData data) {
                    StorageAccess.storeCacheLocationInfo(context, data.raster.getBbox(), data.raster, data.getPlaces());
                    renderFOVMarkers(data.getRaster(), data.getPlaces());
                }

                @Override
                public void onError(Throwable e) {
                    Log.v("ERROR", e.getMessage());
                }
            });
    }

    public void downloadAndStoreLocationInformation(String name, String description, Coordinate center, int radiusKM) {
        Single<ElevationLocationData> chainedAPICall = subscribeAPICalls(center, radiusKM);

        chainedAPICall
                .observeOn(AndroidSchedulers.mainThread())
                .subscribeWith(new DisposableSingleObserver<ElevationLocationData>() {
                    @Override
                    public void onSuccess(@NonNull ElevationLocationData data) {
                        StorageAccess.storeLocationInfo(context, name, description, data.raster.getBbox(), data.raster, data.getPlaces());
                        dispatchDownloadEvent(true);
                    }

                    @Override
                    public void onError(Throwable e) {
                        Log.v("ERROR", e.getMessage());
                    }
                });
    }

    public void initializeLocationMarkers(Activity activity) {
        arSceneView.getScene().addOnUpdateListener(
            frameTime -> {
                if (!hasFinishedLoading) {
                    return;
                }
                if (locationScene == null) {
                    // If our locationScene object hasn't been setup yet, this is a good time to do it
                    // We know that here, the AR components have been initiated.
                    locationScene = new LocationScene(activity, arSceneView, sensors, false);
                    locationScene.setMinimalRefreshing(false);
                    locationScene.setOffsetOverlapping(true);
                    getAndRenderMarkerInformation();
                }

                handleARFrame();
            });
    }

    private void handleARFrame() {
        Frame frame = arSceneView.getArFrame();
        Log.d("HandleARFrame", "handle");
        if (frame == null || frame.getCamera().getTrackingState() != TrackingState.TRACKING) {
            return;
        }

        if (locationScene != null) {
            locationScene.processFrame(frame);
        }
    }


    private void renderFOVMarkers(Raster raster, PointsOfInterest pois) {
        dispatchLoadingProgress("Determining your field of view.");
        List<Pair<Element, Coordinate>> visibleLocations = FOVAnalyzer.intersectVisiblePlaces(raster, pois, placesTypes);

        Log.d("LOCATIONS", visibleLocations.toString());
        dispatchLoadingProgress("Field of view determined successfully.");

        Location deviceLocation = sensors.getDeviceLocation();
        int observerElevation = raster.getElevationByCoordinate(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()));
        List<Boolean> readyNodes = new ArrayList<>();

        List<Integer> elevations = visibleLocations.stream().map(l -> {
            double locationLat = l.getValue1().getLat();
            double locationLon = l.getValue1().getLon();
            return raster.getElevationByCoordinate(new Coordinate(locationLat, locationLon));
        }).collect(Collectors.toList());

        Integer maxHeightDiff = elevations.stream().mapToInt(i -> i - observerElevation).max().orElse(0);
        Integer minHeightDiff = elevations.stream().mapToInt(i -> i - observerElevation).min().orElse(0);

        for (Pair<Element, Coordinate> visibleLocation : visibleLocations) {
            double locationLat = visibleLocation.getValue1().getLat();
            double locationLon = visibleLocation.getValue1().getLon();
            int elevation = raster.getElevationByCoordinate(new Coordinate(locationLat, locationLon));
            int elevationDiff = elevation - observerElevation;

            ViewRenderable.builder()
                .setView(context, R.layout.location_marker_card)
                .build()
                .thenAccept(renderable -> {
                    Node locationNode = getLocationMarkerNode(renderable, visibleLocation.getValue0(), elevation, visibleLocation.getValue1());
                    LocationMarker layoutLocationMarker = new LocationMarker(locationLon, locationLat, locationNode);
//                                                layoutLocationMarker.setHeight(2);
//                                                layoutLocationMarker.setScaleModifier(0.2f);
                    layoutLocationMarker.setScalingMode(LocationMarker.ScalingMode.GRADUAL_TO_MAX_RENDER_DISTANCE);
                    View eView = renderable.getView();
                    TextView nameTextView = eView.findViewById(R.id.name);
                    TextView typeTextView = eView.findViewById(R.id.type);
                    TextView distanceTextView = eView.findViewById(R.id.distance);

                    typeTextView.setText(ARFragment.getNodeTypeString(visibleLocation.getValue0()));
                    nameTextView.setText(visibleLocation.getValue0().tags.nameEng != null ? visibleLocation.getValue0().tags.nameEng : visibleLocation.getValue0().tags.name);
                    // An example "onRender" event, called every frame
                    // Updates the layout with the markers distance
                    layoutLocationMarker.setRenderEvent(node -> {
                        if(locationScene.getDistanceLimit() < node.getDistance()) {
                            locationScene.setDistanceLimit(node.getDistance());
                        }
                        distanceTextView.setText(node.getDistance() >= 1000 ? String.format("%.3f", ((float)node.getDistance() / (float)1000)) + "KM" : node.getDistance() + "m");
                    });
                    // Adding the marker
                    locationScene.mLocationMarkers.add(layoutLocationMarker);
                    readyNodes.add(true);
                    if(readyNodes.size() == visibleLocations.size()) {
                        arFragment.dispatchReady();
                        hasFinishedLoading = true;
                    }
                });
        }

        dispatchObserverElevation(observerElevation);
        dispatchLoadingProgress("Starting Augmented reality scene.");
    }


    @SuppressLint("ClickableViewAccessibility")
    private Node getLocationMarkerNode(ViewRenderable renderable, Element location, int elevation, Coordinate coord) {
        Node base = new Node();
        base.setRenderable(renderable);
        // Add  listeners etc here
        View eView = renderable.getView();
        if(location != null) {
            eView.setOnTouchListener((v, event) -> {
                Location deviceLocation = sensors.getDeviceLocation();
                int markerDistance = (int) Math.round(
                        LocationUtils.distance(
                                coord.getLat(),
                                deviceLocation.getLatitude(),
                                coord.getLon(),
                                deviceLocation.getLongitude(),
                                0,
                                0)
                );
                arFragment.dispatchLocation(location, elevation, markerDistance >= 1000 ? String.format("%.3f", ((float)markerDistance / (float)1000)) + "KM" : markerDistance + "m");
                return false;
            });
        }

        return base;
    }

    private void dispatchLoadingProgress(String message) {
        if(arFragment != null) {
            arFragment.dispatchLoadingProgress(message);
        }
    }


    public void dispatchDownloadEvent(boolean done) {
        WritableMap params = Arguments.createMap();
        params.putBoolean("done", done);
        context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("DownloadEvent", params);
    }

    public LocationScene getLocationScene() {
        return locationScene;
    }

    private void dispatchObserverElevation(int elevation) {
        if(arFragment != null) {
            arFragment.dispatchObserverElevation(elevation);
        }
    }

    private static class ElevationLocationData {
        private Raster raster;
        private PointsOfInterest places;

        public ElevationLocationData(Raster raster, PointsOfInterest places) {
            this.raster = raster;
            this.places = places;
        }

        public Raster getRaster() {
            return raster;
        }

        public PointsOfInterest getPlaces() {
            return places;
        }
    }
}
