package com.geoscene.data_access;

import android.content.Context;

import com.geoscene.data_access.dto.BoundingBoxDTO;
import com.geoscene.data_access.dto.RasterDTO;
import com.geoscene.elevation.Raster;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import io.realm.Realm;
import io.realm.RealmList;

public class StorageAccess {

    public static void storeBoundingBox(BoundingBoxCenter bbox) {
        try(Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransactionAsync(transaction ->
                transaction.insert(new BoundingBoxDTO(bbox))
            );
        }

        try(Realm realm = Realm.getDefaultInstance()) {
        }
    }

    public static void storeLocationInfo(Context context, boolean cached, BoundingBoxCenter bbox, Raster raster) {
        try(Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransactionAsync(transaction -> {
                PersistLocationObject persist = new PersistLocationObject(cached, bbox, raster);
                InternalStorage.store(context, persist.getRasterElevationFilename(), raster.getElevations());
                transaction.insert(persist);
            });
        }

        try(Realm realm = Realm.getDefaultInstance()) {
        }
    }
}
