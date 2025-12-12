package org.openremote.manager.sys;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.sys.SysWarningRule;
import org.openremote.model.sys.SysWarningRuleResource;

import java.util.List;

public class SysWarningRuleResourceImpl extends ManagerWebResource implements SysWarningRuleResource {

    protected final SysWarningRulePersistenceService sysWarningRulePersistenceService;
    public SysWarningRuleResourceImpl(TimerService timerService, ManagerIdentityService identityService, SysWarningRulePersistenceService sysWarningRulePersistenceService) {
        super(timerService, identityService);
        this.sysWarningRulePersistenceService = sysWarningRulePersistenceService;
    }

    @Override
    public List<SysWarningRule> getAll(SearchFilterDTO<SysWarningRule> filterDTO) {
        return sysWarningRulePersistenceService.getSysWarningRules(filterDTO);
    }

    @Override
    public Long countData() {
        return sysWarningRulePersistenceService.getCountSysWarningRules();
    }
}
