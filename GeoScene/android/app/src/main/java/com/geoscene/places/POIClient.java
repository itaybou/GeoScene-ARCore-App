package com.geoscene.places;

import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.google.gson.JsonObject;

import io.reactivex.rxjava3.core.Single;

public interface POIClient {
    public Single<PointsOfInterest> executeQuery(String query);
    public Single<JsonObject> executeJSONQuery(String query);
}
