package org.openremote.manager.asset.cabinet;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.asset.cabinet.CabinetAssetDTO;
import org.openremote.model.asset.cabinet.CabinetResource;
import org.openremote.model.asset.impl.ElectricalCabinetAsset;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.lampType.LampType;

import java.util.List;

public class CabinetAssetResourceImpl extends ManagerWebResource implements CabinetResource {

    protected final PersistenceService persistenceService;

    protected final CabinetAssetPersistenceService cabinetAssetPersistenceService;

    public CabinetAssetResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, CabinetAssetPersistenceService cabinetAssetPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.cabinetAssetPersistenceService = cabinetAssetPersistenceService;
    }

    @Override
    public List<CabinetAssetDTO> getAll(SearchFilterDTO<CabinetAssetDTO> filterDTO) {
        return cabinetAssetPersistenceService.getAll(filterDTO, isActiveAndAccessible(filterDTO.getData()));
    }

    @Override
    public Long countData(SearchFilterDTO<CabinetAssetDTO> filterDTO) {
        return cabinetAssetPersistenceService.count(filterDTO, isActiveAndAccessible(filterDTO.getData()));
    }

    @Override
    public boolean remove(ElectricalCabinetAsset CabinetAsset) {
        return cabinetAssetPersistenceService.updateDeleteStatus(CabinetAsset.getId());
    }

    @Override
    public List<LightAssetDTO> getLightsBelongToCabinet(LampType lampType, String realm, String assetId) {
        return cabinetAssetPersistenceService.getLightsBelongToCabinet(assetId, lampType.getId(), realm);
    }

    @Override
    public CabinetAssetDTO createCabinetAssetExtend(CabinetAssetDTO assetDTO) {
        return cabinetAssetPersistenceService.createCabinetAssetExtend(assetDTO);
    }

    private boolean isActiveAndAccessible(CabinetAssetDTO assetDTO) {
        if (validationUtils.isValid(assetDTO)) {
            if (validationUtils.isValid(assetDTO.getCabinetAsset())) {
                return isRealmActiveAndAccessible(assetDTO.getCabinetAsset().getRealm());
            }
        }
        return false;
    }
}
