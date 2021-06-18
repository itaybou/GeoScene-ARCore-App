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
import com.geoscene.location_markers.LocationElevationNode;
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
import java.util.Collection;
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

    private final int DISTANCE_GROUP_SIZE = 10;
    private final int LOCATION_MARKER_HEIGHT = 200;

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
    private boolean markersRefresh;
    private boolean showPlacesOnMap;
    private boolean realisticMarkers;
    private boolean offsetOverlapping;
    private int radiusKM;

    private Scene.OnUpdateListener updateListener;
    private CompositeDisposable disposable;

    private boolean active;

    public ARNodesInitializer(ReactContext context, DeviceSensors sensors, ArSceneView arSceneView, boolean determineViewshed, int radiusKM, Map<String, HashSet<String>> placesTypes,
                              boolean showPlacesApp, boolean showPlacesOnMap, boolean showLocationCenter, boolean markersRefresh, boolean realisticMarkers, boolean offsetOverlapping, ARFragment arFragment) {
        this.arSceneView = arSceneView;
        this.sensors = sensors;
        this.context = context;
        this.arFragment = arFragment;
        this.determineViewshed = determineViewshed;
        this.radiusKM = radiusKM;
        this.placesTypes = placesTypes;
        this.showPlacesApp = showPlacesApp;
        this.showLocationCenter = showLocationCenter;
        this.markersRefresh = markersRefresh;
        this.realisticMarkers = realisticMarkers;
        this.showPlacesOnMap = showPlacesOnMap;
        this.offsetOverlapping = offsetOverlapping;

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

        if (cachedLocationInfo != null) {
            if (cachedLocationInfo.cached) {
                arFragment.dispatchUseCache();
                dispatchLoadingProgress("Using places and elevation from application cache.");
            } else {
                arFragment.dispatchUseLocal(cachedLocationInfo.name);
                dispatchLoadingProgress("Using places and elevation from local device storage.");
            }
            Raster raster = cachedLocationInfo.getRaster(context);
            raster.setViewshed(determineViewshed ? ViewShed.calculateViewshed(raster, deviceLocation.getLatitude(), deviceLocation.getLongitude()) : null);
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
                    locationScene = new LocationScene(activity, arSceneView, sensors, markersRefresh, DISTANCE_GROUP_SIZE);
                    locationScene.setMinimalRefreshing(!realisticMarkers);
                    locationScene.setOffsetOverlapping(offsetOverlapping);
                    locationScene.setRemoveOverlapping(false);
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
        if (updateListener != null) {
            locationScene.stopCalculationTask();
            locationScene.clearMarkers();
            arSceneView.getScene().removeOnUpdateListener(updateListener);
        }
    }

    public void disposeRequests() {
        if (disposable != null) {
            try {
                disposable.dispose();
                disposable.clear();
            } catch (Exception ignored) {
            }
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
        Coordinate observer = new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude());
        int observerElevation = raster.getElevationByCoordinate(observer);

        if (visibleLocations.isEmpty()) {
            arFragment.dispatchReady(true);
            hasFinishedLoading = true;
            arFragment.dispatchLocationCount(0, 0);
            dispatchObserverElevation(observerElevation);
            dispatchLoadingProgress("Starting Augmented reality scene.");
            return;
        }

        if (!markersRefresh) {
            visibleLocations.stream().mapToDouble(l -> LocationUtils.distance(observer.getLat(), l.getValue1().getLat(), observer.getLon(), l.getValue1().getLon(), 0, 0))
                    .max().ifPresent(maxDistance -> {
                if (maxDistance > locationScene.getDistanceLimit()) {
                    locationScene.setDistanceLimit((int) Math.ceil(maxDistance));
                }
            });
        }

        int index = 0;
        for (Pair<Element, Coordinate> visibleLocation : visibleLocations) {
            double locationLat = visibleLocation.getValue1().getLat();
            double locationLon = visibleLocation.getValue1().getLon();
            int elevation = raster.getElevationByCoordinate(new Coordinate(locationLat, locationLon));
            int elevationDiff = elevation - observerElevation;
            float distanceKm = (float) LocationUtils.distance(observer.getLat(), locationLat, observer.getLon(), locationLon, 0, 0) / 1000;

            int finalIndex = index;
            ViewRenderable.builder()
                    .setView(context, R.layout.location_marker_card)
                    .build()
                    .thenAccept(renderable -> {
                        LocationElevationNode locationNode = getLocationMarkerNode(renderable, visibleLocation.getValue0(), elevation, visibleLocation.getValue1(), finalIndex);
                        LocationMarker layoutLocationMarker = new LocationMarker(locationLon, locationLat, locationNode);
                        layoutLocationMarker.setName(visibleLocation.getValue0().tags.nameEng != null ? visibleLocation.getValue0().tags.nameEng : visibleLocation.getValue0().tags.name);
                        layoutLocationMarker.setHeight(elevationDiff * 10 + (distanceKm < 1 ? LOCATION_MARKER_HEIGHT * distanceKm: LOCATION_MARKER_HEIGHT)); // Place marker in relative height distance from the observer
                        layoutLocationMarker.setScalingMode(LocationMarker.ScalingMode.GRADUAL_TO_MAX_RENDER_DISTANCE);
                        View eView = renderable.getView();
                        TextView nameTextView = eView.findViewById(R.id.name);
                        TextView typeTextView = eView.findViewById(R.id.type);
                        TextView distanceTextView = eView.findViewById(R.id.distance);

                        typeTextView.setText(ARFragment.getNodeTypeString(visibleLocation.getValue0()));
                        nameTextView.setText(layoutLocationMarker.getName());
                        // "onRender" event, called every frame
                        // Updates the layout with the markers distance
                        layoutLocationMarker.setRenderEvent(node -> {
                            if (node.isEnabled() && locationScene.getDistanceLimit() < node.getDistance()) {
                                locationScene.setDistanceLimit(node.getDistance());
                            }
                            distanceTextView.setText(node.getDistance() >= 1000 ? String.format("%.3f", ((float) node.getDistance() / (float) 1000)) + "Km" : node.getDistance() + "m");
                        });
                        // Adding the marker
                        locationScene.mLocationMarkers.add(layoutLocationMarker);

                        // Start location scene when created all renderables
                        if (locationScene.mLocationMarkers.size() == visibleLocations.size()) {
                            startLocationScene(observer, locationScene.mLocationMarkers.size());
                        }
                    });
            index++;
        }

        dispatchObserverElevation(observerElevation);
        dispatchLoadingProgress("Starting Augmented reality scene.");
    }

    public void startLocationScene(Coordinate observer, int locationCount) {
        locationScene.mLocationMarkers.sort((l1, l2) ->
                Double.compare(LocationUtils.distance(observer.getLat(), l1.latitude, observer.getLon(), l1.longitude, 0, 0),
                        LocationUtils.distance(observer.getLat(), l2.latitude, observer.getLon(), l2.longitude, 0, 0)));
        for(int index = 0; index < locationScene.mLocationMarkers.size(); ++index) {
            locationScene.mLocationMarkers.get(index).setDistanceGroup(index / DISTANCE_GROUP_SIZE);
        }
        if(!locationScene.mLocationMarkers.isEmpty()) {
            LocationMarker minMarker = locationScene.mLocationMarkers.get(0);
            LocationMarker maxMarker = locationScene.mLocationMarkers.get(Math.min(DISTANCE_GROUP_SIZE - 1, locationScene.mLocationMarkers.size() - 1));
            arFragment.dispatchVisibleMarkers(
                    (int) Math.ceil(LocationUtils.distance(observer.getLat(), minMarker.latitude, observer.getLon(), minMarker.longitude, 0, 0)),
                    (int) Math.ceil(LocationUtils.distance(observer.getLat(), maxMarker.latitude, observer.getLon(), maxMarker.longitude, 0, 0)),
                    true,
                    locationCount - 1 < DISTANCE_GROUP_SIZE);
            if(showPlacesOnMap) {
                if(locationScene.mLocationMarkers.isEmpty()) {
                    arFragment.dispatchMapLocations(new ArrayList<>());
                } else {
                    arFragment.dispatchMapLocations(locationScene.mLocationMarkers
                            .subList(0, Math.min(DISTANCE_GROUP_SIZE, locationScene.mLocationMarkers.size()))
                            .stream().map(m -> new Pair<>(m.getName(), new Coordinate(m.latitude, m.longitude))).collect(Collectors.toList()));
                }
            }
        }
        locationScene.start();
        arFragment.dispatchLocationCount(Math.min(locationCount, DISTANCE_GROUP_SIZE), locationCount);
        arFragment.dispatchReady(true);
        hasFinishedLoading = true;
    }

    public void showNextPrevMarkers(boolean next) {
        if (locationScene != null) {
            int currentDistanceGroup = locationScene.getCurrentDistanceGroup();
            int nextDistanceGroup = next ?
                    currentDistanceGroup == locationScene.mLocationMarkers.size() / DISTANCE_GROUP_SIZE ?
                            locationScene.mLocationMarkers.size() / DISTANCE_GROUP_SIZE : currentDistanceGroup + 1
                    : currentDistanceGroup == 0 ?
                    0 : currentDistanceGroup - 1;
            if (currentDistanceGroup != nextDistanceGroup) {
                int startIndex = nextDistanceGroup * DISTANCE_GROUP_SIZE;
                LocationMarker minMarker = locationScene.mLocationMarkers.get(Math.min(Math.max(startIndex - 1, 0), locationScene.mLocationMarkers.size() - 1));
                LocationMarker maxMarker = locationScene.mLocationMarkers.get(Math.min(startIndex + DISTANCE_GROUP_SIZE - 1, locationScene.mLocationMarkers.size() - 1));
                Location deviceLocation = sensors.getDeviceLocation();
                Coordinate observer = new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude());
                arFragment.dispatchVisibleMarkers(
                        (int) Math.ceil(LocationUtils.distance(observer.getLat(), minMarker.latitude, observer.getLon(), minMarker.longitude, 0, 0)),
                        (int) Math.ceil(LocationUtils.distance(observer.getLat(), maxMarker.latitude, observer.getLon(), maxMarker.longitude, 0, 0)),
                        nextDistanceGroup == 0,
                        nextDistanceGroup == locationScene.mLocationMarkers.size() / DISTANCE_GROUP_SIZE);
                arFragment.dispatchLocationCount(Math.min(locationScene.mLocationMarkers.size() - startIndex, DISTANCE_GROUP_SIZE), locationScene.mLocationMarkers.size());

                if(showPlacesOnMap) {
                    if(locationScene.mLocationMarkers.isEmpty()) {
                        arFragment.dispatchMapLocations(new ArrayList<>());
                    } else {
                        arFragment.dispatchMapLocations(locationScene.mLocationMarkers
                                .subList(startIndex, Math.min(startIndex + DISTANCE_GROUP_SIZE, locationScene.mLocationMarkers.size()))
                                .stream().map(m -> new Pair<>(m.getName(), new Coordinate(m.latitude, m.longitude))).collect(Collectors.toList()));
                    }
                }
                locationScene.resetDistanceLimit();
                locationScene.setCurrentDistanceGroup(nextDistanceGroup);
                locationScene.setIteration(0);
                locationScene.refreshAnchors();
            }
        }
    }

    public void refreshAR() {
        if (locationScene != null) {
            locationScene.refreshAnchors();
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private LocationElevationNode getLocationMarkerNode(ViewRenderable renderable, Element location, int elevation, Coordinate coord, int index) {
        LocationElevationNode base = new LocationElevationNode(elevation, index);
        base.setRenderable(renderable);
        // Add marker touch listeners here
        View eView = renderable.getView();
        if (location != null) {
            eView.setOnTouchListener((v, event) -> {
                if (sensors.isNetworkActive()) {
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
                    arFragment.dispatchLocation(location, elevation,
                            markerDistance >= 1000 ?
                                    String.format("%.3f", ((float) markerDistance / (float) 1000)) + "KM" : markerDistance + "m");
                    return true;
                }
                return false;
            });
        }

        return base;
    }

    private void dispatchLoadingProgress(String message) {
        if (arFragment != null) {
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
        if (arFragment != null) {
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
