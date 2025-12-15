package org.openremote.manager.district;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.district.District;
import org.openremote.model.district.DistrictResource;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;

public class DistrictResourceImpl extends ManagerWebResource implements DistrictResource {

    protected final PersistenceService persistenceService;

    protected final DistrictPersistenceService districtPersistenceService;

    public DistrictResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, DistrictPersistenceService districtPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.districtPersistenceService = districtPersistenceService;
    }


    @Override
    public District get(int id) {
        return null;
    }

    @Override
    public List<District> getDistrictsByProvince(SearchFilterDTO<District> filterDTO) {
        return districtPersistenceService.getDistrictsByProvince(filterDTO);
    }

    @Override
    public List<District> getData(SearchFilterDTO<District> filterDTO) {
        return districtPersistenceService.getData(filterDTO);
    }

    @Override
    public District createDistrict(District District) {
        return districtPersistenceService.create(District);
    }

    @Override
    public District update(District District) {
        return districtPersistenceService.update(District);
    }

    @Override
    public Long countData(SearchFilterDTO<District> filterDTO) {
        return districtPersistenceService.count(filterDTO.getData());
    }

    @Override
    public boolean remove(District province) {
        return districtPersistenceService.updateDeleteStatus(province.getId());
    }
}
