import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/select";
import "@vaadin/combo-box";
import "@vaadin/icon";

interface LampType {
    id: string;
    lampTypeCode: string;
    lampTypeName: string;
    powerConsumption: string;
    luminousFlux: string;
    lifeHours: string;
    status: string;
    createdBy: string;
    createdDate: string;
}

@customElement("lamptype-edit")
export class LampTypeEdit extends LitElement {
    @property({ type: Object })
    lampType: LampType = {
        id: "",
        lampTypeCode: "",
        lampTypeName: "",
        powerConsumption: "",
        luminousFlux: "",
        lifeHours: "",
        status: "",
        createdBy: "",
        createdDate: ""
    };

    @state() private isSaving = false;
    @state() private errorMessage = "";
    @state() private notification = { show: false, message: "", isError: false };
    @state() private formErrors = {
        lampTypeCode: '',
        lampTypeName: '',
        powerConsumption: '',
        luminousFlux: '',
        lifeHours: '',
        duplicate: ''
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
        }
        :host {
            --lumo-required-field-indicator: '';
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
        // Parse URL parameters
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        this.lampType = {
            id: params.get("id") || "",
            lampTypeCode: params.get("lampTypeCode") || "",
            lampTypeName: params.get("lampTypeName") || "",
            powerConsumption: params.get("powerConsumption") || "",
            luminousFlux: params.get("luminousFlux") || "",
            lifeHours: params.get("lifeHours") || "",
            status: params.get("active") || "1",
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

    private async checkDuplicateLampTypeCode(code: string): Promise<boolean> {
        if (!code.trim() || code.trim() === this.lampType.lampTypeCode) return false;

        try {
            const filterDTO = {
                page: 1,
                size: 1,
                data: { lampTypeCode: code.trim() }
            };
            const response = await manager.rest.api.LampTypeResource.getAll(filterDTO);

            // Check for duplicates excluding the current lamp type
            return response?.data?.some(lampType =>
                lampType.deleted === 0 &&
                lampType.lampTypeCode.toLowerCase() === code.trim().toLowerCase() &&
                lampType.id.toString() !== this.lampType.id
            );
        } catch (error) {
            console.error("Error checking duplicate lamp type code:", error);
            return false;
        }
    }

    private validateNumericField(value: string, fieldName: string): { isValid: boolean, error: string } {
        if (!value.trim()) {
            return { isValid: false, error: `${fieldName} không được để trống` };
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return { isValid: false, error: `${fieldName} phải là số` };
        }

        if (numValue <= 0) {
            return { isValid: false, error: `${fieldName} phải lớn hơn 0` };
        }

        return { isValid: true, error: '' };
    }

    private async validateForm(): Promise<boolean> {
        let isValid = true;
        const errors = {
            lampTypeCode: '',
            lampTypeName: '',
            powerConsumption: '',
            luminousFlux: '',
            lifeHours: '',
            duplicate: ''
        };

        // Validate lamp type code
        const codeInput = this.shadowRoot?.getElementById('lampTypeCode') as HTMLInputElement;
        if (!codeInput?.value.trim()) {
            errors.lampTypeCode = 'Mã loại đèn không được để trống';
            isValid = false;
        } else {
            const isDuplicate = await this.checkDuplicateLampTypeCode(codeInput.value);
            if (isDuplicate) {
                this.showNotification("Mã loại đèn đã tồn tại", true);
                isValid = false;
            }

        }

        // Validate lamp type name
        const nameInput = this.shadowRoot?.getElementById('lampTypeName') as HTMLInputElement;
        if (!nameInput?.value.trim()) {
            errors.lampTypeName = 'Tên loại đèn không được để trống';
            isValid = false;
        }

        // Validate power consumption
        const powerInput = this.shadowRoot?.getElementById('powerConsumption') as HTMLInputElement;
        const powerValidation = this.validateNumericField(powerInput?.value || '', 'Công suất');
        if (!powerValidation.isValid) {
            errors.powerConsumption = powerValidation.error;
            isValid = false;
        }

        // Validate luminous flux
        const fluxInput = this.shadowRoot?.getElementById('luminousFlux') as HTMLInputElement;
        const fluxValidation = this.validateNumericField(fluxInput?.value || '', 'Quang thông');
        if (!fluxValidation.isValid) {
            errors.luminousFlux = fluxValidation.error;
            isValid = false;
        }

        // Validate life hours
        const lifeInput = this.shadowRoot?.getElementById('lifeHours') as HTMLInputElement;
        const lifeValidation = this.validateNumericField(lifeInput?.value || '', 'Tuổi thọ');
        if (!lifeValidation.isValid) {
            errors.lifeHours = lifeValidation.error;
            isValid = false;
        }

        this.formErrors = errors;
        return isValid;
    }


    // Prevent non-numeric input for numeric fields
    private handleNumericInput(e: KeyboardEvent) {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }

        // Ensure it's a number and stop the keypress if not
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    async saveChanges() {
        const isValid = await this.validateForm();
        if (!isValid) {
            return; // Ngừng nếu form không hợp lệ
        }

        const codeInput = this.shadowRoot?.getElementById('lampTypeCode') as HTMLInputElement;
        const nameInput = this.shadowRoot?.getElementById('lampTypeName') as HTMLInputElement;
        const powerInput = this.shadowRoot?.getElementById('powerConsumption') as HTMLInputElement;
        const fluxInput = this.shadowRoot?.getElementById('luminousFlux') as HTMLInputElement;
        const lifeInput = this.shadowRoot?.getElementById('lifeHours') as HTMLInputElement;
        const statusSelect = this.shadowRoot?.getElementById('status') as any;

        this.isSaving = true;
        this.errorMessage = "";
        const userResponse = await manager.rest.api.UserResource.getCurrent();
        const currentUser = userResponse?.data?.username || "Không xác định";
        this.updateLampType(
            codeInput?.value.trim() || "",
            nameInput.value.trim(),
            powerInput.value || "0",
            fluxInput.value || "0",
            lifeInput.value || "0",
            currentUser,
            statusSelect.value
        );
    }


    async updateLampType(
        code: string,
        name: string,
        powerConsumption: string,
        luminousFlux: string,
        lifeHours: string,
        currentUser: string,
        status: string
    ) {
        const isActive = status === "1";
        const updatedLampType: any = {
            id: parseInt(this.lampType.id),
            lampTypeCode: code,
            lampTypeName: name,
            powerConsumption: parseFloat(powerConsumption),
            luminousFlux: parseFloat(luminousFlux),
            lifeHours: parseFloat(lifeHours),
            updateBy: currentUser,
            active: isActive ? 1 : 0,
            deleted: isActive ? 0 : 1
        };

        manager.rest.api.LampTypeResource.updateLampType(updatedLampType)
            .then(response => {
                this.showNotification("Cập nhật loại đèn thành công");
                setTimeout(() => {
                    window.location.hash = "/master-data/masterDataPage6";
                }, 1500);
            })
            .catch(error => {
                console.error("Error updating lamp type:", error);
                this.showNotification("Lỗi khi cập nhật loại đèn", true);
                this.errorMessage = "Lỗi khi cập nhật loại đèn: " + (error.message || "Vui lòng thử lại");
                this.isSaving = false;
            });
    }

    _cancel() {
        window.location.hash = "/master-data/masterDataPage6";
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
                        <h2 class="card-title">Chỉnh sửa loại đèn</h2>
                        <div class="button-container">
                            <vaadin-button
                                    class="primary"
                                    @click="${this.saveChanges}">
                                Lưu
                            </vaadin-button>
                        </div>

                    </div>

                    <div class="card-content">
                        ${this.errorMessage ? html`
                            <div class="error-message">${this.errorMessage}</div>
                        ` : ''}

                        <div class="form-grid">
                            <vaadin-text-field
                                .value="${this.lampType.lampTypeCode}"
                                id="lampTypeCode"
                                theme="medium"
                                @value-changed="${() => {
            this.formErrors = { ...this.formErrors, lampTypeCode: '', duplicate: '' };
        }}"
                                error-message="${this.formErrors.lampTypeCode }"
                                ?invalid="${!!this.formErrors.lampTypeCode }"
                                required
                            ><span slot="label">
        Mã loại đèn <span style="color: red;">*</span>
    </span></vaadin-text-field>

                            <vaadin-text-field
                                .value="${this.lampType.lampTypeName}"
                                id="lampTypeName"
                                theme="medium"
                                @value-changed="${() => {
            this.formErrors.lampTypeName = '';
        }}"
                                error-message="${this.formErrors.lampTypeName}"
                                ?invalid="${!!this.formErrors.lampTypeName}"
                                required
                            ><span slot="label">
        Tên loại đèn <span style="color: red;">*</span>
    </span></vaadin-text-field>

                            <vaadin-text-field
                                .value="${this.lampType.powerConsumption}"
                                id="powerConsumption"
                                theme="medium"
                                @value-changed="${() => {
            this.formErrors.powerConsumption = '';
        }}"
                                @keydown="${(e: KeyboardEvent) => this.handleNumericInput(e)}"
                                error-message="${this.formErrors.powerConsumption}"
                                ?invalid="${!!this.formErrors.powerConsumption}"
                                required
                            ><span slot="label">
        Công suất (W)<span style="color: red;">*</span>
    </span></vaadin-text-field>

                            <vaadin-text-field
                                .value="${this.lampType.luminousFlux}"
                                id="luminousFlux"
                                theme="medium"
                                @value-changed="${() => {
            this.formErrors.luminousFlux = '';
        }}"
                                @keydown="${(e: KeyboardEvent) => this.handleNumericInput(e)}"
                                error-message="${this.formErrors.luminousFlux}"
                                ?invalid="${!!this.formErrors.luminousFlux}"
                                required
                            ><span slot="label">
       Quang thông (lm) <span style="color: red;">*</span>
    </span></vaadin-text-field>

                            <vaadin-text-field
                                .value="${this.lampType.lifeHours}"
                                id="lifeHours"
                                theme="medium"
                                placeholder="Nhập tuổi thọ"
                                @value-changed="${() => {
            this.formErrors.lifeHours = '';
        }}"
                                @keydown="${(e: KeyboardEvent) => this.handleNumericInput(e)}"
                                error-message="${this.formErrors.lifeHours}"
                                ?invalid="${!!this.formErrors.lifeHours}"
                                required
                            ><span slot="label">
       Tuổi thọ (giờ) <span style="color: red;">*</span>
    </span></vaadin-text-field>

                            <vaadin-select
                                label="Trạng thái"
                                id="status"
                                theme="medium"
                                .value="${this.lampType.status}"
                                .items="${[
                                    {label: 'Hoạt động', value: '1'},
                                    {label: 'Không hoạt động', value: '0'}
                                ]}"
                            ></vaadin-select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
