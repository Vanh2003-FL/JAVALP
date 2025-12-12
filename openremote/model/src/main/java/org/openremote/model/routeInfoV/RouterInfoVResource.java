
package org.openremote.model.routeInfoV;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import org.openremote.model.Constants;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteAssetDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "RouteInfoV")
@Path("routeV")
public interface RouterInfoVResource {

    @GET
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.READ_ADMIN_ROLE)
    @Path("{id}")
    RouteAssetDTO getRouteAsset(@BeanParam RequestParams requestParams,@PathParam("id") String id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void create(@BeanParam RequestParams requestParams, RouteInfoCreateDTO routeInfoCreateDTO);
//    @PUT
//    @Path("{id}")
//    @Consumes(APPLICATION_JSON)
//    void updateProvisioningConfig(@BeanParam RequestParams requestParams, @PathParam("id") Long id, @Valid ProvisioningConfig<?, ?> provisioningConfig);
//
//    @DELETE
//    @Path("{id}")
//    @Produces(APPLICATION_JSON)
//    void deleteProvisioningConfig(@BeanParam RequestParams requestParams, @PathParam("id") Long id);
}
