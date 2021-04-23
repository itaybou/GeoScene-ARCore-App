package com.geoscene.maps.modules;

import android.graphics.Color;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.geoscene.maps.OSMMapView;

import java.util.Map;

public class RNMapsViewManager extends SimpleViewManager<OSMMapView> {

    public static final String REACT_TAG = "MapView";
    private OSMMapView mapView;

    public final int COMMAND_SET_BBOX = 1;

    public RNMapsViewManager(ReactApplicationContext reactContext) {
        super();
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_TAG;
    }

    @NonNull
    @Override
    protected OSMMapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        mapView = new OSMMapView(reactContext);
        mapView.setBackgroundColor(Color.BLACK);
        mapView.zoomToBoundingBox();
        return mapView;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "SET_BBOX", COMMAND_SET_BBOX
        );
    }

    @Override
    public void receiveCommand(@NonNull OSMMapView root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        Log.d("MAPS", String.valueOf(root.getId()));
        Log.d("MAPS", args.toString());
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_SET_BBOX:
                setMapBoundingBox(root, args.getDouble(0), args.getDouble(1), args.getInt(2), args.getBoolean(3));
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void setMapBoundingBox(OSMMapView root, double latitude, double longitude, int radius, boolean placeMarker) {
        mapView.zoomToBoundingBox(latitude, longitude, radius, placeMarker);
    }


    @ReactProp(name = "enableLocationTap", defaultBoolean = false)
    public void setEnableLocationMarkerTap(OSMMapView view, boolean enableLocationTap) {
        view.setEnableLocationMarkerTap(enableLocationTap);
    }

    @ReactProp(name = "enableZoom", defaultBoolean = false)
    public void setEnableZoom(OSMMapView view, boolean enableZoom) {
        view.setEnableZoom(enableZoom);
    }

    @ReactProp(name = "useObserverLocation",  defaultBoolean = false)
    public void setUseObserverLocation(OSMMapView view, boolean useObserverLocation) {
        view.setUseObserverLocation(useObserverLocation);
    }

    @ReactProp(name = "useCompassOrientation",  defaultBoolean = false)
    public void setUseCompassOrientation(OSMMapView view, boolean useCompassOrientation) {
        view.setUseCompassOrientation(useCompassOrientation);
    }




//    private void createMapsFragment(FrameLayout parentLayout, int reactNativeMapsViewId, boolean useCompassOrientation, boolean useObserverLocation, boolean enableZoom, boolean enableLocationMarkerTap) {
//
//        ViewGroup parentView = (ViewGroup) parentLayout.findViewById(reactNativeMapsViewId).getParent();
//        //organizeLayout(parentView);
//
////        final MapsFragment mapsFragment = new MapsFragment();
////        ((FragmentActivity) Objects.requireNonNull(this.reactContext.getCurrentActivity())).getSupportFragmentManager()
////                .beginTransaction()
////                .replace(reactNativeMapsViewId, mapsFragment, String.valueOf(reactNativeMapsViewId))
//////                .replace(reactNativeMapsViewId, mapsFragment, String.valueOf(reactNativeMapsViewId))
////                .commit();
//
//
//        //final MapsFragment mapsFragment = new MapsFragment();
//        mapsFragment = new MapsFragment(reactContext, useCompassOrientation, useObserverLocation, enableZoom, enableLocationMarkerTap);
//
//        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager()
//                .beginTransaction()
//                .replace(reactNativeMapsViewId, mapsFragment, String.valueOf(reactNativeMapsViewId))
////                .replace(reactNativeMapsViewId, mapsFragment, String.valueOf(reactNativeMapsViewId))
//                .commit();
//        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager().executePendingTransactions();
//
//
//        addView(parentLayout, mapsFragment.getView(), ViewGroup.LayoutParams.MATCH_PARENT);
//
//    }


//    @Nullable
//    @Override
//    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
//        return MapBuilder.of(
//                "touchLocationMarker",
//                MapBuilder.of("registrationName", "onLocationMarkerTouch")
//        );
//    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "mapSingleTap",
                MapBuilder.of("registrationName", "onMapSingleTap")
        );
    }
}
