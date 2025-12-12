package org.openremote.model.hdi.hdiDTO.checkRealmEmailDTO;

public class EmailRealmDTO {
    private String usernameOrEmail;
    private String realm;

    public EmailRealmDTO(String usernameOrEmail, String realm) {
        this.usernameOrEmail = usernameOrEmail;
        this.realm = realm;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }
}
