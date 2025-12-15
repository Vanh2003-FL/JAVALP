package org.openremote.model.livestream;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.openremote.model.Constants;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

@Tag(name = "Live Stream Channel")
@Path("live-stream-channel")
public interface LiveStreamChannelResource {
    
    @POST
    @Path("get")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<LiveStreamChannel> getLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> filterDTO);

    @POST
    @Path("get-by-id")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    LiveStreamChannel getLiveStreamChannelById(LiveStreamChannel data);

    @POST
    @Path("create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    LiveStreamChannel createLiveStreamChannel(LiveStreamChannel data);

    @POST
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    LiveStreamChannel updateLiveStreamChannel(LiveStreamChannel data);

    @POST
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Boolean deleteLiveStreamChannel(LiveStreamChannel data);

    @POST
    @Path("count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Long countLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> filterDTO);
}
