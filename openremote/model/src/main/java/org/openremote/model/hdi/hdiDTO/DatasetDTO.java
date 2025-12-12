package org.openremote.model.hdi.hdiDTO;

// path: dto/DatasetDTO.java

import java.util.List;

public class DatasetDTO {
    private String label;
    private List<Object> data;

    public DatasetDTO() {}

    public DatasetDTO(String label, List<Object> data) {
        this.label = label;
        this.data = data;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public List<Object> getData() {
        return data;
    }

    public void setData(List<Object> data) {
        this.data = data;
    }
}
