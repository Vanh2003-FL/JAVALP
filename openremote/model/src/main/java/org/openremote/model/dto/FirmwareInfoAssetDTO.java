package org.openremote.model.dto;

public class FirmwareInfoAssetDTO {
    private Long id;
    private String assetId;
    private String assetName;
    private String frwVersionOld;
    private String frwVersionNew;
    private String status;
    private String description;

    public FirmwareInfoAssetDTO() {
    }

    public FirmwareInfoAssetDTO(Long id, String assetId, String assetName, String frwVersionOld, String frwVersionNew, String status, String description) {
        this.id = id;
        this.assetId = assetId;
        this.assetName = assetName;
        this.frwVersionOld = frwVersionOld;
        this.frwVersionNew = frwVersionNew;
        this.status = status;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getFrwVersionOld() {
        return frwVersionOld;
    }

    public void setFrwVersionOld(String frwVersionOld) {
        this.frwVersionOld = frwVersionOld;
    }

    public String getFrwVersionNew() {
        return frwVersionNew;
    }

    public void setFrwVersionNew(String frwVersionNew) {
        this.frwVersionNew = frwVersionNew;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
