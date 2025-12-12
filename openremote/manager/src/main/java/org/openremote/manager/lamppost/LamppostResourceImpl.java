package org.openremote.manager.lamppost;

import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.hdi.PagedResult;
import org.openremote.model.http.RequestParams;
import org.openremote.model.lampType.LampType;
import org.openremote.model.lamppost.LamppostResource;
import org.openremote.model.lamppost.dtoLamppost.LamppostDTO;
import org.openremote.model.lamppost.dtoLamppost.LamppostLightDTO;
import org.openremote.model.query.LamppostQuery;
import org.openremote.model.lamppost.dtoLamppost.Lamppost;
import org.openremote.model.lamppost.dtoLamppost.LamppostCreateDTO;

import java.util.List;

public class LamppostResourceImpl extends ManagerWebResource implements LamppostResource {
    protected PersistenceService persistenceService;
    protected LamppostStorageService lamppostStorageService;

    public LamppostResourceImpl(TimerService timerService, ManagerIdentityService identityService) {
        super(timerService, identityService);
    }
    public LamppostResourceImpl(PersistenceService persistenceService, TimerService timerService, ManagerIdentityService identityService,LamppostStorageService lamppostStorageService ) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.lamppostStorageService =lamppostStorageService;
    }

    @Override
    public Lamppost get(RequestParams requestParams, String lampposId, String realmName) {
        return null;
    }

//    @Override
//    public Long countRouteLampposts(RequestParams requestParams) {
//        return lamppostStorageService.countRouteLampposts();
//    }

    @Override
    public List<LightAsset> getLightByLamppostType(RequestParams requestParams, Integer lampposTypeId, String routerId) {
        return lamppostStorageService.getLightByLampposType(lampposTypeId, routerId);
    }

    @Override
    public List<LampType> getLamppostType(RequestParams requestParams) {
        return lamppostStorageService.getLamppostType();
    }

    @Override
    public PagedResult queryLamppost(RequestParams requestParams, String realm, int page, int size, LamppostQuery lamppostQuery, String routerId, String lamppostName) {
        lamppostQuery.setPageNumber(page);
        lamppostQuery.setPageSize(size);
        List<?> lamppostList = lamppostStorageService.getAll(realm, lamppostQuery, routerId, lamppostName);
        return new PagedResult(lamppostList ,lamppostStorageService.countAll(realm, lamppostQuery, routerId, lamppostName));
    }

    @Override
    public void delete(RequestParams requestParams, Long id) {
        lamppostStorageService.delete(id);
    }

    @Override
    public Response removeLight(RequestParams requestParams, String id) {
        try {
            lamppostStorageService.removeLight(id);
            return Response.ok("Xóa thành công").build();
        } catch (Exception e) {
            return Response.serverError().entity("Xóa thất bại: " + e.getMessage()).build();
        }
    }

    @Override
    public Lamppost create(RequestParams requestParams, String realm, LamppostCreateDTO lamppostCreateDTO) {
        return lamppostStorageService.create(lamppostCreateDTO,realm);
    }

    @Override
    public Response createLamppostLight(RequestParams requestParams, String realm, LamppostCreateDTO lamppostCreateDTO) {
        try {
            lamppostStorageService.createLamppostLight(lamppostCreateDTO,realm);
            return Response.ok("Import thành công").build();
        } catch (Exception e) {
            return Response.serverError().entity("Import thất bại: " + e.getMessage()).build();
        }
    }

    @Override
    public Lamppost updateLamppostLight(RequestParams requestParams, int lamppostId, LamppostCreateDTO updateDTO) {
        return lamppostStorageService.updateLamppostLight(lamppostId, updateDTO);
    }


    @Override
    public Lamppost update(RequestParams requestParams, int id, LamppostCreateDTO lamppostUpdateDTO) {
        return lamppostStorageService.updateLamppost(id,lamppostUpdateDTO);
    }

    @Override
    public List<LamppostLightDTO> getLightsByLamppostId(RequestParams requestParams, Integer lamppostId) {
        return lamppostStorageService.getLightsByLamppostId(lamppostId);
    }

    @Override
    public LamppostDTO getWattageActual(RequestParams requestParams, Integer lamppostId) {
        return new LamppostDTO(lamppostStorageService.getWattageActual(lamppostId),0L);
    }

    @Override
    public LamppostDTO getWattageProduct(RequestParams requestParams, Integer lamppostId) {
        return new LamppostDTO(0L, lamppostStorageService.getWattageProduct(lamppostId));
    }

}
