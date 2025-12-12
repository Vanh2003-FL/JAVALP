/*
 * Copyright 2017, OpenRemote Inc.
 *
 * See the CONTRIBUTORS.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.openremote.model.datapoint;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.openremote.model.Constants;
import org.openremote.model.datapoint.query.AssetDatapointQuery;
import org.openremote.model.dto.*;
import org.openremote.model.hdi.hdiDTO.ChartDataDTO;
import org.openremote.model.hdi.hdiDTO.reports.RoadReportDTO;
import org.openremote.model.http.RequestParams;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.AsyncResponse;
import jakarta.ws.rs.container.Suspended;

import java.util.List;
import java.util.Map;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Asset Datapoint")
@Path("asset/datapoint")
public interface AssetDatapointResource {

    /**
     * Retrieve the historical datapoints of an asset attribute. Regular users can only access assets in their
     * authenticated realm, the superuser can access assets in other (all) realms. A 403 status is returned if a
     * regular user tries to access an asset in a realm different than its authenticated realm, or if the user is
     * restricted and the asset is not linked to the user. A 400 status is returned if the asset attribute does
     * not have datapoint storage enabled.`1
     */
    @POST
    @Path("{assetId}/{attributeName}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    ValueDatapoint<?>[] getDatapoints(@BeanParam RequestParams requestParams,
                                      @PathParam("assetId") String assetId,
                                      @PathParam("attributeName") String attributeName,
                                      AssetDatapointQuery query);

    @POST
    @Path("{assetId}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    ChartDataDTO getAssetDatapoints(@BeanParam RequestParams requestParams,
                                    @PathParam("assetId") String assetId);

    @GET
    @Path("periods")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    DatapointPeriod getDatapointPeriod(@BeanParam RequestParams requestParams,
                                       @QueryParam("assetId") String assetId,
                                       @QueryParam("attributeName") String attributeName);

    @GET
    @Path("export")
    @Produces("application/zip")
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    void getDatapointExport(@Suspended AsyncResponse asyncResponse,
                            @QueryParam("attributeRefs") String attributeRefsString,
                            @QueryParam("fromTimestamp") long fromTimestamp,
                            @QueryParam("toTimestamp") long toTimestamp);
    //local date
    @GET
    @Path("cabinet_metrics")
    @Produces(APPLICATION_JSON)
    @RolesAllowed({Constants.READ_ASSETS_ROLE})
    List<RoadReportDTO> cabinetMetrics(@BeanParam RequestParams requestParams,
                                       @QueryParam("fromDate") String fromDate,
                                       @QueryParam("toDate") String toDate,
                                       @QueryParam("roadId") String roadId,
                                       @QueryParam("cabinetId") String cabinetId,
                                       @QueryParam("realm") String realm
    );


    @GET
    @Produces(APPLICATION_JSON)
    @Path("/light-report")
    public List<LightingReportDto> getLightReport(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("roadId") String roadId,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/status-light-report")
    public List<StatusLightReportDto> getStatusLightReport(
            @BeanParam RequestParams requestParams,
            @QueryParam("timeActive") String timeActive,
            @QueryParam("roadId") String roadId,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/report-power-voltage")
    public List<StatisticPowerVoltageReportDto> getReportPowerVoltage(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("roadId") String roadId,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/total-report-power-voltage")
    public List<StatisticPowerVoltageReportDto> getTotalReportPowerVoltage(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("roadId") String roadId,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/report-power-voltage-mobile")
    public Map<String, Object> getReportPowerVoltageMobile(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("lightId") String lightId);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/total-report-power-voltage-mobile")
    public Map<String, Object> getTotalReportPowerVoltageMobile(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("lightId") String lightId);

    @GET
    @Produces(APPLICATION_JSON)
    @Path("/dashboard")
    public DashBoardDto getDashboardReport(
            @BeanParam RequestParams requestParams,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);

}
