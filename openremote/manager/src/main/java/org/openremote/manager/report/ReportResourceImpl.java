package org.openremote.manager.report;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.datapoint.AssetDatapointService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.LightReportRequestDto;
import org.openremote.model.dto.LightingReportDto;
import org.openremote.model.http.RequestParams;
import org.openremote.model.report.ReportResource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ReportResourceImpl extends ManagerWebResource implements ReportResource {

    protected final ReportPersistenceService reportPersistenceService;
    protected final AssetDatapointService assetDatapointService;

    public ReportResourceImpl(TimerService timerService, ManagerIdentityService identityService, ReportPersistenceService reportPersistenceService, AssetDatapointService assetDatapointService) {
        super(timerService, identityService);
        this.reportPersistenceService = reportPersistenceService;
        this.assetDatapointService = assetDatapointService;
    }

    @Override
    public List<LightingReportDto> getReport(RequestParams requestParams, String fromDate, String toDate, String roadId, String cabinetId, String realm)

    {
        LocalDateTime startTime = LocalDate.parse(fromDate).atStartOfDay();
        LocalDateTime endTime = LocalDateTime.of(LocalDate.parse(toDate), LocalTime.MAX);

//        LocalDateTime startTime = lightReportRequestDto.getFromDate().atStartOfDay();
//        LocalDateTime endTime = LocalDateTime.of(lightReportRequestDto.getToDate(), LocalTime.MAX);

//        List<LightingReportDto> report = assetDatapointService.lightingReport(startTime, endTime, lightReportRequestDto.getRoadId(), lightReportRequestDto.getCabinetId());
        List<LightingReportDto> report = assetDatapointService.lightingReport(startTime, endTime, roadId, cabinetId, realm);

        return report;
    }
}
