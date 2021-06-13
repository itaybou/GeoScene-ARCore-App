package com.geoscene.ar;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
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
import com.google.ar.core.CameraConfig;
import com.google.ar.core.Config;
import com.google.ar.core.Session;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableException;
import com.google.ar.sceneform.ArSceneView;

import java.util.HashSet;
import java.util.Map;

public class ARFragment extends Fragment {
    private final static String TAG = "ARFragment";
    private boolean installRequested;

    private ArSceneView arSceneView;
    private ARNodesInitializer initializer;
    private DeviceSensors sensors;
    private Map<String, HashSet<String>> placesTypes;

    private ReactContext reactContext;
    private boolean determineViewshed;
    private int visibleRadiusKM;
    private boolean showPlacesApp;
    private boolean showLocationCenter;
    private boolean markersRefresh;
    private boolean realisticMarkers;

    private boolean closed;

    public ARFragment(ReactContext reactContext, boolean determineViewshed, int visibleRadiusKM, Map<String, HashSet<String>> placesTypes, boolean showPlacesApp, boolean showLocationCenter, boolean markersRefresh, boolean realisticMarkers) {
        super();
        this.reactContext = reactContext;
        this.determineViewshed = determineViewshed;
        this.visibleRadiusKM = visibleRadiusKM;
        this.placesTypes = placesTypes;
        this.showPlacesApp = showPlacesApp;
        this.showLocationCenter = showLocationCenter;
        this.markersRefresh = markersRefresh;
        this.realisticMarkers = realisticMarkers;
        closed = false;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View view = inflater.inflate(R.layout.ar_scene_layout, container, false);
        arSceneView = view.findViewById(R.id.ar_scene_view);

        dispatchLoadingProgress("Starting AR");

        sensors = DeviceSensorsManager.getSensors(getContext());
        // Request CAMERA & fine location permission which is required by ARCore-Location.
        ARLocationPermissionHelper.requestPermission(getActivity());
        initializer = new ARNodesInitializer(reactContext, sensors, arSceneView, determineViewshed, visibleRadiusKM, placesTypes, showPlacesApp, showLocationCenter, markersRefresh, realisticMarkers, this);
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        new Handler().post(() -> {
            startArSession();
            initializer.initializeLocationMarkers(getActivity());
        });

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
                    arSceneView.getPlaneRenderer().setVisible(false);
                    arSceneView.getPlaneRenderer().setEnabled(false);
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
            config.setLightEstimationMode(Config.LightEstimationMode.DISABLED);
            config.setPlaneFindingMode(Config.PlaneFindingMode.DISABLED);
            config.setCloudAnchorMode(Config.CloudAnchorMode.DISABLED);
            config.setFocusMode(Config.FocusMode.FIXED);
            config.setDepthMode(Config.DepthMode.DISABLED);
            config.setInstantPlacementMode(Config.InstantPlacementMode.DISABLED);
            config.setAugmentedFaceMode(Config.AugmentedFaceMode.DISABLED);
            session.configure(config);
        }
        return session;
    }

    public void refreshAR() {
        if(initializer != null) {
            initializer.refreshAR();
        }
    }

    public void showNextPrevMarkers(boolean next) {
        initializer.showNextPrevMarkers(next);
    }

    static String getNodeTypeString(Element nodeDetails) {
        String type = nodeDetails.tags.historic != null ? nodeDetails.tags.historic : nodeDetails.tags.natural != null?
                nodeDetails.tags.natural : nodeDetails.tags.place != null ?
                nodeDetails.tags.place : nodeDetails.tags.createdBy;
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

    public void dispatchReady(boolean value) {
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

    public void dispatchUseLocal(String name) {
        WritableMap event = Arguments.createMap();
        event.putString("name", name);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "localUse",
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

    public void dispatchLocationCount(int current, int size) {
        WritableMap event = Arguments.createMap();
        event.putInt("count", size);
        event.putInt("current", current);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "count",
                event);
    }

    public void dispatchVisibleMarkers(int minDistance, int maxDistance, boolean first, boolean last) {
        WritableMap event = Arguments.createMap();
        event.putInt("max_distance", maxDistance);
        event.putInt("min_distance", minDistance);
        event.putBoolean("first", first);
        event.putBoolean("last", last);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "visible",
                event);
    }


    @Override
    public void onResume() {
        if(!closed) {
            sensors.resume();
            startArSession();
            try {
                arSceneView.resume();
            } catch (CameraNotAvailableException ex) {
                ErrorHandling.displayError(getActivity(), "Unable to get camera", ex);
            }
            super.onResume();
        }
    }

    /**
     * Make sure we call arSceneView.pause();
     */
    @Override
    public void onPause() {
        arSceneView.pause();
        sensors.pause();
        super.onPause();
    }

    @Override
    public void onDestroy() {
        arSceneView.destroy();
        super.onDestroy();
    }

    public void close() {
        Log.d(TAG, "Close AR Session.");
        closed = true;
        initializer.disposeRequests();
        initializer.stopUpdateListener();
    }

}
