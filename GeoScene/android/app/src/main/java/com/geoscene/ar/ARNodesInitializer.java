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
import com.google.ar.sceneform.Scene;
import com.google.ar.sceneform.collision.CollisionShape;
import com.google.ar.sceneform.rendering.ViewRenderable;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.exceptions.CompositeException;
import io.reactivex.rxjava3.observers.DisposableSingleObserver;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class ARNodesInitializer {

    public boolean hasFinishedLoading;
    private ArSceneView arSceneView;
    private LocationScene locationScene;
    private DeviceSensors sensors;
    private ReactContext context;
    private Map<String, HashSet<String>> placesTypes;

    private ARFragment arFragment;
    private boolean determineViewshed;
    private boolean showPlacesApp;
    private boolean showLocationCenter;
    private int radiusKM;

    private Scene.OnUpdateListener updateListener;
    private CompositeDisposable disposable;

    private boolean active;

    public ARNodesInitializer(ReactContext context, DeviceSensors sensors, ArSceneView arSceneView, boolean determineViewshed, int radiusKM, Map<String, HashSet<String>> placesTypes, boolean showPlacesApp, boolean showLocationCenter, ARFragment arFragment) {
        this.arSceneView = arSceneView;
        this.sensors = sensors;
        this.context = context;
        this.arFragment = arFragment;
        this.determineViewshed = determineViewshed;
        this.radiusKM = radiusKM;
        this.placesTypes = placesTypes;
        this.showPlacesApp = showPlacesApp;
        this.showLocationCenter = showLocationCenter;

        hasFinishedLoading = false;
        disposable = new CompositeDisposable();
        active = true;
    }

    public ARNodesInitializer(ReactContext context, DeviceSensors sensors) {
        this.sensors = sensors;
        this.context = context;

        hasFinishedLoading = false;
        disposable = new CompositeDisposable();
        active = true;
    }

    private void getAndRenderMarkerInformation() {
        Location deviceLocation = sensors.getDeviceLocation();
        BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()), radiusKM);
        PersistLocationObject cachedLocationInfo = CacheManager.fetchFromCache(bbox);

        if(cachedLocationInfo != null) {
            if(cachedLocationInfo.cached) {
                arFragment.dispatchUseCache();
                dispatchLoadingProgress("Using places and elevation from application cache.");
            } else {
                arFragment.dispatchUseLocal(cachedLocationInfo.name);
                dispatchLoadingProgress("Using places and elevation from local device storage.");
            }
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
        dispatchLoadingProgress("Retrieving places and elevation data around you.");

        Single<Raster> elevationData = elevation.fetchElevationRaster(center, radiusKM, determineViewshed)
                .doOnSuccess(s -> dispatchLoadingProgress("Elevation data retrieved and analyzed"))
                .subscribeOn(Schedulers.computation()) // computation
                .doOnError(e -> arFragment.dispatchReady(false));
        Single<PointsOfInterest> placesData = places.searchPlaces(center, radiusKM)
                .doOnSuccess(s -> dispatchLoadingProgress("Places around you retrieved."))
                .subscribeOn(Schedulers.io())
                .doOnError(e -> arFragment.dispatchReady(false));
        return elevationData.zipWith(placesData, ElevationLocationData::new)
                .subscribeOn(Schedulers.io());
    }

    private void requestLocationInformation(int radiusKM) {
        Location deviceLocation = sensors.getDeviceLocation();
        Coordinate center = new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude());
        Single<ElevationLocationData> chainedAPICall = subscribeAPICalls(center, radiusKM);

        disposable.add(chainedAPICall
                .observeOn(AndroidSchedulers.mainThread())
                .subscribeWith(new DisposableSingleObserver<ElevationLocationData>() {
                    @Override
                    public void onSuccess(@NonNull ElevationLocationData data) {
                        StorageAccess.storeCacheLocationInfo(context, data.raster.getBbox(), data.raster, data.getPlaces());
                        renderFOVMarkers(data.getRaster(), data.getPlaces());
                    }

                    @Override
                    public void onError(Throwable e) {
                        arFragment.dispatchReady(false);
                    }
                }));
    }

    public void downloadAndStoreLocationInformation(String name, String description, Coordinate center, int radiusKM) {
        Single<ElevationLocationData> chainedAPICall = subscribeAPICalls(center, radiusKM);

        disposable.add(chainedAPICall
                .observeOn(AndroidSchedulers.mainThread())
                .subscribeWith(new DisposableSingleObserver<ElevationLocationData>() {
                    @Override
                    public void onSuccess(@NonNull ElevationLocationData data) {
                        StorageAccess.storeLocationInfo(context, name, description, data.raster.getBbox(), data.raster, data.getPlaces());
                        dispatchDownloadEvent(true, false);
                    }

                    @Override
                    public void onError(Throwable e) {
                        dispatchDownloadEvent(false, true);
                    }
                }));
    }

    public void initializeLocationMarkers(Activity activity) {
        if (updateListener == null) {
            updateListener = frameTime -> {
                if (locationScene == null) {
                    // If our locationScene object hasn't been setup yet, this is a good time to do it
                    // We know that here, the AR components have been initiated.
                    locationScene = new LocationScene(activity, arSceneView, sensors);
                    locationScene.setMinimalRefreshing(false);
                    locationScene.setOffsetOverlapping(false);
                    getAndRenderMarkerInformation();
                }
                if (hasFinishedLoading && active) {
                    handleARFrame();
                }
            };
            arSceneView.getScene().addOnUpdateListener(updateListener);
        }
    }

    public void stopUpdateListener() {
        active = false;
        if(updateListener != null) {
            locationScene.stopCalculationTask();
            locationScene.clearMarkers();
            arSceneView.getScene().removeOnUpdateListener(updateListener);
        }
    }

    public void disposeRequests() {
        if(disposable != null) {
            try {
                disposable.dispose();
                disposable.clear();
            } catch (Exception ignored) {}
        }
    }

    private void handleARFrame() {
        Frame frame = arSceneView.getArFrame();
        if (frame == null || frame.getCamera().getTrackingState() != TrackingState.TRACKING) {
            return;
        }

        if (locationScene != null) {
            locationScene.processFrame(frame);
        }
    }


    private void renderFOVMarkers(Raster raster, PointsOfInterest pois) {
        dispatchLoadingProgress("Determining your field of view.");
        List<Pair<Element, Coordinate>> visibleLocations = FOVAnalyzer.intersectVisiblePlaces(raster, pois, placesTypes, showPlacesApp, showLocationCenter);
        dispatchLoadingProgress("Field of view determined successfully.");

        Location deviceLocation = sensors.getDeviceLocation();
        int observerElevation = raster.getElevationByCoordinate(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()));
//
//        List<Integer> elevations = visibleLocations.stream().map(l -> {
//            double locationLat = l.getValue1().getLat();
//            double locationLon = l.getValue1().getLon();
//            return raster.getElevationByCoordinate(new Coordinate(locationLat, locationLon));
//        }).collect(Collectors.toList());
//
//        Integer maxHeightDiff = elevations.stream().mapToInt(i -> i - observerElevation).max().orElse(0);
//        Integer minHeightDiff = elevations.stream().mapToInt(i -> i - observerElevation).min().orElse(0);
        if(visibleLocations.isEmpty()) {
            arFragment.dispatchReady(true);
            hasFinishedLoading = true;
            arFragment.dispatchLocationCount(0);
            dispatchObserverElevation(observerElevation);
            dispatchLoadingProgress("Starting Augmented reality scene.");
            return;
        }

        for (Pair<Element, Coordinate> visibleLocation : visibleLocations) {
            double locationLat = visibleLocation.getValue1().getLat();
            double locationLon = visibleLocation.getValue1().getLon();
            int elevation = raster.getElevationByCoordinate(new Coordinate(locationLat, locationLon));
            int elevationDiff = elevation - observerElevation;
            Log.d("DIFF", String.valueOf(elevationDiff));
            Log.d("ELEVATION", String.valueOf(elevation));

            ViewRenderable.builder()
                .setView(context, R.layout.location_marker_card)
                .build()
                .thenAccept(renderable -> {
                    Node locationNode = getLocationMarkerNode(renderable, visibleLocation.getValue0(), elevation, visibleLocation.getValue1());
                    LocationMarker layoutLocationMarker = new LocationMarker(locationLon, locationLat, locationNode);
                    //layoutLocationMarker.setHeight(elevationDiff * 50);
                    layoutLocationMarker.setHeight(elevation * 10);

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
                        if(node.isEnabled() && locationScene.getDistanceLimit() < node.getDistance()) {
                            locationScene.setDistanceLimit(node.getDistance());
                        }
                        distanceTextView.setText(node.getDistance() >= 1000 ? String.format("%.3f", ((float)node.getDistance() / (float)1000)) + "KM" : node.getDistance() + "m");
                    });
                    // Adding the marker
                    locationScene.mLocationMarkers.add(layoutLocationMarker);
                    if(locationScene.mLocationMarkers.size() == visibleLocations.size()) {
//                        locationScene.mLocationMarkers.sort((o1, o2) -> o1.anchorNode.getDistance() - o2.anchorNode.getDistance());
//                        Log.d("SIGNS",  String.valueOf(locationScene.mLocationMarkers.stream().map(m -> m.anchorNode.getDistance()).collect(Collectors.toList())));
                        arFragment.dispatchReady(true);
                        arFragment.dispatchLocationCount(visibleLocations.size());
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
        // Add marker touch listeners here
        View eView = renderable.getView();
        if(location != null) {
            eView.setOnTouchListener((v, event) -> {
                if(sensors.isNetworkActive()) {
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
                    arFragment.dispatchLocation(location, elevation, markerDistance >= 1000 ? String.format("%.3f", ((float) markerDistance / (float) 1000)) + "KM" : markerDistance + "m");
                    return true;
                }
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


    public void dispatchDownloadEvent(boolean done, boolean error) {
        WritableMap params = Arguments.createMap();
        params.putBoolean("done", done);
        params.putBoolean("error", error);
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
