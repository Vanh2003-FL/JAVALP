package org.openremote.manager.sys;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.sys.SysAssetTypeAttr;
import org.openremote.model.sys.SysAssetTypeAttrResource;

import java.util.List;

public class SysAssetTypeAttrResourceImpl extends ManagerWebResource implements SysAssetTypeAttrResource {
    public SysAssetTypeAttrResourceImpl(TimerService timerService, ManagerIdentityService identityService) {
        super(timerService, identityService);
    }

    @Override
    public SysAssetTypeAttr get(String id) {
        return null;
    }

    @Override
    public List<SysAssetTypeAttr> getAll() {
        return List.of();
    }

    @Override
    public SysAssetTypeAttr create(SysAssetTypeAttr sysAssetTypeAttr) {
        return null;
    }

    @Override
    public SysAssetTypeAttr update(Long id, SysAssetTypeAttr sysAssetTypeAttr) {
        return null;
    }

    @Override
    public void delete(Long id) {

    }
}
