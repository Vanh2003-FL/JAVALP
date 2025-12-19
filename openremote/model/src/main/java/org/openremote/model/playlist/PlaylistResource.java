package org.openremote.model.playlist;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Playlist")
@Path("Playlist")
public interface PlaylistResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAllPlaylist")
    List<Playlist> getAllPlaylist(SearchFilterDTO<Playlist> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("createPlaylist")
    Playlist createPlaylist(Playlist data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("updatePlaylist")
    Playlist updatePlaylist(Playlist data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("removePlaylist")
    boolean removePlaylist(Playlist data);

    @GET
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Playlist getById(@PathParam("id") String id);
}
