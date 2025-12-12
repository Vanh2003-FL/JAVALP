package org.openremote.model.dto;

import java.util.List;

public class StatusLightReportDto {

    private String roadId;
    private String roadName;
    private List<LightingReportDto> lightingReports;

    public StatusLightReportDto() {}

    public StatusLightReportDto(String roadId, String roadName, List<LightingReportDto> lightingReports) {
        this.roadId = roadId;
        this.roadName = roadName;
        this.lightingReports = lightingReports;
    }

    public String getRoadId() {
        return roadId;
    }

    public void setRoadId(String roadId) {
        this.roadId = roadId;
    }

    public String getRoadName() {
        return roadName;
    }

    public void setRoadName(String roadName) {
        this.roadName = roadName;
    }

    public List<LightingReportDto> getLightingReports() {
        return lightingReports;
    }

    public void setLightingReports(List<LightingReportDto> lightingReports) {
        this.lightingReports = lightingReports;
    }
}
