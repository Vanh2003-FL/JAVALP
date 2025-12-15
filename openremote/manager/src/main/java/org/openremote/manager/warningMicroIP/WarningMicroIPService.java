package org.openremote.manager.warningMicroIP;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.warningMicroIP.WarningMicroIP;
import org.openremote.model.security.User;

import jakarta.persistence.Query;
import org.openremote.model.warningMicroIP.WarningMicroIPResource;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class WarningMicroIPService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void configure() throws Exception {

    }

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);
        managerWebService.addApiSingleton(new WarningMicroIPImpl(
                container.getService(TimerService.class), identityService, persistenceService, this));
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<WarningMicroIP> getAllWarningMicroIP(SearchFilterDTO<WarningMicroIP> dto, User user) {
        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder(
                    "SELECT mid.id, mid.device_code, mid.device_name, mid.is_locked,\n" +
                            "       a.name AS area_name, mid.realm_name,\n" +
                            "       mid.created_by, mid.created_at\n" +
                            "FROM openremote.micro_ip_device mid\n" +
                            "JOIN openremote.area a \n" +
                            "      ON mid.area_id = a.id  \n" +
                            "WHERE mid.is_deleted = false \n" +
                            "  AND mid.realm_name = :realm"
            );


            Map<String, Object> params = new HashMap<>();

            params.put("realm", user.getRealm());

            if (dto != null && dto.getKeyWord() != null && !dto.getKeyWord().isEmpty()) {
                sql.append(" AND (mid.device_code LIKE :kw OR mid.device_name LIKE :kw) ");
                params.put("kw", "%" + dto.getKeyWord() + "%");
            }

            if (dto != null && dto.getData() != null) {
                WarningMicroIP f = dto.getData();

                if (f.getIs_locked() != null) {
                    sql.append(" AND mid.is_locked = :is_locked ");
                    params.put("is_locked", f.getIs_locked());
                }
            }

            Query query = em.createNativeQuery(sql.toString());
            params.forEach(query::setParameter);

            List<Object[]> rows = query.getResultList();
            List<WarningMicroIP> result = new ArrayList<>();

            for (Object[] r : rows) {
                WarningMicroIP item = new WarningMicroIP();

                item.setId((String) r[0]);
                item.setDevice_code((String) r[1]);
                item.setDevice_name((String) r[2]);
                item.setIs_locked((Boolean) r[3]);
                item.setArea_name((String) r[4]);
                item.setRealm_name((String) r[5]);
                item.setCreate_by((String) r[6]);
                item.setCreate_at((Timestamp) r[7]);

                result.add(item);
            }

            return result;
        });
    }



    public WarningMicroIP createWarningMicroIP(WarningMicroIP warningMicroIP) {
        return persistenceService.doReturningTransaction(em -> {

            Query areaQuery = em.createNativeQuery("SELECT id FROM openremote.area WHERE name = :name");
            areaQuery.setParameter("name", warningMicroIP.getArea_name());
            Object areaIdObj = areaQuery.getSingleResult();



            em.createNativeQuery(
                            "INSERT INTO micro_ip_device " +
                                    "(id, device_code, device_name, is_locked, area_id, realm_name, created_by, created_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                    )
                    .setParameter(1, warningMicroIP.getId())
                    .setParameter(2, warningMicroIP.getDevice_code())
                    .setParameter(3, warningMicroIP.getDevice_name())
                    .setParameter(4, warningMicroIP.getIs_locked())
                    .setParameter(5, areaIdObj)
                    .setParameter(6, warningMicroIP.getRealm_name())
                    .setParameter(7, warningMicroIP.getCreate_by())
                    .executeUpdate();


            em.createNativeQuery(
                            "INSERT INTO asset " +
                                    "(id, created_on, name, realm, type, access_public_read, version) " +
                                    "VALUES (?, CURRENT_TIMESTAMP, ?, ?,?, ?, ?)"
                    )
                    .setParameter(1, warningMicroIP.getId())
                    .setParameter(2, warningMicroIP.getDevice_name())
                    .setParameter(3, warningMicroIP.getRealm_name())
                    .setParameter(4, "micro ip")
                    .setParameter(5, true)
                    .setParameter(6, 3)
                    .executeUpdate();


            return warningMicroIP;
        });
    }



    public WarningMicroIP updateWarningMicroIP(WarningMicroIP warningMicroIP){
        return persistenceService.doReturningTransaction(em -> {

            Query areaQuery = em.createNativeQuery("SELECT id FROM openremote.area WHERE name = :name");
            areaQuery.setParameter("name", warningMicroIP.getArea_name());
            Object areaIdObj = areaQuery.getSingleResult();


            em.createNativeQuery(
                            "UPDATE micro_ip_device " +
                                    "SET  is_locked = ?, area_id = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP " +
                                    "WHERE id = ?"
                    )
                    .setParameter(1, warningMicroIP.getIs_locked())
                    .setParameter(2, areaIdObj)
                    .setParameter(3, warningMicroIP.getUpdate_by())
                    .setParameter(4, warningMicroIP.getId())
                    .executeUpdate();

            return warningMicroIP;
        });
    }


    public boolean deleteWarningMicroIP(String warningMicroIP){
        return persistenceService.doReturningTransaction(em ->{
            int delete = em.createNativeQuery(
                            "UPDATE micro_ip_device " +
                                    "SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP " +
                                    "WHERE id = :id"
                    )
                    .setParameter("id", warningMicroIP)
                    .executeUpdate();

            int deleteAsset = em.createNativeQuery(
                            "UPDATE asset " +
                                    "SET is_deleted = TRUE " +
                                    "WHERE id = :id"
                    )
                    .setParameter("id", warningMicroIP)
                    .executeUpdate();

            return delete > 0 ;
        });
    }
}
