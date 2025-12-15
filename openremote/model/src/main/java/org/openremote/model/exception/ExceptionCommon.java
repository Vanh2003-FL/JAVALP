package org.openremote.model.exception;

import org.openremote.model.attribute.AttributeWriteFailure;

public class ExceptionCommon extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public ExceptionCommon(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public ExceptionCommon(String errorCode, String message) {
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
