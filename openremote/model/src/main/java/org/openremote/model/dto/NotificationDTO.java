package org.openremote.model.dto;

import java.util.Date;

public class NotificationDTO {
    private String titleWarning;
    private String htmlWarning;
    private String emailCustomer;
    private String attributeName;
    private String realm;
    private Date timeSent;

    public NotificationDTO() {
    }

    public NotificationDTO(String titleWarning, String htmlWarning, String emailCustomer, String attributeName, String realm, Date timeSent) {
        this.titleWarning = titleWarning;
        this.htmlWarning = htmlWarning;
        this.emailCustomer = emailCustomer;
        this.attributeName = attributeName;
        this.realm = realm;
        this.timeSent = timeSent;
    }

    public String getTitleWarning() {
        return titleWarning;
    }

    public void setTitleWarning(String titleWarning) {
        this.titleWarning = titleWarning;
    }

    public String getHtmlWarning() {
        return htmlWarning;
    }

    public void setHtmlWarning(String htmlWarning) {
        this.htmlWarning = htmlWarning;
    }

    public String getEmailCustomer() {
        return emailCustomer;
    }

    public void setEmailCustomer(String emailCustomer) {
        this.emailCustomer = emailCustomer;
    }

    public String getAttributeName() {
        return attributeName;
    }

    public void setAttributeName(String attributeName) {
        this.attributeName = attributeName;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public Date getTimeSent() {
        return timeSent;
    }

    public void setTimeSent(Date timeSent) {
        this.timeSent = timeSent;
    }
}
