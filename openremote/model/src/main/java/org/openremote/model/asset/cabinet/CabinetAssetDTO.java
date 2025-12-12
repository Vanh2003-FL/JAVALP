package org.openremote.model.asset.cabinet;

import org.openremote.model.asset.impl.ElectricalCabinetAsset;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.routeInfo.RouteInfo;

import java.util.List;

public class CabinetAssetDTO {

    private ElectricalCabinetAsset cabinetAsset;

    private Asset_Info assetInfo;

    private RouteInfo routeInfo;

    private List<LightAssetDTO> lightAssetDTOList;

    public CabinetAssetDTO() {}

    public CabinetAssetDTO(ElectricalCabinetAsset cabinetAsset, Asset_Info assetInfo) {
        this.cabinetAsset = cabinetAsset;
        this.assetInfo = assetInfo;
    }

    public CabinetAssetDTO(ElectricalCabinetAsset cabinetAsset, Asset_Info assetInfo, RouteInfo routeInfo, List<LightAssetDTO> lightAssetDTOList) {
        this.cabinetAsset = cabinetAsset;
        this.assetInfo = assetInfo;
        this.routeInfo = routeInfo;
        this.lightAssetDTOList = lightAssetDTOList;
    }

    public ElectricalCabinetAsset getCabinetAsset() {
        return cabinetAsset;
    }

    public void setCabinetAsset(ElectricalCabinetAsset cabinetAsset) {
        this.cabinetAsset = cabinetAsset;
    }

    public Asset_Info getAssetInfo() {
        return assetInfo;
    }

    public void setAssetInfo(Asset_Info assetInfo) {
        this.assetInfo = assetInfo;
    }

    public RouteInfo getRouteInfo() { return routeInfo; }

    public void setRouteInfo(RouteInfo routeInfo) { this.routeInfo = routeInfo; }

    public List<LightAssetDTO> getLightAssetDTOList() { return lightAssetDTOList; }

    public void setLightAssetDTOList(List<LightAssetDTO> lightAssetDTOList) { this.lightAssetDTOList = lightAssetDTOList; }
}
