package org.openremote.model.dto;

import java.util.Date;

public class LightInfoDTO {
    private String lightId;
    private String firmwareVersion;
    private Date timeLight;

    public LightInfoDTO() {
    }

    public LightInfoDTO(String lightId, String firmwareVersion, Date timeLight) {
        this.lightId = lightId;
        this.firmwareVersion = firmwareVersion;
        this.timeLight = timeLight;
    }

    public String getLightId() {
        return lightId;
    }

    public void setLightId(String lightId) {
        this.lightId = lightId;
    }

    public String getFirmwareVersion() {
        return firmwareVersion;
    }

    public void setFirmwareVersion(String firmwareVersion) {
        this.firmwareVersion = firmwareVersion;
    }

    public Date getTimeLight() {
        return timeLight;
    }

    public void setTimeLight(Date timeLight) {
        this.timeLight = timeLight;
    }
}
