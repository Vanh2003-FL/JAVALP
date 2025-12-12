package org.openremote.model.lampType;
import org.openremote.model.attribute.AttributeWriteFailure;

public class LampTypeException extends RuntimeException {
    protected AttributeWriteFailure reason;

    private String errorCode;

    public LampTypeException(AttributeWriteFailure reason, String message) {
        super(message);
        this.reason = reason;
    }

    public LampTypeException(String errorCode, String message) {
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
