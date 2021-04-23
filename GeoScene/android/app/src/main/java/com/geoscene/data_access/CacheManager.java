package com.geoscene.data_access;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.location.Location;
import android.util.Log;

import com.geoscene.constants.LocationConstants;
import com.geoscene.sensors.DeviceSensors;
import com.geoscene.utils.Coordinate;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import java.util.concurrent.TimeUnit;

public class CacheManager extends JobService {
    private static final String TAG = "CacheManager";
    private static final int JOB_ID = 1;
    private static final long RUN_INTERVAL_MILLIS = TimeUnit.MINUTES.toMillis(15); // 30 min
    private static final long DELETE_SEC_THRESHOLD = TimeUnit.MINUTES.toSeconds(20);
    private static boolean jobCanceled = false;
    private static boolean jobActive = false;

    public static void schedule(Context context) {
        if(!jobActive) {
            Log.d(TAG, "Starting cache cleaner service.");
            jobActive = true;
            JobScheduler jobScheduler = (JobScheduler)
                    context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            ComponentName componentName = new ComponentName(context, CacheManager.class);
            JobInfo.Builder builder = new JobInfo.Builder(JOB_ID, componentName);
            builder.setPeriodic(RUN_INTERVAL_MILLIS, TimeUnit.MINUTES.toMillis(5));
            builder.setPersisted(true);
            builder.setRequiresDeviceIdle(false);
            jobScheduler.schedule(builder.build());
        }
    }

    public static void cancel(Context context) {
        jobActive = false;
        Log.d(TAG, "Canceling cache cleaner service.");
        JobScheduler jobScheduler = (JobScheduler)
                context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        jobScheduler.cancel(JOB_ID);
    }

    public static PersistLocationObject fetchFromCache(BoundingBoxCenter bbox) {
        return StorageAccess.fetchLocationInfo(bbox);
    }

    public static void clearCache(Context context) {
        long deleteTimestamp = (System.currentTimeMillis() / 1000L) - DELETE_SEC_THRESHOLD;
        StorageAccess.deleteCachedLocationInfoByTimestamp(context, deleteTimestamp);
        Log.d(TAG, "Cache cleared");
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.d(TAG, "Starting cache cleaner job.");
        new Thread(() -> {
            if(jobCanceled) return;
            clearCache(getApplicationContext());
            Log.d(TAG, "Cache cleaner job finished.");
            jobFinished(params, false);
        }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        Log.d(TAG, "Cache cleaner job canceled.");
        jobCanceled = true;
        return false;
    }
}
