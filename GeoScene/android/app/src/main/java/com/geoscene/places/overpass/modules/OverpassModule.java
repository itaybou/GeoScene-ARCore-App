package com.geoscene.places.overpass.modules;

import android.location.Location;
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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.LocationUtils;
import com.geoscene.places.Places;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.github.underscore.lodash.Json;
import com.github.underscore.lodash.U;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Scheduler;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.disposables.Disposable;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class OverpassModule extends ReactContextBaseJavaModule {
    private static final String TAG = "Overpass";
    private ReactContext mReactContext;

    private Disposable disposable;

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
        disposable = places.searchUserPOIs(userName)
            .subscribeOn(Schedulers.io()).observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                json -> {
                    WritableMap resp = Arguments.createMap();
                    resp.putString("data", json.get("elements").toString());
                    onComplete.invoke(null, resp);
                    disposable = null;
                },
                    throwable -> {
                        onComplete.invoke(throwable.getMessage(), null);
                        disposable = null;
                    }
            );
    }

    @ReactMethod
    public void getImagesAround(
            final int radiusKM,
            @Nullable final Callback onComplete
    ) {
        Places places = new Places();
        DeviceSensors sensors = DeviceSensorsManager.getSensors(mReactContext);
        Location observer = sensors.getDeviceLocation();
        disposable = places.searchImagesAround(new Coordinate(observer.getLatitude(), observer.getLongitude()), radiusKM * 1000)
                .subscribeOn(Schedulers.io()).observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                        json -> {
                            List<WritableMap> maps = new ArrayList<>();
                            JsonArray elements = json.get("elements").getAsJsonArray();
                            elements.forEach(e -> {
                                WritableMap map = Arguments.createMap();
                                JsonObject element = e.getAsJsonObject();
                                double distance = LocationUtils.aerialDistance(observer.getLatitude(), element.get("lat").getAsDouble(), observer.getLongitude(), element.get("lon").getAsDouble()) / 1000;
                                if(distance <= radiusKM + 8) {
                                    JsonObject tags = element.get("tags").getAsJsonObject();
                                    JsonElement nameEn = tags.get("name:en");
                                    JsonElement nameHe = tags.get("name:he");
                                    JsonElement nameGen = tags.get("name");
                                    String name = nameEn != null ? nameEn.getAsString() : nameHe != null ? nameHe.getAsString() : nameGen != null ? nameGen.getAsString() : null;

                                    JsonElement place = tags.get("place");
                                    JsonElement natural = tags.get("natural");
                                    JsonElement historic = tags.get("historic");
                                    String type = place != null ? place.getAsString() : natural != null ? natural.getAsString() : historic != null ? historic.getAsString() : null;
                                    map.putString("image", tags.get("image").getAsString());
                                    map.putString("name", name);
                                    map.putString("type", type);
                                    map.putDouble("lat", element.get("lat").getAsDouble());
                                    map.putDouble("lon", element.get("lon").getAsDouble());
                                    map.putDouble("distance", distance);
                                    maps.add(map);
                                }
                            });

                            maps.sort((m1, m2) -> Double.compare(m1.getDouble("distance"), m2.getDouble("distance")));
                            WritableArray data = Arguments.createArray();
                            WritableMap resp = Arguments.createMap();
                            for(WritableMap m : maps) {
                                data.pushMap(m);
                            }
                            resp.putArray("data", data);
                            resp.putDouble("latitude", observer.getLatitude());
                            resp.putDouble("longitude", observer.getLongitude());
                            onComplete.invoke(null, resp);
                            disposable = null;
                        },
                        throwable -> {
                            onComplete.invoke(throwable.getMessage(), null);
                            disposable = null;
                        }
                    );
    }

    @ReactMethod
    public void clearRequest(
    ) {
       if(disposable != null) {
           disposable.dispose();
       }
    }
}
