package org.openremote.manager.folder;

import jakarta.ws.rs.PathParam;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.folder.Folder;
import org.openremote.model.folder.FolderResource;
import org.openremote.model.security.User;

import java.util.List;

public class FolderImpl extends ManagerWebResource implements FolderResource {

    protected final PersistenceService persistenceService;
    protected final FolderService folderService;

    public FolderImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            FolderService folderService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.folderService = folderService;
    }

    @Override
    public List<Folder> getAllFolder(SearchFilterDTO<Folder> filterDTO) {
        return folderService.getFolder(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Folder createFolder(Folder data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return folderService.create(data, user);
    }

    @Override
    public Folder updateFolder(Folder data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return folderService.update(data, user);
    }

    @Override
    public boolean removeFolder(Folder data) {
        return folderService.deleteFolder(data.getId());
    }

    @Override
    public Folder getById(@PathParam("id") String id) {
        return folderService.getById(id);
    }
}
