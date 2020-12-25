import mercator.BoundingBox;
import mercator.Coordinate;
import open_topo.CellType;
import open_topo.OpenTopoClient;
import open_topo.Raster;
import org.javatuples.Pair;
import overpass.OverpassInterpreter;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;

public class Main {
    static final int HEADERS_SIZE = 6;
    static final int HEIGHT_TOLERENCE = 0; // maybe not true
    static Cell[][] grid;

    static Raster raster;
    static final int WORKERS = 1;
    private static CountDownLatch latch = new CountDownLatch(WORKERS);

    final static int PADDING_KM = 10;

    public static void main(String[] args) throws IOException, InterruptedException {
        int size = 100;
        long time = System.currentTimeMillis();
        BoundingBox bbox = new BoundingBox(new Coordinate(31.712730622002724, 34.580646038992704), 5); //PADDING_KM);
        OpenTopoClient.getTopoData(bbox, latch);
        latch.await();

        Raster raster = OpenTopoClient.getRaster();
        System.out.println((System.currentTimeMillis() - time)  / 1000 + "sec");

        String path = "raster.asc";
//        loadGrid(path);
        int[][] elevations = raster.getElevations();
        PrintWriter out = new PrintWriter("dummy.txt");

        for(int i = 0; i<elevations.length; i++) {
            out.println();
            for (int j = 0; j<elevations[0].length; j++)
            {
                out.print(elevations[i][j]);
            }
        }

        out.close();

        Pair<Integer, Integer> observer = raster.getRowColByCoordinates(new Coordinate(31.712730622002724, 34.580646038992704));
        System.out.println(raster.getElevation(observer.getValue0(),  observer.getValue1()));
        System.out.println(observer.getValue0() + "," + observer.getValue1());
        System.out.println(raster.getCols() + "," + raster.getRows());
        Cell observerCell = new Cell(observer.getValue0(), observer.getValue1(), raster.getElevation(observer.getValue0(),  observer.getValue1()));
        CellType[][] viewshed = viewshed(observerCell, raster, (int) (Math.min(raster.getCols(), raster.getRows()) / 2) - 1);
        long after = System.currentTimeMillis() - time;
        drawViewshed(viewshed);
        printViewshedToFile(String.format("viewshed_%s", path.replace(".asc", ".txt")), viewshed);

        System.out.println("grid load + calculation time: " + ((double)after / 1000) + "sec");

        new OverpassInterpreter().search(raster, viewshed);



//        Boolean[][] grid = new Boolean[size][size];
//        for(Boolean[] row : grid) {
//            Arrays.fill(row, Boolean.FALSE);
//        }
//        Point2D location = new Point(size / 2, size / 2);
//        List<Point2D> perimeter = bresenhamCircle((int)location.getX(), (int)location.getY(), size, 45);
//        for(Point2D perim : perimeter) {
//            grid[(int)perim.getX()][(int)perim.getY()] = Boolean.TRUE;
//        }
//        for(Point2D perimCell : perimeter) {
//            List<Point2D> line = bresenhamLine((int) location.getX(), (int) location.getY(), (int) perimCell.getX(), (int) perimCell.getY());
//
//            for (Point2D cell : line) {
//                grid[(int) cell.getX()][(int) cell.getY()] = null;
//            }
//        }
//        drawGrid(grid);
    }

//    static void loadGrid(String path) throws IOException {
//        List<String> lines = Files.readAllLines(Paths.get(path));
//        for (int i = 0 ; i < HEADERS_SIZE; i++) {
//            String[] items = lines.get(i).split("        ");
//            if(items[0].equals("ncols")) {
//                cols = Integer.parseInt(items[1]);
//            }
//            if(items[0].equals("nrows")) {
//                rows = Integer.parseInt(items[1]);
//            }
//        }
//
//        grid = new Cell[cols][rows];
//        for(int i = HEADERS_SIZE; i < lines.size(); i++) {
//            int row = i - HEADERS_SIZE;
//            String[] items = lines.get(i).trim().split(" ");
//            for(int col = 0; col < cols; col++) {
//                grid[col][row] = new Cell(col, row, Double.parseDouble(items[col]));
//            }
//        }
//    }

    static CellType[][] viewshed(Cell source, Raster raster, int radius) {
//        int[] corners = calcCorners((int) source.getX(), (int) source.getY(), raster.getCols(), raster.getRows(), radius);
//        int x1 = corners[0];
//        int x2 = corners[1];
//        int y1 = corners[2];
//        int y2 = corners[3];
//        int pw = x2 - x1 + 1;
//        int ph = y2 - y1 + 1;
        CellType[][] viewshed = new CellType[raster.getRows()][raster.getCols()];
        List<Cell> perimeter = bresenhamCircle((int)source.getX(), (int)source.getY(), raster.getCols(), raster.getRows(), radius);

        for(Cell cell : perimeter) {
            double maxSlope = Double.NEGATIVE_INFINITY;
            List<Cell> line = bresenhamLine((int) source.getX(), (int) source.getY(), (int) cell.getX(), (int) cell.getY());
            for (Cell lineCell : line) {
                double slope = calcSlope(source, new Cell((int)lineCell.getX(), (int)lineCell.getY(), raster.getElevation((int)lineCell.getX(), (int)lineCell.getY())));
                if (slope >= maxSlope) {
                    maxSlope = slope;
                    //viewshed[(int)lineCell.getY() - y1][(int)lineCell.getX() - x1] = true;
                    viewshed[(int)lineCell.getY()][(int)lineCell.getX()] = CellType.VIEWSHED;
                }
            }
        }
        return viewshed;
    }

    static List<Cell> bresenhamCircle(int x0, int y0, int cols, int rows, int radius)
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

    static List<Cell> bresenhamLine(int x0, int y0, int x1, int y1) {
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

    static double calcSlope(Cell source, Cell target) {
        double deltaZ = target.getValue() - source.getValue() + (source.getValue() < 0 ? HEIGHT_TOLERENCE : -HEIGHT_TOLERENCE);
        double deltaXY = Math.sqrt(Math.pow(target.getX() - source.getX(), 2) + Math.pow(target.getY() - source.getY(), 2));
        return deltaZ / deltaXY;
    }

    static int[] calcCorners(int centerX, int centerY, int cols, int rows, int radius) {
        int[] corners = new int[4];
        corners[0] = Math.max(centerX - radius, 0);
        corners[1] = (centerX + radius >= cols) ? cols - 1 : centerX + radius;
        corners[2] = Math.max(centerY - radius, 0);
        corners[3] = (centerY + radius >= rows) ? rows - 1 : centerY + radius;
        return corners;
    }

//    static List<Cell> calcBrensenhamLine(int x, int y, int x2, int y2) {
//        ArrayList<Cell> line = new ArrayList<>();
//        int[] rgb = new int[]{200, 0, 10};
//        int w = x2 - x ;
//        int h = y2 - y ;
//        int dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0 ;
//        if (w<0) dx1 = -1 ; else if (w>0) dx1 = 1 ;
//        if (h<0) dy1 = -1 ; else if (h>0) dy1 = 1 ;
//        if (w<0) dx2 = -1 ; else if (w>0) dx2 = 1 ;
//        int longest = Math.abs(w) ;
//        int shortest = Math.abs(h) ;
//        if (!(longest>shortest)) {
//            longest = Math.abs(h) ;
//            shortest = Math.abs(w) ;
//            if (h<0) dy2 = -1 ; else if (h>0) dy2 = 1 ;
//            dx2 = 0 ;
//        }
//        int numerator = longest >> 1 ;
//        for (int i=0;i<=longest;i++) {
//            line.add(new Cell(x, y));
//            numerator += shortest ;
//            if (!(numerator<longest)) {
//                numerator -= longest ;#
//                x += dx1 ;
//                y += dy1 ;
//            } else {
//                x += dx2 ;
//                y += dy2 ;
//            }
//        }
//        return line;
//    }

//    static void drawGrid(Boolean[][] grid) {
//        for (Boolean[] booleans : grid) {
//            for (Boolean aBoolean : booleans) {
//                System.out.print(aBoolean == null ? "[$]" : aBoolean ? "[#]" : "[ ]");
//            }
//            System.out.println("\n");
//        }
//    }

    static void drawViewshed(CellType[][] grid) {
        for (CellType[] booleans : grid) {
            for (CellType aBoolean : booleans) {
                System.out.print(aBoolean == CellType.VIEWSHED ? "[#]" : "[ ]");
            }
            System.out.println("\n");
        }
    }

    static void printViewshedToFile(String path, CellType[][] grid) throws FileNotFoundException {
        try (PrintWriter out = new PrintWriter(path)) {
            for (CellType[] booleans : grid) {
                for (CellType aBoolean : booleans) {
                    out.print(aBoolean == CellType.VIEWSHED ? "[#]" : "[ ]");
                }
                out.println("\n");
            }
        }
    }
}
