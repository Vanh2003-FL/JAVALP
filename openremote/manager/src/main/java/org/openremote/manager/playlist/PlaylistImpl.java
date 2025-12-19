package org.openremote.manager.playlist;

import jakarta.ws.rs.PathParam;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.playlist.Playlist;
import org.openremote.model.playlist.PlaylistResource;
import org.openremote.model.security.User;

import java.util.List;

public class PlaylistImpl extends ManagerWebResource implements PlaylistResource {

    protected final PersistenceService persistenceService;
    protected final PlaylistService playlistService;

    public PlaylistImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            PlaylistService playlistService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.playlistService = playlistService;
    }

    @Override
    public List<Playlist> getAllPlaylist(SearchFilterDTO<Playlist> filterDTO) {
        return playlistService.getPlaylist(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Playlist createPlaylist(Playlist data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return playlistService.create(data, user);
    }

    @Override
    public Playlist updatePlaylist(Playlist data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return playlistService.update(data, user);
    }

    @Override
    public boolean removePlaylist(Playlist data) {
        return playlistService.deletePlaylist(data.getId());
    }

    @Override
    public Playlist getById(@PathParam("id") String id) {
        return playlistService.getById(id);
    }
}
