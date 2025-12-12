package org.openremote.model.live_stream_channel;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "live_stream_channel", schema = "openremote")
public class LiveStreamChannel {
    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 100)
    private String title;

    @Column(length = 150)
    private String url;

    @Column(name = "is_share")
    private Boolean isShare = false;

    @Column(name = "area_id", length = 36)
    private String areaId;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "source_id", length = 36)
    private String sourceId;

    @Column(name = "channel_id", length = 36)
    private String channelId;

    @Column(name = "realm_name", length = 150)
    private String realmName;

    @Column
    private Integer status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "created_at")
    private Timestamp createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public LiveStreamChannel() {}

    public LiveStreamChannel(String id, String title, String url, Boolean isShare, String areaId, Integer status) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.isShare = isShare;
        this.areaId = areaId;
        this.status = status;
    }

    public LiveStreamChannel(String id, String title, String url, Boolean isShare, String areaId, String description,
                            String sourceId, String channelId, String realmName, Integer status,
                            Timestamp createdAt, Timestamp updatedAt, String createdBy, String updatedBy, Boolean isDeleted) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.isShare = isShare;
        this.areaId = areaId;
        this.description = description;
        this.sourceId = sourceId;
        this.channelId = channelId;
        this.realmName = realmName;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.isDeleted = isDeleted;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Boolean getShare() {
        return isShare;
    }

    public void setShare(Boolean share) {
        isShare = share;
    }

    public String getAreaId() {
        return areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Boolean getDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }
}
