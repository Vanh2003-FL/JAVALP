package org.openremote.model.Schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleDTO {
    @JsonProperty("scheduleId")
    private Long scheduleId;

    private String code;
    private String name;
    private String priority;

    @JsonProperty("sch_from_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime schFromDate;

    @JsonProperty("sch_to_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime schToDate;

    private List<ScheduleContentDTO> contents;

    public ScheduleDTO() {}

    public ScheduleDTO(String code, String name, String priority, LocalDateTime schFromDate, LocalDateTime schToDate, List<ScheduleContentDTO> contents) {
        this.code = code;
        this.name = name;
        this.priority = priority;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.contents = contents;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getScheduleId() { return scheduleId; }

    public LocalDateTime getSchFromDate() { return schFromDate; }
    public void setSchFromDate(LocalDateTime schFromDate) { this.schFromDate = schFromDate; }

    public LocalDateTime getSchToDate() { return schToDate; }
    public void setSchToDate(LocalDateTime schToDate) { this.schToDate = schToDate; }

    public List<ScheduleContentDTO> getContents() { return contents; }
    public void setContents(List<ScheduleContentDTO> contents) { this.contents = contents; }

    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
}
