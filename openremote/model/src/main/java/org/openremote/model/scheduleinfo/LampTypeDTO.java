package org.openremote.model.scheduleinfo;

public class LampTypeDTO {
    private Integer id;
    private int powerConsumption;

    public LampTypeDTO(Integer id, int powerConsumption) {
        this.id = id;
        this.powerConsumption = powerConsumption;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getPowerConsumption() {
        return powerConsumption;
    }

    public void setPowerConsumption(int powerConsumption) {
        this.powerConsumption = powerConsumption;
    }
}
