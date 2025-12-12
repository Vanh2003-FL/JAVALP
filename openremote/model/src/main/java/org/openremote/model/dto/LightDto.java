package org.openremote.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LightDto {

    private String id;
    private String lightName;
    private BigDecimal voltage;
    private BigDecimal wattageActual;
    private BigDecimal amperage;
    private BigDecimal wattage;
    private BigDecimal luminousFlux;
    private BigDecimal luminousEfficacy;
    private BigDecimal powerConsumption;
    private BigDecimal activeDuration;

    private Integer brightness;
    private String status;
    private String lastTimeActive;
    private String statusLight;

    public LightDto() {
    }

    public LightDto(String id, String lightName, BigDecimal voltage, BigDecimal wattageActual, BigDecimal amperage, BigDecimal luminousFlux, BigDecimal luminousEfficacy, BigDecimal powerConsumption, BigDecimal activeDuration, String statusLight, BigDecimal wattage) {
        this.id = id;
        this.lightName = lightName;
        this.voltage = voltage;
        this.wattageActual = wattageActual;
        this.amperage = amperage;
        this.luminousFlux = luminousFlux;
        this.luminousEfficacy = luminousEfficacy;
        this.powerConsumption = powerConsumption;
        this.activeDuration = activeDuration;
        this.statusLight = statusLight;
        this.wattage = wattage;
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

    public BigDecimal getLuminousFlux() {
        return luminousFlux;
    }

    public void setLuminousFlux(BigDecimal luminousFlux) {
        this.luminousFlux = luminousFlux;
    }

    public BigDecimal getLuminousEfficacy() {
        return luminousEfficacy;
    }

    public void setLuminousEfficacy(BigDecimal luminousEfficacy) {
        this.luminousEfficacy = luminousEfficacy;
    }

    public BigDecimal getPowerConsumption() {
        return powerConsumption;
    }

    public void setPowerConsumption(BigDecimal powerConsumption) {
        this.powerConsumption = powerConsumption;
    }

    public BigDecimal getActiveDuration() {
        return activeDuration;
    }

    public void setActiveDuration(BigDecimal activeDuration) {
        this.activeDuration = activeDuration;
    }

    public Integer getBrightness() {
        return brightness;
    }

    public void setBrightness(Integer brightness) {
        this.brightness = brightness;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastTimeActive() {
        return lastTimeActive;
    }

    public void setLastTimeActive(String lastTimeActive) {
        this.lastTimeActive = lastTimeActive;
    }

    public String getStatusLight() {
        return statusLight;
    }

    public void setStatusLight(String statusLight) {
        this.statusLight = statusLight;
    }

    public BigDecimal getWattage() {
        return wattage;
    }

    public void setWattage(BigDecimal wattage) {
        this.wattage = wattage;
    }
}
