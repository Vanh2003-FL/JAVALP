package org.openremote.manager.livestream;

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
import org.openremote.model.livestream.LiveStreamChannel;
import org.openremote.model.security.User;

import java.util.List;
import java.util.logging.Logger;

public class LiveStreamChannelPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(LiveStreamChannelPersistenceService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new LiveStreamChannelResourceImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override public void start(Container container) throws Exception {}
    @Override public void stop(Container container) throws Exception {}
    @Override public void configure() throws Exception {}

    /* ============================================================
                          CREATE
       ============================================================ */
    public LiveStreamChannel create(LiveStreamChannel channel, User user) {
        return persistenceService.doReturningTransaction(em -> {
            String createdBy = (user != null && user.getId() != null) ? user.getId() : "admin";

            em.createNativeQuery(
                            "INSERT INTO openremote.live_stream_channel " +
                                    "(id, title, url, is_share, area_id, description, source_id, channel_id, " +
                                    "realm_name, status, created_by, created_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())")
                    .setParameter(1, channel.getId()) // UUID tự sinh từ entity
                    .setParameter(2, channel.getTitle())
                    .setParameter(3, channel.getUrl())
                    .setParameter(4, channel.getIsShare())
                    .setParameter(5, channel.getAreaId())
                    .setParameter(6, channel.getDescription())
                    .setParameter(7, channel.getSourceId())
                    .setParameter(8, channel.getChannelId())
                    .setParameter(9, channel.getRealmName())
                    .setParameter(10, channel.getStatus())
                    .setParameter(11, createdBy)
                    .executeUpdate();

            channel.setCreatedBy(createdBy);
            return channel;
        });
    }

    /* ============================================================
                          UPDATE
       ============================================================ */
    public LiveStreamChannel update(LiveStreamChannel channel, User user) {
        return persistenceService.doReturningTransaction(em -> {
            String updatedBy = (user != null && user.getId() != null) ? user.getId() : "admin";

            em.createNativeQuery(
                            "UPDATE openremote.live_stream_channel " +
                                    "SET title = ?, url = ?, is_share = ?, area_id = ?, description = ?, " +
                                    "source_id = ?, channel_id = ?, realm_name = ?, status = ?, " +
                                    "updated_by = ?, updated_at = now() " +
                                    "WHERE id = ?")
                    .setParameter(1, channel.getTitle())
                    .setParameter(2, channel.getUrl())
                    .setParameter(3, channel.getIsShare())
                    .setParameter(4, channel.getAreaId())
                    .setParameter(5, channel.getDescription())
                    .setParameter(6, channel.getSourceId())
                    .setParameter(7, channel.getChannelId())
                    .setParameter(8, channel.getRealmName())
                    .setParameter(9, channel.getStatus())
                    .setParameter(10, updatedBy)
                    .setParameter(11, channel.getId())
                    .executeUpdate();

            channel.setUpdatedBy(updatedBy);
            return channel;
        });
    }

    /* ============================================================
                          GET LIST
       ============================================================ */
    public List<LiveStreamChannel> getLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder(
                    "SELECT lsc.id, lsc.title, lsc.url, lsc.is_share, lsc.area_id, lsc.description, " +
                            "lsc.source_id, lsc.channel_id, lsc.realm_name, lsc.status, " +
                            "lsc.created_by, lsc.created_at, lsc.updated_by, lsc.updated_at " +
                            "FROM openremote.live_stream_channel lsc WHERE lsc.is_deleted = false");

            // Filter theo keyword (title)
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND lsc.title ILIKE :keyword");
            }

            // Filter theo status (Trạng thái sử dụng)
            if (dto.getData() != null && dto.getData().getStatus() != null) {
                sql.append(" AND lsc.status = :status");
            }

            // Filter theo area_id (Khu vực)
            if (dto.getData() != null && validationUtils.isValid(dto.getData().getAreaId())) {
                sql.append(" AND lsc.area_id = :areaId");
            }

            sql.append(" ORDER BY lsc.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), LiveStreamChannel.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            if (dto.getData() != null && dto.getData().getStatus() != null) {
                query.setParameter("status", dto.getData().getStatus());
            }

            if (dto.getData() != null && validationUtils.isValid(dto.getData().getAreaId())) {
                query.setParameter("areaId", dto.getData().getAreaId());
            }

            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return (List<LiveStreamChannel>) query.getResultList();
        });
    }

    /* ============================================================
                          GET BY ID
       ============================================================ */
    public LiveStreamChannel getById(String id) {
        return persistenceService.doReturningTransaction(em -> {
            String sql = "SELECT lsc.id, lsc.title, lsc.url, lsc.is_share, lsc.area_id, lsc.description, " +
                    "lsc.source_id, lsc.channel_id, lsc.realm_name, lsc.status, " +
                    "lsc.created_by, lsc.created_at, lsc.updated_by, lsc.updated_at " +
                    "FROM openremote.live_stream_channel lsc " +
                    "WHERE lsc.id = :id AND lsc.is_deleted = false";

            Query query = em.createNativeQuery(sql, LiveStreamChannel.class)
                    .setParameter("id", id);

            List<LiveStreamChannel> results = query.getResultList();
            return results.isEmpty() ? null : results.get(0);
        });
    }

    /* ============================================================
                          COUNT
       ============================================================ */
    public Long countLiveStreamChannels(SearchFilterDTO<LiveStreamChannel> dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder(
                    "SELECT COUNT(*) FROM openremote.live_stream_channel lsc WHERE lsc.is_deleted = false");

            // Filter theo keyword (title)
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND lsc.title ILIKE :keyword");
            }

            // Filter theo status (Trạng thái sử dụng)
            if (dto.getData() != null && dto.getData().getStatus() != null) {
                sql.append(" AND lsc.status = :status");
            }

            // Filter theo area_id (Khu vực)
            if (dto.getData() != null && validationUtils.isValid(dto.getData().getAreaId())) {
                sql.append(" AND lsc.area_id = :areaId");
            }

            Query query = em.createNativeQuery(sql.toString());

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            if (dto.getData() != null && dto.getData().getStatus() != null) {
                query.setParameter("status", dto.getData().getStatus());
            }

            if (dto.getData() != null && validationUtils.isValid(dto.getData().getAreaId())) {
                query.setParameter("areaId", dto.getData().getAreaId());
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }

    /* ============================================================
                          DELETE (Soft Delete)
       ============================================================ */
    public Boolean deleteLiveStreamChannel(String channelId) {
        return persistenceService.doReturningTransaction(em -> {
            int updated = em.createNativeQuery(
                            "UPDATE openremote.live_stream_channel " +
                                    "SET is_deleted = true, updated_at = now() " +
                                    "WHERE id = :id")
                    .setParameter("id", channelId)
                    .executeUpdate();

            return updated > 0;
        });
    }
}
