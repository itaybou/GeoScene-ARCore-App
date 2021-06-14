import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;

import androidx.test.core.app.ActivityScenario;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner;

import com.geoscene.MainActivity;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;
import com.google.android.gms.location.LocationServices;

import org.junit.Assert;
import org.junit.Rule;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4ClassRunner.class)
public class DeviceSensorsManagerTest {
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityRule = new ActivityScenarioRule<>(MainActivity.class);
    Context context;
    LocationManager manager;
    private DeviceSensors sensors;


    @org.junit.Before
    public void setUp() throws Exception {
    }

    @org.junit.After
    public void tearDown() throws Exception {
    }

    @org.junit.Test
    //set emulator location to 32.0849, 34.7849 first
    public void getDeviceLocation() {
        mActivityRule.getScenario().onActivity(activity -> {
            Log.d("test", "starting test");
            Context context = activity.getApplicationContext();
            sensors = DeviceSensorsManager.getSensors(context);
            Location mockLocation = new Location(LocationManager.GPS_PROVIDER); // a string
            mockLocation.setLatitude(32.0849);  // double
            mockLocation.setLongitude(34.7849);
            mockLocation.setAltitude(100);
            mockLocation.setTime(System.currentTimeMillis());
            mockLocation.setAccuracy(1);
            LocationServices.getFusedLocationProviderClient(activity).setMockMode(true);
            LocationServices.getFusedLocationProviderClient(activity).setMockLocation(mockLocation);
            try {
                Thread.sleep(10000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            Log.d("device location : ",sensors.getDeviceLocation().toString());
            Assert.assertEquals(sensors.getDeviceLocation().getLatitude(),32.0849, 0.1);
            Assert.assertEquals(sensors.getDeviceLocation().getLongitude(),34.7849, 0.1);
        });

    }

}
