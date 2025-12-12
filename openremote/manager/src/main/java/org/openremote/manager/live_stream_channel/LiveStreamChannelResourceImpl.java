package org.openremote.manager.live_stream_channel;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.live_stream_channel.LiveStreamChannel;
import org.openremote.model.live_stream_channel.LiveStreamChannelResources;
import org.openremote.model.security.User;

import java.util.List;

public class LiveStreamChannelResourceImpl extends ManagerWebResource implements LiveStreamChannelResources {

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
    public List<LiveStreamChannel> getLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO) {
        return liveStreamChannelPersistenceService.getLiveStreamChannel(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Long countLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO) {
        return liveStreamChannelPersistenceService.countLiveStreamChannel(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
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
    public boolean removeLiveStreamChannel(LiveStreamChannel data) {
        return liveStreamChannelPersistenceService.deleteLiveStreamChannel(data.getId());
    }

    @Override
    public LiveStreamChannel getLiveStreamChannelById(LiveStreamChannel data) {
        return liveStreamChannelPersistenceService.getById(data.getId());
    }

    @Override
    public List<LiveStreamChannel> getLiveStreamChannelByArea(LiveStreamChannel data) {
        return liveStreamChannelPersistenceService.getByAreaId(data.getAreaId());
    }

    @Override
    public List<LiveStreamChannel> getSharedLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> filterDTO) {
        return liveStreamChannelPersistenceService.getSharedChannels(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }
}
