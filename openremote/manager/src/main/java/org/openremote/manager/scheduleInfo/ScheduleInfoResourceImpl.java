package org.openremote.manager.scheduleInfo;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.PersistenceEvent;
import org.openremote.model.Schedule.CreateScheduleRequest;
import org.openremote.model.Schedule.ScheduleCompositeDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.exception.ExceptionCommon;
import org.openremote.model.scheduleinfo.*;

import java.util.List;

public class ScheduleInfoResourceImpl extends ManagerWebResource implements ScheduleInfoResource {
    protected final PersistenceService persistenceService;
    protected final ScheduleInfoPersistenceService scheduleInfoPersistenceService;

    public ScheduleInfoResourceImpl(TimerService timerService,
                                    ManagerIdentityService identityService, PersistenceService persistenceService, ScheduleInfoPersistenceService scheduleInfoPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.scheduleInfoPersistenceService = scheduleInfoPersistenceService;

    }

    @Override
    public List<ScheduleInfo> getData(SearchFilterDTO<ScheduleInfo> filterDTO) {
        return scheduleInfoPersistenceService.getAll(filterDTO);
    }

    @Override
    public ScheduleInfo createSchedule(ScheduleInfo scheduleInfo) {
        return scheduleInfoPersistenceService.create(scheduleInfo);
    }

    @Override
    public ScheduleInfo updateSchedule(ScheduleInfo scheduleInfo) {
        if (scheduleInfo == null) {
            throw new ExceptionCommon("ASSET_ERROR", "scheduleInfo cannot be null");
        }

        if (scheduleInfoPersistenceService.findPendingByScheduleId(scheduleInfo.getId()) > 0) {
            throw new ExceptionCommon("PENDING_ERROR", "Kịch bản đang trong quá trình áp dụng");
        }

        return scheduleInfoPersistenceService.update(scheduleInfo);
    }

    @Override
    public void insertScheduleAsset(List<Integer> scheduleIds, String assetId, String typeAsset) {
        for (Integer s : scheduleIds) {
            scheduleInfoPersistenceService.insertScheduleAsset2(s, assetId, typeAsset);
        }
    }

    @Override
    public Long countData(SearchFilterDTO<ScheduleInfo> filterDTO) {
        return scheduleInfoPersistenceService.countData(filterDTO);
    }

    @Override
    public ScheduleInfo getDetail(Integer id) {
        ScheduleInfo result = scheduleInfoPersistenceService.getDetail(id);
        if (result == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.NOT_FOUND)
                            .entity(new ErrorMessage("Không tìm thấy lịch biểu"))
                            .build()
            );
        }
        return result;
    }

    @Override
    public Long countByAssetId(String assetId) {
        if (assetId == null || assetId.trim().isEmpty()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("Thiếu assetId"))
                            .build()
            );
        }

        try {
            return (Long) scheduleInfoPersistenceService.countByAssetId(assetId);
        } catch (Exception e) {
            throw new WebApplicationException(
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorMessage("Lỗi khi đếm lịch biểu theo assetId: " + e.getMessage()))
                            .build()
            );
        }
    }

    @Override
    public List<AssetTypeDTO> getAllAssetTypes(@QueryParam("realm") String realm) {
        return scheduleInfoPersistenceService.getAllAssetTypes(realm);
    }

    @Override
    public List<LampTypeDTO> getLampTypesByAssets(List<String> assetIds) {
        return scheduleInfoPersistenceService.getLampTypes(assetIds);
    }


    @Override
    public void remove(Integer id) {
        if (scheduleInfoPersistenceService.IsSuccessDeleteByScheduleId(id)) {
            try {
                // Lấy thông tin người thực hiện xóa (có thể dùng getUserId() từ identityService)
                String deletedBy = getUsername();

                boolean success = scheduleInfoPersistenceService.delete(id, deletedBy);


                if (!success) {
                    throw new WebApplicationException("Không thể xóa lịch biểu", 500);
                }
            } catch (Exception e) {
                throw new WebApplicationException("Lỗi khi xóa lịch biểu: " + e.getMessage(), 500);
            }
        } else {
//            String code = getDetail(id).getScheduleCode();//
            persistenceService.publishPersistenceEvent(PersistenceEvent.Cause.DELETE, new ScheduleInfo(id), new ScheduleInfo(id), ScheduleInfo.class, null, null);
            scheduleInfoPersistenceService.updateAssetStatusBySchedule(id, 0);
        }
    }

    @Override
    public void removeScriptOnCabinetId(Integer id, String assetId) {
        try {
            if (scheduleInfoPersistenceService.IsSuccessDeleteByScheduleIdAndIdAsset(id, assetId)) {
                scheduleInfoPersistenceService.removeScheduleAssets2(id, List.of(assetId));
            } else {
                scheduleInfoPersistenceService.sendCommandRemove3SceneClearToIdAsset(id, assetId);
                scheduleInfoPersistenceService.updateAssetStatusByScheduleAndAssetId(id, 0,List.of(assetId));
            }
        } catch (Exception e) {
            throw new WebApplicationException("Lỗi khi xóa lịch biểu trên tủ điều khiển: " + e.getMessage(), 500);
        }
    }

    @Override
    public List<ScheduleInfo> getSchedulesByAssetId(String assetId, int page, int size) {
        if (assetId == null || assetId.trim().isEmpty()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("Thiếu assetId"))
                            .build()
            );
        }

        try {
            return scheduleInfoPersistenceService.getSchedulesByAssetId(assetId, page, size);
        } catch (Exception e) {
            throw new WebApplicationException(
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorMessage("Lỗi khi lấy danh sách lịch biểu: " + e.getMessage()))
                            .build()
            );
        }
    }

    @Override
    public List<ScheduleInfo> getSchedulesByNotInAssetId(String assetId, int page, int size) {
        if (assetId == null || assetId.trim().isEmpty()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("Thiếu assetId"))
                            .build()
            );
        }

        try {
            return scheduleInfoPersistenceService.getSchedulesNotInAssetId(assetId, page, size);
        } catch (Exception e) {
            throw new WebApplicationException(
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorMessage("Lỗi khi lấy danh sách lịch biểu: " + e.getMessage()))
                            .build()
            );
        }
    }
    @Override
    public Integer createScheduleComposite(CreateScheduleRequest request) {
        if (request == null) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("Dữ liệu đầu vào không được để trống"))
                            .build()
            );
        }

        // Validate cơ bản (Ví dụ: tên lịch, ngày tháng)
        if (request.getScheduleName() == null || request.getScheduleName().isEmpty()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("Tên lịch phát không được để trống"))
                            .build()
            );
        }

        try {
            // Gọi xuống Service đã viết ở bước trước
            return scheduleInfoPersistenceService.createScheduleComposite(request);
        } catch (Exception e) {
            e.printStackTrace();
            throw new WebApplicationException(
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorMessage("Lỗi khi tạo lịch phát composite: " + e.getMessage()))
                            .build()
            );
        }
    }

    @Override
    public ScheduleCompositeDetailDTO getScheduleCompositeDetail(Integer id) {
        // 1. Validate đầu vào
        if (id == null || id <= 0) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity(new ErrorMessage("ID lịch phát không hợp lệ"))
                            .build()
            );
        }

        try {
            // 2. Gọi xuống Service (Hàm bạn vừa viết xong)
            ScheduleCompositeDetailDTO result = scheduleInfoPersistenceService.getScheduleCompositeById(id);

            // 3. Xử lý trường hợp không tìm thấy
            if (result == null) {
                throw new WebApplicationException(
                        Response.status(Response.Status.NOT_FOUND)
                                .entity(new ErrorMessage("Không tìm thấy lịch phát với ID: " + id))
                                .build()
                );
            }

            return result;

        } catch (WebApplicationException we) {
            // Ném lại các lỗi đã bắt (như 404, 400)
            throw we;
        } catch (Exception e) {
            e.printStackTrace();
            // 4. Xử lý lỗi hệ thống (500)
            throw new WebApplicationException(
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorMessage("Lỗi server khi lấy chi tiết lịch: " + e.getMessage()))
                            .build()
            );
        }
    }
}

