package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class HdiCmdData {
    protected Integer cmd;
    protected String data;

    public HdiCmdData(Integer cmd, String data) {
        this.cmd = cmd;
        this.data = data;
    }
    public HdiCmdData() {
    }

    public Integer getCmd() {
        return cmd;
    }

    public void setCmd(Integer cmd) {
        this.cmd = cmd;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
