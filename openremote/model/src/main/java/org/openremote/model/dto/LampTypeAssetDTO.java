package org.openremote.model.dto;

import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.lampType.LampType;

public class LampTypeAssetDTO {
    private LampType lampType;

    private Asset_Info assetInfo;

    public LampTypeAssetDTO() {}

    public LampTypeAssetDTO(LampType lampType, Asset_Info assetInfo) {
        this.lampType = lampType;
        this.assetInfo = assetInfo;
    }

    public LampType getLampType() {
        return lampType;
    }

    public void setLampType(LampType lampType) {
        this.lampType = lampType;
    }

    public Asset_Info getAssetInfo() {
        return assetInfo;
    }

    public void setAssetInfo(Asset_Info assetInfo) {
        this.assetInfo = assetInfo;
    }
}
