package com.geoscene.data_access;


import android.content.Context;

import com.geoscene.data_access.dto.BoundingBoxDTO;
import com.geoscene.data_access.dto.RasterDTO;
import com.geoscene.data_access.dto.RealmCascadeObject;
import com.geoscene.elevation.Raster;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import io.realm.Realm;
import io.realm.RealmObject;
import io.realm.annotations.Required;

public class PersistLocationObject extends RealmCascadeObject {

    public String name;
    public String description;

    @Required
    public BoundingBoxDTO bbox;

    @Required
    public RasterDTO raster;

    @Required
    public PointsOfInterest pois;

    @Required
    public long timestamp;

    @Required
    public boolean cached;


    public PersistLocationObject() {
    }

    public PersistLocationObject(BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        this.cached = true;
        this.bbox = new BoundingBoxDTO(bbox);
        this.raster = new RasterDTO(raster);
        this.pois = pois;
        timestamp = System.currentTimeMillis() / 1000L;
    }

    public PersistLocationObject(String name, String description, BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        this.cached = false;
        this.name = name;
        this.description = description;
        this.bbox = new BoundingBoxDTO(bbox);
        this.raster = new RasterDTO(raster);
        this.pois = pois;
        this.timestamp = System.currentTimeMillis() / 1000L;
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
        try (Realm realm = getRealm()) {
            realm.executeTransactionAsync(transaction -> {
                bbox.deleteFromRealm();
                raster.deleteFromRealm();
                pois.cascadeDelete();
                deleteFromRealm();
            });
        }
    }
}
