package org.openremote.model.hdi.hdiDTO;

public class Hdi5Ota extends HdiCmdData{
    public Hdi5Ota( String target, String version, String url) {
        super(5, "ota");
        this.target = target;
        this.version = version;
        this.url = url;
    }

    public Hdi5Ota() {
        super(5, "ota");
    }

    private String target;
    private String version;
    private String url;

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
