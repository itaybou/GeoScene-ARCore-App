package com.geoscene.maps;

import android.Manifest;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.GeomagneticField;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
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

public class MapsFragment extends Fragment implements IOrientationConsumer {

    private final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    public SideMapView map = null;
    private GeoPoint observer;
    private IMapController mapController;
    private DeviceSensors sensors;

    private float previousBearing = 0;
    
    private static final long ORIENTATION_CHANGE_ANIMATION_SPEED = 200L;

    private InternalCompassOrientationProvider compass;
//    private OrientationProvider orientationProvider;

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

        map = (SideMapView) view.findViewById(R.id.map);
        //map.setTileSource(TileSourceFactory.WIKIMEDIA);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.getZoomController().setVisibility(CustomZoomButtonsController.Visibility.NEVER);

        sensors = DeviceSensorsManager.initialize(context);
        mapController = map.getController();



        Log.d("TEST", String.valueOf(sensors.getGeomagneticField()));

        MyLocationNewOverlay mLocationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(context), map);
        mLocationOverlay.setEnableAutoStop(false);
        mLocationOverlay.enableMyLocation();
        mLocationOverlay.enableFollowLocation();
        map.getOverlays().add(mLocationOverlay);

//        map.addOnFirstLayoutListener((v, left, top, right, bottom) -> {
//            Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
//            BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX);
//            Log.d("BBOX", bbox.toString());
//            map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
//            map.invalidate();
//        });

        compass = new InternalCompassOrientationProvider(context);
        CompassOverlay compassOverlay = new CompassOverlay(context, compass, map);
        compassOverlay.enableCompass();
        map.getOverlays().add(compassOverlay);

        BoundingBoxCenter boundingBoxCenter = new BoundingBoxCenter(new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude()), 0.045);
        List<GeoPoint> points = new ArrayList<>();
        GeoPoint pt1 = new GeoPoint(boundingBoxCenter.getSouth(), boundingBoxCenter.getWest());
        GeoPoint pt2 = pt1.destinationPoint(90, 0);
        GeoPoint pt3 = pt2.destinationPoint(90, 90);
        GeoPoint pt4 = pt3.destinationPoint(90, 180);
        points.add(pt1);
        points.add(pt2);
        points.add(pt3);
        points.add(pt4);
        points.add(pt1);

        Polygon polygon = new Polygon();
        polygon.setPoints(points);
        polygon.getFillPaint().setColor(Color.BLACK);
        map.getOverlays().add(polygon);

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
        compass.startOrientationProvider(this);
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
        compass.stopOrientationProvider();
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
            if(map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
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
}
