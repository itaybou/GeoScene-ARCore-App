import android.content.Context;
import android.location.Location;
import android.util.Log;

import androidx.test.ext.junit.rules.ActivityScenarioRule;

import com.geoscene.MainActivity;
import com.geoscene.data_access.PersistLocationObject;
import com.geoscene.data_access.StorageAccess;
import com.geoscene.elevation.Raster;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.places.overpass.poi.Bounds;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.places.overpass.poi.Tags;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import io.realm.Realm;
import io.realm.RealmConfiguration;
import io.realm.RealmList;
import io.realm.exceptions.RealmException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class StorageAccessTest {
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityRule = new ActivityScenarioRule<>(MainActivity.class);
    BoundingBoxCenter bbox;
    BoundingBoxCenter bigBbox;
    BoundingBoxCenter strangeBbox;
    Raster raster;
    RealmConfiguration realmConfiguration;
    PointsOfInterest pois;


    @Before
    public void setUp(){
        pois = new PointsOfInterest();
        pois.elements = new RealmList<>();
        Element element = new Element();
        element.tags = new Tags();
        element.bounds = new Bounds();
        pois.elements.add(element);
        bbox = new BoundingBoxCenter(new Coordinate(31.669236214253683, 34.57412730200482), 5);
        bigBbox = new BoundingBoxCenter(new Coordinate(31.669236214253683, 34.57412730200482), 10);
        strangeBbox = new BoundingBoxCenter(new Coordinate(31.0, 34.57412730200482), 5);
        raster = new Raster(10,10,31.669236214253683, 34.57412730200482, 0.0082,new int[10][10]);
        realmConfiguration = new RealmConfiguration.Builder()
                .name("default.realm")
                .schemaVersion(0)
                .deleteRealmIfMigrationNeeded()
                .build();

        Realm.setDefaultConfiguration(realmConfiguration); // Make this Realm the default
    }

    @After
    public void tearDown() throws InterruptedException {
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.beginTransaction();
            // delete all realm objects
            realm.deleteAll();
            //commit realm changes
            realm.commitTransaction();
        }
        catch (RealmException e) {
            Log.e("Error", e.getMessage());
        }
    }

    @Test
    public void fetchLocationInfo() {
        mActivityRule.getScenario().onActivity(activity -> {
            Context context = activity.getApplicationContext();
            StorageAccess.storeCacheLocationInfo(context,bbox,raster,pois);
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            PersistLocationObject persist = StorageAccess.fetchLocationInfo(bbox);
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            assertEquals(persist.bbox.east,bbox.getEast(),0.0);
            assertEquals(persist.bbox.west,bbox.getWest(),0.0);
            assertEquals(persist.bbox.north,bbox.getNorth(),0.0);
            assertEquals(persist.bbox.south,bbox.getSouth(),0.0);
            long timestamp = persist.lastAccessTimestamp;
            Log.d("makore", String.valueOf(timestamp));
            persist = StorageAccess.fetchLocationInfo(bbox);
            Log.d("makore", String.valueOf(persist.lastAccessTimestamp));
            assertTrue(persist.lastAccessTimestamp > timestamp);




        });

    }

    @Test
    public void storeCacheLocationInfo() {
        mActivityRule.getScenario().onActivity(activity -> {
            Context context = activity.getApplicationContext();
            StorageAccess.storeCacheLocationInfo(context,bbox,raster,pois);
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            PersistLocationObject persist = StorageAccess.fetchLocationInfo(bbox);
            assertNotNull(persist);
            BoundingBoxCenter fakeBbox = new BoundingBoxCenter(new Coordinate(80.4222,80.222),50);
            persist = StorageAccess.fetchLocationInfo(fakeBbox);
            assertNull(persist);
        });
    }

    @Test
    public void checkCacheAndRetrieve(){
        mActivityRule.getScenario().onActivity(activity -> {
            Context context = activity.getApplicationContext();
            StorageAccess.storeCacheLocationInfo(context,bigBbox,raster,pois);
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            PersistLocationObject persist = StorageAccess.fetchLocationInfo(bbox);
            assertEquals(persist.bbox.east, bigBbox.getEast(),0.0);
            assertEquals(persist.bbox.west, bigBbox.getWest(),0.0);
            assertEquals(persist.bbox.south, bigBbox.getSouth(),0.0);
            assertEquals(persist.bbox.north, bigBbox.getNorth(),0.0);
            persist = StorageAccess.fetchLocationInfo(strangeBbox);
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            assertNull(persist);
        });

    }

    @Test
    public void deleteCachedLocationInfoByTimestamp() {
        mActivityRule.getScenario().onActivity(activity -> {
            Context context = activity.getApplicationContext();
            StorageAccess.storeCacheLocationInfo(context,bbox,raster,pois);
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            PersistLocationObject persist = StorageAccess.fetchLocationInfo(bbox);
            assertNotNull(persist);
            StorageAccess.deleteCachedLocationInfoByTimestamp(context,new Date().getTime() + TimeUnit.MINUTES.toMillis(30));
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            persist = StorageAccess.fetchLocationInfo(bbox);
            assertNull(persist);
        });

    }

}