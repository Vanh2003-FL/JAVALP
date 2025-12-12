package org.openremote.model.scheduleinfo;

import java.util.ArrayList;
import java.util.List;

public class AssetTypeDTO {
    private Integer id;
    private String assetTypeName;
    private String assetTypeCode;
    private List<AssetDTO> assets = new ArrayList<>();
    public AssetTypeDTO() {}

    public AssetTypeDTO(Integer id, String assetTypeName, String assetTypeCode) {
        this.id = id;
        this.assetTypeName = assetTypeName;
        this.assetTypeCode = assetTypeCode;
    }


    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
    public List<AssetDTO> getAssets() {
        return assets;
    }

    public void setAssets(List<AssetDTO> assets) {
        this.assets = assets;
    }

}
