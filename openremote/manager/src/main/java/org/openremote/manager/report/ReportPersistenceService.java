package org.openremote.manager.report;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;

public class ReportPersistenceService extends RouteBuilder implements ContainerService {

    protected PersistenceService persistenceService;

    @Override
    public void configure() throws Exception {

    }

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }
}
