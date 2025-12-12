package org.openremote.model.district;

import org.openremote.model.attribute.AttributeWriteFailure;

public class DistrictException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public DistrictException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public DistrictException(String errorCode, String message) {
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
