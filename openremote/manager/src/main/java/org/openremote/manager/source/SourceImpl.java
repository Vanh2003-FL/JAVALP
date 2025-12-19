package org.openremote.manager.source;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;
import org.openremote.model.source.Source;
import org.openremote.model.source.SourceResource;
import org.openremote.model.warningMicroIP.WarningMicroIP;

import java.util.List;

public class SourceImpl extends ManagerWebResource implements SourceResource {
    protected final PersistenceService persistenceService;
    protected final SourceService sourceService;

    public SourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, SourceService sourceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.sourceService = sourceService;
    }

    @Override
    public boolean isSuperUser() {
        return super.isSuperUser();
    }


    @Override
    public List<Source> getAllSource(SearchFilterDTO<WarningMicroIP> filterDTO) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return sourceService.getAllSource(filterDTO == null ? new SearchFilterDTO<>() : filterDTO, user);
    }

    @Override
    public Source createSource(Source data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        data.setRealmName(user.getRealm());
        data.setCreatedBy(user.getUsername());
        return sourceService.createSource(data);
    }

    @Override
    public Source updateSource(Source data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        data.setUpdatedBy(user.getUsername());
        return sourceService.updateSource(data);
    }

    @Override
    public boolean removeSource(Source data) {
        return sourceService.deleteSource(data.getId());
    }
}
