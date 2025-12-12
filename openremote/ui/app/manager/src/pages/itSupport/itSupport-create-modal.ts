import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "@openremote/or-icon"
import manager from "@openremote/core"

interface CreateTicketData {
    name: string
    entityType: string
    description: string
    note: string
    attachments: any[]
}

interface FormErrors {
    name?: string
    description?: string
    entityType?: string
}

const ENTITY_TYPES = [
    { label: "Đèn", value: "LightAsset" },
    { label: "Tủ điện", value: "ElectricalCabinetAsset" },
    { label: "Đường", value: "RoadAsset" },
    { label: "Nhóm đèn", value: "LightGroupAsset" },
    { label: "Nhóm cố định", value: "FixedGroupAsset" },
]

@customElement("it-support-create-modal")
export class ItSupportCreateModal extends LitElement {
    @property({ type: Boolean }) open = false
    @property({ type: Function }) onClose?: () => void
    @property({ type: Function }) onCreate?: (ticket: CreateTicketData) => void

    @state() private formData: CreateTicketData = {
        name: "",
        entityType: "LightAsset",
        description: "",
        note: "",
        attachments: [],
    }

    @state() private errors: FormErrors = {}
    @state() private loading = false
    @state() private selectedFiles: File[] = []
    @state() private uploadProgress = 0
    @state() private notification = {
        show: false,
        message: "",
        isError: false,
    }

    static styles = css`
        :host {
            font-family: Roboto, sans-serif;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease-out;
            padding: 20px;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: modalIn 0.3s ease-out;
            display: flex;
            flex-direction: column;
        }

        @keyframes modalIn {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        .modal-header {
            background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
            color: white;
            padding: 24px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .title-icon {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px;
            border-radius: 8px;
            font-size: 16px;
        }

        .close-button {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .modal-content {
            padding: 32px;
            overflow-y: auto;
            flex: 1;
        }

        .form-section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E5E7EB;
        }

        .form-field {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .required-asterisk {
            color: #EF4444;
            font-weight: 700;
        }

        .form-input, .form-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            background: white;
            box-sizing: border-box;
        }

        .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: #4D9D2A;
            box-shadow: 0 0 0 3px rgba(77, 157, 42, 0.1);
        }

        .form-textarea {
            min-height: 120px;
            resize: vertical;
            font-family: inherit;
        }

        .form-input.error, .form-textarea.error {
            border-color: #EF4444;
            background: #FEF2F2;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .error-text {
            color: #EF4444;
            font-size: 12px;
            font-weight: 500;
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .entity-types {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 8px;
        }

        .entity-type-button {
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            transition: all 0.2s;
            color: #374151;
        }

        .entity-type-button:hover {
            border-color: #4D9D2A;
            background: #F0FDF4;
        }

        .entity-type-button.active {
            border-color: #4D9D2A;
            background: #4D9D2A;
            color: white;
            font-weight: 600;
        }

        .file-upload-section {
            border: 2px dashed #D1D5DB;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s;
            cursor: pointer;
            background: #F9FAFB;
        }

        .file-upload-section:hover {
            border-color: #4D9D2A;
            background: #F0FDF4;
        }

        .file-upload-section.dragover {
            border-color: #4D9D2A;
            background: #F0FDF4;
            transform: scale(1.02);
        }

        .upload-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.6;
        }

        .upload-text {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        .upload-hint {
            font-size: 14px;
            color: #6B7280;
        }

        .file-input {
            display: none;
        }

        .selected-files {
            margin-top: 16px;
        }

        .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 8px;
            margin-bottom: 8px;
        }

        .file-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }

        .file-icon {
            font-size: 20px;
        }

        .file-details {
            flex: 1;
        }

        .file-name {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 2px;
        }

        .file-size {
            font-size: 12px;
            color: #6B7280;
        }

        .remove-file-button {
            background: #FEE2E2;
            border: none;
            color: #DC2626;
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        .remove-file-button:hover {
            background: #FECACA;
        }

        .upload-progress {
            margin-top: 12px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #E5E7EB;
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4D9D2A, #3D7D1A);
            transition: width 0.3s ease;
        }

        .progress-text {
            font-size: 12px;
            color: #6B7280;
            margin-top: 4px;
            text-align: center;
        }

        .modal-footer {
            padding: 24px 32px;
            border-top: 1px solid #E5E7EB;
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            background: #F9FAFB;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-cancel {
            background: #F3F4F6;
            color: #374151;
            border: 1px solid #D1D5DB;
        }

        .btn-cancel:hover:not(:disabled) {
            background: #E5E7EB;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(77, 157, 42, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(77, 157, 42, 0.4);
        }

        .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease-out forwards;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .notification.success {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        }

        .notification.error {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
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
            .modal {
                margin: 10px;
                max-width: calc(100vw - 20px);
            }
            
            .modal-header {
                padding: 20px;
            }
            
            .modal-content {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                flex-direction: column-reverse;
            }
            
            .btn {
                justify-content: center;
            }
            
            .entity-types {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `

    private validateForm(): boolean {
        const errors: FormErrors = {}

        if (!this.formData.name.trim()) {
            errors.name = "Vui lòng nhập tên yêu cầu"
        }

        if (!this.formData.description.trim()) {
            errors.description = "Vui lòng nhập mô tả chi tiết"
        }

        if (!this.formData.entityType) {
            errors.entityType = "Vui lòng chọn loại tài sản"
        }

        this.errors = errors
        return Object.keys(errors).length === 0
    }

    private clearError(field: keyof FormErrors) {
        if (this.errors[field]) {
            this.errors = { ...this.errors }
            delete this.errors[field]
        }
    }

    private handleInput(field: keyof CreateTicketData, value: string) {
        this.formData = { ...this.formData, [field]: value }
        this.clearError(field as keyof FormErrors)
    }

    private handleEntityTypeSelect(entityType: string) {
        this.formData = { ...this.formData, entityType }
        this.clearError("entityType")
    }

    private handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            const newFiles = Array.from(input.files)
            this.selectedFiles = [...this.selectedFiles, ...newFiles]
        }
        // Reset input value to allow selecting the same file again
        input.value = ""
    }

    private handleFileDrop(event: DragEvent) {
        event.preventDefault()
        event.stopPropagation()

        const uploadSection = event.currentTarget as HTMLElement
        uploadSection.classList.remove("dragover")

        if (event.dataTransfer?.files) {
            const newFiles = Array.from(event.dataTransfer.files)
            this.selectedFiles = [...this.selectedFiles, ...newFiles]
        }
    }

    private handleDragOver(event: DragEvent) {
        event.preventDefault()
        event.stopPropagation()
        const uploadSection = event.currentTarget as HTMLElement
        uploadSection.classList.add("dragover")
    }

    private handleDragLeave(event: DragEvent) {
        event.preventDefault()
        event.stopPropagation()
        const uploadSection = event.currentTarget as HTMLElement
        uploadSection.classList.remove("dragover")
    }

    private removeFile(index: number) {
        this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index)
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    private async uploadFiles(): Promise<any[]> {
        const attachments: any[] = []

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i]
            this.uploadProgress = ((i + 1) / this.selectedFiles.length) * 100

            try {
                // Convert file to base64
                const base64 = await this.fileToBase64(file)
                const fileData = {
                    name: file.name,
                    contents: base64,
                    binary: true,
                }

                // Upload file qua API ConfigurationResource
                const uploadResult = await manager.rest.api.ConfigurationResource.fileUploadExtend(
                    fileData,
                    { path: `/${file.name}` },
                    { timeout: 30000 }
                )
                attachments.push({
                    fileName: file.name,
                    filePath: uploadResult.data?.filePath || uploadResult.data || uploadResult,
                    fileSize: file.size,
                    mimeType: file.type,
                })
            } catch (error) {
                console.error("Error uploading file:", file.name, error)
                // Nếu lỗi upload file thì bỏ qua file này, không throw
                continue
            }
        }

        return attachments
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const result = reader.result as string
                // Remove data:image/jpeg;base64, prefix
                const base64 = result.split(",")[1]
                resolve(base64)
            }
            reader.onerror = (error) => reject(error)
        })
    }

    private async simulateUpload(fileData: any): Promise<any> {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
            filePath: `/uploads/${fileData.name}`,
            success: true,
        }
    }

    private async handleSubmit() {
        if (!this.validateForm()) {
            this.showNotification("Vui lòng điền đầy đủ thông tin bắt buộc", true)
            return
        }

        this.loading = true
        this.uploadProgress = 0

        try {
            // Upload files nếu có
            let attachments: any[] = []
            if (this.selectedFiles.length > 0) {
                attachments = await this.uploadFiles()
            }

            const ticketData: CreateTicketData = {
                ...this.formData,
                attachments,
            }

            // Gọi API tạo ticket qua ItSupportResource
            const result = await manager.rest.api.ItSupportResource.create(ticketData, { timeout: 30000 })
            // Emit event để trang home cập nhật ngay
            this.dispatchEvent(new CustomEvent("created", { detail: result.data, bubbles: true, composed: true }))

            this.showNotification("Tạo yêu cầu hỗ trợ thành công!", false)
            this.resetForm()

            setTimeout(() => {
                this.handleClose()
            }, 1500)
        } catch (error) {
            console.error("Error creating ticket:", error)
            this.showNotification("Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại.", true)
        }

        this.loading = false
        this.uploadProgress = 0
    }

    private resetForm() {
        this.formData = {
            name: "",
            entityType: "LightAsset",
            description: "",
            note: "",
            attachments: [],
        }
        this.errors = {}
        this.selectedFiles = []
        this.uploadProgress = 0
    }

    private handleClose() {
        this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }))
        if (this.onClose) {
            this.onClose()
        }
        this.resetForm()
    }

    // Đảm bảo hàm showNotification tồn tại
    private showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError }
        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 4000)
    }

    private handleOverlayClick(event: Event) {
        if (event.target === event.currentTarget) {
            this.handleClose()
        }
    }

    render() {
        if (!this.open) return html``

        const isFormValid = this.formData.name.trim() && this.formData.description.trim()

        return html`
            <div class="modal-overlay" @click="${this.handleOverlayClick}">
                <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            Tạo yêu cầu hỗ trợ mới
                        </h2>
                        <button class="close-button" @click="${this.handleClose}">
                            <or-icon icon="close"></or-icon>
                        </button>
                    </div>

                    <div class="modal-content">
                        <!-- Basic Information Section -->
                        <div class="form-section">
                            <div class="section-title">
                                <or-icon icon="info"></or-icon>
                                Thông tin cơ bản
                            </div>

                            <div class="form-field">
                                <label class="form-label">
                                    Tên yêu cầu
                                    <span class="required-asterisk">*</span>
                                </label>
                                <input
                                    class="form-input ${this.errors.name ? "error" : ""}"
                                    type="text"
                                    placeholder="Nhập tên yêu cầu hỗ trợ"
                                    .value="${this.formData.name}"
                                    @input="${(e: Event) => this.handleInput("name", (e.target as HTMLInputElement).value)}"
                                >
                                ${
            this.errors.name
                ? html`
                                    <div class="error-text">
                                        <or-icon icon="alert-circle"></or-icon>
                                        ${this.errors.name}
                                    </div>
                                `
                : ""
        }
                            </div>

                            <div class="form-field">
                                <label class="form-label">
                                    Loại tài sản
                                    <span class="required-asterisk">*</span>
                                </label>
                                <div class="entity-types">
                                    ${ENTITY_TYPES.map(
            (type) => html`
                                        <button
                                            class="entity-type-button ${this.formData.entityType === type.value ? "active" : ""}"
                                            @click="${() => this.handleEntityTypeSelect(type.value)}"
                                            type="button"
                                        >
                                            ${type.label}
                                        </button>
                                    `,
        )}
                                </div>
                                ${
            this.errors.entityType
                ? html`
                                    <div class="error-text">
                                        <or-icon icon="alert-circle"></or-icon>
                                        ${this.errors.entityType}
                                    </div>
                                `
                : ""
        }
                            </div>

                            <div class="form-field">
                                <label class="form-label">Ghi chú</label>
                                <input
                                    class="form-input"
                                    type="text"
                                    placeholder="Nhập ghi chú (không bắt buộc)"
                                    .value="${this.formData.note}"
                                    @input="${(e: Event) => this.handleInput("note", (e.target as HTMLInputElement).value)}"
                                >
                            </div>

                            <div class="form-field">
                                <label class="form-label">
                                    Mô tả chi tiết
                                    <span class="required-asterisk">*</span>
                                </label>
                                <textarea
                                    class="form-textarea ${this.errors.description ? "error" : ""}"
                                    placeholder="Mô tả chi tiết về vấn đề cần hỗ trợ"
                                    .value="${this.formData.description}"
                                    @input="${(e: Event) => this.handleInput("description", (e.target as HTMLTextAreaElement).value)}"
                                ></textarea>
                                ${
            this.errors.description
                ? html`
                                    <div class="error-text">
                                        <or-icon icon="alert-circle"></or-icon>
                                        ${this.errors.description}
                                    </div>
                                `
                : ""
        }
                            </div>
                        </div>

                        <!-- File Upload Section -->
                        <div class="form-section">
                            <div class="section-title">
                                <or-icon icon="paperclip"></or-icon>
                                Đính kèm file
                            </div>

                            <div 
                                class="file-upload-section"
                                @click="${() => this.shadowRoot?.querySelector<HTMLInputElement>(".file-input")?.click()}"
                                @drop="${this.handleFileDrop}"
                                @dragover="${this.handleDragOver}"
                                @dragleave="${this.handleDragLeave}"
                            >
                                <div class="upload-icon">📎</div>
                                <div class="upload-text">Chọn file hoặc kéo thả vào đây</div>
                                <div class="upload-hint">Hỗ trợ: JPG, PNG, PDF, DOC (Tối đa 10MB)</div>
                                <input
                                    type="file"
                                    class="file-input"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    @change="${this.handleFileSelect}"
                                >
                            </div>

                            ${
            this.selectedFiles.length > 0
                ? html`
                                <div class="selected-files">
                                    ${this.selectedFiles.map(
                    (file, index) => html`
                                        <div class="file-item">
                                            <div class="file-info">
                                                <div class="file-icon">📄</div>
                                                <div class="file-details">
                                                    <div class="file-name">${file.name}</div>
                                                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                                                </div>
                                            </div>
                                            <button
                                                class="remove-file-button"
                                                @click="${() => this.removeFile(index)}"
                                                type="button"
                                            >
                                                <or-icon icon="close"></or-icon>
                                            </button>
                                        </div>
                                    `,
                )}
                                </div>
                            `
                : ""
        }

                            ${
            this.loading && this.uploadProgress > 0
                ? html`
                                <div class="upload-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${this.uploadProgress}%"></div>
                                    </div>
                                    <div class="progress-text">Đang upload... ${Math.round(this.uploadProgress)}%</div>
                                </div>
                            `
                : ""
        }
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-cancel" @click="${this.handleClose}" ?disabled="${this.loading}">
                            <or-icon icon="x"></or-icon>
                            Hủy bỏ
                        </button>
                        <button 
                            class="btn btn-primary" 
                            @click="${this.handleSubmit}"
                            ?disabled="${!isFormValid || this.loading}"
                        >
                            ${
            this.loading
                ? html`
                                <div class="loading-spinner"></div>
                                Đang tạo...
                            `
                : html`
                                <or-icon icon="plus"></or-icon>
                                Tạo yêu cầu
                            `
        }
                        </button>
                    </div>
                </div>
            </div>

            ${
            this.notification.show
                ? html`
                <div class="notification ${this.notification.isError ? "error" : "success"}">
                    <or-icon icon="${this.notification.isError ? "alert-circle" : "check-circle"}"></or-icon>
                    ${this.notification.message}
                </div>
            `
                : ""
        }
        `
    }
}
