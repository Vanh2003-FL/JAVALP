package org.openremote.model.sys;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.sql.Date;

@Entity
@Table(name = "sys_warning_rule")
public class SysWarningRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long attributeId;
    private BigDecimal upperBoundValue;
    private BigDecimal lowerBoundValue;
    private String warningValue;
    private Boolean active = true;
    private Date createDate;
    private String createBy;
    private Date updateDate;
    private String updateBy;
    private String valueType;

    private String attrCodeName;
    private String attrCode;

    public SysWarningRule() {
    }

    public SysWarningRule(Long id, Long attributeId, BigDecimal upperBoundValue, BigDecimal lowerBoundValue, String warningValue, Boolean active, String createBy, String updateBy, String attrCode, String attrCodeName, Date createDate, Date updateDate, String valueType) {
        this.id = id;
        this.attributeId = attributeId;
        this.upperBoundValue = upperBoundValue;
        this.lowerBoundValue = lowerBoundValue;
        this.warningValue = warningValue;
        this.active = active;
        this.createBy = createBy;
        this.updateBy = updateBy;
        this.attrCodeName = attrCode;
        this.attrCode = attrCodeName;
        this.createDate = createDate;
        this.updateDate = updateDate;
        this.valueType = valueType;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public Long getAttributeId() {
        return attributeId;
    }

    public void setAttributeId(Long attributeId) {
        this.attributeId = attributeId;
    }

    public BigDecimal getUpperBoundValue() {
        return upperBoundValue;
    }

    public void setUpperBoundValue(BigDecimal upperBoundValue) {
        this.upperBoundValue = upperBoundValue;
    }

    public BigDecimal getLowerBoundValue() {
        return lowerBoundValue;
    }

    public void setLowerBoundValue(BigDecimal lowerBoundValue) {
        this.lowerBoundValue = lowerBoundValue;
    }

    public String getWarningValue() {
        return warningValue;
    }

    public void setWarningValue(String warningValue) {
        this.warningValue = warningValue;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public String getAttrCodeName() { return attrCodeName; }

    public void setAttrCodeName(String attrCodeName) { this.attrCodeName = attrCodeName; }

    public String getAttrCode() { return attrCode; }

    public void setAttrCode(String attrCode) { this.attrCode = attrCode; }

    public String getValueType() { return valueType; }

    public void setValueType(String valueType) { this.valueType = valueType; }

}
