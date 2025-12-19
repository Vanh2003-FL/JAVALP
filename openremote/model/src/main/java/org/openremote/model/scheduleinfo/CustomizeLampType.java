package org.openremote.model.scheduleinfo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.beans.Transient;
import java.io.Serializable;
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomizeLampType implements Serializable {

    @JsonProperty("lamp_type_id")
    private Integer lampTypeId;


    @JsonProperty("lamp_type_value")
    private String lampTypeValue;


    @JsonProperty("lamp_type_name")
    private String lampTypeName;


    private Integer time_id;

    public CustomizeLampType() {}

    public CustomizeLampType(Integer lampTypeId, String lampTypeValue, String lampTypeName, Integer time_id) {
        this.lampTypeId = lampTypeId;
        this.lampTypeValue = lampTypeValue;
        this.lampTypeName = lampTypeName;
        this.time_id = time_id;
    }

// Getters và setters cho các trường hiện có

    public Integer getLampTypeId() {
        return lampTypeId;
    }

    public void setLampTypeId(Integer lampTypeId) {
        this.lampTypeId = lampTypeId;
    }


    public String getLampTypeValue() {
        return lampTypeValue;
    }

    public void setLampTypeValue(String lampTypeValue) {
        this.lampTypeValue = lampTypeValue;
    }
    public Integer getTime_id() {
        return time_id;
    }

    public void setTime_id(Integer time_id) {
        this.time_id = time_id;
    }

    public String getLampTypeName() {
        return lampTypeName;
    }

    public void setLampTypeName(String lampTypeName) {
        this.lampTypeName = lampTypeName;
    }
}
