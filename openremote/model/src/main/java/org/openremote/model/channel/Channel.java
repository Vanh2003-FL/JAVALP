package org.openremote.model.channel;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "channel")
public class Channel {
    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "realm_name")
    private String realm_name;

    @Column(name = "created_by")
    private String created_by;

    @Column(name = "created_at")
    private Timestamp created_at;

    @Column(name = "updated_by")
    private String updated_by;

    @Column(name = "updated_at")
    private Timestamp updated_at;

    @Column(name = "source_id")
    private String source_id;
    @Transient
    private String source_name;
    @JsonIgnore
    @Transient
    @Column(name = "is_deleted")
    private Boolean is_deleted = false;


    public Channel() {
        this.id = UUID.randomUUID().toString();
    }

    public Channel(String id, String name, String description, String realm_name, String created_by, Timestamp created_at, String updated_by, Timestamp updated_at, String source_id) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.realm_name = realm_name;
        this.created_by = created_by;
        this.created_at = created_at;
        this.updated_by = updated_by;
        this.updated_at = updated_at;
        this.source_id = source_id;
    }

    public Channel(String id, String name, String description,String source_name, String created_by, Timestamp created_at) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.source_name = source_name;
        this.created_by = created_by;
        this.created_at = created_at;
    }

    public String getSource_name() {
        return source_name;
    }

    public void setSource_name(String source_name) {
        this.source_name = source_name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRealm_name() {
        return realm_name;
    }

    public void setRealm_name(String realm_name) {
        this.realm_name = realm_name;
    }

    public String getCreated_by() {
        return created_by;
    }

    public void setCreated_by(String created_by) {
        this.created_by = created_by;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }

    public String getUpdated_by() {
        return updated_by;
    }

    public void setUpdated_by(String updated_by) {
        this.updated_by = updated_by;
    }

    public Timestamp getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(Timestamp updated_at) {
        this.updated_at = updated_at;
    }

    public String getSource_id() {
        return source_id;
    }

    public void setSource_id(String source_id) {
        this.source_id = source_id;
    }

    public Boolean getIs_deleted() {
        return is_deleted;
    }

    public void setIs_deleted(Boolean is_deleted) {
        this.is_deleted = is_deleted;
    }
}
