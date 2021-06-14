package api_tests;

import android.location.Location;

import com.geoscene.geography.Coordinate;
import com.geoscene.places.Places;
import com.geoscene.sensors.DeviceSensors;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import io.reactivex.rxjava3.schedulers.Schedulers;

public class OverpassApiTests {
    String expectedResult;
    Places places;
    @Mock
    DeviceSensors sensors;
    @InjectMocks
    Location location;

    @Before
    public void setUp(){
        places = new Places();
        sensors = Mockito.mock(DeviceSensors.class);
        location = Mockito.mock(Location.class);
    }

    @After
    public void tearDown(){
        Mockito.reset(sensors,location);
    }

    @Test
    public void successApiCallTest(){
        setUpSuccessTest();
        CountDownLatch latch = new CountDownLatch(1);
        places.searchPlaces(new Coordinate(31.668396136384636, 34.5755864237047),5)
                .doOnSuccess(s->{
                    latch.countDown();
                    expectedResult = "SUCCESS";
                } )
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe();
        try {
            latch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Assert.assertEquals(expectedResult, "SUCCESS");

    }

    @Test
    public void errorApiCallTest(){
        setUpErrorTest();
        CountDownLatch latch = new CountDownLatch(1);
        places.searchPlaces(new Coordinate(100.668396136384636, 250.5755864237047),5)
                .doOnSuccess(s->{
                    latch.countDown();
                    expectedResult = "SUCCESS";
                } )
                .doOnError(e-> {
                    latch.countDown();
                    expectedResult = "ERROR";
                })
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe(s-> System.out.println(s.toString()), throwable -> {
                    latch.countDown();
                    expectedResult = "ERROR";
                });


        try {
            latch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Assert.assertEquals(expectedResult, "ERROR");

    }

    private void setUpSuccessTest(){
        Mockito.when(location.getLatitude()).thenReturn(31.668396136384636);
        Mockito.when(location.getLongitude()).thenReturn(34.5755864237047);
        Mockito.when(sensors.getDeviceLocation()).thenReturn(location);
    }
    private void setUpErrorTest(){
        Mockito.when(location.getLatitude()).thenReturn(100.668396136384636);
        Mockito.when(location.getLongitude()).thenReturn(250.5755864237047);
        Mockito.when(sensors.getDeviceLocation()).thenReturn(location);
    }

}

