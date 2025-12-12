package org.openremote.manager.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.MediaType;

public class ApiException extends WebApplicationException {

    public ApiException(String message, Response.Status status) {
        super(Response.status(status)
                .entity(new ErrorMessage(status.getStatusCode(), message))
                .type(MediaType.APPLICATION_JSON)
                .build());
    }

    public static class ErrorMessage {
        private int status;
        private String message;

        public ErrorMessage(int status, String message) {
            this.status = status;
            this.message = message;
        }

        // Getters and setters
        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}