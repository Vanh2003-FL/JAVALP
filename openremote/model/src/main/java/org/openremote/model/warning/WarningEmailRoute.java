package org.openremote.model.warning;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "warning_email_route")
public class WarningEmailRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "warning_email_id", nullable = false)
    private Long warningEmailId;
    @Column(name = "route_id", nullable = false, length = 22)
    private String routeId;
    @Column(name = "start_date", nullable = false)
    private Date startDate;
    @Column(name = "active", nullable = false)
    private Boolean active = true;
    @Column(name = "create_date", nullable = false)
    private Date createDate;
    @Column(name = "create_by", length = 36)
    private String createBy;
    @Column(name = "update_date")
    private Date updateDate;
    @Column(name = "update_by", length = 36)
    private String updateBy;

    public WarningEmailRoute() {
    }

    public WarningEmailRoute(Long id, Long warningEmailId, String routeId, Date startDate, Boolean active, Date createDate, String createBy, Date updateDate, String updateBy) {
        this.id = id;
        this.warningEmailId = warningEmailId;
        this.routeId = routeId;
        this.startDate = startDate;
        this.active = active;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public WarningEmailRoute(Long id, Long warningEmailId, String routeId, Date startDate, Boolean active) {
        this.id = id;
        this.warningEmailId = warningEmailId;
        this.routeId = routeId;
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

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }
}
