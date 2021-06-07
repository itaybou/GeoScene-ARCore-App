package com.geoscene.elevation.open_topography;

import android.util.Log;

import java.util.concurrent.TimeUnit;

import com.geoscene.elevation.Raster;
import com.geoscene.geography.mercator.BoundingBoxCenter;
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

    public Single<Raster> fetchTopographyData(BoundingBoxCenter bbox, boolean determineViewshed) {
        double latitude = bbox.getCenter().getLat();
        double longitude = bbox.getCenter().getLon();
        return openTopographyAPI.getElevationData(DEM, bbox.getSouth(), bbox.getNorth(), bbox.getWest(), bbox.getEast(), FORMAT)
                .map(response -> ASCIIGridParser.parseASCIIGrid(response.byteStream()))
                .doOnSuccess(raster -> {
                    raster.setViewshed(determineViewshed ? ViewShed.calculateViewshed(raster, latitude, longitude) : null);
                    raster.setBoundingBox(bbox);
                })
                .doOnError(e -> Log.d("ERROR", "open topography error " + e.getMessage()));
    }
}
