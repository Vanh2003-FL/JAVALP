package org.openremote.manager.warning;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.warning.WarningEmailConfig;
import org.openremote.model.warning.WarningEmailConfigResource;

import java.util.List;

public class WarningEmailConfigResourceImpl extends ManagerWebResource implements WarningEmailConfigResource {

    protected final WarningEmailConfigPersistenceService warningEmailConfigPersistenceService;
    public WarningEmailConfigResourceImpl(TimerService timerService, ManagerIdentityService identityService, WarningEmailConfigPersistenceService warningEmailConfigPersistenceService) {
        super(timerService, identityService);
        this.warningEmailConfigPersistenceService = warningEmailConfigPersistenceService;
    }

    @Override
    public WarningEmailConfig get(String id) {
        return null;
    }

    @Override
    public List<WarningEmailConfig> getAll(String realm, Long warningId, SearchFilterDTO<WarningEmailConfig> searchFilter) {
        return warningEmailConfigPersistenceService.getWarningEmailConfigList(realm, warningId, searchFilter);
    }

    @Override
    public WarningEmailConfig create(WarningEmailConfig warningEmailConfig) {
        return warningEmailConfigPersistenceService.create(warningEmailConfig);
    }

    @Override
    public WarningEmailConfig update(WarningEmailConfig warningEmailConfig) {
        return warningEmailConfigPersistenceService.update(warningEmailConfig);
    }

    @Override
    public boolean delete(Long id) {
        return warningEmailConfigPersistenceService.delete(id);
    }

    @Override
    public Long countData(String realm, Long warningId) {
        return warningEmailConfigPersistenceService.getCountWarningEmailConfigList(realm, warningId);
    }
}
