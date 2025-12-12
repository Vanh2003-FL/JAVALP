package org.openremote.model.routeInfoV;

import org.openremote.model.attribute.AttributeWriteFailure;

public class RouteInfoVException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public RouteInfoVException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public RouteInfoVException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public AttributeWriteFailure getReason() {
        return reason;
    }
}
