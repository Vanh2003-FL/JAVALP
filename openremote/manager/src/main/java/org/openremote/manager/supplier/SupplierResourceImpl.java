package org.openremote.manager.supplier;

import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebResource;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.supplier.Supplier;
import org.openremote.model.supplier.SupplierResource;

import java.util.List;

public class SupplierResourceImpl extends ManagerWebResource implements SupplierResource {

    protected final PersistenceService persistenceService;
    protected final SupplierPersistenceService supplierPersistenceService;

    public SupplierResourceImpl(TimerService timerService,
                                ManagerIdentityService identityService,
                                PersistenceService persistenceService,
                                SupplierPersistenceService supplierPersistenceService) {
        super(timerService, identityService);
        this.persistenceService = persistenceService;
        this.supplierPersistenceService = supplierPersistenceService;
    }

    @Override
    public List<Supplier> getAll(SearchFilterDTO<Supplier> filterDTO) {
        return supplierPersistenceService.getAll(filterDTO);
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        return supplierPersistenceService.create(supplier);
    }

    @Override
    public Supplier update(Supplier supplier) {
        return supplierPersistenceService.update(supplier);
    }

    @Override
    public Long countData(SearchFilterDTO<Supplier> filterDTO) {
        return supplierPersistenceService.countData(filterDTO);
    }

    @Override
    public boolean remove(Supplier supplier) {
        return supplierPersistenceService.updateDeleteStatus(supplier.getId());
    }
}
