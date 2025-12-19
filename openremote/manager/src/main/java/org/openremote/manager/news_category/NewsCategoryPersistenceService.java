package org.openremote.manager.news_category;

import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.NewsCategory.NewsCategory;
import org.openremote.model.security.User;

import java.util.List;
import java.util.logging.Logger;

public class NewsCategoryPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(NewsCategoryPersistenceService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new NewsCategoryResourceImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override public void start(Container container) throws Exception {}
    @Override public void stop(Container container) throws Exception {}
    @Override public void configure() throws Exception {}

    /* ============================================================
                          CREATE
       ============================================================ */
    public NewsCategory create(NewsCategory category, User user) {
        return persistenceService.doReturningTransaction(em -> {
            String createdBy = (user != null && user.getId() != null) ? user.getId() : "admin";

            em.createNativeQuery(
                            "INSERT INTO openremote.news_category " +
                                    "(id, title, description, created_by, created_at, realm_name) " +
                                    "VALUES (?, ?, ?, ?, now(), ?)")
                    .setParameter(1, category.getId()) // UUID tự sinh từ entity
                    .setParameter(2, category.getTitle())
                    .setParameter(3, category.getDescription())
                    .setParameter(4, createdBy)
                    .setParameter(5, category.getRealmName())
                    .executeUpdate();

            category.setCreatedBy(createdBy);
            return category;
        });
    }

    /* ============================================================
                          UPDATE
       ============================================================ */
    public NewsCategory update(NewsCategory category, User user) {
        return persistenceService.doReturningTransaction(em -> {
            String updatedBy = (user != null && user.getId() != null) ? user.getId() : "admin";

            em.createNativeQuery(
                            "UPDATE openremote.news_category " +
                                    "SET title = ?, description = ?, updated_by = ?, updated_at = now(), realm_name = ? " +
                                    "WHERE id = ?")
                    .setParameter(1, category.getTitle())
                    .setParameter(2, category.getDescription())
                    .setParameter(3, updatedBy)
                    .setParameter(4, category.getRealmName())
                    .setParameter(5, category.getId())
                    .executeUpdate();

            category.setUpdatedBy(updatedBy);
            return category;
        });
    }

    /* ============================================================
                          GET LIST
       ============================================================ */
    public List<NewsCategory> getNewsCategory(SearchFilterDTO<NewsCategory> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder(
                    "SELECT nc.id, nc.title, nc.description " +
                            "FROM openremote.news_category nc WHERE nc.is_deleted = false");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND nc.title ILIKE :keyword");
            }

            sql.append(" ORDER BY nc.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), NewsCategory.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return (List<NewsCategory>) query.getResultList();
        });
    }

    /* ============================================================
                          GET BY ID
       ============================================================ */
    public NewsCategory getById(String id) {
        return persistenceService.doReturningTransaction(em -> {
            String sql = "SELECT nc.title, nc.description " +
                    "FROM openremote.news_category nc " +
                    "WHERE nc.id = :id AND nc.is_deleted = false";

            Object[] result = (Object[]) em.createNativeQuery(sql)
                    .setParameter("id", id)
                    .getSingleResult();

            return new NewsCategory((String) result[0], (String) result[1]);
        });
    }



    /* ============================================================
                          COUNT
       ============================================================ */
    public Long countNewsCategory(SearchFilterDTO<NewsCategory> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder(
                    "SELECT COUNT(*) FROM openremote.news_category nc WHERE nc.is_deleted = false");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND nc.title ILIKE :keyword");
            }

            Query query = em.createNativeQuery(sql.toString());

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }

    /* ============================================================
                          DELETE
       ============================================================ */
    public boolean deleteNewsCategory(String categoryId) {
        return persistenceService.doReturningTransaction(em -> {
            int updated = em.createNativeQuery(
                            "UPDATE openremote.news_category " +
                                    "SET is_deleted = true, updated_at = now() " +
                                    "WHERE id = :id")
                    .setParameter("id", categoryId)
                    .executeUpdate();

            return updated > 0;
        });
    }

}
