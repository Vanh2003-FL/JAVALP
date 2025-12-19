package org.openremote.manager.ward;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.ward.Ward;
import org.openremote.model.ward.WardResource;

import java.util.List;

public class WardResourceImpl extends ManagerWebResource implements WardResource {

    protected final PersistenceService persistenceService;

    protected final WardPersistenceService wardPersistenceService;

    public WardResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, WardPersistenceService wardPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.wardPersistenceService = wardPersistenceService;
    }

    @Override
    public List<Ward> getAll(SearchFilterDTO<Ward> filterDTO) {
        return wardPersistenceService.getAll(filterDTO);
    }

    @Override
    public Ward createProvince(Ward province) {
        return wardPersistenceService.create(province);
    }

    @Override
    public Ward update(Ward Ward) {
        return wardPersistenceService.update(Ward);
    }

    @Override
    public Long countData(SearchFilterDTO<Ward> filterDTO) {
        return wardPersistenceService.count(filterDTO.getData());
    }

    @Override
    public boolean remove(Ward Ward) {
        return wardPersistenceService.updateDeleteStatus(Ward.getId());
    }
}
