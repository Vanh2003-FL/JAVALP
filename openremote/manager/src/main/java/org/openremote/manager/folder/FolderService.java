package org.openremote.manager.folder;

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
import org.openremote.model.folder.Folder;
import org.openremote.model.security.User;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

public class FolderService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(FolderService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new FolderImpl(
                container.getService(TimerService.class),
                identityService,
                persistenceService,
                this
        ));
    }

    @Override public void start(Container container) {}
    @Override public void stop(Container container) {}
    @Override public void configure() {}

    /* ============================ CREATE ============================ */

    public Folder create(Folder folder, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String id = UUID.randomUUID().toString();
            String createdBy = user != null ? user.getId() : "admin";

            em.createNativeQuery(
                            "INSERT INTO folder " +
                                    "(id, name, realm_name, parent_id, path, description, created_by, created_at, is_deleted) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, now(), false)")
                    .setParameter(1, id)
                    .setParameter(2, folder.getName())
                    .setParameter(3, folder.getRealmName())
                    .setParameter(4, folder.getParentId())
                    .setParameter(5, folder.getPath())
                    .setParameter(6, folder.getDescription())
                    .setParameter(7, createdBy)
                    .executeUpdate();

            folder.setId(id);
            folder.setCreatedBy(createdBy);
            folder.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            folder.setIsDeleted(false);

            return folder;
        });
    }

    /* ============================ UPDATE ============================ */

    public Folder update(Folder folder, User user) {
        return persistenceService.doReturningTransaction(em -> {

            String updatedBy = user != null ? user.getId() : "admin";

            em.createNativeQuery(
                            "UPDATE folder SET " +
                                    "name = ?, realm_name = ?, parent_id = ?, path = ?, description = ?, " +
                                    "updated_by = ?, updated_at = now() " +
                                    "WHERE id = ?")
                    .setParameter(1, folder.getName())
                    .setParameter(2, folder.getRealmName())
                    .setParameter(3, folder.getParentId())
                    .setParameter(4, folder.getPath())
                    .setParameter(5, folder.getDescription())
                    .setParameter(6, updatedBy)
                    .setParameter(7, folder.getId())
                    .executeUpdate();

            folder.setUpdatedBy(updatedBy);
            folder.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            return folder;
        });
    }

    /* ============================ GET LIST ============================ */

    public List<Folder> getFolder(SearchFilterDTO<Folder> dto) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT * FROM folder f WHERE f.is_deleted = false"
            );

            if (validationUtils.isValid(dto.getKeyWord())) {
                sql.append(" AND f.name ILIKE :keyword");
            }

            sql.append(" ORDER BY f.created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), Folder.class);

            if (validationUtils.isValid(dto.getKeyWord())) {
                query.setParameter("keyword", "%" + dto.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(dto.getSize()) && validationUtils.isValid(dto.getPage())) {
                query.setMaxResults(dto.getSize());
                query.setFirstResult((dto.getPage() - 1) * dto.getSize());
            }

            return query.getResultList();
        });
    }

    /* ============================ GET BY ID ============================ */

    public Folder getById(String id) {
        return persistenceService.doReturningTransaction(em -> {

            List<Folder> result = em.createNativeQuery(
                            "SELECT * FROM folder f WHERE f.id = :id AND f.is_deleted = false",
                            Folder.class)
                    .setParameter("id", id)
                    .getResultList();

            return result.isEmpty() ? null : result.get(0);
        });
    }

    /* ============================ DELETE ============================ */

    public boolean deleteFolder(String id) {
        return persistenceService.doReturningTransaction(em -> {

            int updated = em.createNativeQuery(
                            "UPDATE folder SET is_deleted = true, updated_at = now() WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();

            return updated > 0;
        });
    }
}
