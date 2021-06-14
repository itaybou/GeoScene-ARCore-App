import com.geoscene.viewshed.Cell;
import com.geoscene.viewshed.algorithms.BresenhamLine;

import org.junit.Test;

import java.util.List;

import static org.junit.Assert.*;

public class BresenhamLineTest {
    List<Cell> line;

    @Test
    public void calculateBresenhamLine() {
        //Diagonal Test
        line = BresenhamLine.calculateBresenhamLine(50, 50, 0, 0);
        for(Cell cell : line){
            assertEquals(cell.getX(),cell.getY(), 0.0);
        }
        line = BresenhamLine.calculateBresenhamLine(0, 0, 0, 0);
        assertEquals(line.size(), 1, 0.0);
        assertEquals(line.get(0).getX(),0,0.0);
        assertEquals(line.get(0).getY(),0,0.0);
        line = BresenhamLine.calculateBresenhamLine(50, 50, 50, 0);
        assertEquals(line.size(), 51, 0.0);
        for(Cell cell : line){
            assertEquals(cell.getX(),50, 0.0);
        }

    }
}