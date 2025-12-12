package org.openremote.model.blog;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "blog_categories")
public class BlogCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 36, nullable = false)
    private String createdBy;

    @Column(length = 36)
    private String updatedBy;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    private String createdByName;

    private String updatedByName;

    public BlogCategory() {}

    public BlogCategory(Long id, String name, String description, String createdBy, String updatedBy, Timestamp createdAt, Timestamp updatedAt, String createdByName, String updatedByName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdByName = createdByName;
        this.updatedByName = updatedByName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
