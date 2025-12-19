package org.openremote.model.routeInfo;

import org.openremote.model.Constants;
import org.openremote.model.asset.impl.ElectricalCabinetAsset;

import java.util.List;
import java.util.stream.Collectors;

public class CabinetCount {
    private Integer total;

    private Integer active;

    private Integer maintenance;

    private Integer pending;

    private Integer disconnect;

    private List<AssetInfoWrapper> listAsset;

    private List<AssetInfoWrapper> activeList;

    private List<AssetInfoWrapper> maintenanceList;

    private List<AssetInfoWrapper> pendingList;

    private List<AssetInfoWrapper> disconnectList;


    private List<ElectricalCabinetAsset> electricalCabinetAssetList;

    public CabinetCount(){}

    public CabinetCount(List<AssetInfoWrapper> listAsset) {
        this.activeList = listAsset.stream()
                .filter(asset -> Constants.ACTIVE.equalsIgnoreCase(asset.getAssetInfo().getStatus()))
                .collect(Collectors.toList());

        this.maintenanceList = listAsset.stream()
                .filter(asset -> Constants.MAINTENANCE.equalsIgnoreCase(asset.getAssetInfo().getStatus()))
                .collect(Collectors.toList());

        this.pendingList = listAsset.stream()
                .filter(asset -> Constants.PENDING.equalsIgnoreCase(asset.getAssetInfo().getStatus()))
                .collect(Collectors.toList());

        this.disconnectList = listAsset.stream()
                .filter(asset -> Constants.DISCONNECT.equalsIgnoreCase(asset.getAssetInfo().getStatus()))
                .collect(Collectors.toList());

        this.active = this.activeList.size();
        this.maintenance = this.maintenanceList.size();
        this.pending = this.pendingList.size();
        this.disconnect = this.disconnectList.size();
        this.total = active + maintenance + pending + disconnect;
    }

    public CabinetCount(Integer total, Integer active, Integer maintenance, Integer pending, List<AssetInfoWrapper> listAsset, List<ElectricalCabinetAsset> electricalCabinetAssetList) {
        this.total = total;
        this.active = active;
        this.maintenance = maintenance;
        this.pending = pending;
        this.listAsset = listAsset;
        this.electricalCabinetAssetList = electricalCabinetAssetList;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }

    public Integer getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(Integer maintenance) {
        this.maintenance = maintenance;
    }

    public Integer getPending() {
        return pending;
    }

    public void setPending(Integer pending) {
        this.pending = pending;
    }

    public Integer getDisconnect() {
        return disconnect;
    }

    public void setDisconnect(Integer disconnect) {
        this.disconnect = disconnect;
    }

    public List<AssetInfoWrapper> getListAssetDTO() { return listAsset; }

    public void setListAssetDTO(List<AssetInfoWrapper> listAsset) { this.listAsset = listAsset; }


    public List<ElectricalCabinetAsset> getElectricalCabinetAssetList() {
        return electricalCabinetAssetList;
    }

    public void setElectricalCabinetAssetList(List<ElectricalCabinetAsset> electricalCabinetAssetList) {
        this.electricalCabinetAssetList = electricalCabinetAssetList;
    }

    public List<AssetInfoWrapper> getListAsset() {
        return listAsset;
    }

    public void setListAsset(List<AssetInfoWrapper> listAsset) {
        this.listAsset = listAsset;
    }

    public List<AssetInfoWrapper> getActiveList() {
        return activeList;
    }

    public void setActiveList(List<AssetInfoWrapper> activeList) {
        this.activeList = activeList;
    }

    public List<AssetInfoWrapper> getMaintenanceList() {
        return maintenanceList;
    }

    public void setMaintenanceList(List<AssetInfoWrapper> maintenanceList) {
        this.maintenanceList = maintenanceList;
    }

    public List<AssetInfoWrapper> getPendingList() {
        return pendingList;
    }

    public void setPendingList(List<AssetInfoWrapper> pendingList) {
        this.pendingList = pendingList;
    }

    public List<AssetInfoWrapper> getDisconnectList() {
        return disconnectList;
    }

    public void setDisconnectList(List<AssetInfoWrapper> disconnectList) {
        this.disconnectList = disconnectList;
    }
}
