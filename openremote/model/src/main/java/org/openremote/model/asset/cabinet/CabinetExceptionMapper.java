package org.openremote.model.asset.cabinet;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Provider
public class CabinetExceptionMapper implements ExceptionMapper<CabinetException> {

    @Override
    public Response toResponse(CabinetException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("errorCode", ex.getReason());
        error.put("errorMessage", ex.getMessage());
        error.put("timestamp", LocalDateTime.now().toString());

        return Response.status(Response.Status.OK)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
