package org.openremote.manager.warning;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.dto.WarningEmailRouteDto;
import org.openremote.model.warning.WarningEmailRoute;
import org.openremote.model.warning.WarningEmailRouteResource;

import java.util.List;

public class WarningEmailRouteResourceImpl extends ManagerWebResource implements WarningEmailRouteResource {
    protected final WarningEmailRoutePersistenceService warningEmailRoutePersistenceService;

    public WarningEmailRouteResourceImpl(TimerService timerService, ManagerIdentityService identityService, WarningEmailRoutePersistenceService warningEmailRoutePersistenceService) {
        super(timerService, identityService);
        this.warningEmailRoutePersistenceService = warningEmailRoutePersistenceService;
    }

    @Override
    public WarningEmailRoute get(String id) {
        return null;
    }

    @Override
    public List<WarningEmailRoute> getAll() {
        return null;
    }

    @Override
    public List<WarningEmailRouteDto> getEmailRouteByEmailConfigId(Long id, SearchFilterDTO<WarningEmailRouteDto> searchFilter) {
        return warningEmailRoutePersistenceService.getEmailRouteByEmailConfigId(id, searchFilter);
    }

    @Override
    public WarningEmailRouteDto create(WarningEmailRoute warningEmailRoute) {
        return warningEmailRoutePersistenceService.createWarningRoute(warningEmailRoute);
    }

    @Override
    public WarningEmailRoute update(WarningEmailRoute warningEmailRoute) {
        return null;
    }

    @Override
    public boolean delete(Long id) {
        return warningEmailRoutePersistenceService.deleteWarningRoute(id);
    }

    @Override
    public Long countData(Long emailConfigId) {
        return warningEmailRoutePersistenceService.getCountEmailRouteByEmailConfigId(emailConfigId);
    }
}
