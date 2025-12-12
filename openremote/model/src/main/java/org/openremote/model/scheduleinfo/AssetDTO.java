package org.openremote.model.scheduleinfo;

public class AssetDTO {
    private String id;
    private String name;
    private String realm;
    private String type;
    private String parentId;

    public AssetDTO() {}

    public AssetDTO(String id, String name, String realm, String type, String parentId) {
        this.id = id;
        this.name = name;
        this.realm = realm;
        this.type = type;
        this.parentId = parentId;
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

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}
