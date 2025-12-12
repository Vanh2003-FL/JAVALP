package org.openremote.manager.routeInfoV;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteAssetDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;
import org.openremote.model.routeInfoV.RouterInfoVResource;

public class RouteInfoVResourceImp extends ManagerWebResource implements RouterInfoVResource {
    private final RouteInfoVStorageService routeInfoVStorageService;

    public RouteInfoVResourceImp(
            TimerService timerService,
            RouteInfoVStorageService routeInfoVStorageService,
            ManagerIdentityService identityService) {
        super(timerService, identityService);
        this.routeInfoVStorageService = routeInfoVStorageService;
    }

    @Override
    public RouteAssetDTO getRouteAsset(RequestParams requestParams, String routeId) {
        return routeInfoVStorageService.getRouteAsset(routeId);
    }

    @Override
    public void create(RequestParams requestParams, RouteInfoCreateDTO routeInfoCreateDTO) {
        routeInfoVStorageService.create(routeInfoCreateDTO);
    }
}
