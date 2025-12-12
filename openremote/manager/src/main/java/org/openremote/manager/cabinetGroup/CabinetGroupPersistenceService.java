package org.openremote.manager.cabinetGroup;

import jakarta.persistence.EntityManager;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.cabinetGroup.CabinetGroup;
import org.openremote.model.cabinetGroup.CabinetGroupLight;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class CabinetGroupPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;


    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new CabinetGroupResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    @Override
    public void configure() throws Exception {

    }

    public List<CabinetGroup> getAll(String assetId) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "\n" +
                    "SELECT cabinet_grp_id, cabinet_grp_code, cabinet_grp_name, active, create_date, create_by, update_date, update_by \n" +
                    "FROM sys_cabinet_group where cabinet_grp_id not in (\n" +
                    "select scg.cabinet_grp_id from asset_cabinet ac inner join asset_cabinet_group acg on acg.id = ac.cabinet_grp_id \n" +
                    "inner join sys_cabinet_group scg on acg.cabinet_grp_id = scg.cabinet_grp_id \n" +
                    "where ac.cabinet_id = :assetId)";
            var query = em.createNativeQuery(baseQuery, CabinetGroup.class)
                    .setParameter("assetId", assetId);

            return (List<CabinetGroup>) query.getResultList();
        });
    }

    public List<CabinetGroupLight> getCabinetGroupByCabinet(String assetId) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "select scg.cabinet_grp_id, scg.cabinet_grp_code, scg.cabinet_grp_name, scg.active, scg.create_date, scg.create_by, scg.update_date, scg.update_by from asset_cabinet ac inner join asset_cabinet_group acg on acg.id = ac.cabinet_grp_id \n" +
                    "inner join sys_cabinet_group scg on acg.cabinet_grp_id = scg.cabinet_grp_id \n" +
                    "where ac.cabinet_id = :assetId";
            var query = em.createNativeQuery(baseQuery, CabinetGroup.class)
                    .setParameter("assetId", assetId);

            List<CabinetGroup> cabinetGroupList =(List<CabinetGroup>) query.getResultList();

            List<CabinetGroupLight>  cabinetGroupLights = new ArrayList<>();
            for (CabinetGroup cabinetGroup : cabinetGroupList) {
                CabinetGroupLight light = new CabinetGroupLight();
                CabinetGroupLight cabinetGroupLight = getCabinetGroupName(em, assetId, cabinetGroup.getId());
                cabinetGroupLight.setCabinetGroup(cabinetGroup);
                cabinetGroupLights.add(cabinetGroupLight);
            }

            return cabinetGroupLights;
        });
    }

    private CabinetGroupLight getCabinetGroupName(EntityManager em, String assetId, Long cabinetGroupId) {
        List<Object[]> resultList = em.createNativeQuery("""
        SELECT
            a.name,
            (
                SELECT COUNT(*)
                FROM asset al
                WHERE al.path ~ CAST(('*.' || a.id || '.*') AS lquery)
                  AND al.type = 'LightAsset'
            ) AS count_light,
            a.id
        FROM asset a
        INNER JOIN asset_cabinet_group acg ON a.id = acg.asset_id
        WHERE acg.asset_id IN (
            SELECT acg.asset_id
            FROM asset_cabinet ac
            INNER JOIN asset_cabinet_group acg ON acg.id = ac.cabinet_grp_id
            WHERE ac.cabinet_id = :assetId 
              AND acg.cabinet_grp_id = :cabinetGroupId
        );
    """)
                .setParameter("assetId", assetId)
                .setParameter("cabinetGroupId", cabinetGroupId)
                .getResultList();

        if (resultList.isEmpty()) {
            return new CabinetGroupLight();
        }

        Object[] result = resultList.get(0);

        String assetName = (String) result[0];
        int countLight = ((Number) result[1]).intValue();
        String idCabinetGroup = (String) result[2];

        return new CabinetGroupLight(countLight, assetName, idCabinetGroup);
    }
}
