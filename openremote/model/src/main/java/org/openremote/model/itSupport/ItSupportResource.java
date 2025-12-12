package org.openremote.model.itSupport;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "ItSupport")
@Path("itSupport")
public interface ItSupportResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("create")
    ItSupport create(ItSupport itSupport);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAll")
    List<ItSupport> getAll(SearchFilterDTO<ItSupport> searchFilterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("update")
    ItSupport update(ItSupport itSupport);

    @GET
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("attachmentInSupport")
    ItSupport getAttachmentInSupport(@QueryParam("id")String id);
}
