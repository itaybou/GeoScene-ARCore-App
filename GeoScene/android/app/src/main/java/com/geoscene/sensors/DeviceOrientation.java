package com.geoscene.sensors;

import android.content.Context;
import android.content.pm.ActivityInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.util.Log;
import android.view.Surface;
import android.view.WindowManager;

import org.javatuples.Pair;

import java.util.List;

/**
 * Created by John on 02/03/2018.
 */

public class DeviceOrientation implements SensorEventListener {

    public float pitch;
    public float roll;
    private WindowManager windowManager;
    private SensorManager mSensorManager;
    private float orientation = 0f;

    private static final float LOW_PASS_ALPHA = 0.25f;

    public DeviceOrientation(Context context) {
        mSensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    }

    protected float[] lowPassFilter(float[] input, float[] output) {
        if ( output == null ) return input;
        for ( int i = 0; i < input.length; i++ ) {
            output[i] = output[i] + LOW_PASS_ALPHA * (input[i] - output[i]);
        }
        return output;
    }

    /**
     * Gets the device orientation in degrees from the azimuth (clockwise)
     *
     * @return orientation [0-360] in degrees
     */
    public float getOrientation() {
        return orientation;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {

        switch (event.sensor.getType()) {
            case Sensor.TYPE_GAME_ROTATION_VECTOR:
            case Sensor.TYPE_ROTATION_VECTOR:
                processSensorOrientation(event.values);
                break;
            default:
                Log.e("DeviceOrientation", "Sensor event type not supported");
                break;
        }
    }

    @SuppressWarnings("SuspiciousNameCombination")
    private void processSensorOrientation(float[] rotation) {
        float[] rotationMatrix = new float[9];
        SensorManager.getRotationMatrixFromVector(rotationMatrix, rotation);
        final int worldAxisX;
        final int worldAxisY;

        switch (windowManager.getDefaultDisplay().getRotation()) {
            case Surface.ROTATION_90:
                worldAxisX = SensorManager.AXIS_Z;
                worldAxisY = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                worldAxisX = SensorManager.AXIS_MINUS_X;
                worldAxisY = SensorManager.AXIS_MINUS_Z;
                break;
            case Surface.ROTATION_270:
                worldAxisX = SensorManager.AXIS_MINUS_Z;
                worldAxisY = SensorManager.AXIS_X;
                break;
            case Surface.ROTATION_0:
            default:
                worldAxisX = SensorManager.AXIS_X;
                worldAxisY = SensorManager.AXIS_Z;
                break;
        }
        float[] adjustedRotationMatrix = new float[9];
        SensorManager.remapCoordinateSystem(rotationMatrix, worldAxisX,
                worldAxisY, adjustedRotationMatrix);

        // azimuth/pitch/roll
        float[] orientation = new float[3];
        SensorManager.getOrientation(adjustedRotationMatrix, orientation);

        this.orientation = ((float) Math.toDegrees(orientation[0]) + 360f) % 360f;
    }

    public Pair<Integer, Integer> getDeviceOrientation() {
        switch (windowManager.getDefaultDisplay().getRotation()) {
            case Surface.ROTATION_0:
                return new Pair<>(0, ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
//                screen_orientation = "ROTATION_0 SCREEN_ORIENTATION_PORTRAIT";
            case Surface.ROTATION_90:
                return new Pair<>(90, ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
//                screen_orientation = "ROTATION_90 SCREEN_ORIENTATION_LANDSCAPE";
            case Surface.ROTATION_180:
                return new Pair<>(180, ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT);
//                screen_orientation = "ROTATION_180 SCREEN_ORIENTATION_REVERSE_PORTRAIT";
            default:
                return new Pair<>(270, ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE);
//                screen_orientation = "ROTATION_270 SCREEN_ORIENTATION_REVERSE_LANDSCAPE";
        }
    }


    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (accuracy == SensorManager.SENSOR_STATUS_UNRELIABLE) {
            Log.w("DeviceOrientation", "Orientation compass unreliable");
        }
    }

    public void resume() {
        mSensorManager.registerListener(this,
                mSensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR),
                SensorManager.SENSOR_DELAY_NORMAL);
    }

    public void pause() {
        mSensorManager.unregisterListener(this);
    }
}