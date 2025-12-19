/*
 * Copyright 2016, OpenRemote Inc.
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
package org.openremote.manager.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Query;
import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.security.AuthContext;
import org.openremote.container.security.keycloak.KeycloakIdentityProvider;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.exception.UnauthorizedException;
import org.openremote.manager.mqtt.MQTTBrokerService;
import org.openremote.manager.notification.NotificationService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.Constants;
import org.openremote.model.hdi.hdiDTO.checkRealmEmailDTO.CheckRealmEmailDTO;
import org.openremote.model.hdi.hdiDTO.checkRealmEmailDTO.EmailRealmDTO;
import org.openremote.model.hdi.hdiDTO.realmDTO.RealmDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.notification.EmailNotificationMessage;
import org.openremote.model.notification.Notification;
import org.openremote.model.notification.RepeatFrequency;
import org.openremote.model.query.UserQuery;
import org.openremote.model.query.filter.RealmPredicate;
import org.openremote.model.query.filter.StringPredicate;
import org.openremote.model.security.*;

import jakarta.ws.rs.*;

import java.util.*;
import java.util.stream.Collectors;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.openremote.container.security.keycloak.KeycloakIdentityProvider.OR_KEYCLOAK_HOST_DEFAULT;
import static org.openremote.container.security.keycloak.KeycloakIdentityProvider.OR_KEYCLOAK_PORT_DEFAULT;
import static org.openremote.model.Constants.KEYCLOAK_CLIENT_ID;
import static org.openremote.model.Constants.MASTER_REALM;
import static org.openremote.model.notification.Notification.Source.INTERNAL;

import java.io.IOException;
import java.net.http.*;
import java.net.URI;
//import org.json.*;

public class UserResourceImpl extends ManagerWebResource implements UserResource {

    protected MQTTBrokerService mqttBrokerService;
    PersistenceService persistenceService;
    MessageBrokerService messageBrokerService;

    public UserResourceImpl(
            TimerService timerService,
            ManagerIdentityService identityService,
            MQTTBrokerService mqttBrokerService,
            MessageBrokerService messageBrokerService,
            PersistenceService persistenceService) {
        super(timerService, identityService);
        this.mqttBrokerService = mqttBrokerService;
        this.persistenceService = persistenceService;
        this.messageBrokerService = messageBrokerService;
    }

    @Override
    public User[] query(RequestParams requestParams, UserQuery query) {
        AuthContext authContext = getAuthContext();
        boolean isAdmin = authContext.hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);
        boolean isRestricted = !isAdmin && authContext.hasResourceRole(ClientRole.READ_USERS.getValue(), Constants.KEYCLOAK_CLIENT_ID);

        if (!isAdmin && !isRestricted) {
            throw new ForbiddenException("Insufficient permissions to read users");
        }

        if (query == null) {
            query = new UserQuery();
        }

        if (isRestricted) {
            if (query.select == null) {
                query.select = new UserQuery.Select();
            }
            query.select.basic(true);
        }

        if (!authContext.isSuperUser()) {
            // Force realm to match users
            query.realm(new RealmPredicate(authContext.getAuthenticatedRealmName()));

            // Hide system accounts from non super users
            if (query.attributes == null) {
                query.attributes(new UserQuery.AttributeValuePredicate(true, new StringPredicate(User.SYSTEM_ACCOUNT_ATTRIBUTE), null));
            } else {
                List<UserQuery.AttributeValuePredicate> attributeValuePredicates = new ArrayList<>(Arrays.asList(query.attributes));
                attributeValuePredicates.add(new UserQuery.AttributeValuePredicate(true, new StringPredicate(User.SYSTEM_ACCOUNT_ATTRIBUTE), null));
                query.attributes(attributeValuePredicates.toArray(UserQuery.AttributeValuePredicate[]::new));
            }
        }

        // Prevent service

        try {
            return identityService.getIdentityProvider().queryUsers(query);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public User[] queryUserSuperAdmin(RequestParams requestParams, UserQuery query) {
        AuthContext authContext = getAuthContext();
        if (authContext.isSuperUser()) {
            return query(requestParams, query);
        }
        return null;

    }

    @Override
    public User get(RequestParams requestParams, String realm, String userId) {
        boolean hasAdminReadRole = hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);

        if (!hasAdminReadRole && !Objects.equals(getUserId(), userId)) {
            throw new ForbiddenException("Can only retrieve own user info unless you have role '" + ClientRole.READ_ADMIN + "'");
        }

        try {
            User user = identityService.getIdentityProvider().getUser(
                    userId
            );
            if (!isSuperUser()) {
                user.setRealms(identityService.getIdentityProvider().getRealmAll(realm));
            } else {
                user.setRealms(identityService.getIdentityProvider().getRealmAll(null));
            }
            Role[] roles = Arrays.stream(identityService.getIdentityProvider().getUserRoles(
                            realm,
                            userId,
                            KEYCLOAK_CLIENT_ID)).filter(r -> Boolean.TRUE.equals(r.isAssigned()))
                    .toArray(Role[]::new);

            user.setRoles(roles);

            return user;

        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public User getCurrent(RequestParams requestParams) {
        if (!isAuthenticated()) {
            throw new ForbiddenException("Must be authenticated");
        }
        return get(requestParams, getRequestRealmName(), getUserId());
    }

    @Override
    public User update(RequestParams requestParams, String realm, User user) {

        throwIfIllegalMasterAdminUserMutation(requestParams, realm, user);

        try {
            return identityService.getIdentityProvider().createUpdateUser(realm, user, null, true);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (WebApplicationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public User updateExtend(RequestParams requestParams, String realm, User user) {
        try {
            return identityService.getIdentityProvider().updateUserExtend(user);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (WebApplicationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public User create(RequestParams requestParams, String realm, User user) {

        try {
            return identityService.getIdentityProvider().createUpdateUser(realm, user, null, false);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (WebApplicationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    private static final String KEYCLOAK_BASE_URL = "http://" + OR_KEYCLOAK_HOST_DEFAULT + ":" + OR_KEYCLOAK_PORT_DEFAULT + "/auth";
    private static final String CLIENT_ID = "openremote"; // <-- Update this
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Optional<Map<String, Object>> login(RequestParams requestParams, AuthenticationRequest authenticationRequest) throws IOException, InterruptedException {

        // get all realm
        List<String> REALMS = persistenceService.doReturningTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery("SELECT r.name FROM public.realm as r");
            List<String> realms = query.getResultList();
            if (realms.isEmpty()) {
                throw new NotFoundException("No realms found");
            }
            return realms;

        });
        HttpClient client = HttpClient.newHttpClient();

        for (String realm : REALMS) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(KEYCLOAK_BASE_URL + "/realms/" + realm + "/protocol/openid-connect/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            "grant_type=password&client_id=" + CLIENT_ID +
                                    "&username=" + authenticationRequest.getUsername() +
                                    "&password=" + authenticationRequest.getPassword()
                    ))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> resultMap = objectMapper.readValue(response.body(), Map.class);
                resultMap.put("realm", realm);
                return Optional.of(resultMap);
            }
        }

        return Optional.empty();
    }

    @Override
    public CheckRealmEmailDTO checkRealmEmail(RequestParams requestParams, String email) {
        return persistenceService.doReturningTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery("SELECT * FROM get_user_realm(:email)", EmailRealmDTO.class);
            query.setParameter("email", email);

            List<EmailRealmDTO> results = query.getResultList();

            // Nhóm các realm theo email
            Map<String, List<EmailRealmDTO>> groupedResults = results.stream()
                    .collect(Collectors.groupingBy(EmailRealmDTO::getUsernameOrEmail));

            // Chuyển danh sách realms sang CheckRealmEmailDTO
            CheckRealmEmailDTO response = new CheckRealmEmailDTO(email);
            if (groupedResults.containsKey(email)) {
                List<RealmDTO> realmList = groupedResults.get(email).stream()
                        .map(er -> new RealmDTO(er.getRealm()))
                        .collect(Collectors.toList());
                response.setRealms(realmList);
            }

            return response;
        });
    }

    @Override
    public CheckRealmEmailDTO checkRealmUsername(RequestParams requestParams, String username) {
        return persistenceService.doReturningTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery("SELECT u.username, r.name as realm " +
                    "FROM public.user_entity u " +
                    "JOIN public.realm r ON u.realm_id = r.id " +
                    "WHERE u.username = :username", EmailRealmDTO.class);
            query.setParameter("username", username);

            List<EmailRealmDTO> results = query.getResultList();

            // Nhóm các realm theo email
            Map<String, List<EmailRealmDTO>> groupedResults = results.stream()
                    .collect(Collectors.groupingBy(EmailRealmDTO::getUsernameOrEmail));

            // Chuyển danh sách realms sang CheckRealmEmailDTO
            CheckRealmEmailDTO response = new CheckRealmEmailDTO(username);
            if (groupedResults.containsKey(username)) {
                List<RealmDTO> realmList = groupedResults.get(username).stream()
                        .map(er -> new RealmDTO(er.getRealm()))
                        .collect(Collectors.toList());
                response.setRealms(realmList);
            }

            return response;
        });
    }


    @Override
    public void delete(RequestParams requestParams, String realm, String userId) {
        throwIfIllegalMasterAdminUserDeletion(requestParams, realm, userId);

        try {
            identityService.getIdentityProvider().deleteUser(realm, userId);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (WebApplicationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public void resetPassword2(@BeanParam RequestParams requestParams, Credential credential) {
        try {
            String realm = getRequestRealm().getName();
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(KEYCLOAK_BASE_URL + "/realms/" + realm + "/protocol/openid-connect/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            "grant_type=password&client_id=" + CLIENT_ID +
                                    "&username=" + getUsername() +
                                    "&password=" + credential.getOldPassword()
                    ))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                identityService.getIdentityProvider().resetPassword(realm, getUserId(), credential);
            } else {
                if (response.statusCode() == 401) {
                    throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
                }

            }

        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (UnauthorizedException ex) {
            throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public void resetPassword(@BeanParam RequestParams requestParams, String realm, String userId, Credential credential) {
        try {
            identityService.getIdentityProvider().resetPassword(realm, userId, credential);
            Map<String, Object> headers = new HashMap<>();
            headers.put(Notification.HEADER_SOURCE, INTERNAL);

            if (isAuthenticated()) {
                headers.put(Constants.AUTH_CONTEXT, getAuthContext());
            }

            User user = get(requestParams, realm, userId);
            EmailNotificationMessage emailMessage = new EmailNotificationMessage()
                    .setSubject("[HOMICO IOT Platform] Reset mật khẩu thành công cho tài khoản " + user.getUsername())
//                    .setHtml(htmlRV);
                    .setText("Username: " + user.getUsername() + "\n" +
                            "Mật khẩu mới: " + credential.getValue() + "\n" +
                            "Vui lòng đăng nhập và thay đổi mật khẩu mới sau khi đăng nhập thành công.");

            // Tạo Target kiểu USER
            Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, userId);

            // Tạo Notification
            Notification notification = new Notification()
                    .setName("[HOMICO IOT Platform] Cảnh báo tủ không gửi về dữ liệu ")
                    .setMessage(emailMessage)
                    .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
                    ;
            notification.setTargets(Collections.singletonList(userTarget));


            boolean success = messageBrokerService.getFluentProducerTemplate()
                    .withBody(notification)
                    .withHeaders(headers)
                    .to(NotificationService.NOTIFICATION_QUEUE)
                    .request(Boolean.class);

            if (!success) {
                throw new WebApplicationException(BAD_REQUEST);
            }
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public String resetSecret(RequestParams requestParams, String realm, String userId) {
        try {
            return identityService.getIdentityProvider().resetSecret(realm, userId, null);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public Role[] getCurrentUserRoles(RequestParams requestParams) {
        return getCurrentUserClientRoles(requestParams, KEYCLOAK_CLIENT_ID);
    }

    @Override
    public Role[] getCurrentUserClientRoles(RequestParams requestParams, String clientId) {
        if (!isAuthenticated()) {
            throw new ForbiddenException("Must be authenticated");
        }

        return getUserClientRoles(requestParams, getRequestRealmName(), getUserId(), clientId);
    }

    @Override
    public Role[] getCurrentUserRealmRoles(RequestParams requestParams) {
        if (!isAuthenticated()) {
            throw new ForbiddenException("Must be authenticated");
        }

        return getUserRealmRoles(requestParams, getRequestRealmName(), getUserId());
    }

    @Override
    public Role[] getUserRoles(RequestParams requestParams, String realm, String userId) {
        return getUserClientRoles(requestParams, realm, userId, KEYCLOAK_CLIENT_ID);
    }

    @Override
    public Role[] getUserClientRoles(@BeanParam RequestParams requestParams, String realm, String userId, String clientId) {
        boolean hasAdminReadRole = hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);

        if (!hasAdminReadRole && !Objects.equals(getUserId(), userId)) {
            throw new ForbiddenException("Can only retrieve own user roles unless you have role '" + ClientRole.READ_ADMIN + "'");
        }

        try {
            return identityService.getIdentityProvider().getUserRoles(
                    realm, userId, clientId
            );
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public Role[] getUserRealmRoles(RequestParams requestParams, String realm, String userId) {
        boolean hasAdminReadRole = hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);

        if (!hasAdminReadRole && !Objects.equals(getUserId(), userId)) {
            throw new ForbiddenException("Can only retrieve own user roles unless you have role '" + ClientRole.READ_ADMIN + "'");
        }

        try {
            return identityService.getIdentityProvider().getUserRealmRoles(
                    realm, userId
            );
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public void updateUserRoles(RequestParams requestParams, String realm, String userId, Role[] roles) {
        updateUserClientRoles(requestParams, realm, userId, roles, KEYCLOAK_CLIENT_ID);
    }

    @Override
    public void updateUserClientRoles(@BeanParam RequestParams requestParams, String realm, String userId, Role[] roles, String clientId) {
        try {
            identityService.getIdentityProvider().updateUserRoles(
                    realm,
                    userId,
                    clientId,
                    Arrays.stream(roles)
                            .filter(Role::isAssigned)
                            .map(Role::getName)
                            .toArray(String[]::new));
        } catch (ClientErrorException ex) {
            ex.printStackTrace(System.out);
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public void updateUserRealmRoles(RequestParams requestParams, String realm, String userId, Role[] roles) {
        try {
            identityService.getIdentityProvider().updateUserRealmRoles(
                    realm,
                    userId,
                    Arrays.stream(roles)
                            .filter(Role::isAssigned)
                            .map(Role::getName)
                            .toArray(String[]::new));
        } catch (ClientErrorException ex) {
            ex.printStackTrace(System.out);
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public Role[] getRoles(RequestParams requestParams, String realm) {
        return getClientRoles(requestParams, realm, KEYCLOAK_CLIENT_ID);
    }

    @Override
    public Role[] getClientRoles(RequestParams requestParams, String realm, String clientId) {
        try {
            return identityService.getIdentityProvider().getRoles(
                    realm,
                    clientId);
        } catch (ClientErrorException ex) {
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new WebApplicationException(ex);
        }
    }

    @Override
    public void updateRoles(RequestParams requestParams, String realm, Role[] roles) {
        updateClientRoles(requestParams, realm, roles, KEYCLOAK_CLIENT_ID);
    }

    @Override
    public void updateClientRoles(RequestParams requestParams, String realm, Role[] roles, String clientId) {
        try {
            identityService.getIdentityProvider().updateClientRoles(
                    realm,
                    clientId,
                    roles);
        } catch (ClientErrorException ex) {
            ex.printStackTrace(System.out);
            throw new WebApplicationException(ex.getCause(), ex.getResponse().getStatus());
        } catch (Exception ex) {
            throw new NotFoundException(ex);
        }
    }

    @Override
    public UserSession[] getUserSessions(RequestParams requestParams, String realm, String userId) {
        boolean hasAdminReadRole = hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);

        if (!hasAdminReadRole && !Objects.equals(getUserId(), userId)) {
            throw new ForbiddenException("Can only retrieve own user sessions unless you have role '" + ClientRole.READ_ADMIN + "'");
        }

        return mqttBrokerService.getUserConnections(userId).stream().map(connection -> new UserSession(
                MQTTBrokerService.getConnectionIDString(connection),
                connection.getSubject() != null ? KeycloakIdentityProvider.getSubjectName(connection.getSubject()) : userId,
                connection.getCreationTime(),
                connection.getRemoteAddress())).toArray(UserSession[]::new);
    }

    @Override
    public void disconnectUserSession(RequestParams requestParams, String realm, String sessionID) {
        if (!mqttBrokerService.disconnectSession(sessionID)) {
            throw new NotFoundException("User session not found");
        }
    }

    protected void throwIfIllegalMasterAdminUserDeletion(RequestParams requestParams, String realm, String userId) throws WebApplicationException {
        if (!realm.equals(MASTER_REALM)) {
            return;
        }

        if (!identityService.getIdentityProvider().isMasterRealmAdmin(userId)) {
            return;
        }

        throw new NotAllowedException("The master realm admin user cannot be deleted");
    }

    protected void throwIfIllegalMasterAdminUserMutation(RequestParams requestParams, String realm, User user) throws WebApplicationException {
        if (!realm.equals(MASTER_REALM)) {
            return;
        }

        if (!identityService.getIdentityProvider().isMasterRealmAdmin(user.getId())) {
            return;
        }

        if (user.getEnabled() == null || !user.getEnabled()) {
            throw new NotAllowedException("The master realm admin user cannot be disabled");
        }
    }
}

