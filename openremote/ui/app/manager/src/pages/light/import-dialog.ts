import { css, html, LitElement } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "@vaadin/dialog"
import "@vaadin/upload"
import "@vaadin/button"
import "@vaadin/tabs"
import "@vaadin/icon"
import "@vaadin/icons"
import "@vaadin/horizontal-layout"
import "@vaadin/vertical-layout"
import * as XLSX from "xlsx"

interface ImportAssetDTO {
    name?: any
    lampType?: any
    powerConsumption?: any
    luminousFlux?: any
    lifeHours?: any
    lampPostId?: any
    assetCode?: any
    description?: any
    createdBy?: any
    longitude?: any
    latitude?: any
    firmwareVersion?: any
}

@customElement("import-dialog")
export class ImportDialog extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                font-family: Roboto;
            }

            .dialog-overlay {
                position: fixed;
                z-index: 9999;
                left: 0; top: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .dialog-content {
                background: white;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                min-width: 400px;
                max-width: 90vw;
                padding: 0;
            }

            .dialog-header {
                background-color: #4D9D2A;
                color: white;
                padding: 16px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }

            .dialog-title {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .dialog-body {
                padding: 24px;
                background-color: white;
            }

            .dialog-footer {
                padding: 16px 24px;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background-color: #f5f5f5;
                border-top: 1px solid #e0e0e0;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
            }

            .tab-content {
                padding: 24px 0;
            }

            .upload-area {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 32px;
                text-align: center;
                transition: all 0.3s ease;
                background-color: #fafafa;
            }

            .upload-area.dragging {
                border-color: #4D9D2A;
                background-color: rgba(77, 157, 42, 0.05);
            }

            .upload-icon {
                width: 48px;
                height: 48px;
                margin: 0 auto 16px;
                color: #4D9D2A;
                background-color: rgba(77, 157, 42, 0.1);
                border-radius: 50%;
                padding: 12px;
                box-sizing: border-box;
            }

            .upload-text {
                margin-bottom: 16px;
                color: #333;
                font-size: 16px;
            }

            .upload-hint {
                color: #666;
                font-size: 14px;
                margin-bottom: 16px;
            }

            .file-info {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 16px;
                background-color: white;
            }

            .file-icon {
                background-color: rgba(77, 157, 42, 0.1);
                color: #4D9D2A;
                padding: 8px;
                border-radius: 8px;
            }

            .file-details {
                flex: 1;
            }

            .file-name {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .file-size {
                color: #666;
                font-size: 12px;
            }

            .file-actions {
                display: flex;
                gap: 8px;
            }

            .stats-container {
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .stats-title {
                font-weight: 500;
                margin-bottom: 12px;
                font-size: 16px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .stat-card {
                background-color: white;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .stat-card.success {
                background-color: rgba(77, 157, 42, 0.1);
            }

            .stat-card.error {
                background-color: rgba(244, 67, 54, 0.1);
            }

            .stat-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 500;
            }

            .stat-value.success {
                color: #4D9D2A;
            }

            .stat-value.error {
                color: #f44336;
            }

            .error-details {
                background-color: rgba(244, 67, 54, 0.05);
                border: 1px solid rgba(244, 67, 54, 0.2);
                border-radius: 8px;
                padding: 12px;
                max-height: 200px;
                overflow-y: auto;
            }

            .error-item {
                color: #f44336;
                font-size: 12px;
                margin-bottom: 4px;
            }

            .guide-container {
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 16px;
            }

            .guide-title {
                font-weight: 500;
                margin-bottom: 12px;
                font-size: 16px;
            }

            .guide-list {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }

            .guide-item {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
            }

            .guide-number {
                color: #4D9D2A;
                font-weight: 500;
            }

            .guide-sublist {
                list-style-type: none;
                padding-left: 24px;
                margin: 8px 0;
            }

            .guide-subitem {
                color: #666;
                font-size: 13px;
                margin-bottom: 4px;
            }

            .progress-container {
                margin-top: 16px;
            }

            .progress-bar {
                height: 4px;
                background-color: #e0e0e0;
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background-color: #4D9D2A;
                transition: width 0.3s ease;
            }

            .progress-text {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }

            .success-message {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background-color: rgba(77, 157, 42, 0.1);
                border-radius: 4px;
                color: #4D9D2A;
                margin-top: 16px;
            }

            .error-message {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background-color: rgba(244, 67, 54, 0.1);
                border-radius: 4px;
                color: #f44336;
                margin-top: 16px;
            }

            vaadin-tabs {
                --vaadin-tabs-selected-text-color: #4D9D2A;
                --vaadin-tabs-border-color: transparent;
            }

            vaadin-tab[selected] {
                color: #4D9D2A;
                font-weight: bold;
            }

            vaadin-tab[selected]::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 3px;
                background-color: #4D9D2A;
            }

            vaadin-button.primary {
                background-color: #4D9D2A;
                color: white;
                font-weight: 500;
            }

            vaadin-button.primary:hover {
                background-color: #3a7a1f;
            }

            vaadin-button.secondary {
                background-color: white;
                color: #333;
                border: 1px solid #ccc;
            }

            vaadin-button.icon-button {
                min-width: 32px;
                height: 32px;
                padding: 0;
            }

            .hidden {
                display: none !important;
            }

            .spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `
    }

    @property({ type: Boolean })
    opened = false

    @state()
    private _activeTab = "upload"

    @state()
    private _selectedFile: File | null = null

    @state()
    private _isDragging = false

    @state()
    private _uploadProgress = 0

    @state()
    private _uploadStatus: "idle" | "uploading" | "success" | "error" = "idle"

    @state()
    private _showResults = false

    @state()
    private _importResults = {
        total: 0,
        success: 0,
        error: 0,
        errorDetails: [] as string[],
    }

    @state()
    private _fileInputValue = ""

    private _fileInput: HTMLInputElement | null = null

    @property({ type: Object }) manager: any;

    private _progressInterval: any = null;

    firstUpdated() {
        this._fileInput = this.shadowRoot?.querySelector("#fileInput") as HTMLInputElement
    }

    private _handleTabChange(e: CustomEvent) {
        this._activeTab = e.detail.value
    }

    private _handleDragOver(e: DragEvent) {
        e.preventDefault()
        this._isDragging = true
    }

    private _handleDragLeave() {
        this._isDragging = false
    }

    private _handleDrop(e: DragEvent) {
        e.preventDefault()
        this._isDragging = false

        if (e.dataTransfer) {
            const file = e.dataTransfer.files?.[0]
            if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
                this._handleFileSelected(file)
            }
        }
    }

    private _handleFileInputChange(e: Event) {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (file) {
            this._handleFileSelected(file)
        }
    }

    private _handleFileSelected(file: File) {
        this._selectedFile = file;
        this._uploadStatus = "idle";
        this._uploadProgress = 0;
        this._fileInputValue = ""; // Reset input value to allow selecting the same file again

        // Đọc file Excel và đếm số bản ghi hợp lệ
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                const headerRowIndex = aoa.findIndex(row => row[0] && row[0].toString().trim() === "Mã đèn (*)");
                if (headerRowIndex === -1) {
                    this._importResults = { total: 0, success: 0, error: 1, errorDetails: ["Không tìm thấy dòng header 'Mã đèn (*)' trong file Excel"] };
                    return;
                }
                const dataRows = aoa.slice(headerRowIndex + 1);
                const validRows = dataRows.filter(row =>
                    Array.isArray(row) &&
                    row.length >= 3 &&
                    row[0] && row[1] && row[2] &&
                    row[0].toString().trim() !== "" &&
                    row[1].toString().trim() !== "" &&
                    row[2].toString().trim() !== "" &&
                    row[0].toString().trim() !== "Mã đèn (*)"
                );
                this._importResults = {
                    total: validRows.length,
                    success: 0,
                    error: 0,
                    errorDetails: [],
                };
            } catch (err) {
                this._importResults = { total: 0, success: 0, error: 1, errorDetails: [err.message || "Lỗi khi đọc file Excel"] };
            }
        };
        reader.readAsArrayBuffer(file);
    }

    private _handleRemoveFile() {
        this._selectedFile = null
        this._uploadStatus = "idle"
        this._uploadProgress = 0
        if (this._fileInput) {
            this._fileInput.value = ""
        }
    }

    private async _handleImport() {
        if (!this._selectedFile) return;
        this._uploadStatus = "uploading";
        this._uploadProgress = 0;
        if (this._progressInterval) clearInterval(this._progressInterval);
        const total = this._importResults.total || 20;
        this._uploadProgress = 0;
        this._progressInterval = setInterval(() => {
            if (this._uploadProgress < 90) {
                this._uploadProgress += Math.max(1, Math.floor(80 / total));
                if (this._uploadProgress > 90) this._uploadProgress = 90;
                this.requestUpdate();
            }
        }, 80);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                const headerRowIndex = aoa.findIndex(row => row[0] && row[0].toString().trim() === "Mã đèn (*)");
                if (headerRowIndex === -1) throw new Error("Không tìm thấy dòng header 'Mã đèn (*)' trong file Excel");
                const dataRows = aoa.slice(headerRowIndex + 1);
                const jsonData = dataRows
                    .filter(row =>
                        Array.isArray(row) &&
                        row.length >= 3 &&
                        row[0] && row[1] && row[2] &&
                        row[0].toString().trim() !== "" &&
                        row[1].toString().trim() !== "" &&
                        row[2].toString().trim() !== "" &&
                        row[0].toString().trim() !== "Mã đèn (*)"
                    )
                    .map(row => {
                        const assetCode = row[0]?.toString().trim() || "";
                        const name = row[1]?.toString().trim() || "";
                        const lampType = row[2]?.toString().trim() || "";
                        const rawPower = row[3]?.toString().trim() || "";
                        const powerNumber = rawPower.replace(/[^0-9]/g, "");
                        const powerConsumption = powerNumber ? powerNumber + "W" : "";
                        const rawLuminous = row[4]?.toString().trim() || "";
                        const luminousNumber = rawLuminous.replace(/[^0-9]/g, "");
                        const luminousFlux = luminousNumber ? luminousNumber + "lm" : "";
                        const lifeHours = row[5] ? parseInt(row[5].toString().trim()) : null;
                        const firmwareVersion = row[6]?.toString().trim() || "";
                        const longitude = row[7] ? parseFloat(row[7].toString().trim()) : null;
                        const latitude = row[8] ? parseFloat(row[8].toString().trim()) : null;
                        const assetModel = row[9]?.toString().trim() || "";
                        return {
                            assetCode,
                            name,
                            lampType,
                            powerConsumption,
                            luminousFlux,
                            lifeHours,
                            firmwareVersion,
                            assetModel,
                            description: "",
                            createdBy: "user-admin",
                            longitude,
                            latitude,
                            lampPostId: null,
                        };
                    });
                // Validate dữ liệu và thống kê kết quả
                let success = 0, error = 0, errorDetails = [];
                jsonData.forEach((asset, idx) => {
                    let errMsg = "";
                    if (!asset.assetCode || !asset.name || !asset.lampType || !asset.powerConsumption || !asset.luminousFlux || !asset.lifeHours || !asset.firmwareVersion) {
                        errMsg = `Lỗi tại mã đèn ${asset.assetCode || "(trống)"}: Thiếu thông tin bắt buộc`;
                    } else if (!asset.powerConsumption.endsWith("W")) {
                        errMsg = `Lỗi tại mã đèn ${asset.assetCode}: Công suất không đúng định dạng`;
                    } else if (!asset.luminousFlux.endsWith("lm")) {
                        errMsg = `Lỗi tại mã đèn ${asset.assetCode}: Quang thông không đúng định dạng`;
                    } else if (isNaN(asset.lifeHours)) {
                        errMsg = `Lỗi tại mã đèn ${asset.assetCode}: Tuổi thọ phải là số`;
                    } else if (!asset.firmwareVersion.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                        errMsg = `Lỗi tại mã đèn ${asset.assetCode}: Firmware Version phải có định dạng x.x.x.x`;
                    }
                    if (errMsg) {
                        error++;
                        errorDetails.push(errMsg);
                    } else {
                        success++;
                    }
                });
                this._importResults = {
                    total: jsonData.length,
                    success,
                    error,
                    errorDetails,
                };
                if (success > 0) {
                    try {
                        // Lấy realm từ sessionStorage và truyền vào API
                        const realm = sessionStorage.getItem("realm");
                        console.log("Realm truyền vào import (import-dialog):", realm);
                        const resp = await this.manager?.rest?.api?.AssetInfoResource?.importAssets?.(jsonData, { realm }, {});
                        if (this._progressInterval) clearInterval(this._progressInterval);
                        this._uploadProgress = 100;
                        this.requestUpdate();
                        if (resp && resp.data) {
                            this.dispatchEvent(new CustomEvent("import-finished", { detail: { results: this._importResults } }));
                            this._handleClose();
                        } else {
                            throw new Error("Import API không trả về dữ liệu thành công");
                        }
                    } catch (apiErr) {
                        if (this._progressInterval) clearInterval(this._progressInterval);
                        this._uploadProgress = 100;
                        this.requestUpdate();
                        console.error("Lỗi khi gọi API importAssets:", apiErr, apiErr?.response);
                        this._uploadStatus = "error";
                        this._importResults = {
                            total: jsonData.length,
                            success: 0,
                            error: jsonData.length,
                            errorDetails: [apiErr.message || "Lỗi khi gọi API importAssets"],
                        };
                        return;
                    }
                } else {
                    if (this._progressInterval) clearInterval(this._progressInterval);
                    this._uploadProgress = 100;
                    this.requestUpdate();
                    this._uploadStatus = "success";
                    this._showResults = true;
                }
            } catch (err) {
                if (this._progressInterval) clearInterval(this._progressInterval);
                this._uploadProgress = 100;
                this.requestUpdate();
                this._uploadStatus = "error";
                this._importResults = {
                    total: 0,
                    success: 0,
                    error: 1,
                    errorDetails: [err.message || "Lỗi không xác định khi đọc file Excel"],
                };
            }
        };
        reader.onerror = () => {
            if (this._progressInterval) clearInterval(this._progressInterval);
            this._uploadProgress = 100;
            this.requestUpdate();
            this._uploadStatus = "error";
            this._importResults = {
                total: 0,
                success: 0,
                error: 1,
                errorDetails: ["Không đọc được file Excel"],
            };
        };
        reader.readAsArrayBuffer(this._selectedFile);
    }

    private _handleExportTemplate() {
        const wb = XLSX.utils.book_new()

        // Tạo dữ liệu mẫu cho template
        const templateData = [
            ["TEMPLATE IMPORT THÔNG TIN ĐÈN"],
            [""],
            ["HƯỚNG DẪN:"],
            ["1. Không thay đổi cấu trúc file mẫu"],
            ["2. Các trường có dấu (*) là bắt buộc phải nhập"],
            ["3. Định dạng dữ liệu:"],
            ["   - Mã đèn: Không được trùng lặp"],
            ["   - Loại đèn: Nhập đúng tên loại đèn có và đang hoạt động phần dữ liệu chủ (masterdata)"],
            ["   - Công suất(W): Chỉ nhập số (VD: nhập 30)"],
            ["   - Quang thông(lm): Chỉ nhập số (VD: nhập 1200)"],
            ["   - Tuổi thọ: Định dạng số"],
            ["   - Firmware Version: Định dạng x.x.x.x"],
            ["   - Kinh độ, Vĩ độ: Định dạng số thập phân"],
            ["   - Model đèn: Nhập đúng tên model đèn có và đang hoạt động phần dữ liệu chủ (masterdata)"],
            [""],
            ["BẢNG DỮ LIỆU:"],
            [
                "Mã đèn (*)",
                "Tên đèn (*)",
                "Loại đèn (*)",
                "Công suất (*)",
                "Quang thông (*)",
                "Tuổi thọ (*)",
                "Firmware Version (*)",
                "Kinh độ",
                "Vĩ độ",
                "Model đèn (*)"
            ],
            ["a123456", "Đèn Test new 1", "Đèn Huỳnh Quang 18W", "30", "1200", "8000", "1.0.1.2", "21.031434", "105.83015", "Model A"],
            ["", "", "", "", "", "", "", "", "", ""],
        ]

        // Tạo worksheet từ dữ liệu mẫu
        const ws = XLSX.utils.aoa_to_sheet(templateData)

        // Thiết lập độ rộng cột
        ws["!cols"] = [
            { wch: 15 }, // Mã đèn
            { wch: 25 }, // Tên đèn
            { wch: 25 }, // Loại đèn
            { wch: 15 }, // Công suất
            { wch: 15 }, // Quang thông
            { wch: 15 }, // Tuổi thọ
            { wch: 15 }, // Firmware Version
            { wch: 15 }, // Kinh độ
            { wch: 15 }, // Vĩ độ
            { wch: 25 }, // Model đèn
        ]

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Template")

        // Xuất file Excel
        XLSX.writeFile(wb, "template_import_den.xlsx")
    }

    private _handleClose() {
        if (this._progressInterval) clearInterval(this._progressInterval);
        this.opened = false
        this._resetDialog()
        this.dispatchEvent(new CustomEvent("dialog-closed"))
    }

    private _handleFinish() {
        this._handleClose()
        this.dispatchEvent(
            new CustomEvent("import-finished", {
                detail: {
                    results: this._importResults,
                },
            }),
        )
    }

    private _resetDialog() {
        this._selectedFile = null
        this._uploadStatus = "idle"
        this._uploadProgress = 0
        this._showResults = false
        this._activeTab = "upload"
        this._importResults = {
            total: 0,
            success: 0,
            error: 0,
            errorDetails: [],
        }
        if (this._fileInput) {
            this._fileInput.value = ""
        }
    }

    private _formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B"
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
        else return (bytes / 1048576).toFixed(2) + " MB"
    }

    render() {
        return html`
            ${this.opened ? html`
                <div class="dialog-overlay">
                    <div class="dialog-content">
                        <div class="dialog-header">
                            <h2 class="dialog-title">
                                <vaadin-icon icon="vaadin:upload"></vaadin-icon>
                                Import dữ liệu đèn
                            </h2>
                            <vaadin-button theme="tertiary contrast" @click="${this._handleClose}">
                                <vaadin-icon icon="vaadin:close"></vaadin-icon>
                            </vaadin-button>
                        </div>
                        <div class="dialog-body">
                            <vaadin-tabs
                                theme="equal-width-tabs"
                                .selected="${this._activeTab === 'upload' ? 0 : 1}"
                                @selected-changed="${(e: CustomEvent) => {
                                    this._activeTab = e.detail.value === 0 ? 'upload' : 'guide'
                                }}"
                            >
                                <vaadin-tab>Tải lên</vaadin-tab>
                                <vaadin-tab>Hướng dẫn</vaadin-tab>
                            </vaadin-tabs>
                            <div class="tab-content" ?hidden="${this._activeTab !== 'upload'}">
                                ${this._renderUploadTab()}
                            </div>
                            <div class="tab-content" ?hidden="${this._activeTab !== 'guide'}">
                                ${this._renderGuideTab()}
                            </div>
                        </div>
                        <div class="dialog-footer">
                            ${!this._showResults ? html`
                                <vaadin-button theme="tertiary" @click="${this._handleClose}">Hủy</vaadin-button>
                                <vaadin-button class="primary" 
                                    ?disabled="${!this._selectedFile || this._uploadStatus === 'uploading'}"
                                    @click="${this._handleImport}">
                                    ${this._uploadStatus === 'uploading' 
                                        ? html`<span class="spinner"></span> Đang xử lý`
                                        : 'Import'}
                                </vaadin-button>
                            ` : html`
                                <vaadin-button class="primary" @click="${this._handleFinish}">Hoàn thành</vaadin-button>
                            `}
                        </div>
                    </div>
                </div>
            ` : ''}
        `
    }

    private _renderUploadTab() {
        if (this._showResults) {
            // Kết quả import
            return html`
                <div class="stats-container">
                    <div class="stats-title">Kết quả import</div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Tổng số</div>
                            <div class="stat-value">${this._importResults.total}</div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-label">Thành công</div>
                            <div class="stat-value success">${this._importResults.success}</div>
                        </div>
                        <div class="stat-card error">
                            <div class="stat-label">Thất bại</div>
                            <div class="stat-value error">${this._importResults.error}</div>
                        </div>
                    </div>
                    ${this._importResults.errorDetails.length > 0 ? html`
                        <div style="margin-top: 16px">
                            <div class="stats-title">Chi tiết lỗi:</div>
                            <div class="error-details">
                                ${this._importResults.errorDetails.map(error => html`<div class="error-item">${error}</div>`)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `
        }
        return html`
            ${!this._selectedFile ? html`
                <div class="upload-area"
                    @dragover="${(e: DragEvent) => { e.preventDefault(); this._isDragging = true; }}"
                    @dragleave="${() => this._isDragging = false}"
                    @drop="${(e: DragEvent) => this._handleDrop(e)}"
                >
                    <div class="upload-icon">
                        <vaadin-icon icon="vaadin:upload-alt" style="width: 24px; height: 24px;"></vaadin-icon>
                    </div>
                    <div class="upload-text">Kéo thả file Excel vào đây hoặc</div>
                    <vaadin-button theme="primary" @click="${() => this.shadowRoot?.getElementById('fileInput')?.click()}">Chọn file</vaadin-button>
                    <input type="file" id="fileInput" accept=".xlsx,.xls" style="display:none"
                        @change="${this._handleFileInputChange}">
                    <div class="upload-hint">Chỉ chấp nhận file Excel (.xlsx, .xls)</div>
                </div>
            ` : html`
                <div class="file-info">
                    <div class="file-icon"><vaadin-icon icon="vaadin:file-table"></vaadin-icon></div>
                    <div class="file-details">
                        <div class="file-name">${this._selectedFile.name}</div>
                        <div class="file-size">${this._formatFileSize(this._selectedFile.size)}</div>
                    </div>
                    <div class="file-actions">
                        <vaadin-button theme="tertiary" class="icon-button" @click="${this._handleRemoveFile}">
                            <vaadin-icon icon="vaadin:close"></vaadin-icon>
                        </vaadin-button>
                    </div>
                </div>
                ${this._uploadStatus === 'uploading' ? html`
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${this._uploadProgress}%"></div>
                        </div>
                        <div class="progress-text">Đang xử lý... ${this._uploadProgress}%</div>
                    </div>
                ` : ''}
                ${this._uploadStatus === 'success' ? html`
                    <div class="success-message">
                        <vaadin-icon icon="vaadin:check"></vaadin-icon> File đã được tải lên thành công
                    </div>
                ` : ''}
                ${this._uploadStatus === 'error' ? html`
                    <div class="error-message">
                        <vaadin-icon icon="vaadin:close-circle"></vaadin-icon> Có lỗi xảy ra khi tải file
                    </div>
                ` : ''}
                <div class="stats-container">
                    <div class="stats-title">Thông tin file</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Tổng số bản ghi:</span>
                        <strong>${this._importResults.total}</strong>
                    </div>
                </div>
            `}
        `
    }

    private _renderGuideTab() {
        return html`
            <div class="guide-container">
                <div class="guide-title">Hướng dẫn import</div>
                <ul class="guide-list">
                    <li class="guide-item"><span class="guide-number">1.</span> <span>Không thay đổi cấu trúc file mẫu</span></li>
                    <li class="guide-item"><span class="guide-number">2.</span> <span>Các trường có dấu (*) là bắt buộc phải nhập</span></li>
                    <li class="guide-item"><span class="guide-number">3.</span> <span>Định dạng dữ liệu:</span></li>
                </ul>
                <ul class="guide-sublist">
                    <li class="guide-subitem">- Mã đèn: Không được trùng lặp</li>
                    <li class="guide-subitem">- Loại đèn: Nhập đúng tên loại đèn có trong dữ liệu chủ</li>
                    <li class="guide-subitem">- Công suất(W): Chỉ nhập số (VD: nhập 30)</li>
                    <li class="guide-subitem">- Quang thông(lm): Chỉ nhập số (VD: nhập 1200)</li>
                    <li class="guide-subitem">- Tuổi thọ: Định dạng số</li>
                    <li class="guide-subitem">- Firmware Version: Định dạng x.x.x.x</li>
                    <li class="guide-subitem">- Kinh độ, Vĩ độ: Định dạng số thập phân</li>
                    <li class="guide-subitem">- Model thiết bị: Nhập model của thiết bị</li>
                </ul>
                <div style="display: flex; justify-content: center; margin-top: 24px;">
                    <vaadin-button theme="primary" @click="${this._handleExportTemplate}">
                        <vaadin-icon icon="vaadin:download" slot="prefix"></vaadin-icon> Tải file mẫu
                    </vaadin-button>
                </div>
            </div>
        `
    }
}
