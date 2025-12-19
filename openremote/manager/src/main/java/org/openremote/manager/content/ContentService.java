package org.openremote.manager.content;

import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.content.Content;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.security.User;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

public class ContentService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ContentService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new ContentImpl(
                container.getService(TimerService.class),
                identityService,
                persistenceService,
                this
        ));
    }

    @Override public void start(Container container) {}
    @Override public void stop(Container container) {}
    @Override public void configure() {}

    /* ============================================================
                               CREATE
       ============================================================ */
    public Content create(Content content, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String createdBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            String id = UUID.randomUUID().toString();

            em.createNativeQuery(
                            "INSERT INTO content (" +
                                    "id, name, realm_name, file_name, file_type, file_path, " +
                                    "size_file, duration_file, source_id, channel_id, folder_id, playlist_id, " +
                                    "created_by, created_at, is_deleted) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS interval), ?, ?, ?, ?, ?, now(), false)")
                    .setParameter(1, id)
                    .setParameter(2, content.getName())
                    .setParameter(3, content.getRealmName())
                    .setParameter(4, content.getFileName())
                    .setParameter(5, content.getFileType())
                    .setParameter(6, content.getFilePath())
                    .setParameter(7, content.getSizeFile())
                    .setParameter(8, content.getDurationFile())
                    .setParameter(9, content.getSourceId())
                    .setParameter(10, content.getChannelId())
                    .setParameter(11, content.getFolderId())
                    .setParameter(12, content.getPlaylistId())
                    .setParameter(13, createdBy)
                    .executeUpdate();

            content.setId(id);
            content.setCreatedBy(createdBy);
            content.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            content.setIsDeleted(false);

            return content;
        });
    }

    /* ============================================================
                               UPDATE
       ============================================================ */
    public Content update(Content content, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = (user != null && user.getId() != null)
                    ? user.getId()
                    : "admin";

            em.createNativeQuery(
                            "UPDATE content SET " +
                                    "name = ?, realm_name = ?, file_name = ?, file_type = ?, file_path = ?, " +
                                    "size_file = ?, duration_file = CAST(? AS interval), source_id = ?, channel_id = ?, " +
                                    "folder_id = ?, playlist_id = ?, updated_by = ?, updated_at = now() " +
                                    "WHERE id = ? AND is_deleted = false")
                    .setParameter(1, content.getName())
                    .setParameter(2, content.getRealmName())
                    .setParameter(3, content.getFileName())
                    .setParameter(4, content.getFileType())
                    .setParameter(5, content.getFilePath())
                    .setParameter(6, content.getSizeFile())
                    .setParameter(7, content.getDurationFile())
                    .setParameter(8, content.getSourceId())
                    .setParameter(9, content.getChannelId())
                    .setParameter(10, content.getFolderId())
                    .setParameter(11, content.getPlaylistId())
                    .setParameter(12, updatedBy)
                    .setParameter(13, content.getId())
                    .executeUpdate();

            content.setUpdatedBy(updatedBy);
            content.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            return content;
        });
    }

    /* ============================================================
                               GET LIST
       ============================================================ */
    public List<Content> getMdContent(SearchFilterDTO<Content> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder("""
            SELECT
                c.id,
                c.name,
                c.realm_name,
                c.file_name,
                c.file_type,
                c.file_path,
                c.size_file,
                CAST(c.duration_file AS text) AS duration_file,
                c.source_id,
                c.channel_id,
                c.folder_id,
                c.playlist_id,
                c.created_by,
                c.created_at,
                c.updated_by,
                c.updated_at,
                c.is_deleted
            FROM content c
            WHERE c.is_deleted = false
        """);



            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND c.name ILIKE :kw");
            }

            sql.append(" ORDER BY c.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), Content.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("kw", "%" + dto.getKeyWord().trim() + "%");
            }

            if (dto.getSize() != null && dto.getPage() != null) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return query.getResultList();
        });
    }

    /* ============================================================
                               GET BY ID
       ============================================================ */
    public Content getById(String id) {
        return persistenceService.doReturningTransaction(em -> {

            List<Content> list = em.createNativeQuery("""
            SELECT
                c.id,
                c.name,
                c.realm_name,
                c.file_name,
                c.file_type,
                c.file_path,
                c.size_file,
                CAST(c.duration_file AS text) AS duration_file,
                c.source_id,
                c.channel_id,
                c.folder_id,
                c.playlist_id,
                c.created_by,
                c.created_at,
                c.updated_by,
                c.updated_at,
                c.is_deleted
            FROM content c
            WHERE c.id = :id
              AND c.is_deleted = false
        """, Content.class)
                            .setParameter("id", id)
                            .getResultList();


            return list.isEmpty() ? null : list.get(0);
        });
    }

    /* ============================================================
                               DELETE (SOFT)
       ============================================================ */
    public boolean deleteMdContent(String id) {
        return persistenceService.doReturningTransaction(em -> {

            int updated = em.createNativeQuery(
                            "UPDATE content SET is_deleted = true, updated_at = now() WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();

            return updated > 0;
        });
    }
}
