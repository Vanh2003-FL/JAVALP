package org.openremote.model.content;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "content")
public class Content {

    @Id
    @Column(length = 36)
    private String id; // VARCHAR(36)

    private String name;

    @Column(name = "realm_name")
    private String realmName;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "size_file")
    private Integer sizeFile;

    @Column(name = "duration_file")
    private String durationFile;

    @Column(name = "source_id", length = 36)
    private String sourceId;

    @Column(name = "channel_id", length = 36)
    private String channelId;

    @Column(name = "folder_id", length = 36)
    private String folderId;

    @Column(name = "playlist_id", length = 36)
    private String playlistId;

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

    public Content() {}

    public Content(String id, String name, String realmName, String fileName) {
        this.id = id;
        this.name = name;
        this.realmName = realmName;
        this.fileName = fileName;
    }

    public Content(String id, String name, String realmName, String fileName, String fileType, String filePath, Integer sizeFile, String durationFile, String sourceId, String channelId, String folderId, String playlistId, String createdBy, Timestamp createdAt, String updatedBy, Timestamp updatedAt, Boolean isDeleted) {
        this.id = id;
        this.name = name;
        this.realmName = realmName;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.sizeFile = sizeFile;
        this.durationFile = durationFile;
        this.sourceId = sourceId;
        this.channelId = channelId;
        this.folderId = folderId;
        this.playlistId = playlistId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
    }
    // ================= Getter & Setter =================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Integer getSizeFile() { return sizeFile; }
    public void setSizeFile(Integer sizeFile) { this.sizeFile = sizeFile; }

    public String getDurationFile() { return durationFile; }
    public void setDurationFile(String durationFile) { this.durationFile = durationFile; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }

    public String getFolderId() { return folderId; }
    public void setFolderId(String folderId) { this.folderId = folderId; }

    public String getPlaylistId() { return playlistId; }
    public void setPlaylistId(String playlistId) { this.playlistId = playlistId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean deleted) { isDeleted = deleted; }
}
