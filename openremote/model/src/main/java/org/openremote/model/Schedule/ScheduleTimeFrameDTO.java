package org.openremote.model.Schedule;

public class ScheduleTimeFrameDTO {
    private String startTime;  // Giờ bắt đầu (Ví dụ: "07:00")
    private String endTime;    // Giờ kết thúc (Ví dụ: "09:00")
    private Integer volume;    // Âm lượng (0-100)

    public ScheduleTimeFrameDTO() {}

    public ScheduleTimeFrameDTO(String startTime, String endTime, Integer volume) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.volume = volume;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getVolume() {
        return volume;
    }

    public void setVolume(Integer volume) {
        this.volume = volume;
    }
}
