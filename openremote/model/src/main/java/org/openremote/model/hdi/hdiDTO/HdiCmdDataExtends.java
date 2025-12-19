package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
@JsonIgnoreProperties(ignoreUnknown = true)
public class HdiCmdDataExtends extends HdiCmdData {

    @JsonCreator
    public HdiCmdDataExtends(
            @JsonProperty("cmd") Integer cmd,
            @JsonProperty("data") String data) {
        super(cmd, data);
    }
}
