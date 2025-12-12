package org.openremote.model.exception;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ExceptionMapperCommon implements ExceptionMapper<ExceptionCommon> {

    @Override
    public Response toResponse(ExceptionCommon ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("errorCode", ex.getErrorCode());
        error.put("errorMessage", ex.getMessage());
        error.put("timestamp", LocalDateTime.now().toString());

        return Response.status(Response.Status.OK)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
