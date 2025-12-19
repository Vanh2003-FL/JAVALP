package org.openremote.model.routeInfo;

import jakarta.persistence.*;
import org.openremote.model.dashboard.DashboardTemplate;

import java.sql.Timestamp;

@Entity
@Table(name = "route_info")
public class RouteInfo {

    @Id
    @Column(length = 22)
    private String id;

    @Column(name = "route_code", length = 30)
    private String routeCode;

    @Column(name = "route_name", length = 250)
    private String routeName;

    @Column(name = "realm", length = 255)
    private String realm;

    @Column(name = "province_id")
    private Integer provinceId;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "ward_id")
    private Integer wardId;

    @Column(name = "street_name", length = 50)
    private String streetName;

    @Column(length = 500)
    private String address;

    @Column(length = 5)
    private String status;

    @Column(name = "active_date")
    private Timestamp activeDate;

    @Column
    private Boolean deleted = false;

    @Column(length = 250)
    private String description;

    @Column(name = "create_date")
    private Timestamp createDate;

    @Column(name = "create_by", length = 36)
    private String createBy;

    @Column(name = "update_date")
    private Timestamp updateDate;

    @Column(name = "update_by", length = 36)
    private String updateBy;

    private String realmName;

    private Long routerCount;

    private Long cabinetCount;

    private Long routerCountActive;

    private Long cabinetCountActive;

    public RouteInfo(){}

    public RouteInfo(String id, String routeName) {
        this.id = id;
        this.routeName = routeName;
    }

    public RouteInfo(String id, String routeCode, String routeName, String realm, Integer provinceId,
                     Integer districtId, Integer wardId, String streetName, String address, String status,
                     Timestamp activeDate, Boolean deleted, String description, Timestamp createDate,
                     String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.routeCode = routeCode;
        this.routeName = routeName;
        this.realm = realm;
        this.provinceId = provinceId;
        this.districtId = districtId;
        this.wardId = wardId;
        this.streetName = streetName;
        this.address = address;
        this.status = status;
        this.activeDate = activeDate;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public RouteInfo(String id, String routeCode, String routeName, String realm, Integer provinceId,
                     Integer districtId, Integer wardId, String streetName, String address, String status,
                     Timestamp activeDate, Boolean deleted, String description, Timestamp createDate,
                     String createBy, Timestamp updateDate, String updateBy, String realmName) {
        this.id = id;
        this.routeCode = routeCode;
        this.routeName = routeName;
        this.realm = realm;
        this.provinceId = provinceId;
        this.districtId = districtId;
        this.wardId = wardId;
        this.streetName = streetName;
        this.address = address;
        this.status = status;
        this.activeDate = activeDate;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.realmName = realmName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRouteCode() {
        return routeCode;
    }

    public void setRouteCode(String routeCode) {
        this.routeCode = routeCode;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public Integer getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(Integer provinceId) {
        this.provinceId = provinceId;
    }

    public Integer getDistrictId() {
        return districtId;
    }

    public void setDistrictId(Integer districtId) {
        this.districtId = districtId;
    }

    public Integer getWardId() {
        return wardId;
    }

    public void setWardId(Integer wardId) {
        this.wardId = wardId;
    }

    public String getStreetName() {
        return streetName;
    }

    public void setStreetName(String streetName) {
        this.streetName = streetName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getActiveDate() {
        return activeDate;
    }

    public void setActiveDate(Timestamp activeDate) {
        this.activeDate = activeDate;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public Timestamp getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Timestamp updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public Long getRouterCount() { return routerCount; }

    public void setRouterCount(Long routerCount) { this.routerCount = routerCount; }

    public Long getCabinetCount() { return cabinetCount; }

    public void setCabinetCount(Long cabinetCount) { this.cabinetCount = cabinetCount; }

    public Long getRouterCountActive() {
        return routerCountActive;
    }

    public void setRouterCountActive(Long routerCountActive) {
        this.routerCountActive = routerCountActive;
    }

    public Long getCabinetCountActive() {
        return cabinetCountActive;
    }

    public void setCabinetCountActive(Long cabinetCountActive) {
        this.cabinetCountActive = cabinetCountActive;
    }
}
