package org.openremote.model.hdi.hdiDTO.routeAsset;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;

public class RouterAssetCreate {

    private String id;
    private String assetId;
    private String type;
    private String name;
    private String status;
    private String activeDate;
    private String deactiveDate;
    private String updateDate;
    private String updateBy;

    public RouterAssetCreate(Object[] result,String type) {
        this.id = (String) result[0];
        this.assetId = (String) result[0];        this.name = (String) result[1];
        this.status = (String) result[2];
        this.activeDate = result[3] instanceof Instant
                ? ((Instant) result[3]).toString()
                : result[3] instanceof Timestamp
                ? ((Timestamp) result[3]).toInstant().toString()
                : (String) result[3];
        this.deactiveDate = result[4] instanceof Instant
                ? ((Instant) result[4]).toString()
                : result[4] instanceof Timestamp
                ? ((Timestamp) result[4]).toInstant().toString()
                : (String) result[4];
        this.updateDate = result[5] instanceof Instant
                ? ((Instant) result[5]).toString()
                : result[5] instanceof Timestamp
                ? ((Timestamp) result[5]).toInstant().toString()
                : (String) result[5];
        this.updateBy = (String) result[6];
        this.type = (String) result[7];
    }
    public RouterAssetCreate(Object[] result) {
        this.id = (String) result[0];
        this.assetId = (String) result[0];        this.name = (String) result[1];
        this.status = (String) result[2];
        this.activeDate = result[3] instanceof Instant
                ? ((Instant) result[3]).toString()
                : result[3] instanceof Timestamp
                ? ((Timestamp) result[3]).toInstant().toString()
                : (String) result[3];
        this.deactiveDate = result[4] instanceof Instant
                ? ((Instant) result[4]).toString()
                : result[4] instanceof Timestamp
                ? ((Timestamp) result[4]).toInstant().toString()
                : (String) result[4];
        this.updateDate = result[5] instanceof Instant
                ? ((Instant) result[5]).toString()
                : result[5] instanceof Timestamp
                ? ((Timestamp) result[5]).toInstant().toString()
                : (String) result[5];
        this.updateBy = (String) result[6];
    }

    public RouterAssetCreate(String id, String assetId, String type, String name, String status, String activeDate, String deactiveDate, String updateDate, String updateBy) {
        this.id = id;
        this.assetId = assetId;
        this.type = type;
        this.name = name;
        this.status = status;
        this.activeDate = activeDate;
        this.deactiveDate = deactiveDate;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public RouterAssetCreate(String id, String name, String type, String status, Timestamp activeDate, Timestamp deactiveDate, Timestamp updateDate, String updateBy) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.status = status;
        this.activeDate = String.valueOf(activeDate);
        this.deactiveDate = String.valueOf(deactiveDate);
        this.updateDate = String.valueOf(updateDate);
        this.updateBy = updateBy;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActiveDate() {
        return activeDate;
    }

    public void setActiveDate(String activeDate) {
        this.activeDate = activeDate;
    }

    public String getDeactiveDate() {
        return deactiveDate;
    }

    public void setDeactiveDate(String deactiveDate) {
        this.deactiveDate = deactiveDate;
    }

    public String getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }
}


