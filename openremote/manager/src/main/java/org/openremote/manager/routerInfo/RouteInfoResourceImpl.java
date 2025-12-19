package org.openremote.manager.routerInfo;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.routeInfo.*;

import java.util.List;

public class RouteInfoResourceImpl extends ManagerWebResource implements RouteInfoResource {

    protected final PersistenceService persistenceService;

    protected final RouteInfoPersistenceService routeInfoPersistenceService;

    public RouteInfoResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, RouteInfoPersistenceService routeInfoPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.routeInfoPersistenceService = routeInfoPersistenceService;
    }

    @Override
    public List<RouteInfoDTO> getAll(SearchFilterDTO<RouteInfo> filterDTO) {
        return routeInfoPersistenceService.getAll(filterDTO);
    }

    @Override
    public Long countData(SearchFilterDTO<RouteInfo> filterDTO) {
        return routeInfoPersistenceService.count(filterDTO);
    }

    @Override
    public RouteDetailInfo getInfoDetail(RouteInfo routeInfo) {
        if (routeInfo.getId() == null || routeInfo.getRealm() == null) {
            return new RouteDetailInfo();
        }
        RouteDetailInfo routeDetailInfo = routeInfoPersistenceService.getInfoDetail(routeInfo);

        CabinetCount cabinetCount = new CabinetCount(routeInfoPersistenceService.getCabinetAssetsByRouteId(routeInfo.getId(), routeInfo.getRealm()));

        LightCount lightCount = routeInfoPersistenceService.getLight(routeInfo.getId(), routeInfo.getRealm());

        routeDetailInfo.setCabinetCount(cabinetCount);
        routeDetailInfo.setLightCount(lightCount);

        return routeDetailInfo;
    }

    @Override
    public RouteInfo updateInfoDetail(RouteInfo routeInfo) {
        return routeInfoPersistenceService.updateRouteInfo(routeInfo);
    }

    @Override
    public boolean remove(RouteInfo province) {
        return routeInfoPersistenceService.updateDeleteStatus(province.getId());
    }

    @Override
    public RouteInfo countAssetInRealm(String realm) {
        return routeInfoPersistenceService.getRouterAndCabinetCount(realm);
    }


}
