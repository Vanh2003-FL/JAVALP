package org.openremote.model.security;

public class UserAndRole {
    private User user;
    private Realm[] realm;

    public UserAndRole() {}

    public UserAndRole(User user, Realm[] realm) {
        this.user = user;
        this.realm = realm;
    }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Realm[] getRealm() { return realm; }

    public void setRealm(Realm[] realm) { this.realm = realm; }
}
