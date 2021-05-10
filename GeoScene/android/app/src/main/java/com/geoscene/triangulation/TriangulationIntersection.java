package com.geoscene.triangulation;

import com.geoscene.geography.Coordinate;

public class TriangulationIntersection {

    public String id;
    public String name;
    public String description;
    public Coordinate intersection;
    public long distance;

    public TriangulationIntersection(String id, String name, String description, double lat, double lon, double distance) {
        this.id = id;
        this.name = name;
        this.description = description;
        intersection = new Coordinate(lat, lon);
        this.distance = Math.round(distance);
    }
}
