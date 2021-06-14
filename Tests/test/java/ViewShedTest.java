import com.geoscene.elevation.Raster;
import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.geography.Coordinate;
import com.geoscene.viewshed.Cell;
import com.geoscene.viewshed.ViewShed;
import com.geoscene.viewshed.algorithms.BresenhamCircle;
import org.javatuples.Pair;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoJUnitRunner;
import org.mockito.junit.MockitoRule;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.Silent.class)
public class ViewShedTest {
    @Mock
    Raster raster;
    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();
    CellType[][] sol;


    @Before
    public void setUp() throws Exception {
        raster = Mockito.mock(Raster.class);
    }

    @Test
    public void calculateViewshedObserverNearby() {
        setUpObserverNearby();
        sol = ViewShed.calculateViewshed(raster,0.0,0.0);
        for (int i = 0; i<100; i++){
            for(int j = 0; j< 100; j++){
                if(i >=49 && j >=49 && i<=51 && j <= 51)
                    if (!(i == 50 && j == 50))
                        assertEquals(sol[i][j], CellType.VIEWSHED);
                else if (i!=48 && j!=48)
                    assertNull(sol[i][j]);
            }
        }
        assertEquals(sol[48][48], CellType.VIEWSHED);
    }

    @Test
    public void calculateViewshedObserverHigh(){
        setUpObserverNearbyHigh();
        int radius = (Math.min(raster.getCols(), raster.getRows()) / 2) - 1;
        List<Cell> perimeter = BresenhamCircle.calculateBresenhamCircle((int) 50, (int) 50, raster.getCols(), raster.getRows(), radius);
        sol = ViewShed.calculateViewshed(raster,0,0);
        for (Cell cell : perimeter){
            assertEquals(sol[(int)cell.getX()][(int)cell.getY()], CellType.VIEWSHED);
        }
    }

    @Test
    public void calculateVieshedDiagonalOneVisible(){
        setUpDiagonalOneVisible();
        sol = ViewShed.calculateViewshed(raster,0,0);
        for (int i = 48; i>=0; i--) {
            assertNull(sol[i][i]);
        }
        assertEquals(sol[49][49], CellType.VIEWSHED);
    }

    @Test
    public void calculateViewshedDiagonalOddVisible(){
        setUpDiagonalOddVisible();
        sol = ViewShed.calculateViewshed(raster,0,0);
        assertEquals(sol[9][9], CellType.VIEWSHED);
        assertEquals(sol[7][7], CellType.VIEWSHED);
        for (int i = 8; i>=0; i-=2) {
            System.out.println(i);
            assertNull(sol[i][i]);
        }

    }

    @After
    public void tearDown(){
        Mockito.reset(raster);
        sol.clone();
    }


    private void setUpObserverNearby()
    {
        Mockito.when(raster.getxLowerLeftCorner()).thenReturn(34.637916666618);
        Mockito.when(raster.getyLowerLeftCorner()).thenReturn(31.736250000006);
        Mockito.when(raster.getCellSize()).thenReturn(8.33333333E-4);
        Mockito.when(raster.getCols()).thenReturn(100);
        Mockito.when(raster.getRows()).thenReturn(100);
        Mockito.when(raster.getElevation(48,48)).thenReturn(400);
        Mockito.when(raster.getElevation(50,50)).thenReturn(-100);
        Mockito.when(raster.getRowColByCoordinates(Mockito.any(Coordinate.class))).thenReturn(new Pair<>(50, 50));
    }
    private void setUpObserverNearbyHigh()
    {
        Mockito.when(raster.getxLowerLeftCorner()).thenReturn(34.637916666618);
        Mockito.when(raster.getyLowerLeftCorner()).thenReturn(31.736250000006);
        Mockito.when(raster.getCellSize()).thenReturn(8.33333333E-4);
        Mockito.when(raster.getCols()).thenReturn(100);
        Mockito.when(raster.getRows()).thenReturn(100);
        Mockito.when(raster.getElevation(50,50)).thenReturn(2000);
        Mockito.when(raster.getRowColByCoordinates(Mockito.any(Coordinate.class))).thenReturn(new Pair<>(50, 50));
    }
    private void setUpDiagonalOneVisible()
    {
        int elevation = 1000;
        Mockito.when(raster.getxLowerLeftCorner()).thenReturn(34.637916666618);
        Mockito.when(raster.getyLowerLeftCorner()).thenReturn(31.736250000006);
        Mockito.when(raster.getCellSize()).thenReturn(8.33333333E-4);
        Mockito.when(raster.getCols()).thenReturn(100);
        Mockito.when(raster.getRows()).thenReturn(100);
        for(int i = 49; i>=0 ; i--){
            Mockito.when(raster.getElevation(i,i)).thenReturn(elevation);
            elevation -= 10;
        }
        Mockito.when(raster.getRowColByCoordinates(Mockito.any(Coordinate.class))).thenReturn(new Pair<>(50, 50));
    }
    private void setUpDiagonalOddVisible()
    {
        int elevation = 100;
        boolean odd = true;
        Mockito.when(raster.getxLowerLeftCorner()).thenReturn(34.637916666618);
        Mockito.when(raster.getyLowerLeftCorner()).thenReturn(31.736250000006);
        Mockito.when(raster.getCellSize()).thenReturn(8.33333333E-4);
        Mockito.when(raster.getCols()).thenReturn(20);
        Mockito.when(raster.getRows()).thenReturn(20);
        Mockito.when(raster.getElevation(10,10)).thenReturn(0);
        for(int i = 9; i>=0 ; i--){
            elevation = odd ? elevation * 5 : elevation - 50;
            Mockito.when(raster.getElevation(i,i)).thenReturn(elevation);
            odd = !odd;
        }
        Mockito.when(raster.getRowColByCoordinates(Mockito.any(Coordinate.class))).thenReturn(new Pair<>(10, 10));
    }
}