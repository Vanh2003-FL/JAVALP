package org.openremote.model.hdi.hdiDTO.realmDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RealmDTO {
    private String id;
    private String realm;
    private String  displayName;

    public RealmDTO(String id, String realm, String displayName) {
        this.id = id;
        this.realm = realm;
        this.displayName = displayName;
    }

    public RealmDTO(String realm) {
        this.realm = realm;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
