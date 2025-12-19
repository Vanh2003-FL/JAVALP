package org.openremote.model.sys;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sys_attributes")
public class SysAttributes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attr_code", nullable = false, length = 30)
    private String attrCode;

    @Column(name = "attr_code_name", length = 150)
    private String attrCodeName;

    @Column(name = "attr_data_type", length = 50)
    private String attrDataType;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate = LocalDateTime.now();

    @Column(name = "create_by", length = 36)
    private String createBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "update_by", length = 36)
    private String updateBy;

    public SysAttributes() {
    }

    public SysAttributes(Long id, String attrCode, String attrCodeName, String attrDataType, Boolean active, LocalDateTime createDate, String createBy, LocalDateTime updateDate, String updateBy) {
        this.id = id;
        this.attrCode = attrCode;
        this.attrCodeName = attrCodeName;
        this.attrDataType = attrDataType;
        this.active = active;
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

    public String getAttrCode() {
        return attrCode;
    }

    public void setAttrCode(String attrCode) {
        this.attrCode = attrCode;
    }

    public String getAttrCodeName() {
        return attrCodeName;
    }

    public void setAttrCodeName(String attrCodeName) {
        this.attrCodeName = attrCodeName;
    }

    public String getAttrDataType() {
        return attrDataType;
    }

    public void setAttrDataType(String attrDataType) {
        this.attrDataType = attrDataType;
    }

    public Boolean getActive() {
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
}
