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
                "CLOSE", COMMAND_CLOSE
        );
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_CREATE:
                createARFragment(root, args.getInt(0), args.getBoolean(1), args.getInt(2), args.getMap(3));
                break;
            case COMMAND_CLOSE:
                closeARFragment(root);
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void closeARFragment(FrameLayout root) {
        if(arFragment != null) {
            Log.d("AR", "close");
            arFragment.close();
        }
    }

    private void createARFragment(FrameLayout parentLayout, int reactNativeARViewId, boolean determineViewshed, int visibleRadiusKM, ReadableMap placeTypes) {
        Map<String, HashSet<String>> placesTypes = parsePlaceTypes(placeTypes);
        Log.d("PLACES", String.valueOf(placesTypes));
        arFragment = new ARFragment(reactContext, determineViewshed, visibleRadiusKM, placesTypes);

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
        return MapBuilder.of(
                "locationMarkerTouch",
                MapBuilder.of("registrationName", "onLocationMarkerTouch"),
                "ready",
                MapBuilder.of("registrationName", "onReady"),
                "loadingProgress",
                MapBuilder.of("registrationName", "onLoadingProgress"),
                "cacheUse",
                MapBuilder.of("registrationName", "onUseCache"),
                "elevation",
                MapBuilder.of("registrationName", "onUserElevation")
        );
    }
}
