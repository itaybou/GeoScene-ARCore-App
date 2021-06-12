package com.geoscene.ar.modules;

import android.app.Activity;
import android.os.Handler;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.geoscene.ar.ARNodesInitializer;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.geography.Coordinate;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.ArCoreApk;

import org.javatuples.Pair;

import java.util.List;

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
        ARNodesInitializer initializer = new ARNodesInitializer(reactContext, sensors);
        initializer.dispatchDownloadEvent(false, false);
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

    @ReactMethod
    void deleteStoredLocationData(String id) {
        StorageAccess.deletePersistedLocationInfoById(reactContext, id);
    }

    @ReactMethod
    void deleteCachedLocationData(final Promise promise) {
        Pair<Integer, Integer> deletedCount = StorageAccess.deleteCachedLocations(reactContext);
        WritableMap response = Arguments.createMap();
        response.putInt("deleted_raster", deletedCount.getValue0());
        response.putInt("deleted_pois", deletedCount.getValue1());
        promise.resolve(response);
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}