package org.openremote.model.warning;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "WarningEmailConfig")
@Path("warningEmailConfig")
public interface WarningEmailConfigResource {
    @GET
    @Path("{id}")
    public WarningEmailConfig get(@PathParam("id") String id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    public List<WarningEmailConfig> getAll(@QueryParam("realm") String realm, @QueryParam("warning") Long warningId, SearchFilterDTO<WarningEmailConfig> searchFilterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public WarningEmailConfig create(WarningEmailConfig warningEmailConfig);

    @PUT
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public WarningEmailConfig update(WarningEmailConfig WarningEmailConfig);

    @DELETE
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public boolean delete(@PathParam("id") Long id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("countData")
    Long countData(@QueryParam("realm") String realm, @QueryParam("warning") Long warningId);
}
