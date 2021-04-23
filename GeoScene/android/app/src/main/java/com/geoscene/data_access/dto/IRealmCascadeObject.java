package com.geoscene.data_access.dto;

import io.realm.RealmObject;

public abstract class RealmCascadeObject implements RealmObject {
    public abstract void cascadeDelete();
}
