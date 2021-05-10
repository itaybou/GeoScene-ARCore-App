package com.geoscene.oauth.services;

import com.github.scribejava.core.model.OAuthConfig;
import com.github.scribejava.core.model.OAuthRequest;
import com.github.scribejava.core.model.Verb;

public class OSMOAuthRequest extends OAuthRequest {

    private Verb verb;
    public OSMOAuthRequest(Verb verb, String url, OAuthConfig config) {
        super(verb, url, config);
        this.verb = verb;
    }

    @Override
    protected boolean hasBodyContent() {
        return verb == Verb.PUT || verb == Verb.POST || verb == Verb.DELETE;
    }
}
