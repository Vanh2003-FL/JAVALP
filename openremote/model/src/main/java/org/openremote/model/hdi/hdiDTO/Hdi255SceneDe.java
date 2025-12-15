package org.openremote.model.hdi.hdiDTO;

public class Hdi255SceneDe extends HdiCmdData {
    Integer scene_id;
    Integer status;

    public Hdi255SceneDe() {
        super(255, "scene");
    }


    public Hdi255SceneDe(Integer scene_id, Integer status) {
        super(255, "scene");
        this.scene_id = scene_id;
        this.status = status;
    }

    public Integer getScene_id() {
        return scene_id;
    }

    public void setScene_id(Integer scene_id) {
        this.scene_id = scene_id;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
