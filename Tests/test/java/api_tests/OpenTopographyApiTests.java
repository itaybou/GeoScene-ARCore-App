package api_tests;

import com.geoscene.elevation.open_topography.OpenTopographyClient;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;


import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import io.reactivex.rxjava3.schedulers.Schedulers;

public class OpenTopographyApiTests {
    OpenTopographyClient client;
    BoundingBoxCenter bbox;
    @Mock
    BoundingBoxCenter mockedBbox;
    String expectedResult;

    @Before
    public void setUp(){
        client = new OpenTopographyClient();
        mockedBbox = Mockito.mock(BoundingBoxCenter.class);
        bbox = new BoundingBoxCenter(new Coordinate(31.669236214253683, 34.57412730200482), 5);
        Mockito.when(mockedBbox.getSouth()).thenReturn(80.57206736543064);
        Mockito.when(mockedBbox.getNorth()).thenReturn(31.669236214253683);
        Mockito.when(mockedBbox.getWest()).thenReturn(31.669236214253683);
        Mockito.when(mockedBbox.getEast()).thenReturn(34.57412730200482);
        Mockito.when(mockedBbox.getCenter()).thenReturn(new Coordinate(31.669236214253683, 34.57412730200482));
    }

    @After
    public void tearDown(){
        Mockito.reset(mockedBbox);
    }

    @Test
    public void successApiCallTest() {
        CountDownLatch latch = new CountDownLatch(2);
        client.fetchTopographyData(bbox, true)
                .doOnSuccess(s -> {
                    latch.countDown();
                    expectedResult = "SUCCESS";
                })
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe();
        client.fetchTopographyData(bbox, false)
                .doOnSuccess(s -> {
                    latch.countDown();
                    expectedResult = "SUCCESS";
                })
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe();
        try {
            latch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Assert.assertEquals(expectedResult, "SUCCESS");
        Assert.assertEquals(latch.getCount(), 0);

    }

    @Test
    public void errorApiCallTest() {
        CountDownLatch latch = new CountDownLatch(1);
        client.fetchTopographyData(mockedBbox, false)
                .doOnSuccess(s -> {
                    latch.countDown();
                    expectedResult = "SUCCESS";
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
        Assert.assertEquals(latch.getCount(), 0);

    }
}
