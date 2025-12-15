package org.openremote.model.lampType;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.lampType.LampType;
import org.openremote.model.province.Province;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "LampType")
@Path("lampType")
public interface LampTypeResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    List<LampType> getAll(SearchFilterDTO<LampType> filterDTO);

    @GET
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("{id}")
    LampType getById(@PathParam("id") int id);

    @POST
    @Path("createLampType")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    LampType createLampType(LampType lampType);

    @POST
    @Path("updateLampType")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    LampType updateLampType(LampType lampType);

    @POST
    @Path("deleteLampType")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean deleteLampType(LampType lampType);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countData(SearchFilterDTO<LampType> filterDTO);
}
