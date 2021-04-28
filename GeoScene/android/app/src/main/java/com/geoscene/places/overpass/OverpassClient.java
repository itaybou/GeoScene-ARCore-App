package com.geoscene.places.overpass;

import android.util.Log;

import com.geoscene.places.POIClient;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import io.reactivex.rxjava3.core.Single;
import retrofit2.Retrofit;

import retrofit2.adapter.rxjava3.RxJava3CallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

public class OverpassClient implements POIClient {

    public static final String BASE_URL = "https://overpass-api.de";
    private final OverpassService operpassAPI;

    public static final int TIMEOUT_MIN = 2;

    public OverpassClient() {

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .addCallAdapterFactory(RxJava3CallAdapterFactory.create())
                .build();

        operpassAPI = retrofit.create(OverpassService.class);
    }

    public Single<PointsOfInterest> executeQuery(String query) {
        return operpassAPI.executeSearchQuery(query).map(x -> {
            Log.d("RESPONSE", x.elements.toString());
            return x;
        }).doOnError(e -> Log.d("ERROR", "overpass error " + e.getMessage()));
    }

    public Single<JsonObject> executeJSONQuery(String query) {
        Log.d("HERE", query);
        return operpassAPI.executeJSONSearchQuery(query)
                .map(x -> new JsonParser().parse(x.string()).getAsJsonObject())
                .doOnError(e -> Log.d("ERROR", "overpass error " + e.getMessage()));
    }
}
