package org.openremote.manager.supplier;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.supplier.Supplier;
import org.openremote.model.supplier.SupplierException;
import org.openremote.model.supplier.SupplierExceptionMapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

public class SupplierPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new SupplierResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
        managerWebService.addApiSingleton(
                new SupplierExceptionMapper()
        );
    }

    @Override
    public void start(Container container) throws Exception {
    }

    @Override
    public void stop(Container container) throws Exception {
    }

    @Override
    public void configure() throws Exception {
    }

    public Supplier create(Supplier supplier) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM md_supplier WHERE LOWER(supplier_code) = LOWER(?) AND deleted = 0 AND active = 1")
                        .setParameter(1, supplier.getCode().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new SupplierException(AttributeWriteFailure.ALREADY_EXISTS,
                            "Ma nhà cung cấp '" + supplier.getCode() + "' đã tồn tại!");
                }

                Integer supplierId = (Integer) em.createNativeQuery(
                                "INSERT INTO md_supplier (supplier_code, supplier_name, active, deleted, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING supplier_id")
                        .setParameter(1, supplier.getCode())
                        .setParameter(2, supplier.getName().trim())
                        .setParameter(3, 1)
                        .setParameter(4, 0)
                        .setParameter(5, LocalDateTime.now())
                        .setParameter(6, supplier.getCreateBy())
                        .setParameter(7, LocalDateTime.now())
                        .setParameter(8, supplier.getUpdateBy())
                        .getSingleResult();

                supplier.setId(supplierId);
                supplier.setActive(1);
                supplier.setDeleted(0);
                supplier.setCreateDate(Timestamp.valueOf(LocalDateTime.now()));

                return supplier;
            });
        } catch (SupplierException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public List<Supplier> getAll(SearchFilterDTO<Supplier> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT *" +
                    "FROM md_supplier WHERE deleted = 0";

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                baseQuery += " AND LOWER(supplier_name) LIKE LOWER(:supplierName)";
            }

            baseQuery += " ORDER BY supplier_name";

            var query = em.createNativeQuery(baseQuery, Supplier.class);

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                query.setParameter("supplierName", "%" + searchFilterDTO.getData().getName().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }

            return query.getResultList();
        });
    }

    public Supplier update(Supplier supplier) {
        persistenceService.doReturningTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE md_supplier " +
                                    "SET supplier_code = ?, " +
                                    "supplier_name = ?, " +
                                    "active = ?, " +
                                    "update_date = ?, " +
                                    "update_by = ? " +
                                    "WHERE supplier_id = ?")
                    .setParameter(1, supplier.getCode())
                    .setParameter(2, supplier.getName())
                    .setParameter(3, supplier.getActive())
                    .setParameter(4, LocalDateTime.now())
                    .setParameter(5, supplier.getUpdateBy())
                    .setParameter(6, supplier.getId())
                    .executeUpdate();
            return null;
        });
        return supplier;
    }

    public Long countData(SearchFilterDTO<Supplier> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(*) FROM md_supplier WHERE deleted = 0";

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                baseQuery += " AND LOWER(supplier_name) LIKE LOWER(:supplierName)";
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(searchFilterDTO.getData())
                    && validationUtils.isValid(searchFilterDTO.getData().getName())) {
                query.setParameter("supplierName", "%" + searchFilterDTO.getData().getName().trim() + "%");
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }

    public boolean updateDeleteStatus(int supplierId) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "UPDATE md_supplier SET deleted = 1, active = 0 WHERE supplier_id = ?"
                    )
                    .setParameter(1, supplierId)
                    .executeUpdate();
            return updatedRows > 0;
        });
    }
}
