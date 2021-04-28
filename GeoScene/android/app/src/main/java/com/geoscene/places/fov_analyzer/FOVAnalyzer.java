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
import java.util.List;
import java.util.stream.Collectors;

public class FOVAnalyzer {

    private static final String TAG = "FOVAnalyzer";

    public static List<Pair<Element, Coordinate>> intersectVisiblePlaces(Raster raster, PointsOfInterest placesResult) {
        CellType[][] viewshed = raster.getViewshed();
        if (viewshed == null) {
            Log.d(TAG, "here");
            return placesResult.elements.stream().map(element -> {
                if (element.type.equals("node"))
                    return new Pair<>(element, new Coordinate(element.lat, element.lon));

                Coordinate minCoordinate = new Coordinate(element.bounds.minlat, element.bounds.minlon);
                Coordinate maxCoordinate = new Coordinate(element.bounds.maxlat, element.bounds.maxlon);
                return new Pair<>(element, new Coordinate(
                        (minCoordinate.getLat() + maxCoordinate.getLat()) / 2,
                        (minCoordinate.getLon() + maxCoordinate.getLon()) / 2));
            }).collect(Collectors.toList());
        }

        List<Pair<Element, Coordinate>> visibleLocations = new ArrayList<>();
        for (Element element : placesResult.elements) {
            if (element.type.equals("node")) {
                Coordinate nodeCoordinates = new Coordinate(element.lat, element.lon);
                Pair<Integer, Integer> node = raster.getRowColByCoordinates(nodeCoordinates);
                if (element.tags.name != null && viewshed[node.getValue1()][node.getValue0()] == CellType.VIEWSHED) {
                    visibleLocations.add(new Pair<>(element, nodeCoordinates));
                }
            } else {
                Coordinate minCoordinate = new Coordinate(element.bounds.minlat, element.bounds.minlon);
                Coordinate maxCoordinate = new Coordinate(element.bounds.maxlat, element.bounds.maxlon);
                Pair<Integer, Integer> minNode = raster.getRowColByCoordinates(minCoordinate);
                Pair<Integer, Integer> maxNode = raster.getRowColByCoordinates(maxCoordinate);

                int dx = Math.abs(maxNode.getValue0() - minNode.getValue0() + 1);
                int dy = Math.abs(maxNode.getValue1() - minNode.getValue1() + 1);

                int minY = Math.min(minNode.getValue1(), maxNode.getValue1());
                int minX = Math.min(minNode.getValue0(), maxNode.getValue0());

                boolean intersection = false;
                for (int y = minY; y < minY + dy && !intersection; ++y) {
                    for (int x = minX; x < minX + dx && !intersection; ++x) {
                        if (viewshed[y][x] == CellType.VIEWSHED) {
                            Pair<Element, Coordinate> location = new Pair<>(element, new Coordinate(
                                    (minCoordinate.getLat() + maxCoordinate.getLat()) / 2,
                                    (minCoordinate.getLon() + maxCoordinate.getLon()) / 2));
                            visibleLocations.add(location);
                            intersection = true;
                        }
                    }
                }

//                System.out.println();
//                List<Pair<Double, Double>> list = element.geometry.stream().map(b)element.bounds.minlat
//                List<Pair<Double, Double>> list = element.geometry.stream().map(b -> new Pair<>(SphericalMercator.lon2x(b.lon), SphericalMercator.lat2y(b.lat))).collect(Collectors.toList());
//                double maxX = Double.MIN_VALUE, maxY = Double.MIN_VALUE;
//                double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE;
//                for(Pair<Double, Double> p : list) {
//                    if(p.getValue0() > maxX) {
//                        maxX = p.getValue0();
//                    }
//                    if(p.getValue1() > maxY) {
//                        maxY = p.getValue1();
//                    }
//                    if(p.getValue0() < minX) {
//                        minX = p.getValue0();
//                    }
//                    if(p.getValue1() < minY) {
//                        minY = p.getValue1();
//                    }
//                }
//
//                double finalMinX = minX;
//                double finalMaxX = maxX;
//                double finalMaxY = maxY;
//                double finalMinY = minY;
//                list = list.stream().map(p -> new Pair<>(normalize(p.getValue0(), finalMinX, finalMaxX), normalize(p.getValue1(), finalMinY, finalMaxY))).collect(Collectors.toList());
//
//                paintOnXY(list);
//                break;
            }
        }
//        System.out.println("Intersection Time: " + (System.currentTimeMillis() - time));
//        System.out.println(visibleLocations);
        return visibleLocations;
    }

    private static double normalize(double x, double minX, double maxX) {
        int range = 100;
        double norm = range * ((x - minX) / (maxX - minX));
        return norm;
    }

    private static void paintOnXY(List<Pair<Double, Double>> xy) throws FileNotFoundException {
        Integer[][] plane = new Integer[250][250];
        int i = 1;
        for (Pair<Double, Double> p : xy) {
            if (i == 1 || i % 3 == 0) {
                int x = (int) Math.floor(p.getValue0());
                int y = (int) Math.floor(p.getValue1());
                plane[y][x] = i;
            }
            i++;
        }

        for (Integer[] row : plane) {
            for (Integer n : row) {
                System.out.print(n == null ? "  " : n + "  ");
            }
            System.out.println();
        }

        try (PrintWriter out = new PrintWriter("bullshit.txt")) {
            for (Integer[] row : plane) {
                for (Integer n : row) {
                    out.print(n == null ? "  " : n + "  ");
                }
                out.println("\n");
            }
        }
    }
}
