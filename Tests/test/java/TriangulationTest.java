import com.geoscene.geography.Coordinate;
import com.geoscene.triangulation.Triangulation;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class TriangulationTest {
    private double lat0;
    private double lon0;
    private double lat1;
    private double lon1;

    @Before
    public void setUp() throws Exception {
        lat0 = 31.672596449072465;
        lon0 = 34.55056677761315;
        lat1 = 31.672158164449456;
        lon1 = 34.557046994752746;
    }

    @After
    public void tearDown() throws Exception {
    }

    @Test
    public void triangulate() {
        Assert.assertNull(Triangulation.triangulate(lat0,lon0,0,lat1,lon1,180));
        Coordinate coordinate = Triangulation.triangulate(lat0,lon0,45,lat1,lon1,0);
        Assert.assertNotNull(coordinate);
        Assert.assertTrue(coordinate.getLat() >= lat1);
        Assert.assertTrue(coordinate.getLat() >= lat0);
        Assert.assertTrue(coordinate.getLon() >= lon0 && coordinate.getLon() >= lon1);
    }

    @Test
    public void triangulateCheckCircularity() {
        Assert.assertNull(Triangulation.triangulate(lat0,lon0,0,lat0,lon0,180));
        Assert.assertNull(Triangulation.triangulate(lat0,lon0,360,lat0,lon0,180));
        Assert.assertNull(Triangulation.triangulate(lat0,lon0,720,lat0,lon0,180));
    }

    @Test
    public void triangulateCheckVertical() {
        Assert.assertNull(Triangulation.triangulate(lat0,lon0,0,lat0,lon0,90));
        Coordinate coordinate = Triangulation.triangulate(lat0,lon0,90,lat1,lon1,0);
        Assert.assertNotNull(coordinate);
        Assert.assertTrue(coordinate.getLon() >= lon0 && coordinate.getLon() >= lon1);
        Assert.assertTrue(coordinate.getLat() >= lat1);
        Assert.assertTrue(coordinate.getLat() <= lat0);
    }

}