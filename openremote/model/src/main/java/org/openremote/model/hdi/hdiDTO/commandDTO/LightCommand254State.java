package org.openremote.model.hdi.hdiDTO.commandDTO;

import java.util.HashMap;
import java.util.Map;

public class LightCommand254State {
    String id;
    String cabinetAssetCode;
    String brightness;
    String u;
    String i;
    String e;
    String p;
    String cosphi;
    String status;
    String assetCode;

    public LightCommand254State() {
    }

    public Map<String, String> toMap() {
        Map<String, String> map = new HashMap<>();
        map.put("id", id);
        map.put("cabinetAssetCode", cabinetAssetCode);
        map.put("brightness", brightness);
        map.put("voltage", u);
        map.put("amperage", i);
        map.put("wattageActual", e);
        map.put("wattage", p);
        map.put("cosPhi", cosphi);
        map.put("status", status);
        map.put("assetCode", assetCode);
        return map;
    }

    public String[] getIds() {
        return new String[]{this.id,this.id, this.id, this.id};
    }

    public String[] getAttributeName() {
        return new String[]{"brightness", "voltage", "amperage", "wattageActual"};
    }
    public String[] getType() {
        return new String[]{"positiveInteger", "positiveNumber", "positiveNumber", "positiveNumber"};
    }

    public String[] getValue() {
        return new String[]{this.brightness, this.u, this.i, this.e};
    }

    public LightCommand254State(String id, String cabinetAssetCode, String assetCode) {
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

    public String getCosphi() {
        return cosphi;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCosphi(String cosphi) {
        this.cosphi = cosphi;
    }

    public void setCabinetAssetCode(String cabinetAssetCode) {
        this.cabinetAssetCode = cabinetAssetCode;
    }

    public String getBrightness() {
        return brightness;
    }

    public void setBrightness(String brightness) {
        this.brightness = brightness;
    }

    public String getU() {
        return u;
    }

    public void setU(String u) {
        this.u = u;
    }

    public String getI() {
        return i;
    }

    public void setI(String i) {
        this.i = i;
    }

    public String getE() {
        return e;
    }

    public void setE(String e) {
        this.e = e;
    }
    public String getP() {
        return p;
    }

    public void setP(String p) {
        this.p = p;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }
}
