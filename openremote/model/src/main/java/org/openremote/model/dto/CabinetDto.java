package org.openremote.model.dto;

import java.math.BigDecimal;

public class CabinetDto {

    private BigDecimal voltagePhase1;
    private BigDecimal voltagePhase2;
    private BigDecimal voltagePhase3;
    private BigDecimal amperagePhase1;
    private BigDecimal amperagePhase2;
    private BigDecimal amperagePhase3;
    private String status;

    public CabinetDto() {
    }

    public CabinetDto(BigDecimal voltagePhase1, BigDecimal voltagePhase2, BigDecimal voltagePhase3, BigDecimal amperagePhase1, BigDecimal amperagePhase2, BigDecimal amperagePhase3, String status) {
        this.voltagePhase1 = voltagePhase1;
        this.voltagePhase2 = voltagePhase2;
        this.voltagePhase3 = voltagePhase3;
        this.amperagePhase1 = amperagePhase1;
        this.amperagePhase2 = amperagePhase2;
        this.amperagePhase3 = amperagePhase3;
        this.status = status;
    }

    public BigDecimal getVoltagePhase1() {
        return voltagePhase1;
    }

    public void setVoltagePhase1(BigDecimal voltagePhase1) {
        this.voltagePhase1 = voltagePhase1;
    }

    public BigDecimal getVoltagePhase2() {
        return voltagePhase2;
    }

    public void setVoltagePhase2(BigDecimal voltagePhase2) {
        this.voltagePhase2 = voltagePhase2;
    }

    public BigDecimal getVoltagePhase3() {
        return voltagePhase3;
    }

    public void setVoltagePhase3(BigDecimal voltagePhase3) {
        this.voltagePhase3 = voltagePhase3;
    }

    public BigDecimal getAmperagePhase1() {
        return amperagePhase1;
    }

    public void setAmperagePhase1(BigDecimal amperagePhase1) {
        this.amperagePhase1 = amperagePhase1;
    }

    public BigDecimal getAmperagePhase2() {
        return amperagePhase2;
    }

    public void setAmperagePhase2(BigDecimal amperagePhase2) {
        this.amperagePhase2 = amperagePhase2;
    }

    public BigDecimal getAmperagePhase3() {
        return amperagePhase3;
    }

    public void setAmperagePhase3(BigDecimal amperagePhase3) {
        this.amperagePhase3 = amperagePhase3;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
