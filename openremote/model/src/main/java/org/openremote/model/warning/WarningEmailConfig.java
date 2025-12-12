package org.openremote.model.warning;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.sql.Date;

@Entity
@Table(name = "warning_email_config")
public class WarningEmailConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "realm", nullable = false)
    private String realm;
    @Column(name = "email", nullable = false, length = 50)
    private String email;
    @Column(name = "fullname", nullable = false, length = 50)
    private String fullName;
    @Column(name = "upper_bound_value", nullable = false)
    private BigDecimal upperBoundValue;
    @Column(name = "lower_bound_value", nullable = false)
    private BigDecimal lowerBoundValue;
    @Column(name = "warning_value", nullable = false, length = 30)
    private String warningValue;
    @Column(name = "sys_warning_id", nullable = false)
    private Long sysWarningId;
    @Column(name = "start_date", nullable = false)
    private Date startDate;
    @Column(name = "active", nullable = false)
    private Boolean active = true;
    @Column(name = "create_date", nullable = false)
    private Date createDate;
    @Column(name = "create_by", length = 36)
    private String createBy;
    @Column(name = "update_date")
    private Date updateDate;
    @Column(name = "update_by", length = 36)
    private String updateBy;

    private String valueType;

    public WarningEmailConfig() {
    }

    public WarningEmailConfig(Long id, String realm, String email, String fullName, BigDecimal upperBoundValue, BigDecimal lowerBoundValue, String warningValue, Long sysWarningId, Date startDate, Boolean active, Date createDate, String createBy, Date updateDate, String updateBy, String valueType) {
        this.id = id;
        this.realm = realm;
        this.email = email;
        this.fullName = fullName;
        this.upperBoundValue = upperBoundValue;
        this.lowerBoundValue = lowerBoundValue;
        this.warningValue = warningValue;
        this.sysWarningId = sysWarningId;
        this.startDate = startDate;
        this.active = active;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.valueType = valueType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Long getSysWarningId() {
        return sysWarningId;
    }

    public void setSysWarningId(Long sysWarningId) {
        this.sysWarningId = sysWarningId;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
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

    public String getValueType() { return valueType; }

    public void setValueType(String valueType) { this.valueType = valueType; }
}
