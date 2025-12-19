package org.openremote.model.asset.cabinet;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import org.openremote.model.Constants;
import org.openremote.model.asset.impl.ElectricalCabinetAsset;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.lampType.LampType;

import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("cabinet")
public interface CabinetResource {

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("getData")
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<CabinetAssetDTO> getAll(SearchFilterDTO<CabinetAssetDTO> filterDTO);

    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    Long countData(SearchFilterDTO<CabinetAssetDTO> filterDTO);

    @POST
    @Path("remove")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    boolean remove(ElectricalCabinetAsset cabinetAsset);

    @POST
    @Path("lightsBelongToCabinet/{realm}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<LightAssetDTO> getLightsBelongToCabinet(LampType lampType, @PathParam("realm") String realm, @QueryParam("assetId") String assetId);

    @POST
    @Path("createCabinetAssetExtend")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.WRITE_ASSETS_ROLE})
    CabinetAssetDTO createCabinetAssetExtend(CabinetAssetDTO assetDTO);
}
