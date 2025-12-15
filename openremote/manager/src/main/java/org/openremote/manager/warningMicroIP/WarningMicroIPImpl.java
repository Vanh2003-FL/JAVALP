package org.openremote.manager.warningMicroIP;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;
import org.openremote.model.warningMicroIP.WarningMicroIP;
import org.openremote.model.warningMicroIP.WarningMicroIPResource;
import java.util.List;
public class WarningMicroIPImpl extends ManagerWebResource implements WarningMicroIPResource {
    protected final PersistenceService persistenceService;
    protected final WarningMicroIPService warningMicroIPService;


    public WarningMicroIPImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, WarningMicroIPService warningMicroIPService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.warningMicroIPService = warningMicroIPService;
    }

    @Override
    public boolean isSuperUser() {
        return super.isSuperUser();
    }


    @Override
    public List<WarningMicroIP> getAllWarningMicroIP(SearchFilterDTO<WarningMicroIP> filterDTO) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return warningMicroIPService.getAllWarningMicroIP(filterDTO == null ? new SearchFilterDTO<>() : filterDTO, user);
    }

    @Override
    public WarningMicroIP createWarningMicroIP(WarningMicroIP data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        data.setRealm_name(user.getRealm());
//        data.setCreate_by(user.getUsername());
        return warningMicroIPService.createWarningMicroIP(data);
    }

    @Override
    public WarningMicroIP updateWarningMicroIP(WarningMicroIP data) {
//        User user = identityService.getIdentityProvider().getUser(getUserId());
//        data.setCreateBy(user.getUsername());
        return warningMicroIPService.updateWarningMicroIP(data);
    }

    @Override
    public boolean removeWarningMicroIP(WarningMicroIP data) {
        return warningMicroIPService.deleteWarningMicroIP(data.getId());
    }
}
