package org.openremote.model.schedulehistory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import org.openremote.model.http.RequestParams;

import java.util.List;
import java.util.Map;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

@Tag(name = "Schedule History")
@Path("schedule-history")
public interface ScheduleHistoryResource {

    /**
     * Lấy danh sách lịch sử phát với filter và pagination
     */
    @POST
    @Path("get")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    //@RolesAllowed({Constants.READ_ADMIN_ROLE})
    Map<String, Object> getScheduleHistories(RequestParams requestParams, Map<String, Object> filters);

    /**
     * Lấy chi tiết 1 bản ghi lịch sử theo ID
     */
    @POST
    @Path("get-by-id")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    //@RolesAllowed({Constants.READ_ADMIN_ROLE})
    ScheduleHistory getById(RequestParams requestParams, Map<String, String> request);

    /**
     * Đếm tổng số bản ghi lịch sử (dùng cho pagination)
     */
    @POST
    @Path("count")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    //@RolesAllowed({Constants.READ_ADMIN_ROLE})
    Map<String, Object> countScheduleHistories(RequestParams requestParams, Map<String, Object> filters);
}
