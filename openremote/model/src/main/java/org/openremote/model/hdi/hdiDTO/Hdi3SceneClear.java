package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Hdi3SceneClear extends HdiCmdData{

    Integer scene_id;
    public Hdi3SceneClear() {
        super(3, "scene_clear");
    }

    public Integer getTimer_id() {
        return scene_id;
    }

    public void setTimer_id(Integer timer_id) {
        this.scene_id = timer_id;
    }
}

