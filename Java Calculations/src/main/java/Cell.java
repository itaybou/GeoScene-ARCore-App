import java.awt.geom.Point2D;

public class Cell extends Point2D {
    private int x;
    private int y;
    private double value;
    boolean shown;

    public Cell(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public Cell(int x, int y, double value) {
        this.x = x;
        this.y = y;
        this.value = value;
    }

    public Cell(int x, int y, double value, boolean shown) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.shown = shown;
    }

    @Override
    public double getX() {
        return x;
    }

    @Override
    public double getY() {
        return y;
    }

    public double getValue() {
        return value;
    }

    @Override
    public void setLocation(double v, double v1) {

    }
}
