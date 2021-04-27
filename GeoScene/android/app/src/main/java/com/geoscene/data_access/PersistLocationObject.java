package com.geoscene.data_access;


import android.content.Context;

import com.geoscene.data_access.dto.BoundingBoxDTO;
import com.geoscene.data_access.dto.RasterDTO;
import com.geoscene.data_access.dto.IRealmCascadeObject;
import com.geoscene.elevation.Raster;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.location.mercator.BoundingBoxCenter;

import java.util.UUID;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

public class PersistLocationObject extends RealmObject implements IRealmCascadeObject {
    @PrimaryKey
    public String id;
    public long timestamp;
    public long lastAccessTimestamp;
    public boolean cached;
    public String name;
    public String description;
    public BoundingBoxDTO bbox;
    public RasterDTO raster;
    public PointsOfInterest pois;
//    public RealmList<String> queryParams; [forest, city...]

    public PersistLocationObject() {
    }

    public PersistLocationObject(BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        this.id = UUID.randomUUID().toString();
        this.cached = true;
        this.bbox = new BoundingBoxDTO(bbox);
        this.raster = new RasterDTO(raster, id);
        this.pois = pois;
        this.timestamp = System.currentTimeMillis() / 1000L;
        this.lastAccessTimestamp = timestamp;
    }

    public PersistLocationObject(String name, String description, BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        this.id = UUID.randomUUID().toString();
        this.cached = false;
        this.name = name;
        this.description = description;
        this.bbox = new BoundingBoxDTO(bbox);
        this.raster = new RasterDTO(raster, id);
        this.pois = pois;
        this.timestamp = System.currentTimeMillis() / 1000L;
        this.lastAccessTimestamp = timestamp;
    }

    public void setLastAccessTimestamp() {
        this.lastAccessTimestamp = System.currentTimeMillis() / 1000L;
    }

    public String getRasterElevationFilename() {
        return raster.getElevationsFileName();
    }

    public long getTimestamp() {
        return timestamp;
    }

    private int[][] getElevations(Context context) {
        return InternalStorage.read(context, getRasterElevationFilename());
    }

    public Raster getRaster(Context context) {
        int[][] elevations = getElevations(context);
        return new Raster(raster.getCols(), raster.getRows(), raster.getxLowerLeftCorner(), raster.getyLowerLeftCorner(), raster.getCellSize(), elevations);
    }

    public PointsOfInterest getPois() {
        return pois;
    }

    @Override
    public void cascadeDelete() {
        bbox.deleteFromRealm();
        raster.deleteFromRealm();
        pois.cascadeDelete();
        deleteFromRealm();
    }
}
