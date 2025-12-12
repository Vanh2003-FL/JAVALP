package org.openremote.model.supplier;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "md_supplier")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private int id;

    @Column(name = "supplier_code", nullable = false, unique = true)
    private String code;

    @Column(name = "supplier_name", nullable = false)
    private String name;

    @Column(name = "active")
    private int active;

    @Column(name = "deleted")
    private int deleted;

    @Column(name = "create_date")
    private Timestamp createDate;

    @Column(name = "create_by")
    private String createBy;

    @Column(name = "update_date")
    private Timestamp updateDate;

    @Column(name = "update_by")
    private String updateBy;


    public Supplier() {
        this.active = 1;
        this.deleted = 0;
    }

    public Supplier(int id, String code, String name, int active, int deleted, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.active = active;
        this.deleted = deleted;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
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

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public int getDeleted() {
        return deleted;
    }

    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
