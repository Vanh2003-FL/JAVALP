package org.openremote.model.hdi.hdiDTO;

public class Hdi253Update extends HdiCmdData {
    protected String phase_1;
    protected String phase_2;
    protected String phase_3;
    public Hdi253Update() {
        super(253, "update");
    }

    public String getPhase_1() {
        return phase_1;
    }

    public void setPhase_1(String phase_1) {
        this.phase_1 = phase_1;
    }

    public String getPhase_2() {
        return phase_2;
    }

    public void setPhase_2(String phase_2) {
        this.phase_2 = phase_2;
    }

    public String getPhase_3() {
        return phase_3;
    }

    public void setPhase_3(String phase_3) {
        this.phase_3 = phase_3;
    }

}
