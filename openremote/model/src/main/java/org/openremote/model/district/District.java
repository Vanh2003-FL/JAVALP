package org.openremote.model.district;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_District")
public class District {

    @Id
    @Column(name = "district_id")
    private int id;

    @Column(name = "district_name", nullable = false, length = 255)
    private String name;

    @Column(name = "active", nullable = false)
    private Integer active = 1;

    @Column(name = "deleted", nullable = false)
    private Integer deleted = 0;

    @Column(name = "create_by", length = 255)
    private String createBy;

    @Column(name = "update_by", length = 255)
    private String updateBy;

    @Column(name = "create_date")
    private Timestamp createDate;

    @Column(name = "update_date")
    private Timestamp updateDate;

    @Column(name = "province_id")
    private int provinceId;

    // Constructor không tham số
    public District() {
    }

    public District(int districtId, String districtName, Integer active, Integer deleted,
                    String createBy, String updateBy, Timestamp createDate, Timestamp updateDate, Integer provinceId) {
        this.id = districtId;
        this.name = districtName;
        this.active = active;
        this.deleted = deleted;
        this.createBy = createBy;
        this.updateBy = updateBy;
        this.createDate = createDate;
        this.updateDate = updateDate;
        this.provinceId = provinceId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }

    public int getDeleted() {
        return deleted;
    }

    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public Timestamp getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Timestamp updateDate) {
        this.updateDate = updateDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public int getProviceId() {
        return provinceId;
    }

    public void setProviceId(int proviceId) {
        this.provinceId = proviceId;
    }
}
