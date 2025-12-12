package org.openremote.model.routeInfo;

import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;

import java.util.List;

public class RouteInfoDTO {
    private RouteInfo routeInfo;

    private List<RouterAssetCreate> routerAssetCreateList;

    public RouteInfoDTO() {}

    public RouteInfoDTO(RouteInfo routeInfo, List<RouterAssetCreate> routerAssetCreateList) {
        this.routeInfo = routeInfo;
        this.routerAssetCreateList = routerAssetCreateList;
    }

    public RouteInfo getRouteInfo() { return routeInfo; }

    public List<RouterAssetCreate> getRouterAssetCreateList() { return routerAssetCreateList; }

    public void setRouteInfo(RouteInfo routeInfo) { this.routeInfo = routeInfo; }

    public void setRouterAssetCreateList(List<RouterAssetCreate> routerAssetCreateList) {
        this.routerAssetCreateList = routerAssetCreateList;
    }
}
