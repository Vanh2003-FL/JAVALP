package org.openremote.model.ward;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.province.Province;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name ="Ward")
@Path("ward")
public interface WardResource {
    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    List<Ward> getAll(SearchFilterDTO<Ward> filterDTO);

    @POST
    @Path("createWard")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Ward createProvince(Ward province);

    @POST
    @Path("updateWard")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Ward update(Ward province);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Long countData(SearchFilterDTO<Ward> filterDTO);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    boolean remove(Ward province);
}
