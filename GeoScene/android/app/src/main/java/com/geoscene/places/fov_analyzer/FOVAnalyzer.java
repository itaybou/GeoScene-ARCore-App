package com.geoscene.places.fov_analyzer;

import android.util.Log;

import com.geoscene.places.overpass.poi.Element;
import com.geoscene.geography.Coordinate;
import com.geoscene.elevation.open_topography.CellType;
import com.geoscene.elevation.Raster;

import org.javatuples.Pair;

import com.geoscene.places.overpass.poi.PointsOfInterest;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.realm.RealmList;

public class FOVAnalyzer {

    private static final String TAG = "FOVAnalyzer";

    public static List<Pair<Element, Coordinate>> intersectVisiblePlaces(Raster raster, PointsOfInterest placesResult, Map<String, HashSet<String>> placesTypes) {
        RealmList<Element> wayPlaceElements = new RealmList<>();
        RealmList<Element> nodePlaceElements = new RealmList<>();
        RealmList<Element> wayNaturalElements = new RealmList<>();
        RealmList<Element> nodeNaturalElements = new RealmList<>();
        RealmList<Element> wayHistoricElements = new RealmList<>();
        RealmList<Element> nodeHistoricElements = new RealmList<>();
        List<Pair<Element, Coordinate>> visibleLocations = new ArrayList<>();
        for (Element element : placesResult.elements){
            if (element.type.equals("way")){
                if (element.tags.place != null)
                    wayPlaceElements.add(element);
                if (element.tags.historic != null)
                    wayHistoricElements.add(element);
                if (element.tags.natural != null)
                    wayNaturalElements.add(element);
            }
            else{
                if (element.tags.place != null)
                    nodePlaceElements.add(element);
                if (element.tags.historic != null)
                    nodeHistoricElements.add(element);
                if (element.tags.natural != null)
                    nodeNaturalElements.add(element);
            }
        }
        CellType[][] viewshed = raster.getViewshed();
        if (viewshed == null) {

            return placesResult.elements.stream().filter(element -> element.type.equals("node") && placesTypes.get("place").contains(element.tags.place)).map(element ->
                    new Pair<>(element, new Coordinate(element.lat, element.lon))
            ).collect(Collectors.toList());
        }
        else {
            for (Element element : wayPlaceElements) {
                if(!placesTypes.get("place").contains(element.tags.place))
                    continue;
                if (element.tags.name != null) {
                    if (checkIfViewshed(element, raster)) {
                        Pair<Element, Coordinate> location = new Pair<>(element, new Coordinate(
                                (element.bounds.minlat + element.bounds.maxlat) / 2,
                                (element.bounds.minlon + element.bounds.maxlon) / 2));
                        visibleLocations.add(location);
                    }
                } else {
                    for (Element nodeElement : nodePlaceElements) {
                        if (nodeElement.lat >= element.bounds.minlat && nodeElement.lat <= element.bounds.maxlat && nodeElement.lon >= element.bounds.minlon && nodeElement.lon <= element.bounds.maxlon) {
                            Coordinate nodeCoordinates = new Coordinate(nodeElement.lat, nodeElement.lon);
                            if (checkIfViewshed(element, raster)) {
                                visibleLocations.add(new Pair<>(nodeElement, nodeCoordinates));
                            }
                        }
                    }
                }
            }
        }
        filterNaturalElements(raster, wayNaturalElements, nodeNaturalElements, visibleLocations, placesTypes.get("natural"));
        filterHistoricElements(raster, wayHistoricElements, nodeHistoricElements, visibleLocations, placesTypes.get("historic"));

        return visibleLocations;
    }

    private static void filterNaturalElements(Raster raster, RealmList<Element> wayNaturalElements, RealmList<Element> nodeNaturalElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> natural) {
        for (Element element : wayNaturalElements) {
            if(!natural.contains(element.tags.natural))
                continue;
            if (element.tags.name != null){
                if (checkIfViewshed(element, raster)) {
                    Pair<Element, Coordinate> location = new Pair<>(element, new Coordinate(
                            (element.bounds.minlat + element.bounds.maxlat) / 2,
                            (element.bounds.minlon + element.bounds.maxlon) / 2));
                    visibleLocations.add(location);
                }
            }
        }
        for (Element element : nodeNaturalElements) {
            if(!natural.contains(element.tags.natural))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static void filterHistoricElements(Raster raster, RealmList<Element> wayHistoricElements, RealmList<Element> nodeHistoricElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> historic) {
        for (Element element : wayHistoricElements){
            if(!historic.contains(element.tags.historic))
                continue;
            if (element.tags.name != null) {
                if (checkIfViewshed(element, raster)) {
                    Pair<Element, Coordinate> location = new Pair<>(element, new Coordinate(
                            (element.bounds.minlat + element.bounds.maxlat) / 2,
                            (element.bounds.minlon + element.bounds.maxlon) / 2));
                    visibleLocations.add(location);
                }
            }
        }
        for (Element element : nodeHistoricElements){
            if(!historic.contains(element.tags.historic))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static boolean checkIfViewshed(Element element, Raster raster) {
        Coordinate minCoordinate = new Coordinate(element.bounds.minlat, element.bounds.minlon);
        Coordinate maxCoordinate = new Coordinate(element.bounds.maxlat, element.bounds.maxlon);
        Pair<Integer, Integer> minNode = raster.getRowColByCoordinates(minCoordinate);
        Pair<Integer, Integer> maxNode = raster.getRowColByCoordinates(maxCoordinate);
        CellType[][] viewshed = raster.getViewshed();
        int dx = Math.abs(maxNode.getValue0() - minNode.getValue0() + 1);
        int dy = Math.abs(maxNode.getValue1() - minNode.getValue1() + 1);

        int minY = Math.min(minNode.getValue1(), maxNode.getValue1());
        int minX = Math.min(minNode.getValue0(), maxNode.getValue0());

        boolean intersection = false;
        for (int y = minY; y < minY + dy && !intersection; ++y) {
            for (int x = minX; x < minX + dx && !intersection; ++x) {
                if (viewshed[y][x] == CellType.VIEWSHED) {
                    intersection = true;
                }

            }
        }
        return intersection;
    }
}
