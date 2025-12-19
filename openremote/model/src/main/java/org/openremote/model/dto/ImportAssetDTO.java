package org.openremote.model.dto;

public class ImportAssetDTO {
    private String name; // tên thiết bị
    private String lampType; // tên loại đèn
    private String powerConsumption; // công suất đèn (ví dụ: "18W")
    private String luminousFlux; // quang thông (ví dụ: "1200lm")
    private Integer lifeHours; // số giờ chiếu sáng
    private Integer lampPostId; // ID cột đèn (nếu có)
    private String assetCode; // mã thiết bị (tùy sinh hay đọc từ Excel)
    private String description;
    private String createdBy;
    private Double longitude;
    private Double latitude;

    private String firmwareVersion;

    private String assetModel;

    public ImportAssetDTO(){

    }

    public ImportAssetDTO(String name, String lampType, String powerConsumption, String luminousFlux,
                          Integer lifeHours, Integer lampPostId, String assetCode, String description,
                          String createdBy,double longitude,double latitude,String firmwareVersion) {
        this.name = name;
        this.lampType = lampType;
        this.powerConsumption = powerConsumption;
        this.luminousFlux = luminousFlux;
        this.lifeHours = lifeHours;
        this.lampPostId = lampPostId;
        this.assetCode = assetCode;
        this.description = description;
        this.createdBy = createdBy;
        this.longitude = longitude;
        this.latitude = latitude;
        this.firmwareVersion = firmwareVersion;
    }

    public ImportAssetDTO(String name, String lampType, String powerConsumption, String luminousFlux, Integer lifeHours, Integer lampPostId, String assetCode, String description, String createdBy, String firmwareVersion) {
        this.name = name;
        this.lampType = lampType;
        this.powerConsumption = powerConsumption;
        this.luminousFlux = luminousFlux;
        this.lifeHours = lifeHours;
        this.lampPostId = lampPostId;
        this.assetCode = assetCode;
        this.description = description;
        this.createdBy = createdBy;
        this.firmwareVersion = firmwareVersion;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLampType() {
        return lampType;
    }

    public void setLampType(String lampType) {
        this.lampType = lampType;
    }

    public String getPowerConsumption() {
        return powerConsumption;
    }

    public void setPowerConsumption(String powerConsumption) {
        this.powerConsumption = powerConsumption;
    }

    public String getLuminousFlux() {
        return luminousFlux;
    }

    public void setLuminousFlux(String luminousFlux) {
        this.luminousFlux = luminousFlux;
    }

    public Integer getLifeHours() {
        return lifeHours;
    }

    public void setLifeHours(Integer lifeHours) {
        this.lifeHours = lifeHours;
    }

    public Integer getLampPostId() {
        return lampPostId;
    }

    public void setLampPostId(Integer lampPostId) {
        this.lampPostId = lampPostId;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
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

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public String getFirmwareVersion() {
        return firmwareVersion;
    }

    public void setFirmwareVersion(String firmwareVersion) {
        this.firmwareVersion = firmwareVersion;
    }

    public String getAssetModel() { return assetModel; }

    public void setAssetModel(String assetModel) { this.assetModel = assetModel; }
}
