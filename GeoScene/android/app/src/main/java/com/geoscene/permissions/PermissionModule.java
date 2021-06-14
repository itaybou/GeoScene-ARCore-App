package com.geoscene.permissions;

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
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geoscene.ar.ARNodesInitializer;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.geography.Coordinate;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.ar.core.ArCoreApk;

import org.javatuples.Pair;

import java.util.List;

public class PermissionModule extends ReactContextBaseJavaModule {

    private static final String TAG = "Permissions";
    private final ReactApplicationContext reactContext;

    public PermissionModule(ReactApplicationContext reactContext) {
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
    public void hasPermissions(Promise promise) {
        promise.resolve(PermissionHelper.hasPermission(getActivity()));
    }

    public void dispatchPermissionsEvent(boolean granted) {
        WritableMap params = Arguments.createMap();
        params.putBoolean("granted", granted);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("PermissionsEvent", params);
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}