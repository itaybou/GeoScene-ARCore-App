package com.geoscene.triangulation.modules;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.geoscene.ar.modules.ARModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Exposes {@link ARModule} to ReactNative TypeScript.
 */
public class ARCameraPackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        return new ArrayList<>();
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.singletonList(new ARCameraViewManager(reactContext));
    }
}