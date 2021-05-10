package com.geoscene.viewshed;

import android.util.Log;

import com.geoscene.elevation.Raster;
import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.geography.Coordinate;
import com.geoscene.geography.mercator.BoundingBoxCenter;
import com.geoscene.viewshed.algorithms.BresenhamCircle;
import com.geoscene.viewshed.algorithms.BresenhamLine;

import org.javatuples.Pair;

import java.util.List;

public class ViewShed {
    public static final String TAG = "VIEWSHED";
    static final int HEIGHT_TOLERENCE = 0; // maybe not true
    static final int DISTANCE_PRICE = 4;
    private static CellType[][] viewshed;

    static double calcluateSlope(Cell source, Cell target, int distancePrice) {
        double deltaZ = target.getValue() - source.getValue() - distancePrice;
        double deltaXY = Math.sqrt(Math.pow(target.getX() - source.getX(), 2) + Math.pow(target.getY() - source.getY(), 2));
        return deltaZ / deltaXY;
    }

    public static CellType[][] calculateViewshed(Raster raster, double observerLat, double observerLon) {
        Pair<Integer, Integer> observerLocation = raster.getRowColByCoordinates(new Coordinate(observerLat, observerLon));
        double observerElevation = raster.getElevation(observerLocation.getValue0(), observerLocation.getValue1());
        int radius = (Math.min(raster.getCols(), raster.getRows()) / 2) - 1;
        Cell observerCell = new Cell(observerLocation.getValue0(), observerLocation.getValue1(), observerElevation);

        CellType[][] viewshed = new CellType[raster.getRows()][raster.getCols()];
        List<Cell> perimeter = BresenhamCircle.calculateBresenhamCircle((int) observerCell.getX(), (int) observerCell.getY(), raster.getCols(), raster.getRows(), radius);

        for (Cell cell : perimeter) {
            double maxSlope = Double.NEGATIVE_INFINITY;
            List<Cell> line = BresenhamLine.calculateBresenhamLine((int) observerCell.getX(), (int) observerCell.getY(), (int) cell.getX(), (int) cell.getY());
            for (int i = 0;  i < line.size(); ++i) {
                Cell lineCell = line.get(i);
                int distancePrice = i >= (Math.round((double)line.size() / 2)) ? (int) ((i - (Math.round((double) line.size() / 2)) + 1) * DISTANCE_PRICE) : 0;
                double slope = calcluateSlope(observerCell, new Cell((int) lineCell.getX(), (int) lineCell.getY(), raster.getElevation((int) lineCell.getX(), (int) lineCell.getY())), distancePrice);
                if (slope >= maxSlope) {
                    maxSlope = slope;
                    viewshed[(int) lineCell.getY()][(int) lineCell.getX()] = CellType.VIEWSHED;
                }
            }
        }
        return viewshed;
    }

}
