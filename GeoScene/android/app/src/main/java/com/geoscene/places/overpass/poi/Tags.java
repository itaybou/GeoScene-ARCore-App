package com.geoscene.places.overpass.poi;

import com.google.gson.annotations.SerializedName;

import io.realm.RealmObject;

public class Tags extends RealmObject {
    @SerializedName("type")
    public String type;

    @SerializedName("amenity")
    public String amenity;

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

    @SerializedName("wheelchair")
    public String wheelchair;

    @SerializedName("wheelchair:description")
    public String wheelchairDescription;

    @SerializedName("opening_hours")
    public String openingHours;

    @SerializedName("internet_access")
    public String internetAccess;

    @SerializedName("fee")
    public String fee;

    @SerializedName("operator")
    public String operator;
}