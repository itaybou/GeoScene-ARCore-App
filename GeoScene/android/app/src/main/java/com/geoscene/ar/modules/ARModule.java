package com.geoscene.ar.modules;

import android.app.Activity;
import android.content.Intent;
import android.os.Handler;
import android.os.storage.StorageManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geoscene.ar.ARNodesInitializer;
import com.geoscene.ar.RNGeoARSceneActivity;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.geography.Coordinate;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.ArCoreApk;

import java.util.List;

import io.realm.RealmResults;

public class ARModule extends ReactContextBaseJavaModule {

    private static final String TAG = "ARModule";
    private final ReactApplicationContext reactContext;

    public ARModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void checkIfDeviceSupportAR(Promise promise) {
        ArCoreApk.Availability availability = ArCoreApk.getInstance().checkAvailability(reactContext);
        if (availability.isTransient()) {
            // Re-query at 5Hz while compatibility is checked in the background.
            new Handler().postDelayed(() -> {
                checkIfDeviceSupportAR(promise);
            }, 200);
        }
        promise.resolve(availability != ArCoreApk.Availability.UNSUPPORTED_DEVICE_NOT_CAPABLE);
    }

    @ReactMethod
    void downloadAndStoreLocationData(String name, String description, double latitude, double longitude, int radiusKM) {
        DeviceSensors sensors = DeviceSensorsManager.getSensors(reactContext);
        Log.d("HEREEE", "DOWNLOAD");
        ARNodesInitializer initializer = new ARNodesInitializer(reactContext, sensors, null, false, 0, null);
        initializer.dispatchDownloadEvent(false);
        Coordinate center = new Coordinate(latitude, longitude);
        initializer.downloadAndStoreLocationInformation(name, description, center, radiusKM);
    }

    @ReactMethod
    void fetchStoredLocationData(final Promise promise) {
        List<PersistLocationObject> locationData = StorageAccess.fetchPersistedLocationData();
        WritableArray data = Arguments.createArray();
        if(locationData != null) {
            for(PersistLocationObject locationObject : locationData) {
                WritableMap locationMap = Arguments.createMap();
                locationMap.putString("id", locationObject.id);
                locationMap.putString("name", locationObject.name);
                locationMap.putString("description", locationObject.description);
                locationMap.putInt("timestamp", (int) locationObject.timestamp);
                locationMap.putInt("radiusKM", (int)Math.round(locationObject.bbox.radiusKM));
                locationMap.putDouble("latitude", locationObject.bbox.centerLatitude);
                locationMap.putDouble("longitude", locationObject.bbox.centerLongitude);
                data.pushMap(locationMap);
            }
        }
        promise.resolve(data);
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}