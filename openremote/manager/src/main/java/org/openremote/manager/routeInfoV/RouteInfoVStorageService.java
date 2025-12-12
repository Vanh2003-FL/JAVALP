package org.openremote.manager.routeInfoV;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteAssetDTO;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;

import java.util.logging.Logger;

public class RouteInfoVStorageService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(RouteInfoVStorageService.class.getName());
    protected TimerService timerService;
    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;
    protected AssetStorageService assetStorageService;

    @Override
    public void configure() throws Exception {

    }
    @Override
    public void init(Container container) throws Exception {
        timerService = container.getService(TimerService.class);
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);
        container.getService(ManagerWebService.class).addApiSingleton(
            new RouteInfoVResourceImp(timerService,this, identityService)
        );

    }
    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {
    }

    public void create(RouteInfoCreateDTO routeInfoCreateDTO) {

    }


    public RouteAssetDTO getRouteAsset(String routeId) {
        return (RouteAssetDTO) persistenceService.doReturningTransaction(
                entityManager -> entityManager
                        .createNativeQuery("SELECT id, route_id, asset_id, sys_asset_type_id, active_date, deactive_date, deleted, description, create_date, create_by, update_date, update_by FROM route_assets WHERE route_id=:routerId",RouteAssetDTO.class)
                        .setParameter("routerId", routeId)
                        .getSingleResult()
        );
    }
}
