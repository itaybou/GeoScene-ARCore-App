package com.geoscene.data_access;

public interface DataCallback<T> {
    void onDataFetched(T data);
    void onError(String message);
}
