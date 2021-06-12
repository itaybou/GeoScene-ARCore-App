package com.geoscene.places.overpass.poi;

import android.util.Log;

import com.geoscene.data_access.dto.IRealmCascadeObject;
import com.google.gson.annotations.SerializedName;

import io.realm.Realm;
import io.realm.RealmList;
import io.realm.RealmObject;

public class Element extends RealmObject implements IRealmCascadeObject  {
    @SerializedName("type")
    public String type;

    @SerializedName("id")
    public long id;

    @SerializedName("lat")
    public double lat;

    @SerializedName("lon")
    public double lon;

    @SerializedName("bounds")
    public Bounds bounds;

    @SerializedName("tags")
    public Tags tags = new Tags();

    @SerializedName("geometry")
    public RealmList<Geometry> geometry = new RealmList<>();

    @Override
    public void cascadeDelete() {
        Log.d("PersistLocationObject", tags.name == null? "null" : tags.name);
        tags.deleteFromRealm();
        if(bounds != null) {
            bounds.deleteFromRealm();
        }
        geometry.deleteAllFromRealm();
        deleteFromRealm();
    }
}
