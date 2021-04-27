package com.geoscene.elevation;

import android.location.Location;
import android.util.Log;

import com.geoscene.constants.LocationConstants;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.elevation.open_topography.OpenTopographyClient;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.mercator.BoundingBoxCenter;

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

    public Single<Raster> fetchElevationRaster(DeviceSensors sensors, boolean determineViewshed, int radiusKM) {
        Location deviceLocation = sensors.getDeviceLocation();
        BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()), radiusKM); //PADDING_KM);
        Log.d("BBOX", bbox.getSouth() + "," + bbox.getNorth() + "," + bbox.getEast() + "," + bbox.getWest());
        Log.d("ALTITUDE", String.valueOf(sensors.getDeviceAltitude()));
        return openTopographyClient.fetchTopographyData(bbox, sensors.getDeviceAltitude(), determineViewshed);
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
