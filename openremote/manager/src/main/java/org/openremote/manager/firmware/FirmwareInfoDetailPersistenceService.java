package org.openremote.manager.firmware;

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
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.firmware.FirmwareInfoAsset;
import org.openremote.model.firmware.FirmwareInfoDetail;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

import static java.time.LocalDate.now;

public class FirmwareInfoDetailPersistenceService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());
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
                new FirmwareInfoDetailResourceImpl(container.getService(TimerService.class), identityService, this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<FirmwareInfoDetailDTO> getFrwInfoDetailByFrwInfoId (Long infoId, SearchFilterDTO<FirmwareInfoDetailDTO> searchFilter) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "fid.id, fid.asset_model, fid.description " +
                        "FROM frw_info_detail fid " +
                        "LEFT JOIN frw_info fi ON fi.id = fid.frw_info_id " +
                        "WHERE fid.frw_info_id = ? "
        );
        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery(sqlBase.toString(), FirmwareInfoDetailDTO.class)
                    .setParameter(1, infoId);
            if (validationUtils.isValid(searchFilter.getSize()) || validationUtils.isValid(searchFilter.getPage())) {
                results.setMaxResults(searchFilter.getSize());
                results.setFirstResult((searchFilter.getPage() - 1) * searchFilter.getSize());
            }


            return (List<FirmwareInfoDetailDTO>) results.getResultList();
        });
    }

    public Long getCountFrwInfoDetailByFrwInfoId(Long infoId) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "count(fid.id) " +
                        "FROM frw_info_detail fid " +
                        "LEFT JOIN frw_info fi ON fi.id = fid.frw_info_id " +
                        "WHERE fid.frw_info_id = ? "
        );

        return persistenceService.doReturningTransaction(em -> {
            Long results = (Long) em.createNativeQuery(sqlBase.toString())
                    .setParameter(1, infoId)
                    .getSingleResult();

            return results;
        });
    }

    public FirmwareInfoDetailDTO create(FirmwareInfoDetail firmwareInfoDetail) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                // Kiểm tra trùng model sản phẩm
//                Long count = (Long) em.createNativeQuery(
//                                "SELECT COUNT(*) FROM frw_info_detail WHERE LOWER(asset_model) = LOWER(?) ")
//                        .setParameter(1, firmwareInfoDetail.getAssetModel().trim())
//                        .getSingleResult();
//
//                if (count != null && count > 0) {
//                    throw new DistrictException(AttributeWriteFailure.ALREADY_EXISTS,
//                            "Model sản phẩm này đã tồn tại!!!");
//                }

                Long firmwareInfoDetailId = (Long) em.createNativeQuery(
                                "INSERT INTO frw_info_detail (frw_info_id, asset_model, description, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id")
                        .setParameter(1, firmwareInfoDetail.getFrwInfoId())
                        .setParameter(2, firmwareInfoDetail.getAssetModel())
                        .setParameter(3, firmwareInfoDetail.getDescription())
                        .setParameter(4, LocalDateTime.now())
                        .setParameter(5, firmwareInfoDetail.getCreateBy())
                        .setParameter(6, LocalDateTime.now())
                        .setParameter(7, firmwareInfoDetail.getUpdateBy())
                        .getSingleResult();

                firmwareInfoDetail.setId(firmwareInfoDetailId);

                // Tìm version mới và model của thiết bị
                Object[] infoResult = (Object[]) em.createNativeQuery(
                                "SELECT fi.frw_version, fid.asset_model, fi.asset_type " +
                                        "FROM frw_info_detail fid " +
                                        "JOIN frw_info fi ON fi.id = fid.frw_info_id " +
                                        "WHERE fid.id = ?")
                        .setParameter(1, firmwareInfoDetailId)
                        .getSingleResult();

                String newVersion = (String) infoResult[0];
                String assetModel = (String) infoResult[1];
                String assetType = (String) infoResult[2];

                // Lấy danh sách thiết bị trùng model và version cũ
                List<Object[]> assetList = em.createNativeQuery(
                                "SELECT ai.id, ai.firmware_version " +
                                        "FROM asset_info ai " +
                                        "LEFT JOIN asset a ON a.id = ai.id " +
                                        "WHERE ai.asset_model = ? AND ai.deleted = false AND a.type = ?")
                        .setParameter(1, assetModel)
                        .setParameter(2, assetType)
                        .getResultList();

                int newVersionInt = Integer.parseInt(newVersion.replaceAll("\\.", ""));

                for (Object[] row : assetList) {
                    String assetInfoId = (String) row[0];
                    String oldVersion = (String) row[1];

                    if (oldVersion == null || oldVersion.trim().isEmpty()) {
                        continue;
                    }

                    int oldVersionInt;
                    // Bỏ qua bản ghi version lỗi
                    try {
                        oldVersionInt = Integer.parseInt(oldVersion.replaceAll("\\.", ""));
                    } catch (NumberFormatException e) {
                        continue;
                    }

                    if (newVersionInt > oldVersionInt) {
                        em.createNativeQuery(
                                        "INSERT INTO frw_info_asset (frw_info_detail_id, asset_id, asset_model, frw_version_old, frw_version_new, status, description, create_date, create_by, update_date, update_by) " +
                                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                            .setParameter(1, firmwareInfoDetail.getId())
                            .setParameter(2, assetInfoId)
                            .setParameter(3, assetModel)
                            .setParameter(4, oldVersion)
                            .setParameter(5, newVersion)
                            .setParameter(6, "S")
                            .setParameter(7, firmwareInfoDetail.getDescription())
                            .setParameter(8, LocalDateTime.now())
                            .setParameter(9, firmwareInfoDetail.getCreateBy())
                            .setParameter(10, LocalDateTime.now())
                            .setParameter(11, firmwareInfoDetail.getUpdateBy())
                            .executeUpdate();
                    }
                }

                FirmwareInfoDetailDTO responseDto = new FirmwareInfoDetailDTO();
                responseDto.setId(firmwareInfoDetailId);
                responseDto.setAssetModel(firmwareInfoDetail.getAssetModel());
                responseDto.setDescription(firmwareInfoDetail.getDescription());

                return responseDto;
            });
        } catch (DistrictException e) {
            throw e;
        } catch (Exception e) {
            LOG.severe("Lỗi khi tạo FirmwareInfoDetail: " + e.getMessage());
            throw new RuntimeException("Không thể tạo mới firmware info: ", e);
        }
    }

    public FirmwareInfoDetail update(FirmwareInfoDetail firmwareInfoDetail) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                em.createNativeQuery("update frw_info_detail set " +
                                " description = ?, update_date = ?, update_by = ? " +
                                " where id = ?")
                        .setParameter(1, firmwareInfoDetail.getDescription())
                        .setParameter(2, now())
                        .setParameter(3, firmwareInfoDetail.getUpdateBy())
                        .setParameter(4, firmwareInfoDetail.getId())
                        .executeUpdate();
                return firmwareInfoDetail;
            });
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage()+"");
        }
    }

    public boolean delete(Long id) {
        try {
            return persistenceService.doReturningTransaction(em -> {

                // Xóa bản ghi ở bảng frw_info_asset trước
                 em.createNativeQuery("DELETE FROM frw_info_asset WHERE frw_info_detail_id = ?")
                        .setParameter(1, id)
                        .executeUpdate();

                int delete = em.createNativeQuery(
                                "DELETE FROM frw_info_detail WHERE id = ?")
                        .setParameter(1, id)
                        .executeUpdate();

                return delete > 0;
            });
        } catch (Exception e) {
            LOG.severe("Lỗi khi xóa FirmwareInfoDetail: " + e.getMessage());
            throw new RuntimeException("Không thể xóa FirmwareInfoDetail", e);
        }
    }


}
