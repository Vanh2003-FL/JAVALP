package org.openremote.model.hdi.hdiDTO.commandDTO;

public class LightCommand3Control {
    String id;
    String cabinetAssetCode;
    String assetCode;

    public LightCommand3Control(String id, String cabinetAssetCode, String assetCode) {
        this.id = id;
        this.cabinetAssetCode = cabinetAssetCode;
        this.assetCode = assetCode;
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
}
