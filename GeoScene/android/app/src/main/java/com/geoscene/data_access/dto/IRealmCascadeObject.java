package com.geoscene.data_access.dto;

import io.realm.RealmObject;

public interface IRealmCascadeObject {
    void cascadeDelete();
}
