package org.openremote.manager.content;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.content.Content;
import org.openremote.model.content.ContentResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;

public class ContentImpl extends ManagerWebResource implements ContentResource {

    protected final PersistenceService persistenceService;
    protected final ContentService contentService;

    public ContentImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            ContentService contentService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.contentService = contentService;
    }

    @Override
    public List<Content> getAllMdContent(SearchFilterDTO<Content> filterDTO) {
        return contentService.getMdContent(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Content createContent(Content data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return contentService.create(data, user);
    }

    @Override
    public Content updateContent(Content data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        return contentService.update(data, user);
    }

    @Override
    public boolean removeContent(Content data) {
        return contentService.deleteMdContent(data.getId());
    }

    @Override
    public Content getMdContentById(String id) {
        return contentService.getById(id);
    }
}
