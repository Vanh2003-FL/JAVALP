package org.openremote.model.asset.md;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.openremote.model.http.RequestParams;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "md_route_group")
@Path("/routegroups")

@Produces(APPLICATION_JSON)
public interface RouteGroupResource {

//        @GET
//        @Path("/{id}")
//    RouteGroup get(@BeanParam RequestParams requestParams, @QueryParam("id") Integer id);

    @GET
    @Path("{id}")
    List<RouteGroup> getAll(@BeanParam RequestParams requestParams, @QueryParam("id") Integer id);

    @POST
    void create(RouteGroup routeGroup);

    @PUT
    @Path("/{id}")
    RouteGroup update(@PathParam("id") Integer routeGrpId, RouteGroup routeGroup);

    @DELETE
    @Path("/{id}")
    void delete(@PathParam("id") Integer routeGrpId);
}
