package com.geoscene.data_access;

import android.content.Context;
import android.util.Log;

import com.geoscene.elevation.Raster;
import com.geoscene.places.overpass.poi.PointsOfInterest;
import com.geoscene.geography.mercator.BoundingBoxCenter;

import org.javatuples.Pair;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

import io.realm.Realm;
import io.realm.RealmResults;
import io.realm.exceptions.RealmException;

public class StorageAccess {

    private static final String TAG = "StorageAccess";
    private static final double BBOX_TOLERENCE = 1e-3;

    public static PersistLocationObject fetchLocationInfo(BoundingBoxCenter bbox) {
        try (Realm realm = Realm.getDefaultInstance()) {
            PersistLocationObject locationData = realm.where(PersistLocationObject.class)
                    .lessThanOrEqualTo("bbox.south", bbox.getSouth() + BBOX_TOLERENCE)
                    .lessThanOrEqualTo("bbox.west", bbox.getWest() + BBOX_TOLERENCE)
                    .greaterThanOrEqualTo("bbox.north", bbox.getNorth() - BBOX_TOLERENCE)
                    .greaterThanOrEqualTo("bbox.east", bbox.getEast() - BBOX_TOLERENCE)
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

    public static List<PersistLocationObject> fetchPersistedLocationData() {
        try (Realm realm = Realm.getDefaultInstance()) {
            RealmResults<PersistLocationObject> locationData = realm.where(PersistLocationObject.class)
                    .equalTo("cached", false)
                    .findAll();
            return realm.copyFromRealm(locationData);
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

    public static void deletePersistedLocationInfoById(Context context, String id) {
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransaction(transaction -> {
                PersistLocationObject locationData = transaction.where(PersistLocationObject.class)
                        .equalTo("cached", false)
                        .equalTo("id", id)
                        .findFirst();

                InternalStorage.delete(context, locationData.getRasterElevationFilename());
                locationData.cascadeDelete();
            });
        } catch (Exception e) {
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

                for (PersistLocationObject locationInfo : locationData) {
                    InternalStorage.delete(context, locationInfo.getRasterElevationFilename());
                    locationInfo.cascadeDelete();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    public static Pair<Integer, Integer> deleteCachedLocations(Context context) {
        AtomicInteger cachedCount = new AtomicInteger();
        AtomicInteger cachedLocationCount = new AtomicInteger();
        try (Realm realm = Realm.getDefaultInstance()) {
            realm.executeTransaction(transaction -> {
                RealmResults<PersistLocationObject> locationData = transaction.where(PersistLocationObject.class)
                        .equalTo("cached", true)
                        .findAll();

                cachedCount.set(locationData.size());
                for (PersistLocationObject locationInfo : locationData) {
                    cachedLocationCount.set(cachedLocationCount.get() + locationInfo.pois.elements.size());
                    InternalStorage.delete(context, locationInfo.getRasterElevationFilename());
                    locationInfo.cascadeDelete();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
        return new Pair<>(cachedCount.get(), cachedLocationCount.get());
    }

}
