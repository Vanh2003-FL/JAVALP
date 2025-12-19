package org.openremote.model.folder;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "folder")
public class Folder {

    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 100)
    private String name;

    @Column(name = "realm_name", length = 150)
    private String realmName;

    @Column(name = "parent_id", length = 36)
    private String parentId;

    @Column(length = 150)
    private String path;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public Folder() {}

    public Folder(
            String id,
            String name,
            String realmName,
            String parentId,
            String path,
            String description,
            String createdBy,
            Timestamp createdAt,
            String updatedBy,
            Timestamp updatedAt,
            Boolean isDeleted
    ) {
        this.id = id;
        this.name = name;
        this.realmName = realmName;
        this.parentId = parentId;
        this.path = path;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
    }

    public Folder(String id, String name, String realmName) {
        this.id = id;
        this.name = name;
        this.realmName = realmName;
    }

    // ===== GETTER & SETTER =====

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

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean deleted) {
        isDeleted = deleted;
    }
}
