package org.openremote.model.hdi.hdiDTO.routeInfo;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.SqlResultSetMapping;

/**
 * DTO đại diện cho bảng route_assets.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RouteAssetDTO {

    @Schema(description = "Khóa chính tự tăng", example = "1")
    private Long id;

    @Schema(description = "ID của route", example = "ROUTE1234567890")
    private String routeId;

    @Schema(description = "ID của asset", example = "ASSET1234567890")
    private String assetId;

    @Schema(description = "ID loại asset trong hệ thống", example = "1001")
    private Long sysAssetTypeId;

    @Schema(description = "Thời điểm kích hoạt", example = "2023-10-01T00:00:00Z")
    private String activeDate;

    @Schema(description = "Thời điểm ngừng hoạt động", example = "2023-12-31T23:59:59Z")
    private String deactiveDate;

    @Schema(description = "Trạng thái đã xóa hay chưa", example = "false")
    private Boolean deleted = false;

    @Schema(description = "Mô tả thêm", example = "Tuyến đường gán cho tài sản thiết bị A")
    private String description;

    @Schema(description = "Ngày tạo", example = "2023-09-15T08:30:00")
    private String createDate;

    @Schema(description = "Người tạo", example = "admin-user-uuid")
    private String createBy;

    @Schema(description = "Ngày cập nhật", example = "2023-10-20T10:45:00")
    private String updateDate;

    @Schema(description = "Người cập nhật", example = "editor-user-uuid")
    private String updateBy;

    // Getters and Setters

    public RouteAssetDTO(Long id, String routeId, String assetId, Long sysAssetTypeId, String activeDate, String deactiveDate, Boolean deleted, String description, String createDate, String createBy, String updateDate, String updateBy) {
        this.id = id;
        this.routeId = routeId;
        this.assetId = assetId;
        this.sysAssetTypeId = sysAssetTypeId;
        this.activeDate = activeDate;
        this.deactiveDate = deactiveDate;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public Long getSysAssetTypeId() {
        return sysAssetTypeId;
    }

    public void setSysAssetTypeId(Long sysAssetTypeId) {
        this.sysAssetTypeId = sysAssetTypeId;
    }

    public String getActiveDate() {
        return activeDate;
    }

    public void setActiveDate(String activeDate) {
        this.activeDate = activeDate;
    }

    public String getDeactiveDate() {
        return deactiveDate;
    }

    public void setDeactiveDate(String deactiveDate) {
        this.deactiveDate = deactiveDate;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreateDate() {
        return createDate;
    }

    public void setCreateDate(String createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public String getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }
}
