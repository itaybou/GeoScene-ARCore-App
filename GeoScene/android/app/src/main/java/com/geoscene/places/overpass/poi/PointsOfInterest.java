package com.geoscene.places.overpass.poi;

import android.util.Log;

import com.geoscene.data_access.dto.IRealmCascadeObject;
import com.google.gson.annotations.SerializedName;

import io.realm.Realm;
import io.realm.RealmList;
import io.realm.RealmObject;

public class PointsOfInterest extends RealmObject implements IRealmCascadeObject {
    @SerializedName("elements")
    public RealmList<Element> elements = new RealmList<>();

    @Override
    public void cascadeDelete() {
        for (int index = elements.size() - 1; index >= 0; index--) {
            Element element = elements.get(index);
            element.cascadeDelete();
        }
        deleteFromRealm();
    }
}

