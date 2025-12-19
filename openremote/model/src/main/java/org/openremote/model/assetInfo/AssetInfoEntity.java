package org.openremote.model.assetInfo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
@SqlResultSetMapping(
        name = "AssetInfoMapping",
        classes = @ConstructorResult(
                targetClass = AssetInfoEntity.class,
                columns = {
                        @ColumnResult(name = "id", type = String.class),
                        @ColumnResult(name = "asset_code", type = String.class),
                        @ColumnResult(name = "create_date", type = LocalDateTime.class),
                        @ColumnResult(name = "create_by", type = String.class),
                        @ColumnResult(name = "update_date", type = LocalDateTime.class),
                        @ColumnResult(name = "update_by", type = String.class),
                        @ColumnResult(name = "province_id", type = Integer.class),
                        @ColumnResult(name = "district_id", type = Integer.class),
                        @ColumnResult(name = "ward_id", type = Short.class),
                        @ColumnResult(name = "street_name", type = String.class),
                        @ColumnResult(name = "address", type = String.class),
                        @ColumnResult(name = "status", type = String.class),
                        @ColumnResult(name = "supplier_id", type = Integer.class),
                        @ColumnResult(name = "firmware_version", type = String.class),
                        @ColumnResult(name = "asset_model", type = String.class),
                        @ColumnResult(name = "serial_number", type = String.class),
                        @ColumnResult(name = "last_maince_date", type = LocalDateTime.class),
                        @ColumnResult(name = "next_maince_date", type = LocalDateTime.class),
                        @ColumnResult(name = "deleted", type = Boolean.class),
                        @ColumnResult(name = "description", type = String.class),
                        @ColumnResult(name = "last_time_warning", type = ZonedDateTime.class),
                        @ColumnResult(name = "last_value_warning", type = String.class)
                }
        )
)
@Entity
@Table(name = "asset_info", schema = "openremote")
public class AssetInfoEntity {

    @Id
    @Column(length = 22, nullable = false)
    private String id;

    @Column(name = "asset_code", length = 30)
    private String assetCode;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "create_by", length = 22)
    private String createBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "update_by", length = 22)
    private String updateBy;

    @Column(name = "province_id")
    private Integer provinceId;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "ward_id")
    private Short wardId;

    @Column(name = "street_name", length = 50)
    private String streetName;

    @Column(length = 500)
    private String address;

    @Column(length = 5)
    private String status;

    @Column(name = "supplier_id")
    private Integer supplierId;

    @Column(name = "firmware_version", length = 10)
    private String firmwareVersion;

    @Column(name = "asset_model", length = 50)
    private String assetModel;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "last_maince_date")
    private LocalDateTime lastMainceDate;

    @Column(name = "next_maince_date")
    private LocalDateTime nextMainceDate;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(length = 250)
    private String description;

    @Column(name = "last_time_warning")
    private ZonedDateTime lastTimeWarning;

    @Column(name = "last_value_warning", length = 5)
    private String lastValueWarning;

    public AssetInfoEntity(AssetInfoEntity assetInfoEntity) {
        this.id = assetInfoEntity.getId();
        this.status = assetInfoEntity.getStatus();
        this.lastTimeWarning = assetInfoEntity.getLastTimeWarning();
        this.lastValueWarning = assetInfoEntity.getStatus();
    }
    // Getters and Setters (or use Lombok's @Data / @Getter / @Setter)

    public AssetInfoEntity(String id, String assetCode, LocalDateTime createDate, String createBy, LocalDateTime updateDate, String updateBy, Integer provinceId, Integer districtId, Short wardId, String streetName, String address, String status, Integer supplierId, String firmwareVersion, String assetModel, String serialNumber, LocalDateTime lastMainceDate, LocalDateTime nextMainceDate, Boolean deleted, String description, ZonedDateTime lastTimeWarning, String lastValueWarning) {
        this.id = id;
        this.assetCode = assetCode;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
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
        this.lastMainceDate = lastMainceDate;
        this.nextMainceDate = nextMainceDate;
        this.deleted = deleted;
        this.description = description;
        this.lastTimeWarning = lastTimeWarning;
        this.lastValueWarning = lastValueWarning;
    }

    public AssetInfoEntity() {

    }

    public AssetInfoEntity(String id, ZonedDateTime lastTimeWarning, String lastValueWarning) {
        this.id = id;
        this.lastTimeWarning = lastTimeWarning;
        this.lastValueWarning = lastValueWarning;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
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

    public Short getWardId() {
        return wardId;
    }

    public void setWardId(Short wardId) {
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

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
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

    public LocalDateTime getLastMainceDate() {
        return lastMainceDate;
    }

    public void setLastMainceDate(LocalDateTime lastMainceDate) {
        this.lastMainceDate = lastMainceDate;
    }

    public LocalDateTime getNextMainceDate() {
        return nextMainceDate;
    }

    public void setNextMainceDate(LocalDateTime nextMainceDate) {
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

    public ZonedDateTime getLastTimeWarning() {
        return lastTimeWarning;
    }

    public void setLastTimeWarning(ZonedDateTime lastTimeWarning) {
        this.lastTimeWarning = lastTimeWarning;
    }

    public String getLastValueWarning() {
        return lastValueWarning;
    }

    public void setLastValueWarning(String lastValueWarning) {
        this.lastValueWarning = lastValueWarning;
    }
}
