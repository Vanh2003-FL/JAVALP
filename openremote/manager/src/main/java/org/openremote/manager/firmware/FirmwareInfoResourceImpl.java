package org.openremote.manager.firmware;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.firmware.FirmwareInfo;
import org.openremote.model.firmware.FirmwareInfoResource;

import java.util.List;

public class FirmwareInfoResourceImpl extends ManagerWebResource implements FirmwareInfoResource {
    protected final FirmwareInfoPersistenceService firmwareInfoPersistenceService;
    public FirmwareInfoResourceImpl(TimerService timerService, ManagerIdentityService identityService, FirmwareInfoPersistenceService firmwareInfoPersistenceService) {
        super(timerService, identityService);
        this.firmwareInfoPersistenceService = firmwareInfoPersistenceService;
    }

    @Override
    public FirmwareInfo get(String id) {
        return null;
    }

    @Override
    public List<FirmwareInfo> getAll(SearchFilterDTO<FirmwareInfo> searchFilterDTO) {
        return firmwareInfoPersistenceService.getData(searchFilterDTO);
    }

    @Override
    public FirmwareInfo create(FirmwareInfo firmwareInfo) {
        return firmwareInfoPersistenceService.create(firmwareInfo);
    }

    @Override
    public FirmwareInfo update(FirmwareInfo firmwareInfo) {
        return firmwareInfoPersistenceService.update(firmwareInfo);
    }

    @Override
    public boolean delete(Long id) {
        return firmwareInfoPersistenceService.updateDeleteStatus(id);
    }

    @Override
    public Long countData() {
        return firmwareInfoPersistenceService.count();
    }
}
