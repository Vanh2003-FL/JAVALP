package org.openremote.model.hdi.hdiDTO.checkRealmEmailDTO;

import org.openremote.model.hdi.hdiDTO.realmDTO.RealmDTO;

import java.util.List;

public class CheckRealmEmailDTO {
    String email;
    List<RealmDTO>  realms;

    public CheckRealmEmailDTO(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<RealmDTO> getRealms() {
        return realms;
    }

    public void setRealms(List<RealmDTO> realms) {
        this.realms = realms;
    }
}
