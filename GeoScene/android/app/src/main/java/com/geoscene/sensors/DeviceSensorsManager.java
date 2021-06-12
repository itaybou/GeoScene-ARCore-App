package com.geoscene.sensors;

import android.content.Context;
import android.hardware.GeomagneticField;
import android.hardware.SensorEventListener;
import android.location.Location;
import android.location.LocationListener;

import org.javatuples.Pair;

public class DeviceSensorsManager implements DeviceSensors {

    DeviceLocation location;
    DeviceOrientation orientation;
    DeviceNetwork network;

    private static DeviceSensors sensors;

    private DeviceSensorsManager(Context context) {
        location = new DeviceLocation(context);
        orientation = new DeviceOrientation(context);
        network = new DeviceNetwork(context);
    }

    public static DeviceSensors getSensors(Context context) {
        if(sensors == null) {
            sensors = new DeviceSensorsManager(context);
            sensors.resume();
        }
        return sensors;
    }

    @Override
    public Location getDeviceLocation() {
        return location.getDeviceLocation();
    }

    @Override
    public double getDeviceAltitude() {
        Double altitude = location.getAltitude();
        return altitude != null ? altitude : 0;
    }

    @Override
    public Pair<Integer, Integer> getDeviceOrientation() {
        return orientation.getDeviceOrientation();
    }

    @Override
    public float getOrientation() {
        return orientation.getOrientation();
    }

    @Override
    public boolean isNetworkActive() {
        return network.isNetworkAvailable();
    }

    @Override
    public float[] getOrientationMatrix() {
        return orientation.getOrientationMatrix();
    }

    public GeomagneticField getGeomagneticField() {
        return new GeomagneticField((float)location.getDeviceLocation().getLatitude(), (float)location.getDeviceLocation().getLongitude(), (float)location.getDeviceLocation().getAltitude(), location.getDeviceLocation().getTime());
    }

    @Override
    public void setLocationEvent(Runnable event) {
        location.setLocationEvent(event);
    }

    @Override
    public void resume() {
        location.resume();
        orientation.resume();
    }

    @Override
    public void pause() {
        location.pause();
        orientation.pause();
    }
}
