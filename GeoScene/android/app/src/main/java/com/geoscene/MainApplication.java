package com.geoscene;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;
import com.geoscene.oauth.OAuthManagerPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.geoscene.ar.modules.RNGeoARScenePackage;
import com.geoscene.maps.modules.RNMapsPackage;

import com.facebook.react.modules.network.OkHttpClientProvider;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import io.realm.Realm;
import io.realm.RealmConfiguration;
import okhttp3.OkHttpClient;

//import io.realm.Realm;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
            packages.add(new RNMapsPackage());
            packages.add(new RNGeoARScenePackage());
            packages.add(new OAuthManagerPackage());

            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
//    Realm.init(this);
//    RealmConfiguration realmConfiguration = new RealmConfiguration.Builder()
//              .name("default.realm")
//              .schemaVersion(0)
//              .deleteRealmIfMigrationNeeded()
//              .build();
//    Realm.setDefaultConfiguration(realmConfiguration); // Make this Realm the default


//    Log.d("REALM", Realm.getDefaultConfiguration().getPath());
//
//  Stetho.initialize(
//          Stetho.newInitializerBuilder(this)
//                  .enableDumpapp(Stetho.defaultDumperPluginsProvider(this))
//                  .enableWebKitInspector(RealmInspectorModulesProvider.builder(this).build())
//                  .build());
//      Stetho.initialize(
//              Stetho.newInitializerBuilder(this)
//                      .enableDumpapp(Stetho.defaultDumperPluginsProvider(this))
//                      .enableWebKitInspector(Stetho.defaultInspectorModulesProvider(this))
//              //enableWebKitInspector(RealmInspectorModulesProvider.builder(this).build())
//                      .build());
//      OkHttpClientProvider.setOkHttpClientFactory(
//              new NetworkDebugModule());
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.geoscene.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}



//class NetworkDebugModule implements OkHttpClientFactory {
//    public OkHttpClient createNewNetworkModuleClient() {
//        return new OkHttpClient.Builder()
//                .connectTimeout(0, TimeUnit.MILLISECONDS)
//                .readTimeout(0, TimeUnit.MILLISECONDS)
//                .writeTimeout(0, TimeUnit.MILLISECONDS)
//                .cookieJar(new ReactCookieJarContainer())
//                .addNetworkInterceptor(new StethoInterceptor())
//                .build();
//    }
//}
