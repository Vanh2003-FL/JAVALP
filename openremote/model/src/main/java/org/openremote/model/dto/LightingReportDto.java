package org.openremote.model.dto;

import java.util.List;

public class LightingReportDto {

    private String cabinetId;
    private String cabinetName;
    private List<LightDto> lightDtos;

    public LightingReportDto() {}

    public LightingReportDto(String cabinetId, String cabinetName, List<LightDto> lightDtos) {
        this.cabinetId = cabinetId;
        this.cabinetName = cabinetName;
        this.lightDtos = lightDtos;
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

    public List<LightDto> getLightDtos() {
        return lightDtos;
    }

    public void setLightDtos(List<LightDto> lightDtos) {
        this.lightDtos = lightDtos;
    }
}
