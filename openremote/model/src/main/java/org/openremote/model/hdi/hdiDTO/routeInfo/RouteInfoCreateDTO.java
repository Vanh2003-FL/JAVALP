package org.openremote.model.hdi.hdiDTO.routeInfo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RouteInfoCreateDTO {
    private String id;                     // Mã định danh tuyến
    private String routeCode;              // Mã tuyến
    private String routeName;              // Tên tuyến
    private String realm;                  // Miền dữ liệu
    private Integer provinceId;            // ID tỉnh/thành phố
    private Integer districtId;            // ID quận/huyện
    private Integer wardId;                // ID phường/xã
    private String streetName;             // Tên đường
    private String address;                // Địa chỉ chi tiết
    private String status;                 // Trạng thái
    private String activeDate;      // Ngày hoạt động
    private Boolean deleted;               // Đã xóa hay chưa
    private String description;            // Mô tả thêm
    private String createDate;      // Ngày tạo
    private String createBy;               // Người tạo
    private String updateDate;      // Ngày cập nhật
    private String updateBy;               // Người cập nhật
    private List<RouteAssetCreateDTO> routeAssetCreateDTOS;

    public RouteInfoCreateDTO() {
    }
    @JsonCreator
    public RouteInfoCreateDTO(String id, String routeCode, String routeName, String realm, Integer provinceId, Integer districtId, Integer wardId, String streetName, String address, String status, String activeDate, Boolean deleted, String description, String createDate, String createBy, String updateDate, String updateBy, List<RouteAssetCreateDTO> routeAssetCreateDTOS) {
        this.id = id;
        this.routeCode = routeCode;
        this.routeName = routeName;
        this.realm = realm;
        this.provinceId = provinceId;
        this.districtId = districtId;
        this.wardId = wardId;
        this.streetName = streetName;
        this.address = address;
        this.status = status;
        this.activeDate = activeDate;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.routeAssetCreateDTOS = routeAssetCreateDTOS;
    }

    public RouteInfoCreateDTO(String id, String routeCode, String routeName, String realm, Integer provinceId, Integer districtId, Integer wardId, String streetName, String address, String status, String activeDate, Boolean deleted, String description, String createDate, String createBy, String updateDate, String updateBy) {
        this.id = id;
        this.routeCode = routeCode;
        this.routeName = routeName;
        this.realm = realm;
        this.provinceId = provinceId;
        this.districtId = districtId;
        this.wardId = wardId;
        this.streetName = streetName;
        this.address = address;
        this.status = status;
        this.activeDate = activeDate;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
    }

    public List<RouteAssetCreateDTO> getRouteAssetCreateDTOS() {
        return routeAssetCreateDTOS;
    }

    public void setRouteAssetCreateDTOS(List<RouteAssetCreateDTO> routeAssetCreateDTOS) {
        this.routeAssetCreateDTOS = routeAssetCreateDTOS;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRouteCode() {
        return routeCode;
    }

    public void setRouteCode(String routeCode) {
        this.routeCode = routeCode;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public Integer getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(Integer provinceId) {
        this.provinceId = provinceId;
    }

    public Integer getDistrictId() {
        return districtId;
    }

    public void setDistrictId(Integer districtId) {
        this.districtId = districtId;
    }

    public Integer getWardId() {
        return wardId;
    }

    public void setWardId(Integer wardId) {
        this.wardId = wardId;
    }

    public String getStreetName() {
        return streetName;
    }

    public void setStreetName(String streetName) {
        this.streetName = streetName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActiveDate() {
        return activeDate;
    }

    public void setActiveDate(String activeDate) {
        this.activeDate = activeDate;
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
