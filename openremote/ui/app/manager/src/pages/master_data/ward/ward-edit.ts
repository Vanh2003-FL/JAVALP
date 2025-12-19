import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/select";
import "@vaadin/combo-box";
import "@vaadin/icon";
import { i18next } from "@openremote/or-translate";

interface Ward {
    id: string;
    name: string;
    ward: string;
    status: string;
    createdBy: string;
    createdDate: string;
    provinceId?: number;
}

@customElement("ward-edit")
export class WardEdit extends LitElement {
    @property({ type: Object })
    ward: Ward = { id: "", name: "", ward: "", status: "", createdBy: "", createdDate: "" };

    @state() private isSaving = false;
    @state() private errorMessage = "";
    @state() private notification = { show: false, message: "", isError: false };
    @state() private provinces: Array<{ id: number, name: string }> = [];

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

        vaadin-button.primary {
            background-color: #4d9d2a;
            color: white;
            font-weight: 500;
            border-radius: 4px;
            padding: 8px 16px;
            text-align: center;
            cursor: pointer; 
        }


        vaadin-button.primary:hover {
            background-color: #4d9d2a;
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
        :host {
            --lumo-required-field-indicator: '';
        .notification.success {
            background-color: #4d9d2a;
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

    connectedCallback() {
        super.connectedCallback();
        const params = new URLSearchParams(window.location.hash.split("?")[1]);

        this.ward = {
            id: params.get("id") || "",
            name: params.get("name") || "",
            ward: params.get("name") || "",
            status: params.get("active") === "1" ? "Hoạt động" : "Không hoạt động",
            createdBy: params.get("createdBy") || "",
            createdDate: params.get("createdDate") || "",
            provinceId: params.get("provinceId") ? parseInt(params.get("provinceId")) : undefined
        };

        this.fetchProvinces();
    }

    async fetchProvinces() {
        try {
            const response = await manager.rest.api.ProvinceResource.getAll({
                page: 1,
                size: 100,
                data: {
                    active: 1,
                    deleted: 0
                }
            } as any);

            if (response?.data) {
                this.provinces = response.data.map(province => ({
                    id: province.id,
                    name: province.name
                }));

                this.ward = {
                    ...this.ward,
                    provinceId: Number(this.ward.provinceId) || null
                };
            } else {
                console.error("No province data returned");
                this.provinces = [];
            }
            console.log("Provinces: ", this.provinces);
            console.log("Current provinceId: ", this.ward.provinceId);

        } catch (error) {
            console.error("Error fetching provinces:", error);
            this.showNotification("Failed to load provinces", true);
        }
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
                    ${i18next.t(this.notification.message)}
                </div>
            ` : ''}

            <div class="back-link" @click="${this._cancel}">
                <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                ${i18next.t("Back")}
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${i18next.t("EditWardTitle")}</h2>
                    <div class="button-container">
                        <vaadin-button class="primary" @click="${this.saveChanges}">
                            ${i18next.t("Save")}
                        </vaadin-button>
                    </div>
                </div>

                <div class="card-content">
                    ${this.errorMessage ? html`
                        <div class="error-message">${i18next.t(this.errorMessage)}</div>
                    ` : ''}

                    <div class="form-grid">
                        <vaadin-combo-box
                            .items="${this.provinces}"
                            .value="${Number(this.ward.provinceId) || null}"
                            item-label-path="name"
                            item-value-path="id"
                            id="provinceId"
                            @value-changed="${(e: CustomEvent) => {
                this.ward.provinceId = Number(e.detail.value);
            }}">
                            <label slot="label">${i18next.t("Province")} <span style="color: red;">*</span></label>
                        </vaadin-combo-box>

                        <vaadin-text-field
                            .value="${this.ward.name || this.ward.ward}"
                            id="ward"
                            theme="medium"
                            placeholder="${i18next.t("WardNamePlaceholder")}"
                            required>
                            <label slot="label">${i18next.t("WardName")} <span style="color: red;">*</span></label>
                        </vaadin-text-field>

                        <vaadin-select
                            label="${i18next.t("Status")}"
                            id="status"
                            theme="medium"
                            .value="${this.ward.status === 'Hoạt động' ? '1' : '0'}"
                            .items="${[
                { label: i18next.t('Active'), value: '1' },
                { label: i18next.t('Inactive'), value: '0' }
            ]}">
                        </vaadin-select>
                    </div>
                </div>
            </div>
        </div>
    `;
    }


    saveChanges() {
        const wardInput = this.shadowRoot?.getElementById('ward') as HTMLInputElement;
        const statusSelect = this.shadowRoot?.getElementById('status') as any;
        const provinceSelect = this.shadowRoot?.getElementById('provinceId') as any;

        if (!wardInput?.value.trim()) {
            this.showNotification("Vui lòng nhập tên phường/xã", true);
            return;
        }

        if (!provinceSelect?.value) {
            this.showNotification("Vui lòng chọn tỉnh/thành phố", true);
            return;
        }

        this.isSaving = true;
        this.errorMessage = "";

        this.updateWard(
            wardInput.value.trim(),
            statusSelect.value,
            parseInt(provinceSelect.value)
        );
    }

    updateWard(wardName: string, status: string, provinceId: number) {
        const isActive = status === "1";

        const updatedWard: any = {
            id: parseInt(this.ward.id),
            name: wardName,
            active: isActive ? 1 : 0,
            deleted: isActive ? 0 : 1,
            provinceId: provinceId
        };

        manager.rest.api.WardResource.update(updatedWard, {})
            .then(response => {
                this.showNotification("Cập nhật phường/xã thành công");
                setTimeout(() => {
                    window.location.hash = "/master-data/masterDataPage4";
                }, 1500);
            })
            .catch(error => {
                console.error("Error updating ward:", error);
                this.showNotification("Lỗi khi cập nhật phường/xã", true);
                this.errorMessage = "Lỗi khi cập nhật phường/xã: " + (error.message || "Vui lòng thử lại");
                this.isSaving = false;
            });
    }

    _cancel() {
        window.location.hash = "/master-data/masterDataPage4";
    }
}
