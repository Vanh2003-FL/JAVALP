package org.openremote.model.lamppost.dtoLamppost;
// src/main/java/com/example/dto/LamppostCreateDTO.java
// src/dto/LamppostCreateDTO.java

import java.time.LocalDate;
import java.util.Date;

public class LamppostCreateDTO {
    private String id;

    public Integer getLamppostId()
    {
        return lamppostId;
    }

    public void setLamppostId(Integer lamppostId) {
        lamppostId = lamppostId;
    }

    private Integer lamppostId;

    /** Mã cột đèn */
    private String lamppostCode;

    /** Tên cột đèn */
    private String lamppostName;

    /** Lộ tuyến */
    private String routeId;

    /** Ngày tạo */
    private LocalDate createdDate;

    /** Loại đèn (ví dụ: 50W, 100W,...) */
    private Long lampTypeId;

    /** Mã NEMA */
    private String lightId;

    /** Trạng thái */
    private Boolean active;

    /** Mô tả */
    private String description;

    /** Ngày bắt đầu */
    private Date startDate;

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    /** Ngày kết thúc */
    private Date endDate;

    // Getter & Setter

    public LamppostCreateDTO(String id) {
        this.id = id;
    }

    public String getLamppostCode() {
        return lamppostCode;
    }

    public void setLamppostCode(String lamppostCode) {
        this.lamppostCode = lamppostCode;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public Long getLampTypeId() {
        return lampTypeId;
    }

    public void setLampTypeId(Long lampTypeId) {
        this.lampTypeId = lampTypeId;
    }

    public String getLightId() {
        return lightId;
    }

    public void setLightId(String lightId) {
        this.lightId = lightId;
    }

    public String getLamppostName() {
        return lamppostName;
    }

    public void setLamppostName(String lamppostName) {
        this.lamppostName = lamppostName;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Constructor rỗng
    public LamppostCreateDTO() {}

}
