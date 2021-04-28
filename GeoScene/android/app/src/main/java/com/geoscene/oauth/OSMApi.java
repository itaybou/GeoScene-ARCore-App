package com.geoscene.oauth;

import com.github.scribejava.apis.TwitterApi;
import com.github.scribejava.core.builder.api.DefaultApi10a;
import com.github.scribejava.core.model.OAuth1RequestToken;

public class OSMApi extends DefaultApi10a {

    private static final String AUTHORIZE_URL = "www.openstreetmap.org/oauth/authorize";
    private static final String REQUEST_TOKEN_RESOURCE = "www.openstreetmap.org/oauth/request_token";
    private static final String ACCESS_TOKEN_RESOURCE = "www.openstreetmap.org/oauth/access_token";

    protected OSMApi() {
    }

    private static class InstanceHolder {
        private static final OSMApi INSTANCE = new OSMApi();
    }

    public static OSMApi instance() {
        return InstanceHolder.INSTANCE;
    }

    @Override
    public String getAccessTokenEndpoint() {
        return "https://" + ACCESS_TOKEN_RESOURCE;
    }

    @Override
    public String getAuthorizationUrl(OAuth1RequestToken requestToken) {
        return "https://" + AUTHORIZE_URL + "?oauth_token=" + requestToken.getToken();
    }

    @Override
    public String getRequestTokenEndpoint() {
        return "https://" + REQUEST_TOKEN_RESOURCE;
    }

}
