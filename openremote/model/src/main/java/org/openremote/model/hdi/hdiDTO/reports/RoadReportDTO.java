package org.openremote.model.hdi.hdiDTO.reports;

import java.util.List;

public class RoadReportDTO {
    String idR;
    String nameR;
    List<ElectricalCabinetReportDTO> cabinetReportDTOS;

    public RoadReportDTO() {
    }

    public RoadReportDTO(String idR, String nameR, List<ElectricalCabinetReportDTO> cabinetReportDTOS) {
        this.idR = idR;
        this.nameR = nameR;
        this.cabinetReportDTOS = cabinetReportDTOS;
    }

    public String getIdR() {
        return idR;
    }

    public void setIdR(String idR) {
        this.idR = idR;
    }

    public String getNameR() {
        return nameR;
    }

    public void setNameR(String nameR) {
        this.nameR = nameR;
    }

    public List<ElectricalCabinetReportDTO> getCabinetReportDTOS() {
        return cabinetReportDTOS;
    }

    public void setCabinetReportDTOS(List<ElectricalCabinetReportDTO> cabinetReportDTOS) {
        this.cabinetReportDTOS = cabinetReportDTOS;
    }
}
