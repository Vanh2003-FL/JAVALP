package org.openremote.model.dto;

import org.openremote.model.asset.Asset;

import java.util.Date;

public class LightAssetDTO {
    private String id;
    private String assetCode;
    private String assetName;
    private String lampTypeCode; // ma loai den
    private String lampTypeName; // ten loai den
    private String poleName; // ten cot
    private Integer luminousFlux; // quang thong
    private Integer powerConsumption; // cong suat
    private Double brightness; // do sang
    private String poleType; // loai cot
    private int lightingTime; // thoi gian chieu sang cua nsx
    private String status;
    private Integer lampTypeId;
    private Double longitude;
    private Double latitude;
    private Asset<?> asset;
    private String assetModel;

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getFirmwareVersion() {
        return firmwareVersion;
    }

    public void setFirmwareVersion(String firmwareVersion) {
        this.firmwareVersion = firmwareVersion;
    }

    private String firmwareVersion;

    public LightAssetDTO() {
    }

    public LightAssetDTO(String id, String assetName,String assetCode , String lampTypeCode, String lampTypeName, String poleName,
                         Integer luminousFlux, Integer powerConsumption, Double brightness,
                         String poleType, int lightingTime, Date timestamp,String firmwareVersion, Double longitude,
                         Double latitude) {
        this.id = id;
        this.assetName = assetName;
        this.assetCode = assetCode;
        this.lampTypeCode = lampTypeCode;
        this.lampTypeName = lampTypeName;
        this.poleName = poleName;
        this.luminousFlux = luminousFlux;
        this.powerConsumption = powerConsumption;
        this.brightness = brightness;
        this.poleType = poleType;
        this.lightingTime = lightingTime;
        this.firmwareVersion = firmwareVersion;
        this.longitude = longitude;
        this.latitude = latitude;
    }

    public LightAssetDTO(String id,Integer lampTypeId, String assetCode, String assetName, String lampTypeName, String poleName, Integer powerConsumption, Integer luminousFlux,int lightingTime, String status) {
        this.id = id;
        this.lampTypeId = lampTypeId;
        this.assetCode = assetCode;
        this.assetName = assetName;
        this.lampTypeName = lampTypeName;
        this.poleName = poleName;
        this.luminousFlux = luminousFlux;
        this.powerConsumption = powerConsumption;
        this.lightingTime = lightingTime;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getLampTypeCode() {
        return lampTypeCode;
    }

    public void setLampTypeCode(String lampTypeCode) {
        this.lampTypeCode = lampTypeCode;
    }

    public String getLampTypeName() {
        return lampTypeName;
    }

    public void setLampTypeName(String lampTypeName) {
        this.lampTypeName = lampTypeName;
    }

    public String getPoleName() {
        return poleName;
    }

    public void setPoleName(String poleName) {
        this.poleName = poleName;
    }

    public Integer getLuminousFlux() {
        return luminousFlux;
    }

    public void setLuminousFlux(Integer luminousFlux) {
        this.luminousFlux = luminousFlux;
    }

    public Integer getPowerConsumption() {
        return powerConsumption;
    }

    public void setPowerConsumption(Integer powerConsumption) {
        this.powerConsumption = powerConsumption;
    }

    public Double getBrightness() {
        return brightness;
    }

    public void setBrightness(Double brightness) {
        this.brightness = brightness;
    }

    public String getPoleType() {
        return poleType;
    }

    public void setPoleType(String poleType) {
        this.poleType = poleType;
    }

    public int getLightingTime() {
        return lightingTime;
    }

    public void setLightingTime(int lightingTime) {
        this.lightingTime = lightingTime;
    }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public Integer getLampTypeId() { return lampTypeId; }

    public void setLampTypeId(Integer lampTypeId) {
        this.lampTypeId = lampTypeId;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public Asset<?> getAsset() {
        return asset;
    }

    public void setAsset(Asset<?> asset) {
        this.asset = asset;
    }

    public String getAssetModel() {
        return assetModel;
    }

    public void setAssetModel(String assetModel) {
        this.assetModel = assetModel;
    }
}
