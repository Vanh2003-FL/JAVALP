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
import org.openremote.model.news_category.NewsCategory;
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

            String createdBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            Long id = (Long) em.createNativeQuery(
                            "INSERT INTO openremote.news_category " +
                                    "(title, description, created_by, created_at) " +
                                    "VALUES (?, ?, ?, now()) RETURNING id")
                    .setParameter(1, category.getTitle())
                    .setParameter(2, category.getDescription())
                    .setParameter(3, createdBy)
                    .getSingleResult();

            category.setId(id);
            return category;
        });
    }


    /* ============================================================
                          UPDATE
       ============================================================ */

    public NewsCategory update(NewsCategory category, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            em.createNativeQuery(
                            "UPDATE openremote.news_category " +
                                    "SET title = ?, description = ?, updated_by = ?, updated_at = now() " +
                                    "WHERE id = ?")
                    .setParameter(1, category.getTitle())
                    .setParameter(2, category.getDescription())
                    .setParameter(3, updatedBy)
                    .setParameter(4, category.getId())
                    .executeUpdate();

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

            // Filter chỉ theo title
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND nc.title ILIKE :keyword");
            }

            sql.append(" ORDER BY nc.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), NewsCategory.class);

            // Params
            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            // Paging
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

    public NewsCategory getById(Long id) {
        return persistenceService.doReturningTransaction(em -> {

            String sql = "SELECT nc.id, nc.title, nc.description " +
                    "FROM openremote.news_category nc " +
                    "WHERE nc.id = :id AND nc.is_deleted = false";

            List<NewsCategory> result = em.createNativeQuery(sql, NewsCategory.class)
                    .setParameter("id", id)
                    .getResultList();

            if (result.isEmpty()) {
                return null;
            }

            return result.get(0);
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

    public boolean deleteNewsCategory(Long categoryId) {
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
