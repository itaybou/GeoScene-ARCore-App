package open_topography;

import java.io.*;
import java.util.Arrays;

import static java.nio.charset.StandardCharsets.UTF_8;

public class ASCIIGridParser {
    private static final int HEADERS_LEN = 6;

    public static Raster parseASCIIGrid(InputStream stream) throws IOException {
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

            String line;
            int i = 0;
            int[][] elevations = new int[rows][cols];
            while((line = reader.readLine()) != null && line.length() != 0) {
                int[] data = Arrays.stream(line.trim().split(" ")).mapToInt(Integer::parseInt).toArray();
                elevations[i++] = data;
            }
            return new Raster(cols, rows, xll_corner, yll_corner, cellsize, elevations);
//            for(int[] row : elevations) {
//                System.out.println(Arrays.toString(row));
//            }
        }
    }
}
