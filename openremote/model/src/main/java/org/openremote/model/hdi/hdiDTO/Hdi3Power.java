package org.openremote.model.hdi.hdiDTO;

public class Hdi3Power extends HdiCmdData {
    public Hdi3Power(String power) {
        super(3 , "power");
        this.relay = power;
    }
    String relay;

    public String getRelay() {
        return relay;
    }

    public void setRelay(String relay) {
        this.relay = relay;
    }
}
