package org.openremote.model.hdi.hdiDTO;

// path: dto/ChartDataDTO.java

import java.util.ArrayList;
import java.util.List;

public class ChartDataDTO {
    private List<Long> labels;
    private List<DatasetDTO> datasets;
    private String y0;


    public ChartDataDTO() {
        this.labels = new ArrayList<>();
        this.datasets = new ArrayList<>();
    }

    public ChartDataDTO(List<Long> labels, List<DatasetDTO> datasets) {
        this.labels = labels;
        this.datasets = datasets;
    }

    public String getY0() {
        return y0;
    }

    public void setY0(String y0) {
        this.y0 = y0;
    }

    public List<Long> getLabels() {
        return labels;
    }

    public void setLabels(List<Long> labels) {
        this.labels = labels;
    }

    public List<DatasetDTO> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<DatasetDTO> datasets) {
        this.datasets = datasets;
    }
}
