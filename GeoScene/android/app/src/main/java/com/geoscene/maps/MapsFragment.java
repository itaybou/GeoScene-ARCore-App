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
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
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

public class MapsFragment extends Fragment implements IOrientationConsumer {

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

    private float previousBearing = 0;
    
    private static final long ORIENTATION_CHANGE_ANIMATION_SPEED = 200L;

    public MapsFragment(ReactContext reactContext, boolean useCompassOrientation, boolean useObserverLocation, boolean enableZoom, boolean enableLocationMarkerTap) {
        this.useCompassOrientation = useCompassOrientation;
        this.useObserverLocation = useObserverLocation;
        this.enableZoom = enableZoom;
        this.enableLocationMarkerTap = enableLocationMarkerTap;
        this.reactContext = reactContext;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //handle permissions first, before map is created. not depicted here

        //load/initialize the osmdroid configuration, this can be done
        Context context = getContext();
        Configuration.getInstance().load(context, PreferenceManager.getDefaultSharedPreferences(context));
        View view = inflater.inflate(R.layout.map_layout, container, false);
        //setting this before the layout is inflated is a good idea
        //it 'should' ensure that the map has a writable location for the map cache, even without permissions
        //if no tiles are displayed, you can try overriding the cache path using Configuration.getInstance().setCachePath
        //see also StorageUtils
        //note, the load method also sets the HTTP User Agent to your application's package name, abusing osm's
        //tile servers will get you banned based on this string

        //inflate and create the map

        map = (MapView) view.findViewById(R.id.map);
        //map.setTileSource(TileSourceFactory.WIKIMEDIA);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.getZoomController().setVisibility(enableZoom? CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT : CustomZoomButtonsController.Visibility.NEVER);
        if(enableZoom) {
            map.setMultiTouchControls(true);
        }

        sensors = DeviceSensorsManager.initialize(context);
        mapController = map.getController();

        Log.d("TEST", String.valueOf(sensors.getGeomagneticField()));

        if(useObserverLocation) {
            MyLocationNewOverlay mLocationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(context), map);
            mLocationOverlay.setEnableAutoStop(false);
            mLocationOverlay.enableMyLocation();
            mLocationOverlay.enableFollowLocation();
            map.getOverlays().add(mLocationOverlay);
        }

//        map.addOnFirstLayoutListener((v, left, top, right, bottom) -> {
//            Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//            BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
//            Log.d("BBOX", bbox.toString());
//            map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
//            map.invalidate();
//        });

        if(useCompassOrientation) {
            compass = new InternalCompassOrientationProvider(context);
            CompassOverlay compassOverlay = new CompassOverlay(context, compass, map);
            compassOverlay.enableCompass();
            map.getOverlays().add(compassOverlay);
        }

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
                    locationMarkers = new ItemizedIconOverlay<>(context, markers, null);
                    mapView.getOverlays().add(locationMarkers);
                    mapView.invalidate();
                    return true;
                }
            };
            map.getOverlays().add(overlay);
        }

        map.invalidate();




//        map.addOnFirstLayoutListener((v, left, top, right, bottom) -> {
//            Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//            BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
//            Log.d("BBOX", bbox.toString());
//            map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
//            map.invalidate();
//        });

//        DirectedLocationOverlay overlay = new DirectedLocationOverlay(getActivity());
//        overlay.setShowAccuracy(true);
//        map.getOverlays().add(overlay);

        requestPermissionsIfNecessary(new String[] {
                // if you need to show the current location, uncomment the line below
                Manifest.permission.ACCESS_FINE_LOCATION,
                // WRITE_EXTERNAL_STORAGE is required in order to show the map
                Manifest.permission.WRITE_EXTERNAL_STORAGE
        });
        //getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);


    }

    @Override
    public void onOrientationChanged(final float orientationToMagneticNorth, IOrientationProvider source) {
//        GeomagneticField gf = sensors.getGeomagneticField();
//        float trueNorth = orientationToMagneticNorth + gf.getDeclination();
//        if (trueNorth > 360.0f) {
//            trueNorth = trueNorth - 360.0f;
//        }
//
//        //this part adjusts the desired map rotation based on device orientation and compass heading
        float t = (360 - sensors.getOrientation());
        t += t < 0 ? 360 : t > 360 ? -360 : 0;
//        //help smooth everything out
        t = (int) t;
        t = t / 1;
        t = (int) t;
        t = t * 1;

        mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, t);
    }


    @Override
    public void onResume() {
        super.onResume();
        sensors.resume();
        //this will refresh the osmdroid configuration on resuming.
        //if you make changes to the configuration, use
        //SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this);
        //Configuration.getInstance().load(this, PreferenceManager.getDefaultSharedPreferences(this));
        map.onResume(); //needed for compass, my location overlays, v6.0.0 and up
        if(useCompassOrientation) {
            compass.startOrientationProvider(this);
        }
        //getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    }

    @Override
    public void onPause() {
        super.onPause();
        map.onPause();  //needed for compass, my location overlays, v6.0.0 and up
        sensors.pause();
        //this will refresh the osmdroid configuration on resuming.
        //if you make changes to the configuration, use
        //SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this);
        //Configuration.getInstance().save(this, prefs);
        if(useCompassOrientation) {
            compass.stopOrientationProvider();
        }
        //getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (int i = 0; i < grantResults.length; i++) {
            permissionsToRequest.add(permissions[i]);
        }
        if (permissionsToRequest.size() > 0) {
            ActivityCompat.requestPermissions(
                    getActivity(),
                    permissionsToRequest.toArray(new String[0]),
                    REQUEST_PERMISSIONS_REQUEST_CODE);
        }
    }

    private void requestPermissionsIfNecessary(String[] permissions) {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(getActivity(), permission)
                    != PackageManager.PERMISSION_GRANTED) {
                // Permission is not granted
                permissionsToRequest.add(permission);
            }
        }
        if (permissionsToRequest.size() > 0) {
            ActivityCompat.requestPermissions(
                    getActivity(),
                    permissionsToRequest.toArray(new String[0]),
                    REQUEST_PERMISSIONS_REQUEST_CODE);
        }
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

//        map.post(() -> {
//                    CellType[][] viewshed = Raster.getViewshed();
//
//        for(int y = 0; y < viewshed.length; y++) {
//            for(int x = 0; x < viewshed[0].length; x++) {
//                Coordinate coord = BoundingBoxCenter.getLatLonByRowCol(x, y, Raster.getyLowerLeftCorner(), Raster.getxLowerLeftCorner());
//                BoundingBoxCenter boundingBoxCenter = new BoundingBoxCenter(coord, 0.045);
//                List<GeoPoint> points = new ArrayList<>();
//                GeoPoint pt1 = new GeoPoint(boundingBoxCenter.getSouth(), boundingBoxCenter.getWest());
//                GeoPoint pt2 = pt1.destinationPoint(90, 0);
//                GeoPoint pt3 = pt2.destinationPoint(90, 90);
//                GeoPoint pt4 = pt3.destinationPoint(90, 180);
//                points.add(pt1);
//                points.add(pt2);
//                points.add(pt3);
//                points.add(pt4);
//                points.add(pt1);
//
//                bboxRectangle = new Polygon();
//                polygon.setPoints(points);
//                polygon.getFillPaint().setColor(Color.BLACK);
//                map.getOverlays().add(polygon);
//            }
//        }
//        map.invalidate();
//        });
//    }
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
}
