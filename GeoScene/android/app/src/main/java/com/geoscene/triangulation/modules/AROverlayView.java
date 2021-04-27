package com.geoscene.triangulation.modules;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.hardware.SensorManager;
import android.location.Location;
import android.opengl.Matrix;
import android.util.Log;
import android.view.View;

import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;

import java.util.ArrayList;
import java.util.List;

public class AROverlayView extends View {

    Context context;
    private float[] rotatedProjectionMatrix = new float[16];
    private DeviceSensors sensors;
    private List<ARPoint> arPoints;

    private int width;
    private int height;

    public AROverlayView(Context context) {
        super(context);

        this.context = context;
        sensors = DeviceSensorsManager.getSensors(context);
        arPoints = new ArrayList<>();
    }

    public void setARPoints(List<ARPoint> arPoints) {
        this.arPoints = arPoints;
        System.out.println(arPoints);
    }

    public void updateRotatedProjectionMatrix(float[] rotatedProjectionMatrix) {
        this.rotatedProjectionMatrix = rotatedProjectionMatrix;
        this.invalidate();
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        width = w;
        height = h;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        final int radius = 30;
        Paint intersectPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        intersectPaint.setStyle(Paint.Style.FILL);
        intersectPaint.setColor(Color.WHITE);
        intersectPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
        intersectPaint.setStrokeWidth(2f);
        intersectPaint.setTextSize(60);


        if(!arPoints.isEmpty()) {
            ARPoint intersection = arPoints.get(0);
            Location currentLocation = sensors.getDeviceLocation();
            float[] currentLocationInECEF = LocationHelper.WSG84toECEF(currentLocation);
            float[] pointInECEF = LocationHelper.WSG84toECEF(intersection.getLocation());
            float[] pointInENU = LocationHelper.ECEFtoENU(currentLocation, currentLocationInECEF, pointInECEF);

            float[] cameraCoordinateVector = new float[4];
            Matrix.multiplyMV(cameraCoordinateVector, 0, rotatedProjectionMatrix, 0, pointInENU, 0);

            // cameraCoordinateVector[2] is z, that always less than 0 to display on right position
            // if z > 0, the point will display on the opposite
            if (cameraCoordinateVector[2] < 0) {
                float x = (0.5f + cameraCoordinateVector[0] / cameraCoordinateVector[3]) * canvas.getWidth();
                float y = (0.5f - cameraCoordinateVector[1] / cameraCoordinateVector[3]) * canvas.getHeight();

                canvas.drawCircle(x, y, radius, intersectPaint);
                String countText = String.format("%d intersections", arPoints.size());
                canvas.drawText(countText, x - (30 * countText.length() / 2), y - 80, intersectPaint);
            }
        }
    }
}