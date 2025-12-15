package org.openremote.manager.exception;

import jakarta.ws.rs.core.Response;

public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(message, Response.Status.UNAUTHORIZED);
    }
}