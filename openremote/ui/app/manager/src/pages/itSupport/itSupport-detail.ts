import { css, html } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "@vaadin/text-field"
import "@vaadin/text-area"
import "@vaadin/combo-box"
import "@vaadin/button"
import "@vaadin/dialog"
import "@openremote/or-translate"
import "@openremote/or-icon"
import manager from "@openremote/core"
import { type PageProvider, Page } from "@openremote/or-app"
import type { AppStateKeyed } from "@openremote/or-app"
import type { Store } from "@reduxjs/toolkit"
import type { UserQuery } from "@openremote/model"
import { UserQueryOrderBy$Property } from "@openremote/model"

const statusMap: { [key: string]: string } = {
    new: "Tạo mới",
    pending: "Đang chờ xử lý",
    inProcess: "Đang xử lý",
    close: "Hoàn thành",
    cancel: "Đã hủy",
    reopen: "Mở lại yêu cầu",
}

const entityTypeMap: { [key: string]: string } = {
    LightAsset: "Đèn",
    ElectricalCabinetAsset: "Tủ điện",
    RoadAsset: "Đường",
    LightGroupAsset: "Nhóm đèn",
    FixedGroupAsset: "Nhóm cố định",
}

export function pageItSupportDetailProvider(store: Store<AppStateKeyed>): PageProvider<AppStateKeyed> {
    return {
        name: "itSupportDetail",
        routes: ["it-support/:id"],
        pageCreator: () => {
            return new ItSupportDetail(store)
        },
    }
}

@customElement("it-support-detail")
export class ItSupportDetail extends Page<AppStateKeyed> {
    name = "itSupportDetail"

    stateChanged(state: AppStateKeyed) {}

    constructor(store: any) {
        super(store)
    }

    static get styles() {
        return css`
            :host {
                background-color: #F8FAFC;
                min-height: 100vh;
                display: block;
                font-family: Roboto;
                overflow-x: hidden;
            }
            .container {
                max-width: 800px;
                width: 100%;
                min-height: 160vh;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(99,99,99,0.1);
                padding: 24px 20px;
                box-sizing: border-box;
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
            .detail-section {
                background: #F9FAFB;
                border-radius: 8px;
                border: 1px solid #eee;
                padding: 20px;
                margin-bottom: 20px;
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
            .form-field.full-width {
                grid-column: 1 / -1;
                width: 100%;
                max-width: 100%;
            }
            .content-section {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            .form-field label {
                font-size: 13px;
                color: #374151;
                font-weight: 600;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .divider {
                height: 1px;
                background-color: #e0e0e0;
                margin: 24px 0;
                width: 100%;
            }
            .actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 32px;
                width: 100%;
            }
            .action-btn {
                min-width: 100px;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                text-align: center;
                border: none;
            }
            .edit-btn {
                background: #4d9d2a;
                color: white;
            }
            .cancel-btn {
                background: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
            }
            .attachments-section {
                margin-bottom: 0;
                width: 100%;
            }
            .attachment-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 10px;
                width: 100%;
            }
            .attachment-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
                width: 100%;
                box-sizing: border-box;
            }
            .attachment-item:hover {
                background: #e9ecef;
            }
            .attachment-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            .attachment-name {
                flex: 1;
                font-size: 14px;
                color: #333;
            }
            .attachment-size {
                font-size: 12px;
                color: #666;
                margin-left: 8px;
            }
            .empty-attachments {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
                width: 100%;
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

            /* Fixed Modal Styles */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .modal-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                min-width: 400px;
                max-width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }

            .modal-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }

            .modal-close {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 4px;
            }

            .modal-close:hover {
                color: #333;
            }

            .option-item {
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 6px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .option-item:hover {
                background-color: #f8f9fa;
                border-color: #e9ecef;
            }

            .option-item.selected {
                background-color: #e3f2fd;
                border-color: #2196f3;
            }

            .option-text {
                flex: 1;
                font-size: 14px;
                color: #333;
            }

            .user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #4d9d2a;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                flex-shrink: 0;
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-align: center;
                min-width: 80px;
                height: 24px;
                background: #F3F4F6;
                color: #374151;
                white-space: nowrap;
            }

            /* Status colors */
            .status-new { background: #dbeafe; color: #1e40af; }
            .status-pending { background: #fef3c7; color: #d97706; }
            .status-inProcess { background: #dcfce7; color: #16a34a; }
            .status-close { background: #f3f4f6; color: #374151; }
            .status-cancel { background: #fee2e2; color: #dc2626; }
            .status-reopen { background: #fdf4ff; color: #a21caf; }

            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: #666;
            }

            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #4d9d2a;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }

            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: #f44336;
            }

            .error-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
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

            @media (max-width: 900px) {
                .container {
                    max-width: 100%;
                    padding: 16px 4px;
                }
                .form-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                .modal-content {
                    min-width: 320px;
                    margin: 20px;
                }
            }
        `
    }

    @property({ type: String }) id = ""
    @property({ type: Boolean }) edit = false
    @state() loading = true
    @state() error = ""
    @state() detail: any = null
    @state() notes = ""
    @state() selectedStatus = ""
    @state() selectedType = ""
    @state() selectedHandler: any = null
    @state() updating = false
    @state() changedFields: any = {}
    @state() showStatusDialog = false
    @state() showHandlerDialog = false
    @state() showTypeDialog = false
    @state() userList: any[] = []
    @state() userLoading = false
    @state() attachments: any[] = []
    @state() attachmentsLoading = false
    @state() notification = { show: false, message: "", isError: false }
    @state() imagePreviewUrl: string = "";
    @state() showImageModal: boolean = false;
    @state() selectedImageFilePath: string = "";

    connectedCallback() {
        super.connectedCallback()
        this.extractIdFromUrl()
        this.fetchDetail()
    }

    extractIdFromUrl() {
        const hash = window.location.hash
        const queryString = hash.includes("?") ? hash.split("?")[1] : ""
        const urlParams = new URLSearchParams(queryString)
        const idFromQuery = urlParams.get("id")
        if (idFromQuery) {
            this.id = idFromQuery
        } else {
            const match = hash.match(/it-support\/([^/?]+)/)
            this.id = match && match[1] ? match[1] : ""
        }
        this.edit = hash.includes("edit")
    }

    async fetchDetail() {
        this.loading = true
        this.error = ""
        try {
            const res = await manager.rest.api.ItSupportResource.getAll(
                {},
                {
                    params: { realm: sessionStorage.getItem("realmSelected") || "default" },
                },
            )
            const arr = Array.isArray(res.data) ? res.data : []
            console.log("API getAll trả về:", res)
            const found = arr.find((item: any) => String(item.id) === String(this.id))
            if (!found) throw new Error("Không tìm thấy yêu cầu")
            this.detail = found
            this.notes = found.note || ""
            this.selectedStatus = found.status
            this.selectedType = found.entityType
            // Nếu handlerUser không có hoặc chỉ là id, nhưng có assignedUser, fetch thêm thông tin user
            console.log('handlerUser type:', typeof this.detail?.handlerUser, this.detail?.handlerUser);
            console.log('assignedUser value:', this.detail?.assignedUser);
            let assignedUserId = this.detail?.assignedUser;
            if (assignedUserId && typeof assignedUserId === 'object') {
                if (Array.isArray(assignedUserId)) {
                    assignedUserId = assignedUserId[0]?.id || '';
                } else {
                    assignedUserId = assignedUserId.id || '';
                }
            }
            if (
                (!this.detail?.handlerUser || typeof this.detail.handlerUser === 'string') &&
                assignedUserId
            ) {
                try {
                    // Gọi đúng tham số: object { id: assignedUserId }, options {}
                    const userResHandler = await manager.rest.api.UserResource.get({ id: assignedUserId }, {});
                    console.log('User info fetched:', userResHandler.data);
                    if (userResHandler && userResHandler.data) {
                        this.detail = { ...this.detail, handlerUser: userResHandler.data };
                        console.log('Detail after user fetch:', this.detail);
                    }
                } catch (e) {
                    // Không tìm thấy user, giữ nguyên id
                }
            }
            await this.loadAttachments()
        } catch (e: any) {
            this.error = e?.message || "Lỗi tải dữ liệu"
        }
        this.loading = false
    }

    async loadAttachments() {
        if (!this.detail?.id) {
            console.log("Không có detail.id, không gọi API attachmentInSupport")
            return
        }
        this.attachmentsLoading = true
        try {
            const response = await manager.rest.api.ItSupportResource.getAttachmentInSupport({ id: this.detail.id })
            let arr: any[] = []
            if (Array.isArray(response.data?.attachments)) {
                arr = response.data.attachments
            } else {
                arr = []
            }
            this.attachments = arr
        } catch (error) {
            this.attachments = []
        }
        this.attachmentsLoading = false
    }

    async getToken() {
        return sessionStorage.getItem("token") || ""
    }

    async openHandlerDialog() {
        console.log("LOG openHandlerDialog - userList:", this.userList)
        console.log("LOG openHandlerDialog - selectedHandler:", this.selectedHandler)

        if (this.userList.length === 0) {
            await this.loadUserList()
            console.log("LOG after loadUserList - userList:", this.userList)
        }

        this.showHandlerDialog = true
    }

    async loadUserList() {
        this.userLoading = true
        try {
            const realm = this.detail?.realm || (manager.displayRealm ? manager.displayRealm : "default")
            const query: UserQuery = {
                realmPredicate: { name: realm },
                select: { basic: true },
                limit: 20,
                offset: 0,
                orderBy: { property: UserQueryOrderBy$Property.USERNAME, descending: true },
            }
            const response = await manager.rest.api.UserResource.query(query)
            let arr: any[] = []
            if (Array.isArray(response.data)) {
                arr = response.data
            } else {
                arr = []
            }
            this.userList = arr
        } catch (error) {
            this.userList = []
        }
        this.userLoading = false
    }

    getHandlerName() {
        const user = this.detail?.handlerUser || this.selectedHandler;
        if (user) {
            if (user.firstName || user.lastName) {
                return `${user.firstName || ""} ${user.lastName || ""}`.trim();
            }
            if (user.email) {
                return user.email;
            }
            if (user.username) {
                return user.username;
            }
            return user.id || "";
        }
        if (this.detail?.assignUserName) return this.detail.assignUserName;
        if (this.detail?.assignedUser) return this.detail.assignedUser;
        return "Chưa phân công";
    }

    getAvailableStatus() {
        const current = this.detail?.status
        if (current === "close" || current === "cancel") {
            return ["pending", "inProcess", "close", "cancel", "reopen"]
        }
        if (current === "reopen") {
            return ["pending", "inProcess", "close", "cancel"]
        }
        return ["pending", "inProcess", "close", "cancel"]
    }

    handleSelectStatus(status: string) {
        this.selectedStatus = status
        this.changedFields = { ...this.changedFields, status }
        this.detail = { ...this.detail, status }
        this.showStatusDialog = false
    }

    handleSelectHandler(user: any) {
        this.selectedHandler = user
        this.changedFields = { ...this.changedFields, assignedUser: user.id }
        this.detail = { ...this.detail, assignedUser: user.id, handlerUser: user }
        this.showHandlerDialog = false
    }

    handleSelectType(type: string) {
        this.selectedType = type
        this.changedFields = { ...this.changedFields, entityType: type }
        this.detail = { ...this.detail, entityType: type }
        this.showTypeDialog = false
    }

    handleNoteChange(e: CustomEvent) {
        this.notes = e.detail.value
        this.changedFields = { ...this.changedFields, note: e.detail.value }
    }

    async handleUpdate() {
        this.updating = true
        try {
            const payload = {
                id: this.detail.id,
                assignedUser: this.changedFields.assignedUser || this.detail.assignedUser,
                entityType: this.changedFields.entityType || this.detail.entityType,
                status: this.changedFields.status || this.detail.status,
                note: this.changedFields.note || this.detail.note,
            }
            const response = await manager.rest.api.ItSupportResource.update(payload)
            if (response && response.data) {
                this.detail = response.data
                this.changedFields = {}
                this.showNotification("Cập nhật thành công!", false)
                setTimeout(() => {
                    window.history.back()
                }, 1200)
            } else {
                throw new Error("Cập nhật thất bại")
            }
        } catch (error) {
            this.showNotification("Có lỗi xảy ra khi cập nhật", true)
        }
        this.updating = false
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError }
        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 3000)
    }

    formatDate(ts: number) {
        if (!ts) return ""
        const d = new Date(ts)
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${d.getFullYear()}`
    }

    async openAttachment(attachment: any) {
        console.log('Attachment:', attachment);
        if (!attachment?.filePath) {
            this.showNotification('Không có đường dẫn file!', true);
            return;
        }
        try {
            const response = await manager.rest.api.AssetInfoResource.getStream({ filename: attachment.filePath });
            console.log("response" , response)
            const url = response.request?.responseURL || '/api/master/assetInfo/getStream?filename=' + encodeURIComponent(attachment.filePath);
            console.log('Open file URL:', url);
            window.open(url, "_blank");
        } catch (e) {
            console.error('Lỗi khi gọi getStream:', e);
            this.showNotification('Có lỗi khi tải file!', true);
        }
    }

    isImageFile(fileName: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    }

    getImageUrl(filename: string) {
        // Sử dụng endpoint public, không truy cập thuộc tính protected
        return `/api/master/assetInfo/get/stream?filename=${encodeURIComponent(filename)}`;
    }

    async showImagePreview(file: any) {
        try {
            // Gọi đúng restclient, luôn đúng host/backend
            const response = await manager.rest.api.AssetInfoResource.getStream({ filename: file.filePath }, { responseType: 'blob' });
            const blob = response.data;
            if (this.imagePreviewUrl) URL.revokeObjectURL(this.imagePreviewUrl);
            this.imagePreviewUrl = URL.createObjectURL(blob);
            this.showImageModal = true;
        } catch (e) {
            this.showNotification('Không thể xem ảnh (lỗi tải blob)', true);
        }
    }

    closeImageModal() {
        if (this.imagePreviewUrl) URL.revokeObjectURL(this.imagePreviewUrl);
        this.showImageModal = false;
        this.imagePreviewUrl = "";
        this.selectedImageFilePath = "";
    }

    getStatusClass(status: string) {
        return `status-${status}`
    }

    private openStatusDialog() {
        console.log("LOG openStatusDialog - getAvailableStatus:", this.getAvailableStatus())
        this.showStatusDialog = true
    }

    private openTypeDialog() {
        console.log("LOG openTypeDialog - entityTypeMap:", entityTypeMap)
        console.log("LOG openTypeDialog - selectedType:", this.selectedType)
        this.showTypeDialog = true
    }

    private closeModal() {
        this.showStatusDialog = false
        this.showHandlerDialog = false
        this.showTypeDialog = false
    }

    private handleModalClick(e: Event) {
        // Close modal when clicking on overlay
        if (e.target === e.currentTarget) {
            this.closeModal()
        }
    }

    render() {
        if (this.loading) {
            return html`
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <div>Đang tải...</div>
                </div>
            `
        }

        if (this.error) {
            return html`
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <div>${this.error}</div>
                </div>
            `
        }

        if (!this.detail) return html``

        return html`
            <div class="container">
                <div class="title">
                    <span class="back-button" @click="${() => window.history.back()}">
                        <or-icon icon="arrow-left"></or-icon>
                    </span>
                    <or-translate value="${this.edit ? "Chỉnh sửa yêu cầu hỗ trợ" : "Chi tiết yêu cầu hỗ trợ"}"></or-translate>
                </div>

                <div class="section-title">
                    <or-translate value="Thông tin cơ bản"></or-translate>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <label><or-translate value="Mã yêu cầu"></or-translate></label>
                        <vaadin-text-field
                            .value="${this.detail.code || ""}"
                            disabled
                        ></vaadin-text-field>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Tên yêu cầu"></or-translate></label>
                        <vaadin-text-field
                            .value="${this.detail.name || ""}"
                            disabled
                        ></vaadin-text-field>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Trạng thái"></or-translate></label>
                        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            <div class="status-badge ${this.getStatusClass(this.detail.status)}">
                                ${statusMap[this.detail.status] || this.detail.status}
                            </div>
                            ${
            this.edit
                ? html`
                                <vaadin-button
                                    theme="tertiary small"
                                    @click="${this.openStatusDialog}"
                                    style="flex-shrink: 0;"
                                >
                                    Thay đổi
                                </vaadin-button>
                            `
                : ""
        }
                        </div>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Loại thiết bị"></or-translate></label>
                        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            <vaadin-text-field
                                .value="${entityTypeMap[this.detail.entityType] || this.detail.entityType || ""}"
                                disabled
                                style="flex: 1; min-width: 0;"
                            ></vaadin-text-field>
                            ${
            this.edit
                ? html`
                                <vaadin-button
                                    theme="tertiary small"
                                    @click="${this.openTypeDialog}"
                                    style="flex-shrink: 0;"
                                >
                                    Thay đổi
                                </vaadin-button>
                            `
                : ""
        }
                        </div>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Người tạo"></or-translate></label>
                        <vaadin-text-field
                            .value="${this.detail.createdByName || "N/A"}"
                            disabled
                        ></vaadin-text-field>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Ngày tạo"></or-translate></label>
                        <vaadin-text-field
                            .value="${this.formatDate(this.detail.createdAt)}"
                            disabled
                        ></vaadin-text-field>
                    </div>
                    <div class="form-field">
                        <label><or-translate value="Người xử lý"></or-translate></label>
                        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            <vaadin-text-field
                                .value="${this.getHandlerName()}"
                                disabled
                                style="flex: 1; min-width: 0;"
                            ></vaadin-text-field>
                            ${
            this.edit
                ? html`
                                <vaadin-button
                                    theme="tertiary small"
                                    @click="${this.openHandlerDialog}"
                                    style="flex-shrink: 0;"
                                >
                                    Chọn
                                </vaadin-button>
                            `
                : ""
        }
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="content-section">
                    <div class="section-title">
                        <or-translate value="Mô tả chi tiết"></or-translate>
                    </div>
                    <div class="form-field">
                        <vaadin-text-area
                            .value="${this.detail.description || "Không có mô tả"}"
                            disabled
                            style="min-height: 100px; width: 100%;"
                        ></vaadin-text-area>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="content-section">
                    <div class="section-title">
                        <or-translate value="Tệp đính kèm"></or-translate>
                    </div>
                    <div class="attachments-section">
                        ${
            this.attachmentsLoading
                ? html`<div class="loading-container"><div class="loading-spinner"></div></div>`
                : this.attachments.length === 0
                    ? html`<div class="empty-attachments">Không có tệp đính kèm</div>`
                    : html`<div class="attachment-list">
                                    ${this.attachments.map(
                        (file) => html`
                                            <div class="attachment-item">
                                                <span class="attachment-icon">📄</span>
                                                <span class="attachment-name">${file.fileName}</span>
                                                <span class="attachment-size">
                                                    ${file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : ""}
                                                </span>
                                                ${this.isImageFile(file.fileName)
                                                    ? html`
                                                        <vaadin-button theme="tertiary" @click="${(e: Event) => {e.stopPropagation(); this.showImagePreview(file)}}">Xem ảnh</vaadin-button>
                                                        <vaadin-button theme="tertiary" @click="${(e: Event) => {e.stopPropagation(); this.openAttachment(file)}}">Tải về</vaadin-button>
                                                      `
                                                    : html`
                                                        <vaadin-button theme="tertiary" @click="${(e: Event) => {e.stopPropagation(); this.openAttachment(file)}}">Tải về</vaadin-button>
                                                      `
                                                }
                                            </div>
                                        `,
                    )}
                                </div>`
        }
                    </div>
                </div>

                <div class="divider"></div>

                <div class="content-section">
                    <div class="section-title">
                        <or-translate value="Ghi chú"></or-translate>
                    </div>
                    <div class="form-field">
                        <vaadin-text-area
                            .value="${this.notes}"
                            ?disabled="${!this.edit}"
                            @value-changed="${this.handleNoteChange}"
                            placeholder="Thêm ghi chú của bạn..."
                            style="min-height: 100px; width: 100%;"
                        ></vaadin-text-area>
                    </div>
                </div>

                <div class="actions">
                    <vaadin-button class="cancel-btn action-btn" @click="${() => {
            if (window.history.length > 1) window.history.back()
            else window.location.hash = "/it-support"
        }}">
                        <or-translate value="Quay lại"></or-translate>
                    </vaadin-button>
                    ${
            this.edit
                ? html`
                        <vaadin-button theme="primary" class="edit-btn action-btn" @click="${this.handleUpdate}" ?disabled="${!Object.keys(this.changedFields).length || this.updating}">
                            ${this.updating ? "Đang lưu..." : "Lưu thay đổi"}
                        </vaadin-button>
                    `
                : ""
        }
                </div>
            </div>

            <!-- Status Modal -->
            ${
            this.showStatusDialog
                ? html`
                <div class="modal-overlay" @click="${this.handleModalClick}">
                    <div class="modal-content">
                        <button class="modal-close" @click="${this.closeModal}">×</button>
                        <div class="modal-title">Chọn trạng thái</div>
                        ${this.getAvailableStatus().map(
                    (status) => html`
                                <div
                                    class="option-item ${this.selectedStatus === status ? "selected" : ""}"
                                    @click="${() => this.handleSelectStatus(status)}"
                                >
                                    <div class="status-badge ${this.getStatusClass(status)}">
                                        ${statusMap[status]}
                                    </div>
                                </div>
                            `,
                )}
                    </div>
                </div>
            `
                : ""
        }

            <!-- Handler Modal -->
            ${
            this.showHandlerDialog
                ? html`
                <div class="modal-overlay" @click="${this.handleModalClick}">
                    <div class="modal-content">
                        <button class="modal-close" @click="${this.closeModal}">×</button>
                        <div class="modal-title">Chọn người xử lý</div>
                        ${
                    this.userLoading
                        ? html`
                                <div class="loading-container">
                                    <div class="loading-spinner"></div>
                                    <div>Đang tải danh sách...</div>
                                </div>
                            `
                        : this.userList.length === 0
                            ? html`<div style="text-align:center; color:#888; padding:24px 0;">Không có người xử lý</div>`
                            : html`
                                    ${this.userList.map(
                                (user) => html`
                                            <div
                                                class="option-item"
                                                @click="${() => this.handleSelectHandler(user)}"
                                            >
                                                <div class="user-avatar">
                                                    ${(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                                                </div>
                                                <div class="option-text">
                                                    ${
                                    user.firstName || user.lastName
                                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                        : user.username
                                }
                                                </div>
                                            </div>
                                        `,
                            )}
                                `
                }
                    </div>
                </div>
            `
                : ""
        }

            <!-- Type Modal -->
            ${
            this.showTypeDialog
                ? html`
                <div class="modal-overlay" @click="${this.handleModalClick}">
                    <div class="modal-content">
                        <button class="modal-close" @click="${this.closeModal}">×</button>
                        <div class="modal-title">Chọn loại thiết bị</div>
                        ${Object.entries(entityTypeMap).map(
                    ([key, value]) => html`
                                <div
                                    class="option-item ${this.selectedType === key ? "selected" : ""}"
                                    @click="${() => this.handleSelectType(key)}"
                                >
                                    <div class="option-text">${value}</div>
                                </div>
                            `,
                )}
                    </div>
                </div>
            `
                : ""
        }

            <!-- Notification -->
            ${
            this.notification.show
                ? html`
                <div class="notification ${this.notification.isError ? "error" : "success"}">
                    ${this.notification.message}
                </div>
            `
                : ""
        }
        ${this.showImageModal ? html`
          <div class="modal-overlay" @click="${this.closeImageModal}">
            <div class="modal-content" @click="${(e: Event) => e.stopPropagation()}">
              <button class="modal-close" @click="${this.closeImageModal}">×</button>
              <img src="${this.imagePreviewUrl}" style="max-width:100%;max-height:80vh;display:block;margin:auto;" />
            </div>
          </div>
        ` : ""}
        `
    }
}
