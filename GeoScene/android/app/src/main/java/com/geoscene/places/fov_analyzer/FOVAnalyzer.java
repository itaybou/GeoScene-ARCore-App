package com.geoscene.places.fov_analyzer;

import android.util.Log;

import com.geoscene.geography.LocationUtils;
import com.geoscene.geography.mercator.BoundingBoxCenter;
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

    public static List<Pair<Element, Coordinate>> intersectVisiblePlaces(Raster raster, PointsOfInterest placesResult, Map<String, HashSet<String>> placesTypes, boolean showPlacesApp, boolean showCenter) {
        RealmList<Element> wayPlaceElements = new RealmList<>();
        RealmList<Element> nodePlaceElements = new RealmList<>();
        RealmList<Element> wayNaturalElements = new RealmList<>();
        RealmList<Element> nodeNaturalElements = new RealmList<>();
        RealmList<Element> wayHistoricElements = new RealmList<>();
        RealmList<Element> nodeHistoricElements = new RealmList<>();
        RealmList<Element> nodeAppCreatedElements = new RealmList<>();
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
                if (element.tags.createdBy != null && element.tags.createdBy.equals("GeoScene"))
                    nodeAppCreatedElements.add(element);
            }
        }

        CellType[][] viewshed = raster.getViewshed();
        BoundingBoxCenter bbox = raster.getBbox();

        if (viewshed == null) {
            return placesResult.elements.stream().filter(element -> element.type.equals("node")
                    && bbox.isBoundingBoxContains(element.lat, element.lon)
                    && (placesTypes.get("place").contains(element.tags.place) ||
                    placesTypes.get("historic").contains(element.tags.historic) ||
                    placesTypes.get("natural").contains(element.tags.natural) || (showPlacesApp && element.tags.createdBy != null && element.tags.createdBy.equals("GeoScene")))).map(element ->
                    new Pair<>(element, new Coordinate(element.lat, element.lon))
            ).collect(Collectors.toList());
        }
        else {
            for (Element element : wayPlaceElements) {
                if(!placesTypes.get("place").contains(element.tags.place))
                    continue;
                if (element.tags.name != null) {
                    Coordinate visibleCoordinate = checkIfViewshed(element, raster, showCenter);
                    if (visibleCoordinate != null) {
                        Pair<Element, Coordinate> location = new Pair<>(element, showCenter ? new Coordinate(
                                (element.bounds.minlat + element.bounds.maxlat) / 2,
                                (element.bounds.minlon + element.bounds.maxlon) / 2) : visibleCoordinate);
                        visibleLocations.add(location);
                    }
                } else {
                    for (Element nodeElement : nodePlaceElements) {
                        if (nodeElement.lat >= element.bounds.minlat && nodeElement.lat <= element.bounds.maxlat && nodeElement.lon >= element.bounds.minlon && nodeElement.lon <= element.bounds.maxlon) {
                            Coordinate nodeCoordinates = new Coordinate(nodeElement.lat, nodeElement.lon);
                            Coordinate visibleCoordinate = checkIfViewshed(element, raster, showCenter);
                            if (visibleCoordinate != null) {
                                visibleLocations.add(new Pair<>(nodeElement, showCenter ? nodeCoordinates : visibleCoordinate));
                            }
                        }
                    }
                }
            }
        }
        filterNaturalElements(raster, wayNaturalElements, bbox, nodeNaturalElements, visibleLocations, placesTypes.get("natural"), showCenter);
        filterHistoricElements(raster, wayHistoricElements, bbox, nodeHistoricElements, visibleLocations, placesTypes.get("historic"), showCenter);
        filterAppCreatedElements(raster, nodeAppCreatedElements, bbox, visibleLocations, showPlacesApp);

        return visibleLocations;
    }

    private static void filterNaturalElements(Raster raster, RealmList<Element> wayNaturalElements, BoundingBoxCenter bbox, RealmList<Element> nodeNaturalElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> natural, boolean showCenter) {
        HashSet<String> locationsSet = new HashSet<>();
        for (Element element : wayNaturalElements) {
            if(!natural.contains(element.tags.natural))
                continue;
            if (element.tags.name != null) {
                Coordinate visibleCoordinate = checkIfViewshed(element, raster, showCenter);
                if (visibleCoordinate != null) {
                    Pair<Element, Coordinate> location = new Pair<>(element, showCenter ? new Coordinate(
                            (element.bounds.minlat + element.bounds.maxlat) / 2,
                            (element.bounds.minlon + element.bounds.maxlon) / 2) : visibleCoordinate);
                    visibleLocations.add(location);
                    locationsSet.add(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name);
                }
            }
        }
        for (Element element : nodeNaturalElements) {
            if(!natural.contains(element.tags.natural) || locationsSet.contains(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static void filterHistoricElements(Raster raster, RealmList<Element> wayHistoricElements, BoundingBoxCenter bbox, RealmList<Element> nodeHistoricElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> historic, boolean showCenter) {
        HashSet<String> locationsSet = new HashSet<>();
        for (Element element : wayHistoricElements){
            if(!historic.contains(element.tags.historic))
                continue;
            if (element.tags.name != null) {
                Coordinate visibleCoordinate = checkIfViewshed(element, raster, showCenter);
                if (visibleCoordinate != null) {
                    Pair<Element, Coordinate> location = new Pair<>(element, showCenter ? new Coordinate(
                            (element.bounds.minlat + element.bounds.maxlat) / 2,
                            (element.bounds.minlon + element.bounds.maxlon) / 2) : visibleCoordinate);
                    visibleLocations.add(location);
                    locationsSet.add(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name);
                }
            }
        }

        for (Element element : nodeHistoricElements){
            if(!historic.contains(element.tags.historic) || locationsSet.contains(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static void filterAppCreatedElements(Raster raster, RealmList<Element> nodeAppCreatedElements, BoundingBoxCenter bbox, List<Pair<Element, Coordinate>> visibleLocations, boolean showPlacesApp) {
        if(!showPlacesApp)
            return;
        for (Element element : nodeAppCreatedElements){
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static Coordinate checkIfViewshed(Element element, Raster raster, boolean showCenter) {

        BoundingBoxCenter bbox = raster.getBbox();
        Coordinate minCoordinate = new Coordinate(element.bounds.minlat, element.bounds.minlon);
        Coordinate maxCoordinate = new Coordinate(element.bounds.maxlat, element.bounds.maxlon);
        Coordinate centerCoordinate = new Coordinate(
                (element.bounds.minlat + element.bounds.maxlat) / 2,
                (element.bounds.minlon + element.bounds.maxlon) / 2);

        Pair<Integer, Integer> center = raster.getRowColByCoordinates(centerCoordinate);
        Pair<Integer, Integer> minNode = raster.getRowColByCoordinates(minCoordinate);
        Pair<Integer, Integer> maxNode = raster.getRowColByCoordinates(maxCoordinate);

        CellType[][] viewshed = raster.getViewshed();
        int dx = Math.abs(maxNode.getValue0() - minNode.getValue0() + 1);
        int dy = Math.abs(maxNode.getValue1() - minNode.getValue1() + 1);

        int minY = Math.min(minNode.getValue1(), maxNode.getValue1());
        int minX = Math.min(minNode.getValue0(), maxNode.getValue0());

        Coordinate showCoordinate = null;
        double currentDistance = Double.MAX_VALUE;
        for (int y = minY; y < minY + dy; ++y) {
            for (int x = minX; x < minX + dx; ++x) {
                if (viewshed[y][x] == CellType.VIEWSHED) {
                    Coordinate cellCoordinate = raster.getCoordinateByRowCol(x, y);
                    if(bbox.isBoundingBoxContains(cellCoordinate.getLat(), cellCoordinate.getLon())) {
                        if(showCenter)
                            return cellCoordinate;
                        else{
                            double distanceCenter = LocationUtils.euclideanDistance(x,y, center.getValue0(), center.getValue1());
                            if(showCoordinate == null || distanceCenter < currentDistance) {
                                currentDistance = distanceCenter;
                                showCoordinate = cellCoordinate;
                            }
                        }
                    }
                }

            }
        }
        return showCoordinate;
    }
}
