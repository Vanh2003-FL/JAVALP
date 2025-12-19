package org.openremote.manager.schedulehistory;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.schedulehistory.ScheduleHistory;
import org.openremote.model.security.User;

import java.sql.Timestamp;
import java.util.List;
import java.util.logging.Logger;

public class ScheduleHistoryPersistenceService implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ScheduleHistoryPersistenceService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;
    protected TimerService timerService;

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
        this.identityService = container.getService(ManagerIdentityService.class);
        this.timerService = container.getService(TimerService.class);
    }

    @Override
    public void start(Container container) throws Exception {
        LOG.info("ScheduleHistoryPersistenceService started");
    }

    @Override
    public void stop(Container container) throws Exception {
        LOG.info("ScheduleHistoryPersistenceService stopped");
    }

    public List<ScheduleHistory> getScheduleHistories(String userId, String keyword, Integer status, String scheduleId, int page, int size) {
        return persistenceService.doReturningTransaction(entityManager -> {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT CAST(sh.id AS VARCHAR), sh.schedule_id, CAST(sh.status AS INTEGER), sh.description, ");
            sql.append("sh.created_by, sh.created_at, sh.updated_by, sh.updated_at, sh.realm_name, CAST(sh.is_deleted AS BOOLEAN) ");
            sql.append("FROM schedule_history sh ");
            sql.append("WHERE sh.is_deleted = false ");

            // Filter by keyword (search in description)
            if (keyword != null && !keyword.isEmpty()) {
                sql.append("AND LOWER(sh.description) LIKE LOWER(:keyword) ");
            }

            // Filter by status
            if (status != null) {
                sql.append("AND sh.status = :status ");
            }

            // Filter by scheduleId
            if (scheduleId != null && !scheduleId.isEmpty()) {
                sql.append("AND sh.schedule_id = :scheduleId ");
            }

            sql.append("ORDER BY sh.created_at DESC ");
            sql.append("LIMIT :size OFFSET :offset");

            Query query = entityManager.createNativeQuery(sql.toString(), ScheduleHistory.class);

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", "%" + keyword + "%");
            }
            if (status != null) {
                query.setParameter("status", status);
            }
            if (scheduleId != null && !scheduleId.isEmpty()) {
                query.setParameter("scheduleId", scheduleId);
            }

            query.setParameter("size", size);
            query.setParameter("offset", page * size);

            return query.getResultList();
        });
    }

    public ScheduleHistory getById(String userId, String id) {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = "SELECT CAST(sh.id AS VARCHAR), sh.schedule_id, CAST(sh.status AS INTEGER), sh.description, " +
                    "sh.created_by, sh.created_at, sh.updated_by, sh.updated_at, sh.realm_name, CAST(sh.is_deleted AS BOOLEAN) " +
                    "FROM schedule_history sh " +
                    "WHERE sh.id = :id AND sh.is_deleted = false";

            Query query = entityManager.createNativeQuery(sql, ScheduleHistory.class);
            query.setParameter("id", id);

            List<ScheduleHistory> results = query.getResultList();
            return results.isEmpty() ? null : results.get(0);
        });
    }

    public long countScheduleHistories(String userId, String keyword, Integer status, String scheduleId) {
        return persistenceService.doReturningTransaction(entityManager -> {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT COUNT(*) FROM schedule_history sh ");
            sql.append("WHERE sh.is_deleted = false ");

            // Filter by keyword
            if (keyword != null && !keyword.isEmpty()) {
                sql.append("AND LOWER(sh.description) LIKE LOWER(:keyword) ");
            }

            // Filter by status
            if (status != null) {
                sql.append("AND sh.status = :status ");
            }

            // Filter by scheduleId
            if (scheduleId != null && !scheduleId.isEmpty()) {
                sql.append("AND sh.schedule_id = :scheduleId ");
            }

            Query query = entityManager.createNativeQuery(sql.toString());

            if (keyword != null && !keyword.isEmpty()) {
                query.setParameter("keyword", "%" + keyword + "%");
            }
            if (status != null) {
                query.setParameter("status", status);
            }
            if (scheduleId != null && !scheduleId.isEmpty()) {
                query.setParameter("scheduleId", scheduleId);
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }
}
