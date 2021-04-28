package com.geoscene.triangulation;

import com.geoscene.geography.Coordinate;

public class TriangulationIntersection {

    public String id;
    public String name;
    public Coordinate intersection;
    public long distance;

    public TriangulationIntersection(String id, String name, double lat, double lon, double distance) {
        this.id = id;
        this.name = name;
        intersection = new Coordinate(lat, lon);
        this.distance = Math.round(distance);
    }
}
