package org.openremote.model.scheduleinfo;

import java.util.List;

public class UpdateScheduleStatusRequestDTO {
    private List<ScheduleInfo> scheduleInfos;
    private String status;

    public UpdateScheduleStatusRequestDTO() {
    }

    public List<ScheduleInfo> getScheduleInfos() {
        return scheduleInfos;
    }

    public void setScheduleInfos(List<ScheduleInfo> scheduleInfos) {
        this.scheduleInfos = scheduleInfos;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UpdateScheduleStatusRequestDTO(List<ScheduleInfo> scheduleInfos, String status) {
        this.scheduleInfos = scheduleInfos;
        this.status = status;
    }
}
