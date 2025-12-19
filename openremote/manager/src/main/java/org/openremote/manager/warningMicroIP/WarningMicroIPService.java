package org.openremote.manager.warningMicroIP;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.DistrictException;
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
                    "SELECT mid.id, mid.device_code, mid.device_name, mid.is_locked,mid.area_id,\n" +
                            "       a.name AS area_name,\n" +
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
            sql.append(" ORDER BY mid.created_at DESC ");



            Query query = em.createNativeQuery(sql.toString(), WarningMicroIP.class);
            params.forEach(query::setParameter);

            if (dto != null && dto.getPage() != null && dto.getSize() != null) {
                int page = dto.getPage() <= 0 ? 1 : dto.getPage();
                int size = dto.getSize() <= 0 ? 10 : dto.getSize();

                query.setFirstResult((page - 1) * size);
                query.setMaxResults(size);
            }

            return query.getResultList();
        });
    }



    public WarningMicroIP createWarningMicroIP(WarningMicroIP warningMicroIP) {
        return persistenceService.doReturningTransaction(em -> {
            if (warningMicroIP.getDevice_code() == null || warningMicroIP.getDevice_code().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Mã thiết bị (device_code) không được để trống!"
                );
            }

            if (warningMicroIP.getDevice_name() == null || warningMicroIP.getDevice_name().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên thiết bị (device_name) không được để trống!"
                );
            }



            if (warningMicroIP.getArea_id() == null || warningMicroIP.getArea_id().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Khu vực  không được để trống!"
                );
            }

            String sql = "SELECT COUNT(*) FROM micro_ip_device WHERE id = :id OR device_code = :device_code";
            Query query = em.createNativeQuery(sql);
            query.setParameter("id", warningMicroIP.getId());
            query.setParameter("device_code", warningMicroIP.getDevice_code());


            Number count = (Number) query.getSingleResult();

            if (count.intValue() > 0) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Thiết bị với id '" + warningMicroIP.getId() + "' hoặc device_code '"
                                + warningMicroIP.getDevice_code() + "' đã tồn tại!"
                );
            }


            em.createNativeQuery(
                            "INSERT INTO micro_ip_device " +
                                    "(id, device_code, device_name, is_locked, area_id, realm_name, created_by, created_at) " +
                                    "VALUES ( ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
                    )
                    .setParameter(1,warningMicroIP.getId())
                    .setParameter(2, warningMicroIP.getDevice_code())
                    .setParameter(3, warningMicroIP.getDevice_name())
                    .setParameter(4, warningMicroIP.getIs_locked())
                    .setParameter(5, warningMicroIP.getArea_id())
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

            if (warningMicroIP.getDevice_name() == null || warningMicroIP.getDevice_name().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Tên thiết bị không được để trống!"
                );
            }

            if (warningMicroIP.getArea_id() == null || warningMicroIP.getArea_id().isEmpty()) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Khu vực không được để trống!"
                );
            }

            String sql = "SELECT COUNT(*) FROM area WHERE id = :id";
            Query query = em.createNativeQuery(sql);
            query.setParameter("id", warningMicroIP.getArea_id());

            Number count = (Number) query.getSingleResult();

            if (count.intValue() == 0) {
                throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
                        "Khu vực với id '" + warningMicroIP.getArea_id() + "' không tồn tại!"
                );
            }


            em.createNativeQuery(
                            "UPDATE micro_ip_device " +
                                    "SET device_name = ? ,is_locked = ?, area_id = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP " +
                                    "WHERE id = ?"
                    )
                    .setParameter(1,warningMicroIP.getDevice_name())
                    .setParameter(2, warningMicroIP.getIs_locked())
                    .setParameter(3, warningMicroIP.getArea_id())
                    .setParameter(4, warningMicroIP.getUpdate_by())
                    .setParameter(5, warningMicroIP.getId())
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
