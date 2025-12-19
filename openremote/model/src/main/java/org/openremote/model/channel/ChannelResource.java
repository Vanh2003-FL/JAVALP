package org.openremote.model.channel;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.warningMicroIP.WarningMicroIP;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Channel")
@Path("Channel")
public interface ChannelResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getAllChannel")
    List<Channel> getAllWarningMicroIP(SearchFilterDTO<Channel> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("createChannel")
    Channel createChannel(Channel data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("updateChannel")
    Channel updateChannel(Channel data);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("removeChannel")
    boolean removeChannel(Channel data);

}
