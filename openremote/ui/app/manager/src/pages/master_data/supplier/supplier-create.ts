import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/dialog";
import "@vaadin/icon";
import "@vaadin/select";
import "@vaadin/item";
import '@vaadin/icons';
import { i18next } from "@openremote/or-translate";
@customElement("supplier-create")
export class SupplierCreate extends LitElement {
    @state() private newSupplier = {
        code: "",
        name: "",
        active: "1", // Default to active
        createBy: ""
    };


    @state() private notification = { show: false, message: "", isError: false };

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
            color: #4d9d2a;
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
        .notification.error {
            background-color: #f44336;
            color: white;
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
            gap: 24px;
        }

        vaadin-select, vaadin-text-field {
            width: 100%;
        }

        vaadin-button.primary {
            background-color: #4d9d2a;
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
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 24px;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
        
        vaadin-text-field[required]::part(label) {
            font-weight: 500;
        }

        vaadin-text-field[invalid]::part(input-field) {
            border-color: #f44336;
        }
        :host {
            --lumo-required-field-indicator: '';
    `;

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    private async checkDuplicateCode(code: string): Promise<boolean> {
        if (!code.trim()) return false;

        try {
            const filterDTO = {
                page: 1,
                size: 1,
                data: {
                    code: code.trim()
                }
            };

            const response = await manager.rest.api.SupplierResource.getAll(filterDTO);

            return response?.data?.some(supplier =>
                supplier.deleted === 0 &&
                supplier.code.toLowerCase() === code.trim().toLowerCase()
            );
        } catch (error) {
            console.error("Error checking duplicate code:", error);
            return false;
        }
    }

    private async validateForm(): Promise<boolean> {
        let isValid = true;

        if (!this.newSupplier.code.trim()) {
            this.showNotification(i18next.t("PleaseEnterSupplierCode"), true);
            isValid = false;
        } else {
            const isDuplicate = await this.checkDuplicateCode(this.newSupplier.code);
            if (isDuplicate) {
                this.showNotification(i18next.t("SupplierCodeExists"), true);
                isValid = false;
            }
        }

        if (!this.newSupplier.name.trim()) {
            this.showNotification(i18next.t("PleaseEnterSupplierName"), true);
            isValid = false;
        }

        return isValid;
    }


    private async createSupplier() {
        const isValid = await this.validateForm();
        if (!isValid) return;

        try {
            const userResponse = await manager.rest.api.UserResource.getCurrent();
            const currentUser = userResponse?.data?.username || "system";

            const code = this.newSupplier.code.trim();
            const name = this.newSupplier.name.trim();

            const supplierData = {
                code,
                name,
                active: parseInt(this.newSupplier.active),
                createBy: currentUser,
                deleted: 0
            };

            const response = await manager.rest.api.SupplierResource.createSupplier(supplierData);

            if (response?.data) {
                this.showNotification(i18next.t("AddSupplierSuccess"));
                setTimeout(() => {
                    this.navigateToList();
                }, 2000);
            } else {
                throw new Error("Tạo nhà cung cấp không thành công");
            }
        } catch (error: any) {
            const errorCode = error?.response?.data?.errorCode;

            if (errorCode === "ALREADY_EXISTS") {
                this.showNotification("Mã nhà sản xuất/cung cấp đã tồn tại", true);
            } else {
                this.showNotification("Đã có lỗi xảy ra. Vui lòng thử lại", true);
            }

            console.error("Supplier create error:", error);
        }
    }




    navigateToList() {
        window.location.hash = '/master-data/masterDataPage5';
    }

    render() {
        return html`
            <div class="container">
                ${this.notification.show ? html`
                    <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                        ${this.notification.message}
                    </div>
                ` : ''}

                <div class="back-link" @click="${this.navigateToList}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">${i18next.t("AddNewSupplier")}</h2>
                        <vaadin-button
                                class="primary"
                                @click="${this.createSupplier}">
                            ${i18next.t("Save")}
                        </vaadin-button>
                    </div>

                    <div class="card-content">
                        <div class="form-grid">
                            <vaadin-text-field
                                    .value="${this.newSupplier.code}"
                                    @keydown="${(e: KeyboardEvent) => {
                                        if (!/[a-zA-Z0-9_]/.test(e.key) &&
                                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}"
                                    @value-changed="${(e: any) => {
                                        this.newSupplier.code = e.detail.value;
                                    }}"
                                    required
                                    maxlength="50"
                            >
                                <span slot="label">${i18next.t("SupplierCode")} <span style="color: red;">*</span></span>
                            </vaadin-text-field>

                            <vaadin-text-field
                                    .value="${this.newSupplier.name}"
                                    @value-changed="${(e: any) => {
                                        this.newSupplier.name = e.detail.value;
                                    }}"
                                    required
                                    maxlength="250"
                            >
                                <span slot="label">${i18next.t("SupplierName")} <span style="color: red;">*</span></span>
                            </vaadin-text-field>

                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
