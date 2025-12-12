package org.openremote.model.broadcast_history;

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

@Tag(name = "Broadcast History")
@Path("broadcast-history")
public interface BroadcastHistoryResources {
    @POST
    @Path("get")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    List<BroadcastHistory> getBroadcastHistory(SearchFilterDTO<BroadcastHistory> filterDTO);

    @POST
    @Path("get-by-id")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    BroadcastHistory getBroadcastHistoryById(BroadcastHistory data);

    @POST
    @Path("create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    BroadcastHistory createBroadcastHistory(BroadcastHistory data);

    @POST
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    BroadcastHistory updateBroadcastHistory(BroadcastHistory data);

    @POST
    @Path("count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Long countBroadcastHistory(SearchFilterDTO<BroadcastHistory> filterDTO);

    @POST
    @Path("remove")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    boolean removeBroadcastHistory(BroadcastHistory data);
}
