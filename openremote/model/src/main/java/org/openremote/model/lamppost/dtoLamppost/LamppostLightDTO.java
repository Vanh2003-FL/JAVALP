package org.openremote.model.lamppost.dtoLamppost;

import java.util.Date;

public class LamppostLightDTO {
    private String name;
    private String assetId;
    private String lampTypeName;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getLampTypeName() {
        return lampTypeName;
    }

    public void setLampTypeName(String lampTypeName) {
        this.lampTypeName = lampTypeName;
    }

    public Integer getLamppostId() {
        return lamppostId;
    }

    public void setLamppostId(Integer lamppostId) {
        this.lamppostId = lamppostId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getLampTypeId() {
        return lampTypeId;
    }

    public void setLampTypeId(Integer lampTypeId) {
        this.lampTypeId = lampTypeId;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    private Integer lamppostId;
    private Integer id;
    private Integer lampTypeId;
    private Date startDate;
    private Date endDate;
    private String description;

    public LamppostLightDTO(String name, String assetId, String lampTypeName, Integer lamppostId,
                            Integer id, Integer lampTypeId, Date startDate, Date endDate, String description) {
        this.name = name;
        this.assetId = assetId;
        this.lampTypeName = lampTypeName;
        this.lamppostId = lamppostId;
        this.id = id;
        this.lampTypeId = lampTypeId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}
