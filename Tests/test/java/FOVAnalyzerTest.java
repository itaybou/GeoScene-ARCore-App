import com.geoscene.elevation.Raster;
import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.geography.Coordinate;
import com.geoscene.places.overpass.poi.Bounds;
import com.geoscene.places.overpass.poi.Element;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.places.fov_analyzer.FOVAnalyzer;
import com.geoscene.places.overpass.poi.Tags;

import org.javatuples.Pair;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;

import io.realm.RealmList;

import static org.junit.Assert.*;

public class FOVAnalyzerTest {
    RealmList<Element> elements;
    @Mock
    Raster raster;
    CellType[][] viewshed;
    PointsOfInterest points;
    Element location;
    Element wayPlace;


    @Before
    public void setUp() {
        raster = Mockito.mock(Raster.class);
    }

    @After
    public void tearDown() {
        Mockito.reset(raster);
        location = null;
        elements = null;

    }

    @Test
    public void intersectVisiblePlacesNodeTest() {
        setUpNodeTest();
        List<Pair<Element, Coordinate>> sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        assertEquals(sol.size(), 1);
        assertEquals(sol.get(0).getValue0().type,"node");
        assertEquals(sol.get(0).getValue0().tags.name,"Ashkelon");

    }

    @Test
    public void intersectVisiblePlacesNoViewshedCalculation() {
        setUpNoViewshedCalculationTest();
        List<Pair<Element, Coordinate>> sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        assertEquals(sol.size(), 2);
        assertTrue(sol.stream().anyMatch(place -> place.getValue0().tags.name.equals("Ashkelon")));
        assertTrue(sol.stream().anyMatch(place -> place.getValue0().tags.name.equals("Ashdod")));
    }

    @Test
    public void intersectVisiblePlacesWayTest() {
        setUpWayTest();
        List<Pair<Element, Coordinate>> sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        assertEquals(sol.size(), 1);
        assertEquals(sol.get(0).getValue0().type,"way");
        assertEquals(sol.get(0).getValue0().tags.name,"Ashkelon");

    }

    @Test
    public void intersectVisibleNotVisiblePlacesWayTest(){
        setUpNotVisibleWayTest();
        List<Pair<Element, Coordinate>> sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        assertEquals(sol.size(), 0);
    }

    @Test
    public void intersectVisibleMoreThenOneVisiblePlacesWayNodeTest(){
        setUpVisibleMoreThenOneNodeWayTest();
        List<Pair<Element, Coordinate>> sol = FOVAnalyzer.intersectVisiblePlaces(raster,points);
        assertEquals(sol.size(), 2);
        assertTrue(sol.stream().anyMatch(place -> place.getValue0().tags.name.equals("Ashkelon")));
        assertTrue(sol.stream().anyMatch(place -> place.getValue0().tags.name.equals("Ashdod")));
    }


    private void setUpNodeTest(){
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "node";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        elements.add(location);
        points.elements = elements;
        viewshed = new CellType[50][50];
        viewshed[10][10] = CellType.VIEWSHED;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new Pair<>(10,10));
        Mockito.when(raster.getViewshed()).thenReturn(viewshed);
    }

    private void setUpNoViewshedCalculationTest(){
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "node";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        wayPlace = new Element();
        wayPlace.type = "way";
        wayPlace.lat = 32.668944014074476;
        wayPlace.lon = 36.57515727034688;
        wayPlace.tags = new Tags();
        wayPlace.tags.name = "Ashdod";
        wayPlace.bounds = new Bounds();
        elements.add(location);
        elements.add(wayPlace);
        points.elements = elements;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new Pair<>(10,10));
        Mockito.when(raster.getViewshed()).thenReturn(null);

    }

    private void setUpWayTest(){
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "way";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        location.bounds = new Bounds();
        elements.add(location);
        points.elements = elements;
        viewshed = new CellType[50][50];
        viewshed[10][10] = CellType.VIEWSHED;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new Pair<>(7,7)).thenReturn(new Pair<>(11,11));
        Mockito.when(raster.getViewshed()).thenReturn(viewshed);

    }

    private void setUpNotVisibleWayTest(){
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "way";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        location.bounds = new Bounds();
        wayPlace = new Element();
        wayPlace.type = "way";
        wayPlace.lat = 32.668944014074476;
        wayPlace.lon = 36.57515727034688;
        wayPlace.tags = new Tags();
        wayPlace.tags.name = "Ashkelon";
        wayPlace.bounds = new Bounds();
        elements.add(location);
        elements.add(wayPlace);
        points.elements = elements;
        viewshed = new CellType[50][50];
        viewshed[20][20] = CellType.VIEWSHED;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new Pair<>(7,7)).
                thenReturn(new Pair<>(11,11)).thenReturn(new Pair<>(12,12)).thenReturn(new Pair<>(16,5));
        Mockito.when(raster.getViewshed()).thenReturn(viewshed);

    }

    private void setUpVisibleMoreThenOneNodeWayTest(){
        points = new PointsOfInterest();
        elements = new RealmList<>();
        location = new Element();
        location.type = "node";
        location.lat = 31.668944014074476;
        location.lon = 34.57515727034688;
        location.tags = new Tags();
        location.tags.name = "Ashkelon";
        location.bounds = new Bounds();
        wayPlace = new Element();
        wayPlace.type = "way";
        wayPlace.lat = 32.668944014074476;
        wayPlace.lon = 36.57515727034688;
        wayPlace.tags = new Tags();
        wayPlace.tags.name = "Ashdod";
        wayPlace.bounds = new Bounds();
        elements.add(location);
        elements.add(wayPlace);
        points.elements = elements;
        viewshed = new CellType[50][50];
        viewshed[11][11] = CellType.VIEWSHED;
        viewshed[10][10] = CellType.VIEWSHED;
        Mockito.when(raster.getRowColByCoordinates(Mockito.any())).thenReturn(new Pair<>(10,10)).
                thenReturn(new Pair<>(11,11)).thenReturn(new Pair<>(19,19)).thenReturn(new Pair<>(21,21));
        Mockito.when(raster.getViewshed()).thenReturn(viewshed);

    }
}