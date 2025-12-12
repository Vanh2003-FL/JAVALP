package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Hdi4StateSe extends HdiCmdData {
    public Hdi4StateSe() {
        super(4, "state");
    }
}
