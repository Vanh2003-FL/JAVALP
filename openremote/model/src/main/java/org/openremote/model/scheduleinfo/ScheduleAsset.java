package org.openremote.model.scheduleinfo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.openremote.model.asset.Asset;
import org.openremote.model.sys.SysAssetType;

import java.util.Map;

@Entity
@Table(name = "schedule_asset")
public class ScheduleAsset {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private ScheduleInfo schedule;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "sys_asset_type_id", nullable = false)  // Đổi tên từ asset_type_id sang sys_asset_type_id nếu cần
    private SysAssetType assetType;

    @Transient
    private String directScheduleId;

    @Transient
    private String directAssetId;

    @Transient
    private String directSysAssetId;

    @Transient
    public String assetName;

    @Transient
    public String asset_id;

    @Transient
    private Integer status;

    public void setAssetTypeCode(String assetTypeCode) {
        this.assetTypeCode = assetTypeCode;
    }

    public void setAssetTypeName(String assetTypeName) {
        this.assetTypeName = assetTypeName;
    }

    public Integer getAsset_type_id() {
        return asset_type_id;
    }

    public void setAsset_type_id(Integer asset_type_id) {
        this.asset_type_id = asset_type_id;
    }

    public String getAsset_id() {
        return asset_id;
    }

    public void setAsset_id(String asset_id) {
        this.asset_id = asset_id;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    @Transient
    public Integer asset_type_id;

    @Transient
    public String assetTypeName;

    @Transient
    public String assetTypeCode;

    @Transient
    private Map<String, Object> attributes;
    @JsonProperty("schedule_id")
    public String getDirectScheduleId() {
        return directScheduleId;
    }

    public void setDirectScheduleId(String directScheduleId) {
        this.directScheduleId = directScheduleId;
    }

    @JsonProperty("asset_id")
    public String getDirectAssetId() {
        return directAssetId;
    }

    public void setDirectAssetId(String directAssetId) {
        this.directAssetId = directAssetId;
    }

    @JsonProperty("sys_asset_id")
    public String getDirectSysAssetId() {
        return directSysAssetId;
    }

    public void setDirectSysAssetId(String directSysAssetId) {
        this.directSysAssetId = directSysAssetId;
    }
    // PostLoad callback to set transient fields
    @PostLoad
    private void populateTransientFields() {
        if (asset != null) {
            this.assetName = asset.getName();
        }
        if (assetType != null) {
            this.assetTypeName = assetType.getAssetTypeName();
            this.assetTypeCode = assetType.getAssetTypeCode();
        }
    }

    // Getters and Setters
    @JsonProperty("id")
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonIgnore // Hide from JSON
    public ScheduleInfo getSchedule() {
        return schedule;
    }

    public void setSchedule(ScheduleInfo schedule) {
        this.schedule = schedule;
    }

    @JsonIgnore // Hide from JSON
    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    @JsonIgnore // Hide from JSON
    public SysAssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(SysAssetType assetType) {
        this.assetType = assetType;
    }

    @JsonProperty("assetName")
    public String getAssetName() {
        return assetName;
    }

    @JsonProperty("assetTypeName")
    public String getAssetTypeName() {
        return assetTypeName;
    }

    @JsonProperty("assetTypeCode")
    public String getAssetTypeCode() {
        return assetTypeCode;
    }
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
