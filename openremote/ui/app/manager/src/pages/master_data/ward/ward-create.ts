import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/grid";
import "@vaadin/dialog";
import "@vaadin/icon";
import "@vaadin/combo-box";
import "@vaadin/select";
import "@vaadin/list-box";
import "@vaadin/item";
import "@openremote/or-translate";

@customElement("ward-create")
export class WardCreate extends LitElement {
    @state() private districts = [];
    @state() private vietnamWards = [];
    @state() private newWard = { name: "", status: "1", createBy: "", createDate: "" };
    @state() private selectedDistrictId = "";
    @state() private notification = { show: false, message: "", isError: false };
    @state() private errors = {
        name: "",
        districtId: "",
        duplicate: ""
    };

    static styles = css`
        :host {
            display: block;
            font-family: 'Roboto', sans-serif;
            padding: 24px;
            color: #333;
            position: relative;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            color:  #4d9d2a;
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

        .notification.error {
            background-color: #f44336;
            color: white;
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
            gap: 24px;
        }

        vaadin-combo-box, vaadin-text-field, vaadin-select {
            width: 100%;
        }

        vaadin-button.primary {
            background-color:  #4d9d2a;
            color: white;
            font-weight: 500;
            border-radius: 4px;
            padding: 8px 16px;
            text-align: center;
        }

        vaadin-button.primary:hover {
            background-color: #2d8a5f;
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
            animation: slideInUp 0.3s ease-out forwards;
        }

        .notification.success {
            background-color: #4d9d2a;
        }

        .notification.error {
            background-color: #f44336;
        }

        @keyframes slideInUp {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .error {
            color: #f44336;
            font-size: 14px;
            margin-top: 4px;
            grid-column: span 2;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }

            .error {
                grid-column: span 1;
            }
        }
    `;

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    async fetchDistricts() {
        try {
            const filterDTO = {
                page: 1,
                size: 50,
                data: {}
            };

            const response = await manager.rest.api.DistrictResource.getData(filterDTO);

            if (response?.data) {
                this.districts = response.data.filter(district => district.deleted === 0);
            }
        } catch (error) {
            console.error("Error loading districts:", error);
            this.showNotification("load_district_error", true);
        }
    }

    async fetchWardsByDistrict(districtId) {
        if (!districtId) {
            this.vietnamWards = [];
            return;
        }

        try {
            const filterDTO = {
                page: 1,
                size: 50,
                data: {
                    districtId: districtId
                }
            };

            const response = await manager.rest.api.WardResource.getAll(filterDTO);

            if (response?.data) {
                this.vietnamWards = response.data
                    .filter(ward => ward.deleted === 0)
                    .map(ward => ward.name);
            }
        } catch (error) {
            console.error("Error loading wards:", error);
        }
    }

    private async validateWardName(districtId: number, wardName: string): Promise<boolean> {
        if (!districtId || !wardName.trim()) return false;

        try {
            const filterDTO = {
                page: 1,
                size: 50,
                data: {
                    districtId: districtId,
                    name: wardName.trim()
                }
            };

            const response = await manager.rest.api.WardResource.getAll(filterDTO);

            return response?.data?.some(ward =>
                ward.deleted === 0 &&
                ward.name.toLowerCase() === wardName.trim().toLowerCase()
            );
        } catch (error) {
            console.error("Error validating ward name:", error);
            return false;
        }
    }

    firstUpdated() {
        this.fetchDistricts();
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchDistricts();
    }

    private async addWard() {
        this.errors = { name: "", districtId: "", duplicate: "" };
        let hasError = false;

        if (!this.selectedDistrictId) {
            this.errors = { ...this.errors, districtId: "required_district" };
            hasError = true;
        }

        if (!this.newWard.name.trim()) {
            this.errors = { ...this.errors, name: "required_ward_name" };
            hasError = true;
        }

        if (hasError) return;

        const isDuplicate = await this.validateWardName(
            parseInt(this.selectedDistrictId),
            this.newWard.name
        );

        if (isDuplicate) {
            this.showNotification("duplicate_ward_error", true);
            return;
        }

        try {
            const userResponse = await manager.rest.api.UserResource.getCurrent();
            const currentUser = userResponse?.data?.username || "system";

            const wardData = {
                name: this.newWard.name.trim(),
                districtId: parseInt(this.selectedDistrictId),
                createBy: currentUser
            };

            const response = await manager.rest.api.WardResource.createProvince(wardData);

            if (response?.data) {
                this.showNotification("ward_create_success");
                this.newWard = { name: "", status: "1", createBy: "", createDate: "" };
                this.selectedDistrictId = "";
                this.errors = { name: "", districtId: "", duplicate: "" };
                setTimeout(() => {
                    this.navigateToMasterData();
                }, 2000);
            } else {
                throw new Error("empty_response_error");
            }
        } catch (error) {
            console.error("Error creating ward:", error);
            this.showNotification(error.message || "unknown_error", true);
        }
    }

    navigateToMasterData() {
        window.location.hash = '/master-data/masterDataPage4';
    }

    render() {
        return html`
            <div class="container">
                ${this.notification.show ? html`
                    <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                        <or-translate value="${this.notification.message}"></or-translate>
                    </div>
                ` : ''}

                <div class="back-link" @click="${this.navigateToMasterData}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    <or-translate value="back"></or-translate>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title"><or-translate value="add_new_ward"></or-translate></h2>
                        <vaadin-button class="primary" @click="${this.addWard}">
                            <or-translate value="save"></or-translate>
                        </vaadin-button>
                    </div>

                    <div class="card-content">
                        <div class="form-grid">
                            <div>
                                <vaadin-combo-box
                                        .items="${this.districts.map(d => ({ label: d.name, value: d.id.toString() }))}"
                                        item-label-path="label"
                                        item-value-path="value"
                                        placeholder="Chọn quận/huyện"
                                        .value="${this.selectedDistrictId}"
                                        @value-changed="${(e) => {
                                            this.selectedDistrictId = e.detail.value;
                                            this.fetchWardsByDistrict(e.detail.value);
                                            this.errors = { ...this.errors, districtId: "", duplicate: "" };
                                        }}"
                                >
                                    <label slot="label">
                                        <or-translate value="district_name"></or-translate> <span style="color:red;">*</span>
                                    </label>
                                </vaadin-combo-box>
                                ${this.errors.districtId ? html`<div class="error"><or-translate value="${this.errors.districtId}"></or-translate></div>` : ""}
                            </div>

                            <div>
                                <vaadin-text-field
                                        .value="${this.newWard.name}"
                                        ?disabled="${!this.selectedDistrictId}"
                                        @value-changed="${(e) => {
                                            this.newWard.name = e.detail.value;
                                            this.errors = { ...this.errors, name: "", duplicate: "" };
                                        }}"
                                >
                                    <label slot="label">
                                        <or-translate value="ward_name"></or-translate> <span style="color:red;">*</span>
                                    </label>
                                </vaadin-text-field>
                                ${this.errors.name ? html`<div class="error"><or-translate value="${this.errors.name}"></or-translate></div>` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
