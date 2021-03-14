package com.geoscene.sensors;

import android.hardware.GeomagneticField;
import android.location.Location;

import org.javatuples.Pair;

public interface DeviceSensors {
    Location getDeviceLocation();
    double getDeviceAltitude();
    Pair<Integer, Integer> getDeviceOrientation();
    float getOrientation();
    GeomagneticField getGeomagneticField();
    void setLocationEvent(Runnable event);
    void resume();
    void pause();
}
