package org.openremote.model.asset.md;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "route_group")

public class RouteGroup {
    @Override
    public String toString() {
        return "RouteGroup{" +
                "id=" + routeGrpId +
                ", code='" + routeGrpCode + '\'' +
                ", name='" + routeGrpName + '\'' +
                ", active=" + active +
                ", createBy='" + createBy + '\'' +
                ", createDate=" + createDate +
                ", updateBy='" + updateBy + '\'' +
                ", updateDate=" + updateDate +
                '}';
    }

    @Id
    @Column(name = "route_grp_id", nullable = false)
    private Integer routeGrpId;

    @Column(name = "route_grp_code", length = 30, nullable = false)
    private String routeGrpCode;

    @Column(name = "route_grp_name", length = 250, nullable = false)
    private String routeGrpName;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "create_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date createDate;

    @Column(name = "create_by", length = 36, nullable = false)
    private String createBy;

    @Column(name = "update_date")
    @Temporal(TemporalType.DATE)
    private Date updateDate;

    @Column(name = "update_by", length = 36)
    private String updateBy;

    public RouteGroup(Integer routeGrpId, String routeGrpCode, String routeGrpName, Boolean active, Date createDate, String createBy, Date updateDate, String updateBy) {
        this.routeGrpId = routeGrpId;
        this.routeGrpCode = routeGrpCode;
        this.routeGrpName = routeGrpName;
        this.active = active;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }
    public RouteGroup() {

    }

    public Integer getRouteGrpId() {
        return routeGrpId;
    }

    public void setRouteGrpId(Integer routeGrpId) {
        this.routeGrpId = routeGrpId;
    }

    public String getRouteGrpCode() {
        return routeGrpCode;
    }

    public void setRouteGrpCode(String routeGrpCode) {
        this.routeGrpCode = routeGrpCode;
    }

    public String getRouteGrpName() {
        return routeGrpName;
    }

    public void setRouteGrpName(String routeGrpName) {
        this.routeGrpName = routeGrpName;
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
