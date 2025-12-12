package org.openremote.model.scheduleinfo;

public class ScheduleAssetDTO {

    private String id;
    private String name;
    private String assetTypeCode;
    private String assetTypeName;

    public ScheduleAssetDTO() {}

    public ScheduleAssetDTO(String id, String name, String assetTypeCode, String assetTypeName) {
        this.id = id;
        this.name = name;
        this.assetTypeCode = assetTypeCode;
        this.assetTypeName = assetTypeName;
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

    public String getAssetTypeCode() {
        return assetTypeCode;
    }

    public void setAssetTypeCode(String assetTypeCode) {
        this.assetTypeCode = assetTypeCode;
    }

    public String getAssetTypeName() {
        return assetTypeName;
    }

    public void setAssetTypeName(String assetTypeName) {
        this.assetTypeName = assetTypeName;
    }
}
