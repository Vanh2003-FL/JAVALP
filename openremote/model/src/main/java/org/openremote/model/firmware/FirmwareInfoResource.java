package org.openremote.model.firmware;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import org.openremote.model.Constants;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "FirmwareInfo")
@Path("firmwareInfo")
public interface FirmwareInfoResource {
    @GET
    @Path("{id}")
    public FirmwareInfo get(@PathParam("id") String id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    public List<FirmwareInfo> getAll(SearchFilterDTO<FirmwareInfo> searchFilterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("create")
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    public FirmwareInfo create(FirmwareInfo firmwareInfo);

    @PUT
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    public FirmwareInfo update(FirmwareInfo firmwareInfo);

    @DELETE
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    public boolean delete(@PathParam("id") Long id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("countData")
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    Long countData();
}
