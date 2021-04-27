package com.geoscene.data_access;

import android.content.Context;
import android.util.Log;

import com.geoscene.elevation.Raster;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.utils.mercator.BoundingBoxCenter;

import org.bson.types.ObjectId;

import java.util.Arrays;
import java.util.Objects;
import java.util.UUID;

import io.realm.OrderedRealmCollection;
import io.realm.Realm;
import io.realm.RealmChangeListener;
import io.realm.RealmResults;
import io.realm.exceptions.RealmException;

public class StorageAccess {

    private static final String TAG = "StorageAccess";
    private static final double BBOX_TOLERENCE = Math.pow(1, -5);

    public static PersistLocationObject fetchLocationInfo(BoundingBoxCenter bbox) {
        try (Realm realm = Realm.getDefaultInstance()) {
            Log.d("DB TEST", bbox.toString());
            PersistLocationObject locationData = realm.where(PersistLocationObject.class)
                    .greaterThanOrEqualTo("bbox.south", bbox.getSouth() - BBOX_TOLERENCE)
                    .greaterThanOrEqualTo("bbox.west", bbox.getWest() - BBOX_TOLERENCE)
                    .lessThanOrEqualTo("bbox.north", bbox.getNorth() + BBOX_TOLERENCE)
                    .lessThanOrEqualTo("bbox.east", bbox.getEast() + BBOX_TOLERENCE)
                    .findFirst();
            if (locationData != null) {
                PersistLocationObject locationDataCopy = realm.copyFromRealm(locationData);
                realm.executeTransactionAsync(transaction ->
                        Objects.requireNonNull(transaction.where(PersistLocationObject.class).equalTo("id", locationDataCopy.id).findFirst()).setLastAccessTimestamp()
                );
                return locationDataCopy;
            }
        } catch (RealmException | NullPointerException e) {
            Log.e(TAG, e.getMessage());
        }
        return null;
    }

    public static void storeCacheLocationInfo(Context context, BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransactionAsync(transaction -> {
                PersistLocationObject persist = new PersistLocationObject(bbox, raster, pois);
                InternalStorage.store(context, persist.getRasterElevationFilename(), raster.getElevations());
                transaction.insert(persist);
            });
        } catch (RealmException e) {
            Log.e(TAG, e.getMessage());
        }
    }

    public static void storeLocationInfo(Context context, String name, String description, BoundingBoxCenter bbox, Raster raster, PointsOfInterest pois) {
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransactionAsync(transaction -> {
                PersistLocationObject persist = new PersistLocationObject(name, description, bbox, raster, pois);
                InternalStorage.store(context, persist.getRasterElevationFilename(), raster.getElevations());
                transaction.insert(persist);
            });
        } catch (RealmException e) {
            Log.e(TAG, e.getMessage());
        }
    }

    public static void deleteCachedLocationInfoByTimestamp(Context context, long deleteTimestamp) {
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransactionAsync(transaction -> {
                RealmResults<PersistLocationObject> locationData = transaction.where(PersistLocationObject.class)
                        .equalTo("cached", true)
                        .lessThanOrEqualTo("lastAccessTimestamp", deleteTimestamp)
                        .findAll();

//                    OrderedRealmCollection<PersistLocationObject> orderedLocationData = changedLocationData.createSnapshot();
                Log.d(TAG, String.format("Fetched %d persisted items from realm.", locationData.size()));
                for (PersistLocationObject locationInfo : locationData) {
                    InternalStorage.delete(context, locationInfo.getRasterElevationFilename());
                    Log.d(TAG, locationInfo.getRasterElevationFilename());
                    locationInfo.cascadeDelete();
                    Log.d(TAG, "here");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

}
