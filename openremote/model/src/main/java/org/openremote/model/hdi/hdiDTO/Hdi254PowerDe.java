package org.openremote.model.hdi.hdiDTO;

public class Hdi254PowerDe extends HdiCmdData{

    private String relay;

    public Hdi254PowerDe() {
        super(254, "power");
    }
    public Hdi254PowerDe(String relay) {
        super(254, "power");
        this.relay = relay;
    }

    public String getRelay() {
        return relay;
    }

    public void setRelay(String relay) {
        this.relay = relay;
    }
}
