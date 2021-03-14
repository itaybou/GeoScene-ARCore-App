package com.geoscene.elevation.open_topography;

import android.util.Log;

import java.util.concurrent.TimeUnit;

import com.geoscene.elevation.Raster;
import com.geoscene.utils.mercator.BoundingBoxCenter;
import com.geoscene.viewshed.ViewShed;

import io.reactivex.rxjava3.core.Single;
import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava3.RxJava3CallAdapterFactory;

public class OpenTopographyClient {
    public static final String TAG = "OPEN_TOPOGRAPHY_API";

    public static final String BASE_URL = "https://portal.opentopography.org/";
    public static final String DEM = "SRTMGL3";
    public static final String FORMAT = "AAIGrid";

    public static final int TIMEOUT_MIN = 2;

    private final OpenTopographyService openTopographyAPI;

    public OpenTopographyClient() {
        OkHttpClient.Builder httpClient = new OkHttpClient.Builder()
                .connectTimeout(TIMEOUT_MIN, TimeUnit.MINUTES)
                .readTimeout(TIMEOUT_MIN, TimeUnit.MINUTES);
        //Defining the Retrofit using Builder
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)   //This is the only mandatory call on Builder object.
                .client(httpClient.build())
                .addCallAdapterFactory(RxJava3CallAdapterFactory.create())
                .build();
        openTopographyAPI = retrofit.create(OpenTopographyService.class);
    }

    public Single<Raster> fetchTopographyData(BoundingBoxCenter bbox, double altitude) {
        double latitude = bbox.getCenter().getLat();
        double longitude = bbox.getCenter().getLon();
        return openTopographyAPI.getElevationData(DEM, bbox.getSouth(), bbox.getNorth(), bbox.getWest(), bbox.getEast(), FORMAT)
                .map(response -> ASCIIGridParser.parseASCIIGrid(response.byteStream()))
                .doOnSuccess(raster -> raster.setViewshed(ViewShed.calculateViewshed(raster, latitude, longitude, altitude)))
                .doOnError(e -> Log.d("ERROR", "open topography error " + e.getMessage()));
//        System.out.println("("+bbox.getSouth()+ "," + bbox.getNorth()+ "," + bbox.getWest()+ "," + bbox.getEast() + ")");
//        call.enqueue(new Callback<ResponseBody>() {
//            @Override
//            public void onResponse(@NonNull Call<ResponseBody> call, Response<ResponseBody> response) {
//                if (response.isSuccessful()) {
//                    new Thread(() -> {
//                        assert response.body() != null;
//                        try {
//                            Raster elevationRaster =
//                            elevationDataCallback.onDataFetched(elevationRaster);
//                            Log.wtf("TAG", String.valueOf(response.body().byteStream()));
//                        } catch (IOException e) {
//                            elevationDataCallback.onError(e.getMessage());
//                        }
//                    }).start();
//                }
//            }
//
//            @Override
//            public void onFailure(@NonNull Call<ResponseBody> call, Throwable throwable) {
//                System.out.println("BASSA");
//            }
//        });
    }
}
