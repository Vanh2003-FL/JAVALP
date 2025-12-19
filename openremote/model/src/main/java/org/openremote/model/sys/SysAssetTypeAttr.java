package org.openremote.model.sys;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sys_asset_type_attr")
public class SysAssetTypeAttr {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Phù hợp với BIGSERIAL
    private Long id;

    @Column(name = "asset_type_id", nullable = false)
    private Long assetTypeId;

    @Column(name = "attr_id", nullable = false)
    private Long attrId;

    @Column(name = "attr_data_type", nullable = false, length = 50)
    private String attrDataType;

    @Column(name = "attr_format", length = 50)
    private String attrFormat;

    @Column(name = "is_report", nullable = false)
    private Boolean isReport = false;

    @Column(name = "is_set_rule", nullable = false)
    private Boolean isSetRule = false;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate = LocalDateTime.now();

    @Column(name = "create_by", length = 36)
    private String createBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "update_by", length = 36)
    private String updateBy;

    public SysAssetTypeAttr() {
    }

    public SysAssetTypeAttr(Long id, Long assetTypeId, Long attrId, String attrDataType, String attrFormat, Boolean isReport, Boolean isSetRule, LocalDateTime createDate, String createBy, LocalDateTime updateDate, String updateBy) {
        this.id = id;
        this.assetTypeId = assetTypeId;
        this.attrId = attrId;
        this.attrDataType = attrDataType;
        this.attrFormat = attrFormat;
        this.isReport = isReport;
        this.isSetRule = isSetRule;
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

    public Long getAssetTypeId() {
        return assetTypeId;
    }

    public void setAssetTypeId(Long assetTypeId) {
        this.assetTypeId = assetTypeId;
    }

    public Long getAttrId() {
        return attrId;
    }

    public void setAttrId(Long attrId) {
        this.attrId = attrId;
    }

    public String getAttrDataType() {
        return attrDataType;
    }

    public void setAttrDataType(String attrDataType) {
        this.attrDataType = attrDataType;
    }

    public String getAttrFormat() {
        return attrFormat;
    }

    public void setAttrFormat(String attrFormat) {
        this.attrFormat = attrFormat;
    }

    public Boolean getIsReport() {
        return isReport;
    }

    public void setIsReport(Boolean isReport) {
        this.isReport = isReport;
    }

    public Boolean getIsSetRule() {
        return isSetRule;
    }

    public void setIsSetRule(Boolean isSetRule) {
        this.isSetRule = isSetRule;
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
}
