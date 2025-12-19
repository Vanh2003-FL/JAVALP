package org.openremote.manager.livestream;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.livestream.LiveStreamChannel;
import org.openremote.model.livestream.LiveStreamChannelResource;
import org.openremote.model.security.User;

import java.util.List;

public class LiveStreamChannelResourceImpl extends ManagerWebResource implements LiveStreamChannelResource {

    protected final PersistenceService persistenceService;
    protected final LiveStreamChannelPersistenceService liveStreamChannelPersistenceService;

    public LiveStreamChannelResourceImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            LiveStreamChannelPersistenceService liveStreamChannelPersistenceService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.liveStreamChannelPersistenceService = liveStreamChannelPersistenceService;
    }

    @Override
    public List<LiveStreamChannel> getLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> filterDTO) {
        return liveStreamChannelPersistenceService.getLiveStreamChannels(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public LiveStreamChannel getLiveStreamChannelById(LiveStreamChannel data) {
        return liveStreamChannelPersistenceService.getById(data.getId());
    }

    @Override
    public LiveStreamChannel createLiveStreamChannel(LiveStreamChannel data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return liveStreamChannelPersistenceService.create(data, user);
    }

    @Override
    public LiveStreamChannel updateLiveStreamChannel(LiveStreamChannel data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return liveStreamChannelPersistenceService.update(data, user);
    }

    @Override
    public Boolean deleteLiveStreamChannel(LiveStreamChannel data) {
        return liveStreamChannelPersistenceService.deleteLiveStreamChannel(data.getId());
    }

    @Override
    public Long countLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> filterDTO) {
        return liveStreamChannelPersistenceService.countLiveStreamChannels(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }
}
