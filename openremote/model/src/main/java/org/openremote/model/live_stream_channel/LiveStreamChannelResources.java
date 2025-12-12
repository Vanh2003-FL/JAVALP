package org.openremote.model.live_stream_channel;

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
public interface LiveStreamChannelResources {
    @POST
    @Path("get")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<LiveStreamChannel> getLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO);

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
    @Path("count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Long countLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO);

    @POST
    @Path("remove")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    boolean removeLiveStreamChannel(LiveStreamChannel data);

    @POST
    @Path("get-by-area")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<LiveStreamChannel> getLiveStreamChannelByArea(LiveStreamChannel data);

    @POST
    @Path("get-shared")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<LiveStreamChannel> getSharedLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO);
}
