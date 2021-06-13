package com.geoscene.geography.modules;

import android.app.Activity;
import android.hardware.SensorManager;
import android.location.Location;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.LocationUtils;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;

public class GeographyModule extends ReactContextBaseJavaModule {

    private static final String TAG = "Geography";
    private final ReactApplicationContext reactContext;

    public GeographyModule(ReactApplicationContext reactContext) {
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

    @ReactMethod
    public void distance(ReadableMap data, Promise promise) {
        double latitude = data.getDouble("latitude");
        double longitude = data.getDouble("longitude");

        DeviceSensors sensorManager = DeviceSensorsManager.getSensors(reactContext);
        Location observer = sensorManager.getDeviceLocation();
        if(observer != null) {
            double distance = LocationUtils.aerialDistance(observer.getLatitude(), latitude, observer.getLongitude(), longitude);
            WritableMap event = Arguments.createMap();
            event.putDouble("distance", distance);
            promise.resolve(event);
        } else promise.resolve(null);
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}
