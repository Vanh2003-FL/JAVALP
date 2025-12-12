package org.openremote.model.sys;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sys_asset_type")
public class SysAssetType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Phù hợp với SERIAL, BIGSERIAL
    private Long id;

    @Column(name = "asset_type_code", nullable = false, length = 30)
    private String assetTypeCode;

    @Column(name = "asset_type_name", nullable = false, length = 150)
    private String assetTypeName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "icon", length = 150)
    private String icon;

    @Column(name = "colour", length = 150)
    private String colour;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate = LocalDateTime.now(); // Định dạng DATETIME

    @Column(name = "create_by", length = 36)
    private String createBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate; // Định dạng DATETIME

    @Column(name = "update_by", length = 36)
    private String updateBy;

    public SysAssetType() {
    }

    public SysAssetType(Long id, String assetTypeCode, String assetTypeName, String description, Boolean active, String icon, String colour, LocalDateTime createDate, String createBy, LocalDateTime updateDate, String updateBy) {
        this.id = id;
        this.assetTypeCode = assetTypeCode;
        this.assetTypeName = assetTypeName;
        this.description = description;
        this.active = active;
        this.icon = icon;
        this.colour = colour;
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

    public String getAssetTypeCode() {
        return assetTypeCode;
    }

    public void setAssetTypeCode(String assetTypeCode) {
        this.assetTypeCode = assetTypeCode;
    }

    public String getAssetTypeName() {
        return assetTypeName;
    }

    public void setAssetTypeName(String assetTypeName) {
        this.assetTypeName = assetTypeName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
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
