package org.openremote.model.province;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.http.RequestParams;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Province")
@Path("province")
public interface ProvinceResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    List<Province> getAll(SearchFilterDTO<Province> filterDTO);

    @POST
    @Path("createProvince")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Province createProvince(Province province);

    @POST
    @Path("updateProvince")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Province update(Province province);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countData(SearchFilterDTO<Province> filterDTO);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean remove(Province province);
}
