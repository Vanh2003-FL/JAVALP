package org.openremote.model.hdi;

import java.util.List;

public class PagedResult {
    List<?> items;
    Long total;

    public PagedResult(List<?> items, Long total) {
        this.items = items;
        this.total = total;
    }

    public List<?> getItems() {
        return items;
    }

    public void setItems(List<?> items) {
        this.items = items;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
