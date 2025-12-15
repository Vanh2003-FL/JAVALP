package org.openremote.model.news_category;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "news_category", schema = "openremote")
public class NewsCategory {

    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 150)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "realm_name", length = 150)
    private String realmName;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public NewsCategory() {
        // Sinh UUID tự động khi khởi tạo entity mới
        this.id = UUID.randomUUID().toString();
    }

    public NewsCategory(String id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
    }

    public NewsCategory(String title, String description) {
        this();
        this.title = title;
        this.description = description;
    }

    public NewsCategory(String id, String title, String description, Timestamp createdAt, Timestamp updatedAt,
                        String createdBy, String updatedBy, String realmName, Boolean isDeleted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.realmName = realmName;
        this.isDeleted = isDeleted;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }
    public Boolean getDeleted() { return isDeleted; }
    public void setDeleted(Boolean deleted) { isDeleted = deleted; }

}
