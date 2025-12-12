package org.openremote.model.dto;

import java.util.Date;

public class WarningEmailRouteDto {
    private Long id;
    private Long warningEmailId;
    private String routeId;
    private String routeName;
    private Date startDate;
    private Boolean active;

    public WarningEmailRouteDto() {
    }

    public WarningEmailRouteDto(Long id, Long warningEmailId, String routeId, String routeName, Date startDate, Boolean active) {
        this.id = id;
        this.warningEmailId = warningEmailId;
        this.routeId = routeId;
        this.routeName = routeName;
        this.startDate = startDate;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWarningEmailId() {
        return warningEmailId;
    }

    public void setWarningEmailId(Long warningEmailId) {
        this.warningEmailId = warningEmailId;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
