package org.openremote.manager.playlist;

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
import org.openremote.model.playlist.Playlist;
import org.openremote.model.security.User;

import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

public class PlaylistService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(PlaylistService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new PlaylistImpl(
                container.getService(TimerService.class),
                identityService,
                persistenceService,
                this
        ));
    }

    @Override public void start(Container container) {}
    @Override public void stop(Container container) {}
    @Override public void configure() {}

    /* ================= CREATE ================= */

    public Playlist create(Playlist playlist, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String id = UUID.randomUUID().toString();
            String createdBy = user != null ? user.getId() : "admin";

            em.createNativeQuery(
                            "INSERT INTO playlist " +
                                    "(id, name, realm_name, area_id, shared, description, created_by, created_at, is_deleted) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, now(), false)")
                    .setParameter(1, id)
                    .setParameter(2, playlist.getName())
                    .setParameter(3, playlist.getRealmName())
                    .setParameter(4, playlist.getAreaId())
                    .setParameter(5, playlist.getShared())
                    .setParameter(6, playlist.getDescription())
                    .setParameter(7, createdBy)
                    .executeUpdate();

            playlist.setId(id);
            playlist.setCreatedBy(createdBy);

            return playlist;
        });
    }

    /* ================= UPDATE ================= */

    public Playlist update(Playlist playlist, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = user != null ? user.getId() : "admin";

            em.createNativeQuery(
                            "UPDATE playlist SET " +
                                    "name = ?, realm_name = ?, area_id = ?, shared = ?, description = ?, " +
                                    "updated_by = ?, updated_at = now() " +
                                    "WHERE id = ? AND is_deleted = false")
                    .setParameter(1, playlist.getName())
                    .setParameter(2, playlist.getRealmName())
                    .setParameter(3, playlist.getAreaId())
                    .setParameter(4, playlist.getShared())
                    .setParameter(5, playlist.getDescription())
                    .setParameter(6, updatedBy)
                    .setParameter(7, playlist.getId())
                    .executeUpdate();

            playlist.setUpdatedBy(updatedBy);
            return playlist;
        });
    }

    /* ================= LIST ================= */

    public List<Playlist> getPlaylist(SearchFilterDTO dto) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder sql = new StringBuilder(
                    "SELECT p.id, p.name, p.realm_name, p.area_id, p.shared, " +
                            "p.description, p.created_by, p.created_at, p.updated_by, " +
                            "p.updated_at, p.is_deleted, " +
                            "COALESCE(TO_CHAR(SUM(c.duration_file), 'HH24:MI:SS'), '00:00:00') as totalDurationFile " +
                            "FROM playlist p " +
                            "LEFT JOIN content c ON p.id = c.playlist_id AND c.is_deleted = false " +
                            "WHERE p.is_deleted = false"
            );

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND p.name ILIKE :kw");
            }

            sql.append(" GROUP BY p.id, p.name, p.realm_name, p.area_id, p.shared, " +
                    "p.description, p.created_by, p.created_at, p.updated_by, " +
                    "p.updated_at, p.is_deleted");
            sql.append(" ORDER BY p.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), Playlist.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("kw", "%" + dto.getKeyWord() + "%");
            }

            if (dto.getSize() != null && dto.getPage() != null) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return query.getResultList();
        });
    }

    /* ================= GET BY ID ================= */

    public Playlist getById(String id) {
        return persistenceService.doReturningTransaction(em -> {

            List<Playlist> list = em.createNativeQuery(
                            "SELECT * FROM playlist WHERE id = :id AND is_deleted = false",
                            Playlist.class)
                    .setParameter("id", id)
                    .getResultList();

            return list.isEmpty() ? null : list.get(0);
        });
    }

    /* ================= DELETE (SOFT) ================= */

    public boolean deletePlaylist(String id) {
        return persistenceService.doReturningTransaction(em -> {

            int updated = em.createNativeQuery(
                            "UPDATE playlist SET is_deleted = true, updated_at = now() WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();

            return updated > 0;
        });
    }
}
