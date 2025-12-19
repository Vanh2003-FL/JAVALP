package org.openremote.model.content;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Content")
@Path("Content")
public interface ContentResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAllContent")
    List<Content> getAllMdContent(SearchFilterDTO<Content> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("createContent")
    Content createContent(Content data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("updateContent")
    Content updateContent(Content data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("removeContent")
    boolean removeContent(Content data);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("getById/{id}")
    Content getMdContentById(@PathParam("id") String id);

}
