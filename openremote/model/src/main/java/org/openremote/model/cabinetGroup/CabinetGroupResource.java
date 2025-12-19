package org.openremote.model.cabinetGroup;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.http.RequestParams;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "CabinetGroup")
@Path("cabinetGroup")
public interface CabinetGroupResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData/{assetId}")
    List<CabinetGroup> getAll(@BeanParam RequestParams requestParams, @PathParam("assetId") String assetId);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getCabinetGroupByCabinet/{assetId}")
    List<CabinetGroupLight> getCabinetGroupByCabinet(@BeanParam RequestParams requestParams, @PathParam("assetId") String assetId);
}
