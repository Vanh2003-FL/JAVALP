package org.openremote.model.province;

import org.openremote.model.attribute.AttributeWriteFailure;

public class ProvinceException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public ProvinceException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public ProvinceException(String errorCode, String message) {
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
