package com.geoscene.ar_geoscene;

import android.app.Activity;
import android.content.Intent;
import android.os.Handler;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.ar.core.ArCoreApk;

public class RNGeoARSceneModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNGeoARSceneModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return "ARGeoScene";
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
    void navigateToExample() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, RNGeoARSceneActivity.class);
            activity.startActivity(intent);
        }
    }

    public Activity getActivity() {
        return this.getCurrentActivity();
    }
}