package com.geoscene.places.overpass;

import android.util.Log;

import com.geoscene.places.POIClient;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.concurrent.TimeUnit;

import io.reactivex.rxjava3.core.Single;
import okhttp3.OkHttpClient;
import retrofit2.Retrofit;

import retrofit2.adapter.rxjava3.RxJava3CallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

public class OverpassClient implements POIClient {

    public static final String TAG = "OverpassClient";
    public static final String BASE_URL = "https://overpass-api.de";
    private final OverpassService operpassAPI;

    public static final int TIMEOUT_MIN = 2;

    public OverpassClient() {
        OkHttpClient.Builder httpClient = new OkHttpClient.Builder()
                .connectTimeout(TIMEOUT_MIN, TimeUnit.MINUTES)
                .readTimeout(TIMEOUT_MIN, TimeUnit.MINUTES);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(httpClient.build())
                .addConverterFactory(GsonConverterFactory.create())
                .addCallAdapterFactory(RxJava3CallAdapterFactory.create())
                .build();

        operpassAPI = retrofit.create(OverpassService.class);
    }

    public Single<PointsOfInterest> executeQuery(String query) {
        return operpassAPI.executeSearchQuery(query).map(x -> x).doOnError(e -> Log.d(TAG, "overpass error " + e.toString()));
    }

    public Single<JsonObject> executeJSONQuery(String query) {
        return operpassAPI.executeJSONSearchQuery(query)
                .map(x -> new JsonParser().parse(x.string()).getAsJsonObject())
                .doOnError(e -> Log.d(TAG, "overpass error " + e.getMessage()));
    }
}
