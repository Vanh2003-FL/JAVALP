package org.openremote.manager.blog;

import jakarta.ws.rs.ForbiddenException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.blog.Blog;
import org.openremote.model.blog.BlogCategory;
import org.openremote.model.blog.BlogResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;

public class BlogResourceImpl extends ManagerWebResource implements BlogResource {

    protected final PersistenceService persistenceService;

    protected final BlogPersistenceService blogPersistenceService;

    public BlogResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, BlogPersistenceService BlogPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.blogPersistenceService = BlogPersistenceService;
    }

    @Override
    public List<Blog> getBlog(SearchFilterDTO<Blog> filterDTO) {
        return blogPersistenceService.getBlogs(filterDTO == null ? new SearchFilterDTO<>() : filterDTO);
    }

    @Override
    public List<BlogCategory> getBlogCategory(SearchFilterDTO<BlogCategory> filterDTO) {
        return blogPersistenceService.getBlogCateGory(filterDTO == null ? new SearchFilterDTO<>() : filterDTO);
    }

    @Override
    public Blog createBlog(Blog data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return blogPersistenceService.create(data, user);
    }

    @Override
    public BlogCategory createBlogCategory(BlogCategory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return blogPersistenceService.createBlogCateGory(data, user);
    }

    @Override
    public Blog updateBlog(Blog data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return blogPersistenceService.update(data, user);
    }

    @Override
    public BlogCategory updateBlogCategory(BlogCategory data) {
        User user = identityService.getIdentityProvider().getUser(getUserId());
        if (user == null) {
            throw new ForbiddenException("User not found");
        }
        return blogPersistenceService.updateBlogCategory(data, user);
    }

    @Override
    public Long countBlog(SearchFilterDTO<Blog> filterDTO) {
        return blogPersistenceService.countBlogs(filterDTO == null ? new SearchFilterDTO<>() : filterDTO);
    }

    @Override
    public Long countBlogCategory(SearchFilterDTO<BlogCategory> filterDTO) {
        return blogPersistenceService.countBlogCategory(filterDTO == null ? new SearchFilterDTO<>() : filterDTO);
    }

    @Override
    public boolean removeBlog(Blog data) {
        return blogPersistenceService.deleteBlog(data.getId());
    }

    @Override
    public boolean removeBlogCategory(BlogCategory data) {
        return blogPersistenceService.deleteBlogCategory(data.getId());
    }
}
