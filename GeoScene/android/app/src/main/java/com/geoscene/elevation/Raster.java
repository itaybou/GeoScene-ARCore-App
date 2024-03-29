package com.geoscene.elevation;

import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;

import org.javatuples.Pair;

public class Raster {

    private int cols;
    private int rows;
    private double xLowerLeftCorner;
    private double yLowerLeftCorner;
    private double cellSize;
    BoundingBoxCenter bbox;

    private int[][] elevations;
    private CellType[][] viewshed;

    public Raster(int cols, int rows, double xLowerLeftCorner, double yLowerLeftCorner, double cellSize, int[][] elevations) {
        this.cols = cols;
        this.rows = rows;
        this.xLowerLeftCorner = xLowerLeftCorner;
        this.yLowerLeftCorner = yLowerLeftCorner;
        this.cellSize = cellSize;
        this.elevations = elevations;
    }

    public int getElevationByCoordinate(Coordinate coordinate) {
        Pair<Integer, Integer> xy = getRowColByCoordinates(coordinate);
        return getElevation(xy.getValue0(), xy.getValue1());
    }

    public Pair<Integer, Integer> getRowColByCoordinates(Coordinate coordinate) {
        int y = rows - trunc((coordinate.getLat() - yLowerLeftCorner) / cellSize + 0.5);
        int x = trunc((coordinate.getLon() - xLowerLeftCorner) / cellSize + 0.5);
        return new Pair<>(x >= cols ? cols - 1 : Math.max(x, 0), y >= rows ? rows - 1 : Math.max(y, 0));
    }

    public Coordinate getCoordinateByRowCol(int x, int y) {
        double latitude = (rows - y) * cellSize + yLowerLeftCorner + (cellSize * 0.5);
        double longitude = x * cellSize + xLowerLeftCorner + (cellSize * 0.5);
        return new Coordinate(latitude, longitude);
    }

    private int trunc(double value) {
        return value < 0 ? (int) Math.ceil(value) : (int) Math.floor(value);
    }

    public int getElevation(int x, int y) {
        return elevations[y][x];
    }

    public int[][] getElevations() {
        return elevations;
    }

    public int getCols() {
        return cols;
    }

    public int getRows() {
        return rows;
    }

    public double getCellSize() {
        return cellSize;
    }

    public double getxLowerLeftCorner() {
        return xLowerLeftCorner;
    }

    public double getyLowerLeftCorner() {
        return yLowerLeftCorner;
    }

    public CellType[][] getViewshed() {
        return viewshed;
    }

    public BoundingBoxCenter getBbox() {
        return bbox;
    }

    public void setViewshed(CellType[][] viewshed) {
        this.viewshed = viewshed;
    }
    public void setBoundingBox(BoundingBoxCenter bbox) {
        this.bbox = bbox;
    }
}
