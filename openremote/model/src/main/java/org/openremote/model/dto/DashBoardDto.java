package org.openremote.model.dto;

import java.util.List;
import java.util.Map;

public class DashBoardDto {

    private String id;
    private String name;

    private CabinetDto cabinetDto;
    private List<LightDto> lightDtos;
    private Map<String, Object> dataChart;

    public DashBoardDto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CabinetDto getCabinetDto() {
        return cabinetDto;
    }

    public void setCabinetDto(CabinetDto cabinetDto) {
        this.cabinetDto = cabinetDto;
    }

    public List<LightDto> getLightDtos() {
        return lightDtos;
    }

    public void setLightDtos(List<LightDto> lightDtos) {
        this.lightDtos = lightDtos;
    }

    public Map<String, Object> getDataChart() {
        return dataChart;
    }

    public void setDataChart(Map<String, Object> dataChart) {
        this.dataChart = dataChart;
    }
}
