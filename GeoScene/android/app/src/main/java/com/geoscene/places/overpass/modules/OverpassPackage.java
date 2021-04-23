package com.geoscene.oauth;

import android.content.Context;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.geoscene.places.OverpassModule;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

@SuppressWarnings("unused")
public class OverpassPackage implements ReactPackage {
    private Context mContext;

    public OverpassPackage() {
    }
    /**
     * @param reactContext react application context that can be used to create modules
     * @return list of native modules to register with the newly created catalyst instance
     */
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new OverpassModule(reactContext));
        return modules;
    }

    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
