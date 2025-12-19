import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/select";
import "@vaadin/combo-box";
import "@vaadin/icon";
import { i18next } from "@openremote/or-translate";
interface Supplier {
    id: string;
    code: string;
    name: string;
    status: string;
    createdBy: string;
    createdDate: string;
}

@customElement("supplier-edit")
export class SupplierEdit extends LitElement {
    @property({ type: Object })
    supplier: Supplier = { id: "", code: "", name: "", status: "", createdBy: "", createdDate: "" };

    @state() private isSaving = false;
    @state() private errorMessage = "";
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

        ::part(required-indicator) {
            display: none !important;
        }

        ::part(required-indicator)::after {
            content: none !important;
        }

        .readonly-field {
            --vaadin-field-default-width: 100%;
            --vaadin-input-field-border-color: #ddd;
            background-color: #f9f9f9;
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
            background-color: #4D9D2A;
        }

        vaadin-button.secondary {
            background-color: #e0e0e0;
            color: #333;
            font-weight: 500;
            border-radius: 4px;
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
            background-color: #4d9d2a;
        }

        .notification.error {
            background-color: #f44336;
            color: white;
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

        .error {
            color: #f44336;
            font-size: 14px;
            margin-top: 4px;
            grid-column: span 2;
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

            .error {
                grid-column: span 1;
            }
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        const params = new URLSearchParams(window.location.hash.split("?")[1]);

        const statusParam = params.get("active");

        this.supplier = {
            id: params.get("id") || "",
            code: params.get("code") || "",
            name: params.get("name") || "",
            status: statusParam === "0" ? "0" : "1",
            createdBy: params.get("createdBy") || "",
            createdDate: params.get("createdDate") || ""
        };
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    renderNotification() {
        return this.notification.show ? html`
            <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                ${this.notification.message}
            </div>
        ` : '';
    }

    private async checkDuplicateCode(code: string): Promise<boolean> {
        if (!code.trim() || code.trim() === this.supplier.code) return false;

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
                supplier.code.toLowerCase() === code.trim().toLowerCase() &&
                supplier.id.toString() !== this.supplier.id
            );
        } catch (error) {
            return false;
        }
    }

    private async validateFields(): Promise<boolean> {
        const codeInput = this.shadowRoot?.getElementById('code') as HTMLInputElement;
        const nameInput = this.shadowRoot?.getElementById('name') as HTMLInputElement;

        let valid = true;

        if (!codeInput?.value.trim()) {
            this.showNotification("Vui lòng nhập mã nhà sản xuất/cung cấp", true);
            valid = false;
        } else {
            const isDuplicate = await this.checkDuplicateCode(codeInput.value);
            if (isDuplicate) {
                this.showNotification("Mã nhà sản xuất/cung cấp đã tồn tại", true);
                valid = false;
            }
        }

        if (!nameInput?.value.trim()) {
            this.showNotification("Vui lòng nhập tên nhà sản xuất/cung cấp", true);
            valid = false;
        }

        return valid;
    }


    async saveChanges() {
        const isValid = await this.validateFields();
        if (!isValid) return;

        const codeInput = this.shadowRoot?.getElementById('code') as HTMLInputElement;
        const nameInput = this.shadowRoot?.getElementById('name') as HTMLInputElement;
        const statusSelect = this.shadowRoot?.getElementById('status') as any;

        this.isSaving = true;
        this.errorMessage = "";

        this.updateSupplier(
            codeInput?.value.trim() || "",
            nameInput.value.trim(),
            statusSelect.value
        );
    }


    async updateSupplier(code: string, name: string, status: string) {
        const isDuplicate = await this.checkDuplicateCode(code);
        if (isDuplicate) {
            this.notification = {
                show: true,
                message: "Mã nhà sản xuất/cung cấp đã tồn tại",
                isError: true
            };
            return;
        }


        const isActive = status === "1";

        const updatedSupplier: any = {
            id: parseInt(this.supplier.id),
            code: code,
            name: name,
            active: isActive ? 1 : 0,
            deleted: isActive ? 0 : 1
        };

        manager.rest.api.SupplierResource.update(updatedSupplier, {})
            .then(() => {
                this.showNotification("Cập nhật nhà cung cấp thành công");
                setTimeout(() => {
                    window.location.hash = "/master-data/masterDataPage5";
                }, 1500);
            })
            .catch(error => {
                this.showNotification("Lỗi khi cập nhật nhà cung cấp", true);
                this.errorMessage = "Lỗi khi cập nhật nhà cung cấp: " + (error.message || "Vui lòng thử lại");
                this.isSaving = false;
            });
    }


    _cancel() {
        window.location.hash = "/master-data/masterDataPage5";
    }

    render() {
        return html`
            <div class="container">
                ${this.renderNotification()}

                <div class="back-link" @click="${this._cancel}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    ${i18next.t("Back")}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">${i18next.t("EditSupplierTitle")}</h2>
                        <div class="button-container">
                            <vaadin-button class="primary" @click="${this.saveChanges}">${i18next.t("Save")}</vaadin-button>
                        </div>
                    </div>

                    <div class="card-content">
                        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}

                        <div class="form-grid">
                            <vaadin-text-field
                                    .value="${this.supplier.code}"
                                    id="code"
                                    theme="medium"
                                    @keydown="${(e: KeyboardEvent) => {
                                        if (!/[a-zA-Z0-9_]/.test(e.key) &&
                                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}"
                                    required
                                    maxlength="50">
                                <span slot="label">${i18next.t("SupplierCode")} <span style="color: red;">*</span></span>
                            </vaadin-text-field>


                            <vaadin-text-field
                                    .value="${this.supplier.name}"
                                    id="name"
                                    theme="medium"
                                    placeholder="Nhập tên nhà cung cấp"
                                    required
                                    maxlength="250">
                                <span slot="label">${i18next.t("SupplierName")} <span style="color: red;">*</span></span>
                            </vaadin-text-field>


                            <vaadin-select
                                    label="${i18next.t("Status")}"
                                    id="status"
                                    theme="medium"
                                    .value="${this.supplier.status}"
                                    .items="${[
                                        { label: i18next.t("Active"), value: '1' },
                                        { label: i18next.t("Inactive"), value: '0' }
                                    ]}">
                            </vaadin-select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
