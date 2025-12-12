package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Hdi3ControlSe2 extends HdiCmdData{

    private Integer line_1;
    private Integer line_2;
    private Integer line_3;
    private Integer line_4;
    public Hdi3ControlSe2() {
        super(3, "control");
    }

    public Hdi3ControlSe2(Integer line_1, Integer line_2, Integer line_3, Integer line_4) {
        super(3, "control");
        this.line_1 = line_1;
        this.line_2 = line_2;
        this.line_3 = line_3;
        this.line_4 = line_4;
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
}
