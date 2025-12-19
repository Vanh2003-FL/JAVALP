package org.openremote.model.Schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.List;

public class CalendarDayDTO {
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate day;
    public int scheduleCount;
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public List<ScheduleDTO> schedules;

    public CalendarDayDTO(LocalDate day, int scheduleCount, List<ScheduleDTO> schedules) {
        this.day = day;
        this.scheduleCount = scheduleCount;
        this.schedules = schedules;
    }

    public CalendarDayDTO() {
    }

    public LocalDate getDay() {
        return day;
    }

    public int getScheduleCount() {
        return scheduleCount;
    }

    public List<ScheduleDTO> getSchedules() {
        return schedules;
    }

    public void setDay(LocalDate day) {
        this.day = day;
    }

    public void setScheduleCount(int scheduleCount) {
        this.scheduleCount = scheduleCount;
    }

    public void setSchedules(List<ScheduleDTO> schedules) {
        this.schedules = schedules;
    }
}
