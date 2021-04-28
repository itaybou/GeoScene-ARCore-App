package com.geoscene.triangulation;

import com.geoscene.geography.Coordinate;

import net.sf.geographiclib.Geodesic;
import net.sf.geographiclib.GeodesicData;
import net.sf.geographiclib.GeodesicLine;
import net.sf.geographiclib.GeodesicMask;
import net.sf.geographiclib.Gnomonic;
import net.sf.geographiclib.GnomonicData;

import java.util.ArrayList;
import java.util.List;

public class Triangulation {

    private static final Geodesic GEODESIC = Geodesic.WGS84;
    private static final int MAX_ITERATIONS = 1000;
    public static final double MAX_TRIANGULATION_DISTANCE = 1e5;
    private static final double MAX_TRIANGULATION_ARC_DISTANCE = 1e6;
    private static final double EPSILON = 1e-16;

    public static Coordinate triangulate(double lat0, double lon0, double azi0, double lat1, double lon1, double azi1) {

        Gnomonic gn = new Gnomonic(GEODESIC);

        GeodesicLine line1 = GEODESIC.Line(lat0, lon0, azi0);
        GeodesicLine line2 = GEODESIC.Line(lat1, lon1, azi1);
        line1.SetDistance(MAX_TRIANGULATION_ARC_DISTANCE);
        line2.SetDistance(MAX_TRIANGULATION_ARC_DISTANCE);

        GeodesicData data1 = line1.Position(MAX_TRIANGULATION_ARC_DISTANCE);
        GeodesicData data2 = line2.Position(MAX_TRIANGULATION_ARC_DISTANCE);

        double b0 = azimuthToBearing(azi0), b1 = azimuthToBearing(azi1);
        Coordinate initial = triangulatePlanar(lat0, lon0, b0, lat1, lon1, b1);
        if(initial == null) return null;
        double lat = initial.getLat(), lon = initial.getLon();

        boolean accuracyReached = false;
        for (int i = 0; i < MAX_ITERATIONS && !accuracyReached; ++i) {
            GnomonicData proj1 = gn.Forward(lat0, lon0, data1.lat1, data1.lon1);
            GnomonicData proj2 = gn.Forward(lat0, lon0, data1.lat2, data1.lon2);
            GnomonicData proj3 = gn.Forward(lat0, lon0, data2.lat1, data2.lon1);
            GnomonicData proj4 = gn.Forward(lat0, lon0, data2.lat2, data2.lon2);
            // See Hartley and Zisserman, Multiple View Geometry, Sec. 2.2.1
            Vector3 va1 = new Vector3(proj1.x, proj1.y);
            Vector3 va2 = new Vector3(proj2.x, proj2.y);
            Vector3 vb1 = new Vector3(proj3.x, proj3.y);
            Vector3 vb2 = new Vector3(proj4.x, proj4.y);

            // la is homogeneous representation of line A1,A2
            // lb is homogeneous representation of line B1,B2
            Vector3 la = va1.cross(va2);
            Vector3 lb = vb1.cross(vb2);
            // p0 is homogeneous representation of intersection of la and lb
            Vector3 p0 = la.cross(lb);
            p0.norm();
            GnomonicData proj = gn.Reverse(lat0, lon0, p0._x, p0._y);
            if(Math.abs(lat - proj.lat) <= EPSILON && Math.abs(lon - proj.lon) <= EPSILON)
                accuracyReached = true;
            lat = proj.lat;
            lon = proj.lon;
        }
        return filterViewDirection(lat0, lon0, b0, lat1, lon1, b1, lat, lon);
    }

    public static List<Coordinate> getGeodesicArc(double intervalMeter, double distance, double lat, double lon, double azi) {
        List<Coordinate> arcCoordinates = new ArrayList<>();

        GeodesicLine line = GEODESIC.Line(lat, lon, azi);
        line.SetDistance(distance);
        int pointCount = (int)(Math.ceil(line.Distance() / intervalMeter));
        double da = line.Arc() / pointCount;
        for (int i = 0; i <= pointCount; ++i) {
            GeodesicData g = line.ArcPosition(i * da,
                    GeodesicMask.LATITUDE |
                            GeodesicMask.LONGITUDE);
            arcCoordinates.add(new Coordinate(g.lat2, g.lon2));
        }
        return arcCoordinates;
    }

    private static Coordinate filterViewDirection(double lat0, double lon0, double b0, double lat1, double lon1, double b1, double lat, double lon) {
        double bearing0 = Math.toDegrees(Math.atan2(lat - lat0, lon - lon0));
        double bearing1 = Math.toDegrees(Math.atan2(lat - lat1, lon - lon1));
        return quadrant(b0) == quadrant(bearing0) && quadrant(b1) == quadrant(bearing1) ?
                new Coordinate(lat, lon) : null;
    }

    private static int quadrant(double angle) {
        return (int)(Math.floor((angle % 360) / 90) + 4) % 4;
    }

    public static Coordinate triangulatePlanar(double lat0, double lon0, double b0, double lat1, double lon1, double b1) {
        if ((((b0 - b1) % 180) + 180) % 180 == 0) return null; // Parallel
        if (((b0 % 180) + 180) % 180 == 90) {
            // vertical line at x = x0
            double lat = Math.tan(Math.toRadians(b1)) * (lon0 - lon1) + lat1;
            return filterViewDirection(lat0, lon0, b0, lat1, lon1, b1, lat, lon0);
        }
        else if (((b1 % 180) + 180) % 180 == 90) {
            // vertical line at x = x1
            double lat = Math.tan(Math.toRadians(b0)) * (lon1 - lon0) + lat0;
            return filterViewDirection(lat0, lon0, b0, lat1, lon1, b1, lat, lon1);
        }
        double m0 = Math.tan(Math.toRadians(b0)); // Line 0: y = m0 (x - x0) + y0
        double m1 = Math.tan(Math.toRadians(b1)); // Line 1: y = m1 (x - x1) + y1
        double lon = (m0 * lon0 - m1 * lon1 - (lat0 - lat1)) / (m0 - m1);
        double lat = m0 * (lon - lon0) + lat0;
        return filterViewDirection(lat0, lon0, b0, lat1, lon1, b1, lat, lon);
    }

    private static double azimuthToBearing(double azi) {
        double bearing = (-azi + 90) % 360;
        return bearing < 0 ? bearing + 360 : bearing;
    }

    static class Vector3 {
        public double _x, _y, _z;

        public Vector3(double x, double y) {
            this._x = x;
            this._y = y;
            this._z = 1;
        }

        public Vector3(double x, double y, double z) {
            this._x = x;
            this._y = y;
            this._z = z;
        }

        public Vector3 cross(Vector3 b) {
            return new Vector3(_y * b._z - _z * b._y,
                    _z * b._x - _x * b._z,
                    _x * b._y - _y * b._x);
        }

        public void norm() {
            _x /= _z;
            _y /= _z;
            _z = 1;
        }

        public String toString() {
            return String.format("[%f, %f, %f]", _x, _y, _z);
        }
    };
}
