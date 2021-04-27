package com.geoscene.triangulation.modules;


import androidx.fragment.app.Fragment;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Camera;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationManager;
import android.opengl.Matrix;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.react.bridge.ReactContext;
import com.geoscene.R;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.geoscene.triangulation.TriangulationIntersection;

import java.util.ArrayList;
import java.util.List;

import static android.hardware.SensorManager.*;
import static android.view.Surface.*;
import static android.view.Surface.ROTATION_180;
import static android.view.Surface.ROTATION_270;

public class ARActivity extends Fragment implements SensorEventListener {

    final static String TAG = "ARActivity";
    private SurfaceView surfaceView;
    private FrameLayout cameraContainerLayout;
    private AROverlayView arOverlayView;
    private CameraView cameraView;

    private SensorManager sensorManager;
    private WindowManager windowManager;
    private final static int REQUEST_CAMERA_PERMISSIONS_CODE = 11;
    public static final int REQUEST_LOCATION_PERMISSIONS_CODE = 0;

    public Location location;
    private DeviceSensors sensors;

    private ReactContext reactContext;

    public ARActivity(ReactContext reactContext) {
        super();
        this.reactContext = reactContext;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View view = inflater.inflate(R.layout.triangulation_layout, container, false);

        Context context = getContext();
        sensors = DeviceSensorsManager.getSensors(reactContext);
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        cameraContainerLayout = view.findViewById(R.id.camera_container_layout);

        arOverlayView = new AROverlayView(context);
        return view;
    }

    private void registerSensors() {
        sensorManager.registerListener(this,
                sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR),
                SENSOR_DELAY_NORMAL);
    }

    @Override
    public void onResume() {
        super.onResume();
        requestCameraPermission();
        requestLocationPermission();
        registerSensors();
        initARCameraView();
        initAROverlayView();
    }

    @Override
    public void onPause() {
        cameraView.releaseCamera();
        super.onPause();
    }

    public void requestCameraPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                getContext().checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            this.requestPermissions(new String[]{Manifest.permission.CAMERA}, REQUEST_CAMERA_PERMISSIONS_CODE);
        } else initARCameraView();
    }

    public void requestLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                getContext().checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            this.requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, REQUEST_LOCATION_PERMISSIONS_CODE);
        }
    }

    public void initAROverlayView() {
        if (arOverlayView.getParent() != null) {
            ((ViewGroup) arOverlayView.getParent()).removeView(arOverlayView);
        }
        cameraContainerLayout.addView(arOverlayView);
        Log.d("CAMERA", "addView");
    }

    public void initARCameraView() {
        if (cameraView == null) {
            cameraView = new CameraView(reactContext);
        }
        if (cameraView.getParent() != null) {
            ((ViewGroup) cameraView.getParent()).removeView(cameraView);
        }
        cameraContainerLayout.addView(cameraView);
        cameraView.initCamera();
    }
//
//    private void reloadSurfaceView() {
//        if (surfaceView.getParent() != null) {
//            ((ViewGroup) surfaceView.getParent()).removeView(surfaceView);
//        }
//
//        cameraContainerLayout.addView(surfaceView);
//    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        if (sensorEvent.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
            float[] rotationMatrixFromVector = new float[16];
            float[] rotationMatrix = new float[16];
            getRotationMatrixFromVector(rotationMatrixFromVector, sensorEvent.values);
            final int screenRotation = windowManager.getDefaultDisplay().getRotation();

            switch (screenRotation) {
                case ROTATION_90:
                    remapCoordinateSystem(rotationMatrixFromVector,
                            AXIS_Y,
                            AXIS_MINUS_X, rotationMatrix);
                    break;
                case ROTATION_270:
                    remapCoordinateSystem(rotationMatrixFromVector,
                            AXIS_MINUS_Y,
                            AXIS_X, rotationMatrix);
                    break;
                case ROTATION_180:
                    remapCoordinateSystem(rotationMatrixFromVector,
                            AXIS_MINUS_X, AXIS_MINUS_Y,
                            rotationMatrix);
                    break;
                default:
                    remapCoordinateSystem(rotationMatrixFromVector,
                            AXIS_X, AXIS_Y,
                            rotationMatrix);
                    break;
            }

            float[] projectionMatrix = cameraView.getProjectionMatrix();
            float[] rotatedProjectionMatrix = new float[16];
            Matrix.multiplyMM(rotatedProjectionMatrix, 0, projectionMatrix, 0, rotationMatrix, 0);
            this.arOverlayView.updateRotatedProjectionMatrix(rotatedProjectionMatrix);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (accuracy == SensorManager.SENSOR_STATUS_UNRELIABLE) {
            Log.w("DeviceOrientation", "Orientation compass unreliable");
        }
    }

    public void setTriangulationIntersections(List<TriangulationIntersection> data) {
        List<ARPoint> intersectionPoints = new ArrayList<>();
        for(TriangulationIntersection intersection : data) {
            intersectionPoints.add(new ARPoint(intersection.name, intersection.intersection.getLat(), intersection.intersection.getLon(), 100));
        }
        arOverlayView.setARPoints(intersectionPoints);
    }
}
