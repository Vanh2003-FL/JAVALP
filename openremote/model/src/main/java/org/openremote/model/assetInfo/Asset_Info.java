package org.openremote.model.assetInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;
import org.openremote.model.lampType.LampType;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Asset_Info {
    String id;
    private String assetName;
    private String assetCode;
    private String cabinetAssetCode;
    private Boolean isControlByCabinet = true;
    private String cabinetId;
    private Boolean active = true;
    private LocalDateTime createDate;
    private String createBy;
    private LocalDateTime updateDate;
    private String updateBy;
    private RouteInfoCreateDTO routeInfoCreateDTO;
    private int provinceId;
    private int districtId;
    private int wardId;
    private String streetName;
    private String address;
    private String status;
    private int supplierId;
    private String firmwareVersion;
    private String assetModel;
    private String serialNumber;
    private Date lastMainceDate;
    private Date nextMainceDate;
    private Boolean deleted;
    private String description;

    private Integer lightNumberInCabinet;

    private Integer fixGroupCount;

    private Integer lightGroupCount;

    private Integer lightCount;

    public Asset_Info() {
    }


    public Asset_Info(String id, String assetCode, String createBy,
                      String updateBy, int provinceId, int districtId, int wardId,
                      String streetName, String address, String status, int supplierId,
                      String firmwareVersion, String assetModel, String serialNumber,
                      Boolean deleted, String description) {
        this.id = id;
        this.assetCode = assetCode;
        this.createBy = createBy;
        this.updateBy = updateBy;
        this.provinceId = provinceId;
        this.districtId = districtId;
        this.wardId = wardId;
        this.streetName = streetName;
        this.address = address;
        this.status = status;
        this.supplierId = supplierId;
        this.firmwareVersion = firmwareVersion;
        this.assetModel = assetModel;
        this.serialNumber = serialNumber;
        this.deleted = deleted;
        this.description = description;
    }

    public Asset_Info(String id, String assetCode, String cabinetAssetCode, Boolean isControlByCabinet, String cabinetId, Boolean active, LocalDateTime createDate, String createBy, LocalDateTime updateDate, String updateBy) {
        this.id = id;
        this.assetCode = assetCode;
        this.cabinetAssetCode = cabinetAssetCode;
        this.isControlByCabinet = isControlByCabinet;
        this.cabinetId = cabinetId;
        this.active = active;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }
    public Asset_Info(String id , String assetCode, String cabinetAssetCode, Boolean isControlByCabinet, String cabinetId, Boolean active) {
        this.id = id;
        this.assetCode = assetCode;
        this.cabinetAssetCode = cabinetAssetCode;
        this.isControlByCabinet = isControlByCabinet;
        this.cabinetId = cabinetId;
        this.active = active;
    }
    public Asset_Info(String id , String assetCode, String cabinetAssetCode, String cabinetId) {
        this.id = id;
        this.assetCode = assetCode;
        this.cabinetAssetCode = cabinetAssetCode;
        this.cabinetId = cabinetId;
    }
    public Asset_Info(String id , String assetCode, String cabinetAssetCode, String cabinetId,String status) {
        this.id = id;
        this.assetCode = assetCode;
        this.cabinetAssetCode = cabinetAssetCode;
        this.cabinetId = cabinetId;
        this.statusAI= status;
    }

    public Asset_Info(String id) {
        this.id = id;
    }

    // Getters and Setters


    public RouteInfoCreateDTO getRouteInfoCreateDTO() {
        return routeInfoCreateDTO;
    }

    public void setRouteInfoCreateDTO(RouteInfoCreateDTO routeInfoCreateDTO) {
        this.routeInfoCreateDTO = routeInfoCreateDTO;
    }

    public Integer getLightNumberInCabinet() {
        return lightNumberInCabinet;
    }
    public void setLightNumberInCabinet(Integer lightNumberInCabinet) {
        this.lightNumberInCabinet = lightNumberInCabinet;
    }
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public String getCabinetAssetCode() {
        return cabinetAssetCode;
    }

    public void setCabinetAssetCode(String cabinetAssetCode) {
        this.cabinetAssetCode = cabinetAssetCode;
    }

    public Boolean getIsControlByCabinet() {
        return isControlByCabinet;
    }

    public void setControlByCabinet(Boolean controlByCabinet) {
        isControlByCabinet = controlByCabinet;
    }

    public String getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(String cabinetId) {
        this.cabinetId = cabinetId;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public LocalDateTime getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public Boolean getControlByCabinet() {
        return isControlByCabinet;
    }

    public Boolean getActive() {
        return active;
    }

    public int getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(int provinceId) {
        this.provinceId = provinceId;
    }

    public int getDistrictId() {
        return districtId;
    }

    public void setDistrictId(int districtId) {
        this.districtId = districtId;
    }

    public int getWardId() {
        return wardId;
    }

    public void setWardId(int wardId) {
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

    public int getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(int supplierId) {
        this.supplierId = supplierId;
    }

    public String getFirmwareVersion() {
        return firmwareVersion;
    }

    public void setFirmwareVersion(String firmwareVersion) {
        this.firmwareVersion = firmwareVersion;
    }

    public String getAssetModel() {
        return assetModel;
    }

    public void setAssetModel(String assetModel) {
        this.assetModel = assetModel;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Date getLastMainceDate() {
        return lastMainceDate;
    }

    public void setLastMainceDate(Date lastMainceDate) {
        this.lastMainceDate = lastMainceDate;
    }

    public Date getNextMainceDate() {
        return nextMainceDate;
    }

    public void setNextMainceDate(Date nextMainceDate) {
        this.nextMainceDate = nextMainceDate;
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

    //route_info

    private String idRI;
    private String routeCodeRI;
    private String routeNameRI;
    private String realmRI;
    private Integer provinceIdRI;
    private Integer districtIdRI;
    private Integer wardIdRI;
    private String streetNameRI;
    private String addressRI;
    private String statusRI;
    private Timestamp activeDateRI;
    private Boolean deletedRI;
    private String descriptionRI;
    private Timestamp createDateRI;
    private String createByRI;
    private Timestamp updateDateRI;
    private String updateByRI;

    // Constructor
    public Asset_Info(String idRI, String routeCodeRI, String routeNameRI, String realmRI,
                      Integer provinceIdRI, Integer districtIdRI, Integer wardIdRI, String streetNameRI,
                      String addressRI, String statusRI, Timestamp activeDateRI, Boolean deletedRI,
                      String descriptionRI, Timestamp createDateRI, String createByRI,
                      Timestamp updateDateRI, String updateByRI) {
        this.idRI = idRI;
        this.routeCodeRI = routeCodeRI;
        this.routeNameRI = routeNameRI;
        this.realmRI = realmRI;
        this.provinceIdRI = provinceIdRI;
        this.districtIdRI = districtIdRI;
        this.wardIdRI = wardIdRI;
        this.streetNameRI = streetNameRI;
        this.addressRI = addressRI;
        this.statusRI = statusRI;
        this.activeDateRI = activeDateRI;
        this.deletedRI = deletedRI;
        this.descriptionRI = descriptionRI;
        this.createDateRI = createDateRI;
        this.createByRI = createByRI;
        this.updateDateRI = updateDateRI;
        this.updateByRI = updateByRI;
    }

    // Getters and Setters
    public String getIdRI() {
        return idRI;
    }

    public void setIdRI(String idRI) {
        this.idRI = idRI;
    }

    public String getRouteCodeRI() {
        return routeCodeRI;
    }

    public void setRouteCodeRI(String routeCodeRI) {
        this.routeCodeRI = routeCodeRI;
    }

    public String getRouteNameRI() {
        return routeNameRI;
    }

    public void setRouteNameRI(String routeNameRI) {
        this.routeNameRI = routeNameRI;
    }

    public String getRealmRI() {
        return realmRI;
    }

    public void setRealmRI(String realmRI) {
        this.realmRI = realmRI;
    }

    public Integer getProvinceIdRI() {
        return provinceIdRI;
    }

    public void setProvinceIdRI(Integer provinceIdRI) {
        this.provinceIdRI = provinceIdRI;
    }

    public Integer getDistrictIdRI() {
        return districtIdRI;
    }

    public void setDistrictIdRI(Integer districtIdRI) {
        this.districtIdRI = districtIdRI;
    }

    public Integer getWardIdRI() {
        return wardIdRI;
    }

    public void setWardIdRI(Integer wardIdRI) {
        this.wardIdRI = wardIdRI;
    }

    public String getStreetNameRI() {
        return streetNameRI;
    }

    public void setStreetNameRI(String streetNameRI) {
        this.streetNameRI = streetNameRI;
    }

    public String getAddressRI() {
        return addressRI;
    }

    public void setAddressRI(String addressRI) {
        this.addressRI = addressRI;
    }

    public String getStatusRI() {
        return statusRI;
    }

    public void setStatusRI(String statusRI) {
        this.statusRI = statusRI;
    }

    public Timestamp getActiveDateRI() {
        return activeDateRI;
    }

    public void setActiveDateRI(Timestamp activeDateRI) {
        this.activeDateRI = activeDateRI;
    }

    public Boolean getDeletedRI() {
        return deletedRI;
    }

    public void setDeletedRI(Boolean deletedRI) {
        this.deletedRI = deletedRI;
    }

    public String getDescriptionRI() {
        return descriptionRI;
    }

    public void setDescriptionRI(String descriptionRI) {
        this.descriptionRI = descriptionRI;
    }

    public Timestamp getCreateDateRI() {
        return createDateRI;
    }

    public void setCreateDateRI(Timestamp createDateRI) {
        this.createDateRI = createDateRI;
    }

    public String getCreateByRI() {
        return createByRI;
    }

    public void setCreateByRI(String createByRI) {
        this.createByRI = createByRI;
    }

    public Timestamp getUpdateDateRI() {
        return updateDateRI;
    }

    public void setUpdateDateRI(Timestamp updateDateRI) {
        this.updateDateRI = updateDateRI;
    }

    public String getUpdateByRI() {
        return updateByRI;
    }

    public void setUpdateByRI(String updateByRI) {
        this.updateByRI = updateByRI;
    }

    //route_assets
    private Long idRA;
    private String routeIdRA;
    private String assetIdRA;
    private Long sysAssetTypeIdRA;
    private Timestamp activeDateRA;
    private Timestamp deactiveDateRA;
    private Boolean deletedRA;
    private String descriptionRA;
    private Timestamp createDateRA;
    private String createByRA;
    private Timestamp updateDateRA;
    private String updateByRA;


    public Asset_Info(Long idRA, String routeIdRA, String assetIdRA, Long sysAssetTypeIdRA,
                      Timestamp activeDateRA, Timestamp deactiveDateRA, Boolean deletedRA,
                      String descriptionRA, Timestamp createDateRA, String createByRA,
                      Timestamp updateDateRA, String updateByRA) {
        this.idRA = idRA;
        this.routeIdRA = routeIdRA;
        this.assetIdRA = assetIdRA;
        this.sysAssetTypeIdRA = sysAssetTypeIdRA;
        this.activeDateRA = activeDateRA;
        this.deactiveDateRA = deactiveDateRA;
        this.deletedRA = deletedRA;
        this.descriptionRA = descriptionRA;
        this.createDateRA = createDateRA;
        this.createByRA = createByRA;
        this.updateDateRA = updateDateRA;
        this.updateByRA = updateByRA;
    }
    // Getters and Setters
    public Long getIdRA() {
        return idRA;
    }

    public void setIdRA(Long idRA) {
        this.idRA = idRA;
    }

    public String getRouteIdRA() {
        return routeIdRA;
    }

    public void setRouteIdRA(String routeIdRA) {
        this.routeIdRA = routeIdRA;
    }

    public String getAssetIdRA() {
        return assetIdRA;
    }

    public void setAssetIdRA(String assetIdRA) {
        this.assetIdRA = assetIdRA;
    }

    public Long getSysAssetTypeIdRA() {
        return sysAssetTypeIdRA;
    }

    public void setSysAssetTypeIdRA(Long sysAssetTypeIdRA) {
        this.sysAssetTypeIdRA = sysAssetTypeIdRA;
    }

    public Timestamp getActiveDateRA() {
        return activeDateRA;
    }

    public void setActiveDateRA(Timestamp activeDateRA) {
        this.activeDateRA = activeDateRA;
    }

    public Timestamp getDeactiveDateRA() {
        return deactiveDateRA;
    }

    public void setDeactiveDateRA(Timestamp deactiveDateRA) {
        this.deactiveDateRA = deactiveDateRA;
    }

    public Boolean getDeletedRA() {
        return deletedRA;
    }

    public void setDeletedRA(Boolean deletedRA) {
        this.deletedRA = deletedRA;
    }

    public String getDescriptionRA() {
        return descriptionRA;
    }

    public void setDescriptionRA(String descriptionRA) {
        this.descriptionRA = descriptionRA;
    }

    public Timestamp getCreateDateRA() {
        return createDateRA;
    }

    public void setCreateDateRA(Timestamp createDateRA) {
        this.createDateRA = createDateRA;
    }

    public String getCreateByRA() {
        return createByRA;
    }

    public void setCreateByRA(String createByRA) {
        this.createByRA = createByRA;
    }

    public Timestamp getUpdateDateRA() {
        return updateDateRA;
    }

    public void setUpdateDateRA(Timestamp updateDateRA) {
        this.updateDateRA = updateDateRA;
    }

    public String getUpdateByRA() {
        return updateByRA;
    }

    public void setUpdateByRA(String updateByRA) {
        this.updateByRA = updateByRA;
    }


    //asset_info
    private Integer provinceIdAI;
    private Integer districtIdAI;
    private Integer wardIdAI;
    private String streetNameAI;
    private String addressAI;
    private String statusAI;
    private String lastTimeWarningAI;
    private String lastValueWarningAI;
    private Integer supplierIdAI;
    private String firmwareVersionAI;
    private String assetModelAI;
    private String serialNumberAI;
    private Timestamp lastMainceDateAI;
    private Timestamp nextMainceDateAI;
    private Boolean deletedAI;
    private String descriptionAI;


    // Getters and Setters


    public String getLastTimeWarningAI() {
        return lastTimeWarningAI;
    }

    public void setLastTimeWarningAI(String lastTimeWarningAI) {
        this.lastTimeWarningAI = lastTimeWarningAI;
    }

    public String getLastValueWarningAI() {
        return lastValueWarningAI;
    }

    public void setLastValueWarningAI(String lastValueWarningAI) {
        this.lastValueWarningAI = lastValueWarningAI;
    }

    public Integer getProvinceIdAI() {
        return provinceIdAI;
    }

    public void setProvinceIdAI(Integer provinceIdAI) {
        this.provinceIdAI = provinceIdAI;
    }

    public Integer getDistrictIdAI() {
        return districtIdAI;
    }

    public void setDistrictIdAI(Integer districtIdAI) {
        this.districtIdAI = districtIdAI;
    }

    public Integer getWardIdAI() {
        return wardIdAI;
    }

    public void setWardIdAI(Integer wardIdAI) {
        this.wardIdAI = wardIdAI;
    }

    public String getStreetNameAI() {
        return streetNameAI;
    }

    public void setStreetNameAI(String streetNameAI) {
        this.streetNameAI = streetNameAI;
    }

    public String getAddressAI() {
        return addressAI;
    }

    public void setAddressAI(String addressAI) {
        this.addressAI = addressAI;
    }

    public String getStatusAI() {
        return statusAI;
    }

    public void setStatusAI(String statusAI) {
        this.statusAI = statusAI;
    }

    public Integer getSupplierIdAI() {
        return supplierIdAI;
    }

    public void setSupplierIdAI(Integer supplierIdAI) {
        this.supplierIdAI = supplierIdAI;
    }

    public String getFirmwareVersionAI() {
        return firmwareVersionAI;
    }

    public void setFirmwareVersionAI(String firmwareVersionAI) {
        this.firmwareVersionAI = firmwareVersionAI;
    }

    public String getAssetModelAI() {
        return assetModelAI;
    }

    public void setAssetModelAI(String assetModelAI) {
        this.assetModelAI = assetModelAI;
    }

    public String getSerialNumberAI() {
        return serialNumberAI;
    }

    public void setSerialNumberAI(String serialNumberAI) {
        this.serialNumberAI = serialNumberAI;
    }

    public Timestamp getLastMainceDateAI() {
        return lastMainceDateAI;
    }

    public void setLastMainceDateAI(Timestamp lastMainceDateAI) {
        this.lastMainceDateAI = lastMainceDateAI;
    }

    public Timestamp getNextMainceDateAI() {
        return nextMainceDateAI;
    }

    public void setNextMainceDateAI(Timestamp nextMainceDateAI) {
        this.nextMainceDateAI = nextMainceDateAI;
    }

    public Boolean getDeletedAI() {
        return deletedAI;
    }

    public void setDeletedAI(Boolean deletedAI) {
        this.deletedAI = deletedAI;
    }

    public String getDescriptionAI() {
        return descriptionAI;
    }

    public void setDescriptionAI(String descriptionAI) {
        this.descriptionAI = descriptionAI;
    }


    //asset_cabinet

    private Long idAC;
    private String cabinetIdAC;
    private String assetIdAC;
    private String cabinetAssetCodeAC;
    private Timestamp activeDateAC;
    private Timestamp deactiveDateAC;
    private Boolean deletedAC;
    private String descriptionAC;
    private Timestamp createDateAC;
    private String createByAC;
    private Timestamp updateDateAC;
    private String updateByAC;

    // Constructor
    public Asset_Info(Long idAC, String cabinetIdAC, String assetIdAC, String cabinetAssetCodeAC,
                      Timestamp activeDateAC, Timestamp deactiveDateAC, Boolean deletedAC,
                      String descriptionAC, Timestamp createDateAC, String createByAC,
                      Timestamp updateDateAC, String updateByAC) {
        this.idAC = idAC;
        this.cabinetIdAC = cabinetIdAC;
        this.assetIdAC = assetIdAC;
        this.cabinetAssetCodeAC = cabinetAssetCodeAC;
        this.activeDateAC = activeDateAC;
        this.deactiveDateAC = deactiveDateAC;
        this.deletedAC = deletedAC;
        this.descriptionAC = descriptionAC;
        this.createDateAC = createDateAC;
        this.createByAC = createByAC;
        this.updateDateAC = updateDateAC;
        this.updateByAC = updateByAC;
    }



    // Getters and Setters
    public Long getIdAC() { return idAC; }
    public void setIdAC(Long idAC) { this.idAC = idAC; }

    public String getCabinetIdAC() { return cabinetIdAC; }
    public void setCabinetIdAC(String cabinetIdAC) { this.cabinetIdAC = cabinetIdAC; }

    public String getAssetIdAC() { return assetIdAC; }
    public void setAssetIdAC(String assetIdAC) { this.assetIdAC = assetIdAC; }

    public String getCabinetAssetCodeAC() { return cabinetAssetCodeAC; }
    public void setCabinetAssetCodeAC(String cabinetAssetCodeAC) { this.cabinetAssetCodeAC = cabinetAssetCodeAC; }

    public Timestamp getActiveDateAC() { return activeDateAC; }
    public void setActiveDateAC(Timestamp activeDateAC) { this.activeDateAC = activeDateAC; }

    public Timestamp getDeactiveDateAC() { return deactiveDateAC; }
    public void setDeactiveDateAC(Timestamp deactiveDateAC) { this.deactiveDateAC = deactiveDateAC; }

    public Boolean getDeletedAC() { return deletedAC; }
    public void setDeletedAC(Boolean deletedAC) { this.deletedAC = deletedAC; }

    public String getDescriptionAC() { return descriptionAC; }
    public void setDescriptionAC(String descriptionAC) { this.descriptionAC = descriptionAC; }

    public Timestamp getCreateDateAC() { return createDateAC; }
    public void setCreateDateAC(Timestamp createDateAC) { this.createDateAC = createDateAC; }

    public String getCreateByAC() { return createByAC; }
    public void setCreateByAC(String createByAC) { this.createByAC = createByAC; }

    public Timestamp getUpdateDateAC() { return updateDateAC; }
    public void setUpdateDateAC(Timestamp updateDateAC) { this.updateDateAC = updateDateAC; }

    public String getUpdateByAC() { return updateByAC; }
    public void setUpdateByAC(String updateByAC) { this.updateByAC = updateByAC; }

    //lamp_type
    private LampType lampType;

    public LampType getLampType() {
        return lampType;
    }

    public void setLampType(LampType lampType) {
        this.lampType = lampType;
    }

    public Integer getFixGroupCount() {
        return fixGroupCount;
    }

    public void setFixGroupCount(Integer fixGroupCount) {
        this.fixGroupCount = fixGroupCount;
    }

    public Integer getLightGroupCount() {
        return lightGroupCount;
    }

    public void setLightGroupCount(Integer lightGroupCount) {
        this.lightGroupCount = lightGroupCount;
    }

    public Integer getLightCount() {
        return lightCount;
    }

    public void setLightCount(Integer lightCount) {
        this.lightCount = lightCount;
    }
}
