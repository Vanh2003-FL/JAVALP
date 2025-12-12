import { LitElement, html, css } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import "@vaadin/button"
import "@vaadin/text-field"
import "@vaadin/grid"
import "@vaadin/dialog"
import "@vaadin/icon"
import "@vaadin/combo-box"
import manager from "@openremote/core"

// These interfaces should match your backend model
interface Province {
    id?: number
    name?: string
    active?: number
    deleted?: number
    createDate?: number
    updateDate?: number
    createBy?: any
    updateBy?: any
}

interface District {
    id?: number
    name?: string
    active?: any
    deleted?: any
    createBy?: any
    updateBy?: any
    createDate?: number
    updateDate?: number
    provinceId?: number
}

interface SearchFilterDTO<T> {
    filters: any[]
    order: Record<string, any>
    pagination: { offset: number; limit: number }
}

@customElement("district-create")
export class DistrictCreate extends LitElement {
    @property({ type: Object }) manager: any

    @state() private provinces: Province[] = []
    @state() private selectedProvince: Province | null = null
    @state() private newDistrictName = ""
    @state() private isSubmitting = false
    @state() private notification = { show: false, message: "", isError: false }

    @state() private provinceError = ""
    @state() private districtNameError = ""
    @state() private isProvinceInvalid = false
    @state() private isDistrictNameInvalid = false

    static styles = css`
        :host {
            display: block;
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
            color: #4D9D2A;
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
            gap: 24px;
        }

        vaadin-combo-box, vaadin-text-field {
            width: 100%;
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
            background-color: #4caf50;
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
        .error-text {
            color: #f44336;
            font-size: 14px;
            margin-top: 4px;
            min-height: 20px;
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
        vaadin-combo-box::part(label),
        vaadin-text-field::part(label) {
            display: none !important;
        }
    `

    connectedCallback() {
        super.connectedCallback()
        this.loadProvinces()
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError }

        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 3000)
    }

    async loadProvinces() {
        try {
            // Create a search filter to get all provinces
            const filterDTO = {
                page: 1,
                size: 1000, // Large enough to get all provinces
                sort: ["id,asc"],
                data: {},
            }

            const response = await manager.rest.api.ProvinceResource.getAll(filterDTO)

            if (response?.data) {
                this.provinces = response.data
                console.log("Provinces loaded:", this.provinces)
            }
        } catch (error) {
            console.error("Error loading provinces:", error)
            this.showNotification("Không thể tải danh sách tỉnh thành", true)
        }
    }

    validateProvince() {
        if (!this.selectedProvince) {
            this.provinceError = "Tên tỉnh/thành phố không được để trống"
            this.isProvinceInvalid = true
            return false
        }
        this.provinceError = ""
        this.isProvinceInvalid = false
        return true
    }

    validateDistrictName() {
        if (!this.newDistrictName.trim()) {
            this.districtNameError = "Tên quận/huyện không được để trống"
            this.isDistrictNameInvalid = true
            return false
        }
        this.districtNameError = ""
        this.isDistrictNameInvalid = false
        return true
    }

    handleProvinceChange(e: CustomEvent) {
        const provinceName = e.detail.value
        this.selectedProvince = this.provinces.find((p) => p.name === provinceName) || null

        // Clear error when user selects a province
        if (this.selectedProvince) {
            this.provinceError = ""
            this.isProvinceInvalid = false
        }
    }

    handleDistrictNameInput(e: any) {
        this.newDistrictName = e.target.value

        // Clear error if user starts typing
        if (this.newDistrictName.trim()) {
            this.districtNameError = ""
            this.isDistrictNameInvalid = false
        }
    }

    async createDistrict() {
        const isProvinceValid = this.validateProvince()
        const isDistrictNameValid = this.validateDistrictName()
        if (!isProvinceValid || !isDistrictNameValid) {
            // Don't proceed if validation fails
            return
        }

        this.isSubmitting = true

        try {
            // Get current user
            const userResponse = await manager.rest.api.UserResource.getCurrent()
            const currentUser = userResponse.data.username

            // Create new district object
            const newDistrict: District = {
                name: this.newDistrictName.trim(),
                provinceId: this.selectedProvince.id,
                createBy: currentUser,
            }

            console.log("Sending district data:", newDistrict)

            // Make the API call
            const response = await manager.rest.api.DistrictResource.createDistrict(newDistrict)

            // Check if the response has an error structure
            // Use type assertion or check properties safely
            if (response && response.data && "errorCode" in response.data) {
                // This is an error response
                throw { response: { data: response.data } }
            }

            // If we get here, it's a successful response
            this.showNotification("Thêm quận/huyện mới thành công")
            // Reset form
            this.newDistrictName = ""
            this.selectedProvince = null
            // Navigate back to master data page
            setTimeout(() => {
                this.navigateToMasterData()
            }, 2000)
        } catch (error) {
            console.error("Error creating district:", error)

            let errorMessage = "Không thể tạo huyện mới"

            if (error && error.response) {
                console.log("Full error response:", error.response)

                if (error.response.data && error.response.data.errorMessage) {
                    errorMessage = error.response.data.errorMessage
                }
            }

            this.showNotification(errorMessage, true)
        } finally {
            this.isSubmitting = false
        }
    }

    navigateToMasterData() {
        window.location.hash = "/master-data/masterDataPage2"
    }

    render() {
        return html`
            <div class="container">
                ${
                        this.notification.show
                                ? html`
                                    <div class="notification ${this.notification.isError ? "error" : "success"}">
                                        ${this.notification.message}
                                    </div>
                                `
                                : ""
                }

                <div class="back-link" @click="${this.navigateToMasterData}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Thêm quận/huyện mới</h2>
                        <vaadin-button
                                class="primary"
                                @click="${this.createDistrict}"
                                ?disabled="${this.isSubmitting}">
                            Lưu
                        </vaadin-button>
                    </div>

                    <div class="card-content">
                        <div class="form-grid">
                            <div class="field-container">
                                <div class="field-label">
                                    Tên tỉnh/thành phố
                                    <span class="required-asterisk">*</span>
                                </div>
                                <vaadin-combo-box
                                        .items="${this.provinces.map((p) => p.name)}"
                                        @value-changed="${this.handleProvinceChange}"
                                        theme="medium"
                                        placeholder="Chọn tỉnh"
                                        required
                                        ?invalid="${this.isProvinceInvalid}"
                                        error-message="${this.provinceError}"
                                ></vaadin-combo-box>
                            </div>

                            <div class="field-container">
                                <div class="field-label">
                                    Tên quận/huyện
                                    <span class="required-asterisk">*</span>
                                </div>
                                <vaadin-text-field
                                        .value="${this.newDistrictName}"
                                        @input="${this.handleDistrictNameInput}"
                                        theme="medium"
                                        required
                                        ?disabled="${!this.selectedProvince}"
                                        ?invalid="${this.isDistrictNameInvalid}"
                                        error-message="${this.districtNameError}"
                                ></vaadin-text-field>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
}
