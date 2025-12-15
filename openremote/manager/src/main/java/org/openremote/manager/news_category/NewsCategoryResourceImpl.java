package org.openremote.manager.news_category;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.news_category.NewsCategory;
import org.openremote.model.news_category.NewsCategoryResources;
import org.openremote.model.security.User;

import java.util.List;

public class NewsCategoryResourceImpl extends ManagerWebResource implements NewsCategoryResources {

    protected final PersistenceService persistenceService;
    protected final NewsCategoryPersistenceService newsCategoryPersistenceService;

    public NewsCategoryResourceImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            PersistenceService persistenceService,
            NewsCategoryPersistenceService newsCategoryPersistenceService
    ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.newsCategoryPersistenceService = newsCategoryPersistenceService;
    }

    @Override
    public List<NewsCategory> getNewsCategory(SearchFilterDTO<NewsCategory> filterDTO) {
        return newsCategoryPersistenceService.getNewsCategory(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public Long countNewsCategory(SearchFilterDTO<NewsCategory> filterDTO) {
        return newsCategoryPersistenceService.countNewsCategory(
                filterDTO == null ? new SearchFilterDTO<>() : filterDTO
        );
    }

    @Override
    public NewsCategory createNewsCategory(NewsCategory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return newsCategoryPersistenceService.create(data, user);
    }

    @Override
    public NewsCategory updateNewsCategory(NewsCategory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
//        if (user == null) {
//            throw new ForbiddenException("User not found");
//        }
        return newsCategoryPersistenceService.update(data, user);
    }

    @Override
    public boolean removeNewsCategory(NewsCategory data) {
        return newsCategoryPersistenceService.deleteNewsCategory(data.getId());
    }
    @Override
    public NewsCategory getNewsCategoryById(NewsCategory data) {
        return newsCategoryPersistenceService.getById(data.getId());
    }

}
