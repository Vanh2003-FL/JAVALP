package org.openremote.model.hdi.hdiDTO.reports;

import java.math.BigDecimal;

public class ElectricalCabinetReportDTO {
    String idC;
    String nameC;
    BigDecimal  voltagePhase1;
    BigDecimal  voltagePhase2;
    BigDecimal  voltagePhase3;
    BigDecimal  amperagePhase1;
    BigDecimal  amperagePhase2;
    BigDecimal  amperagePhase3;
    BigDecimal  wattageActualPhase1;
    BigDecimal  wattageActualPhase2;
    BigDecimal  wattageActualPhase3;

    public ElectricalCabinetReportDTO(String idC, String nameC, BigDecimal  voltagePhase1, BigDecimal  voltagePhase2, BigDecimal  voltagePhase3, BigDecimal  amperagePhase1, BigDecimal  amperagePhase2, BigDecimal  amperagePhase3, BigDecimal  wattageActualPhase1, BigDecimal  wattageActualPhase2, BigDecimal  wattageActualPhase3) {
        this.idC = idC;
        this.nameC = nameC;
        this.voltagePhase1 = voltagePhase1;
        this.voltagePhase2 = voltagePhase2;
        this.voltagePhase3 = voltagePhase3;
        this.amperagePhase1 = amperagePhase1;
        this.amperagePhase2 = amperagePhase2;
        this.amperagePhase3 = amperagePhase3;
        this.wattageActualPhase1 = wattageActualPhase1;
        this.wattageActualPhase2 = wattageActualPhase2;
        this.wattageActualPhase3 = wattageActualPhase3;
    }
    public ElectricalCabinetReportDTO(CabinetMetricsDTO dto) {
        this.idC = dto.getIdR();  // Nếu idC tương ứng với idR
        this.nameC = dto.getNameC();
        this.voltagePhase1 = dto.getVoltagePhase1();
        this.voltagePhase2 = dto.getVoltagePhase2();
        this.voltagePhase3 = dto.getVoltagePhase3();
        this.amperagePhase1 = dto.getAmperagePhase1();
        this.amperagePhase2 = dto.getAmperagePhase2();
        this.amperagePhase3 = dto.getAmperagePhase3();
        this.wattageActualPhase1 = dto.getWattageActualPhase1();
        this.wattageActualPhase2 = dto.getWattageActualPhase2();
        this.wattageActualPhase3 = dto.getWattageActualPhase3();
    }


    public String getIdC() {
        return idC;
    }

    public void setIdC(String idC) {
        this.idC = idC;
    }

    public String getNameC() {
        return nameC;
    }

    public void setNameC(String nameC) {
        this.nameC = nameC;
    }

    public BigDecimal  getVoltagePhase1() {
        return voltagePhase1;
    }

    public void setVoltagePhase1(BigDecimal  voltagePhase1) {
        this.voltagePhase1 = voltagePhase1;
    }

    public BigDecimal  getVoltagePhase2() {
        return voltagePhase2;
    }

    public void setVoltagePhase2(BigDecimal  voltagePhase2) {
        this.voltagePhase2 = voltagePhase2;
    }

    public BigDecimal  getVoltagePhase3() {
        return voltagePhase3;
    }

    public void setVoltagePhase3(BigDecimal  voltagePhase3) {
        this.voltagePhase3 = voltagePhase3;
    }

    public BigDecimal  getAmperagePhase1() {
        return amperagePhase1;
    }

    public void setAmperagePhase1(BigDecimal  amperagePhase1) {
        this.amperagePhase1 = amperagePhase1;
    }

    public BigDecimal  getAmperagePhase2() {
        return amperagePhase2;
    }

    public void setAmperagePhase2(BigDecimal  amperagePhase2) {
        this.amperagePhase2 = amperagePhase2;
    }

    public BigDecimal  getAmperagePhase3() {
        return amperagePhase3;
    }

    public void setAmperagePhase3(BigDecimal  amperagePhase3) {
        this.amperagePhase3 = amperagePhase3;
    }

    public BigDecimal  getWattageActualPhase1() {
        return wattageActualPhase1;
    }

    public void setWattageActualPhase1(BigDecimal  wattageActualPhase1) {
        this.wattageActualPhase1 = wattageActualPhase1;
    }

    public BigDecimal  getWattageActualPhase2() {
        return wattageActualPhase2;
    }

    public void setWattageActualPhase2(BigDecimal  wattageActualPhase2) {
        this.wattageActualPhase2 = wattageActualPhase2;
    }

    public BigDecimal  getWattageActualPhase3() {
        return wattageActualPhase3;
    }

    public void setWattageActualPhase3(BigDecimal wattageActualPhase3) {
        this.wattageActualPhase3 = wattageActualPhase3;
    }
}
