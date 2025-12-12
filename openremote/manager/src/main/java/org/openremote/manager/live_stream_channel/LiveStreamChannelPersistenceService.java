package org.openremote.manager.live_stream_channel;

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
import org.openremote.model.live_stream_channel.LiveStreamChannel;
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

            String createdBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            String id = java.util.UUID.randomUUID().toString();

            em.createNativeQuery(
                            "INSERT INTO openremote.live_stream_channel " +
                                    "(id, title, url, is_share, area_id, description, source_id, channel_id, realm_name, status, created_by, created_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())")
                    .setParameter(1, id)
                    .setParameter(2, channel.getTitle())
                    .setParameter(3, channel.getUrl())
                    .setParameter(4, channel.getShare() != null ? channel.getShare() : false)
                    .setParameter(5, channel.getAreaId())
                    .setParameter(6, channel.getDescription())
                    .setParameter(7, channel.getSourceId())
                    .setParameter(8, channel.getChannelId())
                    .setParameter(9, channel.getRealmName())
                    .setParameter(10, channel.getStatus())
                    .setParameter(11, createdBy)
                    .executeUpdate();

            channel.setId(id);
            return channel;
        });
    }

    /* ============================================================
                          UPDATE
       ============================================================ */

    public LiveStreamChannel update(LiveStreamChannel channel, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            em.createNativeQuery(
                            "UPDATE openremote.live_stream_channel " +
                                    "SET title = ?, url = ?, is_share = ?, area_id = ?, description = ?, " +
                                    "source_id = ?, channel_id = ?, realm_name = ?, status = ?, " +
                                    "updated_by = ?, updated_at = now() " +
                                    "WHERE id = ?")
                    .setParameter(1, channel.getTitle())
                    .setParameter(2, channel.getUrl())
                    .setParameter(3, channel.getShare())
                    .setParameter(4, channel.getAreaId())
                    .setParameter(5, channel.getDescription())
                    .setParameter(6, channel.getSourceId())
                    .setParameter(7, channel.getChannelId())
                    .setParameter(8, channel.getRealmName())
                    .setParameter(9, channel.getStatus())
                    .setParameter(10, updatedBy)
                    .setParameter(11, channel.getId())
                    .executeUpdate();

            return channel;
        });
    }

    /* ============================================================
                          GET LIST
       ============================================================ */

    public List<LiveStreamChannel> getLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT c.id, c.title, c.url, c.is_share, c.area_id, c.status " +
                            "FROM openremote.live_stream_channel c WHERE c.is_deleted = false");

            // Filter theo title
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND c.title ILIKE :keyword");
            }

            sql.append(" ORDER BY c.id DESC");

            Query query = em.createNativeQuery(sql.toString(), LiveStreamChannel.class);

            // Params
            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            // Paging
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

            String sql = "SELECT c.id, c.title, c.url, c.is_share, c.area_id, c.status " +
                    "FROM openremote.live_stream_channel c " +
                    "WHERE c.id = :id AND c.is_deleted = false";

            List<LiveStreamChannel> result = em.createNativeQuery(sql, LiveStreamChannel.class)
                    .setParameter("id", id)
                    .getResultList();

            if (result.isEmpty()) {
                return null;
            }

            return result.get(0);
        });
    }

    /* ============================================================
                         GET BY AREA ID
       ============================================================ */

    public List<LiveStreamChannel> getByAreaId(String areaId) {
        return persistenceService.doReturningTransaction(em -> {

            String sql = "SELECT c.id, c.title, c.url, c.is_share, c.area_id, c.status " +
                    "FROM openremote.live_stream_channel c " +
                    "WHERE c.area_id = :areaId AND c.is_deleted = false " +
                    "ORDER BY c.id DESC";

            return (List<LiveStreamChannel>) em.createNativeQuery(sql, LiveStreamChannel.class)
                    .setParameter("areaId", areaId)
                    .getResultList();
        });
    }

    /* ============================================================
                         GET SHARED CHANNELS
       ============================================================ */

    public List<LiveStreamChannel> getSharedChannels(SearchFilterDTO<LiveStreamChannel> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT c.id, c.title, c.url, c.is_share, c.area_id, c.status " +
                            "FROM openremote.live_stream_channel c " +
                            "WHERE c.is_deleted = false AND c.is_share = true");

            // Filter theo title hoặc status
            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND (c.title ILIKE :keyword OR c.status ILIKE :keyword)");
            }

            sql.append(" ORDER BY c.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), LiveStreamChannel.class);

            // Params
            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            // Paging
            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return (List<LiveStreamChannel>) query.getResultList();
        });
    }

    /* ============================================================
                          COUNT
       ============================================================ */

    public Long countLiveStreamChannel(SearchFilterDTO<LiveStreamChannel> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT COUNT(*) FROM openremote.live_stream_channel c WHERE c.is_deleted = false");

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND c.title ILIKE :keyword");
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

    public boolean deleteLiveStreamChannel(String channelId) {
        return persistenceService.doReturningTransaction(em -> {

            int updated = em.createNativeQuery(
                            "UPDATE openremote.live_stream_channel " +
                                    "SET is_deleted = true " +
                                    "WHERE id = :id")
                    .setParameter("id", channelId)
                    .executeUpdate();

            return updated > 0;
        });
    }
}
