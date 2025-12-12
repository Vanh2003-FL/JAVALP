package org.openremote.manager.cabinetGroup;

import jakarta.ws.rs.PathParam;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.cabinetGroup.CabinetGroup;
import org.openremote.model.cabinetGroup.CabinetGroupLight;
import org.openremote.model.cabinetGroup.CabinetGroupResource;
import org.openremote.model.http.RequestParams;

import java.util.List;

public class CabinetGroupResourceImpl extends ManagerWebResource implements CabinetGroupResource {

    protected final PersistenceService persistenceService;

    protected final CabinetGroupPersistenceService cabinetGroupPersistenceService;

    public CabinetGroupResourceImpl(TimerService timerService, ManagerIdentityService identityService, PersistenceService persistenceService, CabinetGroupPersistenceService CabinetGroupPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.cabinetGroupPersistenceService = CabinetGroupPersistenceService;
    }

    @Override
    public List<CabinetGroup> getAll(RequestParams requestParams, String assetId) {
        return cabinetGroupPersistenceService.getAll(assetId);
    }

    @Override
    public List<CabinetGroupLight> getCabinetGroupByCabinet(RequestParams requestParams, String assetId) {
        return cabinetGroupPersistenceService.getCabinetGroupByCabinet(assetId);
    }

}
