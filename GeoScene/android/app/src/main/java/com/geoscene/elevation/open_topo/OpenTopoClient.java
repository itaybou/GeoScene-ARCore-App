package com.geoscene.elevation.open_topo;

import android.icu.text.UFormat;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.ResponseBody;
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

    public static void getTopoData() {
        debugTime = System.currentTimeMillis();
        Retrofit retrofit= getRetrofitClient();
        OpenTopoService api = retrofit.create(OpenTopoService.class);
        Log.d(TAG, "retrofit!");
        Call<ResponseBody> call = api.getElevationData(DEM,31.432719f, 31.923523f, 34.904703f, 35.517811f, FORMAT);
        Log.d(TAG, call.request().toString());
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(@NonNull Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Log.d(TAG, "server contacted and has file");
                    new Thread(() -> {
                        // do background stuff here
                        assert response.body() != null;
                        Log.d(TAG, call.request().toString());
                        Log.d(TAG, "Request time: " + (System.currentTimeMillis() - debugTime) + " ms");
                        try {
                            ArcASCIIGridParser.parseASCIIGrid(response.body().byteStream());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }

                        Log.d(TAG, "file download was a success? ");
                    }).start();
                }else {
                    Log.d(TAG, "server contact failed");
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Log.e(TAG, t.toString());
                Log.e(TAG, call.request().toString());
                Log.e(TAG, "error");
            }
        });
    }
}
