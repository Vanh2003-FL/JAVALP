package org.openremote.model.dto;

import java.time.LocalDate;

public class LightReportRequestDto {

    private LocalDate fromDate;
    private LocalDate toDate;
    private String roadId;
    private String cabinetId;

    public LightReportRequestDto() {
    }

    public LightReportRequestDto(LocalDate fromDate, LocalDate toDate, String roadId, String cabinetId) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.roadId = roadId;
        this.cabinetId = cabinetId;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public String getRoadId() {
        return roadId;
    }

    public void setRoadId(String roadId) {
        this.roadId = roadId;
    }

    public String getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(String cabinetId) {
        this.cabinetId = cabinetId;
    }
}
