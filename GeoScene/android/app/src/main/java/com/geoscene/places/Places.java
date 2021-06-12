package com.geoscene.places;

import android.location.Location;
import android.util.Log;

import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.places.overpass.OverpassClient;
import com.geoscene.places.overpass.queries.output.OutputModificator;
import com.geoscene.places.overpass.queries.output.OutputOrder;
import com.geoscene.places.overpass.queries.output.OutputVerbosity;
import com.geoscene.places.overpass.queries.query.OverpassQuery;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.geography.Coordinate;

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

    public Single<PointsOfInterest> searchPlaces(Coordinate center, int radiusKM) {
        return searchAround(center, radiusKM * 1000);
    }

    private Single<PointsOfInterest> searchAround(Coordinate observer, int radiusMeter) {
        OverpassQuery query = new OverpassQuery()
                .format(JSON)
                .timeout(120)
                .filterQuery()
                .way()
                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village","island","farm")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village","island","farm")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .way()
                .tag("name")
                .tagMultiple("natural", new HashSet<>(Arrays.asList("sand", "wood", "peak","hill","valley","volcano","cliff","dune")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tagMultiple("natural", new HashSet<>(Arrays.asList("sand", "wood", "peak","hill","valley","volcano","cliff","dune")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .way()
                .tag("name")
                .tagMultiple("historic", new HashSet<>(Arrays.asList("archaeological_site", "battlefield", "aircraft","building","castle","fort", "ruins", "tomb")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tagMultiple("historic", new HashSet<>(Arrays.asList("archaeological_site", "battlefield","building","castle","fort", "ruins", "tomb")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tag("created_by", "GeoScene")
                .around(radiusMeter, observer.getLat(), observer.getLon())

                .end()
                .output(OutputVerbosity.BODY, OutputModificator.BB, OutputOrder.QT);

        String queryString = query.build();
        return overpassClient.executeQuery(queryString);
    }

    public Single<JsonObject> searchImagesAround(Coordinate observer, int radiusMeter) {
        OverpassQuery query = new OverpassQuery()
                .format(JSON)
                .timeout(60)
                .filterQuery()
                .node()
                .tag("name")
                .tag("image")
                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village","island","farm")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tag("image")
                .tagMultiple("natural", new HashSet<>(Arrays.asList("sand", "wood", "peak","hill","valley","volcano","cliff","dune")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .prepareNext()
                .node()
                .tag("name")
                .tag("image")
                .tagMultiple("historic", new HashSet<>(Arrays.asList("archaeological_site", "battlefield","building","castle","fort", "ruins", "tomb")))
                .around(radiusMeter, observer.getLat(), observer.getLon())
                .end()
                .output(OutputVerbosity.META, OutputModificator.BB, OutputOrder.QT);

        String queryString = query.build();
        Log.d("QUERY", queryString);
        return overpassClient.executeJSONQuery(queryString);
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
                .output(OutputVerbosity.META, OutputModificator.BB, OutputOrder.QT);
        return overpassClient.executeJSONQuery(query.build());
    }
}
