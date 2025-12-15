package org.openremote.manager.md;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Context;
import org.apache.camel.builder.RouteBuilder;
import org.geotools.util.logging.Logging;
import org.openremote.agent.protocol.http.HTTPProtocol;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.md.RouteGroup;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;


@Transactional
public class RouteGruopService extends RouteBuilder implements ContainerService {

    protected PersistenceService persistenceService;
    @PersistenceContext
    private EntityManager entityManager;
    @Context
    private HttpServletRequest request;

    @Override
    public void configure() throws Exception {

    }

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }


    public List<RouteGroup> getAllRouteGroups() {
        return entityManager.createQuery("SELECT r FROM RouteGroup r", RouteGroup.class).getResultList();
    }

    public Optional<RouteGroup> getRouteGroupById(Integer id) {
        RouteGroup routeGroup = entityManager.find(RouteGroup.class, id);
        return Optional.ofNullable(routeGroup);
    }


    public RouteGroup createRouteGroup(RouteGroup routeGroup) {
        String createBy = (String) request.getSession().getAttribute("admin");

        System.out.println("createBy: " + createBy);
        if (createBy == null) {
            createBy = "system";

        }

        routeGroup.setCreateBy(createBy);
        routeGroup.setCreateDate(new Date());

        entityManager.persist(routeGroup);
        entityManager.flush();
        return routeGroup;
    }
    public RouteGroup updateRouteGroup(Integer id, RouteGroup routeGroupDetails) {
        RouteGroup routeGroup = entityManager.find(RouteGroup.class, id);
        if (routeGroup == null) {
            throw new RuntimeException("Route Group not found");
        }

        String updateBy = (String) request.getSession().getAttribute("username");
        if (updateBy == null) {
            updateBy = "admin";
        }

        routeGroup.setRouteGrpCode(routeGroupDetails.getRouteGrpCode());
        routeGroup.setRouteGrpName(routeGroupDetails.getRouteGrpName());
        routeGroup.setActive(routeGroupDetails.getActive());
        routeGroup.setUpdateBy(updateBy);
        routeGroup.setUpdateDate(new Date());

        return entityManager.merge(routeGroup);
    }

    public void deleteRouteGroup(Integer id) {
        RouteGroup routeGroup = entityManager.find(RouteGroup.class, id);
        if (routeGroup != null) {
            entityManager.remove(routeGroup);
        } else {
            throw new RuntimeException("Route Group not found");
        }
    }


}
