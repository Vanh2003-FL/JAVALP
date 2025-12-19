package org.openremote.model.firmware;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.openremote.model.dto.FirmwareInfoAssetDTO;
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "FirmwareInfoAsset")
@Path("firmwareInfoAsset")
public interface FirmwareInfoAssetResource {
    @GET
    @Path("{id}")
    public FirmwareInfoAsset get(@PathParam("id") String id);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    public List<FirmwareInfoAsset> getAll(@QueryParam("realm") String realm, @QueryParam("firmwareInfoId") Long firmwareInfoId, SearchFilterDTO<FirmwareInfoAsset> searchFilterDTO);

    @POST
    @Path("getByFrwInfoDetailId/{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public List<FirmwareInfoAssetDTO> getFrwInfoAssetByFrwInfoDetailId(@PathParam("id") Long id, SearchFilterDTO<FirmwareInfoAssetDTO> filterDTO);


    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public FirmwareInfoAsset create(FirmwareInfoAsset firmwareInfoAsset);

    @PUT
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    public FirmwareInfoAsset update(FirmwareInfoAsset firmwareInfoAsset);

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
