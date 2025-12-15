package org.openremote.model.province;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_PROVINCE")
public class Province {

    @Id
    @Column(name = "province_id")
    private int id;

    @Column(name = "province_name")
    private String name;

    @Column(name = "active")
    private int active;

    @Column(name = "deleted")
    private int deleted;

    @Column(name = "create_date")
    private Timestamp createDate;

    @Column(name = "update_date")
    private Timestamp updateDate;

    @Column(name = "create_by")
    private String createBy;

    @Column(name = "update_by")
    private String updateBy;

    public Province() {
    }

    public Province(int id, String name, int active, int deleted, String createBy, String updateBy, Timestamp createDate, Timestamp updateDate) {
        this.id = id;
        this.name = name;
        this.active = active;
        this.deleted = deleted;
        this.createBy = createBy;
        this.updateBy = updateBy;
        this.createDate = createDate;
        this.updateDate = updateDate;
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
}
