package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Optional;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Hdi254StateDe extends HdiCmdData {
    protected String line_1;
    protected String line_2;
    protected String line_3;
    protected String line_4;

    public Hdi254StateDe(String line_1, String line_2,String line_3,String line_4) {
        super(254, "state");
        this.line_1=line_1;
        this.line_2=line_2;
        this.line_3=line_3;
        this.line_4=line_4;
    }
    public Hdi254StateDe() {
        super(254, "state");
    }

    @Override
    public String toString() {
        return "Hdi254StateDe{" +
                "line_1='" + line_1 + '\'' +
                ", line_2='" + line_2 + '\'' +
                ", line_3='" + line_3 + '\'' +
                ", line_4='" + line_4 + '\'' +
                ", cmd=" + cmd +
                ", data='" + data + '\'' +
                '}';
    }

    public Optional<String> getLine_1() {
        return Optional.of(line_1);
    }

    public void setLine_1(String line_1) {
        this.line_1 = line_1;
    }

    public  Optional<String>  getLine_2() {
        return Optional.of(line_2);
    }

    public void setLine_2(String line_2) {
        this.line_2 = line_2;
    }

    public  Optional<String> getLine_3() {
        return Optional.of(line_3);
    }

    public void setLine_3(String line_3) {
        this.line_3 = line_3;
    }
}
