package org.openremote.model.sys;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;

import java.util.List;

@Tag(name = "SysAsseTypeAttr")
@Path("sysAsseTypeAttr")
public interface SysAssetTypeAttrResource {

    @GET
    @Path("{id}")
    public SysAssetTypeAttr get(@PathParam("id") String id);

    @GET
    public List<SysAssetTypeAttr> getAll();

    @POST
    public SysAssetTypeAttr create(SysAssetTypeAttr sysAssetTypeAttr);

    @PUT
    @Path("{id}")
    public SysAssetTypeAttr update(@PathParam("id") Long id, SysAssetTypeAttr sysAssetTypeAttr);

    @DELETE
    @Path("{id}")
    public void delete(@PathParam("id") Long id);
}
