package integration_testing;

import android.content.pm.ActivityInfo;
import android.location.Location;
import android.util.Log;
import android.util.Pair;

import androidx.test.ext.junit.rules.ActivityScenarioRule;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.geoscene.MainActivity;
import com.geoscene.ar.ARFragment;
import com.geoscene.ar.ARNodesInitializer;
import com.geoscene.constants.LocationConstants;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.elevation.Raster;
import com.geoscene.elevation.open_topography.ASCIIGridParser;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.location_markers.LocationMarker;
import com.geoscene.location_markers.LocationScene;
import com.geoscene.places.Places;
import com.geoscene.places.overpass.poi.Bounds;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.places.overpass.poi.Tags;
import com.geoscene.sensors.DeviceSensors;
import com.google.ar.sceneform.ArSceneView;
import com.google.ar.sceneform.rendering.ViewRenderable;

import net.jodah.concurrentunit.Waiter;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import io.reactivex.rxjava3.core.Single;
import io.realm.RealmList;

@RunWith(MockitoJUnitRunner.Silent.class)
public class LocationNodesTest {
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityRule = new ActivityScenarioRule<>(MainActivity.class);
    ARFragment arFragment;
    @Mock
    Raster raster;
    BoundingBoxCenter bbox;
    RealmList<Element> elements;
    PointsOfInterest points;
    Element location;
    Element wayPlace;
    Raster mockRaster;
    DeviceSensors sensors;
    @Mock
    Places places;
    @Mock
    Location loc;
    ArSceneView arSceneView;
    LocationScene locationScene;



    @Before
    public void setUp(){
        MockitoAnnotations.openMocks(this);
        places = Mockito.mock(Places.class);
        sensors = Mockito.mock(DeviceSensors.class);
        raster = Mockito.mock(Raster.class);
        loc = Mockito.mock(Location.class);
        Mockito.when(sensors.getDeviceAltitude()).thenReturn(0.0);
        Mockito.when(sensors.getDeviceLocation()).thenReturn(loc);
        Mockito.when(loc.getLatitude()).thenReturn(31.660354423339427);
        Mockito.when(loc.getLongitude()).thenReturn(34.616241985407996);

    }

    private void setUpData() throws Exception{
        int[][] elevations = new int[10][10];
        for(int i =0; i<10; i++) {
            for (int j = 0; j < 10; j++) {
                if ((i == 2 || i == 3) && (j == 4 || j == 5)) {
                    elevations[i][j] = 200;
                } else if ((i == 7 || i == 8) && (j == 8 || j == 9))
                    elevations[i][j] = 100;
                else
                    elevations[i][j] = 0;
            }
        }
        mockRaster = new Raster(10,10,31.669236214253683, 34.57412730200482, 0.0082, elevations);
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "node";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        wayPlace = new Element();
        wayPlace.type = "way";
        wayPlace.lat = 32.668944014074476;
        wayPlace.lon = 36.57515727034688;
        wayPlace.tags = new Tags();
        wayPlace.tags.name = "Ashdod";
        wayPlace.bounds = new Bounds();
        elements.add(location);
        elements.add(wayPlace);
        points.elements = elements;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new org.javatuples.Pair<>(3,4));
        Mockito.when(sensors.getDeviceAltitude()).thenReturn(0.0);

    }

    private void setUpDataForViewshedFilterTest() throws Exception{
        int[][] elevations = new int[10][10];
        for(int i =0; i<10; i++) {
            for (int j = 0; j < 10; j++) {
                if (i == 3) {
                    elevations[i][j] = 700;
                } else if ((i == 1 || i == 0) && (j == 2 || j == 3))
                    elevations[i][j] = 100;
                else
                    elevations[i][j] = 0;
            }
        }
        mockRaster = new Raster(10,10,31.669236214253683, 34.57412730200482, 0.0082, elevations);
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "node";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        wayPlace = new Element();
        wayPlace.type = "way";
        wayPlace.lat = 32.668944014074476;
        wayPlace.lon = 36.57515727034688;
        wayPlace.tags = new Tags();
        wayPlace.tags.name = "Ashdod";
        wayPlace.bounds.maxlat = 32.668944014074500;
        wayPlace.bounds.minlat = 32.668944014074450;
        wayPlace.bounds.maxlon = 36.57515727034700;
        wayPlace.bounds.minlon = 36.57515727034650;
        elements.add(location);
        elements.add(wayPlace);
        points.elements = elements;
        Mockito.when(ASCIIGridParser.parseASCIIGrid(Mockito.any())).thenReturn(mockRaster);
        Mockito.when(places.searchPlaces(Mockito.any(), Mockito.any())).thenReturn(Single.just(points));
        Mockito.when(sensors.getDeviceAltitude()).thenReturn(0.0);
        Mockito.when(raster.getRowColByCoordinates(Mockito.any(Coordinate.class))).thenAnswer(
                invocation -> {
                    Coordinate argument = (Coordinate) invocation.getArguments()[0];
                    if (argument.equals(new Coordinate(31.668944014074476, 34.57515727034688))) {
                        return new Pair<>(0,4);
                    }
                    else if (argument.equals(new Coordinate(32.668944014074450, 36.57515727034650))) {
                        return new Pair<>(3,4);
                    }
                    else if (argument.equals(new Coordinate(32.668944014074500, 36.57515727034700))) {
                        return new Pair<>(3,7);
                    }
                    else
                        return new Pair<>(5,5);
                }
        );
    }


    @Test
    public void checkViewshedNoPois () throws Exception{
        setUpData();
        mActivityRule.getScenario().onActivity(activity -> {
            arSceneView = new ArSceneView(activity.getApplicationContext());
            ReactContext reactContext = ((ReactApplication) activity.getApplication()).getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
            arFragment = new ARFragment(reactContext, true, 50);
            ARNodesInitializer arNodesInitializer = new ARNodesInitializer(reactContext, sensors, arSceneView, true, 50, arFragment);
            locationScene = new LocationScene(activity, arSceneView, sensors, true);
            ArrayList<LocationMarker> myList = locationScene.mLocationMarkers;
            Log.d("myList", myList.toString());
            locationScene.setOffsetOverlapping(false);
            locationScene.setMinimalRefreshing(false);
            arNodesInitializer.setLocationScene(locationScene);
            arNodesInitializer.getAndRenderMarkerInformation();
            System.out.println(System.identityHashCode(myList));
            Assert.assertEquals(locationScene.mLocationMarkers.size(), 0);
            bbox = new BoundingBoxCenter(new Coordinate(sensors.getDeviceLocation().getAltitude(), sensors.getDeviceLocation().getLongitude()), 50);
            PersistLocationObject locationObj = StorageAccess.fetchLocationInfo(bbox);
            Assert.assertNull(locationObj);
        });
    }
}
