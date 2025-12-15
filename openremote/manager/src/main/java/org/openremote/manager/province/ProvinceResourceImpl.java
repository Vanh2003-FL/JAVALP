package org.openremote.manager.province;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.province.Province;
import org.openremote.model.province.ProvinceResource;

import java.util.List;

public class ProvinceResourceImpl extends ManagerWebResource implements ProvinceResource {

    protected final PersistenceService persistenceService;

    protected final ProvincePersistenceService provincePersistenceService;

    public ProvinceResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, ProvincePersistenceService provincePersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.provincePersistenceService = provincePersistenceService;
    }

    @Override
    public List<Province> getAll(SearchFilterDTO<Province> filterDTO) {
        return provincePersistenceService.getAll(filterDTO);
    }

    @Override
    public Province createProvince(Province province) {
        return provincePersistenceService.create(province);
    }

    @Override
    public Province update(Province province) {
        return provincePersistenceService.update(province);
    }

    @Override
    public Long countData(SearchFilterDTO<Province> filterDTO) {
        return provincePersistenceService.count(filterDTO.getData());
    }

    @Override
    public boolean remove(Province province) {
        return provincePersistenceService.updateDeleteStatus(province.getId());
    }
}
