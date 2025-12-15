package org.openremote.model.lamppost.dtoLamppost;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Lamppost {
    private Long lamppostId;        // ID cột đèn
    private String routeId;         // Mã lộ/tuyến
    private BigDecimal energyActualD; // Năng lượng tiêu thụ thực tế theo ngày
    private BigDecimal energyActualM; // Năng lượng tiêu thụ thực tế theo tháng
    private Boolean active;         // Trạng thái hoạt động: 1: YES, 0: NO
    private String description;     // Mô tả
    private Timestamp createDate;   // Ngày khai báo thiết bị
    private String createBy;        // Người tạo
    private Timestamp updateDate;   // Ngày cập nhật
    private String updateBy;        // Người cập nhật
    private String lamppostName;
    private String lamppostCode;


    public Lamppost(Long lamppostId, String routeId, BigDecimal energyActualD, BigDecimal energyActualM, Boolean active, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy) {
        this.lamppostId = lamppostId;
        this.routeId = routeId;
        this.energyActualD = energyActualD;
        this.energyActualM = energyActualM;
        this.active = active;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public Lamppost() {

    }

    public Long getLamppostId() {
        return lamppostId;
    }

    public void setLamppostId(Long lamppostId) {
        this.lamppostId = lamppostId;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public BigDecimal getEnergyActualD() {
        return energyActualD;
    }

    public void setEnergyActualD(BigDecimal energyActualD) {
        this.energyActualD = energyActualD;
    }

    public BigDecimal getEnergyActualM() {
        return energyActualM;
    }

    public void setEnergyActualM(BigDecimal energyActualM) {
        this.energyActualM = energyActualM;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    public String getLamppostName() {
        return lamppostName;
    }

    public void setLamppostName(String lamppostName) {
        this.lamppostName = lamppostName;
    }


    public String getLamppostCode() {
        return lamppostCode;
    }

    public void setLamppostCode(String lamppostCode) {
        this.lamppostCode = lamppostCode;
    }

}
