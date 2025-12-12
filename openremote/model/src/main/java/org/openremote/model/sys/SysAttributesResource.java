package org.openremote.model.sys;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;

import java.util.List;

@Tag(name = "SysAttributes")
@Path("sysAttributes")
public interface SysAttributesResource {

    @GET
    @Path("{id}")
    public SysAttributes get(@PathParam("id") String id);

    @GET
    public List<SysAttributes> getAll();

    @POST
    public SysAttributes create(SysAttributes sysAttributes);

    @PUT
    @Path("{id}")
    public SysAttributes update(@PathParam("id") Long id, SysAttributes sysAttributes);

    @DELETE
    @Path("{id}")
    public void delete(@PathParam("id") Long id);
}
