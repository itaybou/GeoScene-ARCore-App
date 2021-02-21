package overpass;

import fov_analyzer.FOVAnalyzer;
import mercator.SphericalMercator;
import open_topography.CellType;
import open_topography.Raster;
import overpass.queries.output.OutputModificator;
import overpass.queries.output.OutputOrder;
import overpass.queries.output.OutputVerbosity;
import overpass.queries.query.OverpassQuery;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.HashSet;

import static overpass.queries.output.OutputFormat.JSON;

public class OverpassInterpreter {

    public void search(Raster raster, CellType[][] viewshed) {
        OverpassQuery query = new OverpassQuery()
                .format(JSON)
                .timeout(30)
                .filterQuery()
                .way()
                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village")))
                .around(50000, 31.712730622002724, 34.580646038992704)
//                .prepareNext()
//                .way()
//                .tagMultiple("natural", new HashSet<>(Arrays.asList("sand", "wood", "peak")))
//                .around(50000, 31.712730622002724, 34.580646038992704)
//                .prepareNext()
//                .rel()
//                .tagMultiple("place", new HashSet<>(Arrays.asList("city", "town", "village")))
//                .around(50000, 31.780850160208008, 34.69151594355443)
                .end()
                .output(OutputVerbosity.BODY, OutputModificator.BB, OutputOrder.QT);

        System.out.println(query.build());
        interpret(query.build(), raster, viewshed);
    }

    private void interpret(String query, Raster raster, CellType[][] viewshed) {
        long time = System.currentTimeMillis();
        try {
            OverpassServiceProvider.get().interpreter(query).enqueue(new Callback<>() {
                @Override
                public void onResponse(Call<OverpassQueryResult> call, Response<OverpassQueryResult> response) {
                    if (response.isSuccessful()) {
                        System.out.println("Query time 50km: " + ((double) (System.currentTimeMillis() - time) / 1000) + "sec");
                        assert response.body() != null;
                        try {
                            FOVAnalyzer.intersectVisible(raster, viewshed, response.body());
                        } catch (FileNotFoundException e) {
                            e.printStackTrace();
                        }
                        response.body().elements.forEach(e -> {
                                    System.out.println(e.type);
                                    System.out.println("Name: " + e.tags.name +
                                            " | lon, lat: (" + e.lon + ", " + e.lat + "), " +
                                            "XY: (" + SphericalMercator.lon2x(e.lon) + ", " + SphericalMercator.lat2y(e.lat) + ")");
                        });
                    }
                }

                @Override
                public void onFailure(Call<OverpassQueryResult> call, Throwable throwable) {
                    System.err.println("Error");
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
