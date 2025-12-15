package org.openremote.manager.sys;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.sys.SysWarningRule;

import java.util.List;

public class SysWarningRulePersistenceService extends RouteBuilder implements ContainerService {
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
                new SysWarningRuleResourceImpl(container.getService(TimerService.class), identityService, this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<SysWarningRule> getSysWarningRules(SearchFilterDTO<SysWarningRule> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery("SELECT swr.id, swr.attr_id, swr.upper_bound_value, swr.lower_bound_value, swr.warning_value, swr.active, swr.create_by, swr.update_by, sa.attr_code, sa.attr_name, swr.create_date, swr.update_date, swr.value_type " +
                            "FROM sys_warning_rule swr inner join sys_attributes sa on swr.attr_id = sa.id ;", SysWarningRule.class);

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                results.setMaxResults(searchFilterDTO.getSize());
                results.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }


            return (List<SysWarningRule>) results.getResultList();
        });
    }

    public Long getCountSysWarningRules() {
        return persistenceService.doReturningTransaction(em -> {
            Long results = (Long) em.createNativeQuery("SELECT count (*) " +
                    "FROM sys_warning_rule;")
                    .getSingleResult();

            return results;
        });
    }
}
