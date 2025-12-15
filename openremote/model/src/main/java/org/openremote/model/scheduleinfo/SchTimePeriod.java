package org.openremote.model.scheduleinfo;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class SchTimePeriod {
    private int time_id;
    private LocalTime timeFrom;
    private LocalTime timeTo;
    private int time_value;

    public SchTimePeriod() {}

    public SchTimePeriod(int time_id, LocalTime timeFrom, LocalTime timeTo, int time_value) {
        this.time_id = time_id;
        this.timeFrom = timeFrom;
        this.timeTo = timeTo;
        this.time_value = time_value;
    }

    public int getTime_id() {
        return time_id;
    }

    public void setTime_id(int time_id) {
        this.time_id = time_id;
    }

    @JsonIgnore
    public LocalTime getTimeFrom() {
        return timeFrom;
    }

    public void setTimeFrom(LocalTime timeFrom) {
        this.timeFrom = timeFrom;
    }

    @JsonIgnore
    public LocalTime getTimeTo() {
        return timeTo;
    }

    public void setTimeTo(LocalTime timeTo) {
        this.timeTo = timeTo;
    }

    public int getTime_value() {
        return time_value;
    }

    public void setTime_value(int time_value) {
        this.time_value = time_value;
    }

    @JsonSetter("time_from")
    public void setTimeFrom(JsonNode node) {
        this.timeFrom = convertToLocalTime(node);
    }

    @JsonSetter("time_to")
    public void setTimeTo(JsonNode node) {
        this.timeTo = convertToLocalTime(node);
    }

    @JsonGetter("time_from")
    public String getTimeFromString() {
        return timeFrom != null ? timeFrom.format(DateTimeFormatter.ofPattern("HH:mm")) : null;
    }

    @JsonGetter("time_to")
    public String getTimeToString() {
        return timeTo != null ? timeTo.format(DateTimeFormatter.ofPattern("HH:mm")) : null;
    }

    private LocalTime convertToLocalTime(JsonNode node) {
        // Xử lý trường hợp node là mảng [giờ, phút]
        if (node.isArray() && node.size() >= 2) {
            int hour = node.get(0).asInt();
            int minute = node.get(1).asInt();
            return LocalTime.of(hour, minute);
        }
        // Xử lý trường hợp node là chuỗi "HH:MM"
        else if (node.isTextual()) {
            try {
                return LocalTime.parse(node.asText(), DateTimeFormatter.ofPattern("H:mm"));
            } catch (Exception e) {
                try {
                    return LocalTime.parse(node.asText(), DateTimeFormatter.ofPattern("HH:mm"));
                } catch (Exception e2) {
                    throw new IllegalArgumentException("Không thể chuyển đổi chuỗi " + node.asText() + " thành LocalTime", e2);
                }
            }
        }
        throw new IllegalArgumentException("Không thể chuyển đổi " + node + " thành LocalTime");
    }
}
