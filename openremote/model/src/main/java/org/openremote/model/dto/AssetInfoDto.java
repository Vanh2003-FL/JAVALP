package org.openremote.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openremote.model.asset.Asset;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.cabinetGroup.CabinetGroup;
import org.openremote.model.datapoint.AssetDatapoint;

import java.util.Date;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssetInfoDto {

    private Asset<?> asset;
    private Asset_Info assetInfo;
    private CabinetGroup cabinetGroup;
    private String cabinetId;
    private List<AssetDatapoint> assetDataPoints;
    private Date lastTimeActive;
    public AssetInfoDto() {
    }

    public AssetInfoDto(Asset<?> asset, Asset_Info assetInfo) {
        this.asset = asset;
        this.assetInfo = assetInfo;
    }

    public AssetInfoDto(Asset<?> asset, Asset_Info assetInfo, CabinetGroup cabinetGroup, String cabinetId) {
        this.asset = asset;
        this.assetInfo = assetInfo;
        this.cabinetGroup = cabinetGroup;
        this.cabinetId = cabinetId;
    }

    public AssetInfoDto(Asset<?> asset, Asset_Info assetInfo, List<AssetDatapoint> assetDataPoints, Date lastTimeActive) {
        this.asset = asset;
        this.assetInfo = assetInfo;
        this.assetDataPoints = assetDataPoints;
        this.lastTimeActive = lastTimeActive;
    }

    public AssetInfoDto(Asset<?> asset, Asset_Info assetInfo, CabinetGroup cabinetGroup, String cabinetId, List<AssetDatapoint> assetDataPoints, Date lastTimeActive) {
        this.asset = asset;
        this.assetInfo = assetInfo;
        this.cabinetGroup = cabinetGroup;
        this.cabinetId = cabinetId;
        this.assetDataPoints = assetDataPoints;
        this.lastTimeActive = lastTimeActive;
    }

    public Asset<?> getAsset() {
        return asset;
    }

    public void setAsset(Asset<?> asset) {
        this.asset = asset;
    }

    public Asset_Info getInfoDTO() {
        return assetInfo;
    }

    public void setInfoDTO(Asset_Info assetInfo) {
        this.assetInfo = assetInfo;
    }

    public Asset_Info getAssetInfo() {
        return assetInfo;
    }

    public void setAssetInfo(Asset_Info assetInfo) {
        this.assetInfo = assetInfo;
    }

    public CabinetGroup getCabinetGroup() {
        return cabinetGroup;
    }

    public void setCabinetGroup(CabinetGroup cabinetGroup) {
        this.cabinetGroup = cabinetGroup;
    }

    public String getCabinetId() { return cabinetId; }

    public void setCabinetId(String cabinetId) { this.cabinetId = cabinetId; }

    public List<AssetDatapoint> getAssetDataPoints() {
        return assetDataPoints;
    }

    public void setAssetDataPoints(List<AssetDatapoint> assetDataPoints) {
        this.assetDataPoints = assetDataPoints;
    }

    public Date getLastTimeActive() {
        return lastTimeActive;
    }

    public void setLastTimeActive(Date lastTimeActive) {
        this.lastTimeActive = lastTimeActive;
    }
}
