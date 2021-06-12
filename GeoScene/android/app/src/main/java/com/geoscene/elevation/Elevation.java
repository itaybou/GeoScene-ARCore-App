package com.geoscene.elevation;

import android.location.Location;
import android.util.Log;

import com.geoscene.elevation.open_topography.OpenTopographyClient;
import com.geoscene.exceptions.WebRequestException;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;

import org.javatuples.Pair;

import io.reactivex.rxjava3.core.Single;

public class Elevation {

    static final int WORKERS = 1;
    private static Raster raster;
    private static Pair<Integer, Integer> observer;
    OpenTopographyClient openTopographyClient;

    public Elevation() {
        openTopographyClient = new OpenTopographyClient();
    }

    public Single<Raster> fetchElevationRaster(Coordinate center, int radiusKM, boolean determineViewshed) {
        BoundingBoxCenter bbox = new BoundingBoxCenter(center, radiusKM);
        return openTopographyClient.fetchTopographyData(bbox, determineViewshed);
    }

    private void setObserver(Location deviceLocation) {
        observer = raster.getRowColByCoordinates(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()));
    }

    public Pair<Integer, Integer> getObserverLocation() {
        return observer;
    }

    public int getObserverElevation() {
        return raster.getElevation(observer.getValue0(), observer.getValue1());
    }

    public Raster getRaster() {
        return raster;
    }
}
