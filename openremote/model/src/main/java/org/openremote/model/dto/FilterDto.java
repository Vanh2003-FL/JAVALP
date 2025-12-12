package org.openremote.model.dto;

public class FilterDto {

    private String id;
    private String name;
    private String type;
    private String parentId;
    private String code;

    public FilterDto() {
    }

    public FilterDto(String id, String name, String type, String parentId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
    }

    public FilterDto(String id, String name, String parentId) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
    }

    public FilterDto(String id, String name, String type, String parentId, String code) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.code = code;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getCode() { return code; }

    public void setCode(String code) { this.code = code; }
}
