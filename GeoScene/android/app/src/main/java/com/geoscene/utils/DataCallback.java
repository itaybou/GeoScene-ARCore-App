package com.geoscene.utils;

public interface DataCallback<T> {
    void onDataFetched(T data);
    void onError(String message);
}
