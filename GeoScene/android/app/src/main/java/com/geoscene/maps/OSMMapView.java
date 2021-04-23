package com.geoscene.maps;

import android.Manifest;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.hardware.GeomagneticField;
import android.location.Address;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;

import com.facebook.react.ReactFragment;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.views.image.ReactImageView;
import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
import com.geoscene.elevation.Raster;
import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.BoundingBox;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.CustomZoomButtonsController;
import org.osmdroid.views.MapView;
import org.osmdroid.views.Projection;
import org.osmdroid.views.overlay.ItemizedIconOverlay;
import org.osmdroid.views.overlay.Overlay;
import org.osmdroid.views.overlay.OverlayItem;
import org.osmdroid.views.overlay.Polygon;
import org.osmdroid.views.overlay.compass.CompassOverlay;
import org.osmdroid.views.overlay.compass.IOrientationConsumer;
import org.osmdroid.views.overlay.compass.IOrientationProvider;
import org.osmdroid.views.overlay.compass.InternalCompassOrientationProvider;
import org.osmdroid.views.overlay.mylocation.DirectedLocationOverlay;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class MapsFragment extends LinearLayout implements IOrientationConsumer {

    private ReactContext reactContext;
    private final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    public MapView map = null;
    private GeoPoint observer;
    private IMapController mapController;
    private DeviceSensors sensors;
    private boolean useCompassOrientation;
    private boolean useObserverLocation;
    private boolean enableZoom;
    private boolean enableLocationMarkerTap;

    private InternalCompassOrientationProvider compass;
    private Polygon bboxRectangle;

    private ItemizedIconOverlay<OverlayItem> locationMarkers = null;
//    private OrientationProvider orientationProvider;

    private static final long ORIENTATION_CHANGE_ANIMATION_SPEED = 200L;

    public MapsFragment(ThemedReactContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        Configuration.getInstance().load(reactContext, PreferenceManager.getDefaultSharedPreferences(reactContext));
        inflate(reactContext, R.layout.map_layout, this);
        map = (MapView) findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.WIKIMEDIA);


        sensors = DeviceSensorsManager.initialize(reactContext);
        mapController = map.getController();

        Log.d("TEST", String.valueOf(sensors.getGeomagneticField()));
        map.invalidate();
    }

    public void setUseCompassOrientation(boolean useCompassOrientation) {
        this.useCompassOrientation = useCompassOrientation;
        if(useCompassOrientation) {
            compass = new InternalCompassOrientationProvider(reactContext);
            CompassOverlay compassOverlay = new CompassOverlay(reactContext, compass, map);
            compassOverlay.enableCompass();
            map.getOverlays().add(compassOverlay);
            compass.startOrientationProvider(this);
        }
    }

    public void setUseObserverLocation(boolean useObserverLocation) {
        this.useObserverLocation = useObserverLocation;
        if(useObserverLocation) {
            MyLocationNewOverlay mLocationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(reactContext), map);
            mLocationOverlay.setEnableAutoStop(false);
            mLocationOverlay.enableMyLocation();
            mLocationOverlay.enableFollowLocation();
            map.getOverlays().add(mLocationOverlay);
        }
    }

    public void setEnableZoom(boolean enableZoom) {
        this.enableZoom = enableZoom;
        map.getZoomController().setVisibility(enableZoom? CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT : CustomZoomButtonsController.Visibility.NEVER);
        if(enableZoom) {
            map.setMultiTouchControls(true);
        }
    }

    public void setEnableLocationMarkerTap(boolean enableLocationMarkerTap) {
        this.enableLocationMarkerTap = enableLocationMarkerTap;
        Log.d("LOCATION_TAP", String.valueOf(enableLocationMarkerTap));
        if(enableLocationMarkerTap) {
            Overlay overlay = new Overlay() {
                @Override
                public boolean onSingleTapConfirmed(MotionEvent e, MapView mapView) {
                    Projection proj = mapView.getProjection();
                    GeoPoint loc = (GeoPoint) proj.fromPixels((int) e.getX(), (int) e.getY());
                    double longitude = loc.getLongitude();
                    double latitude = loc.getLatitude();
                    dispatchSingleTapLocation(latitude, longitude);

                    ArrayList<OverlayItem> markers = new ArrayList<>();
                    OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
                    //                item.setMarker(ContextCompat.getDrawable(context, R.drawable.ic_maps_marker_large));
                    markers.add(item);

                    mapView.getOverlays().remove(locationMarkers);
                    locationMarkers = new ItemizedIconOverlay<>(reactContext, markers, null);
                    mapView.getOverlays().add(locationMarkers);
                    map.invalidate();
                    return true;
                }
            };
            map.getOverlays().add(overlay);
        }
    }




    @Override
    public void onOrientationChanged(final float orientationToMagneticNorth, IOrientationProvider source) {
        // this part adjusts the desired map rotation based on device orientation and compass heading
        float t = (360 - sensors.getOrientation());
        t += t < 0 ? 360 : t > 360 ? -360 : 0;
        t = (int) t;
        t = t / 2;
        t = (int) t;
        t = t * 2;

        mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, t);
    }


    public void zoomToBoundingBox() {
        map.post(() -> {
            if (map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
                observer = new GeoPoint(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
                mapController.setCenter(observer);
                Log.d("MEASURE", map.getMeasuredHeight() + "," + map.getMeasuredWidth());
                Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
                BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
                Log.d("BBOX", bbox.toString());
                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), true, 5);
                map.invalidate();
            }
        });
    }

    public void zoomToBoundingBox(double latitude, double longitude, int radius, boolean placeMarker) {
        map.post(() -> {
            Log.d("MAP", String.valueOf(latitude));
            if (map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
                observer = new GeoPoint(latitude, longitude);
                mapController.setCenter(observer);
                Log.d("MEASURE", map.getMeasuredHeight() + "," + map.getMeasuredWidth());
                BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(latitude, longitude), radius);
//                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), true, 5);
                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), true, 5);
                List<GeoPoint> points = new ArrayList<>();
                GeoPoint pt1 = new GeoPoint(bbox.getSouth(), bbox.getWest());
                GeoPoint pt2 = pt1.destinationPoint(radius * 1000, 0);
                GeoPoint pt3 = pt2.destinationPoint(radius * 1000, 90);
                GeoPoint pt4 = pt3.destinationPoint(radius * 1000, 180);
                points.add(pt1);
                points.add(pt2);
                points.add(pt3);
                points.add(pt4);
                points.add(pt1);

                if(bboxRectangle != null)
                    map.getOverlays().remove(bboxRectangle);
                bboxRectangle = new Polygon() {
                    @Override
                    public boolean onSingleTapConfirmed(MotionEvent e, MapView mapView) {
                        Projection proj = mapView.getProjection();
                        GeoPoint loc = (GeoPoint) proj.fromPixels((int)e.getX(), (int)e.getY());
                        double longitude = loc.getLongitude();
                        double latitude = loc.getLatitude();
                        dispatchSingleTapLocation(latitude, longitude);

                        ArrayList<OverlayItem> markers = new ArrayList<>();
                        OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
//                item.setMarker(ContextCompat.getDrawable(context, R.drawable.ic_maps_marker_large));
                        markers.add(item);

                        mapView.getOverlays().remove(locationMarkers);
                        locationMarkers = new ItemizedIconOverlay<>(getContext(), markers, null);
                        mapView.getOverlays().add(locationMarkers);
                        mapView.invalidate();
                        return true;
                    }
                };
                if(placeMarker) {
                    ArrayList<OverlayItem> markers = new ArrayList<>();
                    OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
//                item.setMarker(ContextCompat.getDrawable(context, R.drawable.ic_maps_marker_large));
                    markers.add(item);
                    map.getOverlays().remove(locationMarkers);
                    locationMarkers = new ItemizedIconOverlay<>(getContext(), markers, null);
                    map.getOverlays().add(locationMarkers);
                }
                bboxRectangle.setPoints(points);
                bboxRectangle.getFillPaint().setColor(Color.parseColor("#662CA59C"));
                bboxRectangle.getOutlinePaint().setAlpha(0);
                map.getOverlays().add(bboxRectangle);
                map.invalidate();
            }
        });
    }

    public void dispatchSingleTapLocation(double latitude, double longitude) {
        WritableMap event = Arguments.createMap();
        event.putDouble("latitude", latitude);
        event.putDouble("longitude", longitude);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "mapSingleTap",
                event);
    }

    @Override
    public void onVisibilityAggregated(boolean isVisible) {
        super.onVisibilityAggregated(isVisible);
        Log.d("VISIBLE", String.valueOf(isVisible));
        if (isVisible) resume();
        else pause();
    }

    private void resume() {
        sensors.resume();
        map.onResume();
        if (useCompassOrientation) {
            compass.startOrientationProvider(this);
        }
        map.invalidate();
        zoomToBoundingBox();
    }

    private void pause() {
        map.onPause();
        sensors.pause();
        if (useCompassOrientation) {
            compass.stopOrientationProvider();
        }
        map.invalidate();
        zoomToBoundingBox();
    }
}
