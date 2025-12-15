import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/select";
import "@vaadin/combo-box";
import "@vaadin/icon";

interface District {
    id: string;
    name: string;
    district: string;
    status: string;
    createdBy: string;
    createdDate: string;
    provinceId?: number;
}

export interface Province {
    id?: number;
    name?: any;
    active?: number;
    deleted?: number;
    createDate?: number;
    updateDate?: number;
    createBy?: any;
    updateBy?: any;
}

@customElement("district-edit")
export class DistrictEdit extends LitElement {
    @property({ type: Object })
    district: District = { id: "", name: "", district: "", status: "", createdBy: "", createdDate: "" };

    @state() private isSaving = false;
    @state() private errorMessage = "";
    @state() private notification = { show: false, message: "", isError: false };
    @state() private provinces: Province[] = [];
    @state() private selectedProvinceId: number | null = null;
    @state() private provincesLoaded = false; // New state to track when provinces are loaded

    static styles = css`
        /* Các styles hiện tại */
        :host {
            display: block;
            font-family: 'Roboto', sans-serif;
            padding: 24px;
            color: #333;
            position: relative;
        }

        .field-container {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .field-label {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            font-weight: 500;
        }

        .required-asterisk {
            color: red;
            margin-left: 4px;
            font-weight: bold;
        }

        /* Increase specificity to override Vaadin styles */
        vaadin-combo-box::part(label),
        vaadin-text-field::part(label) {
            display: none !important;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            color: #3a9f6f;
            font-weight: 500;
            margin-bottom: 24px;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .back-link:hover {
            opacity: 0.8;
        }

        .back-link vaadin-icon {
            margin-right: 8px;
        }

        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
            overflow: hidden;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #eee;
        }

        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }

        .card-content {
            padding: 24px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: white;
            padding: 20px;
            border-radius: 5px;
        }

        vaadin-combo-box, vaadin-text-field, vaadin-select {
            width: 100%;
        }

        .readonly-field {
            --vaadin-field-default-width: 100%;
            --vaadin-input-field-border-color: #ddd;
            background-color: #f9f9f9;
        }

        vaadin-button.primary {
            background-color: #4D9D2A;
            color: white;
            font-weight: 500;
            border-radius: 4px;
            min-width: 80px;
            padding: 8px 16px;
            text-align: center;
        }
        vaadin-button.secondary {
            background-color: #e0e0e0;
            color: #333;
            font-weight: 500;
            border-radius: 4px;
            min-width: 120px;
            padding: 8px 16px;
            margin-right: 12px;
        }

        vaadin-button.secondary:hover {
            background-color: #d0d0d0;
        }

        .button-container {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out forwards;
        }

        .notification.success {
            background-color: #4caf50;
        }

        .notification.error {
            background-color: #f44336;
        }

        .error-message {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 16px;
            padding: 12px;
            background-color: #fef2f2;
            border-radius: 4px;
            border-left: 4px solid #e74c3c;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    async connectedCallback() {
        super.connectedCallback();

        // Parse URL parameters
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        this.district = {
            id: params.get("id") || "",
            name: params.get("name") || "",
            district: params.get("district") || "",
            status: params.get("status") || "",
            createdBy: params.get("createdBy") || "",
            createdDate: params.get("createdDate") || "",
            provinceId: params.get("provinceId") ? parseInt(params.get("provinceId")) : undefined
        };

        this.selectedProvinceId = this.district.provinceId || null;

        console.log("Loaded district for editing:", this.district);

        // Tải danh sách tỉnh/thành phố
        await this.loadProvinces();
    }

    async loadProvinces() {
        try {
            const filterDTO = {
                page: 1,
                size: 1000, // Đủ lớn để lấy hết tỉnh/thành phố
                sort: ["id,asc"],
                data: {},
            };

            const response = await manager.rest.api.ProvinceResource.getAll(filterDTO);

            if (response?.data) {
                this.provinces = response.data;
                this.provincesLoaded = true; // Mark provinces as loaded
                console.log("Provinces loaded:", this.provinces);
            }
        } catch (error) {
            console.error("Error loading provinces:", error);
            this.showNotification("Không thể tải danh sách tỉnh/thành phố", true);
        }
    }

    handleProvinceChange(e: CustomEvent) {
        const provinceId = e.detail.value;
        this.selectedProvinceId = provinceId ? Number(provinceId) : null;
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };

        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    render() {
        return html`
            <div class="container">
                ${this.notification.show ? html`
                    <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                        ${this.notification.message}
                    </div>
                ` : ''}

                <div class="back-link" @click="${this._cancel}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Chỉnh sửa quận/huyện</h2>
                        <div class="button-container">
                            <vaadin-button
                                    class="primary"
                                    @click="${this.saveChanges}"
                                    ?disabled="${this.isSaving}">
                                ${this.isSaving ? 'Đang lưu...' : 'Lưu'}
                            </vaadin-button>
                        </div>
                    </div>

                    <div class="card-content">
                        ${this.errorMessage ? html`
                            <div class="error-message">${this.errorMessage}</div>
                        ` : ''}

                        <div class="form-grid">
                            <!-- Tỉnh/Thành phố field with custom label and asterisk -->
                            <div class="field-container">
                                <div class="field-label">
                                    Tỉnh/Thành phố
                                    <span class="required-asterisk">*</span>
                                </div>
                                <vaadin-combo-box
                                        .items="${this.provinces.map(p => ({label: p.name, value: p.id}))}"
                                        .value="${this.selectedProvinceId}"
                                        id="province"
                                        @value-changed="${this.handleProvinceChange}"
                                        theme="medium"
                                        placeholder="Chọn tỉnh/thành phố"
                                        ?disabled="${!this.provincesLoaded}"
                                        .invalid="${!this.provincesLoaded ? false : this.selectedProvinceId === null}"
                                        required
                                ></vaadin-combo-box>
                            </div>

                            <!-- Tên quận/huyện field with custom label and asterisk -->
                            <div class="field-container">
                                <div class="field-label">
                                    Tên quận/huyện
                                    <span class="required-asterisk">*</span>
                                </div>
                                <vaadin-text-field
                                        .value="${this.district.district}"
                                        id="district"
                                        theme="medium"
                                        required
                                ></vaadin-text-field>
                            </div>

                            <!-- Trạng thái field with custom label -->
                            <div class="field-container">
                                <div class="field-label">
                                    Trạng thái
                                </div>
                                <vaadin-select
                                        id="status"
                                        theme="medium"
                                        .value="${this.district.status}"
                                        .items="${[
                                            {label: 'Hoạt động', value: '1'},
                                            {label: 'Không hoạt động', value: '0'}
                                        ]}"
                                ></vaadin-select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    saveChanges() {
        const districtInput = this.shadowRoot?.getElementById('district') as HTMLInputElement;
        const statusSelect = this.shadowRoot?.getElementById('status') as any;

        if (!districtInput?.value.trim()) {
            this.showNotification("Vui lòng nhập tên quận/huyện", true);
            return;
        }

        if (this.selectedProvinceId === null) {
            this.showNotification("Vui lòng chọn tỉnh/thành phố", true);
            return;
        }

        this.isSaving = true;
        this.errorMessage = "";

        // Sử dụng provinceId đã chọn
        this.updateDistrict(
            districtInput.value.trim(),
            statusSelect.value,
            this.selectedProvinceId
        );
    }

    updateDistrict(districtName: string, status: string, provinceId: number) {
        const isActive = status === "1";

        const updatedDistrict: any = {
            id: parseInt(this.district.id),
            name: districtName,
            active: isActive ? 1 : 0,
            deleted: isActive ? 0 : 1,
            provinceId: provinceId
        };

        console.log("Saving district changes:", updatedDistrict);

        // Call the API to update
        manager.rest.api.DistrictResource.update(updatedDistrict, {})
            .then(response => {
                console.log("District updated successfully:", response);
                this.showNotification("Cập nhật quận/huyện thành công");
                setTimeout(() => {
                    window.location.hash = "/master-data/masterDataPage2";
                }, 1500);
            })
            .catch(error => {
                console.error("Error updating district:", error);
                this.showNotification("Lỗi khi cập nhật quận/huyện", true);
                this.errorMessage = "Lỗi khi cập nhật quận/huyện: " + (error.message || "Vui lòng thử lại");
                this.isSaving = false;
            });
    }

    _cancel() {
        window.location.hash = "/master-data/masterDataPage2";
    }
}
