package org.openremote.manager.blog;

import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.blog.BlogCategory;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.blog.Blog;
import org.openremote.model.security.User;

import java.util.List;
import java.util.logging.Logger;

public class BlogPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new BlogResourceImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override public void start(Container container) throws Exception {}
    @Override public void stop(Container container) throws Exception {}
    @Override public void configure() throws Exception {}

    public BlogCategory createBlogCateGory(BlogCategory blog, User user) {
        return persistenceService.doReturningTransaction(em -> {
            Long id = (Long) em.createNativeQuery(
                            "INSERT INTO openremote.blog_categories (\"name\", description, createdby, created_at) VALUES(?, ?, ?, now()) RETURNING id")
                    .setParameter(1, blog.getName())
                    .setParameter(2, blog.getDescription())
                    .setParameter(3, user.getId())
                    .getSingleResult();
            blog.setId(id);
            return blog;
        });
    }

    public Blog create(Blog blog, User user) {
        return persistenceService.doReturningTransaction(em -> {
            Long id = (Long) em.createNativeQuery(
                            "INSERT INTO openremote.blogs (title, \"content\", slug, summary, thumbnail_url, category_id, priority_level, start_date, end_date, status, view_count, createdby, created_at) " +
                                    "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now()) RETURNING id")
                    .setParameter(1, blog.getTitle())
                    .setParameter(2, blog.getContent())
                    .setParameter(3, blog.getSlug())
                    .setParameter(4, blog.getSummary())
                    .setParameter(5, blog.getThumbnailUrl())
                    .setParameter(6, blog.getCategoryId())
                    .setParameter(7, blog.getPriorityLevel())
                    .setParameter(8, blog.getStartDate())
                    .setParameter(9, blog.getEndDate())
                    .setParameter(10, true)
                    .setParameter(11, blog.getViewCount())
                    .setParameter(12, user.getId())
                    .getSingleResult();
            blog.setId(id);
            return blog;
        });
    }

    public List<Blog> getBlogs(SearchFilterDTO<Blog> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder("SELECT b.id, b.title, b.content, b.slug, b.summary, b.thumbnail_url, " +
                    "b.category_id, b.priority_level, b.start_date, b.end_date, b.status, b.view_count, b.createdby, b.updatedby, " +
                    "b.created_at, b.updated_at, u.last_name, u1.last_name FROM openremote.blogs b " +
                    "LEFT JOIN public.user_entity u ON u.id = b.createdby " +
                    "LEFT JOIN public.user_entity u1 ON u1.id = b.updatedby WHERE true = true");

            appendBlogSQL(dto, sql);

            sql.append(" ORDER BY b.created_at DESC");
            Query query = em.createNativeQuery(sql.toString(), Blog.class);
            setBlogQueryParams(query, dto);

            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }
            return (List<Blog>) query.getResultList();
        });
    }

    public Long countBlogs(SearchFilterDTO<Blog> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM openremote.blogs b where true = true ");
            appendBlogSQL(dto, sql);

            Query query = em.createNativeQuery(sql.toString());
            setBlogQueryParams(query, dto);
            return ((Number) query.getSingleResult()).longValue();
        });
    }

    private void appendBlogSQL(SearchFilterDTO<Blog> dto, StringBuilder sql) {
        Blog data = dto.getData();

        if (validationUtils.isValid(dto.getKeyWord())) {
            sql.append(" AND (b.title ILIKE :keyword OR b.content ILIKE :keyword)");
        }
        if (validationUtils.isValid(data)) {
            if (validationUtils.isValid(data.getCategoryId())) {
                sql.append(" AND b.category_id = :categoryId");
            }
            if (validationUtils.isValid(data.getFromStartDate())) {
                sql.append(" AND b.start_date >= :fromStartDate");
            }
            if (validationUtils.isValid(data.getToStartDate())) {
                sql.append(" AND b.start_date <= :toStartDate");
            }
            if (validationUtils.isValid(data.getFromEndDate())) {
                sql.append(" AND b.end_date >= :fromEndDate");
            }
            if (validationUtils.isValid(data.getToEndDate())) {
                sql.append(" AND b.end_date <= :toEndDate");
            }
            if (validationUtils.isValid(data.getStatus())) {
                sql.append(" AND b.status = :status ");
            }
        }
    }

    public List<BlogCategory> getBlogCateGory(SearchFilterDTO<BlogCategory> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder("SELECT b.id, b.name, b.description, b.createdby, b.updatedby, " +
                    "b.created_at, b.updated_at, u.last_name, u1.last_name FROM openremote.blog_categories b " +
                    "LEFT JOIN public.user_entity u ON u.id = b.createdby " +
                    "LEFT JOIN public.user_entity u1 ON u1.id = b.updatedby WHERE 1=1");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND (b.name ILIKE :keyword OR b.description ILIKE :keyword)");
            }

            sql.append(" ORDER BY b.created_at DESC");
            Query query = em.createNativeQuery(sql.toString(), BlogCategory.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return (List<BlogCategory>) query.getResultList();
        });
    }

    public Long countBlogCategory(SearchFilterDTO<BlogCategory> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM openremote.blog_categories b WHERE 1=1");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND (b.name ILIKE :keyword OR b.description ILIKE :keyword)");
            }

            Query query = em.createNativeQuery(sql.toString());
            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }

    public Blog update(Blog blog, User user) {
        return persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery("UPDATE openremote.blogs SET title = ?, content = ?, slug = ?, summary = ?, thumbnail_url = ?, category_id = ?, priority_level = ?, start_date = ?, end_date = ?, status = ?, view_count = ?, updatedby = ?, updated_at = now() WHERE id = ?")
                    .setParameter(1, blog.getTitle())
                    .setParameter(2, blog.getContent())
                    .setParameter(3, blog.getSlug())
                    .setParameter(4, blog.getSummary())
                    .setParameter(5, blog.getThumbnailUrl())
                    .setParameter(6, blog.getCategoryId())
                    .setParameter(7, blog.getPriorityLevel())
                    .setParameter(8, blog.getStartDate())
                    .setParameter(9, blog.getEndDate())
                    .setParameter(10, blog.getStatus())
                    .setParameter(11, blog.getViewCount())
                    .setParameter(12, user.getId())
                    .setParameter(13, blog.getId())
                    .executeUpdate();
            return blog;
        });
    }

    public BlogCategory updateBlogCategory(BlogCategory category, User user) {
        return persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery("UPDATE openremote.blog_categories SET name = ?, description = ?, updatedby = ?, updated_at = now() WHERE id = ?")
                    .setParameter(1, category.getName())
                    .setParameter(2, category.getDescription())
                    .setParameter(3, user.getId())
                    .setParameter(4, category.getId())
                    .executeUpdate();
            return category;
        });
    }

    public boolean deleteBlogCategory(Long categoryId) {
        return persistenceService.doReturningTransaction(em -> {
            Long count = ((Number) em.createNativeQuery(
                            "SELECT COUNT(*) FROM openremote.blogs WHERE category_id = :categoryId")
                    .setParameter("categoryId", categoryId)
                    .getSingleResult()).longValue();

            if (count > 0) {
                throw new RuntimeException("Cannot delete category because it is being used by one or more blogs.");
            }

            int deleted = em.createNativeQuery("DELETE FROM openremote.blog_categories WHERE id = :id")
                    .setParameter("id", categoryId)
                    .executeUpdate();

            return deleted > 0;
        });
    }

    public boolean deleteBlog(Long blogId) {
        return persistenceService.doReturningTransaction(em -> {
            int deleted = em.createNativeQuery("DELETE FROM openremote.blogs WHERE id = :id")
                    .setParameter("id", blogId)
                    .executeUpdate();
            return deleted > 0;
        });
    }

    private void setBlogQueryParams(Query query, SearchFilterDTO<Blog> dto) {
        Blog blog = dto.getData();
        if (validationUtils.isValid(dto.getKeyWord())) {
            query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
        }
        if (validationUtils.isValid(blog)) {
            if (validationUtils.isValid(blog.getCategoryId())) {
                query.setParameter("categoryId", blog.getCategoryId());
            }
            if (validationUtils.isValid(blog.getFromStartDate())) {
                query.setParameter("fromStartDate", blog.getFromStartDate());
            }
            if (validationUtils.isValid(blog.getToStartDate())) {
                query.setParameter("toStartDate", blog.getToStartDate());
            }
            if (validationUtils.isValid(blog.getFromEndDate())) {
                query.setParameter("fromEndDate", blog.getFromEndDate());
            }
            if (validationUtils.isValid(blog.getToEndDate())) {
                query.setParameter("toEndDate", blog.getToEndDate());
            }
            if (validationUtils.isValid((blog.getStatus()))) {
                query.setParameter("status", blog.getStatus());
            }
        }
    }
}
