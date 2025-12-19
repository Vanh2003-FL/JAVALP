package org.openremote.manager.sys;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;

import java.util.ArrayList;
import java.util.List;

public class SysAssetTypeAttrPersistenceService extends RouteBuilder implements ContainerService {

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

    public List<Long> getListAttr(Long typeId) {
        List<Long> longs = new ArrayList<Long>();

        longs = persistenceService.doReturningTransaction(em -> {
            return em
                    .createNativeQuery("SELECT ta.attr_id FROM sys_asset_type_attr ta WHERE ta.asset_type_id = :typeId", Long.class)
                    .setParameter("typeId", typeId)
                    .getResultList();
        });
        return longs;
    }

}
