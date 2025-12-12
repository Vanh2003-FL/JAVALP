package org.openremote.model.dto;

import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeMap;

import java.util.Date;
import java.util.Map;

public class AssetDto {

    private String id;
    private Long version;
    private Date createdOn;
    private String name;
    private Boolean accessPublicRead;
    private String parentId;
    private String realm;
    private String type;
    private String[] path;
    private AttributeMap attributes;

    private String assetCode;
    private String cabinetAssetCode;
    private Boolean isControlByCabinet;
    private String cabinetId;
    private Boolean active = true;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Date getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(Date createdOn) {
        this.createdOn = createdOn;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getAccessPublicRead() {
        return accessPublicRead;
    }

    public void setAccessPublicRead(Boolean accessPublicRead) {
        this.accessPublicRead = accessPublicRead;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String[] getPath() {
        return path;
    }

    public void setPath(String[] path) {
        this.path = path;
    }

    public AttributeMap getAttributes() {
        return attributes;
    }

    public void setAttributes(AttributeMap attributes) {
        this.attributes = attributes;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public String getCabinetAssetCode() {
        return cabinetAssetCode;
    }

    public void setCabinetAssetCode(String cabinetAssetCode) {
        this.cabinetAssetCode = cabinetAssetCode;
    }

    public Boolean isControlByCabinet() {
        return isControlByCabinet;
    }

    public void setControlByCabinet(Boolean controlByCabinet) {
        isControlByCabinet = controlByCabinet;
    }

    public String getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(String cabinetId) {
        this.cabinetId = cabinetId;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
