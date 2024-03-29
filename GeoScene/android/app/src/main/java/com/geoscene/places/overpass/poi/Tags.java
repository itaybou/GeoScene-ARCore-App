package com.geoscene.places.overpass.poi;

import com.google.gson.annotations.SerializedName;

import io.realm.RealmObject;

public class Tags extends RealmObject {
    @SerializedName("type")
    public String type;

    @SerializedName("amenity")
    public String amenity;

    @SerializedName("place")
    public String place;

    @SerializedName("natural")
    public String natural;

    @SerializedName("historic")
    public String historic;

    @SerializedName("created_by")
    public String createdBy;

    @SerializedName("landuse")
    public String landuse;

    @SerializedName("name")
    public String name;

    @SerializedName("name:he")
    public String nameHeb;

    @SerializedName("name:en")
    public String nameEng;

    @SerializedName("name:ar")
    public String nameAr;

    @SerializedName("image")
    public String image;

    @SerializedName("phone")
    public String phone;

    @SerializedName("contact:email")
    public String contactEmail;

    @SerializedName("website")
    public String website;

    @SerializedName("addr:city")
    public String addressCity;

    @SerializedName("addr:postcode")
    public String addressPostCode;

    @SerializedName("addr:street")
    public String addressStreet;

    @SerializedName("addr:housenumber")
    public String addressHouseNumber;
}