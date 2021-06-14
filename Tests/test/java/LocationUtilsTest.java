import com.geoscene.geography.LocationUtils;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class LocationUtilsTest {
    private double lat1;
    private double lon1;
    private double lat2;
    private double lon2;
    private double lat3;
    private double lon3;

    @Before
    public void setUp()  {
         lat1 = 31.67646787340791;
         lon1 = 34.55472956610679;
         lat2 = 31.681471267632613;
         lon2 = 34.55696116406215;
         lat3 = 31.674313044079355 ;
         lon3 = 34.55550204239083;
    }

    @Test
    public void bearing() {
        assertTrue(LocationUtils.bearing(lat1, lon1,lat1,lon1) == 0.0);
        double sol = LocationUtils.bearing(lat1, lon1,lat2,lon2);
        assertTrue(sol >= 0.0 && sol <= 90.0);
        sol = LocationUtils.bearing(lat1, lon1,lat3,lon3);
        assertTrue(sol >= 90.0 && sol <= 180.0);
        sol = LocationUtils.bearing(lat1, lon1,lat2,lon2);
        assertTrue(sol >= 0.0 && sol <= 90.0);
    }

    @Test
    public void distance(){
        double sol = LocationUtils.distance(lat1, lat2,lon1,lon2,0.0,0.0);
        assertTrue(sol >= 590.0 && sol <= 600.0);
        sol = LocationUtils.distance(lat1, lat1,lon1,lon1,0.0,0.0);
        assertTrue(sol == 0.0);
    }

}