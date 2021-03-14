package com.geoscene.ar;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.DemoUtils;
import com.geoscene.R;
import com.geoscene.elevation.Elevation;
import com.geoscene.elevation.Raster;
import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.places.Places;
import com.geoscene.places.fov_analyzer.FOVAnalyzer;
import com.geoscene.places.PointsOfInterest;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.utils.Coordinate;
import com.google.ar.core.Frame;
import com.google.ar.core.TrackingState;
import com.google.ar.sceneform.ArSceneView;
import com.google.ar.sceneform.Node;
import com.google.ar.sceneform.rendering.ViewRenderable;

import org.javatuples.Pair;

import java.io.FileNotFoundException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.disposables.CompositeDisposable;
import io.reactivex.rxjava3.observers.DisposableSingleObserver;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class AsyncARLocationsInitializer {

    public static boolean hasFinishedLoading = false;
    private static ViewRenderable locationMarkerRenderable;

    private ArSceneView arSceneView;
    private LocationScene locationScene;
    private DeviceSensors sensors;
    private Context context;

    private GeoARSceneFragment ARFragment;

    public AsyncARLocationsInitializer(Context context, DeviceSensors sensors, ArSceneView arSceneView, GeoARSceneFragment ARFragment) {
        this.arSceneView = arSceneView;
        this.sensors = sensors;
        this.context = context;
        this.ARFragment = ARFragment;
        CompletableFuture<ViewRenderable> locationMarkerCard =
                ViewRenderable.builder()
                        .setView(context, R.layout.location_marker_card)
                        .build();

        CompletableFuture.allOf(locationMarkerCard)
                .handle((notUsed, throwable) -> {
                    // When you build a Renderable, Sceneform loads its resources in the background while
                    // returning a CompletableFuture. Call handle(), thenAccept(), or check isDone()
                    // before calling get().
                    if (throwable != null) {
                        DemoUtils.displayError(context, "Unable to load renderables", throwable);
                        return null;
                    }
                    try {
                        locationMarkerRenderable = locationMarkerCard.get();
                        hasFinishedLoading = true;

                    } catch (InterruptedException | ExecutionException ex) {
                        DemoUtils.displayError(context, "Unable to load renderables", ex);
                    }
                    return null;
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
                        locationScene = new LocationScene(activity, arSceneView, sensors);
                        locationScene.setOffsetOverlapping(false);
                        // Now lets create our location markers.
                        // First, a layout
                        Elevation elevation = new Elevation();
                        Places places = new Places();

//                                try {
//                                    elevation.fetchElevationRaster(sensors);
//                                } catch (InterruptedException e) {
//                                    e.printStackTrace();
//                                }
                        Log.d("START", "started");
                        final CompositeDisposable disposable = new CompositeDisposable();
                        ARFragment.dispatchLoadingProgress("Retrieving places and elevation data around you.");
                        Single<Raster> elevationData = elevation.fetchElevationRaster(sensors)
                                .doOnSuccess(s -> ARFragment.dispatchLoadingProgress("Elevation data retrieved and analyzed"))
                                .subscribeOn(Schedulers.computation()); // computation
                        Single<PointsOfInterest> placesData = places.searchPlaces(sensors)
                                .doOnSuccess(s -> ARFragment.dispatchLoadingProgress("Places around you retrieved."))
                                .subscribeOn(Schedulers.io());
                        Single<ElevationLocationData> chainedAPICall = elevationData.zipWith(placesData, ElevationLocationData::new)
                                .subscribeOn(Schedulers.io());

                        chainedAPICall
                                .observeOn(AndroidSchedulers.mainThread())
                                .subscribeWith(new DisposableSingleObserver<ElevationLocationData>() {
                                    @Override
                                    public void onSuccess(@NonNull ElevationLocationData data) {
                                        Log.d("SUCCESS", "just a message");
                                        ARFragment.dispatchLoadingProgress("Determining your field of view.");
                                        List<Pair<String, Coordinate>> visibleLocations = FOVAnalyzer.intersectVisiblePlaces(data.getRaster(), data.getRaster().getViewshed(), data.getPlaces());

                                        Log.d("LOCATIONS", visibleLocations.toString());
                                        ARFragment.dispatchLoadingProgress("Field of view determined successfully.");
                                        for (Pair<String, Coordinate> visibleLocation : visibleLocations) {
                                            ViewRenderable.builder()
                                                    .setView(context, R.layout.location_marker_card)
                                                    .build().thenAccept(renderable -> {
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
                                                    nameTextView.setText(visibleLocation.getValue0());

                                                });
                                                // Adding the marker
                                                locationScene.mLocationMarkers.add(layoutLocationMarker);
                                            });
                                        }
                                        ARFragment.dispatchLoadingProgress("Starting Augmented reality scene.");
                                        ARFragment.dispatchReady();
                                    }

                                    @Override
                                    public void onError(Throwable e) {
                                        Log.v("ERROR", e.getMessage());
                                    }
                                });
                    }

                    Frame frame = arSceneView.getArFrame();
                    if (frame == null) {
                        return;
                    }
                    if (frame.getCamera().getTrackingState() != TrackingState.TRACKING) {
                        return;
                    }

                    if (locationScene != null) {
                        locationScene.processFrame(frame);
                    }
                });
    }

    @SuppressLint("ClickableViewAccessibility")
    private Node getLocationMarkerNode(ViewRenderable renderable, String locationName) {
        Node base = new Node();
        base.setRenderable(renderable);
        // Add  listeners etc here
        View eView = renderable.getView();
        eView.setOnTouchListener((v, event) -> {
            ARFragment.dispatchName(locationName);
            return false;
//            Toast.makeText(context, "Location marker touched.", Toast.LENGTH_LONG)
//                    .show();
//            return false;
        });

        return base;
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
