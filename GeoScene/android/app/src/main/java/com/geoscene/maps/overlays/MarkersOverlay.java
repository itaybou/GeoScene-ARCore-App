package com.geoscene.maps.overlays;

import android.content.Context;
import android.view.MotionEvent;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.geoscene.R;

import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.Projection;
import org.osmdroid.views.overlay.ItemizedIconOverlay;
import org.osmdroid.views.overlay.Overlay;
import org.osmdroid.views.overlay.OverlayItem;

import java.util.ArrayList;
import java.util.Objects;
import java.util.concurrent.Callable;

public class MarkersOverlay extends Overlay {

    private Context context;

    private Runnable onLocationTapped;

    public MarkersOverlay(Context context, Runnable onLocationTapped) {
        this.context = context;
        this.onLocationTapped = onLocationTapped;
    }


}
