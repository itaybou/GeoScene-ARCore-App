package com.geoscene.elevation;

import android.hardware.SensorManager;
import android.location.Location;
import android.util.Log;

import androidx.recyclerview.widget.AsyncListUtil;

import com.geoscene.elevation.open_topography.OpenTopographyClient;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.DataCallback;
import com.geoscene.utils.mercator.BoundingBox;

import org.javatuples.Pair;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;

import io.reactivex.rxjava3.core.Single;

public class Elevation {

    static final int WORKERS = 1;
    private static Raster raster;
    private static Pair<Integer, Integer> observer;
    OpenTopographyClient openTopographyClient;

    public Elevation() {
        openTopographyClient = new OpenTopographyClient();
    }

    public Single<Raster> fetchElevationRaster(DeviceSensors sensors) {
        Location deviceLocation = sensors.getDeviceLocation();
        BoundingBox bbox = new BoundingBox(new Coordinate(deviceLocation.getLatitude(), deviceLocation.getLongitude()), 5); //PADDING_KM);
        Log.d("BBOX", bbox.getSouth() + "," + bbox.getNorth() + "," + bbox.getEast() + "," + bbox.getWest());
        return openTopographyClient.fetchTopographyData(bbox, deviceLocation.getAltitude());
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
