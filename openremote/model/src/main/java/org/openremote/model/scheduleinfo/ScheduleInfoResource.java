package org.openremote.model.scheduleinfo;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.openremote.model.Constants;
import org.openremote.model.Schedule.*;
import org.openremote.model.dto.ScheduleSearchDTO;
import org.openremote.model.dto.SearchFilterDTO;
import java.sql.Timestamp;
import java.util.List;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Schedule")
@Path("schedule")
public interface ScheduleInfoResource {

    //lấy danh sách schedule
    @POST
    @Path("getData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
//    @RolesAllowed(Constants.READ_SCHEDULE)
    List<ScheduleInfo> getData(ScheduleSearchDTO<ScheduleInfo> filterDTO);

    //tạo mới schedule
    @POST
    @Path("createSchedule")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_SCHEDULE)
    ScheduleInfo createSchedule(ScheduleInfo scheduleInfo);


    //đếm số schedule theo assetId
    @GET
    @Path("countByAsset")
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.READ_SCHEDULE)
    Long countByAssetId(@QueryParam("assetId") String assetId);

    //lấy chi tiết schedule
    @GET
    @Path("getData/{id}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    ScheduleInfo getDetail(@PathParam("id") Integer id);

    //xóa schedule
    @DELETE
    @Path("{id}")
    @RolesAllowed(Constants.WRITE_SCHEDULE)
    void remove(@PathParam("id") Integer id);

    //xóa schedule theo assetId
    @DELETE
    @Path("{id}/{id_asset}")
    @RolesAllowed(Constants.WRITE_SCHEDULE)
    void removeScriptOnCabinetId(@PathParam("id") Integer id, @PathParam("id_asset") String idAsset);

    //cập nhật schedule
    @POST
    @Path("updateSchedule")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_SCHEDULE)
    ScheduleInfo updateSchedule(ScheduleInfo scheduleInfo);

    @POST
    @Path("updateStatusSchedule")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
//    @RolesAllowed(Constants.WRITE_SCHEDULE)
    List<ScheduleInfo> updateStatusSchedule(UpdateScheduleStatusRequestDTO requestDTO);



    //gán asset cho schedule
    @POST
    @Path("insertScheduleAsset")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_SCHEDULE)
    void insertScheduleAsset( List<Integer> scheduleIds, @QueryParam("assetId") String assetId, @QueryParam("typeAsset") String typeAsset);

    //lấy loại asset
    @GET
    @Path("getAssetTypes")
    @Produces(APPLICATION_JSON)
    List<AssetTypeDTO> getAllAssetTypes(@QueryParam("realm") String realm);

    //đếm số lượng schedule
    @POST
    @Path("countData")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
//    @RolesAllowed(Constants.READ_SCHEDULE)
    Long countData(ScheduleSearchDTO<ScheduleInfo> filterDTO);

    //lấy loại đèn theo asset
    @POST
    @Path("getLampTypes")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    List<LampTypeDTO> getLampTypesByAssets(List<String> assetIds);

    //lấy danh sách schedule theo assetId
    @GET
    @Path("getSchedulesByAsset/{assetId}")
    @Produces(APPLICATION_JSON)
    List<ScheduleInfo> getSchedulesByAssetId(
            @PathParam("assetId") String assetId,
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("size") @DefaultValue("10") int size
    );

    //lấy danh sách schedule không thuộc assetId
    @GET
    @Path("getSchedulesByNotInAssetId/{assetId}")
    @Produces(APPLICATION_JSON)
    List<ScheduleInfo> getSchedulesByNotInAssetId(
            @PathParam("assetId") String assetId,
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("size") @DefaultValue("10") int size
    );

    @POST
    @Path("/composite")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed(Constants.WRITE_SCHEDULE)
    Integer createScheduleComposite(CreateScheduleRequest request);

    @GET
    @Path("/composite/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    ScheduleCompositeDetailDTO getScheduleCompositeDetail(@PathParam("id") Integer id);

    @POST
    @Path("calendarMonthSchedules")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
//    @RolesAllowed(Constants.READ_SCHEDULE)
    List<CalendarDayDTO> getCalendarMonthSchedules(CalendarMonthSchedulesRequest request);


    /**
     * API Cập nhật lịch phát (Composite Update)
     * URL: PUT /api/manager/schedule/composite (tùy config path gốc của bạn)
     */
    @PUT
    @Path("/composite")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@RolesAllowed(Constants.WRITE_SCHEDULE)
    Response updateScheduleComposite(UpdateScheduleRequest request);

}

