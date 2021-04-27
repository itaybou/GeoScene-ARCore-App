package com.geoscene.data_access.dto;

import com.geoscene.location.mercator.BoundingBoxCenter;

import io.realm.RealmObject;

public class BoundingBoxDTO extends RealmObject {
    public double south;
    public double east;
    public double west;
    public double north;

    public BoundingBoxDTO() {}

    public BoundingBoxDTO(BoundingBoxCenter bbox) {
        this.south = bbox.getSouth();
        this.east = bbox.getEast();
        this.north = bbox.getNorth();
        this.west = bbox.getWest();
    }
}


