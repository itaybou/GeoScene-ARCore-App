import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;


import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class BoundingBoxCenterTest {
    private BoundingBoxCenter bbox;
    private BoundingBoxCenter bigBbox;
    private BoundingBoxCenter strangeBbox;

    @Before
    public void setUp() throws Exception {
        bbox = new BoundingBoxCenter(new Coordinate(31.658920778410934, 34.633727747057094), 5.0);
        bigBbox = new BoundingBoxCenter(new Coordinate(31.669236214253683, 34.57412730200482), 10);
        strangeBbox = new BoundingBoxCenter(new Coordinate(31.0, 34.57412730200482), 5);
    }

    @Test
    public void getCenter() {
        assertEquals(bbox.getCenter().getLat(), 31.658920778410934, 0.00001);
        assertEquals(bbox.getCenter().getLon(), 34.633727747057094, 0.00001);

    }

    @Test
    public void checkDistance() {
        double distance = distance(bbox.getSouth(), bbox.getWest(), 31.658920778410934, 34.633727747057094, "K");
        assertEquals(distance, Math.sqrt(12.5), 0.01);
        distance = distance(bbox.getNorth(), bbox.getEast(), 31.658920778410934, 34.633727747057094, "K");
        assertEquals(distance, Math.sqrt(12.5), 0.01);

    }

    @Test
    public void checkBoundingBoxContains(){
        BoundingBoxCenter newBbox = new BoundingBoxCenter(new Coordinate(31.658920778410934, 34.633727747057094), 4.0);
        assertTrue(bbox.isBoundingBoxContains(newBbox));
        assertFalse(bigBbox.isBoundingBoxContains(strangeBbox));
        assertFalse(newBbox.isBoundingBoxContains(bbox));
        newBbox = new BoundingBoxCenter(new Coordinate(32.658920778410934, 35.633727747057094), 4.0);
        assertFalse(bbox.isBoundingBoxContains(newBbox));
    }

    private static double distance(double lat1, double lon1, double lat2, double lon2, String unit) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            double theta = lon1 - lon2;
            double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
            dist = Math.acos(dist);
            dist = Math.toDegrees(dist);
            dist = dist * 60 * 1.1515;
            if (unit.equals("K")) {
                dist = dist * 1.609344;
            } else if (unit.equals("N")) {
                dist = dist * 0.8684;
            }
            return (dist);
        }
    }
}