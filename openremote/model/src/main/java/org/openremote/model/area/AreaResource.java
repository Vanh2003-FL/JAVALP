package org.openremote.model.area;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Area")
@Path("area")
public interface AreaResource {
    
    @POST
    @Path("get")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    List<Area> getArea(SearchFilterDTO<Area> filterDTO);
    
    @POST
    @Path("get-by-id")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Area getAreaById(Area data);
    
    @POST
    @Path("create")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Area createArea(Area data);
    
    @POST
    @Path("update")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Area updateArea(Area data);
    
    @POST
    @Path("count")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countArea(SearchFilterDTO<Area> filterDTO);
    
    @POST
    @Path("delete")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean deleteArea(Area data);
}
