package org.openremote.model.dto;

import java.math.BigDecimal;

public class PowerVoltageReportDto {
    private String id;
    private String lightName;
    private String time;
    private BigDecimal voltage;
    private BigDecimal wattageActual;
    private BigDecimal amperage;
    private String roadName;
    private String lightCode;
    private String cabinetId;
    private String cabinetName;

    public PowerVoltageReportDto() {
    }

    public PowerVoltageReportDto(String id, String lightName, String time, BigDecimal voltage, BigDecimal wattageActual, BigDecimal amperage, String roadName, String lightCode) {
        this.id = id;
        this.lightName = lightName;
        this.time = time;
        this.voltage = voltage;
        this.wattageActual = wattageActual;
        this.amperage = amperage;
        this.roadName = roadName;
        this.lightCode = lightCode;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLightName() {
        return lightName;
    }

    public void setLightName(String lightName) {
        this.lightName = lightName;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public BigDecimal getVoltage() {
        return voltage;
    }

    public void setVoltage(BigDecimal voltage) {
        this.voltage = voltage;
    }

    public BigDecimal getWattageActual() {
        return wattageActual;
    }

    public void setWattageActual(BigDecimal wattageActual) {
        this.wattageActual = wattageActual;
    }

    public BigDecimal getAmperage() {
        return amperage;
    }

    public void setAmperage(BigDecimal amperage) {
        this.amperage = amperage;
    }

    public String getRoadName() {
        return roadName;
    }

    public void setRoadName(String roadName) {
        this.roadName = roadName;
    }

    public String getLightCode() {
        return lightCode;
    }

    public void setLightCode(String lightCode) {
        this.lightCode = lightCode;
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
}
