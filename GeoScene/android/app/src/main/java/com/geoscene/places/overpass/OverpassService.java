package com.geoscene.places.overpass;

import com.geoscene.places.overpass.poi.PointsOfInterest;

import io.reactivex.rxjava3.core.Single;
import okhttp3.ResponseBody;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface OverpassService {
    @GET("/api/interpreter")
    Single<PointsOfInterest> executeSearchQuery(@Query("data") String data);

    @GET("/api/interpreter")
    Single<ResponseBody> executeJSONSearchQuery(@Query("data") String data);
}
