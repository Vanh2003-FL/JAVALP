package org.openremote.model.scheduleinfo;

public class ScheduleAssetResponseDTO {
    private String id;
    private String assetName;
    private String assetTypeName;
    private String assetTypeCode;
    public ScheduleAssetResponseDTO(String id, String assetName, String assetTypeName, String assetTypeCode) {
        this.id = id;
        this.assetName = assetName;
        this.assetTypeName = assetTypeName;
        this.assetTypeCode = assetTypeCode;
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

    public String getAssetTypeName() {
        return assetTypeName;
    }

    public void setAssetTypeName(String assetTypeName) {
        this.assetTypeName = assetTypeName;
    }

    public String getAssetTypeCode() {
        return assetTypeCode;
    }

    public void setAssetTypeCode(String assetTypeCode) {
        this.assetTypeCode = assetTypeCode;
    }
}
