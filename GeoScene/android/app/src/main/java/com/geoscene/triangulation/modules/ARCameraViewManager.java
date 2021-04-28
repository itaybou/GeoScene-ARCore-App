package com.geoscene.triangulation.modules;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.util.Log;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.geoscene.react.ArrayUtil;
import com.geoscene.triangulation.TriangulationIntersection;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ARCameraViewManager extends ViewGroupManager<FrameLayout> {

    public static final String REACT_TAG = "ARCameraFragment";
    private final ReactApplicationContext reactContext;
    private ARActivity arFragment;

    public final int COMMAND_CREATE = 1;

    public ARCameraViewManager(ReactApplicationContext reactContext) {
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
                "CREATE", COMMAND_CREATE
        );
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_CREATE:
                createARFragment(root, args.getInt(0));
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void createARFragment(FrameLayout parentLayout, int reactNativeARViewId) {
        arFragment = new ARActivity(reactContext);

        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager()
                .beginTransaction()
                .replace(reactNativeARViewId, arFragment, String.valueOf(reactNativeARViewId))
                .commit();
        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager().executePendingTransactions();
    }

    @ReactProp(name = "triangulationIntersections")
    public void setTriangulationIntersections(FrameLayout view, ReadableArray triangulationIntersections) throws JSONException {
        if(arFragment != null && triangulationIntersections != null) {
            List<TriangulationIntersection> data = new ArrayList<>();
            JSONArray j = ArrayUtil.toJSONArray(triangulationIntersections);
            for (int i = 0; i < j.length(); i++) {
                JSONObject o = j.getJSONObject(i);
                data.add(new TriangulationIntersection(o.getString("id"), o.getString("name"), o.getDouble("latitude"), o.getDouble("longitude"), o.getDouble("distance")));
            }
            Log.d("ARTriangulations", data.toString());
            arFragment.setTriangulationIntersections(data);
        }
    }

//    @Nullable
//    @Override
//    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
//        return super.getExportedCustomBubblingEventTypeConstants();
//    }
//
//    @Nullable
//    @Override
//    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
//        return MapBuilder.of(
//                "locationMarkerTouch",
//                MapBuilder.of("registrationName", "onLocationMarkerTouch"),
//                "ready",
//                MapBuilder.of("registrationName", "onReady"),
//                "loadingProgress",
//                MapBuilder.of("registrationName", "onLoadingProgress"),
//                "cacheUse",
//                MapBuilder.of("registrationName", "onUseCache")
//        );
//    }
}
