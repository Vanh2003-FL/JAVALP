package org.openremote.model.routeInfo;

public class RouteDetailInfo {
    private RouteInfo routeInfo;
    private LightCount lightCount;
    private CabinetCount cabinetCount;

    public RouteDetailInfo() {

    }

    public RouteDetailInfo(RouteInfo routeInfo, LightCount lightCount, CabinetCount cabinetCount) {
        this.routeInfo = routeInfo;
        this.lightCount = lightCount;
        this.cabinetCount = cabinetCount;
    }

    public RouteInfo getRouteInfo() {
        return routeInfo;
    }

    public void setRouteInfo(RouteInfo routeInfo) {
        this.routeInfo = routeInfo;
    }

    public LightCount getLightCount() {
        return lightCount;
    }

    public void setLightCount(LightCount lightCount) {
        this.lightCount = lightCount;
    }

    public CabinetCount getCabinetCount() {
        return cabinetCount;
    }

    public void setCabinetCount(CabinetCount cabinetCount) {
        this.cabinetCount = cabinetCount;
    }
}
