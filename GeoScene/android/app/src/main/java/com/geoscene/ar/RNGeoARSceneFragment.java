package com.geoscene.ar;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.geoscene.DemoUtils;
import com.geoscene.R;
import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.permissions.ARLocationPermissionHelper;
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
import java.util.zip.Inflater;

public class RNGeoARSceneFragment extends Fragment {

    private boolean hasFinishedLoading = false;
    private boolean installRequested;

    private ArSceneView arSceneView;
    private ViewRenderable exampleLayoutRenderable;
    private DeviceSensors sensors;

    private LocationScene locationScene;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.ar_scene_layout, container, false);
        arSceneView = v.findViewById(R.id.ar_scene_view);

        Context context = getContext();
        Log.d("FRAGMENT", context.getPackageName());

        sensors = DeviceSensorsManager.initialize(context);
        CompletableFuture<ViewRenderable> example2D =
                ViewRenderable.builder()
                        .setView(context, R.layout.location_marker_card)
                        .build();

        CompletableFuture.allOf(
                example2D)
                .handle(
                        (notUsed, throwable) -> {
                            // When you build a Renderable, Sceneform loads its resources in the background while
                            // returning a CompletableFuture. Call handle(), thenAccept(), or check isDone()
                            // before calling get().

                            if (throwable != null) {
                                DemoUtils.displayError(context, "Unable to load renderables", throwable);
                                return null;
                            }

                            try {
                                exampleLayoutRenderable = example2D.get();
                                hasFinishedLoading = true;

                            } catch (InterruptedException | ExecutionException ex) {
                                DemoUtils.displayError(context, "Unable to load renderables", ex);
                            }

                            return null;
                        });
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
                                locationScene = new LocationScene(getActivity(), arSceneView, sensors);
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
        ARLocationPermissionHelper.requestPermission(getActivity());
        return v;
    }

    @Override
    public void onResume() {
        super.onResume();
        sensors.resume();

        if (arSceneView.getSession() == null) {
            // If the session wasn't created yet, don't resume rendering.
            // This can happen if ARCore needs to be updated or permissions are not granted yet.
            try {
                Session session = DemoUtils.createArSession(getActivity(), installRequested);
                if (session == null) {
                    installRequested = ARLocationPermissionHelper.hasPermission(getActivity());
                    return;
                } else {
                    arSceneView.setupSession(session);
                }
            } catch (UnavailableException e) {
                DemoUtils.handleSessionException(getActivity(), e);
            }
        }

        try {
            arSceneView.resume();
        } catch (CameraNotAvailableException ex) {
            DemoUtils.displayError(getActivity(), "Unable to get camera", ex);
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


    private Node getExampleView() {
        Node base = new Node();
        base.setRenderable(exampleLayoutRenderable);
        Context c = getContext();
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
