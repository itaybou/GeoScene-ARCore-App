package com.geoscene.location.modules;

import android.app.Activity;
import android.content.Intent;
import android.os.Handler;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.ar.RNGeoARSceneActivity;
import com.geoscene.location.Coordinate;
import com.geoscene.location.mercator.BoundingBoxCenter;
import com.google.ar.core.ArCoreApk;

public class LocationModule extends ReactContextBaseJavaModule {

    private static final String TAG = "Location";
    private final ReactApplicationContext reactContext;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void boundingBox(ReadableMap data, Promise promise) {
        double latitude = data.getDouble("latitude");
        double longitude = data.getDouble("longitude");
        double radius = data.getDouble("radius");

        BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(latitude, longitude), radius);
        WritableMap event = Arguments.createMap();
        event.putDouble("south", bbox.getSouth());
        event.putDouble("north", bbox.getNorth());
        event.putDouble("east", bbox.getEast());
        event.putDouble("west", bbox.getWest());
        promise.resolve(event);
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}
