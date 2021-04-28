package com.geoscene.triangulation;

import com.geoscene.geography.Coordinate;

import java.util.List;

public class TriangulationData {
    public String id;
    public String name;
    public Coordinate coordinate;
    public List<Coordinate> triangulationArc;
    public double azimuth;

    public TriangulationData(String id, String name, double lat, double lon, double azimuth) {
        this.id = id;
        this.name = name;
        coordinate = new Coordinate(lat, lon);
        this.azimuth = azimuth;
    }

    public Coordinate getCoordinate() {
        return coordinate;
    }

    public double getLat() {
        return coordinate.getLat();
    }

    public double getLon() {
        return coordinate.getLon();
    }

    public double getAzimuth() {
        return azimuth;
    }

    public List<Coordinate> getTriangulationArc() {
        return triangulationArc;
    }

    public void setTriangulationArc(List<Coordinate> triangulationArc) {
        this.triangulationArc = triangulationArc;
    }

    public String toString() {
        return String.format("[lat: %.6f, lon: %.6f, azimuth: %.3f]", coordinate.getLat(), coordinate.getLon(), azimuth);
    }
}
