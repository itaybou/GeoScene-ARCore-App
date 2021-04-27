package com.geoscene.location.modules;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.geoscene.maps.modules.MapsViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Exposes {@link LocationPackage} to ReactNative TypeScript.
 */
public class LocationPackage implements ReactPackage {

//    @NonNull
//    @Override
//    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
//        List<NativeModule> modules = new ArrayList<>();
//        modules.add(new RNGeoARSceneModule(reactContext));
//        return modules;
//    }

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        return Collections.singletonList(new LocationModule(reactContext));
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return new ArrayList<>();

    }
}