package org.openremote.model.warningMicroIP;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "micro_ip_device")
public class WarningMicroIP {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "device_code")
    private String device_code;

    @Column(name = "device_name")
    private String device_name;

    @Transient
    private String area_name;

    @Column(name = "is_locked")
    private Boolean is_locked;
    @JsonIgnore
    @Column(name = "area_id")
    private int area_id;

    @Column(name = "realm_name")
    private String realm_name;

    @Column(name = "created_by")
    private String create_by;

    @Column(name = "created_at")
    private Timestamp create_at;

    @Column(name = "updated_at")
    private Timestamp update_at;

    @Column(name = "updated_by")
    private String update_by;
    @JsonIgnore
    @Column(name = "is_deleted")
    private Boolean delete = false;



    public WarningMicroIP() {
    }

    public WarningMicroIP(String id, String device_code, String device_name, Boolean is_locked, int area_id, String realm_name, String create_by, Timestamp create_at, Timestamp update_at, String update_by, Boolean delete, String area_name) {
        this.id = id;
        this.device_code = device_code;
        this.device_name = device_name;
        this.is_locked = is_locked;
        this.area_name = area_name;
        this.area_id = area_id;
        this.realm_name = realm_name;
        this.create_by = create_by;
        this.create_at = create_at;
        this.update_at = update_at;
        this.update_by = update_by;
        this.delete = delete;
    }

    public String getArea_name() {
        return area_name;
    }

    public void setArea_name(String area_name) {
        this.area_name = area_name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDevice_code() {
        return device_code;
    }

    public void setDevice_code(String device_code) {
        this.device_code = device_code;
    }

    public String getDevice_name() {
        return device_name;
    }

    public void setDevice_name(String device_name) {
        this.device_name = device_name;
    }

    public Boolean getIs_locked() {
        return is_locked;
    }

    public void setIs_locked(Boolean is_locked) {
        this.is_locked = is_locked;
    }

    public int getArea_id() {
        return area_id;
    }

    public void setArea_id(int area_id) {
        this.area_id = area_id;
    }

    public String getRealm_name() {
        return realm_name;
    }

    public void setRealm_name(String realm_name) {
        this.realm_name = realm_name;
    }

    public String getCreate_by() {
        return create_by;
    }

    public void setCreate_by(String create_by) {
        this.create_by = create_by;
    }

    public Timestamp getCreate_at() {
        return create_at;
    }

    public void setCreate_at(Timestamp create_at) {
        this.create_at = create_at;
    }

    public Timestamp getUpdate_at() {
        return update_at;
    }

    public void setUpdate_at(Timestamp update_at) {
        this.update_at = update_at;
    }

    public String getUpdate_by() {
        return update_by;
    }

    public void setUpdate_by(String update_by) {
        this.update_by = update_by;
    }

    public Boolean getDelete() {
        return delete;
    }

    public void setDelete(Boolean delete) {
        this.delete = delete;
    }
}
