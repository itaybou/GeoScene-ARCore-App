package com.geoscene.maps;

import android.graphics.Color;
import android.location.Location;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MotionEvent;
import android.widget.LinearLayout;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.R;
import com.geoscene.constants.LocationConstants;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.geoscene.triangulation.Triangulation;
import com.geoscene.triangulation.TriangulationData;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.LocationUtils;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.triangulation.TriangulationIntersection;

import org.osmdroid.api.IGeoPoint;
import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.BoundingBox;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.CustomZoomButtonsController;
import org.osmdroid.views.MapView;
import org.osmdroid.views.Projection;
import org.osmdroid.views.overlay.FolderOverlay;
import org.osmdroid.views.overlay.ItemizedIconOverlay;
import org.osmdroid.views.overlay.Overlay;
import org.osmdroid.views.overlay.OverlayItem;
import org.osmdroid.views.overlay.Polygon;
import org.osmdroid.views.overlay.Polyline;
import org.osmdroid.views.overlay.compass.CompassOverlay;
import org.osmdroid.views.overlay.compass.IOrientationConsumer;
import org.osmdroid.views.overlay.compass.IOrientationProvider;
import org.osmdroid.views.overlay.compass.InternalCompassOrientationProvider;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class OSMMapView extends LinearLayout implements IOrientationConsumer, LifecycleEventListener {

    private ReactContext reactContext;
    private boolean created;
    private final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    public MapView map = null;
    private GeoPoint observer;
    private IMapController mapController;
    private DeviceSensors sensors;
    private boolean useCompassOrientation;
    private boolean useTriangulation;
    private boolean useObserverLocation;
    private boolean enableZoom;
    private boolean enableLocationMarkerTap;
    private boolean enableDistanceCalculation;
    private boolean showBoundingCircle;
    private boolean isShown;

    private List<TriangulationData> triangulationData;

    private InternalCompassOrientationProvider compass;
    private Polygon bboxCircle;
    private MyLocationNewOverlay mLocationOverlay;
    private CompassOverlay compassOverlay;

    private Polyline lineOfSight;
    private FolderOverlay triangulationLines;
    private FolderOverlay distanceLines;
    private ItemizedIconOverlay<OverlayItem> triangulationPoints;
    private ItemizedIconOverlay<OverlayItem> triangulationViewers;

    private Overlay centerOverlay;
    private Overlay distanceOverlay;

    private ArrayList<OverlayItem> distanceMarkers;
    private ItemizedIconOverlay<OverlayItem> locationMarkers = null;
    private double previousAzimuth;

    private static final long ORIENTATION_CHANGE_ANIMATION_SPEED = 200L;
    private boolean animateToIncludeTriangulationPoints;
    private boolean getCenter;

    public OSMMapView(ReactContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.animateToIncludeTriangulationPoints = false;

        Configuration.getInstance().load(reactContext, PreferenceManager.getDefaultSharedPreferences(reactContext));
        inflate(reactContext, R.layout.map_layout, this);
        map = findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.getOverlays().clear();
        distanceMarkers = new ArrayList<>();

        sensors = DeviceSensorsManager.getSensors(reactContext);
        mapController = map.getController();
        reactContext.addLifecycleEventListener(this);
        zoomToBoundingBox();

        centerOverlay = new Overlay() {
            @Override
            public boolean onTouchEvent(MotionEvent event, MapView mapView) {
                IGeoPoint center = map.getMapCenter();
                dispatchCenterLocation(center.getLatitude(), center.getLongitude());
                return super.onTouchEvent(event, mapView);
            }
        };
        map.invalidate();

    }

    public void setUseCompassOrientation(boolean useCompassOrientation) {
        this.useCompassOrientation = useCompassOrientation;
        if (useCompassOrientation) {
            compass = new InternalCompassOrientationProvider(reactContext);
            compassOverlay = new CompassOverlay(reactContext, compass, map);
            compassOverlay.enableCompass();
            map.getOverlays().add(compassOverlay);
            compass.startOrientationProvider(this);
        } else {
            map.getOverlays().remove(compassOverlay);
            mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, 0.0f);
            if(compass != null) {
                compass.stopOrientationProvider();
            }
            if (lineOfSight != null)
                map.getOverlays().remove(lineOfSight);
        }
    }

    public void setIsShown(boolean shown) {
        this.isShown = shown;
    }

    public void setUseObserverLocation(boolean useObserverLocation) {
        this.useObserverLocation = useObserverLocation;
        if (useObserverLocation) {
            mLocationOverlay = new MyLocationNewOverlay(new GpsMyLocationProvider(reactContext), map);
            mLocationOverlay.setEnableAutoStop(false);
            mLocationOverlay.enableMyLocation();
            if(!useTriangulation) {
                mLocationOverlay.enableFollowLocation();
            }
            map.getOverlays().add(mLocationOverlay);
            if(getCenter) {
                IGeoPoint center = map.getMapCenter();
                dispatchCenterLocation(center.getLatitude(), center.getLongitude());
            }
        } else {
            if(mLocationOverlay != null) {
                if(mLocationOverlay.isFollowLocationEnabled()){
                    mLocationOverlay.disableFollowLocation();
                }
                map.getOverlays().remove(mLocationOverlay);
                mLocationOverlay = null;
            }
        }
    }

    public void setEnableZoom(boolean enableZoom) {
        this.enableZoom = enableZoom;
        map.getZoomController().setVisibility(enableZoom ? CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT : CustomZoomButtonsController.Visibility.NEVER);
        map.setMultiTouchControls(enableZoom);
        map.setEnabled(enableZoom);
    }

    public void setShowBoundingCircle(boolean showBoundingCircle) {
        this.showBoundingCircle = showBoundingCircle;
        if(!showBoundingCircle && bboxCircle != null) {
            map.getOverlays().remove(bboxCircle);
        }
    }

    public void setUseTriangulation(boolean useTriangulation) {
        this.useTriangulation = useTriangulation;
    }

    public void setAnimateToIncludeTriangulationPoints(boolean animateToIncludeTriangulationPoints) {
        this.animateToIncludeTriangulationPoints = animateToIncludeTriangulationPoints;
        if(!animateToIncludeTriangulationPoints) {
            zoomToBoundingBox();
        }
    }

    public void setEnableGetCenter(boolean getCenter) {
        this.getCenter = getCenter;
        if(getCenter) {
            map.getOverlays().add(centerOverlay);
            IGeoPoint center = map.getMapCenter();
            dispatchCenterLocation(center.getLatitude(), center.getLongitude());
        } else map.getOverlays().remove(centerOverlay);
    }

    public void setShowTriangulationData(TriangulationIntersection intersection, TriangulationData data, double azimuth) {
        if (mLocationOverlay != null) {
            mLocationOverlay.disableFollowLocation();
        }
        if(intersection != null) {
            map.post(() -> {
                if (map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
                    Location location = sensors.getDeviceLocation();
                    double lat = location.getLatitude(), lon = location.getLongitude();
                    observer = new GeoPoint(lat, lon);
                    List<Coordinate> myArc = Triangulation.getGeodesicArc(200, Triangulation.MAX_TRIANGULATION_DISTANCE * 1.5, lat, lon, azimuth);
                    List<Coordinate> arc = Triangulation.getGeodesicArc(200, Triangulation.MAX_TRIANGULATION_DISTANCE * 1.5, data.getLat(), data.getLon(), data.getAzimuth());

                    if (lineOfSight != null) {
                        map.getOverlays().remove(lineOfSight);
                    }

                    if (triangulationLines != null) {
                        map.getOverlays().remove(triangulationLines);
                    }

                    if (triangulationPoints != null) {
                        map.getOverlays().remove(triangulationPoints);
                    }

                    if (triangulationViewers != null) {
                        map.getOverlays().remove(triangulationViewers);
                    }
                    triangulationLines = new FolderOverlay();
                    OverlayItem marker = new OverlayItem("", "", new GeoPoint(intersection.intersection.getLat(), intersection.intersection.getLon()));
                    marker.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                    OverlayItem viewer = new OverlayItem("", "", new GeoPoint(arc.get(0).getLat(), arc.get(0).getLon()));
                    viewer.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.observer));
                    lineOfSight = new Polyline(map);
                    lineOfSight.setPoints(myArc.stream().map(c -> new GeoPoint(c.getLat(), c.getLon())).collect(Collectors.toList()));
                    lineOfSight.getOutlinePaint().setColor(Color.RED);
                    lineOfSight.getOutlinePaint().setStrokeWidth(4f);
                    map.getOverlays().add(lineOfSight);

                    Polyline polyline = new Polyline(map);
                    polyline.setPoints(arc.stream().map(c -> new GeoPoint(c.getLat(), c.getLon())).collect(Collectors.toList()));
                    polyline.getOutlinePaint().setColor(Color.BLACK);
                    polyline.getOutlinePaint().setStrokeWidth(4f);
                    triangulationLines.add(polyline);

                    triangulationPoints = new ItemizedIconOverlay<>(reactContext, new ArrayList<>(Collections.singletonList(marker)), null);
                    triangulationViewers = new ItemizedIconOverlay<>(reactContext, new ArrayList<>(Collections.singletonList(viewer)), null);
                    map.getOverlays().add(triangulationLines);
                    map.getOverlays().add(triangulationPoints);
                    map.getOverlays().add(triangulationViewers);

                    List<IGeoPoint> bboxPoints = new ArrayList<IGeoPoint>() {{
                        add(marker.getPoint());
                        add(observer);
                        add(viewer.getPoint());
                    }};
                    map.zoomToBoundingBox(getPointsBbox(bboxPoints), false, 50);
                    map.invalidate();
                }
            });
        } else {
            List<Coordinate> myArc = Triangulation.getGeodesicArc(200, Triangulation.MAX_TRIANGULATION_DISTANCE * 1.5, data.getLat(), data.getLon(), azimuth);
            if (lineOfSight != null)
                map.getOverlays().remove(lineOfSight);
            lineOfSight = new Polyline(map);
            lineOfSight.setPoints(myArc.stream().map(c -> new GeoPoint(c.getLat(), c.getLon())).collect(Collectors.toList()));
            lineOfSight.getOutlinePaint().setColor(Color.RED);
            lineOfSight.getOutlinePaint().setStrokeWidth(4f);
            map.getOverlays().add(lineOfSight);
            map.invalidate();
        }
    }

    public void setTriangulationData(List<TriangulationData> data) {
        triangulationData = data;
        triangulationData.forEach(t -> t.setTriangulationArc(Triangulation.getGeodesicArc(1000, Triangulation.MAX_TRIANGULATION_DISTANCE * 1.5, t.getLat(), t.getLon(), t.getAzimuth())));
        if(mLocationOverlay != null) {
            mLocationOverlay.disableFollowLocation();
        }
    }

    public void setEnableLocationMarkerTap(boolean enableLocationMarkerTap) {
        this.enableLocationMarkerTap = enableLocationMarkerTap;
        if (this.enableLocationMarkerTap) {
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
                    item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                    markers.add(item);

                    mapView.getOverlays().remove(locationMarkers);
                    locationMarkers = new ItemizedIconOverlay<>(reactContext, markers, null);
                    mapView.getOverlays().add(locationMarkers);
                    map.invalidate();
                    return true;
                }

                @Override
                public boolean onDoubleTapEvent(MotionEvent e, MapView mapView) {
                    return true;
                }

                @Override
                public boolean onDoubleTap(MotionEvent e, MapView pMapView) {
                    return true;
                }
            };
            map.getOverlays().add(overlay);
        }
    }

    public void setEnableDistanceCalculation(boolean enableDistanceCalculation) {
        this.enableDistanceCalculation = enableDistanceCalculation;
        if (this.enableDistanceCalculation) {
            distanceOverlay = new Overlay() {
                @Override
                public boolean onSingleTapConfirmed(MotionEvent e, MapView mapView) {
                    mapView.getOverlays().remove(locationMarkers);
                    if(distanceMarkers.size() == 2) {
                        distanceMarkers.clear();
                        mapView.getOverlays().remove(distanceLines);
                        dispatchDistance(0, true);
                    } else {
                        Projection proj = mapView.getProjection();
                        GeoPoint loc = (GeoPoint) proj.fromPixels((int) e.getX(), (int) e.getY());
                        double longitude = loc.getLongitude();
                        double latitude = loc.getLatitude();

                        OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
                        item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                        distanceMarkers.add(item);
                        locationMarkers = new ItemizedIconOverlay<>(reactContext, distanceMarkers, null);
                        drawDistanceCalculation();
                    }
                    map.invalidate();
                    return true;
                }

                @Override
                public boolean onDoubleTapEvent(MotionEvent e, MapView mapView) {
                    return true;
                }

                @Override
                public boolean onDoubleTap(MotionEvent e, MapView pMapView) {
                    return true;
                }
            };
            map.getOverlays().add(distanceOverlay);
        } else {
            distanceMarkers.clear();
            map.getOverlays().remove(locationMarkers);
            map.getOverlays().remove(distanceLines);
            map.getOverlays().remove(distanceOverlay);
        }
    }

    public void distanceWithMyLocation() {
        map.getOverlays().remove(locationMarkers);
        if(distanceMarkers.size() == 2) {
            distanceMarkers.clear();
            map.getOverlays().remove(distanceLines);
            dispatchDistance(0, true);
        } else {
            observer = new GeoPoint(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
            OverlayItem item = new OverlayItem("", "", observer);
            item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
            distanceMarkers.add(item);
            locationMarkers = new ItemizedIconOverlay<>(reactContext, distanceMarkers, null);
            drawDistanceCalculation();
        }
        map.invalidate();
    }

    public void drawDistanceCalculation() {
        if (distanceMarkers.size() == 2) {
            IGeoPoint point1 = distanceMarkers.get(0).getPoint();
            IGeoPoint point2 = distanceMarkers.get(1).getPoint();
            float aerialDistance = (float) LocationUtils.aerialDistance(point1.getLatitude(), point2.getLatitude(), point1.getLongitude(), point2.getLongitude());
            dispatchDistance(aerialDistance, false);
            Polyline polyline = new Polyline(map);
            polyline.setPoints(new ArrayList<GeoPoint>() {{
                add(new GeoPoint(point1.getLatitude(), point1.getLongitude()));
                add(new GeoPoint(point2.getLatitude(), point2.getLongitude()));
            }});
            polyline.getOutlinePaint().setColor(Color.BLACK);
            polyline.getOutlinePaint().setStrokeWidth(4f);
            distanceLines = new FolderOverlay();
            distanceLines.add(polyline);
            map.getOverlays().add(distanceLines);

        } else {
            dispatchDistance(0, true);
        }
        map.getOverlays().add(locationMarkers);
    }


    @Override
    public void onOrientationChanged(final float orientationToMagneticNorth, IOrientationProvider source) {
        // this part adjusts the desired map rotation based on device orientation and compass heading
        float azimuth = sensors.getOrientation();
        float t = (360 - azimuth);
        t += t < 0 ? 360 : t > 360 ? -360 : 0;
        t = (int) t;
        t = t / 2;
        t = (int) t;
        t = t * 2;

        if((useTriangulation || useCompassOrientation) && map.getRepository() != null && Math.abs(previousAzimuth - azimuth) >= 1e-3) { // Reduce azimuth to include only 2 digits after point changes(EPSILON DIFF)
            dispatchAzimuth(azimuth);
            if(useTriangulation) {
                calculateAndDrawTriangulations(azimuth, t);
            }

            if(!animateToIncludeTriangulationPoints && isShown) {
                mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, t);
            }
        }

        previousAzimuth = azimuth;
    }

    private void calculateAndDrawTriangulations(double azimuth, float bearing) {
        try {
            Location location = sensors.getDeviceLocation();
            double lat = location.getLatitude(), lon = location.getLongitude();
            List<Coordinate> myArc = Triangulation.getGeodesicArc(200, Triangulation.MAX_TRIANGULATION_DISTANCE * 1.5, lat, lon, azimuth);

            if (lineOfSight != null)
                map.getOverlays().remove(lineOfSight);
            lineOfSight = new Polyline(map);
            lineOfSight.setPoints(myArc.stream().map(c -> new GeoPoint(c.getLat(), c.getLon())).collect(Collectors.toList()));
            lineOfSight.getOutlinePaint().setColor(Color.RED);
            lineOfSight.getOutlinePaint().setStrokeWidth(4f);
            map.getOverlays().add(lineOfSight);

            if (triangulationLines != null) {
                map.getOverlays().remove(triangulationLines);
            }

            if (triangulationPoints != null) {
                map.getOverlays().remove(triangulationPoints);
            }

            if (triangulationViewers != null) {
                map.getOverlays().remove(triangulationViewers);
            }

            triangulationLines = new FolderOverlay();
            List<OverlayItem> markers = new ArrayList<>();
            List<OverlayItem> viewers = new ArrayList<>();
            List<TriangulationIntersection> intersections = new ArrayList<>();
            for (TriangulationData triangulation : triangulationData) {
                Coordinate intersection = Triangulation.triangulate(lat, lon, azimuth, triangulation.getLat(), triangulation.getLon(), triangulation.getAzimuth());
                if(intersection != null) {
                    double aerialDistance = LocationUtils.aerialDistance(lat, intersection.getLat(), lon, intersection.getLon());
                    if (aerialDistance < Triangulation.MAX_TRIANGULATION_DISTANCE) { // Smaller than triangulation arc
                        intersections.add(new TriangulationIntersection(triangulation.id, triangulation.name, triangulation.description, intersection.getLat(), intersection.getLon(), aerialDistance));
                        OverlayItem item = new OverlayItem("", "", new GeoPoint(intersection.getLat(), intersection.getLon()));
                        item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                        markers.add(item);
                        List<Coordinate> arc = triangulation.getTriangulationArc();

                        Coordinate viewerCoordinate = arc.get(0);

                        OverlayItem viewer = new OverlayItem("", "", new GeoPoint(viewerCoordinate.getLat(), viewerCoordinate.getLon()));
                        viewer.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.observer));
                        viewers.add(viewer);

                        Polyline polyline = new Polyline(map);
                        polyline.setPoints(arc.stream().map(c -> new GeoPoint(c.getLat(), c.getLon())).collect(Collectors.toList()));
                        polyline.getOutlinePaint().setColor(Color.BLACK);
                        polyline.getOutlinePaint().setStrokeWidth(4f);
                        triangulationLines.add(polyline);
                    }
                }
            }
            dispatchTriangulationIntersection(intersections);
            observer = new GeoPoint(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
            if (!markers.isEmpty()) {
                triangulationPoints = new ItemizedIconOverlay<>(reactContext, markers, null);
                triangulationViewers = new ItemizedIconOverlay<>(reactContext, viewers, null);
                //triangulationPoints = new ItemizedIconOverlay<>(markers, ResourcesCompat.getDrawable(getResources(), R.drawable.marker, null), null, null);
                map.getOverlays().add(triangulationLines);
                map.getOverlays().add(triangulationPoints);
                map.getOverlays().add(triangulationViewers);
            }
            List<IGeoPoint> bboxPoints = markers.stream().map(OverlayItem::getPoint).collect(Collectors.toList());
            if (bboxPoints.isEmpty() && animateToIncludeTriangulationPoints) {
                BoundingBoxCenter bbox = new BoundingBoxCenter(new Coordinate(location.getLatitude(), location.getLongitude()), LocationConstants.OBSERVER_BBOX * 2);
                mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, bearing);
            } else if (animateToIncludeTriangulationPoints) {
                bboxPoints.add(observer);
                mapController.animateTo(observer, map.getZoomLevelDouble(), ORIENTATION_CHANGE_ANIMATION_SPEED, bearing);
                map.zoomToBoundingBox(getPointsBbox(bboxPoints), true, 200, map.getZoomLevelDouble() * 100, ORIENTATION_CHANGE_ANIMATION_SPEED * 5);
            }
            map.invalidate();
            if (!markers.isEmpty()) {
                markers.clear();
                viewers.clear();
            }
        } catch (Exception ignored) {}
    }

    public void zoomToBoundingBox() {
        map.post(() -> {
            if (map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
                observer = new GeoPoint(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
                mapController.setCenter(observer);
                Coordinate observer = new Coordinate(sensors.getDeviceLocation().getLatitude(), sensors.getDeviceLocation().getLongitude());
                BoundingBoxCenter bbox = new BoundingBoxCenter(observer, LocationConstants.OBSERVER_BBOX); // CHANGE TP GLOBAL SETTINGS
                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), false, 5);
                map.zoomToBoundingBox(new BoundingBox(bbox.getNorth(), bbox.getEast(), bbox.getSouth(), bbox.getWest()), true, 5);
                if(getCenter) {
                    map.getOverlays().add(centerOverlay);
                    IGeoPoint center = map.getMapCenter();
                    dispatchCenterLocation(center.getLatitude(), center.getLongitude());
                }
                map.invalidate();
            }
        });
    }

    public void zoomToBoundingBox(double latitude, double longitude, int radius, boolean placeMarker, boolean changeCircleZoom) {
        map.post(() -> {
            if (map.getMeasuredHeight() > 0 && map.getMeasuredWidth() > 0) {
                if(latitude != -1 && longitude != -1) {
                    observer = new GeoPoint(latitude, longitude);
                    mapController.setCenter(observer);
                    if (getCenter) {
                        map.getOverlays().add(centerOverlay);
                        IGeoPoint center = map.getMapCenter();
                        dispatchCenterLocation(center.getLatitude(), center.getLongitude());
                    }
                } else observer = new GeoPoint(map.getMapCenter().getLatitude(), map.getMapCenter().getLongitude());
                List<GeoPoint> points = Polygon.pointsAsCircle(observer, radius * 1000);

                if (!points.isEmpty()) {
                    BoundingBox bbox = getPointsBbox(points);
                    map.zoomToBoundingBox(bbox, true, 5);
                    if (showBoundingCircle && changeCircleZoom) {
                        if (bboxCircle != null)
                            map.getOverlays().remove(bboxCircle);
                        bboxCircle = new Polygon() {
                            @Override
                            public boolean onSingleTapConfirmed(MotionEvent e, MapView mapView) {
                                if (enableLocationMarkerTap) {
                                    Projection proj = mapView.getProjection();
                                    GeoPoint loc = (GeoPoint) proj.fromPixels((int) e.getX(), (int) e.getY());
                                    double longitude = loc.getLongitude();
                                    double latitude = loc.getLatitude();
                                    dispatchSingleTapLocation(latitude, longitude);

                                    ArrayList<OverlayItem> markers = new ArrayList<>();
                                    OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
                                    item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                                    markers.add(item);

                                    mapView.getOverlays().remove(locationMarkers);
                                    locationMarkers = new ItemizedIconOverlay<>(getContext(), markers, null);
                                    mapView.getOverlays().add(locationMarkers);
                                    mapView.invalidate();
                                }
                                return true;
                            }
                            @Override
                            public boolean onDoubleTapEvent(MotionEvent e, MapView mapView) {
                                return true;
                            }

                            @Override
                            public boolean onDoubleTap(MotionEvent e, MapView pMapView) {
                                return true;
                            }
                        };
                        bboxCircle.setPoints(points);

                        bboxCircle.getFillPaint().setColor(Color.parseColor("#662CA59C"));
                        bboxCircle.getOutlinePaint().setAlpha(0);
                        map.getOverlays().add(bboxCircle);
                    }
                }

                if (placeMarker) {
                    ArrayList<OverlayItem> markers = new ArrayList<>();
                    OverlayItem item = new OverlayItem("", "", new GeoPoint(latitude, longitude));
                    item.setMarker(ContextCompat.getDrawable(reactContext, R.drawable.marker_small));
                    markers.add(item);
                    map.getOverlays().remove(locationMarkers);
                    locationMarkers = new ItemizedIconOverlay<>(getContext(), markers, null);
                    map.getOverlays().add(locationMarkers);
                }
                map.invalidate();
            }
        });
    }


    private <T extends IGeoPoint> BoundingBox getPointsBbox(List<T> points) {
        double north = -85.05112877980658;
        double south = 85.05112877980658;
        double west = 180;
        double east = -180;
        for (T position : points) {
            north = Math.max(position.getLatitude(), north);
            south = Math.min(position.getLatitude(), south);

            west = Math.min(position.getLongitude(), west);
            east = Math.max(position.getLongitude(), east);
        }
        return new BoundingBox(north, east, south, west);
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

    public void dispatchCenterLocation(double latitude, double longitude) {
        WritableMap event = Arguments.createMap();
        event.putDouble("latitude", latitude);
        event.putDouble("longitude", longitude);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "getCenter",
                event);
    }

    private void resume() {
        sensors.resume();
        map.onResume();
        if (useCompassOrientation) {
            compass.startOrientationProvider(this);
        }
    }

    private void pause() {
        if (useCompassOrientation) {
            compass.stopOrientationProvider();
        }
        map.onPause();
        sensors.pause();
    }

    public void dispatchAzimuth(float azimuth) {
        WritableMap event = Arguments.createMap();
        event.putDouble("azimuth", azimuth);
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "azimuth",
                event);
    }

    public void dispatchDistance(float distance, boolean cancelDistance) {
        WritableMap event = Arguments.createMap();
        if(!cancelDistance) {
            event.putDouble("distance", distance);
        }
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "distance",
                event);
    }

    private void dispatchTriangulationIntersection(List<TriangulationIntersection> intersections) {
        WritableMap event = Arguments.createMap();
        WritableArray data = Arguments.createArray();
        for(TriangulationIntersection intersection : intersections) {
            WritableMap intersectionMap = Arguments.createMap();
            intersectionMap.putString("id", intersection.id);
            intersectionMap.putString("name", intersection.name);
            intersectionMap.putString("description", intersection.description);
            intersectionMap.putDouble("latitude", intersection.intersection.getLat());
            intersectionMap.putDouble("longitude", intersection.intersection.getLon());
            intersectionMap.putDouble("distance", intersection.distance);
            data.pushMap(intersectionMap);
        }
        event.putArray("data", data);

        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "triangulationIntersections",
                event);
    }

    @Override
    public void onHostResume() {
        resume();
    }

    @Override
    public void onHostPause() {
        pause();
    }

    @Override
    public void onHostDestroy() {
    }

}
