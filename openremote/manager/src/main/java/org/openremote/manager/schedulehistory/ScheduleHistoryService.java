package org.openremote.manager.schedulehistory;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.message.MessageBrokerSetupService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;

import static org.apache.camel.builder.PredicateBuilder.and;
import static org.openremote.container.web.WebService.pathStartsWithPredicate;
import static org.openremote.manager.web.ManagerWebService.API_PATH;

public class ScheduleHistoryService extends RouteBuilder implements ContainerService {

    public static final String SCHEDULE_HISTORY_ROUTE_ID = "ScheduleHistory";

    protected ManagerIdentityService identityService;
    protected ScheduleHistoryPersistenceService scheduleHistoryPersistenceService;

    @Override
    public void init(Container container) throws Exception {
        identityService = container.getService(ManagerIdentityService.class);
        scheduleHistoryPersistenceService = container.getService(ScheduleHistoryPersistenceService.class);
    }

    @Override
    public void start(Container container) throws Exception {
        container.getService(MessageBrokerSetupService.class).getContext().addRoutes(this);
    }

    @Override
    public void stop(Container container) throws Exception {
        // Cleanup if needed
    }

    @Override
    public void configure() throws Exception {
        from("direct:" + SCHEDULE_HISTORY_ROUTE_ID)
                .routeId(SCHEDULE_HISTORY_ROUTE_ID)
                .choice()
                .when(and(pathStartsWithPredicate(API_PATH + "/schedule-history")))
                .to("direct:scheduleHistoryApi")
                .endChoice();

        from("direct:scheduleHistoryApi")
                .bean(ScheduleHistoryResourceImpl.class);
    }

    @Override
    public int getPriority() {
        return ContainerService.DEFAULT_PRIORITY;
    }
}
