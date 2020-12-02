package com.geoscene.ar.modules;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.util.Log;
import android.view.Choreographer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.geoscene.R;
import com.geoscene.ar.RNGeoARSceneFragment;

import java.util.Map;
import java.util.Objects;

public class RNGeoARSceneViewManager extends ViewGroupManager<FrameLayout> {

    public static final String REACT_TAG = "ARView";
    private final ReactApplicationContext reactContext;

    public final int COMMAND_CREATE = 1;

    public RNGeoARSceneViewManager(ReactApplicationContext reactContext) {
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
                "create", COMMAND_CREATE
        );
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG,"command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int reactNativeViewId = args.getInt(0);
        int commandNo = Integer.parseInt(commandId);
        switch(commandNo) {
            case COMMAND_CREATE:
                createARFragment(root, reactNativeViewId);
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    private void createARFragment(FrameLayout parentLayout, int reactNativeViewId) {
        Log.d(REACT_TAG, Integer.toString(reactNativeViewId));
        ViewGroup parentView = (ViewGroup) parentLayout.findViewById(reactNativeViewId).getParent();
        organizeLayout(parentView);


        final RNGeoARSceneFragment ARfragment = new RNGeoARSceneFragment();
        ((FragmentActivity) Objects.requireNonNull(this.reactContext.getCurrentActivity())).getSupportFragmentManager()
                .beginTransaction()
                .replace(reactNativeViewId, ARfragment, String.valueOf(reactNativeViewId))
                .commit();
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

            child.measure(View.MeasureSpec.makeMeasureSpec(view.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(view.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }
}
