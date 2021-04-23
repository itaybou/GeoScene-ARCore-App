package com.geoscene.data_access.dto;

import com.geoscene.elevation.Raster;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import io.realm.RealmList;
import io.realm.RealmObject;

public class RasterDTO extends RealmObject {
    int cols;
    int rows;
    double xLowerLeftCorner;
    double yLowerLeftCorner;
    double cellSize;
    String elevationsFileName;

    public RasterDTO() {}

    public RasterDTO(Raster raster, String id) {
        this.cols = raster.getCols();
        this.rows = raster.getRows();
        this.xLowerLeftCorner = raster.getxLowerLeftCorner();
        this.yLowerLeftCorner = raster.getyLowerLeftCorner();
        this.cellSize = raster.getCellSize();
        this.elevationsFileName = id;
    }

    public int getCols() {
        return cols;
    }

    public int getRows() {
        return rows;
    }

    public double getxLowerLeftCorner() {
        return xLowerLeftCorner;
    }

    public double getyLowerLeftCorner() {
        return yLowerLeftCorner;
    }

    public double getCellSize() {
        return cellSize;
    }

    public String getElevationsFileName() {
        return elevationsFileName;
    }
}
