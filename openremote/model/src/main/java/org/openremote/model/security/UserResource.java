/*
 * Copyright 2017, OpenRemote Inc.
 *
 * See the CONTRIBUTORS.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.openremote.model.security;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.openremote.model.Constants;
import org.openremote.model.hdi.hdiDTO.checkRealmEmailDTO.CheckRealmEmailDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.query.UserQuery;

import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * Manage users in realms and get info of current user.
 */
// TODO Relax permissions to allow regular users to maintain their own realm
@Tag(name = "User")
@Path("user")
public interface UserResource {

    @GET
    @Path("{realm}/roles")
    @Produces(APPLICATION_JSON)
    @SuppressWarnings("unusable-by-js")
    @RolesAllowed(Constants.READ_ADMIN_ROLE)
    Role[] getRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm);

    @GET
    @Path("{realm}/{clientId}/roles")
    @Produces(APPLICATION_JSON)
    @SuppressWarnings("unusable-by-js")
    @RolesAllowed(Constants.READ_ADMIN_ROLE)
    Role[] getClientRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("clientId") String clientId);

    @PUT
    @Path("{realm}/roles")
    @Consumes(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void updateRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, Role[] roles);

    @PUT
    @Path("{realm}/{clientId}/roles")
    @Consumes(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void updateClientRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, Role[] roles, @PathParam("clientId") String clientId);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("query")
    User[] query(@BeanParam RequestParams requestParams, UserQuery query);

    @POST
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @Path("query-user-super-admin")
    User[] queryUserSuperAdmin(@BeanParam RequestParams requestParams, UserQuery query);

    @GET
    @Path("{realm}/{userId}")
    @Produces(APPLICATION_JSON)
    User get(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @GET
    @Path("user")
    @Produces(APPLICATION_JSON)
    User getCurrent(@BeanParam RequestParams requestParams);

    @PUT
    @Path("{realm}/users")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    User update(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @Valid User user);

    @PUT
    @Path("{realm}/userExtend")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    User updateExtend(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @Valid User user);

    @POST
    @Path("{realm}/users")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    User create(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @Valid User user);

    @POST
    @Path("login")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    Optional<Map<String, Object>> login(@BeanParam RequestParams requestParams, @Valid AuthenticationRequest authenticationRequest) throws IOException, InterruptedException;


    @POST
    @Path("check/realm")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    CheckRealmEmailDTO checkRealmEmail(@BeanParam RequestParams requestParams, @QueryParam("email") String email);

    @POST
    @Path("check/realm/username")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    CheckRealmEmailDTO checkRealmUsername(@BeanParam RequestParams requestParams, @QueryParam("username") String username);

    @DELETE
    @Path("{realm}/users/{userId}")
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void delete(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @PUT
    @Path("{realm}/reset-password/{userId}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    void resetPassword(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId, Credential credential);

    @PUT
    @Path("/reset-password2")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    void resetPassword2(@BeanParam RequestParams requestParams, Credential credential);

    @GET
    @Path("{realm}/reset-secret/{userId}")
    @Consumes(APPLICATION_JSON)
    @Produces(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    String resetSecret(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @GET
    @Path("{realm}/userRoles/{userId}")
    @Produces(APPLICATION_JSON)
    Role[] getUserRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @GET
    @Path("{realm}/userRoles/{userId}/{clientId}")
    @Produces(APPLICATION_JSON)
    Role[] getUserClientRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId, @PathParam("clientId") String clientId);

    @GET
    @Path("{realm}/userRealmRoles/{userId}")
    @Produces(APPLICATION_JSON)
    Role[] getUserRealmRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @GET
    @Path("userRoles")
    @Produces(APPLICATION_JSON)
    Role[] getCurrentUserRoles(@BeanParam RequestParams requestParams);

    @GET
    @Path("userRoles/{clientId}")
    @Produces(APPLICATION_JSON)
    Role[] getCurrentUserClientRoles(@BeanParam RequestParams requestParams, @PathParam("clientId") String clientId);

    @GET
    @Path("userRealmRoles")
    @Produces(APPLICATION_JSON)
    Role[] getCurrentUserRealmRoles(@BeanParam RequestParams requestParams);

    @PUT
    @Path("{realm}/userRoles/{userId}")
    @Consumes(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void updateUserRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId, Role[] roles);

    @PUT
    @Path("{realm}/userRoles/{userId}/{clientId}")
    @Consumes(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void updateUserClientRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId, Role[] roles, @PathParam("clientId") String clientId);

    @PUT
    @Path("{realm}/userRealmRoles/{userId}")
    @Consumes(APPLICATION_JSON)
    @RolesAllowed(Constants.WRITE_ADMIN_ROLE)
    void updateUserRealmRoles(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId, Role[] roles);

    @GET
    @Path("{realm}/userSessions/{userId}")
    @Produces(APPLICATION_JSON)
    UserSession[] getUserSessions(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("userId") String userId);

    @GET
    @Path("{realm}/disconnect/{sessionID}")
    void disconnectUserSession(@BeanParam RequestParams requestParams, @PathParam("realm") String realm, @PathParam("sessionID") String sessionID);
}
