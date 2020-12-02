package com.geoscene.ar;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import com.esri.arcgisruntime.mapping.ArcGISMap;
import com.esri.arcgisruntime.mapping.Basemap;
import com.esri.arcgisruntime.mapping.view.LocationDisplay;
import com.esri.arcgisruntime.mapping.view.MapView;
import com.facebook.react.ReactActivity;
import com.geoscene.DemoUtils;
import com.geoscene.R;
import com.geoscene.elevation.open_topo.OpenTopoService;
import com.geoscene.elevation.open_topo.OpenTopoClient;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.Frame;
import com.google.ar.core.Session;
import com.google.ar.core.TrackingState;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableException;
import com.google.ar.sceneform.ArSceneView;
import com.google.ar.sceneform.Node;
import com.google.ar.sceneform.rendering.ViewRenderable;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.permissions.ARLocationPermissionHelper;

@Deprecated
public class RNGeoARSceneActivity extends ReactActivity {
    private boolean installRequested;
    private boolean hasFinishedLoading = false;

    private ArSceneView arSceneView;
    private ViewRenderable exampleLayoutRenderable;
    private DeviceSensors sensors;

    private LocationScene locationScene;

    @Override
    @SuppressWarnings({"AndroidApiChecker", "FutureReturnValueIgnored"})
    // CompletableFuture requires api level 24
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.ar_scene_layout);
        arSceneView = findViewById(R.id.ar_scene_view);
        OpenTopoClient.getTopoData();
        sensors = DeviceSensorsManager.initialize(this);

//        ViewShed viewshed = new ViewShed(20, getApplicationContext(), this);
//        viewshed.calculateViewshed(34.666223f, 31.780799f);

        // Build a renderable from a 2D View.
        CompletableFuture<ViewRenderable> example2D =
                ViewRenderable.builder()
                        .setView(this, R.layout.location_marker_card)
                        .build();

        CompletableFuture.allOf(
                example2D)
                .handle(
                    (notUsed, throwable) -> {
                        // When you build a Renderable, Sceneform loads its resources in the background while
                        // returning a CompletableFuture. Call handle(), thenAccept(), or check isDone()
                        // before calling get().

                        if (throwable != null) {
                            DemoUtils.displayError(this, "Unable to load renderables", throwable);
                            return null;
                        }

                        try {
                            exampleLayoutRenderable = example2D.get();
                            hasFinishedLoading = true;

                        } catch (InterruptedException | ExecutionException ex) {
                            DemoUtils.displayError(this, "Unable to load renderables", ex);
                        }

                        return null;
                    });

        // Set an update listener on the Scene that will hide the loading message once a Plane is
        // detected.
        arSceneView
                .getScene()
                .addOnUpdateListener(
                    frameTime -> {
                        if (!hasFinishedLoading) {
                            return;
                        }

                        if (locationScene == null) {
                            // If our locationScene object hasn't been setup yet, this is a good time to do it
                            // We know that here, the AR components have been initiated.
                            locationScene = new LocationScene(this, arSceneView, sensors);

                            // Now lets create our location markers.
                            // First, a layout
                            LocationMarker layoutLocationMarker = new LocationMarker(
                                    34.666223,
                                    31.780799,
                                    getExampleView()
                            );
                            layoutLocationMarker.setHeight(2);
                            layoutLocationMarker.setScaleModifier(0.5f);
                            layoutLocationMarker.setScalingMode(LocationMarker.ScalingMode.GRADUAL_FIXED_SIZE);

                            // An example "onRender" event, called every frame
                            // Updates the layout with the markers distance
                            layoutLocationMarker.setRenderEvent(node -> {
                                View eView = exampleLayoutRenderable.getView();
                                TextView distanceTextView = eView.findViewById(R.id.distance);
                                distanceTextView.setText(node.getDistance() + "M");
                            });
                            // Adding the marker
                            locationScene.mLocationMarkers.add(layoutLocationMarker);
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


        // Lastly request CAMERA & fine location permission which is required by ARCore-Location.
        ARLocationPermissionHelper.requestPermission(this);
    }


    /**
     * Make sure we call locationScene.resume();
     */
    @Override
    protected void onResume() {
        super.onResume();
        sensors.resume();

        if (arSceneView.getSession() == null) {
            // If the session wasn't created yet, don't resume rendering.
            // This can happen if ARCore needs to be updated or permissions are not granted yet.
            try {
                Session session = DemoUtils.createArSession(this, installRequested);
                if (session == null) {
                    installRequested = ARLocationPermissionHelper.hasPermission(this);
                    return;
                } else {
                    arSceneView.setupSession(session);
                }
            } catch (UnavailableException e) {
                DemoUtils.handleSessionException(this, e);
            }
        }

        try {
            arSceneView.resume();
        } catch (CameraNotAvailableException ex) {
            DemoUtils.displayError(this, "Unable to get camera", ex);
            finish();
        }
    }

    /**
     * Make sure we call locationScene.pause();
     */
    @Override
    public void onPause() {
        super.onPause();
        arSceneView.pause();
        sensors.pause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        arSceneView.destroy();
    }

//    @Override
//    public void onRequestPermissionsResult(){
//            int requestCode, @NonNull String[] permissions, @NonNull int[] results) {
//        if (!ARLocationPermissionHelper.hasPermission(this)) {
//            if (!ARLocationPermissionHelper.shouldShowRequestPermissionRationale(this)) {
//                // Permission denied with checking "Do not ask again".
//                ARLocationPermissionHelper.launchPermissionSettings(this);
//            } else {
//                Toast.makeText(
//                        this, "Camera permission is needed to run this application", Toast.LENGTH_LONG)
//                        .show();
//            }
//            finish();
//        }
//    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Standard Android full-screen functionality.
            getWindow()
                    .getDecorView()
                    .setSystemUiVisibility(
                            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private Node getExampleView() {
        Node base = new Node();
        base.setRenderable(exampleLayoutRenderable);
        Context c = this;
        // Add  listeners etc here
        View eView = exampleLayoutRenderable.getView();
        eView.setOnTouchListener((v, event) -> {
            Toast.makeText(
                    c, "Location marker touched.", Toast.LENGTH_LONG)
                    .show();
            return false;
        });

        return base;
    }

}

