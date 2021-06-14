import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.hardware.SensorEventListener;

import androidx.test.InstrumentationRegistry;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner;
import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.AndroidJUnit4;

import com.geoscene.MainActivity;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.sensors.DeviceSensorsManager;

import androidx.test.runner.AndroidJUnit4;
import androidx.test.runner.AndroidJUnitRunner;


import org.javatuples.Pair;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.Assert;
import org.junit.runner.RunWith;


public class DeviceOrientationTest {
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityRule = new ActivityScenarioRule<>(MainActivity.class);
    private DeviceSensors sensors;


    @After
    public void tearDown() throws Exception {
        Thread.sleep(2000);
    }

    @Test
    public void getDeviceOrientationLandscape() {
        mActivityRule.getScenario().onActivity(activity -> {
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            Context context = activity.getApplicationContext();
            sensors = DeviceSensorsManager.getSensors(context);
            Pair<Integer, Integer> sol = sensors.getDeviceOrientation();
            Assert.assertEquals((int) sol.getValue1(), ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        });

    }

    @Test
    public void getDeviceOrientationPortrait() {
        mActivityRule.getScenario().onActivity(activity -> {
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            Context context = activity.getApplicationContext();
            sensors = DeviceSensorsManager.getSensors(context);
            Pair<Integer, Integer> sol = sensors.getDeviceOrientation();
            Assert.assertEquals((int) sol.getValue1(), ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        });

    }

    @Test
    public void getDeviceOrientationReversedPortrait() {
        mActivityRule.getScenario().onActivity(activity -> {
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT);
            Context context = activity.getApplicationContext();
            sensors = DeviceSensorsManager.getSensors(context);
            Pair<Integer, Integer> sol = sensors.getDeviceOrientation();
            Assert.assertEquals((int) sol.getValue1(), ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT);
        });

    }

    @Test
    public void getDeviceOrientationReversedLandscape() {
        mActivityRule.getScenario().onActivity(activity -> {
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE);
            Context context = activity.getApplicationContext();
            sensors = DeviceSensorsManager.getSensors(context);
            Pair<Integer, Integer> sol = sensors.getDeviceOrientation();
            Assert.assertEquals((int) sol.getValue1(), ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE);
        });

    }

}