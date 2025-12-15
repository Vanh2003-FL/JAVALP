package org.openremote.model.firmware;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table (name = "frw_info_detail")
public class FirmwareInfoDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "frw_info_id", nullable = false)
    private Long frwInfoId;
    @Column(name = "asset_model", nullable = false, length = 50)
    private String assetModel;
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

    public FirmwareInfoDetail() {
    }

    public FirmwareInfoDetail(Long id, Long frwInfoId, String assetModel, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.frwInfoId = frwInfoId;
        this.assetModel = assetModel;
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

    public Long getFrwInfoId() {
        return frwInfoId;
    }

    public void setFrwInfoId(Long frwInfoId) {
        this.frwInfoId = frwInfoId;
    }

    public String getAssetModel() {
        return assetModel;
    }

    public void setAssetModel(String assetModel) {
        this.assetModel = assetModel;
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
