package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Hdi3SceneTime{
    String time;
    String nema_list;
    private Integer line_1;
    private Integer line_2;
    private Integer line_3;

    public Hdi3SceneTime(String time, String nema_list) {
        this.time = time;
        this.nema_list = nema_list;
    }


    public Hdi3SceneTime() {
    }

    public Hdi3SceneTime(String time) {
        this.time = time;
    }

    public Integer getLine_1() {
        return line_1;
    }

    public void setLine_1(Integer line_1) {
        this.line_1 = line_1;
    }

    public Integer getLine_2() {
        return line_2;
    }

    public void setLine_2(Integer line_2) {
        this.line_2 = line_2;
    }

    public Integer getLine_3() {
        return line_3;
    }

    public void setLine_3(Integer line_3) {
        this.line_3 = line_3;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getNema_list() {
        return nema_list;
    }

    public void setNema_list(String nema_list) {
        this.nema_list = nema_list;
    }
}

