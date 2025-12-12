import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/select";
import "@vaadin/item";
import "@vaadin/icon";
import "@vaadin/icons";
import { i18next } from "@openremote/or-translate";
@customElement("lamptype-create")
export class LamptypeCreate extends LitElement {
    @state() private newLampType = {
        lampTypeCode: "",
        lampTypeName: "",
        powerConsumption: "",
        luminousFlux: "",
        lifeHours: "",
        active: "1",
        createBy: ""
    };

    @state() private formErrors = {
        powerConsumption: '',
        luminousFlux: '',
        lifeHours: ''
    };

    @state() private notification = { show: false, message: "", isError: false };

    static styles = css`
        :host {
            display: block;
            font-family: 'Roboto', sans-serif;
            padding: 24px;
            color: #333;
            position: relative;
            --lumo-required-field-indicator: '';
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
        }

        .card-content {
            padding: 24px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        vaadin-text-field, vaadin-select {
            width: 100%;
        }

        vaadin-button.primary {
            background-color: #4d9d2a;
            color: white;
            font-weight: 500;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
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
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    private async checkDuplicateLampTypeCode(code: string): Promise<boolean> {
        if (!code.trim()) return false;
        try {
            const response = await manager.rest.api.LampTypeResource.getAll({
                page: 1,
                size: 1,
                data: { lampTypeCode: code.trim() }
            });
            return response?.data?.some(lampType =>
                lampType.deleted === 0 &&
                lampType.lampTypeCode.toLowerCase() === code.trim().toLowerCase()
            );
        } catch {
            return false;
        }
    }

    private validateNumericField(value: string, fieldName: string): { isValid: boolean, error: string } {
        if (!value.trim()) return { isValid: false, error: `${fieldName} không được để trống` };
        const num = parseFloat(value);
        if (isNaN(num)) return { isValid: false, error: `${fieldName} phải là số` };
        if (num <= 0) return { isValid: false, error: `${fieldName} phải lớn hơn 0` };
        return { isValid: true, error: '' };
    }

    private async validateForm(): Promise<boolean> {
        let isValid = true;
        const code = this.newLampType.lampTypeCode.trim();
        const name = this.newLampType.lampTypeName.trim();

        if (!code) {
            this.showNotification("Vui lòng nhập mã loại đèn", true);
            isValid = false;
        } else {
            const isDuplicate = await this.checkDuplicateLampTypeCode(code);
            if (isDuplicate) {
                this.showNotification("Mã loại đèn đã tồn tại!", true);
                isValid = false;
            }
        }

        if (!name) {
            this.showNotification("Vui lòng nhập tên loại đèn", true);
            isValid = false;
        }

        const power = this.validateNumericField(this.newLampType.powerConsumption, "Công suất");
        const flux = this.validateNumericField(this.newLampType.luminousFlux, "Quang thông");
        const life = this.validateNumericField(this.newLampType.lifeHours, "Tuổi thọ");

        this.formErrors = {
            powerConsumption: power.error,
            luminousFlux: flux.error,
            lifeHours: life.error
        };

        return isValid && power.isValid && flux.isValid && life.isValid;
    }

    private async createLampType() {
        const isValid = await this.validateForm();
        if (!isValid) return;

        try {
            const userResponse = await manager.rest.api.UserResource.getCurrent();
            const currentUser = userResponse?.data?.username || "system";

            const payload = {
                lampTypeCode: this.newLampType.lampTypeCode.trim(),
                lampTypeName: this.newLampType.lampTypeName.trim(),
                powerConsumption: parseFloat(this.newLampType.powerConsumption),
                luminousFlux: parseFloat(this.newLampType.luminousFlux),
                lifeHours: parseFloat(this.newLampType.lifeHours),
                active: parseInt(this.newLampType.active),
                deleted: 0,
                createBy: currentUser
            };

            const response = await manager.rest.api.LampTypeResource.createLampType(payload);

            if (response?.data) {
                this.showNotification("Thêm loại đèn mới thành công");
                setTimeout(() => this.navigateToList(), 2000);
            } else {
                throw new Error();
            }
        } catch (error: any) {
            const errorCode = error?.response?.data?.errorCode;
            if (errorCode === "ALREADY_EXISTS") {
                this.showNotification("Mã loại đèn đã tồn tại!", true);
            } else {
                this.showNotification("Đã có lỗi xảy ra. Vui lòng thử lại", true);
            }
        }
    }

    private handleNumericInput(e: KeyboardEvent) {
        if (
            [46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
            (e.keyCode === 65 && e.ctrlKey) || (e.keyCode === 67 && e.ctrlKey) ||
            (e.keyCode === 86 && e.ctrlKey) || (e.keyCode === 88 && e.ctrlKey) ||
            (e.keyCode >= 35 && e.keyCode <= 39)
        ) return;

        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    navigateToList() {
        window.location.hash = '/master-data/masterDataPage6';
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
                ${i18next.t("common.back")}
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${i18next.t("lampType.create.title")}</h2>
                    <vaadin-button class="primary" @click="${this.createLampType}">${i18next.t("common.save")}</vaadin-button>
                </div>
                <div class="card-content">
                    <div class="form-grid">
                        <vaadin-text-field
                            .value="${this.newLampType.lampTypeCode}"
                            @keydown="${(e: KeyboardEvent) => {
            if (!/[a-zA-Z0-9_]/.test(e.key) &&
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
        }}"
                            @value-changed="${(e: any) => this.newLampType.lampTypeCode = e.detail.value}"
                            required maxlength="30"
                        >
                            <span slot="label">${i18next.t("lampType.fields.code")} <span style="color: red;">*</span></span>
                        </vaadin-text-field>

                        <vaadin-text-field
                            .value="${this.newLampType.lampTypeName}"
                            @value-changed="${(e: any) => this.newLampType.lampTypeName = e.detail.value}"
                            required maxlength="250"
                        >
                            <span slot="label">${i18next.t("lampType.fields.name")} <span style="color: red;">*</span></span>
                        </vaadin-text-field>

                        <vaadin-text-field
                            .value="${this.newLampType.powerConsumption}"
                            @value-changed="${(e: any) => this.newLampType.powerConsumption = e.detail.value}"
                            @keydown="${this.handleNumericInput}"
                            error-message="${this.formErrors.powerConsumption}"
                            ?invalid="${!!this.formErrors.powerConsumption}"
                            required
                        >  <span slot="label">${i18next.t("lampType.fields.power")} <span style="color: red;">*</span></span>
                        </vaadin-text-field>

                        <vaadin-text-field
                            .value="${this.newLampType.luminousFlux}"
                            @value-changed="${(e: any) => this.newLampType.luminousFlux = e.detail.value}"
                            @keydown="${this.handleNumericInput}"
                            error-message="${this.formErrors.luminousFlux}"
                            ?invalid="${!!this.formErrors.luminousFlux}"
                            required
                        >  <span slot="label">${i18next.t("lampType.fields.lumen")} <span style="color: red;">*</span></span>
                        </vaadin-text-field>

                        <vaadin-text-field
                            .value="${this.newLampType.lifeHours}"
                            @value-changed="${(e: any) => this.newLampType.lifeHours = e.detail.value}"
                            @keydown="${this.handleNumericInput}"
                            error-message="${this.formErrors.lifeHours}"
                            ?invalid="${!!this.formErrors.lifeHours}"
                            required
                        ><span slot="label">${i18next.t("lampType.fields.life")} <span style="color: red;">*</span></span>
                        </vaadin-text-field>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}
