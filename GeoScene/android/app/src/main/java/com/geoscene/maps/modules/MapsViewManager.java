package com.geoscene.maps.modules;

import android.graphics.Color;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.geoscene.geography.Coordinate;
import com.geoscene.maps.OSMMapView;
import com.geoscene.triangulation.TriangulationData;
import com.geoscene.react.ArrayUtil;
import com.geoscene.triangulation.TriangulationIntersection;

import org.javatuples.Pair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MapsViewManager extends SimpleViewManager<OSMMapView> {

    public static final String REACT_TAG = "MapView";
    private ReactContext reactContext;

    public final int COMMAND_ZOOM_BBOX = 0;
    public final int COMMAND_ZOOM_SET_BBOX = 1;
    public final int COMMAND_DIST_MY_LOCATION = 2;
    public final int COMMAND_ZOOM_IN_OUT = 3;

    public MapsViewManager(ReactApplicationContext reactContext) {
        super();
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_TAG;
    }

    @NonNull
    @Override
    protected OSMMapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        OSMMapView layout = new OSMMapView(reactContext);
        layout.setBackgroundColor(Color.BLACK);
        return layout;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "ZOOM_BBOX", COMMAND_ZOOM_BBOX,
                "ZOOM_SET_BBOX", COMMAND_ZOOM_SET_BBOX,
                "DIST_MY_LOCATION", COMMAND_DIST_MY_LOCATION,
                "ZOOM_IN_OUT", COMMAND_ZOOM_IN_OUT
        );
    }

    @Override
    public void receiveCommand(@NonNull OSMMapView root, String commandId, @Nullable ReadableArray args) {
        Log.d(REACT_TAG, "command received: " + commandId + " view id: " + args);
        super.receiveCommand(root, commandId, args);
        int commandNo = Integer.parseInt(commandId);
        switch (commandNo) {
            case COMMAND_ZOOM_BBOX:
                root.zoomToBoundingBox(args != null && args.size() > 0 ? args.getDouble(0) : null);
                break;
            case COMMAND_ZOOM_SET_BBOX:
                root.zoomToBoundingBox(args.getDouble(0), args.getDouble(1), args.getInt(2), args.getBoolean(3), true);
                break;
            case COMMAND_DIST_MY_LOCATION:
                root.distanceWithMyLocation();
                break;
            case COMMAND_ZOOM_IN_OUT:
                root.zoomToBoundingBox(-1, -1, args.getInt(0), args.getBoolean(1), args.getBoolean(2));
                break;
            default:
                Log.w(REACT_TAG, "Invalid command recieved from ReactNative");
        }
    }

    @ReactProp(name = "isShown", defaultBoolean = false)
    public void setIsShown(OSMMapView view, boolean shown) {
        view.setIsShown(shown);
    }

    @ReactProp(name = "enableLocationTap", defaultBoolean = false)
    public void setEnableLocationMarkerTap(OSMMapView view, boolean enableLocationTap) {
        view.setEnableLocationMarkerTap(enableLocationTap);
    }

    @ReactProp(name = "enableZoom", defaultBoolean = false)
    public void setEnableZoom(OSMMapView view, boolean enableZoom) {
        view.setEnableZoom(enableZoom);
    }

    @ReactProp(name = "useObserverLocation", defaultBoolean = false)
    public void setUseObserverLocation(OSMMapView view, boolean useObserverLocation) {
        view.setUseObserverLocation(useObserverLocation);
    }

    @ReactProp(name = "useCompassOrientation", defaultBoolean = false)
    public void setUseCompassOrientation(OSMMapView view, boolean useCompassOrientation) {
        view.setUseCompassOrientation(useCompassOrientation);
    }

    @ReactProp(name = "showBoundingCircle", defaultBoolean = true)
    public void setShowBoundingCircle(OSMMapView view, boolean showBoundingCircle) {
        view.setShowBoundingCircle(showBoundingCircle);
    }

    @ReactProp(name = "enableGetCenter", defaultBoolean = true)
    public void setEnableGetCenter(OSMMapView view, boolean getCenter) {
        view.setEnableGetCenter(getCenter);
    }

    @ReactProp(name = "enableDistanceCalculation", defaultBoolean = true)
    public void setEnableDistanceCalculation(OSMMapView view, boolean enableDistanceCalculation) {
        view.setEnableDistanceCalculation(enableDistanceCalculation);
    }

    @ReactProp(name = "useTriangulation", defaultBoolean = false)
    public void setUseTriangulation(OSMMapView view, boolean useTriangulation) {
        view.setUseTriangulation(useTriangulation);
    }

    @ReactProp(name = "animateToIncludeTriangulationPoints", defaultBoolean = false)
    public void setAnimateToIncludeTriangulationPoints(OSMMapView view, boolean animateToIncludeTriangulationPoints) {
        view.setAnimateToIncludeTriangulationPoints(animateToIncludeTriangulationPoints);
    }

    @ReactProp(name = "visibleLocations")
    public void setVisibleLocations(OSMMapView view, ReadableArray visibleLocations) throws JSONException {
        if (visibleLocations != null) {
            List<Pair<String, Coordinate>> data = new ArrayList<>();
            JSONArray j = ArrayUtil.toJSONArray(visibleLocations);
            for (int i = 0; i < j.length(); i++) {
                JSONObject o = j.getJSONObject(i);
                data.add(new Pair<>(o.getString("name"), new Coordinate(o.getDouble("latitude"), o.getDouble("longitude"))));
            }
            view.setVisibleLocations(data);
        }
    }

    @ReactProp(name = "triangulationData")
    public void setTriangulationData(OSMMapView view, ReadableArray triangulationData) throws JSONException {
        if (triangulationData != null) {
            List<TriangulationData> data = new ArrayList<>();
            JSONArray j = ArrayUtil.toJSONArray(triangulationData);
            for (int i = 0; i < j.length(); i++) {
                JSONObject o = j.getJSONObject(i);
                data.add(new TriangulationData(o.getString("id"), o.getString("name"), o.getString("description"), o.getDouble("latitude"), o.getDouble("longitude"), o.getDouble("azimuth")));
            }
            view.setTriangulationData(data);
        }
    }

    @ReactProp(name = "showTriangulationData")
    public void setShowTriangulationData(OSMMapView view, ReadableArray triangulationData) throws JSONException {
        if (triangulationData != null) {
            JSONArray j = ArrayUtil.toJSONArray(triangulationData);
            System.out.println(j.toString());
            if(j.length() == 3) {
                JSONObject intersection = j.getJSONObject(0);
                JSONObject point = j.getJSONObject(1);
                double azimuth = j.getDouble(2);
                view.setShowTriangulationData(
                        new TriangulationIntersection(intersection.getString("id"), intersection.getString("name"), intersection.getString("description"),
                                intersection.getDouble("latitude"), intersection.getDouble("longitude"), intersection.getDouble("distance")),
                        new TriangulationData(point.getString("id"), point.getString("name"), point.getString("description"),
                                point.getDouble("latitude"), point.getDouble("longitude"), point.getDouble("azimuth")), azimuth);
            } else {
                System.out.println(j.toString());
                JSONObject point = j.getJSONObject(0);
                double azimuth = j.getDouble(1);
                view.setShowTriangulationData(
                      null,
                        new TriangulationData(null, null, null, point.getDouble("latitude"), point.getDouble("longitude"), 0), azimuth);
            }
        }
    }


    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "mapSingleTap",
                MapBuilder.of("registrationName", "onMapSingleTap"),
                "getCenter",
                MapBuilder.of("registrationName", "onMapCenterChanged"),
                "azimuth",
                MapBuilder.of("registrationName", "onOrientationChanged"),
                "distance",
                MapBuilder.of("registrationName", "onDistanceCalculation"),
                "triangulationIntersections",
                MapBuilder.of("registrationName", "onTriangulationIntersection"),
                "locationTap",
                MapBuilder.of("registrationName", "onLocationTap")
        );
    }
}
