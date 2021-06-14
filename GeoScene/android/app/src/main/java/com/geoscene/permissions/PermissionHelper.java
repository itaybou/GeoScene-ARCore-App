package com.geoscene.permissions;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public final class PermissionHelper {
    private static final int PERMISSION_CODE = 0;
    private static final String CAMERA_PERMISSION = Manifest.permission.CAMERA;
    private static final String LOCATION_PERMISSION = Manifest.permission.ACCESS_FINE_LOCATION;
    private static final String COARSE_LOCATION_PERMISSION = Manifest.permission.ACCESS_COARSE_LOCATION;
    private static final String INTERNET_PERMISSION = Manifest.permission.INTERNET;
    private static final String BOOT_COMPLETED_PERMISSION = Manifest.permission.RECEIVE_BOOT_COMPLETED;
    private static final String WRITE_EXTERNAL_STORAGE_PERMISSION = Manifest.permission.WRITE_EXTERNAL_STORAGE;
    private static final String NETWORK_STATE_PERMISSION = Manifest.permission.ACCESS_NETWORK_STATE;

    /**
     * Check to see we have the necessary permissions for this app.
     */
    public static boolean hasPermission(Activity activity) {
        return ContextCompat.checkSelfPermission(activity, CAMERA_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, LOCATION_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, COARSE_LOCATION_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, INTERNET_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, BOOT_COMPLETED_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, WRITE_EXTERNAL_STORAGE_PERMISSION) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(activity, NETWORK_STATE_PERMISSION) == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * Check to see we have the necessary permissions for this app, and ask for them if we don't.
     */
    public static void requestPermission(Activity activity) {
        ActivityCompat.requestPermissions(activity, new String[]{CAMERA_PERMISSION, LOCATION_PERMISSION, COARSE_LOCATION_PERMISSION,
                        INTERNET_PERMISSION, BOOT_COMPLETED_PERMISSION, WRITE_EXTERNAL_STORAGE_PERMISSION, NETWORK_STATE_PERMISSION},
                PERMISSION_CODE);
    }

    /** Check to see if we need to show the rationale for this permission. */
    public static boolean shouldShowRequestPermissionRationale(Activity activity) {
        return ActivityCompat.shouldShowRequestPermissionRationale(activity, CAMERA_PERMISSION) || ActivityCompat.shouldShowRequestPermissionRationale(activity, LOCATION_PERMISSION);
    }

    /** Launch Application Setting to grant permission. */
    public static void launchPermissionSettings(Activity activity) {
        Intent intent = new Intent();
        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", activity.getPackageName(), null));
        activity.startActivity(intent);
    }
}
