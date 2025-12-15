package org.openremote.model.assetInfo;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.openremote.model.dto.ImportAssetDTO;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;
import org.openremote.model.http.RequestParams;
import org.openremote.model.lampType.LampType;

import java.io.IOException;
import java.util.List;

@Tag(name = "AssetInfo")
@Path("assetInfo")
public interface AssetInfoResource {

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public RouterAssetCreate get(@BeanParam RequestParams requestParams, @PathParam("id") String id);

    @GET
    public List<Asset_Info> getAll(@BeanParam RequestParams requestParams);

    @GET
    @Path("get/stream")
    @Produces("application/octet-stream")
    public Response getStream(@BeanParam RequestParams requestParams,@QueryParam("filename")  String filename) throws IOException;

    @POST
    public void create(@BeanParam RequestParams requestParams,Asset_Info assetInfo);

    @PUT
    @Path("{id}")
    public Asset_Info update(@BeanParam RequestParams requestParams,@PathParam("id") Long customerId, Asset_Info assetInfo);

    @DELETE
    @Path("{id}")
    public void delete(@BeanParam RequestParams requestParams,@PathParam("id") Long customerId);

    @GET
    @Path("getLight/{assetId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public LightAssetDTO getLightById(@PathParam("assetId") String assetId);

    @POST
    @Path("getAllLights")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public List<LightAssetDTO> getAllLights(@BeanParam RequestParams requestParams,SearchFilterDTO<Asset_Info> filterDTO, @QueryParam("realm") String realm);

    @POST
    @Path("import")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response importAssets(@QueryParam("realm") String realm, List<ImportAssetDTO> dtos);

    @POST
    @Path("createLight")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createLight(@QueryParam("realm") String realm, ImportAssetDTO dtos);

    @PUT
    @Path("editLight/{assetId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editLight(@PathParam("assetId") String assetId, @QueryParam("realm") String realm, ImportAssetDTO dto);

    @DELETE
    @Path("deleteLight/{assetId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteLight(@PathParam("assetId") String assetId);

}
