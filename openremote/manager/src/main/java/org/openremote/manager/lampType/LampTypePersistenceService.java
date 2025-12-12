package org.openremote.manager.lampType;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.province.ProvinceResourceImpl;
import org.openremote.manager.security.*;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.lampType.LampType;
import org.openremote.model.province.Province;
import org.openremote.model.lampType.LampTypeException;
import org.openremote.model.lampType.LampTypeExceptionMapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LampTypePersistenceService extends RouteBuilder implements ContainerService{
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new LampTypeResourceImpl(container.getService(TimerService.class),
                        identityService,
                        persistenceService,
                        this)
        );
        managerWebService.addApiSingleton(
                new LampTypeExceptionMapper()
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
    public LampType getLampTypeById(int id) {
        return persistenceService.doReturningTransaction(em -> {
            try {
                return (LampType) em.createNativeQuery(
                        "SELECT * FROM md_lamp_type WHERE id = :id AND deleted = 0",
                        LampType.class
                ).setParameter("id", id).getSingleResult();
            } catch (Exception e) {
                return null;
            }
        });
    }
    public List<LampType> getAll(SearchFilterDTO<LampType> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT * FROM md_lamp_type WHERE deleted = 0";

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getLampTypeName())) {
                baseQuery += " AND LOWER(lamp_type_name) LIKE LOWER(:lampTypeName)";
            }

            baseQuery += " ORDER BY lamp_type_name ";

            var query = em.createNativeQuery(baseQuery, LampType.class);

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getLampTypeName())) {
                query.setParameter("lampTypeName", "%" + searchFilterDTO.getData().getLampTypeName().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }

            return query.getResultList();
        });
    }

    public LampType createLampType(LampType lampType) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                // Kiểm tra trùng mã hoặc tên nếu cần
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_lamp_type WHERE LOWER(lamp_type_code) = LOWER(?) AND deleted = 0 AND active = 1")
                        .setParameter(1, lampType.getLampTypeCode().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new LampTypeException(AttributeWriteFailure.ALREADY_EXISTS,
                            "Tên loại đèn '" + lampType.getLampTypeCode() + "' đã tồn tại!");
                }

                Integer lampTypeId = (Integer) em.createNativeQuery(
                                "INSERT INTO md_lamp_type (lamp_type_code, lamp_type_name, power_consumption, luminous_flux, life_hours, active, deleted, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id")
                        .setParameter(1, lampType.getLampTypeCode())
                        .setParameter(2, lampType.getLampTypeName())
                        .setParameter(3, lampType.getPowerConsumption())
                        .setParameter(4, lampType.getLuminousFlux())
                        .setParameter(5, lampType.getLifeHours())
                        .setParameter(6, 1) // active
                        .setParameter(7, 0) // deleted
                        .setParameter(8, LocalDateTime.now())
                        .setParameter(9, lampType.getCreateBy())
                        .setParameter(10, LocalDateTime.now())
                        .setParameter(11, lampType.getUpdateBy())
                        .getSingleResult();
                // Thiết lập giá trị mặc định
                lampType.setId(lampTypeId);
                lampType.setActive(1);
                lampType.setDeleted(0);
                lampType.setCreateDate(Timestamp.valueOf(LocalDateTime.now()));

                return lampType;
            });
        } catch (Exception e) {
            LOG.severe("Lỗi khi tạo LampType: " + e.getMessage());
            throw new RuntimeException("Không thể tạo mới loại đèn", e);
        }
    }
    public LampType updateLampType(LampType lampType) {
        try {
            return persistenceService.doReturningTransaction(em -> {

                // Kiểm tra updateBy
                if (lampType.getUpdateBy() == null || lampType.getUpdateBy().trim().isEmpty()) {
                    throw new LampTypeException(AttributeWriteFailure.UNKNOWN, "Thiếu thông tin người cập nhật (updateBy)");
                }

                // Kiểm tra xem loại đèn có tồn tại không
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_lamp_type WHERE id = ? AND deleted = 0")
                        .setParameter(1, lampType.getId())
                        .getSingleResult();

                if (count == null || count == 0) {
                    throw new LampTypeException(AttributeWriteFailure.UNKNOWN,
                            "Không tìm thấy loại đèn với ID: " + lampType.getId());
                }

                // Kiểm tra tên trùng với bản ghi khác
                Long nameCount = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_lamp_type WHERE LOWER(lamp_type_code) = LOWER(?) AND id != ? AND deleted = 0 AND active = 1")
                        .setParameter(1, lampType.getLampTypeCode().trim())
                        .setParameter(2, lampType.getId())
                        .getSingleResult();

                if (nameCount != null && nameCount > 0) {
                    throw new LampTypeException(AttributeWriteFailure.ALREADY_EXISTS,
                            "Tên loại đèn '" + lampType.getLampTypeCode() + "' đã tồn tại!");
                }

                // Cập nhật bản ghi
                em.createNativeQuery(
                                "UPDATE md_lamp_type SET lamp_type_code = ?, lamp_type_name = ?, power_consumption = ?, " +
                                        "luminous_flux = ?, life_hours = ?, active = ?, update_date = ?, update_by = ? WHERE id = ?")
                        .setParameter(1, lampType.getLampTypeCode())
                        .setParameter(2, lampType.getLampTypeName())
                        .setParameter(3, lampType.getPowerConsumption())
                        .setParameter(4, lampType.getLuminousFlux())
                        .setParameter(5, lampType.getLifeHours())
                        .setParameter(6, lampType.getActive())
                        .setParameter(7, LocalDateTime.now())
                        .setParameter(8, lampType.getUpdateBy())
                        .setParameter(9, lampType.getId())
                        .executeUpdate();

                // Gán ngày cập nhật mới phía Java
                lampType.setUpdateDate(Timestamp.valueOf(LocalDateTime.now()));

                return lampType;
            });

        } catch (LampTypeException e) {
            LOG.warning("Lỗi xác thực khi cập nhật LampType: " + e.getMessage());
            throw e; // ném lại lỗi để xử lý phía trên nếu cần
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Lỗi khi cập nhật LampType", e);
            throw new RuntimeException("Không thể cập nhật loại đèn", e);
        }
    }


    public boolean deleteLampType(int lampTypeId) {
        try {
            return persistenceService.doReturningTransaction(em -> {

                // Xóa mềm: cập nhật deleted = 1
                int updated = em.createNativeQuery(
                                "UPDATE md_lamp_type SET deleted = 1, active = 0 WHERE id = ?")
                        .setParameter(1, lampTypeId)
                        .executeUpdate();

                return updated > 0;
            });
        } catch (LampTypeException e) {
            throw e;
        } catch (Exception e) {
            LOG.severe("Lỗi khi xóa mềm LampType: " + e.getMessage());
            throw new RuntimeException("Không thể xóa loại đèn", e);
        }
    }
    public Long count(LampType lampType) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM md_lamp_type WHERE deleted = 0";

            if (validationUtils.isValid(lampType)
                    && validationUtils.isValid(lampType.getLampTypeName())) {
                baseQuery += " AND LOWER(lamp_type_name) LIKE LOWER(:lampTypeName)";
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(lampType)
                    && validationUtils.isValid(lampType.getLampTypeName())) {
                query.setParameter("lampTypeName", "%" + lampType.getLampTypeName().trim() + "%");
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }

}
