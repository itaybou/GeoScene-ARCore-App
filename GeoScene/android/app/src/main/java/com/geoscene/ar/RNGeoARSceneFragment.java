package com.geoscene.ar;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.fragment.app.Fragment;

import com.geoscene.DemoUtils;
import com.geoscene.R;
import com.geoscene.permissions.ARLocationPermissionHelper;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.Session;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableException;
import com.google.ar.sceneform.ArSceneView;

public class RNGeoARSceneFragment extends Fragment {
    private boolean installRequested;

    private ArSceneView arSceneView;
    private DeviceSensors sensors;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.ar_scene_layout, container, false);
        arSceneView = view.findViewById(R.id.ar_scene_view);

        Context context = getContext();
        Log.d("FRAGMENT", context.getPackageName());

        sensors = DeviceSensorsManager.initialize(context);

        new AsyncARLocationsInitializer(context, sensors, arSceneView).initializeLocationMarkers(getActivity());
        // Lastly request CAMERA & fine location permission which is required by ARCore-Location.
        ARLocationPermissionHelper.requestPermission(getActivity());
        return view;
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
}
