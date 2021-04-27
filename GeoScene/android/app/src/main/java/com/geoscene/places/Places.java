package com.geoscene.places;

import android.location.Location;

import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.places.overpass.OverpassClient;
import com.geoscene.places.overpass.queries.output.OutputModificator;
import com.geoscene.places.overpass.queries.output.OutputOrder;
import com.geoscene.places.overpass.queries.output.OutputVerbosity;
import com.geoscene.places.overpass.queries.query.OverpassQuery;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.utils.Coordinate;

import java.util.Arrays;
import java.util.HashSet;

import io.reactivex.rxjava3.core.Single;


import com.google.gson.JsonObject;

import static com.geoscene.places.overpass.queries.output.OutputFormat.JSON;

public class Places {

    POIClient overpassClient;

    public Places() {
        overpassClient = new OverpassClient();
    }

    public Single<PointsOfInterest> searchPlaces(DeviceSensors sensors, int radiusKM) {
        Location deviceLocation = sensors.getDeviceLocation();
        Coordinate observer = new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude());
        return searchAround(observer, radiusKM * 1000);
    }

    private Single<PointsOfInterest> searchAround(Coordinate observer, int radiusMeter) {
        OverpassQuery query = new OverpassQuery()
                .format(JSON)
                .timeout(30)
                .filterQuery()
                .way()
                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
//                .prepareNext()
//                .way()
//                .tagMultiple("natural", new HashSet<>(Arrays.asList("sand", "wood", "peak")))
//                .around(50000, 31.712730622002724, 34.580646038992704)
//                .prepareNext()
//                .rel()
//                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village")))
//                .around(50000, 31.780850160208008, 34.69151594355443)
                .end()
                .output(OutputVerbosity.BODY, OutputModificator.BB, OutputOrder.QT);

//        System.out.println(query.build());
        return overpassClient.executeQuery(query.build());
    }

    public Single<JsonObject> searchUserPOIs(String userName) {
        OverpassQuery query = new OverpassQuery()
                .format(JSON)
                .timeout(30)
                .filterQuery()
                .node()
                .user(userName)
                .tag("created_by", "GeoScene")
                .end()
                .output(OutputVerbosity.BODY, OutputModificator.BB, OutputOrder.QT);
        return overpassClient.executeJSONQuery(query.build());
    }
}
