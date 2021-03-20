package com.geoscene.ar;

import android.content.Context;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.DemoUtils;
import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
import com.geoscene.permissions.ARLocationPermissionHelper;
import com.geoscene.places.PointsOfInterest;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.mercator.BoundingBoxCenter;
import com.google.ar.core.Session;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableException;
import com.google.ar.sceneform.ArSceneView;

import org.osmdroid.api.IMapController;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.BoundingBox;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.compass.CompassOverlay;
import org.osmdroid.views.overlay.compass.IOrientationConsumer;
import org.osmdroid.views.overlay.compass.IOrientationProvider;
import org.osmdroid.views.overlay.compass.InternalCompassOrientationProvider;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;

public class GeoARSceneFragment extends Fragment {
    private boolean installRequested;

    private ArSceneView arSceneView;
    private DeviceSensors sensors;

    private ReactContext reactContext;


    public GeoARSceneFragment(ReactContext reactContext) {
        this.reactContext = reactContext;
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.ar_scene_layout, container, false);
        arSceneView = view.findViewById(R.id.ar_scene_view);

        Context context = getContext();
        Log.d("FRAGMENT", context.getPackageName());

        sensors = DeviceSensorsManager.initialize(context);

        dispatchLoadingProgress("Starting AR");
        new AsyncARLocationsInitializer(context, sensors, arSceneView, this).initializeLocationMarkers(getActivity());

//        map = (MapView) view.findViewById(R.id.map);
//        //map.setTileSource(TileSourceFactory.WIKIMEDIA);
//        map.setTileSource(TileSourceFactory.MAPNIK);
//
//        sensors = DeviceSensorsManager.initialize(context);
//        map.setMultiTouchControls(true);
//        mapController = map.getController();
//        observer = new GeoPoint(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//        mapController.setCenter(observer);
//
//
//
//
//        Log.d("TEST", String.valueOf(sensors.getGeomagneticField()));
//
//        MyLocationNewOverlay mLocationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(context), map);
//        mLocationOverlay.setEnableAutoStop(false);
//        mLocationOverlay.enableMyLocation();
//        mLocationOverlay.enableFollowLocation();
//        map.getOverlays().add(mLocationOverlay);
//
//        compass = new InternalCompassOrientationProvider(context);
//        CompassOverlay compassOverlay = new CompassOverlay(context, compass, map);
//        compassOverlay.enableCompass();
//        map.getOverlays().add(compassOverlay);
//
//        map.addOnFirstLayoutListener((v, left, top, right, bottom) -> {
//            Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//            BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
//            Log.d("BBOX", bbox.toString());
//            map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
//            map.invalidate();
//        });


        // Lastly request CAMERA & fine location permission which is required by ARCore-Location.
        ARLocationPermissionHelper.requestPermission(getActivity());
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
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
//                    session.setDisplayGeometry(, , );
                }
            } catch (UnavailableException e) {
                DemoUtils.handleSessionException(getActivity(), e);
            }
        }
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
//                    session.setDisplayGeometry(, , );
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
        getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    }

    public void dispatchLocation(PointsOfInterest.Element location) {
        WritableMap event = Arguments.createMap();
        event.putString("en_name", location.tags.nameEng);
        event.putString("heb_name", location.tags.nameHeb);
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


    /**
     * Make sure we call locationScene.pause();
     */
    @Override
    public void onPause() {
        super.onPause();
        arSceneView.pause();
        sensors.pause();
        getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        arSceneView.destroy();
    }
}
