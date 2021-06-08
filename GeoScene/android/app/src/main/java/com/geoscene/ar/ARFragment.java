package com.geoscene.ar;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.ErrorHandling;
import com.geoscene.R;
import com.geoscene.permissions.ARLocationPermissionHelper;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.ArCoreApk;
import com.google.ar.core.Config;
import com.google.ar.core.Session;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableException;
import com.google.ar.sceneform.ArSceneView;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ARFragment extends Fragment {
    private boolean installRequested;

    private ArSceneView arSceneView;
    private ARNodesInitializer initializer;
    private DeviceSensors sensors;
    private Map<String, HashSet<String>> placesTypes;

    private ReactContext reactContext;
    private boolean determineViewshed;
    private int visibleRadiusKM;


    public ARFragment(ReactContext reactContext, boolean determineViewshed, int visibleRadiusKM, Map<String, HashSet<String>> placesTypes) {
        super();
        this.reactContext = reactContext;
        this.determineViewshed = determineViewshed;
        this.visibleRadiusKM = visibleRadiusKM;
        this.placesTypes = placesTypes;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View view = inflater.inflate(R.layout.ar_scene_layout, container, false);
        arSceneView = view.findViewById(R.id.ar_scene_view);

        Context context = getContext();
        sensors = DeviceSensorsManager.getSensors(context);

        // Request CAMERA & fine location permission which is required by ARCore-Location.
        ARLocationPermissionHelper.requestPermission(getActivity());

        dispatchLoadingProgress("Starting AR");
        initializer = new ARNodesInitializer(reactContext, sensors, arSceneView, determineViewshed, visibleRadiusKM, placesTypes, this);

        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        startArSession();
    }

    public void startArSession() {
        if (arSceneView.getSession() == null) {
            // If the session wasn't created yet, don't resume rendering.
            // This can happen if ARCore needs to be updated or permissions are not granted yet.
            try {
                Session session = createArSession(getActivity(), installRequested);
                if (session == null) {
                    installRequested = ARLocationPermissionHelper.hasPermission(getActivity());
                    return;
                } else {
                    arSceneView.setupSession(session);
                }
            } catch (UnavailableException e) {
                ErrorHandling.handleSessionException(getActivity(), e);
            }
        }
    }

    public static Session createArSession(Activity activity, boolean installRequested)
            throws UnavailableException {
        Session session = null;
        // if we have the camera permission, create the session
        if (ARLocationPermissionHelper.hasPermission(activity)) {
            switch (ArCoreApk.getInstance().requestInstall(activity, !installRequested)) {
                case INSTALL_REQUESTED:
                    return null;
                case INSTALLED:
                    break;
            }
            session = new Session(activity);
            // IMPORTANT!!!  ArSceneView needs to use the non-blocking update mode.
            Config config = new Config(session);
            config.setUpdateMode(Config.UpdateMode.LATEST_CAMERA_IMAGE);
//            config.setPlaneFindingMode(Config.PlaneFindingMode.DISABLED);
            config.setLightEstimationMode(Config.LightEstimationMode.AMBIENT_INTENSITY);
            config.setPlaneFindingMode(Config.PlaneFindingMode.VERTICAL);
            config.setCloudAnchorMode(Config.CloudAnchorMode.DISABLED);
            config.setFocusMode(Config.FocusMode.AUTO);
            session.configure(config);
//            session.setDisplayGeometry(activity.);
        }
        return session;
    }

    static String getNodeTypeString(Element nodeDetails) {
        String type = nodeDetails.tags.historic != null ? nodeDetails.tags.historic : nodeDetails.tags.natural != null? nodeDetails.tags.natural : nodeDetails.tags.place;
        type = type.replace("_", " ");
        return type.substring(0, 1).toUpperCase() + type.substring(1);
    }

    public void dispatchLocation(Element location, int elevation, String distance) {
        WritableMap event = Arguments.createMap();
        event.putString("en_name", location.tags.nameEng);
        event.putString("heb_name", location.tags.name.matches(".*[א-ת].*") ? location.tags.name : location.tags.nameHeb);
        event.putString("main_name", location.tags.name);
        event.putString("type", getNodeTypeString(location));
        event.putString("distance", distance);
        event.putInt("mElevation", elevation);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "locationMarkerTouch",
                event);
    }

    public void dispatchLoadingProgress(String message) {
        WritableMap event = Arguments.createMap();
        event.putString("message", message);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "loadingProgress",
                event);
    }

    public void dispatchReady() {
        WritableMap event = Arguments.createMap();
        event.putBoolean("ready", true);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "ready",
                event);
    }

    public void dispatchUseCache() {
        WritableMap event = Arguments.createMap();
        event.putBoolean("message", true);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "cacheUse",
                event);
    }

    public void dispatchObserverElevation(int elevation) {
        WritableMap event = Arguments.createMap();
        event.putInt("elevation", elevation);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "elevation",
                event);
    }


    @Override
    public void onResume() {
        super.onResume();
        sensors.resume();
        startArSession();
        try {
            arSceneView.resume();
            initializer.initializeLocationMarkers(getActivity());
        } catch (CameraNotAvailableException ex) {
            ErrorHandling.displayError(getActivity(), "Unable to get camera", ex);
        }
    }

    /**
     * Make sure we call locationScene.pause();
     */
    @Override
    public void onPause() {
        super.onPause();
        arSceneView.pause();
        Log.d("ARview", "paused");
        sensors.pause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        close();
        arSceneView.destroy();
    }

    public void close() {
        if(arSceneView.getSession() != null) {
            arSceneView.getSession().close();
        }
    }
}