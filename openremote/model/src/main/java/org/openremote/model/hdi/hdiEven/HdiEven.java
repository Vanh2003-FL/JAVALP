package org.openremote.model.hdi.hdiEven;

import org.openremote.model.event.shared.SharedEvent;

public class HdiEven extends SharedEvent {
    protected String assetCode;
    protected Object value;

    public HdiEven(Long timestamp, Object value) {
        super(timestamp);
        this.value = value;
    }

    public HdiEven(Object value) {
        this.value = value;
    }

    public HdiEven(Long timestamp, String assetCode, Object value) {
        super(timestamp);
        this.assetCode = assetCode;
        this.value = value;
    }

    public HdiEven(String assetCode, Object value) {
        this.assetCode = assetCode;
        this.value = value;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }
}
