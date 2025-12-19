package org.openremote.manager.firmware;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.dto.FirmwareInfoAssetDTO;
import org.openremote.model.dto.FirmwareInfoDetailDTO;
import org.openremote.model.dto.SearchFilterDTO;

import java.util.List;
import java.util.logging.Logger;

public class FirmwareInfoAssetPersistenceService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());
    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;

    @Override
    public int getPriority() {
        return PRIORITY;
    }

    @Override
    public void configure() throws Exception {
    }

    @Override
    public void init(Container container) throws Exception {
        this.persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new FirmwareInfoAssetResourceImpl(container.getService(TimerService.class), identityService, this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<FirmwareInfoAssetDTO> getFrwInfoAssetByFrwInfoDetailId (Long infoDetailId, SearchFilterDTO<FirmwareInfoAssetDTO> searchFilter) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "fia.id, fia.asset_id, a.name, fia.frw_version_old, fia.frw_version_new, fia.status, fia.description " +
                        "FROM frw_info_asset fia " +
                        "LEFT JOIN asset a ON a.id = fia.asset_id " +
                        "WHERE fia.frw_info_detail_id = ? "
        );
        return persistenceService.doReturningTransaction(em -> {
            var results = em.createNativeQuery(sqlBase.toString(), FirmwareInfoAssetDTO.class)
                    .setParameter(1, infoDetailId);
            if (validationUtils.isValid(searchFilter.getSize()) || validationUtils.isValid(searchFilter.getPage())) {
                results.setMaxResults(searchFilter.getSize());
                results.setFirstResult((searchFilter.getPage() - 1) * searchFilter.getSize());
            }


            return (List<FirmwareInfoAssetDTO>) results.getResultList();
        });
    }

    public Long getCountFrwInfoAssetByFrwInfoDetailId(Long infoDetailId) {
        StringBuilder sqlBase = new StringBuilder(
                "SELECT " +
                        "count(fia.id) " +
                        "FROM frw_info_asset fia " +
                        "LEFT JOIN frw_info_detail fid ON fid.id = fia.frw_info_detail_id " +
                        "WHERE fia.frw_info_detail_id = ? "
        );

        return persistenceService.doReturningTransaction(em -> {
            Long results = (Long) em.createNativeQuery(sqlBase.toString())
                    .setParameter(1, infoDetailId)
                    .getSingleResult();

            return results;
        });
    }

    public boolean delete(Long id) {
        try {
            return persistenceService.doReturningTransaction(em -> {

                int delete = em.createNativeQuery("DELETE FROM frw_info_asset WHERE id = ?")
                        .setParameter(1, id)
                        .executeUpdate();

                return delete > 0;
            });
        } catch (Exception e) {
            LOG.severe("Lỗi khi xóa FirmwareInfoAsset: " + e.getMessage());
            throw new RuntimeException("Không thể xóa FirmwareInfoAsset", e);
        }
    }

}
