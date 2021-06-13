package com.geoscene.ar.modules;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.util.Log;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.geoscene.ar.ARFragment;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class ARViewManager extends ViewGroupManager<FrameLayout> {

    public static final String REACT_TAG = "ARFragment";
    private final ReactApplicationContext reactContext;
    private ARFragment arFragment;

    public final int COMMAND_CREATE = 1;
    public final int COMMAND_CLOSE = 2;
    public final int COMMAND_REFRESH = 3;
    public final int COMMAND_SHOW_MARKERS = 4;

    public ARViewManager(ReactApplicationContext reactContext) {
        super();
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_TAG;
    }

    @SuppressLint("InflateParams")
    @NonNull
    @Override
    protected FrameLayout createViewInstance(@NonNull ThemedReactContext reactContext) {
        FrameLayout layout = new FrameLayout(reactContext);
        layout.setBackgroundColor(Color.BLACK);
        return layout;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "CREATE", COMMAND_CREATE,
                "CLOSE", COMMAND_CLOSE,
                "REFRESH", COMMAND_REFRESH,
                "SHOW_MARKERS", COMMAND_SHOW_MARKERS
        );
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_CREATE:
                createARFragment(root, args.getInt(0), args.getBoolean(1), args.getInt(2), args.getMap(3), args.getBoolean(4), args.getBoolean(5), args.getBoolean(6), args.getBoolean(7));
                break;
            case COMMAND_CLOSE:
                closeARFragment(root);
                break;
            case COMMAND_REFRESH:
                refreshARFragment(root);
                break;
            case COMMAND_SHOW_MARKERS:
                showNextPrevMarkers(root, args.getBoolean(0));
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void showNextPrevMarkers(FrameLayout root, boolean next) {
        if(arFragment != null) {
            arFragment.showNextPrevMarkers(next);
        }
    }

    private void refreshARFragment(FrameLayout root) {
        if(arFragment != null) {
            arFragment.refreshAR();
        }
    }

    private void closeARFragment(FrameLayout root) {
        if(arFragment != null) {
            Log.d("AR_CLOSE", "close");
            arFragment.close();
            ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager().beginTransaction().remove(arFragment).commit();
            arFragment = null;
        }
    }

    private void createARFragment(FrameLayout parentLayout, int reactNativeARViewId, boolean determineViewshed, int visibleRadiusKM, ReadableMap placeTypes, boolean showPlacesApp, boolean showLocationCenter, boolean markersRefresh, boolean realisticMarkers) {
        Map<String, HashSet<String>> placesTypes = parsePlaceTypes(placeTypes);
        arFragment = new ARFragment(reactContext, determineViewshed, visibleRadiusKM, placesTypes, showPlacesApp, showLocationCenter, markersRefresh, realisticMarkers);

        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager()
                .beginTransaction()
                .replace(reactNativeARViewId, arFragment, String.valueOf(reactNativeARViewId))
                .commit();
        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager().executePendingTransactions();
    }

    private Map<String, HashSet<String>> parsePlaceTypes(ReadableMap placeTypes) {
        Map<String, HashSet<String>> placeMap = new HashMap<>();
        ReadableMapKeySetIterator keysIter = placeTypes.keySetIterator();
        while(keysIter.hasNextKey()) {
            HashSet<String> activePlaces = new HashSet<>();
            String key = keysIter.nextKey();
            ReadableMap innerPlaces = placeTypes.getMap(key);
            ReadableMapKeySetIterator innerKeyIterator = innerPlaces.keySetIterator();
            while(innerKeyIterator.hasNextKey()) {
                String innerKey = innerKeyIterator.nextKey();
                if(innerPlaces.getMap(innerKey).getBoolean("on")) {
                    activePlaces.add(innerKey);
                }
            }
            placeMap.put(key, activePlaces);
        }
        return placeMap;
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        return super.getExportedCustomBubblingEventTypeConstants();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, Object> map = MapBuilder.of();
        map.put("locationMarkerTouch",
                MapBuilder.of("registrationName", "onLocationMarkerTouch"));
        map.put( "ready",
                MapBuilder.of("registrationName", "onReady"));
        map.put("loadingProgress",
                MapBuilder.of("registrationName", "onLoadingProgress"));
        map.put("cacheUse",
                MapBuilder.of("registrationName", "onUseCache"));
        map.put("localUse",
                MapBuilder.of("registrationName", "onLocalUse"));
        map.put("count",
                MapBuilder.of("registrationName", "onLocationCount"));
        map.put("elevation",
                MapBuilder.of("registrationName", "onUserElevation"));
        map.put("visible",
                MapBuilder.of("registrationName", "onChangedVisible"));
        return map;
    }
}
