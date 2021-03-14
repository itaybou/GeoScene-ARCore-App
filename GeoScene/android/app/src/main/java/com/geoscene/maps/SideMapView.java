package com.geoscene.maps;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;

import com.geoscene.constants.LocationConstants;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import org.osmdroid.util.BoundingBox;
import org.osmdroid.views.MapView;

public class SideMapView extends MapView {

    private DeviceSensors sensors;

    public SideMapView(Context context, AttributeSet attrs) {
        super(context, attrs);
        sensors = DeviceSensorsManager.initialize(context);
//        this.addOnLayoutChangeListener((mapView, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
//            try {
//                Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//                BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
//                Log.d("BBOX", bbox.toString());
//                ((SideMapView)mapView).zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
//                mapView.invalidate();
//            } catch (Exception e) {
//                Log.d("ERROR", e.getMessage());
//            }
//        });
    }


    @Override
    protected void onLayout(boolean arg0, int arg1, int arg2, int arg3, int arg4) {
        super.onLayout(arg0, arg1, arg2, arg3, arg4);

        // Now that we have laid out the map view,
        // zoom to any bounding box

    }
}
