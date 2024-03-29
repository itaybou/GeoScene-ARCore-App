package com.geoscene.data_access.dto;

import com.geoscene.geography.mercator.BoundingBoxCenter;

import io.realm.RealmObject;

public class BoundingBoxDTO extends RealmObject {
    public double south;
    public double east;
    public double west;
    public double north;
    public double centerLatitude;
    public double centerLongitude;

    public double radiusKM;

    public BoundingBoxDTO() {}

    public BoundingBoxDTO(BoundingBoxCenter bbox) {
        centerLatitude = bbox.getCenter().getLat();
        centerLongitude = bbox.getCenter().getLon();
        this.south = bbox.getSouth();
        this.east = bbox.getEast();
        this.north = bbox.getNorth();
        this.west = bbox.getWest();
        radiusKM = bbox.getRadiusKM();
    }
}


