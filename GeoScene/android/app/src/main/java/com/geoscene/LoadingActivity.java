package com.geoscene;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.geoscene.permissions.PermissionHelper;

import org.devio.rn.splashscreen.SplashScreen;

public class LoadingActivity extends AppCompatActivity {
    AlertDialog alertDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(!PermissionHelper.hasPermission(this)) {
            PermissionHelper.requestPermission(this);
        } else {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        }
    }

    private void openAlertDialog() {
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
        alertDialogBuilder.setTitle("GeoScene Requires Permissions");
        alertDialogBuilder.setMessage("Allow GeoScene permissions in order to continue using the application.");

        alertDialogBuilder.setNeutralButton("Open Settings", (dialog, which) -> {
            PermissionHelper.launchPermissionSettings(this);
        });

        alertDialogBuilder.setPositiveButton("OK", (dialog, which) -> {
            PermissionHelper.requestPermission(this);
        });

        alertDialogBuilder.setNegativeButton("Close", (dialog, which) -> {
            finish();
        });

        alertDialog = alertDialogBuilder.create();
        alertDialog.show();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if(!PermissionHelper.hasPermission(this)) {
            openAlertDialog();
        } else {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onDestroy() {
        if(alertDialog != null) {
            alertDialog.dismiss();
        }
        super.onDestroy();
    }
}