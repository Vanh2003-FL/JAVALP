package org.openremote.model.Schedule;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarMonthSchedulesRequest {
    private String viewStart;
    private String viewEnd;

    // "PENDING" | "APPROVED"
    private String approvalStatus;
    private String contentType; // optional


    private String priority;
    private String liveChannelTitle;
    private String entityName;
    private String playlistName;

    public CalendarMonthSchedulesRequest() {}

    public String getViewStart() { return viewStart; }
    public void setViewStart(String viewStart) { this.viewStart = viewStart; }

    public String getViewEnd() { return viewEnd; }
    public void setViewEnd(String viewEnd) { this.viewEnd = viewEnd; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getPriority() {
        return priority;
    }

    public String getLiveChannelTitle() {
        return liveChannelTitle;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getPlaylistName() {
        return playlistName;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setLiveChannelTitle(String liveChannelTitle) {
        this.liveChannelTitle = liveChannelTitle;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public void setPlayListName(String playlistName) {
        this.playlistName = playlistName;
    }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
}
