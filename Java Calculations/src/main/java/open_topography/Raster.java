package open_topography;

import mercator.Coordinate;
import org.javatuples.Pair;

public class Raster {

    private int cols;
    private int rows;
    private double xLowerLeftCorner;
    private double yLowerLeftCorner;
    private double cellSize;

    private int[][] elevations;

    public Raster(int cols, int rows, double xLowerLeftCorner, double yLowerLeftCorner, double cellSize, int[][] elevations) {
        this.cols = cols;
        this.rows = rows;
        this.xLowerLeftCorner = xLowerLeftCorner;
        this.yLowerLeftCorner = yLowerLeftCorner;
        this.cellSize = cellSize;
        this.elevations = elevations;
    }

    public Pair<Integer, Integer> getRowColByCoordinates(Coordinate coordinate) {
        var y = rows - trunc((coordinate.getLat() - yLowerLeftCorner) / cellSize + 0.5);
        var x = trunc((coordinate.getLon() - xLowerLeftCorner) / cellSize + 0.5);
        return new Pair<>(x >= cols ? cols - 1 : Math.max(x, 0), y >= rows ? rows - 1 : Math.max(y, 0));
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

}
