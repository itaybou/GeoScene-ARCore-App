package com.geoscene.permissions;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.geoscene.ar.modules.ARModule;
import com.geoscene.ar.modules.ARViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Exposes {@link ARModule} to ReactNative TypeScript.
 */
public class PermissionPackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PermissionModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return new ArrayList<>();
    }
}