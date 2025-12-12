package org.openremote.model.routeInfo;

import java.util.List;

public class LightCount {
    private Integer total;

    private Integer onLight;

    private Integer offLight;

    private Integer disconnectLight;

    private List<AssetInfoWrapper> offLightList;

    private List<AssetInfoWrapper> onLightList;

    private List<AssetInfoWrapper> disconnectLightList;

    public LightCount() {
    }

    public LightCount(Integer total, Integer onLight, Integer offLight) {
        this.total = total;
        this.onLight = onLight;
        this.offLight = offLight;
    }

    public LightCount(Integer total, Integer onLight, Integer offLight, Integer disconnectLight, List<AssetInfoWrapper> offLightList, List<AssetInfoWrapper> onLightList, List<AssetInfoWrapper> disconnectLightList) {
        this.total = total;
        this.onLight = onLight;
        this.offLight = offLight;
        this.disconnectLight = disconnectLight;
        this.offLightList = offLightList;
        this.onLightList = onLightList;
        this.disconnectLightList = disconnectLightList;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public Integer getOnLight() {
        return onLight;
    }

    public void setOnLight(Integer onLight) {
        this.onLight = onLight;
    }

    public Integer getOffLight() {
        return offLight;
    }

    public void setOffLight(Integer offLight) {
        this.offLight = offLight;
    }

    public Integer getDisconnectLight() { return disconnectLight; }

    public void setDisconnectLight(Integer disconnectLight) { this.disconnectLight = disconnectLight; }

    public List<AssetInfoWrapper> getOffLightList() { return offLightList; }

    public void setOffLightList(List<AssetInfoWrapper> offLightList) { this.offLightList = offLightList; }

    public List<AssetInfoWrapper> getOnLightList() { return onLightList; }

    public void setOnLightList(List<AssetInfoWrapper> onLightList) {
        this.onLightList = onLightList;
    }

    public List<AssetInfoWrapper> getDisconnectLightList() { return disconnectLightList; }

    public void setDisconnectLightList(List<AssetInfoWrapper> disconnectLightList) { this.disconnectLightList = disconnectLightList; }
}
