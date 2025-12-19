package org.openremote.model.scheduleinfo;

import jakarta.persistence.*;
import org.openremote.model.attribute.AttributeMap;

import java.security.Timestamp;
import java.time.Duration;

@Entity
@Table(name = "schedule_content")
public class ScheduleContent {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private ScheduleInfo schedule;

    @Column(name = "\"number\"")
    private Integer number;

    @Column(columnDefinition = "interval")
    private Duration duration;

    @Column(name = "order_by")
    private Integer orderBy;

    @Column(name = "time_period", columnDefinition = "jsonb")
    private AttributeMap timePeriod;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public ScheduleContent() {
    }

    public ScheduleContent(String id) {
        this.id = id;
    }
}
