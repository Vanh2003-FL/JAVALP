package org.openremote.manager.broadcast_history;

import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.broadcast_history.BroadcastHistory;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.util.List;
import java.util.logging.Logger;

public class BroadcastHistoryPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(BroadcastHistoryPersistenceService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new BroadcastHistoryResourceImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override public void start(Container container) throws Exception {}
    @Override public void stop(Container container) throws Exception {}
    @Override public void configure() throws Exception {}

    /* ============================================================
                          CREATE
       ============================================================ */

    public BroadcastHistory create(BroadcastHistory history, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String createdBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            Long id = (Long) em.createNativeQuery(
                            "INSERT INTO openremote.schedule_history " +
                                    "(schedule_id, status, note, realm_id, created_by, created_date) " +
                                    "VALUES (?, ?, ?, ?, ?, now()) RETURNING id")
                    .setParameter(1, history.getScheduleId())
                    .setParameter(2, history.getStatus())
                    .setParameter(3, history.getNote())
                    .setParameter(4, history.getRealmId())
                    .setParameter(5, createdBy)
                    .getSingleResult();

            history.setId(id);
            return history;
        });
    }

    /* ============================================================
                          UPDATE
       ============================================================ */

    public BroadcastHistory update(BroadcastHistory history, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            em.createNativeQuery(
                            "UPDATE openremote.schedule_history " +
                                    "SET schedule_id = ?, status = ?, note = ?, realm_id = ?, " +
                                    "updated_by = ?, updated_date = now() " +
                                    "WHERE id = ?")
                    .setParameter(1, history.getScheduleId())
                    .setParameter(2, history.getStatus())
                    .setParameter(3, history.getNote())
                    .setParameter(4, history.getRealmId())
                    .setParameter(5, updatedBy)
                    .setParameter(6, history.getId())
                    .executeUpdate();

            return history;
        });
    }

    /* ============================================================
                          GET LIST
       ============================================================ */

    public List<BroadcastHistory> getBroadcastHistory(SearchFilterDTO<BroadcastHistory> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT sh.id, sh.schedule_id, sh.status, sh.note " +
                            "FROM openremote.schedule_history sh WHERE 1=1");

            // Filter theo status hoặc note
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND (sh.status ILIKE :keyword OR sh.note ILIKE :keyword)");
            }

            sql.append(" ORDER BY sh.created_date DESC");

            Query query = em.createNativeQuery(sql.toString(), BroadcastHistory.class);

            // Params
            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            // Paging
            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return (List<BroadcastHistory>) query.getResultList();
        });
    }

    /* ============================================================
                         GET BY ID
       ============================================================ */

    public BroadcastHistory getById(Long id) {
        return persistenceService.doReturningTransaction(em -> {

            String sql = "SELECT sh.id, sh.schedule_id, sh.status, sh.note " +
                    "FROM openremote.schedule_history sh " +
                    "WHERE sh.id = :id";

            List<BroadcastHistory> result = em.createNativeQuery(sql, BroadcastHistory.class)
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

    public Long countBroadcastHistory(SearchFilterDTO<BroadcastHistory> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT COUNT(*) FROM openremote.schedule_history sh WHERE 1=1");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND (sh.status ILIKE :keyword OR sh.note ILIKE :keyword)");
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

    public boolean deleteBroadcastHistory(Long historyId) {
        return persistenceService.doReturningTransaction(em -> {

            int deleted = em.createNativeQuery(
                            "DELETE FROM openremote.schedule_history " +
                                    "WHERE id = :id")
                    .setParameter("id", historyId)
                    .executeUpdate();

            return deleted > 0;
        });
    }
}
