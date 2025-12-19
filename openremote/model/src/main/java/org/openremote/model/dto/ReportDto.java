package org.openremote.model.dto;

public class ReportDto {

    private String roadName;
    private String cabinetName;
    private Integer totalLight;
    private Long totalPower;
    private Long totalWork;
    private Long totalEnergy;

    public ReportDto() {
    }

    public ReportDto(String roadName, String cabinetName, Integer totalLight, Long totalPower, Long totalWork, Long totalEnergy) {
        this.roadName = roadName;
        this.cabinetName = cabinetName;
        this.totalLight = totalLight;
        this.totalPower = totalPower;
        this.totalWork = totalWork;
        this.totalEnergy = totalEnergy;
    }

    public String getRoadName() {
        return roadName;
    }

    public void setRoadName(String roadName) {
        this.roadName = roadName;
    }

    public String getCabinetName() {
        return cabinetName;
    }

    public void setCabinetName(String cabinetName) {
        this.cabinetName = cabinetName;
    }

    public Integer getTotalLight() {
        return totalLight;
    }

    public void setTotalLight(Integer totalLight) {
        this.totalLight = totalLight;
    }

    public Long getTotalPower() {
        return totalPower;
    }

    public void setTotalPower(Long totalPower) {
        this.totalPower = totalPower;
    }

    public Long getTotalWork() {
        return totalWork;
    }

    public void setTotalWork(Long totalWork) {
        this.totalWork = totalWork;
    }

    public Long getTotalEnergy() {
        return totalEnergy;
    }

    public void setTotalEnergy(Long totalEnergy) {
        this.totalEnergy = totalEnergy;
    }
}
