package org.openremote.manager.scheduleInfo;

public class ErrorMessage {
    private String message;
    private String errorCode;

    public ErrorMessage() {}

    public ErrorMessage(String message) {
        this.message = message;
    }

    public ErrorMessage(String message, String errorCode) {
        this.message = message;
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() { return errorCode; }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }


}
