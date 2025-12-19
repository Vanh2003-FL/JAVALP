package org.openremote.model.dto;

import org.openremote.model.sys.SysAssetType;
import org.openremote.model.sys.SysAttributes;

import java.util.List;

public class AssetTypeDto {

    private SysAssetType sysAssetType;
    private List<SysAttributes> sysAttributesList;

    public AssetTypeDto() {
    }

    public AssetTypeDto(SysAssetType sysAssetType, List<SysAttributes> sysAttributesList) {
        this.sysAssetType = sysAssetType;
        this.sysAttributesList = sysAttributesList;
    }

    public SysAssetType getSysAssetType() {
        return sysAssetType;
    }

    public void setSysAssetType(SysAssetType sysAssetType) {
        this.sysAssetType = sysAssetType;
    }

    public List<SysAttributes> getSysAttributesList() {
        return sysAttributesList;
    }

    public void setSysAttributesList(List<SysAttributes> sysAttributesList) {
        this.sysAttributesList = sysAttributesList;
    }
}
