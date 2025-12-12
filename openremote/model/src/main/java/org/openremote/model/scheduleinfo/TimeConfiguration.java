package org.openremote.model.scheduleinfo;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class TimeConfiguration implements Serializable {

    private SchTimePeriod timePeriod;
    private List<CustomizeLampType> lampTypes;

    public TimeConfiguration() {
        this.lampTypes = new ArrayList<>();
    }

    // Getters và setters
    public SchTimePeriod getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(SchTimePeriod timePeriod) {
        this.timePeriod = timePeriod;
    }

    public List<CustomizeLampType> getLampTypes() {
        return lampTypes;
    }

    public void setLampTypes(List<CustomizeLampType> lampTypes) {
        this.lampTypes = lampTypes;
    }
}
