package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Hdi3ControlSe extends HdiCmdData {
    protected String nema_list;

    public Hdi3ControlSe(String nema_list) {
        super(3,"control");
        this.nema_list = nema_list;

    }

    public Hdi3ControlSe() {
        super(3,"control");
    }

    public String getNema_list() {
        return nema_list;
    }

    public void setNema_list(String nema_list) {
        this.nema_list = nema_list;
    }
}
