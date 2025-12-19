package org.openremote.model.asset.cabinet;

import org.openremote.model.attribute.AttributeWriteFailure;

public class CabinetException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public CabinetException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public CabinetException(String errorCode, String message) {
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
