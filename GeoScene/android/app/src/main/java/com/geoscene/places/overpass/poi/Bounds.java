package com.geoscene.places.overpass.poi;

import com.google.gson.annotations.SerializedName;

import io.realm.RealmObject;

public class Bounds extends RealmObject {
    @SerializedName("minlat")
    public double minlat;

    @SerializedName("minlon")
    public double minlon;

    @SerializedName("maxlat")
    public double maxlat;

    @SerializedName("maxlon")
    public double maxlon;

}