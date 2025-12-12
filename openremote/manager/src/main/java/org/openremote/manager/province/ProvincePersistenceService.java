package org.openremote.manager.province;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.*;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.province.Province;
import org.openremote.model.province.ProvinceException;
import org.openremote.model.province.ProvinceExceptionMapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

public class ProvincePersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;


    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new ProvinceResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
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


    @Override
    public void configure() throws Exception {

    }

    public Province create(Province province) {
        System.out.println(">>>>>>>>checkProvince");

        try {
            return persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_province WHERE LOWER(province_name) = LOWER(?) AND deleted = 0")
                        .setParameter(1, province.getName().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new ProvinceException(AttributeWriteFailure.ALREADY_EXISTS, "Tên tỉnh/thành phố '" + province.getName() + "' đã tồn tại!");
                }

                Integer provinceId = (Integer) em.createNativeQuery(
                                "INSERT INTO md_province (province_name, active, deleted, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING province_id")
                        .setParameter(1, province.getName().trim())
                        .setParameter(2, 1)
                        .setParameter(3, 0)
                        .setParameter(4, LocalDateTime.now())
                        .setParameter(5, province.getCreateBy())
                        .setParameter(6, LocalDateTime.now())
                        .setParameter(7, province.getUpdateBy())
                        .getSingleResult();

                province.setId(provinceId);
                province.setActive(1);
                province.setDeleted(0);
                province.setCreateDate(Timestamp.valueOf(LocalDateTime.now()));

                return province;
            });

        }
        catch (ProvinceException e) {
            throw e;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }

    public List<Province> getAll(SearchFilterDTO<Province> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT province_id, province_name, active, deleted, create_by, update_by, create_date, update_date " +
                    "FROM md_province WHERE deleted = 0";
            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                baseQuery += " AND LOWER(province_name) LIKE LOWER(:provinceName)";
            }

            baseQuery += " ORDER BY province_name";

            var query = em.createNativeQuery(baseQuery, Province.class);

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                query.setParameter("provinceName", "%" + searchFilterDTO.getData().getName().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) && validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }
            return query.getResultList();
        });
    }

    public Province update(Province province) {
        persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE md_province " +
                                    "SET province_name = ?, update_date = ?, update_by = ?, active = ? " +
                                    "WHERE province_id = ?")
                    .setParameter(1, province.getName())
                    .setParameter(2, LocalDateTime.now())
                    .setParameter(3, province.getUpdateBy())
                    .setParameter(4, province.getActive())
                    .setParameter(5, province.getId())
                    .executeUpdate();
            return null;
        });
        return province;
    }

    public Long count(Province province) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM md_province WHERE deleted = 0";

            if (validationUtils.isValid(province)
                    && validationUtils.isValid(province.getName())) {
                baseQuery += " AND LOWER(province_name) LIKE LOWER(:provinceName)";
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(province)
                    && validationUtils.isValid(province.getName())) {
                query.setParameter("provinceName", "%" + province.getName().trim() + "%");
            }

            return (Long) query.getSingleResult();
        });
    }

    public boolean updateDeleteStatus(int provinceId) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "UPDATE md_province SET deleted = 1, active = 0 WHERE province_id = ?"
                    )
                    .setParameter(1, provinceId)
                    .executeUpdate();
            return updatedRows > 0;
        });
    }

    }
