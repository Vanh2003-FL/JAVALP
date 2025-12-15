package org.openremote.model.routeInfo;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import org.openremote.model.Constants;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "RouteInfo")
@Path("routeInfo")
public interface RouteInfoResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    @Path("getData")
    List<RouteInfoDTO> getAll(SearchFilterDTO<RouteInfo> filterDTO);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    Long countData(SearchFilterDTO<RouteInfo> filterDTO);

    @POST
    @Path("infoDetail")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    RouteDetailInfo getInfoDetail(RouteInfo routeInfo);

    @POST
    @Path("updateInfoDetail")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    RouteInfo updateInfoDetail(RouteInfo routeInfo);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    boolean remove(RouteInfo province);

    @POST
    @Path("countAssetInRealm")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
//    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    RouteInfo countAssetInRealm(@QueryParam("realm") String realm);

}
