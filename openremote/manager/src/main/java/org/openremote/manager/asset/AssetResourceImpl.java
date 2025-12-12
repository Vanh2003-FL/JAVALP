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
package org.openremote.manager.asset;

import com.fasterxml.jackson.databind.node.NullNode;
import jakarta.persistence.OptimisticLockException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.plugins.validation.ResteasyViolationExceptionImpl;
import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.cabinet.CabinetAssetPersistenceService;
import org.openremote.manager.assetInfo.AssetInfoPersistenceService;
import org.openremote.manager.cabinetGroup.CabinetGroupPersistenceService;
import org.openremote.manager.datapoint.AssetDatapointService;
import org.openremote.manager.event.ClientEventService;
import org.openremote.manager.scheduleInfo.ErrorMessage;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.sys.SysAssetTypePersistenceService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.Constants;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.AssetResource;
import org.openremote.model.asset.UserAssetLink;
import org.openremote.model.asset.cabinet.CabinetAssetDTO;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.asset.impl.RoadAsset;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.attribute.*;
import org.openremote.model.cabinetGroup.CabinetGroup;
import org.openremote.model.cabinetGroup.CabinetGroupLight;
import org.openremote.model.datapoint.AssetDatapoint;
import org.openremote.model.dto.*;
import org.openremote.model.hdi.hdiDTO.commandDTO.LightCommand3Control2;
import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteAssetCreateDTO;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;
import org.openremote.model.http.RequestParams;
import org.openremote.model.query.AssetQuery;
import org.openremote.model.query.filter.AttributePredicate;
import org.openremote.model.query.filter.RealmPredicate;
import org.openremote.model.query.filter.StringPredicate;
import org.openremote.model.routeInfoV.RouteInfoVException;
import org.openremote.model.security.ClientRole;
import org.openremote.model.util.TextUtil;
import org.openremote.model.util.ValueUtil;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.IntStream;

import static jakarta.ws.rs.core.Response.Status.*;
import static org.openremote.manager.asset.AssetProcessingService.*;
import static org.openremote.model.query.AssetQuery.Access;
import static org.openremote.model.value.MetaItemType.*;

public class AssetResourceImpl extends ManagerWebResource implements AssetResource {

    private static final Logger LOG = Logger.getLogger(AssetResourceImpl.class.getName());
    protected final AssetStorageService assetStorageService;
    protected final MessageBrokerService messageBrokerService;
    protected final ClientEventService clientEventService;
    protected final AssetInfoPersistenceService assetInfoPersistenceService;
    protected final SysAssetTypePersistenceService sysAssetTypePersistenceService;
    protected AssetDatapointService assetDatapointService;
    protected CabinetGroupPersistenceService cabinetGroupPersistenceService;
    protected CabinetAssetPersistenceService cabinetAssetPersistenceService;

    public AssetResourceImpl(TimerService timerService,
                             ManagerIdentityService identityService,
                             AssetStorageService assetStorageService,
                             MessageBrokerService messageBrokerService,
                             ClientEventService clientEventService,
                             AssetInfoPersistenceService assetInfoPersistenceService,
                             SysAssetTypePersistenceService sysAssetTypePersistenceService,
                             AssetDatapointService assetDatapointService,
                             CabinetGroupPersistenceService cabinetGroupPersistenceService,
                             CabinetAssetPersistenceService cabinetAssetPersistenceService) {
        super(timerService, identityService);
        this.assetStorageService = assetStorageService;
        this.messageBrokerService = messageBrokerService;
        this.clientEventService = clientEventService;

        this.assetInfoPersistenceService = assetInfoPersistenceService;
        this.sysAssetTypePersistenceService = sysAssetTypePersistenceService;
        this.assetDatapointService = assetDatapointService;
        this.cabinetGroupPersistenceService = cabinetGroupPersistenceService;
        this.cabinetAssetPersistenceService = cabinetAssetPersistenceService;
    }

    @Override
    public Asset<?>[] getCurrentUserAssets(RequestParams requestParams) {
        try {
            if (isSuperUser()) {
                return new Asset<?>[0];
            }

            if (!isAuthenticated()) {
                throw new NotAuthorizedException("Must be authenticated");
            }

            AssetQuery query = new AssetQuery().userIds(getUserId());

            if (!assetStorageService.authorizeAssetQuery(query, getAuthContext(), getRequestRealmName())) {
                throw new ForbiddenException("User not authorized to execute specified query");
            }

            List<Asset<?>> assets = assetStorageService.findAll(query);

            // Compress response (the request attribute enables the interceptor)
            request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

            return assets.toArray(new Asset[0]);
        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, BAD_REQUEST);
        }
    }

    @Override
    public AssetInfoDtoWrapper findDisconnectLights(String realm) {

        List<Asset<?>> assets = assetStorageService.findAll(
                new AssetQuery()
                        .select(new AssetQuery.Select().excludeAttributes())
                        .realm(new RealmPredicate(realm))
                        .types(LightAsset.class)
                        .attributes(new AttributePredicate("assetStatus", new StringPredicate(Constants.DISCONNECT)))
        );

        if (assets == null || assets.isEmpty()) {
            return new AssetInfoDtoWrapper();
        }

        List<AssetInfoDto> assetInfoDtos = new ArrayList<>(assets.size());

        for (Asset<?> asset : assets) {
            Asset_Info assetInfo = assetInfoPersistenceService.getById(asset.getId());

            AssetInfoDto dto = new AssetInfoDto();
            dto.setAsset(asset);
            dto.setInfoDTO(assetInfo);
            assetInfoDtos.add(dto);
        }

        AssetInfoDtoWrapper wrapper = new AssetInfoDtoWrapper();
        wrapper.setAssetInfoDto(assetInfoDtos);
        wrapper.setCount((long) assets.size());

        return wrapper;
    }

    @Override
    public UserAssetLink[] getUserAssetLinks(RequestParams requestParams, String realm, String userId, String assetId) {
        try {
            realm = TextUtil.isNullOrEmpty(realm) ? getAuthenticatedRealmName() : realm;
            boolean hasAdminReadRole = hasResourceRole(ClientRole.READ_ADMIN.getValue(), Constants.KEYCLOAK_CLIENT_ID);

            if (realm == null)
                throw new WebApplicationException(BAD_REQUEST);

            if (!(isSuperUser() || getAuthenticatedRealmName().equals(realm)))
                throw new WebApplicationException(FORBIDDEN);

            if (!hasAdminReadRole && userId != null && !Objects.equals(getUserId(), userId)) {
                throw new ForbiddenException("Can only retrieve own asset links unless you have role '" + ClientRole.READ_ADMIN + "'");
            }

            if (userId != null && !identityService.getIdentityProvider().isUserInRealm(userId, realm))
                throw new WebApplicationException(BAD_REQUEST);

            UserAssetLink[] result = assetStorageService.findUserAssetLinks(realm, userId, assetId).toArray(new UserAssetLink[0]);

            // Compress response (the request attribute enables the interceptor)
            request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

            return result;

        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, BAD_REQUEST);
        }
    }


    @Override
    public void createUserAssetLinks(RequestParams requestParams, List<UserAssetLink> userAssetLinks) {

        // Restricted users cannot create or delete links
        if (isRestrictedUser()) {
            throw new WebApplicationException(FORBIDDEN);
        }

        // Check all links are for the same user and realm
        String realm = userAssetLinks.get(0).getId().getRealm();
        String userId = userAssetLinks.get(0).getId().getUserId();
        String[] assetIds = new String[userAssetLinks.size()];

        IntStream.range(0, userAssetLinks.size()).forEach(i -> {
            UserAssetLink userAssetLink = userAssetLinks.get(i);
            assetIds[i] = userAssetLink.getId().getAssetId();

            if (!userAssetLink.getId().getRealm().equals(realm) || !userAssetLink.getId().getUserId().equals(userId)) {
                throw new BadRequestException("All user asset links must be for the same user");
            }
        });

        if (!isSuperUser() && !realm.equals(getAuthenticatedRealmName())) {
            throw new WebApplicationException(FORBIDDEN);
        }

        if (!identityService.getIdentityProvider().isUserInRealm(userId, realm)) {
            throw new WebApplicationException(FORBIDDEN);
        }

        List<Asset<?>> assets = assetStorageService.findAll(
                new AssetQuery()
                        .select(new AssetQuery.Select().excludeAttributes())
                        .realm(new RealmPredicate(realm))
                        .ids(assetIds)
        );

        if (assets.size() != userAssetLinks.size()) {
            throw new BadRequestException("One or more asset IDs are invalid");
        }

        try {
            assetStorageService.storeUserAssetLinks(userAssetLinks);
        } catch (Exception e) {
            throw new WebApplicationException(BAD_REQUEST);
        }
    }

    @Override
    public void deleteUserAssetLink(RequestParams requestParams, String realm, String userId, String assetId) {
        deleteUserAssetLinks(requestParams, Collections.singletonList(new UserAssetLink(realm, userId, assetId)));
    }

    @Override
    public void reloadBUIE(RequestParams requestParams, String assetId) {
        assetStorageService.reloadBUIE(assetId);
    }

    @Override
    public void deleteAllUserAssetLinks(RequestParams requestParams, String realm, String userId) {
        // Restricted users cannot create or delete links
        if (isRestrictedUser()) {
            throw new WebApplicationException(FORBIDDEN);
        }

        // Regular users in a different realm can not delete links
        if (!isSuperUser() && !getAuthenticatedRealm().getName().equals(realm)) {
            throw new WebApplicationException(FORBIDDEN);
        }

        // User must be in the same realm as the requested realm
        if (!identityService.getIdentityProvider().isUserInRealm(userId, realm)) {
            throw new WebApplicationException(FORBIDDEN);
        }

        assetStorageService.deleteUserAssetLinks(userId);
    }

    @Override
    public void deleteUserAssetLinks(RequestParams requestParams, List<UserAssetLink> userAssetLinks) {
        // Restricted users cannot create or delete links
        if (isRestrictedUser()) {
            throw new WebApplicationException(FORBIDDEN);
        }

        // Check all links are for the same user and realm
        String realm = userAssetLinks.get(0).getId().getRealm();
        String userId = userAssetLinks.get(0).getId().getUserId();

        if (userAssetLinks.stream().anyMatch(userAssetLink -> !userAssetLink.getId().getRealm().equals(realm) || !userAssetLink.getId().getUserId().equals(userId))) {
            throw new BadRequestException("All user asset links must be for the same user");
        }

        // Regular users in a different realm can not delete links
        if (!isSuperUser() && !getAuthenticatedRealm().getName().equals(realm)) {
            throw new WebApplicationException(FORBIDDEN);
        }

        // If delete count doesn't equal link count an exception will be thrown
        try {
            assetStorageService.deleteUserAssetLinks(userAssetLinks);
        } catch (Exception e) {
            LOG.log(Level.INFO, "Failed to delete user asset links", e);
            throw new BadRequestException();
        }
    }

    @Override
    public Asset<?> getPartial(RequestParams requestParams, String assetId) {
        return get(requestParams, assetId, false);
    }

    @Override
    public AssetInfoDto get(RequestParams requestParams, String assetId) {
        Asset<?> asset = get(requestParams, assetId, true);
        Asset_Info assetInfo = assetInfoPersistenceService.getById(assetId);
        return new AssetInfoDto(asset, assetInfo);
    }
    protected final  String[] publicAsset2={ELECTRICAL_CABINET_ASSET,LIGHT_ASSET};
    private boolean  isPublicAsset2(String assetType) {
        return Arrays.stream(publicAsset2)
                .anyMatch(assetType::matches);
    }

    @Override
    public List<AssetInfoDto> getAsset(RequestParams requestParams, String assetId) {
        List<AssetInfoDto> returns = new ArrayList<>();

        Asset<?> asset = get(requestParams, assetId, true);
        if(asset==null){
            throw new WebApplicationException(NOT_FOUND);
        }

        if(asset.getType().equals(ELECTRICAL_CABINET_ASSET)){
            Asset_Info assetInfo = assetInfoPersistenceService.getAssetById(assetId);
            if(assetInfo!=null){
                assetInfo.setDeletedRA(assetInfoPersistenceService.getDeletedRouteAssetsById(assetId));
                assetInfo.setLightNumberInCabinet(assetInfoPersistenceService.getLightNumberInCabinet(assetId));
            }
            returns.add(new AssetInfoDto(asset,assetInfo));
        }

        if(asset.getType().equals(LIGHT_ASSET)){
            Asset_Info assetInfo = assetInfoPersistenceService.getAssetById(assetId);
            returns.add(new AssetInfoDto(asset,assetInfo));
        }

        if(!isPublicAsset2(asset.getAssetType())){
            Asset_Info assetInfo = assetInfoPersistenceService.getAssetById(assetId);
            returns.add(new AssetInfoDto(asset,assetInfo));


            AssetInfoDto[] ch=queryAssets(requestParams, new AssetQuery().ids(
                    assetStorageService.usrSpGetAssetInfoListByParentId(assetId)
                            .stream().map(LightCommand3Control2::getId).toArray(String[]::new)).recursive(true));

            returns.addAll(Arrays.asList(ch));

        }

        return returns ;
    }

    @Override
    public LampTypeAssetDTO getInfoLightAsset(RequestParams requestParams, String assetId) {
        return assetInfoPersistenceService.getInfoLightAsset(assetId);
    }

    public Asset<?> get(RequestParams requestParams, String assetId, boolean loadComplete) {
        try {
            Asset<?> asset;

            // Check restricted
            if (isRestrictedUser()) {
                if (!assetStorageService.isUserAsset(getUserId(), assetId)) {
                    LOG.fine("Forbidden access for restricted user: username=" + getUsername() + ", assetID=" + assetId);
                    throw new WebApplicationException(FORBIDDEN);
                }
                asset = assetStorageService.find(assetId, loadComplete, Access.PROTECTED);
            } else {
                asset = assetStorageService.find(assetId, loadComplete);
            }

            if (asset == null)
                throw new WebApplicationException(NOT_FOUND);

            if (!isRealmActiveAndAccessible(asset.getRealm())) {
                LOG.fine("Forbidden access (realm '" + asset.getRealm() + "' nonexistent, inactive or inaccessible) for user: " + getUsername());
                throw new WebApplicationException(FORBIDDEN);
            }

            // Compress response (the request attribute enables the interceptor)
            request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

            return asset;


        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, BAD_REQUEST);
        }
    }

    @Override
    public AssetInfoDto update(RequestParams requestParams, String assetId, AssetInfoDto assetInfoDto, List<String> childIds) {

        LOG.fine("Updating asset: assetID=" + assetId);

        try {
            Asset<?> storageAsset = assetStorageService.find(assetId, true);

            if (storageAsset == null) {
                LOG.fine("Asset not found: assetID=" + assetId);
                throw new WebApplicationException(NOT_FOUND);
            }

            Asset<?> asset = assetInfoDto.getAsset();
            Asset_Info info = assetInfoDto.getInfoDTO();

            // Realm of asset must be accessible
            if (!isRealmActiveAndAccessible(storageAsset.getRealm())) {
                LOG.fine("Realm '" + storageAsset.getRealm() + "' is nonexistent, inactive or inaccessible: username=" + getUsername() + ", assetID=" + assetId);
                throw new WebApplicationException(FORBIDDEN);
            }

            if (!storageAsset.getRealm().equals(asset.getRealm())) {
                LOG.fine("Cannot change asset's realm: existingRealm=" + storageAsset.getRealm() + ", requestedRealm=" + asset.getRealm());
                throw new WebApplicationException(FORBIDDEN);
            }

            if (!storageAsset.getType().equals(asset.getType())) {
                LOG.fine("Cannot change asset's type: existingType=" + storageAsset.getType() + ", requestedType=" + asset.getType());
                throw new WebApplicationException(FORBIDDEN);
            }

            boolean isRestrictedUser = isRestrictedUser();

            // The asset that will ultimately be stored (override/ignore some values for restricted users)
            storageAsset.setVersion(asset.getVersion());

            if (!isRestrictedUser) {
                storageAsset.setName(asset.getName());
                storageAsset.setParentId(asset.getParentId());
                storageAsset.setAccessPublicRead(asset.isAccessPublicRead());
                storageAsset.setAttributes(asset.getAttributes());
            }

            // For restricted users, merge existing and updated attributes depending on write permissions
            if (isRestrictedUser) {

                if (!assetStorageService.isUserAsset(getUserId(), assetId)) {
                    throw new WebApplicationException(FORBIDDEN);
                }

                // Merge updated with existing attributes
                for (Attribute<?> updatedAttribute : asset.getAttributes().values()) {

                    // Proper validation happens on merge(), here we only need the name to continue
                    String updatedAttributeName = updatedAttribute.getName();

                    // Check if attribute is present on the asset in storage
                    Optional<Attribute<Object>> serverAttribute = storageAsset.getAttribute(updatedAttributeName);
                    if (serverAttribute.isPresent()) {
                        Attribute<?> existingAttribute = serverAttribute.get();

                        // If the existing attribute is not writable by restricted client, ignore it
                        if (!existingAttribute.getMetaValue(ACCESS_RESTRICTED_WRITE).orElse(false)) {
                            LOG.fine("Existing attribute not writable by restricted client, ignoring update of: " + updatedAttributeName);
                            continue;
                        }

                        // Merge updated with existing meta items (modifying a copy)
                        MetaMap updatedMetaItems = updatedAttribute.getMeta();
                        // Ensure access meta is not modified
                        updatedMetaItems.removeIf(mi -> {
                            if (mi.getName().equals(ACCESS_RESTRICTED_READ.getName())) {
                                return true;
                            }
                            if (mi.getName().equals(ACCESS_RESTRICTED_WRITE.getName())) {
                                return true;
                            }
                            if (mi.getName().equals(ACCESS_PUBLIC_READ.getName())) {
                                return true;
                            }
                            if (mi.getName().equals(ACCESS_PUBLIC_WRITE.getName())) {
                                return true;
                            }
                            return false;
                        });

                        MetaMap existingMetaItems = ValueUtil.clone(existingAttribute.getMeta());

                        existingMetaItems.addOrReplace(updatedMetaItems);

                        // Replace existing with updated attribute
                        updatedAttribute.setMeta(existingMetaItems);
                        storageAsset.getAttributes().addOrReplace(updatedAttribute);

                    } else {

                        // An attribute added by a restricted user must be readable by restricted users
                        updatedAttribute.addOrReplaceMeta(new MetaItem<>(ACCESS_RESTRICTED_READ, true));

                        // An attribute added by a restricted user must be writable by restricted users
                        updatedAttribute.addOrReplaceMeta(new MetaItem<>(ACCESS_RESTRICTED_WRITE, true));

                        // Add the new attribute
                        storageAsset.getAttributes().addOrReplace(updatedAttribute);
                    }
                }

                // Remove missing attributes
                storageAsset.getAttributes().removeIf(existingAttribute ->
                        !asset.hasAttribute(existingAttribute.getName()) && existingAttribute.getMetaValue(ACCESS_RESTRICTED_WRITE).orElse(false)
                );

            }

//            // If attribute is type RULES_TEMPLATE_FILTER, enforce meta item RULE_STATE
//            // TODO Only done for update(Asset) and not create(Asset) as we don't need that right now
//            // TODO Implement "Saved Filter/Searches" properly, allowing restricted users to create rule state flags is not great
//            resultAsset .getAttributes().stream().forEach(attribute -> {
//                if (attribute.getType().map(attributeType -> attributeType == ValueType.RULES_TEMPLATE_FILTER).orElse(false)
//                    && !attribute.hasMetaItem(MetaItemType.RULE_STATE)) {
//                    attribute.addMeta(new MetaItem<>(MetaItemType.RULE_STATE, true));
//                }
//            });

            // Store the result
            Asset<?> updateAsset = assetStorageService.merge(storageAsset, isRestrictedUser ? getUsername() : null);


            insertOrUpdateInfo(assetInfoDto,updateAsset);
            if(!childIds.isEmpty()){
                assetStorageService.updatePathChilds(childIds);
            }

            return new AssetInfoDto(updateAsset, info);

        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, FORBIDDEN);
        } catch (ConstraintViolationException ex) {
            throw new ResteasyViolationExceptionImpl(ex.getConstraintViolations(), requestParams.headers.getAcceptableMediaTypes());
        } catch (OptimisticLockException opEx) {
            throw new WebApplicationException("Refresh the asset from the server and try to update the changes again", opEx, CONFLICT);
        }
    }

    @Override
    public Response writeAttributeValue(RequestParams requestParams, String assetId, String attributeName, Object value) {

        Response.Status status = Response.Status.OK;

        if (value instanceof NullNode) {
            value = null;
        }

        AttributeEvent event = new AttributeEvent(assetId, attributeName, value);

        // Check authorisation
        if (!clientEventService.authorizeEventWrite(getRequestRealmName(), getAuthContext(), event)) {
            throw new ForbiddenException("Cannot write specified attribute: " + event);
        }

        // Process asynchronously but block for a little while waiting for the result
        AttributeWriteResult result = doAttributeWrite(event);

        if (result.getFailure() != null) {
            status = switch (result.getFailure()) {
                case ASSET_NOT_FOUND, ATTRIBUTE_NOT_FOUND -> NOT_FOUND;
                case INVALID_VALUE -> NOT_ACCEPTABLE;
                case QUEUE_FULL -> TOO_MANY_REQUESTS;
                default -> BAD_REQUEST;
            };
        }

        return Response.status(status).entity(result).type(MediaType.APPLICATION_JSON_TYPE).build();
    }

    @Override
    public AttributeWriteResult[] writeAttributeValues(RequestParams requestParams, AttributeState[] attributeStates) {

        // Process asynchronously but block for a little while waiting for the result
        return Arrays.stream(attributeStates).map(attributeState -> {
            AttributeEvent event = new AttributeEvent(attributeState);
            if (!clientEventService.authorizeEventWrite(getRequestRealmName(), getAuthContext(), event)) {
                return new AttributeWriteResult(event.getRef(), AttributeWriteFailure.INSUFFICIENT_ACCESS);
            }
            return doAttributeWrite(event);
        }).toArray(AttributeWriteResult[]::new);
    }

    @Override
    public Response writeAttributeValueExtra(RequestParams requestParams, String assetId, String attributeName, Object value, String fixGroupId) {
        if (attributeName.equalsIgnoreCase("brightness") && validationUtils.isValid(fixGroupId)){
            if(assetStorageService.isCabinetGroupPowerOn(fixGroupId)) {
                return writeAttributeValue(requestParams, assetId, attributeName, value);
            } else {
                return Response.status(Response.Status.OK).entity(new ErrorMessage("Khởi chưa được bật", "FIX_GROUP_OFF"))
                        .type(MediaType.APPLICATION_JSON_TYPE).build();
            }
        }
        return writeAttributeValue(requestParams, assetId, attributeName, value);
    }

    protected final String[] publicAsset={LIGHT_ASSET,FIXED_GROUP_ASSET};
    private boolean  isPublicAsset(String assetType) {
        return Arrays.stream(publicAsset)
                .anyMatch(assetType::matches);
    }
    @Override
    public AssetInfoDto create(RequestParams requestParams, AssetInfoDto assetInfoDto) {
        try {
            if (isRestrictedUser()) {
                throw new WebApplicationException(FORBIDDEN);
            }

//            Asset<?> asset = createAssetByType(assetDto.getType());
//            asset.setName(assetDto.getName());
//            asset.setType(assetDto.getType());
//            asset.setRealm(assetDto.getRealm());
//            asset.setAttributes(assetDto.getAttributes());
//            asset.setParentId(assetDto.getParentId());
            Asset<?> asset = assetInfoDto.getAsset();
            Asset_Info asset_info = assetInfoDto.getAssetInfo();

            if (asset == null) {
                LOG.finest("No asset in request");
                throw new WebApplicationException(BAD_REQUEST);
            }

            if (asset_info == null) {
                LOG.finest("No assetInfo in request");
                throw new WebApplicationException(BAD_REQUEST);
            }

            // If there was no realm provided (create was called by regular user in manager UI), use the auth realm
            if (asset.getRealm() == null || asset.getRealm().isEmpty()) {
                asset.setRealm(getAuthenticatedRealm().getName());
            } else if (!isRealmActiveAndAccessible(asset.getRealm())) {
                LOG.fine("Forbidden access for user '" + getUsername() + "', can't create: " + asset);
                throw new WebApplicationException(FORBIDDEN);
            }

            if (!assetInfoPersistenceService.getByCode(asset_info.getAssetCode(), asset.getType(), asset.getRealm()).isEmpty()) {
                throw new RouteInfoVException(AttributeWriteFailure.ALREADY_EXISTS, "Mã asset '" + asset_info.getAssetCode() + "' đã tồn tại!");
            }

            Asset<?> newAsset = ValueUtil.clone(asset);

            // Allow client to set identifier
            if (asset.getId() != null) {
                newAsset.setId(asset.getId());
            }
            Asset<?> merge = assetStorageService.merge(newAsset);
            AssetInfoDto merge1 = insertOrUpdateInfo(assetInfoDto, merge);
            if (merge1 != null) return merge1;

            return new AssetInfoDto(merge, null);


        } catch (ConstraintViolationException ex) {
            throw new ResteasyViolationExceptionImpl(ex.getConstraintViolations(), requestParams.headers.getAcceptableMediaTypes());
        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, BAD_REQUEST);
        }
    }

    @Override
    public AssetInfoDto createGroupCabinet(RequestParams requestParams, AssetInfoDto assetInfoDto) {
        Asset_Info assetInfo = assetInfoDto.getInfoDTO();
        CabinetGroup cabinetGroup = assetInfoDto.getCabinetGroup();
        if (assetInfoPersistenceService.getCabinetGroupByCabinet(assetInfoDto.getCabinetId(), cabinetGroup.getId())) {
            return null;
        }
        assetInfo.setAssetCode(assetInfo.getAssetCode() + "_" + cabinetGroup.getCode());
        assetInfoDto.setInfoDTO(assetInfo);

        AssetInfoDto asset =this.create(requestParams, assetInfoDto);

        assetInfoPersistenceService.updateCabinetGroup(assetInfoDto.getCabinetId(), asset.getInfoDTO(), cabinetGroup);

        return asset;
    }

    @Override
    public void createRoute(RequestParams requestParams, RouteInfoCreateDTO  routeInfoCreateDTO, String realm) {
        AssetInfoDto assetInfoDto =new AssetInfoDto();

        RoadAsset roadAsset=new RoadAsset(routeInfoCreateDTO.getRouteName());
        if(realm!=null){
            roadAsset.setRealm(realm);
        }
        assetInfoDto.setAsset(roadAsset);

        Asset_Info info=new Asset_Info();
        info.setAssetCode(routeInfoCreateDTO.getRouteCode());
        info.setProvinceIdRI(routeInfoCreateDTO.getProvinceId());
        info.setDistrictIdRI(routeInfoCreateDTO.getDistrictId());
        info.setWardIdRI(routeInfoCreateDTO.getWardId());
        info.setStreetNameRI(routeInfoCreateDTO.getStreetName());
        info.setAddressRI(routeInfoCreateDTO.getAddress());
        info.setDescriptionRI(routeInfoCreateDTO.getDescription());
        info.setCreateBy(routeInfoCreateDTO.getCreateBy());

        assetInfoDto.setInfoDTO(info);
        assetInfoDto= this.create(requestParams,assetInfoDto);
        if(!routeInfoCreateDTO.getRouteAssetCreateDTOS().isEmpty()){
            for (RouteAssetCreateDTO routeAssetCreateDTO : routeInfoCreateDTO.getRouteAssetCreateDTOS()) {
                routeAssetCreateDTO.setRouteId(assetInfoDto.getAsset().getId());
                assetInfoPersistenceService.createRouteAssets(routeAssetCreateDTO);
            }
            updateParent(requestParams
                    ,assetInfoDto
                            .getAsset()
                            .getId(),  routeInfoCreateDTO.getRouteAssetCreateDTOS()
                            .stream().map(RouteAssetCreateDTO::getAssetId).toList(),
                    new ArrayList<>());
        }

    }

    @Override
    public void updateRoute(RequestParams requestParams, RouteInfoCreateDTO routeInfoCreateDTO) {
        // update common info
        assetInfoPersistenceService.updateRouteInfo(routeInfoCreateDTO);
        assetInfoPersistenceService.deleteRouteAssets(routeInfoCreateDTO.getId());
        // update parent_id
        updateParent(requestParams ,routeInfoCreateDTO.getId(),  routeInfoCreateDTO.getRouteAssetCreateDTOS()
                        .stream().map(RouteAssetCreateDTO::getAssetId).toList(),
                new ArrayList<>());
        if(!routeInfoCreateDTO.getRouteAssetCreateDTOS().isEmpty()){
            for (RouteAssetCreateDTO routeAssetCreateDTO : routeInfoCreateDTO.getRouteAssetCreateDTOS()) {
                routeAssetCreateDTO.setRouteId(routeInfoCreateDTO.getId());
                assetInfoPersistenceService.createRouteAssets(routeAssetCreateDTO);
            }
        }
    }

    @Override
    public List<RouterAssetCreate> getUpdateRoute(RequestParams requestParams, String routeId) {
        return  assetInfoPersistenceService.getUpdateRoute(routeId);
    }

    private  AssetInfoDto insertOrUpdateInfo(AssetInfoDto assetInfoDto, Asset<?> assetMerge) {
        if(assetMerge.getType().equals(ELECTRICAL_CABINET_ASSET) || assetMerge.getType().equals(LIGHT_GROUP_ASSET)){
            Asset_Info info = assetInfoDto.getInfoDTO();
            info.setId(assetMerge.getId());

            assetInfoPersistenceService.createAssetInfo(info);
            return new AssetInfoDto(assetMerge, info);
        }
        if(isPublicAsset(assetMerge.getType())){
            Asset_Info info = assetInfoDto.getInfoDTO();
            info.setId(assetMerge.getId());
            info.setAssetIdAC(info.getId());
            info.setCabinetIdAC(info.getCabinetId());
            info.setCabinetAssetCodeAC(info.getCabinetAssetCode());
            assetInfoPersistenceService.createAssetInfo(info);
            assetInfoPersistenceService.createAssetCabinet(info);
            return new AssetInfoDto(assetMerge, info);
        }
        if(assetMerge.getType().equalsIgnoreCase(ROAD_ASSET)){
            Asset_Info info = assetInfoDto.getInfoDTO();
            info.setId(assetMerge.getId());
            info.setIdRI(info.getId());
            info.setRouteCodeRI(info.getAssetCode());
            info.setRealmRI(assetMerge.getRealm());
            info.setRouteNameRI(assetMerge.getName());
            info.setCreateBy(info.getUpdateBy());
            assetInfoPersistenceService.createRouteInfo(info);
            return new AssetInfoDto(assetMerge, info);
        }
        return null;
    }

    private Asset<?> createAssetByType(String type) {
        try {
            String className = "org.openremote.model.asset.impl." + type; // Đường dẫn đầy đủ của lớp
            return (Asset<?>) Class.forName(className).getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new IllegalArgumentException("Unsupported asset type: " + type, e);
        }
    }

    @Override
    public void delete(RequestParams requestParams, List<String> assetIds) {

        if (LOG.isLoggable(Level.FINE)) {
            LOG.fine("Deleting assets: " + assetIds);
        }

        try {
            if (assetIds == null || assetIds.isEmpty()) {
                throw new WebApplicationException(BAD_REQUEST);
            }

            if (isRestrictedUser()) {
                throw new WebApplicationException(FORBIDDEN);
            }

            List<Asset<?>> assets = assetStorageService.findAll(new AssetQuery().ids(assetIds.toArray(new String[0])).select(new AssetQuery.Select().excludeAttributes()));
            if (assets == null || assets.size() != assetIds.size()) {
                LOG.fine("Request to delete one or more invalid assets");
                throw new WebApplicationException(BAD_REQUEST);
            }

            if (assets.stream().map(Asset::getRealm).distinct().anyMatch(asset -> !isRealmActiveAndAccessible(asset))) {
                LOG.fine("One or more assets in an nonexistent, inactive or inaccessible realm: username=" + getUsername());
                throw new WebApplicationException(FORBIDDEN);
            }

            if (!assetStorageService.delete(assetIds, false) || !assetStorageService.deleteAssetCabinet(assetIds) || !assetStorageService.deleteAssetInfo(assetIds)) {
                throw new WebApplicationException(BAD_REQUEST);
            }
        } catch (IllegalStateException ex) {
            throw new WebApplicationException(ex, BAD_REQUEST);
        }
    }

    public AssetInfoDto[] queryAssetsExtends(RequestParams requestParams, AssetQuery query, String searchKey) {
        if (query == null) {
            query = new AssetQuery();
        }

        if (!assetStorageService.authorizeAssetQuery(query, getAuthContext(), getRequestRealmName())) {
            throw new ForbiddenException("User not authorized to execute specified query");
        }

        List<Asset<?>> result;
        if (searchKey != null && !searchKey.isEmpty()) {
            result = assetStorageService.findAll(query).stream()
                    .filter(asset -> asset.getName() != null && asset.getName().toLowerCase().contains(searchKey.toLowerCase()))
                    .toList();
        } else {
            result = assetStorageService.findAll(query);
        }
        List<AssetInfoDto> assetInfoDtos = new ArrayList<>();

        for (Asset<?> asset : result) {
            Asset_Info info = assetInfoPersistenceService.getById(asset.getId());
            if (info != null && info.getId() != null) {
                if (asset.getAssetType().equals(Constants.ELECTRICAL_CABINET_ASSET)) {
                    List<?> lights = cabinetAssetPersistenceService.getLightsBelongToCabinet(asset.getId(), null, asset.getRealm());
                    AssetQuery queryCount = new AssetQuery().parents(asset.getId()).realm(new RealmPredicate(asset.getRealm())).recursive(true);
                    List<Asset<?>> queryCountList = assetStorageService.findAll(queryCount);
                    List<Asset<?>> fixGroupList = queryCountList.stream()
                            .filter(assetCount -> Constants.FIX_GROUP_ASSET.equalsIgnoreCase(assetCount.getAssetType()))
                            .toList();
                    List<Asset<?>> lightGroupList = queryCountList.stream()
                            .filter(assetCount -> Constants.LIGHT_GROUP_ASSET.equalsIgnoreCase(assetCount.getAssetType()))
                            .toList();
                    info.setLightCount(lights != null ? lights.size() : 0);
                    info.setFixGroupCount(fixGroupList.size());
                    info.setLightGroupCount(lightGroupList.size());
                }
                assetInfoDtos.add(new AssetInfoDto(asset, info));
            }
        }

        // Compress response (the request attribute enables the interceptor)
        request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

        return assetInfoDtos.toArray(new AssetInfoDto[0]);
    }


    @Override
    public AssetInfoDto[] queryAssets(RequestParams requestParams, AssetQuery query) {
        if (query == null) {
            query = new AssetQuery();
        }

        if (!assetStorageService.authorizeAssetQuery(query, getAuthContext(), getRequestRealmName())) {
            throw new ForbiddenException("User not authorized to execute specified query");
        }

        List<Asset<?>> result = assetStorageService.findAll(query);
        List<AssetInfoDto> assetInfoDtos = new ArrayList<>();

        for (Asset<?> asset : result) {
            Asset_Info info = assetInfoPersistenceService.getById(asset.getId());
            if (info != null && info.getId() != null) {
                assetInfoDtos.add(new AssetInfoDto(asset, info));
            }
        }

        // Compress response (the request attribute enables the interceptor)
        request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

        return assetInfoDtos.toArray(new AssetInfoDto[0]);
    }

    @Override
    public AssetInfoDto[] queryMapAssets(RequestParams requestParams, AssetQuery query) {
        if (query == null) {
            query = new AssetQuery();
        }

        if (!assetStorageService.authorizeAssetQuery(query, getAuthContext(), getRequestRealmName())) {
            throw new ForbiddenException("User not authorized to execute specified query");
        }

        List<Asset<?>> result = assetStorageService.findAll(query);
        List<AssetInfoDto> assetInfoDtos = new ArrayList<>();

        for (Asset<?> asset : result) {
            Asset_Info info = assetInfoPersistenceService.getById(asset.getId());
            List<AssetDatapoint> datapointList = assetDatapointService.getPowerByAssetId(asset.getId());
            Date lastTimeActive = assetDatapointService.getLastTimeActive(asset.getId());
            if (info == null || info.getId() == null) {
                assetInfoDtos.add(new AssetInfoDto(asset, new Asset_Info(), datapointList, lastTimeActive));
            } else assetInfoDtos.add(new AssetInfoDto(asset, info, datapointList, lastTimeActive));
        }

        // Compress response (the request attribute enables the interceptor)
        request.setAttribute(HttpHeaders.CONTENT_ENCODING, "gzip");

        return assetInfoDtos.toArray(new AssetInfoDto[0]);
    }

    @Override
    public Date queryLastTimeActive(RequestParams requestParams, String id) {
        return assetDatapointService.getLastTimeActive(id);
    }

    @Override
    public AssetInfoDto[] queryTreeRoutes(RequestParams requestParams, String routeId, String realm, String keyWord) {
        AssetQuery query = new AssetQuery().parents(routeId).realm(new RealmPredicate(realm)).recursive(true);
        return queryAssetsExtends(requestParams, query, keyWord);
    }

    public AttributeWriteResult doAttributeWrite(AttributeEvent event) {
        AttributeWriteFailure failure = null;

        if (event.getTimestamp() <= 0) {
            event.setTimestamp(timerService.getCurrentTimeMillis());
        }

        try {
            if (LOG.isLoggable(Level.FINE)) {
                LOG.fine("Write attribute value request: " + event);
            }

            // Process synchronously - need to directly use the ATTRIBUTE_EVENT_QUEUE as the client inbound queue
            // has multiple consumers and so doesn't support In/Out MEP
            Object result = messageBrokerService.getFluentProducerTemplate()
                    .withBody(event)
                    .to(ATTRIBUTE_EVENT_ROUTER_QUEUE)
                    .request();

            if (result instanceof AssetProcessingException processingException) {
                failure = processingException.getReason();
            }

        } catch (AssetProcessingException e) {
            failure = e.getReason();
        } catch (IllegalStateException ex) {
            failure = AttributeWriteFailure.UNKNOWN;
        }

        return new AttributeWriteResult(event.getRef(), failure);
    }

    @Override
    public void updateParent(RequestParams requestParams, String parentId, List<String> assetIds,List<String> childIds) {
        AssetQuery query = new AssetQuery();
        query.ids = assetIds.toArray(String[]::new);

        List<Asset<?>> assets = this.assetStorageService.findAll(query);
        LOG.fine("Updating parent for assets: count=" + assets.size() + ", newParentID=" + parentId);

        for (Asset<?> asset : assets) {
            asset.setParentId(parentId);
            LOG.fine("Updating asset parent: assetID=" + asset.getId() + ", newParentID=" + parentId);
            assetStorageService.merge(asset);
        }

        if(!childIds.isEmpty()){
            assetStorageService.updatePathChilds(childIds);
        }
    }

    @Override
    public void updateNoneParent(RequestParams requestParams, List<String> assetIds) {
        AssetQuery query = new AssetQuery();
        query.ids = assetIds.toArray(String[]::new);

        List<Asset<?>> assets = this.assetStorageService.findAll(query);
        LOG.fine("Updating parent for assets: count=" + assets.size() + ", newParentID=NONE");

        for (Asset<?> asset : assets) {
            asset.setParentId(null);
            LOG.fine("Updating asset parent: assetID=" + asset.getId() + ", newParentID=NONE");
            assetStorageService.merge(asset);
        }
    }

    @Override
    public List<FilterDto> getAllRoadAssets(String realm) {
        return assetStorageService.getAllRoadAssets(realm);
    }

    @Override
    public List<AssetTypeDto> getAllAssetType(RequestParams requestParams){
        return sysAssetTypePersistenceService.getAllAssetTypes();
    }

    @Override
    public List<FilterDto> getAllCabinetAssets(String realm) {
        return assetStorageService.getAllCabinetAssets(realm);
    }

    @Override
    public List<FilterDto> getAllLightAssets(RequestParams requestParams) {
        return assetStorageService.getAllLightAssets();
    }

    @Override
    public List<FilterDto> getAssetName(RequestParams requestParams, String realm, String ... type) {
        List<String> typeList = Arrays.asList(type);
        return assetStorageService.getAssetName(typeList, realm);
    }

    @Override
    public LightInfoDTO getInfoLightByLightId(RequestParams requestParams, String lightId) {
        return assetStorageService.getInfoLightByLightId(lightId);
    }

    @Override
    public CabinetAssetDTO createCabinetAsset(CabinetAssetDTO asset) {
        CabinetAssetDTO cabinetAssetDTO = assetStorageService.create(asset);
        if (validationUtils.isValid(asset.getAssetInfo())) {
            Asset_Info assetInfo = asset.getAssetInfo();
            if (validationUtils.isValid(assetInfo.getStatus()) && !assetInfo.getStatus().equals("A")) {
                List<CabinetGroupLight> cabinetGroupLights = cabinetGroupPersistenceService.getCabinetGroupByCabinet(assetInfo.getId());
                for (CabinetGroupLight cabinetGroupLight: cabinetGroupLights) {
                    if (validationUtils.isValid(cabinetGroupLight.getCabinetGroup()) && validationUtils.isValid(cabinetGroupLight.getCabinetGroup().getName())) {
                        AttributeWriteResult result = doAttributeWrite(new AttributeEvent(assetInfo.getId(), cabinetGroupLight.getCabinetGroup().getName(), 0));
                    }
                }
            }
        }
        return cabinetAssetDTO;
    }

}
