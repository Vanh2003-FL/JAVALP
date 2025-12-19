package org.openremote.model.ward;

import jakarta.persistence.Id;

import java.sql.Timestamp;

public class Ward {
    @Id
    private int id;

    private String name;

    private int active;

    private int deleted;

    private Timestamp createDate;

    private Timestamp updateDate;

    private String createBy;

    private String updateBy;

    private int districtId;
    private int provinceId;

    public Ward() {
    }

    public Ward(int id, String districtName, int active, int deleted,
                    String createBy, String updateBy, Timestamp createDate, Timestamp updateDate, Integer provinceId) {
        this.id = id;
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

    public int getDistrictId() {
        return districtId;
    }

    public void setDistrictId(int districtId) {
        this.districtId = districtId;
    }

    public int getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(int provinceId) {
        this.provinceId = provinceId;
    }
}
