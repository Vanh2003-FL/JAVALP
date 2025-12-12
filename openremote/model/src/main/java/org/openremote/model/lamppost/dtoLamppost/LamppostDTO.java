package org.openremote.model.lamppost.dtoLamppost;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class LamppostDTO {
//    private Long lamppostId;        // ID cột đèn
//    private String routeId;         // Mã lộ/tuyến
//    private BigDecimal energyActualD; // Năng lượng tiêu thụ thực tế theo ngày
//    private BigDecimal energyActualM; // Năng lượng tiêu thụ thực tế theo tháng
//    private Boolean active;         // Trạng thái hoạt động: 1: YES, 0: NO
//    private String description;     // Mô tả
//    private Timestamp createDate;   // Ngày khai báo thiết bị
//    private String createBy;        // Người tạo
//    private Timestamp updateDate;   // Ngày cập nhật
//    private String updateBy;        // Người cập nhật

    private Long code;      // Mã cột
    private Object location;  // Vị trí
    private String lampType;  // Loại đèn
    private String nemaName;

    private Integer  lampTypeId;
    private String nemaId;

    private Long wattageActual;
    private Long wattageProduction;

    public LamppostDTO(String lamppostCode, String lamppostName ,Boolean active) {
        this.active = active;
        this.lamppostName = lamppostName;
        this.lamppostCode = lamppostCode;
    }
    public LamppostDTO(Integer lamppostId, String routeId, String lamppostCode, String lamppostName, String description ,Boolean active) {
        this.description = description;
        this.lamppostId = lamppostId;
        this.routeId = routeId;
        this.active = active;
        this.lamppostName = lamppostName;
        this.lamppostCode = lamppostCode;
    }

    public LamppostDTO(Long wattageActual, Long wattageProduction) {
       this.wattageActual = wattageActual;
       this.wattageProduction = wattageProduction;
    }

    private Integer lamppostId;
    private String routeId;
    private String lamppostCode;
    private String description;
    private String lamppostName;
    private Boolean active;

//    public LamppostDTO(Long lamppostId, String routeId, BigDecimal energyActualD, BigDecimal energyActualM, Boolean active, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy, Long code, Object location, String lampType, String nemaName, Long lampTypeId, String nemaId) {
//        this.lamppostId = lamppostId;
//        this.routeId = routeId;
//        this.energyActualD = energyActualD;
//        this.energyActualM = energyActualM;
//        this.active = active;
//        this.description = description;
//        this.createDate = createDate;
//        this.createBy = createBy;
//        this.updateDate = updateDate;
//        this.updateBy = updateBy;
//        this.code = code;
//        this.location = location;
//        this.lampType = lampType;
//        this.nemaName = nemaName;
//        this.lampTypeId = lampTypeId;
//        this.nemaId = nemaId;
//    }

    public LamppostDTO(Long code, String location, String lampType, String nemaName, Integer  lampTypeId, String nemaId) {
        this.code = code;
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.location= mapper.readValue(location, Object.class);
        }catch (Exception ignored){
            this.location = null;
        }
        this.lampType = lampType;
        this.nemaName = nemaName;
        this.lampTypeId= lampTypeId;
        this.nemaId = nemaId;
    }

    public Integer  getLampTypeId() {
        return lampTypeId;
    }

    public void setLampTypeId(Integer  lampTypeId) {
        this.lampTypeId = lampTypeId;
    }

    public String getNemaId() {
        return nemaId;
    }

    public void setNemaId(String nemaId) {
        this.nemaId = nemaId;
    }


    public Long getCode() {
        return code;
    }

    public void setCode(Long code) {
        this.code = code;
    }

    public Object getLocation() {
        return location;
    }

    public void setLocation(Object location) {
        this.location = location;
    }

    public String getLampType() {
        return lampType;
    }

    public void setLampType(String lampType) {
        this.lampType = lampType;
    }

    public String getNemaName() {
        return nemaName;
    }

    public void setNemaName(String nemaName) {
        this.nemaName = nemaName;
    }


    public String getLamppostCode() {
        return lamppostCode;
    }

    public void setLamppostCode(String lamppostCode) {
        this.lamppostCode = lamppostCode;
    }

    public String getLamppostName() {
        return lamppostName;
    }

    public void setLamppostName(String lamppostName) {
        this.lamppostName = lamppostName;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Integer getLamppostId() {
        return lamppostId;
    }

    public void setLamppostId(Integer lamppostId) {
        this.lamppostId = lamppostId;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getWattageActual() {  return wattageActual;  }

    public void setWattageActual(Long wattageActual) { this.wattageActual = wattageActual;  }

    public Long getWattageProduction() {  return wattageProduction;  }

    public void setWattageProduction(Long wattageProduction) { this.wattageProduction = wattageProduction;  }

//
//    public Long getLamppostId() {
//        return lamppostId;
//    }
//
//    public void setLamppostId(Long lamppostId) {
//        this.lamppostId = lamppostId;
//    }
//
//    public String getRouteId() {
//        return routeId;
//    }
//
//    public void setRouteId(String routeId) {
//        this.routeId = routeId;
//    }
//
//    public BigDecimal getEnergyActualD() {
//        return energyActualD;
//    }
//
//    public void setEnergyActualD(BigDecimal energyActualD) {
//        this.energyActualD = energyActualD;
//    }
//
//    public BigDecimal getEnergyActualM() {
//        return energyActualM;
//    }
//
//    public void setEnergyActualM(BigDecimal energyActualM) {
//        this.energyActualM = energyActualM;
//    }
//
//    public Boolean getActive() {
//        return active;
//    }
//
//    public void setActive(Boolean active) {
//        this.active = active;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
//    public Timestamp getCreateDate() {
//        return createDate;
//    }
//
//    public void setCreateDate(Timestamp createDate) {
//        this.createDate = createDate;
//    }
//
//    public String getCreateBy() {
//        return createBy;
//    }
//
//    public void setCreateBy(String createBy) {
//        this.createBy = createBy;
//    }
//
//    public Timestamp getUpdateDate() {
//        return updateDate;
//    }
//
//    public void setUpdateDate(Timestamp updateDate) {
//        this.updateDate = updateDate;
//    }
//
//    public String getUpdateBy() {
//        return updateBy;
//    }
//
//    public void setUpdateBy(String updateBy) {
//        this.updateBy = updateBy;
//    }
}
