package integration_tests;

import android.location.Location;
import android.util.Log;

import androidx.annotation.NonNull;

import com.geoscene.elevation.Elevation;
import com.geoscene.elevation.Raster;
import com.geoscene.geography.Coordinate;
import com.geoscene.places.Places;
import com.geoscene.places.fov_analyzer.FOVAnalyzer;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.sensors.DeviceSensors;

import org.javatuples.Pair;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.observers.DisposableSingleObserver;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class VisibleLocationTest {
    Elevation elevation;
    Places places;
    List<Pair<Element, Coordinate>> sol;
    String expectedResult;
    PointsOfInterest points;
    Raster raster;

    @Before
    public void setUp(){
        elevation = new Elevation();
        places = new Places();

    }


    @Test
    public void visibleLocationReturnedTest() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(2);
        places.searchPlaces(new Coordinate(31.668396136384636, 34.5755864237047),5)
                .doOnSuccess(s->{
                    latch.countDown();
                    expectedResult = "SUCCESS";
                    points = s;
                } )
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe();

        elevation.fetchElevationRaster(new Coordinate(31.668396136384636, 34.5755864237047),5,false)
                .doOnSuccess(s -> {
                    latch.countDown();
                    expectedResult = "SUCCESS";
                    raster = s;
                })
                .subscribeOn(Schedulers.io())
                .observeOn(Schedulers.io()).
                subscribe();
        try {
            latch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        Assert.assertTrue(sol.size() > 0);

    }
}
