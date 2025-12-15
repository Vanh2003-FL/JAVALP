package org.openremote.model.firmware;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.dto.WarningEmailRouteDto;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "FirmwareInfoDetail")
@Path("firmwareInfoDetail")
public interface FirmwareInfoDetailResource {
    @GET
    @Path("{id}")
    public FirmwareInfoDetail get(@PathParam("id") String id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    public List<FirmwareInfoDetail> getAll(@QueryParam("realm") String realm, @QueryParam("id") Long id, SearchFilterDTO<FirmwareInfoDetail> searchFilterDTO);

    @POST
    @Path("getFrwDetailByFrwInfoId/{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public List<FirmwareInfoDetailDTO> getFrwInfoDetailByFrwInfoId(@PathParam("id") Long id, SearchFilterDTO<FirmwareInfoDetailDTO> filterDTO);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public FirmwareInfoDetailDTO create(FirmwareInfoDetail firmwareInfoDetail);

    @PUT
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public FirmwareInfoDetail update(FirmwareInfoDetail firmwareInfoDetail);

    @DELETE
    @Path("{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public boolean delete(@PathParam("id") Long id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("countData")
    Long countData(@QueryParam("id") Long id);
}
