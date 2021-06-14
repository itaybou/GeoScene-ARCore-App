package com.geoscene;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geoscene.permissions.PermissionHelper;

import org.devio.rn.splashscreen.SplashScreen;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends ReactActivity {

  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this, R.style.SplashTheme);
    if(!PermissionHelper.hasPermission(this)) {
      PermissionHelper.requestPermission(this);
    }
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    if(!PermissionHelper.hasPermission(this)) {
      finish();
    }
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
  }

  @Override
  protected void onDestroy() {
    SplashScreen.hide(this);
    super.onDestroy();
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "GeoScene";
  }

}
