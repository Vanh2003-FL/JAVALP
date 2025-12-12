package org.openremote.manager.firmware;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.firmware.FirmwareInfoDetail;
import org.openremote.model.firmware.FirmwareInfoDetailResource;

import java.util.List;

public class FirmwareInfoDetailResourceImpl extends ManagerWebResource implements FirmwareInfoDetailResource {
    protected final FirmwareInfoDetailPersistenceService firmwareInfoDetailPersistenceService;
    public FirmwareInfoDetailResourceImpl(TimerService timerService, ManagerIdentityService identityService, FirmwareInfoDetailPersistenceService firmwareInfoDetailPersistenceService) {
        super(timerService, identityService);
        this.firmwareInfoDetailPersistenceService = firmwareInfoDetailPersistenceService;
    }

    @Override
    public FirmwareInfoDetail get(String id) {
        return null;
    }

    @Override
    public List<FirmwareInfoDetail> getAll(String realm, Long id, SearchFilterDTO<FirmwareInfoDetail> searchFilterDTO) {
        return null;
    }

    @Override
    public List<FirmwareInfoDetailDTO> getFrwInfoDetailByFrwInfoId(Long id, SearchFilterDTO<FirmwareInfoDetailDTO> filterDTO) {
        return firmwareInfoDetailPersistenceService.getFrwInfoDetailByFrwInfoId(id, filterDTO);
    }

    @Override
    public FirmwareInfoDetailDTO create(FirmwareInfoDetail firmwareInfoDetail) {
        return firmwareInfoDetailPersistenceService.create(firmwareInfoDetail);
    }

    @Override
    public FirmwareInfoDetail update(FirmwareInfoDetail firmwareInfoDetail) {
        return firmwareInfoDetailPersistenceService.update(firmwareInfoDetail);
    }

    @Override
    public boolean delete(Long id) {
        return firmwareInfoDetailPersistenceService.delete(id);
    }

    @Override
    public Long countData(Long id) {
        return firmwareInfoDetailPersistenceService.getCountFrwInfoDetailByFrwInfoId(id);
    }
}
