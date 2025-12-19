package org.openremote.manager.channel;

import io.netty.channel.ChannelException;
import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.warningMicroIP.WarningMicroIPImpl;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.channel.Channel;
import org.openremote.model.district.DistrictException;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;
import org.openremote.model.warningMicroIP.WarningMicroIP;
import jakarta.ws.rs.BadRequestException;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class ChannelService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void configure() throws Exception {

    }

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new ChannelImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<Channel> getAllChannel(SearchFilterDTO<Channel> dto, User user) {

        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT " +
                            " s.id, s.name, s.description, a.name AS source_name, " +
                            " s.created_by, s.created_at " +
                            "FROM openremote.channel s " +
                            "JOIN openremote.source a ON s.source_id = a.id " +
                            "WHERE s.is_deleted = false " +
                            "AND s.realm_name = :realm "
            );

            if (dto.getKeyWord() != null && !dto.getKeyWord().isEmpty()) {
                sql.append(" AND s.name ILIKE :keyword ");
            }

            sql.append(" ORDER BY s.created_at DESC ");

            Query query = em.createNativeQuery(sql.toString(), Channel.class);
            query.setParameter("realm", user.getRealm());

            if (dto.getKeyWord() != null && !dto.getKeyWord().isEmpty()) {
                query.setParameter("keyword", "%" + dto.getKeyWord() + "%");
            }


            if (dto != null && dto.getPage() != null && dto.getSize() != null) {
                int page = dto.getPage() <= 0 ? 1 : dto.getPage();
                int size = dto.getSize() <= 0 ? 10 : dto.getSize();

                query.setFirstResult((page - 1) * size);
                query.setMaxResults(size);
            }
            return query.getResultList();
        });
    }

    public Channel createChannel(Channel channel) {

        return persistenceService.doReturningTransaction(em -> {
            if (channel.getName() == null || channel.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên kênh không được để trống!"
                );
            }

            if (channel.getSource_id() == null || channel.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Nguồn không được để trống!"
                );
            }

            Query sourceQuery = em.createNativeQuery("SELECT id FROM openremote.source WHERE id = :id"
            );
            sourceQuery.setParameter("id", channel.getSource_id());
            if (sourceQuery.getResultList().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Nguồn '" + channel.getSource_id() + "' không tồn tại!"
                );
            }


            Query nameCheckQuery = em.createNativeQuery(
                    "SELECT 1 FROM openremote.channel WHERE name = :name AND is_deleted = false"
            );
            nameCheckQuery.setParameter("name", channel.getName());
            if (!nameCheckQuery.getResultList().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên kênh '" + channel.getName() + "' đã tồn tại!"
                );
            }

            em.createNativeQuery(
                            "INSERT INTO channel " +
                                    "(id, name, description, realm_name, source_id, created_by, created_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                    )
                    .setParameter(1, channel.getId())
                    .setParameter(2, channel.getName())
                    .setParameter(3, channel.getDescription())
                    .setParameter(4, channel.getRealm_name())
                    .setParameter(5, channel.getSource_id())
                    .setParameter(6, channel.getCreated_by())
                    .executeUpdate();
            return channel;
        });
    }


    public Channel updateChannel(Channel channel) {
        return persistenceService.doReturningTransaction(em -> {

            Query checkQuery = em.createNativeQuery(
                    "SELECT 1 FROM openremote.channel " +
                            "WHERE name = :name " +
                            "AND is_deleted = false " +
                            "AND id <> :id"
            );

            checkQuery.setParameter("name", channel.getName());
            checkQuery.setParameter("id", channel.getId());

            if (channel.getName() == null || channel.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên kênh không được để trống!"
                );
            }

            if (channel.getSource_id() == null || channel.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Nguồn không được để trống!"
                );
            }

            Query nameCheckQuery = em.createNativeQuery(
                    "SELECT 1\n" +
                            "FROM openremote.source\n" +
                            "WHERE name = :name\n" +
                            "  AND is_deleted = FALSE\n" +
                            "  AND id <> :id"
            );


            nameCheckQuery.setParameter("name", channel.getName());
            nameCheckQuery.setParameter("id", channel.getSource_id());
            if (!nameCheckQuery.getResultList().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Nguồn '" + channel.getName() + "' đã tồn tại!"
                );
            }

            String sql = "SELECT COUNT(*) FROM source WHERE id = :id";
            Query query = em.createNativeQuery(sql);
            query.setParameter("id", channel.getSource_id());

            Number count = (Number) query.getSingleResult();

            if (count.intValue() == 0) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Nguồn '" + channel.getSource_id() + "' không tồn tại!"
                );
            }


            em.createNativeQuery(
                            "UPDATE channel " +
                                    "SET name = ?, description = ?,source_id = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP " +
                                    "WHERE id = ?"
                    )
                    .setParameter(1, channel.getName())
                    .setParameter(2, channel.getDescription())
                    .setParameter(3, channel.getSource_id())
                    .setParameter(4, channel.getCreated_by())
                    .setParameter(5, channel.getId())
                    .executeUpdate();

            return channel;
        });
    }


    public boolean deleteChannel(String channelId) {
        return persistenceService.doReturningTransaction(em -> {

            int updated = em.createNativeQuery(
                            "UPDATE channel c " +
                                    "SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP " +
                                    "WHERE c.id = :id " +
                                    "AND NOT EXISTS ( " +
                                    "    SELECT 1 FROM live_stream_channel l " +
                                    "    WHERE l.channel_id = c.id " +
                                    ") " +
                                    "AND NOT EXISTS ( " +
                                    "    SELECT 1 FROM content ct " +
                                    "    WHERE ct.channel_id = c.id " +
                                    ")"
                    )
                    .setParameter("id", channelId)
                    .executeUpdate();

            return updated > 0;
        });
    }

}
