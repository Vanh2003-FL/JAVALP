package org.openremote.model.dto;

import java.util.List;

public class AssetInfoDtoWrapper {

    private Long count;

    private List<AssetInfoDto> assetInfoDto;

    public AssetInfoDtoWrapper() {}

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public List<AssetInfoDto> getAssetInfoDto() {
        return assetInfoDto;
    }

    public void setAssetInfoDto(List<AssetInfoDto> assetInfoDto) {
        this.assetInfoDto = assetInfoDto;
    }
}
