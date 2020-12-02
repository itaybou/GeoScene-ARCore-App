package com.geoscene.elevation.open_topo;

import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Arrays;

import static java.nio.charset.StandardCharsets.UTF_8;

public class ArcASCIIGridParser {
    private static final int HEADERS_LEN = 6;

    public static void parseASCIIGrid(InputStream stream) throws IOException {
        int rows = 0;
        int cols = 0;
        double xll_corner = 0;
        double yll_corner = 0;
        double cellsize = 0;
        int nodata = -9999;
        long debugTime = System.currentTimeMillis();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, UTF_8))) {
            for(int i = 0; i < HEADERS_LEN; ++i) {
                String[] data = reader.readLine().split("\\s+");
                switch(data[0]) {
                    case "ncols":
                        cols = Integer.parseInt(data[1]);
                        break;
                    case "nrows":
                        rows = Integer.parseInt(data[1]);
                        break;
                    case "xllcorner":
                        xll_corner = Double.parseDouble(data[1]);
                        break;
                    case "yllcorner":
                        yll_corner = Double.parseDouble(data[1]);
                        break;
                    case "cellsize":
                        cellsize = Double.parseDouble(data[1]);
                        break;
                    case "NODATA_value":
                        nodata = Integer.parseInt(data[1]);
                        break;
                }
            }

            int[][] elevations = new int[rows][cols];
            String line;
            int i = 0;
            while((line = reader.readLine()) != null && line.length() != 0) {
                int[] data = Arrays.stream(line.trim().split(" ")).mapToInt(Integer::parseInt).toArray();
                elevations[i++] = data;
            }
            Log.d("TAGG", Arrays.deepToString(elevations));
            Log.d("TAGG", "Time: " + (System.currentTimeMillis() - debugTime));
        }
    }
}
