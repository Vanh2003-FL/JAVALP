package org.openremote.model.ward;

import org.openremote.model.attribute.AttributeWriteFailure;

public class WardException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public WardException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public WardException(String errorCode, String message) {
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
