package org.openremote.manager.sys;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.sys.SysAttributes;
import org.openremote.model.sys.SysAttributesResource;

import java.util.List;

public class SysAttributesResourceImpl extends ManagerWebResource implements SysAttributesResource {

    protected final SysAttributesPersistenceService sysAttributesPersistenceService;

    public SysAttributesResourceImpl(TimerService timerService, ManagerIdentityService identityService, SysAttributesPersistenceService sysAttributesPersistenceService) {
        super(timerService, identityService);
        this.sysAttributesPersistenceService = sysAttributesPersistenceService;
    }

    @Override
    public SysAttributes get(String id) {
        return null;
    }

    @Override
    public List<SysAttributes> getAll() {
        return List.of();
    }

    @Override
    public SysAttributes create(SysAttributes sysAttributes) {
        return null;
    }

    @Override
    public SysAttributes update(Long id, SysAttributes sysAttributes) {
        return null;
    }

    @Override
    public void delete(Long id) {
    }
}
