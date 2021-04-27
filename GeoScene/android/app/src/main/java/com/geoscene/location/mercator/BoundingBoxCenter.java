package com.geoscene.location.mercator;

import com.geoscene.location.Coordinate;

import org.javatuples.Pair;

public class BoundingBoxCenter {
    // Semi-axes of WGS-84 geoidal reference
    private static final double WGS84_a = 6378137.0; // Major semiaxis [m]
    private static final double WGS84_b = 6356752.3; // Minor semiaxis [m]

    private Pair<Coordinate, Coordinate> bbox;
    private Coordinate center;

    public BoundingBoxCenter() { }

    public BoundingBoxCenter(Coordinate center, double halfSideInKm) {
        bbox = getBoundingBox(center, halfSideInKm);
        this.center = center;
    }

    // degrees to radians
    private static double deg2rad(double degrees) {
        return Math.PI * degrees / 180.0;
    }

    // radians to degrees
    private static double rad2deg(double radians) {
        return 180.0 * radians / Math.PI;
    }

    // Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
    private static double WGS84EarthRadius(double lat) {
        // http://en.wikipedia.org/wiki/Earth_radius
        double An = WGS84_a * WGS84_a * Math.cos(lat);
        double Bn = WGS84_b * WGS84_b * Math.sin(lat);
        double Ad = WGS84_a * Math.cos(lat);
        double Bd = WGS84_b * Math.sin(lat);
        return Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));
    }

    private static Pair<Coordinate, Coordinate> getBoundingBox(Coordinate center, double sideKM) {
        // Bounding box surrounding the point at given coordinates,
        // assuming local approximation of Earth surface as a sphere
        // of radius given by WGS84
        double lat = deg2rad(center.getLat());
        double lon = deg2rad(center.getLon());
        double halfSideMeter = 1000 * (sideKM / 2);

        // Radius of Earth at given latitude
        double radius = WGS84EarthRadius(lat);
        // Radius of the parallel at given latitude
        double pradius = radius * Math.cos(lat);

        double latMin = lat - halfSideMeter / radius;
        double latMax = lat + halfSideMeter / radius;
        double lonMin = lon - halfSideMeter / pradius;
        double lonMax = lon + halfSideMeter / pradius;

        return new Pair<>(
                new Coordinate(rad2deg(latMin), rad2deg(lonMin)),
                new Coordinate(rad2deg(latMax), rad2deg(lonMax))
        );
    }

    public static Coordinate getLatLonByRowCol(int x, int y, double latitude, double longitude) {
        return new Coordinate(latitude  + (y * 90 / WGS84EarthRadius(latitude)) * (180 / Math.PI), longitude + (x * 90 / WGS84EarthRadius(latitude)) * (180 / Math.PI) / Math.cos(latitude * Math.PI/180));
    }

    public double getSouth() {
        return bbox.getValue0().getLat();
    }

    public double getNorth() {
        return bbox.getValue1().getLat();
    }

    public double getWest() {
        return bbox.getValue0().getLon();
    }

    public double getEast() {
        return bbox.getValue1().getLon();
    }

    public Coordinate getCenter() {
        return center;
    }

    public boolean isBoundingBoxContains(BoundingBoxCenter other) {
        return other.getWest() >= getWest() && other.getSouth() >= getSouth() && other.getNorth() <= getNorth() && other.getEast() <= getEast();
    }

    public String toString() {
        return String.format("[%s,%s,%s,%s]", getSouth(), getWest(), getNorth(), getEast());
    }
}
