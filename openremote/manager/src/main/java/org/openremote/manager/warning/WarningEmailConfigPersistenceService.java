package org.openremote.manager.warning;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.warning.WarningEmailConfig;

import java.util.List;

import static java.time.LocalDate.now;

public class WarningEmailConfigPersistenceService extends RouteBuilder implements ContainerService {
    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

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

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new WarningEmailConfigResourceImpl(container.getService(TimerService.class), identityService, this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<?> getWarningIdByAttributeName(String attributeName) {
        StringBuilder sqlBase = new StringBuilder("SELECT swr.id FROM sys_warning_rule swr JOIN sys_attributes sa ON swr.attr_id=sa.id WHERE sa.attr_code_name=? ");
        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery(sqlBase.toString())
                    .setParameter(1, attributeName);

            return (List<?>) results.getResultList();
        });

    }
    public List<WarningEmailConfig> getWarningEmailConfigList(String realm, Long warningId, SearchFilterDTO<WarningEmailConfig> searchFilterDTO) {
        StringBuilder sqlBase = new StringBuilder("SELECT wec.id, ra.value as realm, wec.email, wec.fullname, wec.upper_bound_value, wec.lower_bound_value, wec.warning_value, wec.sys_warning_id, wec.start_date, wec.active, wec.create_date, wec.create_by, wec.update_date, wec.update_by, swr.value_type \n" +
                "FROM warning_email_config wec right join public.realm r on r.name = wec.realm" +
                " inner join sys_warning_rule swr on swr.id = wec.sys_warning_id " +
                " inner join PUBLIC.REALM_ATTRIBUTE ra on ra.REALM_ID = r.id and ra.name = 'displayName'" +
                " where wec.realm = ? and wec.sys_warning_id = ? order by create_date desc;");
        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery(sqlBase.toString(), WarningEmailConfig.class)
                    .setParameter(1, realm)
                    .setParameter(2, warningId);

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                results.setMaxResults(searchFilterDTO.getSize());
                results.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }


            return (List<WarningEmailConfig>) results.getResultList();
        });
    }

    public Long getCountWarningEmailConfigList(String realm, Long warningId) {
        StringBuilder sqlBase = new StringBuilder("SELECT count(id) " +
                "FROM warning_email_config where realm = ? and sys_warning_id = ?;");
        return persistenceService.doReturningTransaction(em -> {
            Long results = (Long) em.createNativeQuery(sqlBase.toString())
                    .setParameter(1, realm)
                    .setParameter(2, warningId)
                    .getSingleResult();

            return results;
        });
    }



    public WarningEmailConfig create(WarningEmailConfig config) {

        try {
            return persistenceService.doReturningTransaction(em -> {
                Long id = (Long) em.createNativeQuery("INSERT INTO warning_email_config " +
                                "(realm, email, fullname, upper_bound_value, lower_bound_value, warning_value, sys_warning_id, start_date, create_date, create_by, update_date, update_by) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id")
                        .setParameter(1, config.getRealm())
                        .setParameter(2, config.getEmail())
                        .setParameter(3, config.getFullName())
                        .setParameter(4, config.getUpperBoundValue())
                        .setParameter(5, config.getLowerBoundValue())
                        .setParameter(6, config.getWarningValue())
                        .setParameter(7, config.getSysWarningId())
                        .setParameter(8, config.getStartDate())
                        .setParameter(9, now())
                        .setParameter(10, config.getCreateBy())
                        .setParameter(11, config.getUpdateDate())
                        .setParameter(12, config.getUpdateBy())
                        .getSingleResult();
                config.setId(id);

                return config;
            });
            } catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }

    public WarningEmailConfig update(WarningEmailConfig config) {

        try {
            return persistenceService.doReturningTransaction(em -> {
             em.createNativeQuery("update warning_email_config set " +
                                " realm = ? , email = ?, fullname = ?, upper_bound_value = ?, lower_bound_value = ?, warning_value = ?, sys_warning_id = ?, start_date = ?, update_date = ?, update_by = ? " +
                        " where id = ?")
                        .setParameter(1, config.getRealm())
                        .setParameter(2, config.getEmail())
                        .setParameter(3, config.getFullName())
                        .setParameter(4, config.getUpperBoundValue())
                        .setParameter(5, config.getLowerBoundValue())
                        .setParameter(6, config.getWarningValue())
                        .setParameter(7, config.getSysWarningId())
                        .setParameter(8, config.getStartDate())
                        .setParameter(9, now())
                        .setParameter(10, config.getUpdateBy())
                        .setParameter(11, config.getId())
                        .executeUpdate();
                return config;
            });
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }


    public boolean delete(Long id) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "DELETE FROM warning_email_config WHERE id = ?"
                    )
                    .setParameter(1, id)
                    .executeUpdate();

            if (updatedRows > 0) {
                em.createNativeQuery(
                                "DELETE FROM warning_email_route WHERE warning_email_id = ?"
                        )
                        .setParameter(1, id)
                        .executeUpdate();
            }

            return updatedRows > 0;
        });
    }
}
