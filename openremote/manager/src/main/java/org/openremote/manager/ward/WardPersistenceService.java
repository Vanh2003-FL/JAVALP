package org.openremote.manager.ward;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.DistrictException;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.ward.Ward;
import org.openremote.model.ward.WardException;
import org.openremote.model.ward.WardExceptionMapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;


public class WardPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;


    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new WardResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
        managerWebService.addApiSingleton(new WardExceptionMapper());
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

    public Ward create(Ward ward) {
        System.out.println(">>>>>>>>checkWard");

        try {
            return persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_ward WHERE LOWER(ward_name) = LOWER(?) AND deleted = 0 and district_id = ?")
                        .setParameter(1, ward.getName().trim())
                        .setParameter(2, ward.getDistrictId())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS, "Tên xã/phường '" + ward.getName() + "' đã tồn tại!");
                }
                Integer wardId = (Integer) em.createNativeQuery(
                                "INSERT INTO md_ward (ward_name, active, deleted, create_date, create_by, update_date, update_by, district_id) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING ward_id")
                        .setParameter(1, ward.getName().trim())
                        .setParameter(2, 1)
                        .setParameter(3, 0)
                        .setParameter(4, LocalDateTime.now())
                        .setParameter(5, ward.getCreateBy())
                        .setParameter(6, LocalDateTime.now())
                        .setParameter(7, ward.getUpdateBy())
                        .setParameter(8, ward.getDistrictId())
                        .getSingleResult();

                ward.setId(wardId);
                ward.setActive(1);
                ward.setDeleted(0);
                ward.setCreateDate(Timestamp.valueOf(LocalDateTime.now()));

                return ward;
            });
        } catch (WardException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }

    public List<Ward> getAll(SearchFilterDTO<Ward> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT ward_id, ward_name, active, deleted, create_by, update_by, create_date, update_date, district_id " +
                    "FROM md_ward WHERE deleted = 0";

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getName())) {
                        baseQuery += " AND LOWER(ward_name) LIKE LOWER(:wardName)";
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getDistrictId())) {
                    baseQuery += " AND DISTRICT_ID = :districtId";
                }
            }

            baseQuery += " ORDER BY ward_name";

            var query = em.createNativeQuery(baseQuery, Ward.class);

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getName())) {
                        query.setParameter("wardName", "%" + searchFilterDTO.getData().getName().trim() + "%");
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getDistrictId())) {
                    query.setParameter("districtId", searchFilterDTO.getData().getDistrictId());
                }
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }

            return query.getResultList();
        });
    }


    public Ward update(Ward ward) {
        persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE md_ward " +
                                    "SET ward_name = ?, active = ?, update_date = ?, update_by = ?, district_id = ? " +
                                    "WHERE ward_id = ?")
                    .setParameter(1, ward.getName())
                    .setParameter(2, ward.getActive())
                    .setParameter(3, LocalDateTime.now())
                    .setParameter(4, ward.getUpdateBy())
                    .setParameter(5, ward.getDistrictId())
                    .setParameter(6, ward.getId())
                    .executeUpdate();
            return null;
        });
        return ward;
    }

    public Long count(Ward ward) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM md_ward WHERE deleted = 0 AND active = 1";

            if (validationUtils.isValid(ward)
                    && validationUtils.isValid(ward.getName())) {
                baseQuery += " AND LOWER(ward_name) LIKE LOWER(:wardName)";
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(ward)
                    && validationUtils.isValid(ward.getName())) {
                query.setParameter("wardName", "%" + ward.getName().trim() + "%");
            }

            return (Long) query.getSingleResult();
        });
    }

    public boolean updateDeleteStatus(int wardId) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "UPDATE md_ward SET deleted = 1, active = 0 WHERE ward_id = ?"
                    )
                    .setParameter(1, wardId)
                    .executeUpdate();
            return updatedRows > 0;
        });
    }

    }
