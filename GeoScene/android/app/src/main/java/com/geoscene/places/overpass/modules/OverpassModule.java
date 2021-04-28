package com.geoscene.places.overpass.modules;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.geoscene.places.Places;
import com.github.underscore.lodash.Json;
import com.github.underscore.lodash.U;

import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;

import java.util.HashMap;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Scheduler;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class OverpassModule extends ReactContextBaseJavaModule {
    private static final String TAG = "Overpass";
    private ReactContext mReactContext;

    public OverpassModule(ReactApplicationContext reactContext) {
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void getUserPOIs(
            final String userName,
            @Nullable final Callback onComplete
    ) {
        Places places = new Places();
        places.searchUserPOIs(userName)
            .subscribeOn(Schedulers.io()).observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                json -> {
                    WritableMap resp = Arguments.createMap();
                    resp.putString("data", json.get("elements").toString());
                    onComplete.invoke(null, resp);
                },
                throwable -> {throw throwable;});
    }
}
