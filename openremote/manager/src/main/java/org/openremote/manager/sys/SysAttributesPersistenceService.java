package org.openremote.manager.sys;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.sys.SysAttributes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SysAttributesPersistenceService extends RouteBuilder implements ContainerService {

    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;

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
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {
    }

    public SysAttributes getById(Long id) {
        Object[] result = (Object[]) persistenceService.doReturningTransaction(em -> {
//            return em.createNativeQuery("select id, attr_code, attr_code_name, attr_data_type, " +
//                            "active, create_date, create_by, update_date, update_by from sys_attributes where id = :id and active is true")
//                    .setParameter("id", id)
//                    .getSingleResult();
            List results = em.createNativeQuery("select id, attr_code, attr_code_name, attr_data_type, " +
                            "active from sys_attributes where id = :id and active is true")
                    .setParameter("id", id)
                    .getResultList();
            return results.isEmpty() ? null : results.get(0);
        });

        SysAttributes sysAttributes = new SysAttributes();
        sysAttributes.setId((Long) result[0]);
        sysAttributes.setAttrCode((String) result[1]);
        sysAttributes.setAttrCodeName((String) result[2]);
        sysAttributes.setAttrDataType((String) result[3]);
        sysAttributes.setActive((Boolean) result[4]);
//        sysAttributes.setCreateDate((LocalDateTime) result[5]);
//        sysAttributes.setCreateBy((String) result[6]);
//        sysAttributes.setUpdateDate((LocalDateTime) result[7]);
//        sysAttributes.setUpdateBy((String) result[8]);

        return sysAttributes;
    }

    public SysAttributes get(Long id) {
        return persistenceService.doReturningTransaction(em -> {
            SysAttributes attribute = em.find(SysAttributes.class, id);
            if (attribute == null) {
                throw new RuntimeException("User not found with id: " + id);
            }
            return attribute;
        });
    }

    public List<SysAttributes> getAttributesByListId(List<Long> longs) {
        List<SysAttributes> sysAttributeslist = new ArrayList<>();
        for (Long id : longs) {
            SysAttributes sysAttributes = getById(id);
            if ((sysAttributes != null) || (sysAttributes.getId() == null)) {
                sysAttributeslist.add(sysAttributes);
            }
        }
        return sysAttributeslist;
    }

//    public List<SysAttributes> getAllByType(Long id) {
//
//    }

}
