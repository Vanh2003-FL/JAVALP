package org.openremote.model.hdi.hdiDTO.commandDTO;

import java.util.Objects;

public class LightCommand3Control2 {
    String id;
    String cabinetAssetCode;
    String assetCode;
    String cabinetGrpCode;

    Integer lamppost_id;
    String lampTypeValue;




    public LightCommand3Control2(String id, String cabinetAssetCode, String assetCode, String cabinetGrpCode) {
        this.id = id;
        this.cabinetAssetCode = cabinetAssetCode;
        this.assetCode = assetCode;
        this.cabinetGrpCode = cabinetGrpCode;
    }
    public LightCommand3Control2(String id, String cabinetAssetCode, String assetCode) {
        this.id = id;
        this.cabinetAssetCode = cabinetAssetCode;
        this.assetCode = assetCode;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LightCommand3Control2 that)) return false;
        return Objects.equals(id, that.id);
    }
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }



    public Integer getLamppost_id() {
        return lamppost_id;
    }

    public void setLamppost_id(Integer lamppost_id) {
        this.lamppost_id = lamppost_id;
    }

    public String getLampTypeValue() {
        return lampTypeValue;
    }

    public void setLampTypeValue(String lampTypeValue) {
        this.lampTypeValue = lampTypeValue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCabinetAssetCode() {
        return cabinetAssetCode;
    }

    public void setCabinetAssetCode(String cabinetAssetCode) {
        this.cabinetAssetCode = cabinetAssetCode;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public String getCabinetGrpCode() {
        return cabinetGrpCode;
    }

    public void setCabinetGrpCode(String cabinetGrpCode) {
        this.cabinetGrpCode = cabinetGrpCode;
    }
}
