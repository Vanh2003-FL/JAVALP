package org.openremote.manager.source;

import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.warningMicroIP.WarningMicroIPImpl;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.DistrictException;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;
import org.openremote.model.source.Source;
import org.openremote.model.warningMicroIP.WarningMicroIP;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class SourceService extends RouteBuilder implements ContainerService {

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
        managerWebService.addApiSingleton(new SourceImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }


    public List<Source> getAllSource(SearchFilterDTO<WarningMicroIP> dto, User user) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder("SELECT id, name, description, " +
                    "created_by, created_at " +
                    "FROM openremote.source s " +
                    "WHERE is_deleted = false " +
                    "AND realm_name = :realm ");

            if (dto.getKeyWord() != null && !dto.getKeyWord().isEmpty()) {
                sql.append(" AND s.name ILIKE :keyword ");
            }

            Query query = em.createNativeQuery(sql.toString(), Source.class);
            query.setParameter("realm", user.getRealm());


            sql.append(" ORDER BY s.created_at DESC ");

            if (dto != null && dto.getKeyWord() != null && !dto.getKeyWord().trim().isEmpty()) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
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

    public Source createSource(Source source) {
        return persistenceService.doReturningTransaction(em -> {

            if (source.getName() == null || source.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên nguồn không được để trống!"
                );
            }

            Query nameCheckQuery = em.createNativeQuery(
                    "SELECT 1 FROM openremote.source WHERE name = :name AND is_deleted = false"
            );
            nameCheckQuery.setParameter("name", source.getName());
            if (!nameCheckQuery.getResultList().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên nguồn '" + source.getName() + "' đã tồn tại!"
                );
            }


            em.createNativeQuery("INSERT INTO openremote.source " +
                            "(id ,name , description, realm_name, created_by, created_at) " +
                            "VALUES (?,?,?,?,?, CURRENT_TIMESTAMP)"
                    )
                    .setParameter(1, source.getId())
                    .setParameter(2, source.getName())
                    .setParameter(3, source.getDescription())
                    .setParameter(4, source.getRealmName())
                    .setParameter(5, source.getCreatedBy())
                    .executeUpdate();

            return source;
        });
    }

    public Source updateSource(Source source) {
        return persistenceService.doReturningTransaction(em -> {

            if (source.getName() == null || source.getName().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên nguồn không được để trống!"
                );
            }

            Query nameCheckQuery = em.createNativeQuery(
                    "SELECT 1 FROM openremote.source WHERE name = :name AND is_deleted = false AND id <> :id"
            );
            nameCheckQuery.setParameter("name", source.getName());
            nameCheckQuery.setParameter("id", source.getId());

            if (!nameCheckQuery.getResultList().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên nguồn '" + source.getName() + "' đã tồn tại!");
            }



            em.createNativeQuery("UPDATE openremote.source SET " +
                            "name = ?, " +
                            "description = ?, " +
                            "updated_by = ?, " +
                            "updated_at = CURRENT_TIMESTAMP " +
                            "WHERE id = ?")

                    .setParameter(1, source.getName())
                    .setParameter(2, source.getDescription())
                    .setParameter(3, source.getUpdatedBy())
                    .setParameter(4, source.getId())
                    .executeUpdate();
            return source;
        });
    }

    public boolean deleteSource(String sourceID) {
        return persistenceService.doReturningTransaction(em -> {

            Long count = ((Number) em.createNativeQuery(
                            "SELECT (" +
                                    "   (SELECT COUNT(*) FROM channel WHERE source_id = :id) + " +
                                    "   (SELECT COUNT(*) FROM content WHERE source_id = :id) + " +
                                    "   (SELECT COUNT(*) FROM live_stream_channel WHERE source_id = :id)" +
                                    ") AS total_count"
                    )
                    .setParameter("id", sourceID)
                    .getSingleResult()).longValue();

            if (count > 0) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Không thể xóa dữ liệu! Hãy kiểm tra các bảng có liên quan");
            }

            int deleted = em.createNativeQuery(
                            "UPDATE source SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = :id"
                    )
                    .setParameter("id", sourceID)
                    .executeUpdate();

            return deleted > 0;
        });
    }
}
