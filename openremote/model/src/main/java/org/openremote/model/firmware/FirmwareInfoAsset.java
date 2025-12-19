package org.openremote.model.firmware;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "frw_info_asset")
public class FirmwareInfoAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "frw_info_detail_id", nullable = false)
    private Long frwInfoDetailId;
    @Column(name = "asset_id", nullable = false, length = 22)
    private String assetId;
    @Column(name = "asset_model", nullable = false, length = 50)
    private String assetModel;
    @Column(name = "frw_version_old", nullable = false, length = 10)
    private String frwVersionOld;
    @Column(name = "frw_version_new", nullable = false, length = 10)
    private String frwVersionNew;
    @Column(name = "status", nullable = false, length = 5)
    private String status;
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

    public FirmwareInfoAsset() {
    }

    public FirmwareInfoAsset(Long id, Long frwInfoDetailId, String assetId, String assetModel, String frwVersionOld, String frwVersionNew, String status, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.frwInfoDetailId = frwInfoDetailId;
        this.assetId = assetId;
        this.assetModel = assetModel;
        this.frwVersionOld = frwVersionOld;
        this.frwVersionNew = frwVersionNew;
        this.status = status;
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

    public Long getFrwInfoDetailId() {
        return frwInfoDetailId;
    }

    public void setFrwInfoDetailId(Long frwInfoDetailId) {
        this.frwInfoDetailId = frwInfoDetailId;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetModel() {
        return assetModel;
    }

    public void setAssetModel(String assetModel) {
        this.assetModel = assetModel;
    }

    public String getFrwVersionOld() {
        return frwVersionOld;
    }

    public void setFrwVersionOld(String frwVersionOld) {
        this.frwVersionOld = frwVersionOld;
    }

    public String getFrwVersionNew() {
        return frwVersionNew;
    }

    public void setFrwVersionNew(String frwVersionNew) {
        this.frwVersionNew = frwVersionNew;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
