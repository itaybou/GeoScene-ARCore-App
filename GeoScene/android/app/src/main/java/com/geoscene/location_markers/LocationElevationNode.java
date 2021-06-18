package com.geoscene.location_markers;

import com.google.ar.sceneform.Node;

public class LocationElevationNode extends Node {

    private int elevation;
    private int index;

    public LocationElevationNode(int elevation, int index) {
        super();
        this.elevation = elevation;
        this.index = index;
    }

    public int getElevation() {
        return elevation;
    }

    public void setElevation(int elevation) {
        this.elevation = elevation;
    }

    public int getIndex() {
        return index;
    }
}
