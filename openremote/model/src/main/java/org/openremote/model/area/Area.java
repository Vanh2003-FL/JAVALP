package org.openremote.model.area;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "area", schema = "openremote")
public class Area {

  @Id
  @Column(length = 36)
  private String id;

  @Column(length = 100)
  private String name;

  @Column(length = 50)
  private String code;

  @Column(name = "short_name", length = 50)
  private String shortName;

  @Column(name = "ward_id")
  private Long wardId;

  @Column(name = "realm_name", length = 150)
  private String realmName;

  @Column(name = "created_by", length = 36)
  private String createdBy;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_by", length = 36)
  private String updatedBy;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "is_deleted")
  private Boolean isDeleted = false;

  public Area() {
  }

  public Area(String id, String name, String code, String shortName, Long wardId, String realmName) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.shortName = shortName;
    this.wardId = wardId;
    this.realmName = realmName;
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

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getShortName() {
    return shortName;
  }

  public void setShortName(String shortName) {
    this.shortName = shortName;
  }

  public Long getWardId() {
    return wardId;
  }

  public void setWardId(Long wardId) {
    this.wardId = wardId;
  }

  public String getRealmName() {
    return realmName;
  }

  public void setRealmName(String realmName) {
    this.realmName = realmName;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(String createdBy) {
    this.createdBy = createdBy;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public String getUpdatedBy() {
    return updatedBy;
  }

  public void setUpdatedBy(String updatedBy) {
    this.updatedBy = updatedBy;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }

  public void setIsDeleted(Boolean deleted) {
    isDeleted = deleted;
  }
}
