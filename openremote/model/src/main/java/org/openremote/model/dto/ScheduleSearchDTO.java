package org.openremote.model.dto;

import java.security.Timestamp;

public class ScheduleSearchDTO<T> {
    private String keyWord;
    private Integer page;
    private Integer size;
    private String scheduleType;
    private String status;
    private Long fromDate;
    private Long toDate;
    private String type; // "area" | "asset"
    private String id;
    T data;

    public ScheduleSearchDTO() {
    }

    public ScheduleSearchDTO(String keyword, Integer page, Integer size, T data) {
        this.page = page;
        this.size = size;
        this.data = data;
    }

    public ScheduleSearchDTO(String keyWord, Integer page, Integer size, String scheduleType, String status, Long fromDate, Long toDate,String type, String id, T data) {
        this.keyWord = keyWord;
        this.page = page;
        this.size = size;
        this.scheduleType = scheduleType;
        this.status = status;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.type = type;
        this.id = id;
        this.data = data;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKeyWord() {
        return keyWord;
    }

    public void setKeyWord(String keyword) {
        this.keyWord = keyword;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
    public String getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(String scheduleType) {
        this.scheduleType = scheduleType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getFromDate() {
        return fromDate;
    }

    public void setFromDate(Long fromDate) {
        this.fromDate = fromDate;
    }

    public Long getToDate() {
        return toDate;
    }

    public void setToDate(Long toDate) {
        this.toDate = toDate;
    }
}
