import { css, html, LitElement } from "lit"
import { customElement, property, state, query } from "lit/decorators.js"
import "@vaadin/text-field"
import "@vaadin/combo-box"
import "@vaadin/button"
import "@vaadin/horizontal-layout"
import "@openremote/or-translate"
import "@openremote/or-icon"
import "@openremote/or-map"
import { i18next } from "@openremote/or-translate"
import manager from "@openremote/core"
import type { ImportAssetDTO } from "@openremote/model"

@customElement("light-edit")
export class LightEdit extends LitElement {
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: block;
                font-family: Roboto;
                padding: 20px;
                background-color: white;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                box-shadow: rgba(99, 99, 99, 0.1) 0px 2px 8px 0px;
                padding: 24px;
            }

            .title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333;
                display: flex;
                align-items: center;
            }

            .back-button {
                margin-right: 12px;
                cursor: pointer;
                color: #4d9d2a;
            }

            .section-title {
                font-size: 16px;
                font-weight: bold;
                margin: 20px 0 15px 0;
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 8px;
            }

            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }

            .form-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-field label {
                font-size: 14px;
                color: #333;
                font-weight: 500;
            }

            .required-asterisk {
                color: red;
                margin-left: 4px;
                font-weight: bold;
            }

            .map-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                align-items: start;
                margin-bottom: 20px;
            }

            .map-container {
                height: 268px;
                background-color: #f1f1f1;
                border: 1px solid #ddd;
                border-radius: 4px;
                grid-column: 1;
                position: relative;
            }

            .location-input {
                grid-column: 2;
                height: 268px;
                display: flex;
                flex-direction: column;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 16px;
            }

            .location-controls {
                display: flex;
                flex-direction: column;
                gap: 20px;
                height: 100%;
            }

            .coordinates-display {
                background-color: white;
                border-radius: 4px;
                padding: 12px;
                border: 1px solid #ddd;
            }

            .coordinates-label {
                font-size: 14px;
                color: #333;
                font-weight: 500;
                margin-bottom: 8px;
            }

            .coordinates-value {
                font-family: monospace;
                color: #666;
                font-size: 14px;
            }

            .map-container.selection-active {
                cursor: crosshair;
            }

            .map-help-text {
                font-size: 12px;
                color: #666;
                font-style: italic;
                margin-top: auto;
                padding-top: 8px;
            }

            .divider {
                height: 1px;
                background-color: #e0e0e0;
                margin: 20px 0;
            }

            .actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 40px;
            }

            .save-button,
            .cancel-button {
                min-width: 100px;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                text-align: center;
            }

            .save-button {
                background-color: #4d9d2a;
                color: white;
                border: none;
            }

            .cancel-button {
                background-color: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
            }

            .selection-mode-button {
                width: 100%;
            }

            .form-field vaadin-text-field {
                width: 100%;
            }

            /* Add styles for read-only fields */
            .form-field vaadin-text-field[disabled] {
                --vaadin-text-field-default-width: 100%;
                --vaadin-input-field-border-color: #e0e0e0;
                --vaadin-input-field-background-color: #f5f5f5;
                font-weight: 600;
                color: #333333 !important;
            }

            .form-field vaadin-text-field[disabled]::part(input-field) {
                color: #333333;
                font-weight: 600;
                background-color: #f5f5f5;
            }

            .error-text {
                color: #dc3545;
                font-size: 12px;
                margin-top: 4px;
                min-height: 18px;
                line-height: 1.4;
                white-space: normal;
                word-break: break-word;
                padding-left: 2px;
            }

            .invalid-field {
                --vaadin-text-field-default-width: 100%;
                --vaadin-input-field-border-color: #dc3545;
            }

            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 8px 12px;
                border-radius: 4px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                max-width: 250px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideIn 0.3s ease-out forwards;
                word-break: break-word;
            }
            .notification.success {
                background-color: #4caf50;
            }
            .notification.error {
                background-color: #f44336;
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
        `
    }

    @property({ type: String })
    assetId = ""

    @property({ type: Boolean })
    isEditMode = false

    @state()
    protected lightData: {
        id: string
        assetName: string
        assetCode: string
        lampTypeName: string
        lampTypeId: string
        luminousFlux: number
        powerConsumption: number
        lightingTime: number
        longitude: number
        latitude: number
        firmwareVersion: string
        assetModel: string
    } = {
        id: "",
        assetName: "",
        assetCode: "",
        lampTypeName: "",
        lampTypeId: "",
        luminousFlux: 0,
        powerConsumption: 0,
        lightingTime: 0,
        longitude: 0,
        latitude: 0,
        firmwareVersion: "",
        assetModel: "",
    }

    @state()
    protected lampTypes: any[] = []

    @state()
    protected selectionModeActive = false

    @state()
    protected loading = false

    @state()
    protected error: string | null = null

    @state()
    protected formErrors = {
        assetName: "",
        assetCode: "",
        lampTypeId: "",
        firmwareVersion: "",
    }

    @state() protected notification = { show: false, message: '', isError: false };

    @query('#assetCodeInput')
    protected assetCodeInput!: HTMLElement;

    async connectedCallback() {
        super.connectedCallback()
        // Extract assetId and mode from URL
        const hash = window.location.hash
        const params = new URLSearchParams(hash.split("?")[1])
        this.assetId = params.get("id") || ""
        this.isEditMode = params.get("mode") === "edit"

        try {
            // First load lamp types
            await this.loadLampTypes()

            // Then fetch light data if we have an ID
            if (this.assetId) {
                await this.fetchLightData()
            }
        } catch (error) {
            console.error("Error in initialization:", error)
            this.error = "Failed to initialize page"
        }
    }

    async loadLampTypes() {
        try {
            const filterDTO = {
                keyWord: "",
                data: {},
            }
            const response = await manager.rest.api.LampTypeResource.getAll(filterDTO)
            if (response && response.data) {
                // Filter only active and non-deleted lamp types
                this.lampTypes = response.data
                    .filter(type => type.active === 1 && type.deleted === 0)
                    .map((type) => ({
                        label: `${type.lampTypeName}`,
                        value: type.id,
                        powerConsumption: type.powerConsumption,
                        luminousFlux: type.luminousFlux,
                        lifeHours: type.lifeHours,
                    }))
                console.log("Loaded lamp types:", this.lampTypes)
            }
        } catch (error) {
            console.error("Error loading lamp types:", error)
            throw error // Re-throw to handle in connectedCallback
        }
    }

    async handleLampTypeChange(e: CustomEvent) {
        const selectedId = e.detail.value
        if (selectedId) {
            const selectedType = this.lampTypes.find((type) => type.value === selectedId)
            if (selectedType) {
                this.lightData = {
                    ...this.lightData,
                    lampTypeId: selectedId,
                    lampTypeName: selectedType.label.split(" (")[0],
                    powerConsumption: selectedType.powerConsumption,
                    luminousFlux: selectedType.luminousFlux,
                    lightingTime: selectedType.lifeHours,
                }
            }
        }
    }

    async fetchLightData() {
        try {
            this.loading = true
            const response = await manager.rest.api.AssetInfoResource.getLightById(this.assetId)
            if (response && response.data) {
                // Find the matching lamp type from the list
                const matchingLampType = this.lampTypes.find(
                    type => type.label.split(" (")[0] === response.data.lampTypeName
                );

                this.lightData = {
                    id: response.data.id || "",
                    assetName: response.data.assetName || "",
                    assetCode: response.data.assetCode || "",
                    lampTypeName: response.data.lampTypeName || "",
                    lampTypeId: matchingLampType ? matchingLampType.value : "",
                    luminousFlux: Number(response.data.luminousFlux) || 0,
                    powerConsumption: Number(response.data.powerConsumption) || 0,
                    lightingTime: Number(response.data.lightingTime) || 0,
                    longitude: Number(response.data.longitude) || 0,
                    latitude: Number(response.data.latitude) || 0,
                    firmwareVersion: response.data.firmwareVersion || "",
                    assetModel: response.data.assetModel || "",
                }
                console.log("Fetched light data:", this.lightData)
            }
        } catch (error) {
            console.error("Error fetching light data:", error)
            this.error = "Failed to load light data"
        } finally {
            this.loading = false
        }
    }

    validateAssetCode(value: string) {
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!value) {
            return "Mã đèn không được để trống";
        }
        if (!alphanumericRegex.test(value)) {
            return "Mã đèn chỉ được chứa chữ cái và số";
        }
        return "";
    }

    validateFirmwareVersion(value: string) {
        if (!value) {
            return "Firmware Version không được để trống";
        }
        if (value.length > 10) {
            return "Firmware Version không được quá 10 ký tự";
        }
        return "";
    }

    validateForm() {
        const errors = {
            assetName: !this.lightData.assetName ? "Tên đèn không được để trống" : "",
            assetCode: this.validateAssetCode(this.lightData.assetCode),
            lampTypeId: !this.lightData.lampTypeId ? "Vui lòng chọn loại đèn" : "",
            firmwareVersion: this.validateFirmwareVersion(this.lightData.firmwareVersion),
        };

        this.formErrors = errors;
        return !Object.values(errors).some(error => error !== "");
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    async handleSave() {
        if (!this.isEditMode) return

        if (!this.validateForm()) {
            return;
        }

        try {
            this.loading = true
            const updateData: ImportAssetDTO = {
                name: this.lightData.assetName,
                assetCode: this.lightData.assetCode,
                lampType: this.lightData.lampTypeName,
                powerConsumption: Number(this.lightData.powerConsumption),
                luminousFlux: Number(this.lightData.luminousFlux),
                lifeHours: Number(this.lightData.lightingTime),
                longitude: Number(this.lightData.longitude),
                latitude: Number(this.lightData.latitude),
                firmwareVersion: this.lightData.firmwareVersion,
                assetModel: this.lightData.assetModel,
                createdBy: "admin",
            }

            console.log("Sending update data:", updateData)

            const response = await manager.rest.api.AssetInfoResource.editLight(this.assetId, updateData, {
                realm: manager.displayRealm,
            })

            console.log("Update response:", response)

            if (response && response.status === 200) {
                this.showNotification("Cập nhật thông tin đèn thành công!", false);
                // Dispatch event to notify list page
                const event = new CustomEvent('light-updated', {
                    bubbles: true,
                    composed: true,
                    detail: { success: true }
                });
                this.dispatchEvent(event);
                setTimeout(() => {
                    window.location.hash = "/light"
                }, 2000)
            } else {
                throw new Error("Update failed: " + (response?.data?.message || "Unknown error"))
            }
        } catch (error) {
            console.error("Error updating light:", error);

            // Lấy message từ nhiều nguồn khác nhau
            let errorDetail = "";
            if (error.response?.data?.message) {
                errorDetail = error.response.data.message;
            } else if (typeof error.response?.data === "string") {
                errorDetail = error.response.data;
            } else if (error.message) {
                errorDetail = error.message;
            } else {
                errorDetail = "Unknown error";
            }

            // Kiểm tra lỗi trùng mã đèn
            if (errorDetail.includes("ALREADY_EXISTS") || errorDetail.includes("đã tồn tại")) {
                this.showNotification("Mã đèn đã tồn tại!", true);
                this.formErrors = { ...this.formErrors, assetCode: "Mã đèn đã tồn tại, vui lòng chọn mã khác!" };
                this.error = null;
                // Focus vào ô mã đèn
                setTimeout(() => {
                    this.assetCodeInput?.focus();
                }, 0);
            } else if (error.response && error.response.status === 500) {
                this.showNotification("Có lỗi hệ thống, vui lòng thử lại sau!", true);
                this.error = null;
            } else {
                this.error = `Failed to update light information: ${errorDetail}`;
                this.showNotification(`Có lỗi xảy ra khi cập nhật thông tin: ${errorDetail}`, true);
            }
        } finally {
            this.loading = false
        }
    }

    handleCancel() {
        window.location.hash = "/light"
    }

    updateField(field: string, e: CustomEvent) {
        if (!this.isEditMode) return;

        const value = e.detail.value;

        // Validate asset code input
        if (field === "assetCode") {
            const alphanumericRegex = /^[a-zA-Z0-9]*$/;
            if (!alphanumericRegex.test(value)) {
                // Chỉ lấy các ký tự hợp lệ
                const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');

                // Cập nhật giá trị đã được làm sạch
                const textField = e.target as any;
                textField.value = cleanedValue;

                this.lightData = {
                    ...this.lightData,
                    assetCode: cleanedValue,
                };
                return;
            }
        }

        // Validate firmware version length
        if (field === "firmwareVersion" && value.length > 10) {
            return;
        }

        this.lightData = {
            ...this.lightData,
            [field]: value,
        }

        // Clear error when user types
        if (field in this.formErrors) {
            this.formErrors = {
                ...this.formErrors,
                [field]: "",
            };
        }
    }

    toggleSelectionMode() {
        if (!this.isEditMode) return
        this.selectionModeActive = !this.selectionModeActive
    }

    showError(message: string) {
        const errorDiv = document.createElement("div");
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: absolute;
            background: #dc3545;
            color: white;
            padding: 10px;
            border-radius: 4px;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            white-space: nowrap;
        `;
        this.shadowRoot?.querySelector(".map-container")?.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showLocationConfirmation() {
        const confirmDiv = document.createElement("div")
        confirmDiv.textContent = "Vị trí đã được chọn!"
        confirmDiv.style.cssText =
            "position: absolute; background: #4d9d2a; color: white; padding: 10px; border-radius: 4px; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;"
        this.shadowRoot?.querySelector(".map-container")?.appendChild(confirmDiv)
        setTimeout(() => {
            confirmDiv.remove()
        }, 2000)
    }

    handleLocationInput(e: CustomEvent) {
        if (!this.isEditMode) return;
        const locationText = e.detail.value;
        if (locationText && locationText.trim() !== "") {
            const coords = locationText.split(',').map(coord => parseFloat(coord.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const [lat, lng] = coords;
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    this.lightData = {
                        ...this.lightData,
                        latitude: lat,
                        longitude: lng,
                    };
                    this.showLocationConfirmation();
                } else {
                    this.showError("Tọa độ không hợp lệ! Vĩ độ phải từ -90 đến 90, Kinh độ phải từ -180 đến 180");
                }
            } else {
                this.showError("Định dạng tọa độ không đúng! Vui lòng nhập theo định dạng: vĩ độ, kinh độ");
            }
        }
    }

    handleMapClick(e: CustomEvent) {
        if (!this.isEditMode || !this.selectionModeActive) return;
        const { lngLat } = e.detail;
        if (lngLat && typeof lngLat.lat === "number" && typeof lngLat.lng === "number") {
            if (lngLat.lat >= -90 && lngLat.lat <= 90 && lngLat.lng >= -180 && lngLat.lng <= 180) {
                this.lightData = {
                    ...this.lightData,
                    latitude: lngLat.lat,
                    longitude: lngLat.lng,
                };
                this.selectionModeActive = false;
                this.showLocationConfirmation();
            } else {
                this.showError("Tọa độ không hợp lệ! Vĩ độ phải từ -90 đến 90, Kinh độ phải từ -180 đến 180");
            }
        }
    }

    handleLocationUpdate(e: CustomEvent) {
        if (!this.isEditMode) return;
        if (e.detail && (e.detail.lat !== undefined || e.detail.lngLat)) {
            const lat = e.detail.lat !== undefined ? e.detail.lat : e.detail.lngLat.lat;
            const lng = e.detail.lng !== undefined ? e.detail.lng : e.detail.lngLat.lng;
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.lightData = {
                    ...this.lightData,
                    latitude: lat,
                    longitude: lng,
                };
                this.showLocationConfirmation();
            } else {
                this.showError("Tọa độ không hợp lệ! Vĩ độ phải từ -90 đến 90, Kinh độ phải từ -180 đến 180");
            }
        }
    }

    render() {
        const lat = typeof this.lightData.latitude === "number" ? this.lightData.latitude.toFixed(6) : "0.000000"
        const lng = typeof this.lightData.longitude === "number" ? this.lightData.longitude.toFixed(6) : "0.000000"

        return html`
            <div class="container">
                <div class="title">
                    <span class="back-button" @click="${this.handleCancel}">
                        <or-icon icon="arrow-left"></or-icon>
                    </span>
                    <or-translate value="${this.isEditMode ? "Chỉnh sửa thông tin đèn" : "Xem thông tin đèn"}"></or-translate>
                </div>

                <div class="section-title">
                    <or-translate value="Thông tin cơ bản"></or-translate>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <label>
                            <or-translate value="Mã đèn"></or-translate>
                            ${this.isEditMode ? html`<span class="required-asterisk">*</span>` : ""}
                        </label>
                        <vaadin-text-field
                                id="assetCodeInput"
                                .value="${this.lightData.assetCode}"
                                ?disabled="${!this.isEditMode}"
                                @value-changed="${(e: CustomEvent) => this.updateField("assetCode", e)}"
                                @keydown="${(e: KeyboardEvent) => {
                                    if (!this.isEditMode) return;
                                    // Chỉ cho phép chữ cái và số
                                    const isAlphanumeric = /^[a-zA-Z0-9]$/.test(e.key);
                                    const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
                                    if (!isAlphanumeric && !isAllowedKey) {
                                        e.preventDefault();
                                    }
                                }}"
                                class="${this.formErrors.assetCode ? 'invalid-field' : ''}"
                                pattern="[a-zA-Z0-9]*"
                                ?required="${this.isEditMode}"
                        ></vaadin-text-field>
                        ${this.formErrors.assetCode ? html`<div class="error-text">${this.formErrors.assetCode}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Tên đèn (nema)"></or-translate>
                            ${this.isEditMode ? html`<span class="required-asterisk">*</span>` : ""}
                        </label>
                        <vaadin-text-field
                                .value="${this.lightData.assetName}"
                                ?disabled="${!this.isEditMode}"
                                @value-changed="${(e: CustomEvent) => this.updateField("assetName", e)}"
                                class="${this.formErrors.assetName ? 'invalid-field' : ''}"
                                ?required="${this.isEditMode}"
                        ></vaadin-text-field>
                        ${this.formErrors.assetName ? html`<div class="error-text">${this.formErrors.assetName}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Firmware Version"></or-translate>
                            ${this.isEditMode ? html`<span class="required-asterisk">*</span>` : ""}
                        </label>
                        <vaadin-text-field
                                .value="${this.lightData.firmwareVersion}"
                                ?disabled="${!this.isEditMode}"
                                @value-changed="${(e: CustomEvent) => this.updateField("firmwareVersion", e)}"
                                class="${this.formErrors.firmwareVersion ? 'invalid-field' : ''}"
                                ?required="${this.isEditMode}"
                                maxlength="10"
                        ></vaadin-text-field>
                        ${this.formErrors.firmwareVersion ? html`<div class="error-text">${this.formErrors.firmwareVersion}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Model thiết bị"></or-translate>
                            <span class="required-asterisk">*</span>
                        </label>
                        <vaadin-text-field
                            .value="${this.lightData.assetModel}"
                            @value-changed="${(e: CustomEvent) => this.updateField('assetModel', e)}"
                            required
                        ></vaadin-text-field>
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Loại đèn"></or-translate>
                            ${this.isEditMode ? html`<span class="required-asterisk">*</span>` : ""}
                        </label>
                        <vaadin-combo-box
                                .items="${this.lampTypes}"
                                .value="${this.lightData.lampTypeId}"
                                ?disabled="${!this.isEditMode}"
                                @value-changed="${this.handleLampTypeChange}"
                                item-label-path="label"
                                item-value-path="value"
                                class="${this.formErrors.lampTypeId ? 'invalid-field' : ''}"
                                ?required="${this.isEditMode}"
                        ></vaadin-combo-box>
                        ${this.formErrors.lampTypeId ? html`<div class="error-text">${this.formErrors.lampTypeId}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label><or-translate value="Công suất (W)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lightData.powerConsumption}"
                                disabled
                        ></vaadin-text-field>
                    </div>

                    <div class="form-field">
                        <label><or-translate value="Tuổi thọ (giờ)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lightData.lightingTime}"
                                disabled
                        ></vaadin-text-field>
                    </div>

                    <div class="form-field">
                        <label><or-translate value="Quang thông (lm)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lightData.luminousFlux}"
                                disabled
                        ></vaadin-text-field>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="section-title">
                    <or-translate value="Thông tin vị trí"></or-translate>
                </div>

                <div class="map-section">
                    <div class="map-container ${this.selectionModeActive ? "selection-active" : ""}">
                        <or-map
                                view-settings='{ "center": [106.660172, 10.762622], "zoom": 12 }'
                                show-controls
                                style="width: 100%; height: 100%;"
                                @or-map-clicked="${(e: CustomEvent) => this.handleMapClick(e)}"
                        >
                            <or-map-marker
                                    id="marker"
                                    lat="${this.lightData.latitude}"
                                    lng="${this.lightData.longitude}"
                                    ?draggable="${this.isEditMode}"
                                    @or-marker-moved="${(e: CustomEvent) => this.handleLocationUpdate(e)}"
                            ></or-map-marker>
                        </or-map>
                    </div>

                    <div class="location-input">
                        <div class="location-controls">
                            <div class="coordinates-display">
                                <div class="coordinates-label">
                                    <or-translate value="Tọa độ đã chọn"></or-translate>
                                </div>
                                <div class="coordinates-value">
                                    Lat: ${lat}, Lng: ${lng}
                                </div>
                            </div>

                            ${
                                    this.isEditMode
                                            ? html`
                                                <div class="form-field">
                                                    <label><or-translate value="Nhập tọa độ (x,y)"></or-translate></label>
                                                    <vaadin-text-field
                                                            placeholder="${i18next.t("Nhập tọa độ")}"
                                                            @value-changed="${(e: CustomEvent) => this.handleLocationInput(e)}"
                                                    ></vaadin-text-field>
                                                </div>

                                                <div class="map-controls">
                                                    <vaadin-button
                                                            class="selection-mode-button ${this.selectionModeActive ? "selection-mode-active" : ""}"
                                                            @click="${this.toggleSelectionMode}"
                                                    >
                                                        ${
                                                                this.selectionModeActive
                                                                        ? html`<or-translate value="Nhấn vào bản đồ để đặt vị trí"></or-translate>`
                                                                        : html`<or-translate value="Chọn vị trí"></or-translate>`
                                                        }
                                                    </vaadin-button>
                                                </div>

                                                <div class="map-help-text">
                                                    ${
                                                            this.selectionModeActive
                                                                    ? html`<or-translate value="Nhấn vào bản đồ để đặt điểm"></or-translate>`
                                                                    : html`<or-translate value="Kéo điểm đánh dấu để điều chỉnh vị trí hoặc nhập tọa độ"></or-translate>`
                                                    }
                                                </div>
                                            `
                                            : ""
                            }
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <vaadin-button
                            class="cancel-button"
                            @click="${this.handleCancel}"
                    >
                        <or-translate value="Hủy"></or-translate>
                    </vaadin-button>

                    ${
                            this.isEditMode
                                    ? html`
                                        <vaadin-button
                                                theme="primary"
                                                class="save-button"
                                                @click="${this.handleSave}"
                                        >
                                            <or-translate value="Lưu"></or-translate>
                                        </vaadin-button>
                                    `
                                    : ""
                    }
                </div>
            </div>
            ${this.notification.show
                ? html`<div class="notification ${this.notification.isError ? "error" : "success"}">${this.notification.message}</div>`
                : ""}
        `
    }
}
