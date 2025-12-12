package org.openremote.manager.sys;

import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.dto.AssetTypeDto;
import org.openremote.model.sys.SysAssetType;
import org.openremote.model.sys.SysAttributes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SysAssetTypePersistenceService extends RouteBuilder implements ContainerService {

    public static final int PRIORITY = DEFAULT_PRIORITY;

    protected PersistenceService persistenceService;
    protected SysAssetTypeAttrPersistenceService attrPersistenceService;
    protected SysAttributesPersistenceService attributePersistenceService;

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
        this.attrPersistenceService = container.getService(SysAssetTypeAttrPersistenceService.class);
        this.attributePersistenceService = container.getService(SysAttributesPersistenceService.class);
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public List<AssetTypeDto> getAllAssetTypes() {
        List<SysAssetType> sysAssetTypes = findAll();
        List<AssetTypeDto> assetTypeDtos = new ArrayList<>();

        for (SysAssetType sysAssetType : sysAssetTypes) {
            List<Long> longs = attrPersistenceService.getListAttr(sysAssetType.getId());
            List<SysAttributes> sysAttributes = new ArrayList<>();
            sysAttributes = attributePersistenceService.getAttributesByListId(longs);
            assetTypeDtos.add(new AssetTypeDto(sysAssetType, sysAttributes));
        }

        return assetTypeDtos;
    }

    public List<SysAssetType> findAll() {
        List<Object[]> entitiList = persistenceService.doReturningTransaction(entityManager ->
                entityManager.createNativeQuery("SELECT id, asset_type_code, asset_type_name," +
                                " description, active, icon, colour FROM sys_asset_type ")
                        .getResultList()
        );
        List<SysAssetType> sysAssetTypes = new ArrayList<>();
        for (Object[] entity : entitiList) {
            SysAssetType sysAssetType = new SysAssetType();
            sysAssetType.setId((Long) entity[0]);
            sysAssetType.setAssetTypeCode((String) entity[1]);
            sysAssetType.setAssetTypeName((String) entity[2]);
            sysAssetType.setDescription((String) entity[3]);
            sysAssetType.setActive((Boolean) entity[4]);
            sysAssetType.setIcon((String) entity[5]);
            sysAssetType.setColour((String) entity[6]);

            sysAssetTypes.add(sysAssetType);
        }

        return sysAssetTypes;
    }

    public AssetTypeDto getAttributeById(Long assetTypeId) {
        AssetTypeDto assetTypeDto = new AssetTypeDto();
        return assetTypeDto;
    }
}
