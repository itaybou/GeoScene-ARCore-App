package com.geoscene.ar.modules;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.geoscene.ar.ARView;

import java.util.Map;
import java.util.Objects;

public class ARViewManager extends ViewGroupManager<FrameLayout> {

    public static final String REACT_TAG = "ARView";
    private final ReactApplicationContext reactContext;

    public final int COMMAND_CREATE = 1;

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
                "CREATE", COMMAND_CREATE
        );
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int reactNativeARViewId = args.getInt(0);
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_CREATE:
                createARFragment(root, reactNativeARViewId, args.getBoolean(1), args.getInt(2));
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void createARFragment(FrameLayout parentLayout, int reactNativeARViewId, boolean determineViewshed, int visibleRadiusKM) {
        Log.d(REACT_TAG, Integer.toString(reactNativeARViewId));
        //ViewGroup parentView = (ViewGroup) parentLayout.findViewById(reactNativeARViewId).getParent();
        //organizeLayout(parentView);
//
        final ARView ARfragment = new ARView(reactContext, determineViewshed, visibleRadiusKM);
        //final MapsFragment mapsFragment = new MapsFragment();
        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager()
                .beginTransaction()
                .replace(reactNativeARViewId, ARfragment, String.valueOf(reactNativeARViewId))
//                .replace(reactNativeMapsViewId, mapsFragment, String.valueOf(reactNativeMapsViewId))
                .commit();
        ((FragmentActivity) Objects.requireNonNull(reactContext.getCurrentActivity())).getSupportFragmentManager().executePendingTransactions();
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
                MapBuilder.of("registrationName", "onUseCache")
        );
    }

    private void organizeLayout(ViewGroup parentView) {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren(parentView);
                parentView.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    private void manuallyLayoutChildren(ViewGroup view) {
        for(int i = 0; i < view.getChildCount(); i++) {
            View child = view.getChildAt(i);
            //Log.d("MEASURE_AR", String.valueOf(view.getMeasuredWidth()));
            child.measure(View.MeasureSpec.makeMeasureSpec(view.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(view.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }
}
