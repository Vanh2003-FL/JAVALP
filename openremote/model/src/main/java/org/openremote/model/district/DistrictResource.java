package org.openremote.model.district;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.province.Province;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "District")
@Path("district")
public interface DistrictResource {
    @GET
    @Path("{id}")
    public District get(@PathParam("id") int id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getDistrictsByProvince")
    List<District> getDistrictsByProvince(SearchFilterDTO<District> filterDTO);

    @POST
    @Path("createDistrict")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    District createDistrict(District district);

    @POST
    @Path("updateDistrict")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    District update(District district);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countData(SearchFilterDTO<District> filterDTO);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean remove(District province);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    List<District> getData(SearchFilterDTO<District> filterDTO);
}
