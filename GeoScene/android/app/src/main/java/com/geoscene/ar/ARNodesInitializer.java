package com.geoscene.ar;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.location.Location;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
import com.geoscene.data_access.CacheManager;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.elevation.Elevation;
import com.geoscene.elevation.Raster;
import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.places.Places;
import com.geoscene.places.fov_analyzer.FOVAnalyzer;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.triangulation.TriangulationIntersection;
import com.geoscene.viewshed.ViewShed;
import com.google.ar.core.Frame;
import com.google.ar.core.TrackingState;
import com.google.ar.sceneform.ArSceneView;
import com.google.ar.sceneform.Node;
import com.google.ar.sceneform.rendering.ViewRenderable;

import org.javatuples.Pair;

import java.util.List;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.observers.DisposableSingleObserver;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class ARNodesInitializer {

    public static boolean hasFinishedLoading = false;
    private static ViewRenderable locationMarkerRenderable;

    private static ArSceneView arSceneView;
    private static LocationScene locationScene;
    private static DeviceSensors sensors;
    private static Context context;

    private static ARFragment ARFragment;
    private static boolean determineViewshed;
    private static int radiusKM;

    public ARNodesInitializer(Context context, DeviceSensors sensors, ArSceneView arSceneView, boolean determineViewshed, int radiusKM, ARFragment ARFragment) {
        this.arSceneView = arSceneView;
        this.sensors = sensors;
        this.context = context;
        this.ARFragment = ARFragment;
        hasFinishedLoading = true;
        ARNodesInitializer.determineViewshed = determineViewshed;
        ARNodesInitializer.radiusKM = radiusKM;
//        CompletableFuture<ViewRenderable> locationMarkerCard =
//                ViewRenderable.builder()
//                        .setView(context, R.layout.location_marker_card)
//                        .build();
//
//        CompletableFuture.allOf(locationMarkerCard)
//                .handle((notUsed, throwable) -> {
//                    // When you build a Renderable, Sceneform loads its resources in the background while
//                    // returning a CompletableFuture. Call handle(), thenAccept(), or check isDone()
//                    // before calling get().
//                    if (throwable != null) {
//                        DemoUtils.displayError(context, "Unable to load renderables", throwable);
//                        return null;
//                    }
//                    try {
//                        locationMarkerRenderable = locationMarkerCard.get();
//                        hasFinishedLoading = true;
//
//                    } catch (InterruptedException | ExecutionException ex) {
//                        DemoUtils.displayError(context, "Unable to load renderables", ex);
//                    }
//                    return null;
//                });
    }

    private void getAndRenderMarkerInformation() {
        Location deviceLocation = sensors.getDeviceLocation();
        BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()), LocationConstants.OBSERVER_BBOX); //PADDING_KM);
        PersistLocationObject cachedLocationInfo = CacheManager.fetchFromCache(bbox);
        Log.d("CACHED_LOCATION", String.valueOf(cachedLocationInfo));
        Log.d("determineViewshed", String.valueOf(determineViewshed));
        if(cachedLocationInfo != null) {
            ARFragment.dispatchUseCache();
            Raster raster = cachedLocationInfo.getRaster(context);
            raster.setViewshed(determineViewshed? ViewShed.calculateViewshed(raster, deviceLocation.getLatitude(), deviceLocation.getLongitude(), deviceLocation.getAltitude()) : null);
            raster.setBoundingBox(bbox);
            PointsOfInterest pois = cachedLocationInfo.getPois();
            renderFOVMarkers(raster, pois);
        } else requestLocationInformation(radiusKM);
    }

    private void requestLocationInformation(int radiusKM) {
        Elevation elevation = new Elevation();
        Places places = new Places();

        Log.d("START", "started");
        final CompositeDisposable disposable = new CompositeDisposable();
        ARFragment.dispatchLoadingProgress("Retrieving places and elevation data around you.");
        Single<Raster> elevationData = elevation.fetchElevationRaster(sensors, determineViewshed, radiusKM)
                .doOnSuccess(s -> ARFragment.dispatchLoadingProgress("Elevation data retrieved and analyzed"))
                .subscribeOn(Schedulers.computation()); // computation
        Single<PointsOfInterest> placesData = places.searchPlaces(sensors, radiusKM)
                .doOnSuccess(s -> ARFragment.dispatchLoadingProgress("Places around you retrieved."))
                .subscribeOn(Schedulers.io());
        Single<ElevationLocationData> chainedAPICall = elevationData.zipWith(placesData, ElevationLocationData::new)
                .subscribeOn(Schedulers.io());

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
                    locationScene.setOffsetOverlapping(false);
                    locationScene.setMinimalRefreshing(false);
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
        ARFragment.dispatchLoadingProgress("Determining your field of view.");
        List<Pair<Element, Coordinate>> visibleLocations = FOVAnalyzer.intersectVisiblePlaces(raster, pois);

        Log.d("LOCATIONS", visibleLocations.toString());
        ARFragment.dispatchLoadingProgress("Field of view determined successfully.");
        for (Pair<Element, Coordinate> visibleLocation : visibleLocations) {
            ViewRenderable.builder()
                .setView(context, R.layout.location_marker_card)
                .build()
                .thenAccept(renderable -> {
                    double locationLat = visibleLocation.getValue1().getLat();
                    double locationLon = visibleLocation.getValue1().getLon();
                    LocationMarker layoutLocationMarker = new LocationMarker(locationLon, locationLat, getLocationMarkerNode(renderable, visibleLocation.getValue0()));
//                                                layoutLocationMarker.setHeight(2);
//                                                layoutLocationMarker.setScaleModifier(0.2f);
                    layoutLocationMarker.setScalingMode(LocationMarker.ScalingMode.GRADUAL_TO_MAX_RENDER_DISTANCE);

                    // An example "onRender" event, called every frame
                    // Updates the layout with the markers distance
                    layoutLocationMarker.setRenderEvent(node -> {
                        View eView = renderable.getView();
                        TextView nameTextView = eView.findViewById(R.id.name);
                        TextView distanceTextView = eView.findViewById(R.id.distance);
                        distanceTextView.setText(node.getDistance() + "M");
                        nameTextView.setText(visibleLocation.getValue0().tags.name);
                    });
                    // Adding the marker
                    locationScene.mLocationMarkers.add(layoutLocationMarker);
                });
        }
        ARFragment.dispatchLoadingProgress("Starting Augmented reality scene.");
        ARFragment.dispatchReady();
        hasFinishedLoading = true;
    }

    @SuppressLint("ClickableViewAccessibility")
    private Node getLocationMarkerNode(ViewRenderable renderable, Element location) {
        Node base = new Node();
        base.setRenderable(renderable);
        // Add  listeners etc here
        View eView = renderable.getView();
        if(location != null) {
            eView.setOnTouchListener((v, event) -> {
                ARFragment.dispatchLocation(location);
                return false;
//            Toast.makeText(context, "Location marker touched.", Toast.LENGTH_LONG)
//                    .show();
//            return false;
            });
        }

        return base;
    }

    public void displayTriangulationNodes(Activity activity) {
        arSceneView.getScene().addOnUpdateListener(
                frameTime -> {
                    if (!hasFinishedLoading) {
                        return;
                    }
                    if (locationScene == null) {
                        // If our locationScene object hasn't been setup yet, this is a good time to do it
                        // We know that here, the AR components have been initiated.
                        locationScene = new LocationScene(activity, arSceneView, sensors, true);
                        locationScene.setOffsetOverlapping(false);
                        locationScene.setMinimalRefreshing(false);
                    }

                    handleARFrame();
                });

        ARFragment.dispatchReady();
    }

    public void addTriangulationIntersectionNodes(List<TriangulationIntersection> triangulationIntersections) {
        if(locationScene != null && locationScene.mLocationMarkers.isEmpty()) {
            for(TriangulationIntersection intersection : triangulationIntersections) {
                ViewRenderable.builder()
                        .setView(context, R.layout.location_marker_card)
                        .build()
                        .thenAccept(renderable -> {
                            double locationLat = intersection.intersection.getLat();
                            double locationLon = intersection.intersection.getLon();
                            LocationMarker layoutLocationMarker = new LocationMarker(locationLon, locationLat, getLocationMarkerNode(renderable, null));
//                                                layoutLocationMarker.setHeight(2);
//                                                layoutLocationMarker.setScaleModifier(0.2f);
                            layoutLocationMarker.setScalingMode(LocationMarker.ScalingMode.GRADUAL_TO_MAX_RENDER_DISTANCE);

                            // An example "onRender" event, called every frame
                            // Updates the layout with the markers distance
                            layoutLocationMarker.setRenderEvent(node -> {
                                View eView = renderable.getView();
                                TextView nameTextView = eView.findViewById(R.id.name);
                                TextView distanceTextView = eView.findViewById(R.id.distance);
                                distanceTextView.setText(intersection.distance + "M");
                                nameTextView.setText(intersection.name);
                            });
                            Log.d("INTERSECTION", intersection.name);
                            // Adding the marker
                            locationScene.mLocationMarkers.add(layoutLocationMarker);
                        });
            }
            hasFinishedLoading = true;
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
