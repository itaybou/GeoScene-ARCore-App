package com.geoscene.elevation;

import com.geoscene.utils.mercator.BoundingBox;

import java.util.concurrent.CountDownLatch;

public interface TopographyProvider {

    static void fetchTopographyData(BoundingBox bbox, CountDownLatch latch) {};
    Raster getRaster();
}
