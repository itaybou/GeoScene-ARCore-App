package com.geoscene.places.overpass;

import com.geoscene.places.PointsOfInterest;

import io.reactivex.rxjava3.core.Single;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface OverpassService {
    @GET("/api/interpreter")
    Single<PointsOfInterest> executeSearchQuery(@Query("data") String data);
}
