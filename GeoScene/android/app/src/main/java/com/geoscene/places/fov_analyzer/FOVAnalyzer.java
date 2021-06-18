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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import io.realm.RealmList;

public class FOVAnalyzer {

    private static final String TAG = "FOVAnalyzer";

    public static List<Pair<Element, Coordinate>> intersectVisiblePlaces(Raster raster, PointsOfInterest placesResult, Map<String, HashSet<String>> placesTypes, boolean showPlacesApp, boolean showCenter) {
        List<Element> wayPlaceElements = new ArrayList<>();
        Map<String, Element> nodePlaceElements = new HashMap<>();
        List<Element> wayNaturalElements = new ArrayList<>();
        List<Element> nodeNaturalElements = new ArrayList<>();
        List<Element> wayHistoricElements = new ArrayList<>();
        List<Element> nodeHistoricElements = new ArrayList<>();
        List<Element> nodeAppCreatedElements = new ArrayList<>();
        List<Pair<Element, Coordinate>> visibleLocations = new ArrayList<>();
        for (Element element : placesResult.elements) {
            if (element.type.equals("way")) {
                if (element.tags.place != null)
                    wayPlaceElements.add(element);
                if (element.tags.historic != null)
                    wayHistoricElements.add(element);
                if (element.tags.natural != null)
                    wayNaturalElements.add(element);
            } else {
                if (element.tags.place != null && element.tags.name != null)
                    nodePlaceElements.putIfAbsent(element.tags.name, element);
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
            Set<String> places = new HashSet<>();
            List<Pair<Element, Coordinate>> nodes = placesResult.elements.stream().filter(element ->
                    (element.type.equals("node")
                            && element.tags.name != null
                            && bbox.isBoundingBoxContains(element.lat, element.lon))
                            && (placesTypes.get("place").contains(element.tags.place) ||
                            placesTypes.get("historic").contains(element.tags.historic) ||
                            placesTypes.get("natural").contains(element.tags.natural) ||
                            (showPlacesApp && element.tags.createdBy != null && element.tags.createdBy.equals("GeoScene"))))
                    .map(element -> {
                                places.add(element.tags.name);
                                if (element.tags.nameHeb != null) {
                                    places.add(element.tags.nameHeb);
                                }
                                return new Pair<>(element, new Coordinate(element.lat, element.lon));
                            }
                    ).collect(Collectors.toList());

            List<Pair<Element, Coordinate>> ways = placesResult.elements.stream().filter(element -> {
                if(!element.type.equals("way")) {
                    return false;
                }
                Pair<Coordinate, Coordinate> upperLeftLowerRight = bbox.getSecondaryCorners();
                BoundingBoxCenter wayBbox = new BoundingBoxCenter(new Pair<>(
                        new Coordinate(element.bounds.minlat, element.bounds.minlon),
                        new Coordinate(element.bounds.maxlat, element.bounds.maxlon)));
                return (element.tags.name != null
                        && !places.contains(element.tags.name) && !places.contains(element.tags.nameHeb)
                        && (wayBbox.isBoundingBoxContains(upperLeftLowerRight.getValue0().getLat(), upperLeftLowerRight.getValue0().getLon()) ||
                        wayBbox.isBoundingBoxContains(upperLeftLowerRight.getValue1().getLat(), upperLeftLowerRight.getValue1().getLon()) ||
                        wayBbox.isBoundingBoxContains(bbox.getSouth(), bbox.getWest()) ||
                        wayBbox.isBoundingBoxContains(bbox.getNorth(), bbox.getEast()) ||
                        bbox.isBoundingBoxContains((element.bounds.minlat + element.bounds.maxlat) / 2, (element.bounds.minlon + element.bounds.maxlon) / 2)))
                        && (placesTypes.get("place").contains(element.tags.place) ||
                        placesTypes.get("historic").contains(element.tags.historic) ||
                        placesTypes.get("natural").contains(element.tags.natural));
            })
                    .map(element -> new Pair<>(element, new Coordinate(
                            (element.bounds.minlat + element.bounds.maxlat) / 2,
                            (element.bounds.minlon + element.bounds.maxlon) / 2))
                    ).collect(Collectors.toList());

            return Stream.concat(nodes.stream(), ways.stream()).collect(Collectors.toList());
        } else {
            filterPlaceElements(raster, wayPlaceElements, nodePlaceElements, visibleLocations, placesTypes.get("place"), showCenter);
        }
        filterNaturalElements(raster, wayNaturalElements, bbox, nodeNaturalElements, visibleLocations, placesTypes.get("natural"), showCenter);
        filterHistoricElements(raster, wayHistoricElements, bbox, nodeHistoricElements, visibleLocations, placesTypes.get("historic"), showCenter);
        filterAppCreatedElements(raster, nodeAppCreatedElements, bbox, visibleLocations, showPlacesApp);

        return visibleLocations;
    }

    private static void filterPlaceElements(Raster raster, List<Element> wayPlaceElements, Map<String, Element> nodePlaceElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> places, boolean showCenter) {
        for (Element element : wayPlaceElements) {
            if (!places.contains(element.tags.place))
                continue;
            Coordinate bboxCenter = new Coordinate(
                    (element.bounds.minlat + element.bounds.maxlat) / 2,
                    (element.bounds.minlon + element.bounds.maxlon) / 2);
            if (element.tags.name != null) {
                Element nodeElement = nodePlaceElements.get(element.tags.name);
                Coordinate centerCoordinate = nodeElement != null ? new Coordinate(nodeElement.lat, nodeElement.lon) : bboxCenter;
                Coordinate visibleCoordinate = checkIfViewshed(element, raster, centerCoordinate, showCenter);
                if (visibleCoordinate != null) {
                    Pair<Element, Coordinate> location = new Pair<>(element, showCenter ? bboxCenter : visibleCoordinate);
                    visibleLocations.add(location);
                }
            } else {
                double currentDistance = Double.MAX_VALUE;
                Element placeNode = null;
                for (Element nodeElement : nodePlaceElements.values()) {
                    if (nodeElement.lat >= element.bounds.minlat && nodeElement.lat <= element.bounds.maxlat && nodeElement.lon >= element.bounds.minlon && nodeElement.lon <= element.bounds.maxlon) {
                        double distance = LocationUtils.distance(nodeElement.lat, bboxCenter.getLat(), nodeElement.lon, bboxCenter.getLon(), 0, 0);
                        if (distance < currentDistance) {
                            currentDistance = distance;
                            placeNode = nodeElement;
                        }
                    }
                }
                if (placeNode != null) {
                    Coordinate nodeCoordinate = new Coordinate(placeNode.lat, placeNode.lon);
                    Coordinate visibleCoordinate = checkIfViewshed(element, raster, nodeCoordinate, showCenter);
                    if (visibleCoordinate != null) {
                        visibleLocations.add(new Pair<>(placeNode, showCenter ? nodeCoordinate : visibleCoordinate));
                    }
                }
            }
        }
    }

    private static void filterNaturalElements(Raster raster, List<Element> wayNaturalElements, BoundingBoxCenter bbox, List<Element> nodeNaturalElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> natural, boolean showCenter) {
        HashSet<String> locationsSet = new HashSet<>();
        for (Element element : wayNaturalElements) {
            if (!natural.contains(element.tags.natural))
                continue;
            Coordinate bboxCenter = new Coordinate(
                    (element.bounds.minlat + element.bounds.maxlat) / 2,
                    (element.bounds.minlon + element.bounds.maxlon) / 2);
            if (element.tags.name != null) {
                Coordinate visibleCoordinate = checkIfViewshed(element, raster, bboxCenter, showCenter);
                if (visibleCoordinate != null) {
                    Pair<Element, Coordinate> location = new Pair<>(element, visibleCoordinate);
                    visibleLocations.add(location);
                    locationsSet.add(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name);
                }
            }
        }
        for (Element element : nodeNaturalElements) {
            if (!natural.contains(element.tags.natural) || locationsSet.contains(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static void filterHistoricElements(Raster raster, List<Element> wayHistoricElements, BoundingBoxCenter bbox, List<Element> nodeHistoricElements, List<Pair<Element, Coordinate>> visibleLocations, HashSet<String> historic, boolean showCenter) {
        HashSet<String> locationsSet = new HashSet<>();
        for (Element element : wayHistoricElements) {
            if (!historic.contains(element.tags.historic))
                continue;
            Coordinate bboxCenter = new Coordinate(
                    (element.bounds.minlat + element.bounds.maxlat) / 2,
                    (element.bounds.minlon + element.bounds.maxlon) / 2);
            if (element.tags.name != null) {
                Coordinate visibleCoordinate = checkIfViewshed(element, raster, bboxCenter, showCenter);
                if (visibleCoordinate != null) {
                    Pair<Element, Coordinate> location = new Pair<>(element, visibleCoordinate);
                    visibleLocations.add(location);
                    locationsSet.add(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name);
                }
            }
        }

        for (Element element : nodeHistoricElements) {
            if (!historic.contains(element.tags.historic) || locationsSet.contains(element.tags.nameEng != null ? element.tags.nameEng : element.tags.name))
                continue;
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static void filterAppCreatedElements(Raster raster, List<Element> nodeAppCreatedElements, BoundingBoxCenter bbox, List<Pair<Element, Coordinate>> visibleLocations, boolean showPlacesApp) {
        if (!showPlacesApp)
            return;
        for (Element element : nodeAppCreatedElements) {
            Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
            Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
            if (element.tags.name != null && raster.getViewshed()[node.getValue1()][node.getValue0()] == CellType.VIEWSHED && bbox.isBoundingBoxContains(element.lat, element.lon)) {
                visibleLocations.add(new Pair<>(element, nodeCoordinates));
            }
        }
    }

    private static Coordinate checkIfViewshed(Element element, Raster raster, Coordinate centerCoordinate, boolean showCenter) {

        BoundingBoxCenter bbox = raster.getBbox();
        Coordinate minCoordinate = new Coordinate(element.bounds.minlat, element.bounds.minlon);
        Coordinate maxCoordinate = new Coordinate(element.bounds.maxlat, element.bounds.maxlon);

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
                    if (bbox.isBoundingBoxContains(cellCoordinate.getLat(), cellCoordinate.getLon())) {
                        if (showCenter)
                            return centerCoordinate;
                        else {
                            double distanceCenter = LocationUtils.distance(cellCoordinate.getLat(), centerCoordinate.getLat(), cellCoordinate.getLon(), centerCoordinate.getLon(), 0, 0);//LocationUtils.euclideanDistance(x,y, center.getValue0(), center.getValue1());
                            if (showCoordinate == null || distanceCenter < currentDistance) {
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
