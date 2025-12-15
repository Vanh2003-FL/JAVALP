package org.openremote.manager.district;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.District;
import org.openremote.model.district.DistrictException;
import org.openremote.model.district.DistrictExceptionMapper;
import org.openremote.model.dto.SearchFilterDTO;

import java.time.LocalDateTime;
import java.util.List;

public class DistrictPersistenceService extends RouteBuilder implements ContainerService {

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;


    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new DistrictResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
        managerWebService.addApiSingleton(new DistrictExceptionMapper());
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

    public District create(District province) {
        try {
            persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_district WHERE LOWER(district_name) = LOWER(?) AND deleted = 0 and province_id = ?")
                        .setParameter(1, province.getName().trim())
                        .setParameter(2, province.getProviceId())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS, "Tên quận/huyện '" + province.getName() + "' đã tồn tại!");
                }
                em.createNativeQuery(
                                "INSERT INTO md_district (district_name, active, deleted, create_date, create_by, update_date, update_by, province_id) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, province.getName())
                        .setParameter(2, 1)
                        .setParameter(3, 0)
                        .setParameter(4, LocalDateTime.now())
                        .setParameter(5, province.getCreateBy())
                        .setParameter(6, LocalDateTime.now())
                        .setParameter(7, province.getUpdateBy())
                        .setParameter(8, province.getProviceId())
                        .executeUpdate();
                return null;
            });
            return province;
        } catch (DistrictException e) {
            throw e;
        }catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }

    public List<District> getDistrictsByProvince(SearchFilterDTO<District> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            var query = em.createNativeQuery(
                    "SELECT district_id, district_name, active, deleted, create_by, update_by, create_date, update_date " +
                            "FROM md_district WHERE province_id = ? AND deleted = 0 AND active = 1 " +
                            "ORDER BY district_name",
                    District.class
            );

            query.setParameter(1, searchFilterDTO.getData().getProviceId());

            query.setMaxResults(searchFilterDTO.getSize());
            query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());

            return query.getResultList();
        });
    }

    public List<District> getData(SearchFilterDTO<District> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT district_id, district_name, active, deleted, create_by, update_by, create_date, update_date, province_id " +
                    "FROM md_district WHERE deleted = 0";
            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getName())) {
                    baseQuery += " AND LOWER(district_name) LIKE LOWER(:districtName)";
                }

                if (validationUtils.isValid(searchFilterDTO.getData().getProviceId())) {
                    baseQuery += " AND province_id = :provinceId";
                }
            }

            baseQuery += " ORDER BY district_name";
            var query = em.createNativeQuery(baseQuery, District.class);

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getName())) {
                    query.setParameter("districtName", "%" + searchFilterDTO.getData().getName().trim() + "%");
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getProviceId())) {
                    query.setParameter("provinceId", searchFilterDTO.getData().getProviceId());
                }
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }
            return query.getResultList();
        });
    }

    public District update(District province) {
        persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE md_district " +
                                    "SET district_name = ?, update_date = ?, update_by = ?, active = ?, province_id = ? " +
                                    "WHERE district_id = ?")
                    .setParameter(1, province.getName())
                    .setParameter(2, LocalDateTime.now())
                    .setParameter(3, province.getUpdateBy())
                    .setParameter(4, province.getActive())
                    .setParameter(5, province.getProviceId())
                    .setParameter(6, province.getId())
                    .executeUpdate();
            return null;
        });
        return province;
    }


    public boolean updateDeleteStatus(int id) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "UPDATE md_district SET deleted = 1, active = 0 WHERE district_id = ?"
                    )
                    .setParameter(1, id)
                    .executeUpdate();
            return updatedRows > 0;
        });
    }

    public Long count(District province) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM md_district WHERE deleted = 0";

            if (validationUtils.isValid(province)
                    && validationUtils.isValid(province.getName())) {
                baseQuery += " AND LOWER(district_name) LIKE LOWER(:districtName)";
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(province)
                    && validationUtils.isValid(province.getName())) {
                query.setParameter("districtName", "%" + province.getName().trim() + "%");
            }

            return (Long) query.getSingleResult();
        });
    }
}
