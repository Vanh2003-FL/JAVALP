package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Hdi3SceneSe extends HdiCmdData{
    Integer scene_id;
    String date_from;
    String date_to;
    String day;
    Integer repeat;
    List<Hdi3SceneTime> time;
    Integer enable;
    String scene_name;

    public Hdi3SceneSe() {
        super(3, "scene");
        this.time=new ArrayList<>();
    }

    public Hdi3SceneSe(Integer scene_id, String date_from, String date_to, String day, Integer repeat, List<Hdi3SceneTime> time, Integer enable, String scene_name) {
        super(3, "scene");
        this.scene_id = scene_id;
        this.date_from = date_from;
        this.date_to = date_to;
        this.day = day;
        this.repeat = repeat;
        this.time = time;
        this.enable = enable;
        this.scene_name = scene_name;
    }

    public String getScene_name() {
        return scene_name;
    }

    public void setScene_name(String scene_name) {
        this.scene_name = scene_name;
    }

    public Integer getScene_id() {
        return scene_id;
    }

    public void setScene_id(Integer scene_id) {
        this.scene_id = scene_id;
    }

    public String getDate_from() {
        return date_from;
    }

    public void setDate_from(String date_from) {
        this.date_from = date_from;
    }

    public String getDate_to() {
        return date_to;
    }

    public void setDate_to(String date_to) {
        this.date_to = date_to;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public Integer getRepeat() {
        return repeat;
    }

    public void setRepeat(Integer repeat) {
        this.repeat = repeat;
    }

    public List<Hdi3SceneTime> getTime() {
        return time;
    }

    public void setTime(List<Hdi3SceneTime> time) {
        this.time = time;
    }

    public Integer getEnable() {
        return enable;
    }

    public void setEnable(Integer enable) {
        this.enable = enable;
    }
}
