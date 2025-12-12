package org.openremote.manager.lampType;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.lampType.LampType;
import org.openremote.model.lampType.LampTypeResource;
import org.openremote.model.province.Province;

import java.util.List;

public class LampTypeResourceImpl extends ManagerWebResource implements LampTypeResource{

    protected final PersistenceService persistenceService;

    protected final LampTypePersistenceService lampTypePersistenceService;

    public LampTypeResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, LampTypePersistenceService lampTypePersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.lampTypePersistenceService = lampTypePersistenceService;
    }

    @Override
    public List<LampType> getAll(SearchFilterDTO<LampType> filterDTO) {
        System.out.println(">> LampType API CALLED");
        return lampTypePersistenceService.getAll(filterDTO);
    }

    @Override
    public LampType getById(int id) {
        return lampTypePersistenceService.getLampTypeById(id);
    }

    @Override
    public LampType createLampType(LampType lampType) {
        return lampTypePersistenceService.createLampType(lampType);
    }

    @Override
    public LampType updateLampType(LampType lampType) {
        return lampTypePersistenceService.updateLampType(lampType);
    }

    @Override
    public boolean deleteLampType(LampType lampType) {
        return lampTypePersistenceService.deleteLampType(lampType.getId());
    }

    @Override
    public Long countData(SearchFilterDTO<LampType> filterDTO) {
        return lampTypePersistenceService.count(filterDTO.getData());
    }
}
