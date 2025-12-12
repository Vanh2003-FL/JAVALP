package org.openremote.manager.firmware;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.PersistenceEvent;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.firmware.FirmwareInfo;
import org.openremote.model.hdi.hdiEven.HdiEven;
import org.openremote.model.province.ProvinceException;
import org.openremote.model.province.ProvinceExceptionMapper;
import org.openremote.model.scheduleinfo.ScheduleInfo;

import java.time.LocalDateTime;
import java.util.List;

public class FirmwareInfoPersistenceService extends RouteBuilder implements ContainerService {
    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

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
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new FirmwareInfoResourceImpl(container.getService(TimerService.class), identityService, this)
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

    public List<FirmwareInfo> getData(SearchFilterDTO<FirmwareInfo> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT id, frw_version, asset_type, sub_asset_type, upgrade_date, status, path_firmware, file_name, description, create_date, create_by, update_date, update_by\n" +
                    "FROM frw_info;";

            var query = em.createNativeQuery(baseQuery, FirmwareInfo.class);

            if (validationUtils.isValid(searchFilterDTO.getSize()) && validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }
            return query.getResultList();
        });
    }

    public Long count() {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM frw_info ";

            var query = em.createNativeQuery(baseQuery);

            return (Long) query.getSingleResult();
        });
    }

    public FirmwareInfo create(FirmwareInfo firmwareInfo) {

        try {
            return persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM frw_info WHERE LOWER(frw_version) = LOWER(?)")
                        .setParameter(1, firmwareInfo.getFrwVersion().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new ProvinceException(AttributeWriteFailure.ALREADY_EXISTS, "Tên phiên bản '" + firmwareInfo.getFrwVersion() + "' đã tồn tại!");
                }

                Long provinceId = (Long) em.createNativeQuery(
                                "INSERT INTO frw_info\n" +
                                        "(frw_version, asset_type, sub_asset_type, upgrade_date, file_name, description, create_date, create_by, update_date, update_by, path_firmware, status)\n" +
                                        "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id;")
                        .setParameter(1, firmwareInfo.getFrwVersion().trim())
                        .setParameter(2, firmwareInfo.getAssetType())
                        .setParameter(3, firmwareInfo.getSubAssetType())
                        .setParameter(4, firmwareInfo.getUpgradeDate())
                        .setParameter(5, firmwareInfo.getFileName())
                        .setParameter(6, firmwareInfo.getDescription())
                        .setParameter(7, LocalDateTime.now())
                        .setParameter(8, firmwareInfo.getCreateBy())
                        .setParameter(9, firmwareInfo.getUpdateDate())
                        .setParameter(10, firmwareInfo.getUpdateBy())
                        .setParameter(11, firmwareInfo.getPathFirmware())
                        .setParameter(12, firmwareInfo.getStatus())
                        .getSingleResult();

                firmwareInfo.setId(provinceId);

                return firmwareInfo;
            });

        } catch (ProvinceException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage() + "");
        }
    }

    public boolean updateDeleteStatus(Long firmwareInfoId) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "DELETE FROM frw_info\n" +
                                    "WHERE id= ?;"
                    )
                    .setParameter(1, firmwareInfoId)
                    .executeUpdate();
            return updatedRows > 0;
        });
    }

    public FirmwareInfo update(FirmwareInfo firmwareInfo) {
        persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE openremote.frw_info\n" +
                                    "SET frw_version= ?, asset_type= ?, sub_asset_type= ?, upgrade_date= ?, status= ?, " +
                                    "path_firmware= ?, file_name= ?, description= ?, update_date= now(), update_by= ?\n" +
                                    "WHERE id= ?")
                    .setParameter(1, firmwareInfo.getFrwVersion().trim())
                    .setParameter(2, firmwareInfo.getAssetType().trim())
                    .setParameter(3, firmwareInfo.getSubAssetType().trim())
                    .setParameter(4, firmwareInfo.getUpgradeDate())
                    .setParameter(5, firmwareInfo.getStatus())
                    .setParameter(6, firmwareInfo.getPathFirmware().trim())
                    .setParameter(7, firmwareInfo.getFileName().trim())
                    .setParameter(8, firmwareInfo.getDescription())
                    .setParameter(9, firmwareInfo.getUpdateBy() != null ? firmwareInfo.getUpdateBy().trim() : null)
                    .setParameter(10, firmwareInfo.getId())
                    .executeUpdate();
            return null;
        });

        persistenceService.publishPersistenceEvent(
                PersistenceEvent.Cause.CREATE,
                firmwareInfo,
                firmwareInfo,
                FirmwareInfo.class, null, null);
        return firmwareInfo;
    }
}
