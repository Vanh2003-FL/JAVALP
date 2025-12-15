package org.openremote.model.lampType;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.openremote.model.lampType.LampTypeException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
public class LampTypeExceptionMapper implements ExceptionMapper<LampTypeException>{
    @Override
    public Response toResponse(LampTypeException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("errorCode", ex.getReason());
        error.put("errorMessage", ex.getMessage());
        error.put("timestamp", LocalDateTime.now().toString());

        return Response.status(Response.Status.BAD_REQUEST)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
