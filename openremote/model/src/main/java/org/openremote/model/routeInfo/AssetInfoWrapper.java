package org.openremote.model.routeInfo;

import org.openremote.model.assetInfo.Asset_Info;

public class AssetInfoWrapper {

    private AssetV2 asset;

    private Asset_Info assetInfo;

    public AssetInfoWrapper() {}

    public AssetInfoWrapper(AssetV2 asset, Asset_Info assetInfo) {
        this.asset = asset;
        this.assetInfo = assetInfo;
    }

    public AssetV2 getAsset() {
        return asset;
    }

    public void setAsset(AssetV2 asset) {
        this.asset = asset;
    }

    public Asset_Info getAssetInfo() {
        return assetInfo;
    }

    public void setAssetInfo(Asset_Info assetInfo) {
        this.assetInfo = assetInfo;
    }
}
