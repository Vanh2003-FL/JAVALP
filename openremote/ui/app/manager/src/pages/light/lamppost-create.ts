import { css, html, LitElement } from "lit"
import { customElement, state } from "lit/decorators.js"
import "@vaadin/text-field"
import "@vaadin/combo-box"
import "@vaadin/button"
import "@vaadin/horizontal-layout"
import "@openremote/or-translate"
import "@openremote/or-icon"
import "@openremote/or-map"
import { i18next } from "@openremote/or-translate"
import manager from "@openremote/core"

@customElement("lamppost-create")
export class LamppostCreate extends LitElement {
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

            .required-asterisk {
                color: red;
                margin-left: 4px;
                font-weight: bold;
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

            .map-controls {
                display: flex;
                align-items: center;
            }

            .selection-mode-active {
                background-color: #ff9800 !important;
                color: white !important;
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
                color: #000000 !important;
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

    @state()
    protected lamppostData = {
        name: "",
        assetCode: "",
        lightTypeId: "",
        powerConsumption: "",
        luminousFlux: "",
        lifeHours: "",
        firmwareVersion: "",
        location: null,
        assetModel: "",
    }

    @state()
    protected mapCenter = [106.660172, 10.762622]

    @state()
    protected mapZoom = 12

    @state()
    protected lampTypes: any[] = []

    @state()
    protected selectedLampType: any = null

    @state()
    protected selectionModeActive = false

    @state()
    protected formErrors = {
        name: "",
        assetCode: "",
        lightTypeId: "",
        firmwareVersion: "",
        assetModel: "",
    }

    @state()
    protected notification = { show: false, message: '', isError: false };

    async connectedCallback() {
        super.connectedCallback()
        await this.loadLampTypes()
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
            }
        } catch (error) {
            console.error("Error loading lamp types:", error)
        }
    }

    async handleLampTypeChange(e: CustomEvent) {
        const selectedId = e.detail.value
        if (selectedId) {
            const selectedType = this.lampTypes.find((type) => type.value === selectedId)
            if (selectedType) {
                this.selectedLampType = selectedType
                this.lamppostData = {
                    ...this.lamppostData,
                    lightTypeId: selectedId,
                    powerConsumption: selectedType.powerConsumption?.toString() || "",
                    luminousFlux: selectedType.luminousFlux?.toString() || "",
                    lifeHours: selectedType.lifeHours?.toString() || "",
                }
            }
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
            name: !this.lamppostData.name ? "Tên đèn không được để trống" : "",
            assetCode: this.validateAssetCode(this.lamppostData.assetCode),
            lightTypeId: !this.lamppostData.lightTypeId ? "Vui lòng chọn loại đèn" : "",
            firmwareVersion: this.validateFirmwareVersion(this.lamppostData.firmwareVersion),
            assetModel: !this.lamppostData.assetModel ? "Model thiết bị không được để trống" : "",
        };

        this.formErrors = errors;
        return !Object.values(errors).some(error => error !== "");
    }

    async handleSave() {
        if (!this.validateForm()) {
            return;
        }

        try {
            const selectedType = this.lampTypes.find((type) => type.value === this.lamppostData.lightTypeId)

            const lightData = {
                name: this.lamppostData.name,
                assetCode: this.lamppostData.assetCode,
                lampType: selectedType ? selectedType.label.split(" (")[0] : "",
                powerConsumption: `${this.lamppostData.powerConsumption}W`,
                luminousFlux: `${this.lamppostData.luminousFlux}lm`,
                lifeHours: Number.parseInt(this.lamppostData.lifeHours),
                firmwareVersion: this.lamppostData.firmwareVersion,
                assetModel: this.lamppostData.assetModel,
                description: "Đèn lắp mới",
                latitude: this.lamppostData.location?.lat || 0,
                longitude: this.lamppostData.location?.lng || 0,
                createdBy: "admin",
            }

            console.log("Creating light:", lightData)

            await manager.rest.api.AssetInfoResource.createLight(lightData, {
                realm: sessionStorage.getItem("realm") || undefined,
            })

            this.showNotification("Tạo mới đèn thành công!", false);

            // Dispatch a custom event to notify the list page
            const event = new CustomEvent('light-created', {
                bubbles: true,
                composed: true,
                detail: { success: true }
            });
            this.dispatchEvent(event);

            setTimeout(() => {
                window.location.hash = "/light"
            }, 2000)
        } catch (error) {
            console.error("Error creating light:", error);

            let errorMessageText = "Có lỗi xảy ra khi tạo mới đèn!";
            let errorString = "";

            if (error && error.response && error.response.data) {
                if (typeof error.response.data === "string") {
                    errorString = error.response.data;
                } else if (typeof error.response.data.message === "string") {
                    errorString = error.response.data.message;
                }
            } else if (error && typeof error.message === "string") {
                errorString = error.message;
            }

            if (errorString.includes("ALREADY_EXISTS")) {
                errorMessageText = "Mã đèn này đã tồn tại, vui lòng chọn mã khác!";
            } else if (errorString.includes("500")) {
                errorMessageText = "Có lỗi hệ thống, vui lòng thử lại sau!";
            } else if (errorString) {
                errorMessageText = errorString;
            }

            this.showNotification(errorMessageText, true);
        }
    }

    handleCancel() {
        // Navigate back to list view
        window.location.hash = "/light"
    }

    updateField(field: string, e: CustomEvent) {
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

                this.lamppostData = {
                    ...this.lamppostData,
                    assetCode: cleanedValue,
                };
                return;
            }
        }

        // Validate firmware version length
        if (field === "firmwareVersion" && value.length > 10) {
            return;
        }

        this.lamppostData = {
            ...this.lamppostData,
            [field]: value,
        };

        // Clear error when user types
        if (field in this.formErrors) {
            this.formErrors = {
                ...this.formErrors,
                [field]: "",
            };
        }
    }

    handleLocationUpdate(e: CustomEvent) {
        console.log("[LOG 6] Marker moved event:", e.detail); // LOG 6
        // Check if the event has the right structure
        if (e.detail && (e.detail.lat !== undefined || e.detail.lngLat)) {
            // Some implementations use e.detail directly, others use e.detail.lngLat
            const lat = e.detail.lat !== undefined ? e.detail.lat : e.detail.lngLat.lat
            const lng = e.detail.lng !== undefined ? e.detail.lng : e.detail.lngLat.lng

            this.lamppostData = {
                ...this.lamppostData,
                location: { lat, lng },
            }

            console.log("Marker moved to:", lat, lng)
        }
    }

    toggleSelectionMode() {
        this.selectionModeActive = !this.selectionModeActive
    }

    handleMapClick(e: CustomEvent) {
        // Only process clicks when in selection mode
        if (this.selectionModeActive) {
            // The event detail contains lngLat property
            const { lngLat } = e.detail

            // Update lamppost data with new coordinates
            this.lamppostData = {
                ...this.lamppostData,
                location: {
                    lat: lngLat.lat,
                    lng: lngLat.lng,
                },
            }

            // Exit selection mode after placing marker
            this.selectionModeActive = false

            // Log to verify it's working
            console.log("Map clicked at:", lngLat)
            this.showLocationConfirmation()
        }
    }

    showLocationConfirmation() {
        // Create a temporary div with a message
        const confirmDiv = document.createElement("div")
        confirmDiv.textContent = "Vị trí đã được chọn!"
        confirmDiv.style.cssText =
            "position: absolute; background: #4d9d2a; color: white; padding: 10px; border-radius: 4px; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;"

        this.shadowRoot?.querySelector(".map-container")?.appendChild(confirmDiv)

        // Remove after a delay
        setTimeout(() => {
            confirmDiv.remove()
        }, 2000)
    }

    handleLocationInput(e: CustomEvent) {
        const locationText = e.detail.value;
        console.log("[LOG 1] Input value:", locationText); // LOG 1

        if (locationText && locationText.trim() !== "") {
            const coords = locationText.split(',').map(coord => parseFloat(coord.trim()));
            console.log("[LOG 2] Parsed coords:", coords); // LOG 2

            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const [lat, lng] = coords;
                console.log("[LOG 3] Valid coords, lat:", lat, "lng:", lng); // LOG 3

                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    this.lamppostData = {
                        ...this.lamppostData,
                        location: { lat, lng }
                    };
                    this.mapCenter = [lng, lat];
                    this.mapZoom = 15;
                    console.log("[LOG 4] lamppostData after update:", this.lamppostData); // LOG 4
                    this.showLocationConfirmation();
                } else {
                    this.showError("Tọa độ không hợp lệ! Vĩ độ phải từ -90 đến 90, Kinh độ phải từ -180 đến 180");
                }
            } else {
                this.showError("Định dạng tọa độ không đúng! Vui lòng nhập theo định dạng: vĩ độ, kinh độ");
            }
        }
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

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    render() {
        console.log("[LOG 5] Render: lamppostData.location =", this.lamppostData.location); // LOG 5
        console.log("[MARKER] Render marker at:", this.lamppostData.location?.lat, this.lamppostData.location?.lng); // marker log
        return html`
            <div class="container">
                <div class="title">
                    <span class="back-button" @click="${this.handleCancel}">
                        <or-icon icon="arrow-left"></or-icon>
                    </span>
                    <or-translate value="Tạo mới đèn"></or-translate>
                </div>

                <div class="section-title">
                    <or-translate value="Thông tin cơ bản"></or-translate>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <label>
                            <or-translate value="Mã đèn"></or-translate>
                            <span class="required-asterisk">*</span>
                        </label>
                        <vaadin-text-field
                            .value="${this.lamppostData.assetCode}"
                            @value-changed="${(e: CustomEvent) => this.updateField("assetCode", e)}"
                            @keydown="${(e: KeyboardEvent) => {
            // Chỉ cho phép chữ cái và số
            const isAlphanumeric = /^[a-zA-Z0-9]$/.test(e.key);
            const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
            if (!isAlphanumeric && !isAllowedKey) {
                e.preventDefault();
            }
        }}"
                            class="${this.formErrors.assetCode ? 'invalid-field' : ''}"
                            pattern="[a-zA-Z0-9]*"
                            required
                        ></vaadin-text-field>
                        ${this.formErrors.assetCode ? html`<div class="error-text">${this.formErrors.assetCode}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Tên đèn (nema)"></or-translate>
                            <span class="required-asterisk">*</span>
                        </label>
                        <vaadin-text-field
                            .value="${this.lamppostData.name}"
                            @value-changed="${(e: CustomEvent) => this.updateField("name", e)}"
                            class="${this.formErrors.name ? 'invalid-field' : ''}"
                            required
                        ></vaadin-text-field>
                        ${this.formErrors.name ? html`<div class="error-text">${this.formErrors.name}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Firmware Version"></or-translate>
                            <span class="required-asterisk">*</span>
                        </label>
                        <vaadin-text-field
                            .value="${this.lamppostData.firmwareVersion}"
                            @value-changed="${(e: CustomEvent) => this.updateField("firmwareVersion", e)}"
                            class="${this.formErrors.firmwareVersion ? 'invalid-field' : ''}"
                            required
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
                            .value="${this.lamppostData.assetModel}"
                            @value-changed="${(e: CustomEvent) => this.updateField('assetModel', e)}"
                            required
                        ></vaadin-text-field>
                    </div>

                    <div class="form-field">
                        <label>
                            <or-translate value="Loại đèn"></or-translate>
                            <span class="required-asterisk">*</span>
                        </label>
                        <vaadin-combo-box
                            .items="${this.lampTypes}"
                            .value="${this.lamppostData.lightTypeId}"
                            @value-changed="${this.handleLampTypeChange}"
                            item-label-path="label"
                            item-value-path="value"
                            class="${this.formErrors.lightTypeId ? 'invalid-field' : ''}"
                            required
                        ></vaadin-combo-box>
                        ${this.formErrors.lightTypeId ? html`<div class="error-text">${this.formErrors.lightTypeId}</div>` : ''}
                    </div>

                    <div class="form-field">
                        <label><or-translate value="Công suất (W)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lamppostData.powerConsumption}"
                                disabled
                        ></vaadin-text-field>
                    </div>


                    <div class="form-field">
                        <label><or-translate value="Tuổi thọ (giờ)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lamppostData.lifeHours}"
                                disabled
                        ></vaadin-text-field>
                    </div>
                    
                    <div class="form-field">
                        <label><or-translate value="Quang thông (lm)"></or-translate></label>
                        <vaadin-text-field
                                .value="${this.lamppostData.luminousFlux}"
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
                            view-settings='{ "center": ${JSON.stringify(this.mapCenter)}, "zoom": ${this.mapZoom} }'
                            show-controls
                            style="width: 100%; height: 100%;"
                            @or-map-clicked="${(e: CustomEvent) => this.handleMapClick(e)}"
                        >
                            ${this.lamppostData.location
                                ? html`<or-map-marker
                                    id="marker"
                                    .lat="${Number(this.lamppostData.location.lat)}"
                                    .lng="${Number(this.lamppostData.location.lng)}"
                                    draggable
                                    @or-marker-moved="${(e: CustomEvent) => this.handleLocationUpdate(e)}"
                                ></or-map-marker>`
                                : null}
                        </or-map>
                    </div>

                    <div class="location-input">
                        <div class="location-controls">
                            <div class="coordinates-display">
                                <div class="coordinates-label">
                                    <or-translate value="Tọa độ đã chọn"></or-translate>
                                </div>
                                <div class="coordinates-value">
                                    ${this.lamppostData.location
                                        ? `Lat: ${this.lamppostData.location.lat.toFixed(6)}, Lng: ${this.lamppostData.location.lng.toFixed(6)}`
                                        : "Chưa chọn vị trí"
                                    }
                                </div>
                            </div>

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
                                    ${this.selectionModeActive
            ? html`<or-translate value="Nhấn vào bản đồ để đặt vị trí"></or-translate>`
            : html`<or-translate value="Chọn vị trí"></or-translate>`
        }
                                </vaadin-button>
                            </div>

                            <div class="map-help-text">
                                ${this.selectionModeActive
            ? html`<or-translate value="Nhấn vào bản đồ để đặt điểm"></or-translate>`
            : html`<or-translate value="Kéo điểm đánh dấu để điều chỉnh vị trí hoặc nhập tọa độ"></or-translate>`
        }
                            </div>
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

                    <vaadin-button
                        theme="primary"
                        class="save-button"
                        @click="${this.handleSave}"
                    >
                        <or-translate value="Lưu"></or-translate>
                    </vaadin-button>
                </div>
            </div>
            ${this.notification.show
                ? html`<div class="notification ${this.notification.isError ? "error" : "success"}">${this.notification.message}</div>`
                : ""}
        `;
    }
}
