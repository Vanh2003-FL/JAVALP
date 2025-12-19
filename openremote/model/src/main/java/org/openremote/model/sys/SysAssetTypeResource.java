package org.openremote.model.sys;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import org.openremote.model.Constants;
import org.openremote.model.dto.AssetTypeDto;
import org.openremote.model.http.RequestParams;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "SysAssetType")
@Path("sysAssetType")
public interface SysAssetTypeResource {

    @GET
    @Path("{id}")
    public SysAssetType get(@PathParam("id") String id);

    @GET
    public List<SysAssetType> getAll();

    @POST
    public SysAssetType create(SysAssetType sysAssetType);

    @PUT
    @Path("{id}")
    public SysAssetType update(@PathParam("id") Long id, SysAssetType sysAssetType);

    @DELETE
    @Path("{id}")
    public void delete(@PathParam("id") Long id);

    @GET
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_TYPE_ROLE})
    @Path("/all")
    public List<AssetTypeDto> getAllAssetType(@BeanParam RequestParams requestParams);
}
