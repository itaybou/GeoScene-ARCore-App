package open_topography;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.Query;
import retrofit2.http.Streaming;

public interface OpenTopographyService {

    @Streaming
    @GET("/API/globaldem")
    @Headers("Connection:close")
    Call<ResponseBody> getElevationData(@Query("demtype") String demType,
                                        @Query("south") double south,
                                        @Query("north") double north,
                                        @Query("west") double west,
                                        @Query("east") double east,
                                        @Query("outputFormat") String outputFormat);
}
