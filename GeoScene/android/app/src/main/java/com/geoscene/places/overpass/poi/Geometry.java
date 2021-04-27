package com.geoscene.places.overpass.poi;

import com.google.gson.annotations.SerializedName;

import io.realm.RealmObject;

public class Geometry extends RealmObject {
    @SerializedName("lat")
    public double lat;

    @SerializedName("lon")
    public double lon;
}