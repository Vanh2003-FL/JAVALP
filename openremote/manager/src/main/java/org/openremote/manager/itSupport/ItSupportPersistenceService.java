package org.openremote.manager.itSupport;

import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.notification.PushNotificationHandler;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.itSupport.Attachment;
import org.openremote.model.itSupport.ItSupport;
import org.openremote.model.itSupport.ItSupportLog;
import org.openremote.model.province.ProvinceExceptionMapper;
import org.openremote.model.security.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.openremote.model.Constants.STATUS_NEW;

public class ItSupportPersistenceService extends RouteBuilder implements ContainerService {
    public static final int PRIORITY = DEFAULT_PRIORITY;
    protected MessageBrokerService messageBrokerService;
    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;
    protected PushNotificationHandler pushNotificationHandler;
    @Override
    public int getPriority() {
        return PRIORITY;
    }

    @Override
    public void configure() throws Exception {
    }

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);
        messageBrokerService= container.getService(MessageBrokerService.class);
        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new ItSupportResourceImpl(container.getService(TimerService.class), identityService, this,messageBrokerService)
        );

        managerWebService.addApiSingleton(
                new ProvinceExceptionMapper()
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public ItSupport createItSupport(ItSupport itSupport, User user, User assignerAdmin) {
        String generatedId = UUID.randomUUID().toString().replace("-", "");
        itSupport.setId(generatedId);
        itSupport.setStatus(STATUS_NEW);
        LocalDateTime now = LocalDateTime.now();
        String formattedCode = String.format("HM-%02d%02d-%02d-%02d-%d",
                now.getHour(), now.getMinute(),
                now.getDayOfMonth(), now.getMonthValue(), now.getYear());
        itSupport.setCode(formattedCode);
        persistenceService.doReturningTransaction(em -> {
            String builder = "INSERT INTO it_support " +
                    "(id, name, code, assigned_user, status, entity_type, note, description, realm_id, created_by, created_at) " +
                    "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            em.createNativeQuery(builder)
                    .setParameter(1, itSupport.getId())
                    .setParameter(2, itSupport.getName())
                    .setParameter(3, itSupport.getCode())
                    .setParameter(4, assignerAdmin.getId())
                    .setParameter(5, itSupport.getStatus())
                    .setParameter(6, itSupport.getEntityType())
                    .setParameter(7, itSupport.getNote())
                    .setParameter(8, itSupport.getDescription())
                    .setParameter(9, user.getRealmId())
                    .setParameter(10, user.getId())
                    .executeUpdate();
           return null;
        });
        return itSupport;
    }

    public ItSupport createUpdateItSupport(ItSupport itSupport, User user) {
        persistenceService.doReturningTransaction(em -> {
            String builder = "UPDATE it_support\n" +
                    "SET status= ?, entity_type= ?, note= ?, updated_by= ?, updated_at = CURRENT_TIMESTAMP\n" +
                    "WHERE id= ?;";
            em.createNativeQuery(builder)
                    .setParameter(1, itSupport.getStatus())
                    .setParameter(2, itSupport.getEntityType())
                    .setParameter(3, itSupport.getNote())
                    .setParameter(4, user.getId())
                    .setParameter(5, itSupport.getId())
                    .executeUpdate();
           return null;
        });
        return itSupport;
    }

    public ItSupport updateAssignUser(ItSupport itSupport) {
        persistenceService.doReturningTransaction(em -> {
            String builder = "UPDATE it_support " +
                    "SET assigned_user = ? " +
                    "WHERE id= ?;";
            em.createNativeQuery(builder)
                    .setParameter(1, itSupport.getAssignedUser())
                    .setParameter(2, itSupport.getId())
                    .executeUpdate();
            return null;
        });
        return itSupport;
    }

    public List<Attachment> createAttachments(ItSupport itSupport, User user) {
        persistenceService.doReturningTransaction(em -> {
            String sql = "INSERT INTO attachments " +
                    "(id, entity_id, entity_name, file_name, file_path, file_size, mime_type, created_by, created_at) " +
                    "VALUES(?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

            if (itSupport.getAttachments() != null && !itSupport.getAttachments().isEmpty()) {
                for (Attachment attachment : itSupport.getAttachments()) {
                    String generatedId = UUID.randomUUID().toString().replace("-", "");
                    attachment.setId(generatedId);
                    em.createNativeQuery(sql)
                            .setParameter(1, attachment.getId())
                            .setParameter(2, itSupport.getId())
                            .setParameter(3, itSupport.getName())
                            .setParameter(4, attachment.getFileName())
                            .setParameter(5, attachment.getFilePath())
                            .setParameter(6, attachment.getFileSize())
                            .setParameter(7, attachment.getMimeType())
                            .setParameter(8, user.getId())
                            .executeUpdate();
                }
            }

            return null;
        });

        return itSupport.getAttachments();
    }

    public ItSupportLog insertItSupportLog(ItSupport itSupport, User user, String assigner) {
        String id = UUID.randomUUID().toString().replace("-", "");
        ItSupportLog itSupportLog = new ItSupportLog();
        itSupportLog.setId(id);
        persistenceService.doReturningTransaction(em -> {
            String builder = "INSERT INTO it_support_log " +
                    "(id, id_support_id, assigned_user, status, entity_type, created_by, created_at) " +
                    "VALUES(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);";

            em.createNativeQuery(builder)
                    .setParameter(1, itSupportLog.getId())
                    .setParameter(2, itSupport.getId())
                    .setParameter(3, assigner)
                    .setParameter(4, itSupport.getStatus())
                    .setParameter(5, itSupport.getEntityType())
                    .setParameter(6, user.getId())
                    .executeUpdate();
            return null;
        });
        //
        return itSupportLog;
    }

    public List<ItSupport> getItSupport(ItSupport itSupport, Integer page, Integer pageSize, String keyword) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder baseCondition = new StringBuilder(" WHERE 1=1 ");

            String baseQuery = "SELECT \n" +
                    "  isd1_0.id,\n" +
                    "  isd1_0.assigned_user,\n" +
                    "  isd1_0.code,\n" +
                    "  isd1_0.created_at,\n" +
                    "  isd1_0.created_by,\n" +
                    "  u1.last_name AS created_by_name,\n" +
                    "  isd1_0.description,\n" +
                    "  isd1_0.entity_type,\n" +
                    "  isd1_0.name,\n" +
                    "  isd1_0.note,\n" +
                    "  r.name AS realm_name,\n" +
                    "  isd1_0.realm_id,\n" +
                    "  isd1_0.status,\n" +
                    "  isd1_0.updated_at,\n" +
                    "  isd1_0.updated_by,\n" +
                    "  u2.last_name AS updated_by_name,\n" +
                    "  u3.last_name AS assign_user_name\n" +
                    "FROM \n" +
                    "  it_support isd1_0\n" +
                    "LEFT JOIN public.user_entity u1 ON u1.id = isd1_0.created_by\n" +
                    "LEFT JOIN public.user_entity u2 ON u2.id = isd1_0.updated_by\n" +
                    "LEFT JOIN public.user_entity u3 ON u3.id = isd1_0.assigned_user\n" +
                    "LEFT JOIN public.realm r ON r.id = isd1_0.realm_id ";

            StringBuilder sql = new StringBuilder();

                if (validationUtils.isValid(itSupport.getStatus())) {
                    baseCondition.append(" AND status = :status");
                }
                if (validationUtils.isValid(itSupport.getEntityType())) {
                    baseCondition.append(" AND entity_type = :entityType");
                }
                if (validationUtils.isValid(keyword)) {
                    baseCondition.append(" AND (LOWER(name) LIKE :keyword OR LOWER(code) LIKE :keyword)");
                }
                if (validationUtils.isValid(itSupport.getAssignedUser()) && validationUtils.isValid(itSupport.getCreatedBy())) {
                    sql.append(baseQuery)
                            .append(baseCondition)
                            .append(" AND assigned_user = :assignedUser ")
                            .append("UNION ")
                            .append(baseQuery)
                            .append(baseCondition)
                            .append(" AND created_by = :createdBy ");
                } else if (validationUtils.isValid(itSupport.getAssignedUser())) {
                    baseCondition.append(" AND assigned_user = :assignedUser ");

                    sql.append(baseQuery)
                            .append(baseCondition);
                }
                else {
                    sql.append(baseQuery).append(baseCondition);
                }

            sql.append(" ORDER BY created_at DESC");

            Query query = em.createNativeQuery(sql.toString(), ItSupport.class);

            if (validationUtils.isValid(itSupport.getStatus())) {
                query.setParameter("status", itSupport.getStatus());
            }
            if (validationUtils.isValid(itSupport.getEntityType())) {
                query.setParameter("entityType", itSupport.getEntityType());
            }
            if (validationUtils.isValid(itSupport.getAssignedUser()) && validationUtils.isValid(itSupport.getCreatedBy())) {
                query.setParameter("assignedUser", itSupport.getAssignedUser());
                query.setParameter("createdBy", itSupport.getCreatedBy());
            } else if (validationUtils.isValid(itSupport.getAssignedUser())) {
                query.setParameter("assignedUser", itSupport.getAssignedUser());
            }
            if (validationUtils.isValid(keyword)) {
                query.setParameter("keyword", "%" + keyword.toLowerCase() + "%");
            }
            if (validationUtils.isValid(page) && validationUtils.isValid(pageSize)) {
                query.setFirstResult((page - 1) * pageSize);
                query.setMaxResults(pageSize);
            }
            return (List<ItSupport>) query.getResultList();
        });
    }

    public boolean isUpdateAssignUser(ItSupport itSupport) {
        String oldAssignedUser = persistenceService.doReturningTransaction(em ->
                (String) em.createNativeQuery("SELECT assigned_user FROM it_support WHERE id = ?")
                .setParameter(1, itSupport.getId())
                .getSingleResult());
        return oldAssignedUser != null && !oldAssignedUser.equals(itSupport.getAssignedUser());
    }

    public List<Attachment> getAttachmentInSupport(String itSupportId) {
        return persistenceService.doReturningTransaction(em -> {
            TypedQuery<Attachment> query = em.createQuery("select a from Attachment a where a.entityId =:id", Attachment.class)
                    .setParameter("id", itSupportId);
            return query.getResultList();
        });
    }

    public ItSupport getItSupport(String itSupportId) {
        String sql = "SELECT \n" +
                "  isd1_0.id,\n" +
                "  isd1_0.assigned_user,\n" +
                "  isd1_0.code,\n" +
                "  isd1_0.created_at,\n" +
                "  isd1_0.created_by,\n" +
                "  u1.last_name AS created_by_name,\n" +
                "  isd1_0.description,\n" +
                "  isd1_0.entity_type,\n" +
                "  isd1_0.name,\n" +
                "  isd1_0.note,\n" +
                "  r.name AS realm_name,\n" +
                "  isd1_0.realm_id,\n" +
                "  isd1_0.status,\n" +
                "  isd1_0.updated_at,\n" +
                "  isd1_0.updated_by,\n" +
                "  u2.last_name AS updated_by_name,\n" +
                "  u3.last_name AS assign_user_name\n" +

                "FROM \n" +
                "  it_support isd1_0\n" +
                "LEFT JOIN public.user_entity u1 ON u1.id = isd1_0.created_by\n" +
                "LEFT JOIN public.user_entity u2 ON u2.id = isd1_0.updated_by\n" +
                "LEFT JOIN public.user_entity u3 ON u3.id = isd1_0.assigned_user\n" +
                "LEFT JOIN public.realm r ON r.id = isd1_0.realm_id  WHERE isd1_0.id = ? \n";
        return persistenceService.doReturningTransaction(em -> {
            Query query = em.createNativeQuery(sql, ItSupport.class)
                    .setParameter(1, itSupportId);
            return (ItSupport) query.getSingleResult();
        });
    }

    public String getNameById(String userId) {
        if (userId == null) return "N/A";
        return persistenceService.doReturningTransaction(em -> {
            try {
                Object result = em.createNativeQuery(
                                "SELECT last_name || '/' || username FROM public.user_entity WHERE id = ?")
                        .setParameter(1, userId)
                        .getSingleResult();

                return result != null ? result.toString() : "N/A";
            } catch (NoResultException e) {
                return "N/A";
            }
        });
    }


}
