package org.openremote.model.cabinetGroup;

public class CabinetGroupLight {
    private CabinetGroup cabinetGroup;
    private String name;
    private Integer countLight;
    private String idCabinetGroupAsset;

    public CabinetGroupLight() {}

    public CabinetGroupLight(CabinetGroup cabinetGroup, Integer countLight, String assetInfo) {
        this.cabinetGroup = cabinetGroup;
        this.countLight = countLight;
        this.name = assetInfo;
    }

    public CabinetGroupLight(Integer countLight, String assetInfo, String idCabinetGroupAsset) {
        this.countLight = countLight;
        this.name = assetInfo;
        this.idCabinetGroupAsset = idCabinetGroupAsset;
    }

    public CabinetGroup getCabinetGroup() {
        return cabinetGroup;
    }

    public void setCabinetGroup(CabinetGroup cabinetGroup) {
        this.cabinetGroup = cabinetGroup;
    }

    public Integer getCountLight() {
        return countLight;
    }

    public void setCountLight(Integer countLight) {
        this.countLight = countLight;
    }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getIdCabinetGroupAsset() { return idCabinetGroupAsset; }

    public void setIdCabinetGroupAsset(String idCabinetGroupAsset) { this.idCabinetGroupAsset = idCabinetGroupAsset; }
}
