import java.util.Arrays;

int perimiterIndex = 0;

Cell[][] grid;
double[][] slopes;
int rows = 0;
int cols = 0;
ArrayList<Cell> bresenhamCircle;
Cell observer;

ArrayList<Cell> corners;
Cell[][] viewshed;

// Corners
int x1, x2, y1, y2;

final boolean ANIMATE = false;
final int HEADERS_SIZE = 6;
final int RADIUS = 300;
final int HEIGHT_TOLERENCE = 0; // maybe not true

//NOTE: more visible cells - runtime is larger

ArrayList<Cell> calcCircularPerimeter(int x1, int y1, int radius) {
    ArrayList<Cell> perimeter = new ArrayList();
    int d1 = 3 - (2 * radius);  
    int x = 0;  
    int y = radius;  
    boolean rov = true;  
    
    int[] rgb = new int[]{100, 223, 12};
    // for one eights, while x is not >= y  
    while (rov){  
        if (x>=y){rov=false;}  
        if (d1 < 0) { 
          d1 = d1 + (4 * x) + 6;
        }  
        else { 
          d1 = d1 + 4 * (x - y) + 10; // (1)  
          y = y - 1;
        }  
       
        int xplusx, xminusx, xplusy, xminusy, yplusy, yminusy, yplusx, yminusx;
        // bounds detection
        xplusx = Math.min(x1 + x, cols - 1);
        xminusx = Math.max(x1 - x, 0);
        xplusy = Math.min(x1 + y, cols - 1);
        xminusy = Math.max(x1 - y, 0);
        yplusy = Math.min(y1 + y, cols - 1);
        yminusy = Math.max(y1 - y, 0);
        yplusx = Math.min(y1 + x, cols - 1);
        yminusx = Math.max(y1 - x, 0);
        
        perimeter.add(new Cell(xplusx,  yplusy, 2, 2, rgb));  
        perimeter.add(new Cell(xplusx,  yminusy, 2, 2, rgb));  
        perimeter.add(new Cell(xminusx, yplusy, 2, 2, rgb));  
        perimeter.add(new Cell(xminusx, yminusy, 2, 2, rgb));  

        perimeter.add(new Cell(xplusy,  yplusx, 2, 2, rgb));  
        perimeter.add(new Cell(xplusy,  yminusx, 2, 2, rgb));  
        perimeter.add(new Cell(xminusy, yplusx, 2, 2, rgb));  
        perimeter.add(new Cell(xminusy, yminusx, 2, 2, rgb));  
        x++;  
    }  
    return perimeter;
}

public ArrayList<Cell> calcBrensenhamLine(int x, int y, int x2, int y2) {
    ArrayList<Cell> line = new ArrayList();
    int[] rgb = new int[]{200, 0, 10};
    int w = x2 - x ;
    int h = y2 - y ;
    int dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0 ;
    if (w<0) dx1 = -1 ; else if (w>0) dx1 = 1 ;
    if (h<0) dy1 = -1 ; else if (h>0) dy1 = 1 ;
    if (w<0) dx2 = -1 ; else if (w>0) dx2 = 1 ;
    int longest = Math.abs(w) ;
    int shortest = Math.abs(h) ;
    if (!(longest>shortest)) {
        longest = Math.abs(h) ;
        shortest = Math.abs(w) ;
        if (h<0) dy2 = -1 ; else if (h>0) dy2 = 1 ;
        dx2 = 0 ;            
    }
    int numerator = longest >> 1 ;
    for (int i=0;i<=longest;i++) {
        line.add(new Cell(x, y, 2, 2, rgb));
        numerator += shortest ;
        if (!(numerator<longest)) {
            numerator -= longest ;
            x += dx1 ;
            y += dy1 ;
        } else {
            x += dx2 ;
            y += dy2 ;
        }
    }
    return line;
}

double calcSlope(Cell source, Cell target) {
    double deltaZ = target.getElevation() - source.getElevation();
    double deltaXY = Math.sqrt(Math.pow(target.getX() - source.getX(), 2) + Math.pow(target.getY() - source.getY(), 2));
    return deltaZ / deltaXY;
}

int[] calcCorners(int x, int y, int r) {
    int[] corners = new int[4];
    if (x - r <= 0) corners[0] = 0 ; else corners[0] = x - r;
    if (x + r >= cols)  corners[1] = cols - 1; else corners[1] = x + r;
    if (y - r <= 0) corners[2] = 0 ; else corners[2] = y - r;
    if (y + r >= rows)  corners[3] = rows - 1; else corners[3] = y + r;
    
    return corners;
}

void setup() {
  size(1500, 1200);
  String[] lines = loadStrings("raster15.asc");
  for (int i = 0 ; i < HEADERS_SIZE; i++) {
    String[] items = split(lines[i], "        ");
    if(items[0].equals("ncols")) {
      cols = Integer.parseInt(items[1]);
    }
    if(items[0].equals("nrows")) {
      rows = Integer.parseInt(items[1]);
    }
  }
  
  grid = new Cell[rows][cols];
  println(lines.length - HEADERS_SIZE);
  for(int i = HEADERS_SIZE; i < lines.length; i++) {
    int row = i - HEADERS_SIZE;
    String[] items = split(lines[i].trim(), " ");
    for(int col = 0; col < cols; col++) {
      grid[row][col] = new Cell(col, row, 2, 2, Integer.parseInt(items[col]));
    }
  }
  println("(rows: " + rows + ", cols: " + cols + ")");
  observer = new Cell(444, 378, 8, 8, grid[378][444].getElevation(), new int[]{255, 180, 200});
  bresenhamCircle = calcCircularPerimeter(observer.getX(), observer.getY(), RADIUS);
  
  int[] cor = calcCorners(observer.getX(), observer.getY(), RADIUS);
  x1 = cor[0];
  x2 = cor[1];
  y1 = cor[2];
  y2 = cor[3];
  
  corners = new ArrayList();
  corners.add(new Cell(x1, y1, 4, 4, new int[]{200, 200, 0}));
  corners.add(new Cell(x2, y2, 4, 4, new int[]{200, 200, 0}));
  
  int pw = x2 - x1 + 1;
  int ph = y2 - y1 + 1;
  
  println("CORNERS: x1: " + x1 + ", x2: " + x2 + ", y1: " + y1, ", y2: " + y2 + ", pw: " + pw + ", ph: " + ph);
  println("OBSERVER: x: " + observer.getX() + ", y: " + observer.getY());
  
  //slopes = new double[ph][pw];
  viewshed = new Cell[ph][pw];
  for (Cell[] row: viewshed)
    Arrays.fill(row, null);
    
  //for (int i = 0; i < slopes.length; i++) {
  //  for (int j = 0; j < slopes[0].length; j++) {
  //      Cell target = new Cell(x1 + j, y1 + i, 2, 2, grid[y1 + i][x1 + j].getElevation());
  //      slopes[i][j] = calcSlope(target);
  //  }
  //}
  
    // Draw bresenhamCircle
  for(Cell cell : bresenhamCircle) {
   cell.display();
   if(!ANIMATE) {
      ArrayList<Cell> bresenhamLine = calcBrensenhamLine(observer.getX(), observer.getY(), cell.getX(), cell.getY());
      double maxSlope = Double.NEGATIVE_INFINITY;
      for(Cell lineCell : bresenhamLine) {
        double slope = calcSlope(observer, grid[lineCell.getY()][lineCell.getX()]);
        if(slope >= maxSlope) {
          maxSlope = slope;
          viewshed[lineCell.getY() - y1][lineCell.getX() - x1] = new Cell(lineCell.getX(), lineCell.getY(), 2, 2, new int[]{0, 200, 190}, true);
        }
      }
    }
  }
  //viewshed[observer.getY() - y1][observer.getX() - x1] = new Cell(observer.getX(), observer.getY(), 2, 2, new int[]{0, 200, 190}, true);
}

void draw() {
  background(0);
  double time = System.currentTimeMillis();

  // Draw raster
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      // Oscillate and display each object
      grid[i][j].display();
    }
  }
  
  // Draw bresenhamCircle
   for(Cell cell : bresenhamCircle)
   cell.display();
   
   for (int y = 0; y < viewshed.length; y++) {
    for (int x = 0; x < viewshed[0].length; x++) {
      // Oscillate and display each object
      if(viewshed[y][x] != null) {
        viewshed[y][x].display();
      }
    }
  }
  
  for(Cell cell : corners) {
    cell.display();
  }
  
  if(ANIMATE) {
    Cell perimiterCell = bresenhamCircle.get(perimiterIndex);
    ArrayList<Cell> bresenhamLine = calcBrensenhamLine(observer.getX(), observer.getY(), perimiterCell.getX(), perimiterCell.getY());
    double maxSlope = Double.NEGATIVE_INFINITY;
      
    for(Cell cell : bresenhamLine) {
      double slope = slopes[cell.getY() - y1][cell.getX() - x1];
      if(slope >= maxSlope) {
        println("SCANNING: cellX: " + cell.getX() + ", cellY: " + cell.getY());
        maxSlope = slope;
        viewshed[cell.getY() - y1][cell.getX() - x1] = new Cell(cell.getX(), cell.getY(), 2, 2, new int[]{0, 200, 190}, true);
      }
    }
    for (int y = 0; y < viewshed.length; y++) {
      for (int x = 0; x < viewshed[0].length; x++) {
        // Oscillate and display each object
        if(viewshed[y][x] != null) {
          viewshed[y][x].display();
        }
      }
    }
    
    for(Cell cell : bresenhamLine) {
      cell.display();
    }
    //println(System.currentTimeMillis() - time);
    perimiterIndex = (perimiterIndex + 1) % bresenhamCircle.size();
  }
  // Draw observer
  observer.display();
  
  // Draw framerate
  fill(255, 0, 0);
  textSize(26); 
  text("FPS: " + int(frameRate), 20, 60);
  println("RENDER TIME: " + (System.currentTimeMillis() - time) +" ms");
}
