package org.openremote.manager.channel;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.channel.Channel;
import org.openremote.model.channel.ChannelResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;

public class ChannelImpl extends ManagerWebResource implements ChannelResource {
    protected final PersistenceService persistenceService;
    protected final ChannelService channelService;

    public ChannelImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, ChannelService channelService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.channelService = channelService;
    }

    @Override
    public boolean isSuperUser() {
        return super.isSuperUser();
    }

    @Override
    public List<Channel> getAllWarningMicroIP(SearchFilterDTO<Channel> filterDTO) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return channelService.getAllChannel(filterDTO == null ? new SearchFilterDTO<>() : filterDTO, user);
    }

    @Override
    public Channel createChannel(Channel data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        data.setRealm_name(user.getRealm());
        data.setCreated_by(user.getUsername());
        return channelService.createChannel(data);
    }

    @Override
    public Channel updateChannel(Channel data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        data.setUpdated_by(user.getUsername());

        return channelService.updateChannel(data);
    }

    @Override
    public boolean removeChannel(Channel data) {
        return channelService.deleteChannel(data.getId());
    }
}
