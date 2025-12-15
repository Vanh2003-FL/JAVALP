package org.openremote.model.query;

public class LamppostQuery {
//                        .setParameter("lamppost_id", queryLamppost)
//                    .setParameter("lamp_type_id", null)
//                    .setParameter("nema_name", null)

    protected Long lamppostId;
    protected Long lampTypeId;
    protected String nemaName;
    protected Integer pageSize;
    protected Integer pageNumber;

    public LamppostQuery(Long lamppostId, Long lampTypeId, String nemaName) {
        this.lamppostId = lamppostId;
        this.lampTypeId = lampTypeId;
        this.nemaName = nemaName;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }

    public Long getLamppostId() {
        return lamppostId;
    }

    public void setLamppostId(Long lamppostId) {
        this.lamppostId = lamppostId;
    }

    public Long getLampTypeId() {
        return lampTypeId;
    }

    public void setLampTypeId(Long lampTypeId) {
        this.lampTypeId = lampTypeId;
    }

    public String getNemaName() {
        return nemaName!=null? nemaName.trim():"";
    }

    public void setNemaName(String nemaName) {
        this.nemaName = nemaName;
    }
}
