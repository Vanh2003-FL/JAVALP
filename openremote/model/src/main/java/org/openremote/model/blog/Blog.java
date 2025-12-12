package org.openremote.model.blog;

import jakarta.persistence.*;

import java.sql.Timestamp;


@Entity
@Table(name = "blogs")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "thumbnail_url", length = 255)
    private String thumbnailUrl;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "priority_level")
    private Short priorityLevel;

    @Column(name = "start_date")
    private Timestamp startDate;

    @Column(name = "end_date")
    private Timestamp endDate;

    @Column
    private Boolean status;

    @Column(name = "view_count", columnDefinition = "INT DEFAULT 0")
    private Integer viewCount = 0;

    @Column(length = 36, nullable = false)
    private String createdBy;

    @Column(length = 36)
    private String updatedBy;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    private String createByName;

    private String updateByName;

    private Timestamp fromStartDate;

    private Timestamp fromEndDate;

    private Timestamp toStartDate;

    private Timestamp toEndDate;

    public Blog(Long id, String title, String content, String slug, String summary, String thumbnailUrl,
                Integer categoryId, Short priorityLevel, Timestamp startDate, Timestamp endDate, Boolean status,
                Integer viewCount, String createdBy, String updatedBy, Timestamp createdAt, Timestamp updatedAt, String createByName, String updateByName) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.slug = slug;
        this.summary = summary;
        this.thumbnailUrl = thumbnailUrl;
        this.categoryId = categoryId;
        this.priorityLevel = priorityLevel;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.viewCount = viewCount;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createByName = createByName;
        this.updateByName = updateByName;
    }

    public Blog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Short getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(Short priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public Timestamp getStartDate() {
        return startDate;
    }

    public void setStartDate(Timestamp startDate) {
        this.startDate = startDate;
    }

    public Timestamp getEndDate() {
        return endDate;
    }

    public void setEndDate(Timestamp endDate) {
        this.endDate = endDate;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
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

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getCreateByName() {
        return createByName;
    }

    public void setCreateByName(String createByName) {
        this.createByName = createByName;
    }

    public String getUpdateByName() {
        return updateByName;
    }

    public void setUpdateByName(String updateByName) {
        this.updateByName = updateByName;
    }

    public Timestamp getFromStartDate() {
        return fromStartDate;
    }

    public void setFromStartDate(Timestamp fromStartDate) {
        this.fromStartDate = fromStartDate;
    }

    public Timestamp getFromEndDate() {
        return fromEndDate;
    }

    public void setFromEndDate(Timestamp fromEndDate) {
        this.fromEndDate = fromEndDate;
    }

    public Timestamp getToStartDate() {
        return toStartDate;
    }

    public void setToStartDate(Timestamp toStartDate) {
        this.toStartDate = toStartDate;
    }

    public Timestamp getToEndDate() {
        return toEndDate;
    }

    public void setToEndDate(Timestamp toEndDate) {
        this.toEndDate = toEndDate;
    }
}
