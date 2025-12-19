package org.openremote.model.folder;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Folder")
@Path("Folder")
public interface FolderResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAllFolder")
    List<Folder> getAllFolder(SearchFilterDTO<Folder> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("createFolder")
    Folder createFolder(Folder data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("updateFolder")
    Folder updateFolder(Folder data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("removeFolder")
    boolean removeFolder(Folder data);

    @GET
    @Path("{id}")
    Folder getById(@PathParam("id") String id);
}
