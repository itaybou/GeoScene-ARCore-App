package com.geoscene.viewshed.algorithms;

import com.geoscene.viewshed.Cell;

import java.util.ArrayList;
import java.util.List;

/*
The midpoint circle algorithm is an algorithm used to determine the points needed for rasterizing a circle.
Bresenham's circle algorithm is derived from the midpoint circle algorithm. Ref: https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
 */
public class BresenhamCircle {

    public static List<Cell> calculateBresenhamCircle(int x0, int y0, int cols, int rows, int radius)
    {
        List<Cell> perimeter = new ArrayList<>();
        int x = 0;
        int y = radius;
        int xplusx, xminusx, yplusy, yminusy, xplusy, xminusy, yplusx, yminusx;
        while (x <= y) {
            // Bounds detection
            xplusx = Math.min(x0 + x, cols - 1);
            xminusx = Math.max(x0 - x, 0);
            xplusy = Math.min(x0 + y, cols - 1);
            xminusy = Math.max(x0 - y, 0);
            yplusy = Math.min(y0 + y, rows - 1);
            yminusy = Math.max(y0 - y, 0);
            yplusx = Math.min(y0 + x, rows - 1);
            yminusx = Math.max(y0 - x, 0);

            perimeter.add(new Cell(xplusx,  yplusy));
            perimeter.add(new Cell(xplusx,  yminusy));
            perimeter.add(new Cell(xminusx, yplusy));
            perimeter.add(new Cell(xminusx, yminusy));

            perimeter.add(new Cell(xplusy,  yplusx));
            perimeter.add(new Cell(xplusy,  yminusx));
            perimeter.add(new Cell(xminusy, yplusx));
            perimeter.add(new Cell(xminusy, yminusx));
            x++;
            y = (int) (Math.sqrt(radius * radius - x * x) + 0.5);
        }
        return perimeter;
    }
}
