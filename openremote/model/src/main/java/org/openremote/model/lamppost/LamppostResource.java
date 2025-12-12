package org.openremote.model.lamppost;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.openremote.model.Constants;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.hdi.PagedResult;
import org.openremote.model.http.RequestParams;
import org.openremote.model.lampType.LampType;
import org.openremote.model.lamppost.dtoLamppost.Lamppost;
import org.openremote.model.lamppost.dtoLamppost.LamppostCreateDTO;
import org.openremote.model.lamppost.dtoLamppost.LamppostDTO;
import org.openremote.model.lamppost.dtoLamppost.LamppostLightDTO;
import org.openremote.model.query.LamppostQuery;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Lamppost")
@Path("lamppost")
public interface LamppostResource {
    @GET
    @Path("{lampposId}")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    Lamppost get(@BeanParam RequestParams requestParams, @PathParam("assetId") String lampposId, @QueryParam("realmName") String realmName);
//    @GET
//    @Path("countRouteLampposts")
//    @Produces(APPLICATION_JSON)
//    @RolesAllowed({Constants.READ_ASSETS_ROLE})
//    Long countRouteLampposts(@BeanParam RequestParams requestParams);


    @GET
    @Path("getLightByLamppostType/{lamppostTypeId}/{routerId}")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<LightAsset> getLightByLamppostType(@BeanParam RequestParams requestParams,
                                            @PathParam("lamppostTypeId") Integer lampposTypeId,
                                            @PathParam("routerId") String routerId);

    @GET
    @Path("getLamppostType")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<LampType> getLamppostType(@BeanParam RequestParams requestParams);

    @POST
    @Path("query")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    PagedResult queryLamppost(@BeanParam RequestParams requestParams,
                              @QueryParam("realm") String realm,
                              @QueryParam("page")int page,
                              @QueryParam("size")int size,
                              LamppostQuery lamppostQuery,
                              @QueryParam("routerId")String routerId,
                              @QueryParam("lamppostName")String lamppostName);

    @DELETE
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    void delete(@BeanParam RequestParams requestParams, @PathParam("id") Long id);

    @DELETE
    @Path("removeLight/{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Response removeLight(@BeanParam RequestParams requestParams, @PathParam("id") String id);

    @POST
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Lamppost create(@BeanParam RequestParams requestParams, @QueryParam("realm") String realm, LamppostCreateDTO lamppostCreateDTO);

    @POST
    @Path("createLamppostLight")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Response createLamppostLight(@BeanParam RequestParams requestParams, @QueryParam("realm") String realm, LamppostCreateDTO lamppostCreateDTO);

    @PUT
    @Path("updateLamppostLight/{id}")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Lamppost updateLamppostLight(
            @BeanParam RequestParams requestParams,
            @PathParam("id") int lamppostId,
            LamppostCreateDTO updateDTO
    );

    @PUT
    @Path("{id}")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ADMIN_ROLE})
    Lamppost update(@BeanParam RequestParams requestParams,
                    @PathParam("id") int id,
                    LamppostCreateDTO lamppostUpdateDTO);

    @GET
    @Path("getLightsByLamppostId/{lamppostId}")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<LamppostLightDTO> getLightsByLamppostId(@BeanParam RequestParams requestParams,
                                                 @PathParam("lamppostId") Integer lamppostId);

    @POST
    @Path("wattageActual")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    LamppostDTO getWattageActual(@BeanParam RequestParams requestParams, @QueryParam("lamppostId") Integer lamppostId);

    @POST
    @Path("wattageProduct")
    @Produces(APPLICATION_JSON)
    @Consumes(APPLICATION_JSON)
    LamppostDTO getWattageProduct(@BeanParam RequestParams requestParams, @QueryParam("lamppostId") Integer lamppostId);
}
