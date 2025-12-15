package org.openremote.manager.md;

import jakarta.ws.rs.*;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.asset.md.RouteGroup;
import org.openremote.model.asset.md.RouteGroupResource;
import org.openremote.model.http.RequestParams;

import java.util.List;


public class RouteGroupResourceImpl extends ManagerWebResource implements RouteGroupResource {

    private final RouteGruopService routeGruopService;

    public RouteGroupResourceImpl(TimerService timerService, ManagerIdentityService identityService, RouteGruopService routeGruopService) {
        super(timerService, identityService);
        this.routeGruopService = routeGruopService;
    }


    @Override

    public List<RouteGroup> getAll(RequestParams requestParams, Integer id) {
        return routeGruopService.getAllRouteGroups();
    }

//    @Override
//    public RouteGroup get(RequestParams requestParams,  Integer id) {
//        return routeGruopService.getRouteGroupById(id)
//                .orElseThrow(() -> new RuntimeException("Route Group not found"));
//    }

    @Override
    public void create(RouteGroup routeGroup) {
        routeGruopService.createRouteGroup(routeGroup);
    }

    @Override
    public RouteGroup update(@PathParam("id") Integer id, RouteGroup routeGroupDetails) {
        return routeGruopService.updateRouteGroup(id, routeGroupDetails);
    }

    @Override
    public void delete(@PathParam("id") Integer id) {
        routeGruopService.deleteRouteGroup(id);
    }
}
