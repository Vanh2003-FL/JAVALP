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
package org.openremote.manager.datapoint;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.NotSupportedException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.container.AsyncResponse;
import jakarta.ws.rs.container.ConnectionCallback;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import org.apache.commons.io.IOUtils;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.AssetProcessingService;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.Constants;
import org.openremote.model.asset.Asset;
import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeRef;
import org.openremote.model.datapoint.AssetDatapointResource;
import org.openremote.model.datapoint.DatapointPeriod;
import org.openremote.model.datapoint.ValueDatapoint;
import org.openremote.model.datapoint.query.AssetDatapointAllQuery;
import org.openremote.model.datapoint.query.AssetDatapointLTTBQuery;
import org.openremote.model.datapoint.query.AssetDatapointQuery;
import org.openremote.model.dto.*;
import org.openremote.model.hdi.hdiDTO.ChartDataDTO;
import org.openremote.model.hdi.hdiDTO.DatasetDTO;
import org.openremote.model.hdi.hdiDTO.reports.CabinetMetricsDTO;
import org.openremote.model.hdi.hdiDTO.reports.ElectricalCabinetReportDTO;
import org.openremote.model.hdi.hdiDTO.reports.RoadReportDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.security.ClientRole;
import org.openremote.model.syslog.SyslogCategory;
import org.openremote.model.value.MetaItemType;

import java.io.File;
import java.io.FileInputStream;
import java.time.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ScheduledFuture;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.openremote.manager.asset.AssetProcessingService.ELECTRICAL_CABINET_ASSET;
import static org.openremote.manager.asset.AssetProcessingService.LIGHT_ASSET;
import static org.openremote.model.syslog.SyslogCategory.DATA;
import static org.openremote.model.util.ValueUtil.JSON;

public class AssetDatapointResourceImpl extends ManagerWebResource implements AssetDatapointResource {

    private static final Logger LOG = Logger.getLogger(AssetDatapointResourceImpl.class.getName());
    private static final Logger DATA_EXPORT_LOG = SyslogCategory.getLogger(DATA, AssetDatapointResourceImpl.class);

    protected final AssetStorageService assetStorageService;
    protected final AssetDatapointService assetDatapointService;

    public AssetDatapointResourceImpl(TimerService timerService,
                                      ManagerIdentityService identityService,
                                      AssetStorageService assetStorageService,
                                      AssetDatapointService assetDatapointService) {
        super(timerService, identityService);
        this.assetStorageService = assetStorageService;
        this.assetDatapointService = assetDatapointService;
    }

    @Override
    public ValueDatapoint<?>[] getDatapoints(@BeanParam RequestParams requestParams,
                                             String assetId,
                                             String attributeName,
                                             AssetDatapointQuery query) {
        try {

            if (isRestrictedUser() && !assetStorageService.isUserAsset(getUserId(), assetId)) {
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            Asset<?> asset = assetStorageService.find(assetId, true);

            if (asset == null) {
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }

            // Realm should be accessible
            if(!isRealmActiveAndAccessible(asset.getRealm())) {
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            // If not logged in, asset should be PUBLIC READ
            if(!isAuthenticated() && !asset.isAccessPublicRead()) {
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            // If logged in, user should have READ ASSETS role
            if(isAuthenticated() && !hasResourceRole(ClientRole.READ_ASSETS.getValue(), Constants.KEYCLOAK_CLIENT_ID)) {
                LOG.info("Forbidden access for user '" + getUsername() + "': " + asset.getRealm());
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            Attribute<?> attribute = asset.getAttribute(attributeName).orElseThrow(() ->
                    new WebApplicationException(Response.Status.NOT_FOUND)
            );

            // If restricted, the attribute should also be restricted
            if(isRestrictedUser()) {
                attribute.getMeta().getValue(MetaItemType.ACCESS_RESTRICTED_READ).ifPresentOrElse((v) -> {
                    if(!v) { throw new WebApplicationException(Response.Status.FORBIDDEN); }
                }, () -> {
                    throw new WebApplicationException(Response.Status.FORBIDDEN);
                });
            }

            // If not logged in, attribute should be PUBLIC READ
            if(!isAuthenticated()) {
                attribute.getMeta().getValue(MetaItemType.ACCESS_PUBLIC_READ).ifPresentOrElse((v) -> {
                    if(!v) { throw new WebApplicationException(Response.Status.FORBIDDEN); }
                }, () -> {
                    throw new WebApplicationException(Response.Status.FORBIDDEN);
                });
            }
            if (query != null) {
                return assetDatapointService.queryDatapoints(assetId, attribute, query).toArray(ValueDatapoint[]::new);
            }

            return assetDatapointService.getDatapoints(new AttributeRef(assetId, attributeName)).toArray(ValueDatapoint[]::new);
        } catch (IllegalStateException ex) {
            throw new BadRequestException(ex);
        } catch (UnsupportedOperationException ex) {
            throw new NotSupportedException(ex);
        }
    }

    @Override
    public ChartDataDTO getAssetDatapoints(RequestParams requestParams, String assetId) {
        // Múi giờ hệ thống
        ZoneId zone = ZoneId.systemDefault();

        // Ngày hôm nay
        LocalDate today = LocalDate.now(zone);

        // Từ 00:00:00.000
        ZonedDateTime from = today.atStartOfDay(zone);

        // Đến 23:59:59.999999999
        ZonedDateTime to = today.atTime(23, 59, 59, 999_999_999).atZone(zone);

        // Chuyển sang timestamp (millis từ epoch)
        long fromTimestamp = from.toInstant().toEpochMilli();
        long toTimestamp = to.toInstant().toEpochMilli();

        AssetDatapointLTTBQuery query=new AssetDatapointLTTBQuery(fromTimestamp,toTimestamp,50);

//        AssetDatapointLTTBQuery query = new AssetDatapointLTTBQuery(1,toTimestamp,50);
        ChartDataDTO chartDataDTO = new ChartDataDTO();
        Asset<?> asset = assetStorageService.find(assetId);

        if (asset.getType().equals(ELECTRICAL_CABINET_ASSET)) {
            ValueDatapoint<?>[] amperagePhase1 = getDatapoints(requestParams, assetId, "voltagePhase1", query);
            ValueDatapoint<?>[] amperagePhase2 = getDatapoints(requestParams, assetId, "voltagePhase2", query);
            ValueDatapoint<?>[] amperagePhase3 = getDatapoints(requestParams, assetId, "voltagePhase3", query);

            List<ValueDatapoint<?>> amperagePhase1List = Arrays.asList(amperagePhase1);
            List<ValueDatapoint<?>> amperagePhase2List = Arrays.asList(amperagePhase2);
            List<ValueDatapoint<?>> amperagePhase3List = Arrays.asList(amperagePhase3);

            // Gán nhãn (timestamp) — bạn chỉ cần lấy 1 lần nếu các phase có cùng timestamp
            chartDataDTO.getLabels().addAll(
                    amperagePhase1List.stream()
                            .map(ValueDatapoint::getTimestamp)
                            .toList()
            );

            // Thêm dữ liệu
            chartDataDTO.getDatasets().add(
                    new DatasetDTO("voltagePhase1",
                            amperagePhase1List.stream()
                                    .map(dp -> (Object) dp.getValue())
                                    .toList()
                    )
            );

            chartDataDTO.getDatasets().add(
                    new DatasetDTO("voltagePhase2",
                            amperagePhase2List.stream()
                                    .map(dp -> (Object) dp.getValue())
                                    .toList()
                    )
            );

            chartDataDTO.getDatasets().add(
                    new DatasetDTO("voltagePhase3",
                            amperagePhase3List.stream()
                                    .map(dp -> (Object) dp.getValue())
                                    .toList()
                    )
            );
        }

        if(asset.getType().equals(LIGHT_ASSET)){
            ValueDatapoint<?>[] amperes = getDatapoints(requestParams, assetId, "amperage", query);


            List<ValueDatapoint<?>> amperageList = Arrays.asList(amperes);


            chartDataDTO.getLabels().addAll(
                    amperageList.stream()
                            .map(ValueDatapoint::getTimestamp)
                            .toList()
            );

            chartDataDTO.getDatasets().add(
                    new DatasetDTO("amperage",
                            amperageList.stream()
                                    .map(dp -> (Object) dp.getValue())
                                    .toList()
                    )
            );
//            chartDataDTO.setY0(assetDatapointService.getPowerConsumptionByLight(assetId));

        }

        return chartDataDTO;
    }

    @Override
    public DatapointPeriod getDatapointPeriod(RequestParams requestParams, String assetId, String attributeName) {
        try {
            if (isRestrictedUser() && !assetStorageService.isUserAsset(getUserId(), assetId)) {
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            Asset<?> asset = assetStorageService.find(assetId, true);

            if (asset == null) {
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }

            if (!isRealmActiveAndAccessible(asset.getRealm())) {
                LOG.info("Forbidden access for user '" + getUsername() + "': " + asset);
                throw new WebApplicationException(Response.Status.FORBIDDEN);
            }

            Attribute<?> attribute = asset.getAttribute(attributeName).orElseThrow(() ->
                    new WebApplicationException(Response.Status.NOT_FOUND)
            );

            return assetDatapointService.getDatapointPeriod(assetId, attributeName);
        } catch (IllegalStateException ex) {
            throw new BadRequestException(ex);
        } catch (UnsupportedOperationException ex) {
            throw new NotSupportedException(ex);
        }
    }

    @Override
    public void getDatapointExport(AsyncResponse asyncResponse, String attributeRefsString, long fromTimestamp, long toTimestamp) {
        try {
            AttributeRef[] attributeRefs = JSON.readValue(attributeRefsString, AttributeRef[].class);

            for (AttributeRef attributeRef : attributeRefs) {
                if (isRestrictedUser() && !assetStorageService.isUserAsset(getUserId(), attributeRef.getId())) {
                    throw new WebApplicationException(Response.Status.FORBIDDEN);
                }

                Asset<?> asset = assetStorageService.find(attributeRef.getId(), true);

                if (asset == null) {
                    throw new WebApplicationException(Response.Status.NOT_FOUND);
                }

                if (!isRealmActiveAndAccessible(asset.getRealm())) {
                    DATA_EXPORT_LOG.info("Forbidden access for user '" + getUsername() + "': " + asset);
                    throw new WebApplicationException(Response.Status.FORBIDDEN);
                }

                asset.getAttribute(attributeRef.getName()).orElseThrow(() ->
                        new WebApplicationException(Response.Status.NOT_FOUND)
                );
            }

            DATA_EXPORT_LOG.info("User '" + getUsername() +  "' started data export for " + attributeRefsString + " from " + fromTimestamp + " to " + toTimestamp);

            ScheduledFuture<File> exportFuture = assetDatapointService.exportDatapoints(attributeRefs, fromTimestamp, toTimestamp);

            asyncResponse.register((ConnectionCallback) disconnected -> exportFuture.cancel(true));

            File exportFile = null;

            try {
                exportFile = exportFuture.get();

                ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream());
                FileInputStream fin = new FileInputStream(exportFile);
                ZipEntry zipEntry = new ZipEntry(exportFile.getName());
                zipOut.putNextEntry(zipEntry);
                IOUtils.copy(fin, zipOut);
                zipOut.closeEntry();
                zipOut.close();
                fin.close();

                response.setContentType("application/zip");
                response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dataexport.zip\"");

                asyncResponse.resume(
                        response
                );
            } catch (Exception ex) {
                exportFuture.cancel(true);
                asyncResponse.resume(new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR));
                DATA_EXPORT_LOG.log(Level.SEVERE, "Exception in ScheduledFuture: ", ex);
            } finally {
                if (exportFile != null && exportFile.exists()) {
                    try {
                        exportFile.delete();
                    } catch (Exception e) {
                        DATA_EXPORT_LOG.log(Level.SEVERE, "Failed to delete temporary export file: " + exportFile.getPath(), e);
                    }
                }
            }
        } catch (JsonProcessingException ex) {
            asyncResponse.resume(new BadRequestException(ex));
        }
    }

    @Override
    public List<LightingReportDto> getLightReport(RequestParams requestParams, String fromDate, String toDate, String roadId, String cabinetId, String realm)
    {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

        List<LightingReportDto> report = assetDatapointService.lightingReport(startTime, endTime, roadId, cabinetId, realm);

        return report;
    }


    @Override
    public List<StatisticPowerVoltageReportDto> getReportPowerVoltage(RequestParams requestParams, String fromDate, String toDate, String roadId, String cabinetId, String realm) {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

        List<StatisticPowerVoltageReportDto> report = assetDatapointService.powerVoltageReport(startTime, endTime, roadId, cabinetId, realm);

        return report;
    }

    @Override
    public List<StatisticPowerVoltageReportDto> getTotalReportPowerVoltage(RequestParams requestParams, String fromDate, String toDate, String roadId, String cabinetId, String realm) {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

        List<StatisticPowerVoltageReportDto> totalReport = assetDatapointService.totalPowerVoltageReport(startTime, endTime, roadId, cabinetId, realm);

        return totalReport;
    }

    @Override
    public Map<String, Object> getReportPowerVoltageMobile(RequestParams requestParams, String fromDate, String toDate, String lightId) {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

        Map<String, Object> report = assetDatapointService.powerVoltageReportMobile(startTime, endTime, lightId);

        return report;
    }

    @Override
    public Map<String, Object> getTotalReportPowerVoltageMobile(RequestParams requestParams, String fromDate, String toDate, String lightId) {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

        Map<String, Object> totalReport = assetDatapointService.totalPowerVoltageReportMobile(startTime, endTime, lightId);

        return totalReport;
    }

    @Override
    public List<StatusLightReportDto> getStatusLightReport(RequestParams requestParams, String timeActive, String roadId, String cabinetId, String realm) {
        LocalDateTime dateTimeActive = LocalDateTime.parse(timeActive);
        return assetDatapointService.statusLightReport(dateTimeActive, roadId, cabinetId, realm);
    }

    @Override
    public List<RoadReportDTO> cabinetMetrics(RequestParams requestParams, String fromDate, String toDate, String roadId, String cabinetId, String realm) {
        List<CabinetMetricsDTO> cabinetMetricsDTOList;
        List<RoadReportDTO> roadReportDTO = new ArrayList<>();

        if (cabinetId.isEmpty()) {
            cabinetMetricsDTOList = assetStorageService.getCabinetMetricsByParentid(fromDate, toDate, roadId, realm);
        } else {
            cabinetMetricsDTOList = assetStorageService.getCabinetMetricsByParentid2(fromDate, toDate, cabinetId, realm);
        }

        Map<String, List<CabinetMetricsDTO>> groupedResults = cabinetMetricsDTOList.stream()
                .collect(Collectors.groupingBy(CabinetMetricsDTO::getIdR));

        groupedResults.forEach((k, v) -> {
            RoadReportDTO roadReport = new RoadReportDTO();
            roadReport.setIdR(k);
            roadReport.setNameR(v.get(0).getNameR());
            roadReport.setCabinetReportDTOS(v.stream()
                    .map(ElectricalCabinetReportDTO::new)
                    .collect(Collectors.toList()));
            roadReportDTO.add(roadReport);
        });

        return roadReportDTO;
    }


    @Override
    public DashBoardDto getDashboardReport(RequestParams requestParams, String cabinetId, String realm) {
        return assetDatapointService.getDashboardReport(cabinetId, realm);
    }

}
