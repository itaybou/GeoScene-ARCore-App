package com.geoscene.viewshed.algorithms;

import com.geoscene.viewshed.Cell;

import java.util.ArrayList;
import java.util.List;

/*
Bresenham's line algorithm is a line drawing algorithm that determines the points
of an n-dimensional raster that should be selected in order to form a close approximation
to a straight line between two points. Ref:  https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
 */
public class BresenhamLine {

    public static List<Cell> calculateBresenhamLine(int x0, int y0, int x1, int y1) {
        List<Cell> line = new ArrayList<>();
        // delta of exact value and rounded value of the dependent variable
        int d = 0;

        int dx = Math.abs(x1 - x0);
        int dy = Math.abs(y1 - y0);

        int dx2 = 2 * dx; // slope scaling factors to
        int dy2 = 2 * dy; // avoid floating point

        int ix = x0 < x1 ? 1 : -1; // increment direction
        int iy = y0 < y1 ? 1 : -1;

        int x = x0;
        int y = y0;

        if (dx >= dy) {
            while (true) {
                line.add(new Cell(x, y));
                if(x == x1)
                    break;
                x += ix;
                d += dy2;
                if (d > dx) {
                    y += iy;
                    d -= dx2;
                }
            }
        } else while (true) {
            line.add(new Cell(x, y));
            if(y == y1)
                break;
            y += iy;
            d += dx2;
            if (d > dy) {
                x += ix;
                d -= dy2;
            }
        }
        return line;
    }
}
