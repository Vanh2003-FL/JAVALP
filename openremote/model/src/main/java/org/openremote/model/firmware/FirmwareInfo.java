package org.openremote.model.firmware;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "frw_info")
public class FirmwareInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "frw_version", nullable = false, length = 30)
    private String frwVersion;
    @Column(name = "asset_type", nullable = false, length = 22)
    private String assetType;
    @Column(name = "sub_asset_type", nullable = false, length = 10)
    private String subAssetType;
    @Column(name = "upgrage_date", nullable = false)
    private Timestamp upgradeDate;
    @Column(name = "status", nullable = false, length = 5)
    private String status;
    @Column(name = "path_firmware", nullable = false, length = 500)
    private String pathFirmware;
    @Column(name = "file_name", nullable = false, length = 250)
    private String fileName;
    @Column(name = "description", nullable = false, length = 500)
    private String description;
    @Column(name = "create_date", nullable = false)
    private Timestamp createDate;
    @Column(name = "create_by", length = 36)
    private String createBy;
    @Column(name = "update_date")
    private Timestamp updateDate;
    @Column(name = "update_by", length = 36)
    private String updateBy;

    public FirmwareInfo() {
    }

    public FirmwareInfo(Long id, String frwVersion, String assetType, String subAssetType, Timestamp upgradeDate, String status, String pathFirmware, String fileName, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.frwVersion = frwVersion;
        this.assetType = assetType;
        this.subAssetType = subAssetType;
        this.upgradeDate = upgradeDate;
        this.status = status;
        this.pathFirmware = pathFirmware;
        this.fileName = fileName;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFrwVersion() {
        return frwVersion;
    }

    public void setFrwVersion(String frwVersion) {
        this.frwVersion = frwVersion;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public String getSubAssetType() {
        return subAssetType;
    }

    public void setSubAssetType(String subAssetType) {
        this.subAssetType = subAssetType;
    }

    public Timestamp getUpgradeDate() {
        return upgradeDate;
    }

    public void setUpgradeDate(Timestamp upgradeDate) {
        this.upgradeDate = upgradeDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPathFirmware() {
        return pathFirmware;
    }

    public void setPathFirmware(String pathFirmware) {
        this.pathFirmware = pathFirmware;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
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
}
