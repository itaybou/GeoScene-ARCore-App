package com.geoscene.places.overpass;

import android.util.Log;

import com.geoscene.places.PointsOfInterest;

import io.reactivex.rxjava3.core.Single;
import retrofit2.Retrofit;

import retrofit2.adapter.rxjava3.RxJava3CallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

public class OverpassClient {

    public static final String BASE_URL = "https://overpass-api.de";
    private final OverpassService operpassAPI;

    public OverpassClient() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .addCallAdapterFactory(RxJava3CallAdapterFactory.create())
                .build();

        operpassAPI = retrofit.create(OverpassService.class);
    }

    public Single<PointsOfInterest> executeOverpassQuery(String query) {
        long time = System.currentTimeMillis();
        return operpassAPI.executeSearchQuery(query).map(x -> {
            Log.d("RESPONSE", x.elements.toString());
            return x;
        }).doOnError(e -> Log.d("ERROR", "overpass error " + e.getMessage()));
//        try {
//            OverpassServiceProvider.get().interpreter(query).enqueue(new Callback<OverpassQueryResult>() {
//                @Override
//                public void onResponse(@NonNull Call<OverpassQueryResult> call, Response<OverpassQueryResult> response) {
//                    if (response.isSuccessful()) {
//                        System.out.println("Query time 50km: " + ((double) (System.currentTimeMillis() - time) / 1000) + "sec");
//                        assert response.body() != null;
//                        overpassPlacesDataCallback.onDataFetched(response.body());
//                        response.body().elements.forEach(e -> {
//                                    System.out.println(e.type);
//                                    System.out.println("Name: " + e.tags.name +
//                                            " | lon, lat: (" + e.lon + ", " + e.lat + "), " +
//                                            "XY: (" + SphericalMercator.lon2x(e.lon) + ", " + SphericalMercator.lat2y(e.lat) + ")");
//                        });
//                    }
//                }
//
//                @Override
//                public void onFailure(@NonNull Call<OverpassQueryResult> call, Throwable throwable) {
//                    System.err.println("Error");
//                }
//            });
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
    }
}
