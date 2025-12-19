package org.openremote.model.security;

import jakarta.validation.constraints.NotNull;


public class AuthenticationRequest {
    @NotNull(message = "NOT_NULL_USERNAME")
    String username;

    @NotNull(message = "NOT_NULL_PASSWORD")
    String password;

    public AuthenticationRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
