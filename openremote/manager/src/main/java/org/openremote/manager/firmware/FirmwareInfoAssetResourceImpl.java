package org.openremote.manager.firmware;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.FirmwareInfoAssetDTO;
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.firmware.FirmwareInfoAsset;
import org.openremote.model.firmware.FirmwareInfoAssetResource;

import java.util.List;

public class FirmwareInfoAssetResourceImpl extends ManagerWebResource implements FirmwareInfoAssetResource {
    protected FirmwareInfoAssetPersistenceService firmwareInfoAssetPersistenceService;
    public FirmwareInfoAssetResourceImpl(TimerService timerService, ManagerIdentityService identityService, FirmwareInfoAssetPersistenceService firmwareInfoAssetPersistenceService) {
        super(timerService, identityService);
        this.firmwareInfoAssetPersistenceService = firmwareInfoAssetPersistenceService;
    }

    @Override
    public FirmwareInfoAsset get(String id) {
        return null;
    }

    @Override
    public List<FirmwareInfoAsset> getAll(String realm, Long firmwareInfoId, SearchFilterDTO<FirmwareInfoAsset> searchFilterDTO) {
        return null;
    }

    @Override
    public List<FirmwareInfoAssetDTO> getFrwInfoAssetByFrwInfoDetailId(Long id, SearchFilterDTO<FirmwareInfoAssetDTO> filterDTO) {
        var viet=firmwareInfoAssetPersistenceService.getFrwInfoAssetByFrwInfoDetailId(id, filterDTO);
        return firmwareInfoAssetPersistenceService.getFrwInfoAssetByFrwInfoDetailId(id, filterDTO);
    }

    @Override
    public FirmwareInfoAsset create(FirmwareInfoAsset firmwareInfoAsset) {
        return null;
    }

    @Override
    public FirmwareInfoAsset update(FirmwareInfoAsset firmwareInfoAsset) {
        return null;
    }

    @Override
    public boolean delete(Long id) {
        return firmwareInfoAssetPersistenceService.delete(id);
    }

    @Override
    public Long countData(Long id) {
        return firmwareInfoAssetPersistenceService.getCountFrwInfoAssetByFrwInfoDetailId(id);
    }
}
