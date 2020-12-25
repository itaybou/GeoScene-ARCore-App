package open_topo;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import mercator.BoundingBox;
import mercator.Coordinate;
import okhttp3.OkHttpClient;
import okhttp3.ResponseBody;
import org.javatuples.Pair;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class OpenTopoClient {
    public static final String TAG = "OPEN_TOPO_API";
    public static final String BASE_URL = "https://portal.opentopography.org/";
    public static final String DEM = "SRTMGL3";
    public static final String FORMAT = "AAIGrid";
    public static Retrofit retrofit;

    private static long debugTime;

    private static Raster raster;

    public static final int TIMEOUT_MIN = 2;

    /*
    This public static method will return Retrofit client
    anywhere in the appplication
    */
    private static Retrofit getRetrofitClient(){
        //If condition to ensure we don't create multiple retrofit instances in a single application
        if (retrofit == null) {
            OkHttpClient.Builder httpClient = new OkHttpClient.Builder()
                    .connectTimeout(TIMEOUT_MIN, TimeUnit.MINUTES)
                    .readTimeout(TIMEOUT_MIN,TimeUnit.MINUTES);
            //Defining the Retrofit using Builder
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)   //This is the only mandatory call on Builder object.
                    .client(httpClient.build())
                    .build();
        }
        return retrofit;
    }

    public static void getTopoData(BoundingBox bbox, CountDownLatch latch) {
        debugTime = System.currentTimeMillis();
        Retrofit retrofit= getRetrofitClient();
        OpenTopoService api = retrofit.create(OpenTopoService.class);
        Call<ResponseBody> call = api.getElevationData(DEM, bbox.getSouth(), bbox.getNorth(), bbox.getWest(), bbox.getEast(), FORMAT);
        System.out.println("("+bbox.getSouth()+ "," + bbox.getNorth()+ "," + bbox.getWest()+ "," + bbox.getEast() + ")");
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    new Thread(() -> {
                        assert response.body() != null;
                        try {
                            raster = ASCIIGridParser.parseASCIIGrid(response.body().byteStream());
                            latch.countDown();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }).start();
                }else {
                    System.out.println("KAKA");
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                System.out.println("BASSA");
            }
        });
    }

    public static Raster getRaster() {
        return raster;
    }
}
