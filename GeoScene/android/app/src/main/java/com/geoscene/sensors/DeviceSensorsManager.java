package com.geoscene.sensors;

import android.content.Context;
import android.hardware.SensorEventListener;
import android.location.Location;
import android.location.LocationListener;

public class DeviceSensorsManager implements DeviceSensors {

    DeviceLocation location;
    DeviceOrientation orientation;

    private DeviceSensorsManager(Context context) {
        location = new DeviceLocation(context);
        orientation = new DeviceOrientation(context);
    }

    public static DeviceSensors initialize(Context context) {
        DeviceSensors sensors = new DeviceSensorsManager(context);
        sensors.resume();
        return sensors;
    }

    @Override
    public Location getDeviceLocation() {
        return location.getDeviceLocation();
    }

    @Override
    public float getDeviceOrientation() {
        return orientation.getOrientation();
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
