package org.openremote.model.Schedule;

import java.sql.Timestamp;
import java.util.List;

public class UpdateScheduleRequest extends CreateScheduleRequest{
    private Integer id;
    public UpdateScheduleRequest() {}
    public UpdateScheduleRequest(Integer id) {
        this.id = id;
    }

    public UpdateScheduleRequest(String scheduleName, String scheduleCode, String schType, Timestamp schFromDate, Timestamp schToDate, String schRepeatOccu, String priority, String newsCategoryId, Integer bitRate, String description, Boolean active, List<String> assetIds, List<ScheduleContentRequestDTO> contents, Integer id) {
        super(scheduleName, scheduleCode, schType, schFromDate, schToDate, schRepeatOccu, priority, newsCategoryId, bitRate, description, active, assetIds, contents);
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}
