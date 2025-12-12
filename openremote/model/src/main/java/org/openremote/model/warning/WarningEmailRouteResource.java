package org.openremote.model.warning;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.dto.WarningEmailRouteDto;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "WarningEmailRoute")
@Path("warningEmailRoute")
public interface WarningEmailRouteResource {
    @GET
    @Path("{id}")
    public WarningEmailRoute get(@PathParam("id") String id);

    @GET
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public List<WarningEmailRoute> getAll();

    @POST
    @Path("getByEmailConfigId/{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public List<WarningEmailRouteDto> getEmailRouteByEmailConfigId(@PathParam("id") Long id, SearchFilterDTO<WarningEmailRouteDto> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public WarningEmailRouteDto create(WarningEmailRoute warningEmailRoute);

    @PUT
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public WarningEmailRoute update(WarningEmailRoute warningEmailRoute);

    @DELETE
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public boolean delete(@PathParam("id") Long id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("countData/{id}")
    Long countData(@PathParam("id") Long emailConfigId);
}
