package org.openremote.model.warningMicroIP;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "WarningMicroIP")
@Path("WarningMicroIP")
public interface WarningMicroIPResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAllWarningMicroIP")
    List<WarningMicroIP> getAllWarningMicroIP(SearchFilterDTO<WarningMicroIP> filterDTO);


    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("createWarningMicroIP")
    WarningMicroIP createWarningMicroIP(WarningMicroIP data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("updateWarningMicroIP")
    WarningMicroIP updateWarningMicroIP(WarningMicroIP data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("removeWarningMicroIP")
    boolean removeWarningMicroIP(WarningMicroIP data);
}
