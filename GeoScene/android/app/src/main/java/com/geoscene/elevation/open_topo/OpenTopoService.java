package com.geoscene.elevation.open_topo;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.Query;
import retrofit2.http.Streaming;

public interface OpenTopoService {

    @Streaming
    @GET("/API/globaldem")
    @Headers("Connection:close")
    Call<ResponseBody> getElevationData(@Query("demtype") String demType, @Query("south") float south, @Query("north") float north, @Query("west") float west, @Query("east") float east, @Query("outputFormat") String outputFormat);
}
