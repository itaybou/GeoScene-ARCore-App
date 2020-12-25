// A Cell object
class Cell {
  // A cell object knows about its location in the grid 
  // as well as its size with the variables x,y,w,h
  int x,y;   // x,y location
  int w,h;   // width and height
  int elevation = -9999; // angle for oscillating brightness
  int[] rgb = null;
  boolean alpha = false;
  
  final int TILE_SIZE = 2;
  final float ALPHA = 0.5f;

  // Cell Constructor
  Cell(int tempX, int tempY, int tempW, int tempH, int tempElevation) {
    x = tempX;
    y = tempY;
    w = tempW;
    h = tempH;
    elevation = tempElevation;
  }
  
  Cell(int tempX, int tempY, int tempW, int tempH, int tempElevation, int[] tempRGB) {
    x = tempX;
    y = tempY;
    w = tempW;
    h = tempH;
    elevation = tempElevation;
    rgb = tempRGB;
  }
  
  Cell(int tempX, int tempY, int tempW, int tempH, int[] tempRGB) {
    x = tempX;
    y = tempY;
    w = tempW;
    h = tempH;
    rgb = tempRGB;
  }
  
  Cell(int tempX, int tempY, int tempW, int tempH, int[] tempRGB, boolean tempAlpha) {
    x = tempX;
    y = tempY;
    w = tempW;
    h = tempH;
    rgb = tempRGB;
    alpha = tempAlpha;
  }
  
  int getX() {
    return this.x;
  }
  
  int getY() {
    return this.y;
  }
  
  int getElevation() {
    return elevation;
  }

  void display() {
    // Color calculated using sine wave
    if(rgb == null) {
      int coloring = Math.round(map(elevation, -10, 250, 255, 0));
      fill(coloring);
      stroke(coloring);
    } else if(!alpha) {
      fill(rgb[0], rgb[1], rgb[2]);
      stroke(rgb[0], rgb[1], rgb[2]);
    } else {
      fill(rgb[0], rgb[1], rgb[2], 255);
      stroke(rgb[0], rgb[1], rgb[2], 255);
    }
    rect(x * TILE_SIZE, y * TILE_SIZE, w, h); 
  }
}
