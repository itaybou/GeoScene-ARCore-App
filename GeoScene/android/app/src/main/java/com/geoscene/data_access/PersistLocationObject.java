package com.geoscene.data_access;


import com.geoscene.data_access.dto.BoundingBoxDTO;
import com.geoscene.data_access.dto.RasterDTO;
import com.geoscene.elevation.Raster;
import com.geoscene.places.PointsOfInterest;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import io.realm.RealmList;
import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;
import io.realm.annotations.Required;

public class PersistLocationObject extends RealmObject {

//    @Required
//    private boolean cached;
//    @Required
//    private long unixTimestamp;
//    @Required
    private BoundingBoxDTO bbox;
//    @Required
    private RasterDTO raster;
//    @Required
//    private RealmList<PointsOfInterest> pois;
public PersistLocationObject() {}

    public PersistLocationObject(boolean cached, BoundingBoxCenter bbox, Raster raster) {
//        unixTimestamp = System.currentTimeMillis() / 1000L;
//        this.cached = cached;
        this.bbox = new BoundingBoxDTO(bbox);
        this.raster = new RasterDTO(raster);
    }

    public String getRasterElevationFilename() {
        return raster.getElevationsFileName();
    }
}
