package org.openremote.model.routeInfo;

import java.util.Map;

public class AssetV2 {
    private String id;
    private String name;
    private String type;
    private Map<String, Object> attributes;

    public AssetV2() {}

    public AssetV2(String id, String name, String type, Map<String, Object> attributes) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.attributes = attributes;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
}
