

import com.geoscene.viewshed.algorithms.BresenhamCircle;
import com.geoscene.viewshed.Cell;


import org.junit.Test;

import java.text.DecimalFormat;
import java.util.List;

import static org.junit.Assert.*;

public class BresenhamCircleTest {
    List<Cell> circle;

    @Test
    public void calculateBresenhamCircle() {
        circle = BresenhamCircle.calculateBresenhamCircle(50, 50,100, 100,20);
        for(Cell cell : circle){
            double distance = Math.sqrt((50 - cell.getY()) * (50 - cell.getY()) + (50 - cell.getX()) * (50 - cell.getX()));
            assertEquals(distance, 20, 0.5);
        }
        Cell p1 = circle.get(6);
        Cell p2 = circle.get(10);
        Cell p3 = circle.get(13);
        Cell center = findCircle((int)p1.getX(),(int)p1.getY(),(int)p2.getX(),(int)p2.getY(),(int)p3.getX(),(int)p3.getY());
        assertEquals(center.getX(),50, 0.1);
        assertEquals(center.getY(),50, 0.1);

    }

    private Cell findCircle(int x1, int y1,
                           int x2, int y2,
                           int x3, int y3)
    {
        int x12 = x1 - x2;
        int x13 = x1 - x3;

        int y12 = y1 - y2;
        int y13 = y1 - y3;

        int y31 = y3 - y1;
        int y21 = y2 - y1;

        int x31 = x3 - x1;
        int x21 = x2 - x1;

        // x1^2 - x3^2
        int sx13 = (int)(Math.pow(x1, 2) -
                Math.pow(x3, 2));

        // y1^2 - y3^2
        int sy13 = (int)(Math.pow(y1, 2) -
                Math.pow(y3, 2));

        int sx21 = (int)(Math.pow(x2, 2) -
                Math.pow(x1, 2));

        int sy21 = (int)(Math.pow(y2, 2) -
                Math.pow(y1, 2));

        int f = ((sx13) * (x12)
                + (sy13) * (x12)
                + (sx21) * (x13)
                + (sy21) * (x13))
                / (2 * ((y31) * (x12) - (y21) * (x13)));
        int g = ((sx13) * (y12)
                + (sy13) * (y12)
                + (sx21) * (y13)
                + (sy21) * (y13))
                / (2 * ((x31) * (y12) - (x21) * (y13)));

        int c = -(int)Math.pow(x1, 2) - (int)Math.pow(y1, 2) -
                2 * g * x1 - 2 * f * y1;

        // eqn of circle be x^2 + y^2 + 2*g*x + 2*f*y + c = 0
        // where centre is (h = -g, k = -f) and radius r
        // as r^2 = h^2 + k^2 - c
        int h = -g;
        int k = -f;

        return new Cell(h, k);

    }

}