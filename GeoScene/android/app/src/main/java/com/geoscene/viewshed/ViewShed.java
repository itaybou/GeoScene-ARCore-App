package com.geoscene.viewshed;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.esri.arcgisruntime.concurrent.Job;
import com.esri.arcgisruntime.concurrent.ListenableFuture;
import com.esri.arcgisruntime.data.Feature;
import com.esri.arcgisruntime.data.FeatureCollectionTable;
import com.esri.arcgisruntime.data.FeatureSet;
import com.esri.arcgisruntime.data.Field;
import com.esri.arcgisruntime.geometry.Geometry;
import com.esri.arcgisruntime.geometry.GeometryType;
import com.esri.arcgisruntime.geometry.Point;
import com.esri.arcgisruntime.geometry.SpatialReference;
import com.esri.arcgisruntime.loadable.LoadStatus;
import com.esri.arcgisruntime.mapping.ArcGISMap;
import com.esri.arcgisruntime.mapping.Basemap;
import com.esri.arcgisruntime.mapping.view.Graphic;
import com.esri.arcgisruntime.tasks.geoprocessing.GeoprocessingFeatures;
import com.esri.arcgisruntime.tasks.geoprocessing.GeoprocessingJob;
import com.esri.arcgisruntime.tasks.geoprocessing.GeoprocessingParameters;
import com.esri.arcgisruntime.tasks.geoprocessing.GeoprocessingResult;
import com.esri.arcgisruntime.tasks.geoprocessing.GeoprocessingTask;
import com.geoscene.R;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

public class ViewShed {
    private int radius;

    Activity activity;
    Context context;

    private final int WEB_MERCATOR = 3857;

    private GeoprocessingJob mGeoprocessingJob;

    private static List<Geometry> geometries = null;

    // objects that implement Loadable must be class fields to prevent being garbage collected before loading
    private FeatureCollectionTable mFeatureCollectionTable;

    public ViewShed(int radius, Context context, Activity activity) {
        this.radius = radius;
        this.context = context;
        this.activity = activity;

    }

    public void calculateViewshed(float lat, float lon) {

    }
}
