package org.openremote.model.report;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import org.jboss.logging.annotations.Param;
import org.openremote.model.dto.LightReportRequestDto;
import org.openremote.model.dto.LightingReportDto;
import org.openremote.model.dto.ReportDto;
import org.openremote.model.http.RequestParams;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Report")
@Path("report")
public interface ReportResource {


    @GET
    @Path("/light-report")
    @Produces(APPLICATION_JSON)
    public List<LightingReportDto> getReport(
            @BeanParam RequestParams requestParams,
            @QueryParam("fromDate") String fromDate,
            @QueryParam("toDate") String toDate,
            @QueryParam("roadId") String roadId,
            @QueryParam("cabinetId") String cabinetId,
            @QueryParam("realm") String realm);
}
