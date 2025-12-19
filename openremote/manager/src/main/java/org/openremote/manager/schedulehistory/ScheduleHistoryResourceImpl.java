package org.openremote.manager.schedulehistory;

import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.http.RequestParams;
import org.openremote.model.schedulehistory.ScheduleHistory;
import org.openremote.model.schedulehistory.ScheduleHistoryResource;
import org.openremote.model.security.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ScheduleHistoryResourceImpl extends ManagerWebResource implements ScheduleHistoryResource {

    protected ScheduleHistoryPersistenceService scheduleHistoryPersistenceService;
    protected ManagerIdentityService identityService;

    public ScheduleHistoryResourceImpl(TimerService timerService,
                                       ManagerIdentityService identityService,
                                       ScheduleHistoryPersistenceService scheduleHistoryPersistenceService) {
        super(timerService);
        this.identityService = identityService;
        this.scheduleHistoryPersistenceService = scheduleHistoryPersistenceService;
    }

    @Override
    public Map<String, Object> getScheduleHistories(RequestParams requestParams, Map<String, Object> filters) {
        String keyword = filters.get("keyword") != null ? filters.get("keyword").toString() : "";
        Integer status = filters.get("status") != null ? Integer.parseInt(filters.get("status").toString()) : null;
        String scheduleId = filters.get("scheduleId") != null ? filters.get("scheduleId").toString() : null;
        int page = filters.get("page") != null ? Integer.parseInt(filters.get("page").toString()) : 0;
        int size = filters.get("size") != null ? Integer.parseInt(filters.get("size").toString()) : 10;

        String userId = getUserId(requestParams);
        List<ScheduleHistory> histories = scheduleHistoryPersistenceService.getScheduleHistories(
                userId, keyword, status, scheduleId, page, size);
        long total = scheduleHistoryPersistenceService.countScheduleHistories(userId, keyword, status, scheduleId);

        Map<String, Object> result = new HashMap<>();
        result.put("data", histories);
        result.put("total", total);
        return result;
    }

    @Override
    public ScheduleHistory getById(RequestParams requestParams, Map<String, String> request) {
        String id = request.get("id");
        String userId = getUserId(requestParams);
        return scheduleHistoryPersistenceService.getById(userId, id);
    }

    @Override
    public Map<String, Object> countScheduleHistories(RequestParams requestParams, Map<String, Object> filters) {
        String keyword = filters.get("keyword") != null ? filters.get("keyword").toString() : "";
        Integer status = filters.get("status") != null ? Integer.parseInt(filters.get("status").toString()) : null;
        String scheduleId = filters.get("scheduleId") != null ? filters.get("scheduleId").toString() : null;

        String userId = getUserId(requestParams);
        long total = scheduleHistoryPersistenceService.countScheduleHistories(userId, keyword, status, scheduleId);

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        return result;
    }

    protected String getUserId(RequestParams requestParams) {
        // Lấy thông tin user từ authentication context
        // Tạm thời return null, cần implement authentication
        User user = identityService.getIdentityProvider().getUserFromToken(requestParams.getBearerAuth());
        return user != null ? user.getId() : null;
    }
}
