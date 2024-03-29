package com.geoscene.location_markers;

import com.google.ar.sceneform.Node;

public class LocationMarker {

    public String name;
    public final static int MAX_LOCATION_TITLE_LENGTH = 22;

    // Location in real-world terms
    public double longitude;
    public double latitude;

    // Location in AR terms
    public LocationNode anchorNode;

    // Node to render
    public Node node;

    // Called on each frame if not null
    private LocationNodeRender renderEvent;
    private float scaleModifier = 1F;
    private float height = 0F;
    private int onlyRenderWhenWithin = Integer.MAX_VALUE;
    private ScalingMode scalingMode = ScalingMode.FIXED_SIZE_ON_SCREEN;
    private float gradualScalingMinScale = 0.2F;
    private float gradualScalingMaxScale = 0.65F;
    private int distanceGroup;

    public LocationMarker(double longitude, double latitude, Node node) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.node = node;
    }

    public float getGradualScalingMinScale() {
        return gradualScalingMinScale;
    }

    public void setGradualScalingMinScale(float gradualScalingMinScale) {
        this.gradualScalingMinScale = gradualScalingMinScale;
    }

    public float getGradualScalingMaxScale() {
        return gradualScalingMaxScale;
    }

    public void setGradualScalingMaxScale(float gradualScalingMaxScale) {
        this.gradualScalingMaxScale = gradualScalingMaxScale;
    }

    /**
     * Only render this marker when within [onlyRenderWhenWithin] metres
     *
     * @return - metres or -1
     */
    public int getOnlyRenderWhenWithin() {
        return onlyRenderWhenWithin;
    }

    /**
     * Only render this marker when within [onlyRenderWhenWithin] metres
     *
     * @param onlyRenderWhenWithin - metres
     */
    public void setOnlyRenderWhenWithin(int onlyRenderWhenWithin) {
        this.onlyRenderWhenWithin = onlyRenderWhenWithin;
    }

    /**
     * Height based on camera height
     *
     * @return - height in metres
     */
    public float getHeight() {
        return height;
    }

    /**
     * Height based on camera height
     *
     * @param height - height in metres
     */
    public void setHeight(float height) {
        this.height = height;
    }

    /**
     * How the markers should scale
     *
     * @return - ScalingMode
     */
    public ScalingMode getScalingMode() {
        return scalingMode;
    }

    /**
     * Whether the marker should scale, regardless of distance.
     *
     * @param scalingMode - ScalingMode.X
     */
    public void setScalingMode(ScalingMode scalingMode) {
        this.scalingMode = scalingMode;
    }

    /**
     * Scale multiplier
     *
     * @return - multiplier
     */
    public float getScaleModifier() {
        return scaleModifier;
    }

    /**
     * Scale multiplier
     *
     * @param scaleModifier - multiplier
     */
    public void setScaleModifier(float scaleModifier) {
        this.scaleModifier = scaleModifier;
    }

    /**
     * Called on each frame
     *
     * @return - LocationNodeRender (event)
     */
    public LocationNodeRender getRenderEvent() {
        return renderEvent;
    }

    /**
     * Called on each frame.
     */
    public void setRenderEvent(LocationNodeRender renderEvent) {
        this.renderEvent = renderEvent;
    }

    public enum ScalingMode {
        FIXED_SIZE_ON_SCREEN,
        NO_SCALING,
        GRADUAL_TO_MAX_RENDER_DISTANCE,
        GRADUAL_FIXED_SIZE
    }

    public int getDistanceGroup() {
        return distanceGroup;
    }

    public void setDistanceGroup(int distanceGroup) {
        this.distanceGroup = distanceGroup;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.length() > MAX_LOCATION_TITLE_LENGTH ? name.substring(0, MAX_LOCATION_TITLE_LENGTH).trim() + "..." : name;
    }
}
