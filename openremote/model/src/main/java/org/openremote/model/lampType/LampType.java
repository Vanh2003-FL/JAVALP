package org.openremote.model.lampType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "md_lamp_type") // viết thường để match DB
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LampType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tương ứng serial4
    @Column(name = "id")
    private int id;

    @Column(name = "lamp_type_code", length = 30)
    private String lampTypeCode;

    @Column(name = "lamp_type_name", length = 250)
    private String lampTypeName;

    @Column(name = "power_consumption")
    private int powerConsumption;

    @Column(name = "luminous_flux")
    private int luminousFlux;

    @Column(name = "life_hours")
    private int lifeHours = 0;

    @Column(name = "active")
    private int active = 1;

    @Column(name = "deleted")
    private int deleted = 0;

    @Column(name = "create_date")
    private Timestamp createDate;

    @Column(name = "create_by", length = 36)
    private String createBy;

    @Column(name = "update_date")
    private Timestamp updateDate;

    @Column(name = "update_by", length = 36)
    private String updateBy;

    public LampType() {
    }

    public LampType(int id, String lampTypeCode, String lampTypeName, int powerConsumption, int luminousFlux,
                    int lifeHours, int active, int deleted, Timestamp createDate,
                    String createBy, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.lampTypeCode = lampTypeCode;
        this.lampTypeName = lampTypeName;
        this.powerConsumption = powerConsumption;
        this.luminousFlux = luminousFlux;
        this.lifeHours = lifeHours;
        this.active = active;
        this.deleted = deleted;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public LampType(int id, String lampTypeName,int powerConsumption) {
        this.id = id;
        this.lampTypeName = lampTypeName;
        this.powerConsumption= powerConsumption;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLampTypeCode() {
        return lampTypeCode;
    }

    public void setLampTypeCode(String lampTypeCode) {
        this.lampTypeCode = lampTypeCode;
    }

    public String getLampTypeName() {
        return lampTypeName;
    }

    public void setLampTypeName(String lampTypeName) {
        this.lampTypeName = lampTypeName;
    }

    public int getPowerConsumption() {
        return powerConsumption;
    }

    public void setPowerConsumption(int powerConsumption) {
        this.powerConsumption = powerConsumption;
    }

    public int getLuminousFlux() {
        return luminousFlux;
    }

    public void setLuminousFlux(int luminousFlux) {
        this.luminousFlux = luminousFlux;
    }

    public int getLifeHours() {
        return lifeHours;
    }

    public void setLifeHours(int lifeHours) {
        this.lifeHours = lifeHours;
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
