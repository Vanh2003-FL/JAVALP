package org.openremote.model.supplier;

import org.openremote.model.attribute.AttributeWriteFailure;

public class SupplierException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public SupplierException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public SupplierException(String errorCode, String message) {
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
