package com.geoscene.sensors;

import android.location.Location;

public interface DeviceSensors {
    Location getDeviceLocation();
    float getDeviceOrientation();
    void setLocationEvent(Runnable event);
    void resume();
    void pause();
}
