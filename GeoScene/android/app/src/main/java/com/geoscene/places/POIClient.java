package com.geoscene.places;

import io.reactivex.rxjava3.core.Single;

public interface POIClient {
    public Single<PointsOfInterest> executeQuery(String query);
}
