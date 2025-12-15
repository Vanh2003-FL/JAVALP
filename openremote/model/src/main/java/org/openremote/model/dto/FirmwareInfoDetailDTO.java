package org.openremote.model.dto;

public class FirmwareInfoDetailDTO {
    private Long id;
    private String assetModel;
    private String description;

    public FirmwareInfoDetailDTO() {
    }

    public FirmwareInfoDetailDTO(Long id, String assetModel, String description) {
        this.id = id;
        this.assetModel = assetModel;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssetModel() {
        return assetModel;
    }

    public void setAssetModel(String assetModel) {
        this.assetModel = assetModel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
