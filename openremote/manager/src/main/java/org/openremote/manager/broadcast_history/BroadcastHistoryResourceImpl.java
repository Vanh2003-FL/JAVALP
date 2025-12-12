package org.openremote.manager.broadcast_history;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.broadcast_history.BroadcastHistory;
import org.openremote.model.broadcast_history.BroadcastHistoryResources;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;

public class BroadcastHistoryResourceImpl extends ManagerWebResource implements BroadcastHistoryResources {

    protected final PersistenceService persistenceService;
    protected final BroadcastHistoryPersistenceService broadcastHistoryPersistenceService;

    public BroadcastHistoryResourceImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            BroadcastHistoryPersistenceService broadcastHistoryPersistenceService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.broadcastHistoryPersistenceService = broadcastHistoryPersistenceService;
    }

    @Override
    public List<BroadcastHistory> getBroadcastHistory(SearchFilterDTO<BroadcastHistory> filterDTO) {
        return broadcastHistoryPersistenceService.getBroadcastHistory(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Long countBroadcastHistory(SearchFilterDTO<BroadcastHistory> filterDTO) {
        return broadcastHistoryPersistenceService.countBroadcastHistory(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public BroadcastHistory createBroadcastHistory(BroadcastHistory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return broadcastHistoryPersistenceService.create(data, user);
    }

    @Override
    public BroadcastHistory updateBroadcastHistory(BroadcastHistory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return broadcastHistoryPersistenceService.update(data, user);
    }

    @Override
    public boolean removeBroadcastHistory(BroadcastHistory data) {
        return broadcastHistoryPersistenceService.deleteBroadcastHistory(data.getId());
    }

    @Override
    public BroadcastHistory getBroadcastHistoryById(BroadcastHistory data) {
        return broadcastHistoryPersistenceService.getById(data.getId());
    }
}
