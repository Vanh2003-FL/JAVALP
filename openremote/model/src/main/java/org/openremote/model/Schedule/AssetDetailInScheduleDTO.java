package org.openremote.model.Schedule;

public class AssetDetailInScheduleDTO {
    private String assetId;
    private String assetName; // Để hiển thị cột "Thiết bị"
    private String areaName;  // Để hiển thị cột "Khu vực"

    public AssetDetailInScheduleDTO() {}
    public AssetDetailInScheduleDTO(String assetId, String assetName, String areaName) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.areaName = areaName;
    }

    // Getters & Setters
    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
}
