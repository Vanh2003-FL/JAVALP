package org.openremote.model.dto;

import java.util.List;

public class StatisticPowerVoltageReportDto {
    private String cabinetId;
    private String cabinetName;
    private List<PowerVoltageReportDto> powerVoltageReport;

    public StatisticPowerVoltageReportDto() {
    }

    public StatisticPowerVoltageReportDto(String cabinetId, String cabinetName, List<PowerVoltageReportDto> powerVoltageReport) {
        this.cabinetId = cabinetId;
        this.cabinetName = cabinetName;
        this.powerVoltageReport = powerVoltageReport;
    }

    public String getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(String cabinetId) {
        this.cabinetId = cabinetId;
    }

    public String getCabinetName() {
        return cabinetName;
    }

    public void setCabinetName(String cabinetName) {
        this.cabinetName = cabinetName;
    }

    public List<PowerVoltageReportDto> getPowerVoltageReport() {
        return powerVoltageReport;
    }

    public void setPowerVoltageReport(List<PowerVoltageReportDto> powerVoltageReport) {
        this.powerVoltageReport = powerVoltageReport;
    }
}
