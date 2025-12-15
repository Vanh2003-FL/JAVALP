package org.openremote.manager.sys;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.AssetTypeDto;
import org.openremote.model.http.RequestParams;
import org.openremote.model.sys.SysAssetType;
import org.openremote.model.sys.SysAssetTypeResource;

import java.util.List;
import java.util.logging.Logger;

public class SysAssetTypeResourceImpl extends ManagerWebResource implements SysAssetTypeResource {

    private static final Logger LOG = Logger.getLogger(SysAssetTypeResourceImpl.class.getName());
    protected SysAssetTypePersistenceService sysAssetTypePersistenceService;

    public SysAssetTypeResourceImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            SysAssetTypePersistenceService sysAssetTypePersistenceService  // Thêm service vào constructor
    ) {
        super(timerService, identityService);
        this.sysAssetTypePersistenceService = sysAssetTypePersistenceService;  // Khởi tạo service
    }

    @Override
    public SysAssetType get(String id) {
        return null;
    }

    @Override
    public List<SysAssetType> getAll() {
        return List.of();
    }

    @Override
    public SysAssetType create(SysAssetType sysAssetType) {
        return null;
    }

    @Override
    public SysAssetType update(Long id, SysAssetType sysAssetType) {
        return null;
    }

    @Override
    public void delete(Long id) {

    }

    @Override
    public List<AssetTypeDto> getAllAssetType(RequestParams requestParams) {
        return sysAssetTypePersistenceService.getAllAssetTypes();
    }
}
