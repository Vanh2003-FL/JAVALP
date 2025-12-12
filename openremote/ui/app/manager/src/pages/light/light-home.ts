import { css, html } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import "@openremote/or-rules"
import type { OrRules } from "@openremote/or-rules"
import type { Store } from "@reduxjs/toolkit"
import { Page, type PageProvider } from "@openremote/or-app"
import type { AppStateKeyed } from "@openremote/or-app"
import manager from "@openremote/core"
import { createSelector } from "reselect"
import "@vaadin/combo-box"
import "@openremote/or-icon"
import "@vaadin/horizontal-layout"
import "@vaadin/tabs"
import "@vaadin/tabsheet"
import "@vaadin/upload"
import "@vaadin/icon"
import "@vaadin/icons"
import "./lamppost-create"
import "./light-edit"
import "./import-dialog"
import * as XLSX from "xlsx"

interface SearchFilterDTO<T> {
    keyWord?: string
    page?: number
    size?: number
    data?: T
}

interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

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
    assetModel?: any
}

interface LightAssetDTO {
    id: string
    assetCode: string
    assetName: string
    lampTypeName: string
    powerConsumption: number
    luminousFlux: number
    lightingTime: number
    // Add other fields as needed
}

export function pageLightProvider(store: Store<AppStateKeyed>, config?: LightHome): PageProvider<AppStateKeyed> {
    return {
        name: "light",
        routes: ["light", "light/:id", "light/lamppost-create", "light/edit"],
        pageCreator: () => {
            const page = new LightHome(store)
            return page
        },
    }
}

@customElement("page-home-light")
export class LightHome extends Page<AppStateKeyed> {
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: inline-block !important;
                font-family: Roboto;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            th, td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #ddd;
            }

            th {
                background-color: #4D9D2A;
                text-align: center;
                color: white;
            }

            tr {
                background: white;
            }

            tr:hover {
                background-color: #f1f1f1;
            }

            @media (max-width: 600px) {
                th, td {
                    padding: 10px;
                    font-size: 14px;
                }
            }

            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                list-style-type: none;
                padding: 20px 0;
                margin: 0;
                gap: 8px;
            }

            .pagination li {
                margin: 0;
            }

            .pagination a {
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 4px;
                color: #666;
                border: 1px solid #ddd;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                transition: all 0.3s ease;
            }

            .pagination a.active {
                background-color: #4d9d2a;
                color: white;
                border: 1px solid #4d9d2a;
            }

            .pagination a:hover:not(.active):not(.disabled) {
                background-color: #f5f5f5;
                border-color: #4d9d2a;
                color: #4d9d2a;
            }

            .pagination a.disabled {
                color: #ccc;
                cursor: not-allowed;
                border-color: #eee;
                pointer-events: none;
            }

            .pagination span {
                padding: 8px 12px;
                color: #666;
            }

            .page-info {
                text-align: center;
                color: #666;
                margin-top: 10px;
                font-size: 14px;
            }

            vaadin-tabs {
                --vaadin-tabs-selected-text-color: green;
                --vaadin-tabs-border-color: transparent;
            }

            vaadin-tab[selected] {
                color: green;
                font-weight: bold;
            }

            vaadin-tab[selected]::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 3px;
                background-color: green;
            }

            vaadin-tab[selected]::before {
                background-color: green;
            }

            vaadin-tabsheet::part(content) {
                padding: 0 !important;
            }

            /* Thêm style cho form tìm kiếm */
            .search-container {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .search-input {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                min-width: 200px;
            }

            .search-select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                min-width: 150px;
            }

            .search-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .search-button:hover {
                background-color: #3a7a1f;
            }

            .pagination-container {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                margin-top: 20px;
            }

            .pagination {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                list-style-type: none;
                padding: 10px 0;
                margin: 0;
                gap: 4px;
            }

            .pagination li {
                margin: 0;
            }

            .pagination a {
                text-decoration: none;
                padding: 4px 8px;
                border-radius: 4px;
                color: #666;
                border: 1px solid #ddd;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 32px;
                font-size: 13px;
                transition: all 0.3s ease;
            }

            .pagination a.active {
                background-color: #4d9d2a;
                color: white;
                border: 1px solid #4d9d2a;
            }

            .pagination a:hover:not(.active):not(.disabled) {
                background-color: #f5f5f5;
                border-color: #4d9d2a;
                color: #4d9d2a;
            }

            .pagination a.disabled {
                color: #ccc;
                cursor: not-allowed;
                border-color: #eee;
                pointer-events: none;
            }

            .pagination span {
                padding: 4px 8px;
                color: #666;
                font-size: 13px;
            }

            .page-info {
                text-align: right;
                color: #666;
                margin-top: 5px;
                font-size: 13px;
            }

            /* Style cho notification */
            .notification-container {
                position: fixed;
                bottom: 50px;
                right: 20px;
                z-index: 1000;
                min-width: 250px;
                max-width: 3500px;
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
            /* Modal overlay styles */
            .modal-overlay {
                position: fixed;
                z-index: 2000;
                left: 0; top: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-dialog {
                background: white;
                border-radius: 8px;
                min-width: 320px;
                max-width: 90vw;
                box-shadow: 0 2px 16px rgba(0,0,0,0.2);
                overflow: hidden;
                animation: modalIn 0.2s;
            }
            .modal-header {
                background: #5cb85c;
                color: white;
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-title { font-size: 18px; font-weight: 500; }
            .modal-close { cursor: pointer; font-size: 20px; }
            .modal-content { padding: 20px; }
            .modal-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            }
            @keyframes modalIn {
                from { transform: translateY(40px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store)
        this.route = window.location.hash || "#/light"
        window.addEventListener("hashchange", this.updateRoute.bind(this))
        this.fetchLightsData()
    }

    updateRoute() {
        this.route = window.location.hash
    }

    @property()
    public config?: LightHome

    @property({ type: String })
    public route = "#/light"

    @state() items = [
        {
            id: 1,
            code: "CD001",
            name: "Cột đèn 01",
            route: "Lộ tuyến A",
            cabinet: "Tủ điện 01",
            location: "Quận 1, TP.HCM",
            lightType: "LED 50W",
            nema: "NEMA-01",
        },
        {
            id: 2,
            code: "CD002",
            name: "Cột đèn 02",
            route: "Lộ tuyến B",
            cabinet: "Tủ điện 02",
            location: "Quận 2, TP.HCM",
            lightType: "LED 75W",
            nema: "NEMA-02",
        },
        {
            id: 3,
            code: "CD003",
            name: "Cột đèn 03",
            route: "Lộ tuyến A",
            cabinet: "Tủ điện 01",
            location: "Quận 3, TP.HCM",
            lightType: "LED 100W",
            nema: "NEMA-03",
        },
    ]

    @state() lightItems = []
    @state() loading = false
    @state() error = null
    @state() successMessage = null
    @state() currentPage = 1
    @state() pageSize = 10
    @state() totalItems = 0
    @state() totalPages = 1
    @state() searchKeyword = ""
    @state() selectedLightType = ""
    @state() lampTypes: any[] = []

    @query("#rules")
    protected _orRules!: OrRules

    @query("#fileInput")
    protected fileInput!: HTMLInputElement

    @state() protected _importDialogOpened = false
    @state() protected _selectedFile: File | null = null
    @state() protected _uploadStats = {
        totalFiles: 0,
        totalRecords: 0,
        successCount: 0,
        errorCount: 0,
    }

    @state() protected _resultDialogOpened = false
    @state() protected _importResults = {
        total: 0,
        success: 0,
        error: 0,
        errorDetails: [] as string[],
    }

    @state() protected _deleteDialogOpened = false
    @state() protected _itemToDelete: any = null

    firstUpdated() {
        if (this.fileInput) {
            // Handle file change errors
            this.fileInput.addEventListener("error", (e: CustomEvent) => {
                console.error("File rejected:", e.detail.error)
                this.error = "File rejected: " + e.detail.error
            })
        }
    }
    @state() realmSelected = sessionStorage.getItem("realm")

    async connectedCallback() {
        super.connectedCallback()
        window.addEventListener("session-changed", this._onSessionChanged)
        window.addEventListener("light-created", this._onLightCreated)
        window.addEventListener("light-updated", this._onLightUpdated)
        await this.loadLampTypes()
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener("session-changed", this._onSessionChanged)
        window.removeEventListener("light-created", this._onLightCreated)
        window.removeEventListener("light-updated", this._onLightUpdated)
    }

    _onSessionChanged = (e) => {
        const { key, value } = e.detail
        if (key === "realm") {
            this.currentPage = 1
            this.realmSelected = value
            this.fetchLightsData()
        }
    }

    _onLightCreated = async () => {
        // Reset to first page
        this.currentPage = 1
        // Refresh the list
        await this.fetchLightsData()
    }

    _onLightUpdated = async () => {
        await this.fetchLightsData()
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
                this.lampTypes = response.data.map((type) => ({
                    label: type.lampTypeName,
                    value: type.lampTypeName,
                    code: type.lampTypeCode,
                }))
            }
        } catch (error) {
            console.error("Error loading lamp types:", error)
            this.error = "Failed to load lamp types"
        }
    }

    async fetchLightsData() {
        try {
            this.loading = true
            this.error = null

            const searchBy = this.searchKeyword?.trim() || "";
            let results: any[] = [];

            // Chuẩn bị object data cho filter
            let filterData: any = {};
            if (this.selectedLightType) {
                filterData.lampType = { lampTypeName: this.selectedLightType };
            }

            // Thêm log để kiểm tra filter gửi lên API
            console.log("Filter gửi lên API:", { searchBy, filterData, currentPage: this.currentPage, pageSize: this.pageSize });

            if (searchBy) {
                // 1. Tìm theo mã
                const filterByCode: SearchFilterDTO<any> = {
                    page: this.currentPage - 1,
                    size: this.pageSize,
                    data: { ...filterData, assetCode: searchBy },
                };
                let responseCode = await manager.rest.api.AssetInfoResource.getAllLights(filterByCode, { realm: this.realmSelected });
                if (responseCode && Array.isArray(responseCode.data)) {
                    results = responseCode.data;
                }

                // 2. Tìm theo tên
                const filterByName: SearchFilterDTO<any> = {
                    page: this.currentPage - 1,
                    size: this.pageSize,
                    data: { ...filterData, assetName: searchBy },
                };
                let responseName = await manager.rest.api.AssetInfoResource.getAllLights(filterByName, { realm: this.realmSelected });
                if (responseName && Array.isArray(responseName.data)) {
                    // Gộp kết quả, loại trùng id
                    const ids = new Set(results.map(item => item.id));
                    for (const item of responseName.data) {
                        if (!ids.has(item.id)) {
                            results.push(item);
                        }
                    }
                }
            } else {
                // Nếu không có từ khóa, lấy tất cả với filter loại đèn nếu có
                const filterDTO: SearchFilterDTO<any> = {
                    page: this.currentPage - 1,
                    size: this.pageSize,
                    data: filterData,
                };
                let response = await manager.rest.api.AssetInfoResource.getAllLights(filterDTO, { realm: this.realmSelected });
                if (response && Array.isArray(response.data)) {
                    results = response.data;
                }
            }

            // Xử lý phân trang (nếu backend không trả về phân trang)
            this.lightItems = results;
            this.totalItems = results.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
        } catch (err) {
            console.error("Error fetching lights data:", err)
            this.error = "Failed to load light data"
        } finally {
            this.loading = false
        }
    }

    getCurrentPageData() {
        if (this.totalPages && this.lightItems.length <= this.pageSize) {
            return this.lightItems
        }
        const start = (this.currentPage - 1) * this.pageSize
        const end = start + this.pageSize
        return this.lightItems.slice(start, end)
    }

    handlePageChange(newPage: number) {
        console.log("Changing to page:", newPage)
        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
            this.currentPage = newPage
            this.requestUpdate() // Trigger re-render với dữ liệu trang mới
        }
    }

    async handleFileChange(event: Event) {
        event.preventDefault() // Prevent default behavior
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]

        if (!file) {
            console.error("No file selected")
            return
        }

        try {
            this.loading = true
            const reader = new FileReader()

            reader.onload = async (e) => {
                try {
                    const data = e.target?.result
                    const workbook = await this.parseExcel(data as ArrayBuffer)
                    const jsonData = this.convertExcelToJson(workbook)
                    console.log("Converted data:", jsonData)
                    await this.importLightAssets(jsonData)
                } catch (error) {
                    console.error("Error processing file:", error)
                    this.error = "Failed to process Excel file"
                } finally {
                    // Clear the input after processing
                    input.value = ""
                }
            }

            reader.onerror = () => {
                console.error("Error reading file")
                this.error = "Failed to read file"
                input.value = ""
            }

            reader.readAsArrayBuffer(file)
        } catch (error) {
            console.error("Error handling file:", error)
            this.error = "Failed to handle file"
            input.value = ""
        } finally {
            this.loading = false
        }
    }

    async parseExcel(data: ArrayBuffer): Promise<any> {
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" })
        return workbook
    }

    convertExcelToJson(workbook: any): ImportAssetDTO[] {
        console.log("=== ĐÃ VÀO convertExcelToJson ===");
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        // Đọc sheet thành mảng 2 chiều
        const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        // Tìm dòng header (dòng có 'Mã đèn (*)')
        const headerRowIndex = aoa.findIndex(row => row[0] && row[0].toString().trim() === "Mã đèn (*)");
        if (headerRowIndex === -1) throw new Error("Không tìm thấy dòng header 'Mã đèn (*)' trong file Excel");

        // Lấy dữ liệu từ dòng header trở xuống
        const dataRows = aoa.slice(headerRowIndex + 1);

        // Debug: log toàn bộ dataRows trước khi filter
        console.log("dataRows (raw):", dataRows);

        const validData = dataRows
            .filter(row =>
                Array.isArray(row) &&
                row.length >= 3 &&
                row[0] && row[1] && row[2] &&
                row[0].toString().trim() !== "" &&
                row[1].toString().trim() !== "" &&
                row[2].toString().trim() !== "" &&
                row[0].toString().trim() !== "Mã đèn (*)"
            );

        console.log("Sau filter, validData:", validData);
        console.log("Tổng số dòng dataRows:", dataRows.length);
        console.log("Tổng số dòng validData:", validData.length);

        const mappedData = validData.map(row => {
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

            // Validate dữ liệu, chỉ log cảnh báo, không throw lỗi để không dừng map
            if (!assetCode || !name || !lampType || !powerNumber || !luminousNumber || !lifeHours || !firmwareVersion) {
                console.warn("Thiếu thông tin bắt buộc cho một số trường ở dòng:", row);
            }

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
        return mappedData;
    }

    @state()
    protected notification = {
        message: "",
        isError: false,
        visible: false,
    }

    showNotification(message: string, isError = false) {
        this.notification = {
            message,
            isError,
            visible: true,
        }
        setTimeout(() => {
            this.notification = {
                ...this.notification,
                visible: false,
            }
        }, 3000)
    }

    async importLightAssets(assets: ImportAssetDTO[]) {
        try {
            this.loading = true
            this.error = null

            // Validate dữ liệu trước khi import
            if (!assets || assets.length === 0) {
                throw new Error("Không có dữ liệu để import")
            }

            // Kiểm tra dữ liệu bắt buộc và định dạng
            assets.forEach((asset, index) => {
                if (
                    !asset.assetCode ||
                    !asset.name ||
                    !asset.lampType ||
                    !asset.powerConsumption ||
                    !asset.luminousFlux ||
                    !asset.lifeHours ||
                    !asset.firmwareVersion
                ) {
                    throw new Error(`Dòng ${index + 1}: Thiếu thông tin bắt buộc`)
                }

                // Kiểm tra định dạng công suất
                if (!asset.powerConsumption.endsWith("W")) {
                    throw new Error(`Dòng ${index + 1}: Công suất không đúng định dạng`)
                }

                // Kiểm tra định dạng quang thông
                if (!asset.luminousFlux.endsWith("lm")) {
                    throw new Error(`Dòng ${index + 1}: Quang thông không đúng định dạng`)
                }

                // Kiểm tra tuổi thọ là số
                if (isNaN(asset.lifeHours)) {
                    throw new Error(`Dòng ${index + 1}: Tuổi thọ phải là số`)
                }

                // Kiểm tra định dạng firmware version
                if (!asset.firmwareVersion.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                    throw new Error(`Dòng ${index + 1}: Firmware Version phải có định dạng x.x.x.x`)
                }
            })

            // Lấy realm trực tiếp từ sessionStorage
            const realm = sessionStorage.getItem("realm")
            console.log("Realm truyền vào import:", realm)
            const response = await manager.rest.api.AssetInfoResource.importAssets(assets, { realm }, {})

            if (response) {
                console.log("Assets imported successfully")
                this.showNotification("Import thành công", false)
                this.fetchLightsData()
            }
        } catch (err) {
            console.error("Error importing assets:", err)
            this.showNotification(err.message || "Failed to import assets", true)
        } finally {
            this.loading = false
        }
    }

    // Hàm xuất file template
    exportTemplate() {
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
                "Model đèn (*)",
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

    // Hàm xử lý tìm kiếm
    handleSearch() {
        this.currentPage = 1 // Reset về trang đầu tiên
        this.fetchLightsData() // Gọi API với từ khóa tìm kiếm
    }

    // Cập nhật từ khóa tìm kiếm
    updateSearchKeyword(e: Event) {
        const input = e.target as HTMLInputElement
        this.searchKeyword = input.value
    }

    // Cập nhật loại đèn được chọn
    updateSelectedLightType(e: CustomEvent) {
        this.selectedLightType = e.detail.value
        this.handleSearch()
    }

    protected _realmSelector = (state: AppStateKeyed) => state.app.realm || manager.displayRealm

    protected getRealmState = createSelector([this._realmSelector], async (realm) => {
        if (this._orRules) {
            this._orRules.refresh()
        }
    })

    static properties = {
        route: { type: String },
    }

    get name(): string {
        return "light"
    }

    navigateTo(path) {
        window.location.hash = path
        this.updateRoute()
    }

    navigateToCreate() {
        window.location.hash = "/light/lamppost-create"
    }

    renderPagination() {
        const pages = []
        const maxVisiblePages = 3

        // Nút về trang đầu (<<)
        pages.push(html`
            <li>
                <a href="#"
                   @click="${(e: Event) => {
                       e.preventDefault()
                       this.handlePageChange(1)
                   }}"
                   class="${this.currentPage === 1 ? "disabled" : ""}"
                   title="Trang đầu"
                >
                    <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                </a>
            </li>
        `)

        // Nút Previous (<)
        pages.push(html`
            <li>
                <a href="#"
                   @click="${(e: Event) => {
                       e.preventDefault()
                       this.handlePageChange(this.currentPage - 1)
                   }}"
                   class="${this.currentPage === 1 ? "disabled" : ""}"
                   title="Trang trước"
                >
                    <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                </a>
            </li>
        `)

        // Tính toán các trang hiển thị
        const startPage = this.currentPage
        const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)

        // Hiển thị các trang
        for (let i = startPage; i <= endPage; i++) {
            pages.push(html`
                <li>
                    <a href="#"
                       @click="${(e: Event) => {
                           e.preventDefault()
                           this.handlePageChange(i)
                       }}"
                       class="${this.currentPage === i ? "active" : ""}"
                    >
                        ${i}
                    </a>
                </li>
            `)
        }

        // Hiển thị dấu ... và trang cuối nếu cần
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push(html`<li><span>...</span></li>`)
            }
            pages.push(html`
                <li>
                    <a href="#"
                       @click="${(e: Event) => {
                           e.preventDefault()
                           this.handlePageChange(this.totalPages)
                       }}"
                       class="${this.currentPage === this.totalPages ? "active" : ""}"
                    >
                        ${this.totalPages}
                    </a>
                </li>
            `)
        }

        // Nút Next (>)
        pages.push(html`
            <li>
                <a href="#"
                   @click="${(e: Event) => {
                       e.preventDefault()
                       this.handlePageChange(this.currentPage + 1)
                   }}"
                   class="${this.currentPage === this.totalPages ? "disabled" : ""}"
                   title="Trang sau"
                >
                    <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                </a>
            </li>
        `)

        // Nút đến trang cuối (>>)
        pages.push(html`
            <li>
                <a href="#"
                   @click="${(e: Event) => {
                       e.preventDefault()
                       this.handlePageChange(this.totalPages)
                   }}"
                   class="${this.currentPage === this.totalPages ? "disabled" : ""}"
                   title="Trang cuối"
                >
                    <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                </a>
            </li>
        `)

        const startItem = (this.currentPage - 1) * this.pageSize + 1
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems)

        return html`
            <div class="pagination-container">
                <ul class="pagination">${pages}</ul>
                <div class="page-info">
                    Hiển thị ${startItem}-${endItem} của ${this.totalItems} mục
                </div>
            </div>
        `
    }

    triggerFileInput() {
        this.fileInput?.click()
    }

    // Xử lý sự kiện khi import hoàn thành
    _handleImportFinished(e: CustomEvent) {
        const results = e.detail.results
        console.log("Import finished with results:", results)

        // Hiển thị thông báo
        if (results.success > 0) {
            this.showNotification(`Import thành công ${results.success} bản ghi`, false)
        } else if (results.error > 0) {
            this.showNotification(`Import thất bại: ${results.error} lỗi`, true)
        }

        // Refresh dữ liệu
        this.fetchLightsData()
    }

    protected render() {
        return html`
            ${this.route === "#/light/lamppost-create" ? html`<lamppost-create></lamppost-create>` : ""}
            ${this.route.startsWith("#/light/edit") ? html`<light-edit></light-edit>` : ""}
            ${this.route === "#/cabinets/info" ? html`<cabinet-info></cabinet-info>` : ""}
            ${this.route === "#/cabinets/edit" ? html`<cabinet-edit></cabinet-edit>` : ""}
            ${
            this.route === "#/light"
                ? html`
                                ${
                    this.notification.visible
                        ? html`<div class="notification ${this.notification.isError ? "error" : "success"}">${this.notification.message}</div>`
                        : ""
                }
                                <div>
                                    <div style="display: flex;justify-content: space-between;align-items: center;margin-top: 20px;padding: 0 20px">
                                        <h1 style="margin: 0"><or-translate value="Quản lý đèn"></or-translate></h1>
                                    </div>
                                    <div style="padding: 20px;">
                                        <div style="display: flex;justify-content: flex-end;margin: 10px 0px;gap: 12px;">
                                            <vaadin-button style="background: #4d9d2a;color: white;" @click="${() => this.navigateToCreate()}">
                                                <or-icon icon="plus" slot="prefix"></or-icon>
                                                <or-translate value="Tạo mới"></or-translate>
                                            </vaadin-button>

                                            <!-- Sử dụng component import dialog mới -->
                                            <import-dialog
                                                .opened="${this._importDialogOpened}"
                                                .manager="${manager}"
                                                @dialog-closed="${() => (this._importDialogOpened = false)}"
                                                @import-finished="${this._handleImportFinished}"
                                            ></import-dialog>

                                            <vaadin-button style="background: white;color: black;border: 1px solid #ddd;" @click="${() => (this._importDialogOpened = true)}">
                                                <or-icon icon="upload" slot="prefix"></or-icon>
                                                Import file
                                            </vaadin-button>
                                            <vaadin-button style="background: white;color: black;border: 1px solid #ddd;" @click="${this.exportTemplate}">
                                                <or-icon icon="download" slot="prefix"></or-icon>
                                                Export file template
                                            </vaadin-button>
                                        </div>

                                        <!-- Form tìm kiếm -->
                                        <div class="search-container">
                                            <input
                                                    type="text"
                                                    class="search-input"
                                                    placeholder="Nhập mã, tên đèn"
                                                    .value="${this.searchKeyword}"
                                                    @input="${this.updateSearchKeyword}"
                                                    @keyup="${(e: KeyboardEvent) => e.key === "Enter" && this.handleSearch()}"
                                            >
                                            <vaadin-combo-box
                                                    class="search-select"
                                                    .items="${this.lampTypes}"
                                                    .value="${this.selectedLightType}"
                                                    @value-changed="${this.updateSelectedLightType}"
                                                    item-label-path="label"
                                                    item-value-path="value"
                                                    placeholder="Chọn loại đèn"
                                                    clear-button-visible
                                            ></vaadin-combo-box>
                                            <button class="search-button" @click="${this.handleSearch}">
                                                <or-icon icon="search"></or-icon>
                                                Tìm kiếm
                                            </button>
                                        </div>

                                        <div>
                                            ${this.loading ? html`<div style="text-align: center; padding: 20px;">Loading...</div>` : ""}
                                            ${this.error ? html`<div style="text-align: center; color: red; padding: 20px;">${this.error}</div>` : ""}

                                            <table>
                                                <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th><or-translate value="Mã đèn"></or-translate></th>
                                                    <th><or-translate value="Tên đèn"></or-translate></th>
                                                    <th><or-translate value="Loại đèn"></or-translate></th>
                                                    <th><or-translate value="Công suất (W)"></or-translate></th>
                                                    <th><or-translate value="Quang thông (lm)"></or-translate></th>
                                                    <th><or-translate value="Tuổi thọ (Giờ)"></or-translate></th>
                                                    <th><or-translate value="Model thiết bị"></or-translate></th>
                                                    <th><or-translate value="Hành động"></or-translate></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                ${this.getCurrentPageData().map(
                    (item, index) => html`
                                                            <tr>
                                                                <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
                                                                <td>${item.assetCode}</td>
                                                                <td>${item.assetName}</td>
                                                                <td>${item.lampTypeName}</td>
                                                                <td>${this.formatNumber(item.powerConsumption)}</td>
                                                                <td>${this.formatNumber(item.luminousFlux)}</td>
                                                                <td>${this.formatNumber(item.lightingTime)}</td>
                                                                <td>${item.assetModel}</td>
                                                                <td>
                                                                    <vaadin-icon
                                                                            icon="vaadin:eye"
                                                                            style="color: black; cursor: pointer; margin-right: 8px;"
                                                                            @click="${() => (window.location.hash = `/light/edit?id=${item.id}&mode=view`)}"
                                                                    ></vaadin-icon>
                                                                    <vaadin-icon
                                                                            icon="vaadin:pencil"
                                                                            style="color: black; cursor: pointer; margin-right: 8px;"
                                                                            @click="${() => (window.location.hash = `/light/edit?id=${item.id}&mode=edit`)}"
                                                                    ></vaadin-icon>
                                                                    <vaadin-icon
                                                                            icon="vaadin:trash"
                                                                            style="color: black; cursor: pointer;"
                                                                            @click="${() => {
                        this._itemToDelete = item
                        this._deleteDialogOpened = true
                    }}"
                                                                    ></vaadin-icon>
                                                                </td>
                                                            </tr>
                                                        `,
                )}
                                                </tbody>
                                            </table>
                                            ${this.renderPagination()}
                                        </div>
                                    </div>
                                </div>`
                : ""
        }
        <vaadin-dialog
            theme="no-padding"
            .opened="${this._deleteDialogOpened}"
            @opened-changed="${(e: CustomEvent) => this._deleteDialogOpened = e.detail.value}"
            .renderer="${(root: HTMLElement) => {
                if (root.firstElementChild) return;
                const dialog = document.createElement('div');
                dialog.style.width = 'auto';
                dialog.style.maxWidth = '100%';
                dialog.style.borderRadius = '4px';
                dialog.style.overflow = 'hidden';
                dialog.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                dialog.style.padding = '0';
                // Header
                const header = document.createElement('div');
                header.style.backgroundColor = '#5cb85c';
                header.style.color = 'white';
                header.style.padding = '12px 20px';
                header.style.fontSize = '18px';
                header.style.fontWeight = '500';
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
                const titleContainer = document.createElement('div');
                titleContainer.style.flex = '1';
                titleContainer.style.textAlign = 'center';
                titleContainer.textContent = 'Xác nhận';
                const closeBtn = document.createElement('span');
                closeBtn.innerHTML = '✕';
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.fontSize = '20px';
                closeBtn.addEventListener('click', () => {
                    this._deleteDialogOpened = false;
                    this._itemToDelete = null;
                });
                const placeholder = document.createElement('div');
                placeholder.style.width = '20px';
                header.appendChild(placeholder);
                header.appendChild(titleContainer);
                header.appendChild(closeBtn);
                // Message content
                const content = document.createElement('div');
                content.style.padding = '20px';
                content.style.backgroundColor = 'white';
                const message = document.createElement('p');
                message.style.fontSize = '16px';
                message.style.margin = '10px 0 20px';
                const textBefore = document.createTextNode('Bạn có chắc chắn muốn xóa đèn ');
                const boldName = document.createElement('span');
                boldName.textContent = this._itemToDelete?.assetName || '';
                boldName.style.fontWeight = 'bold';
                const textAfter = document.createTextNode(' này?');
                message.appendChild(textBefore);
                message.appendChild(boldName);
                message.appendChild(textAfter);
                // Button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'center';
                buttonContainer.style.gap = '10px';
                buttonContainer.style.marginTop = '20px';
                // Cancel button
                const btnCancel = document.createElement('button');
                btnCancel.textContent = 'Hủy';
                btnCancel.style.padding = '8px 20px';
                btnCancel.style.borderRadius = '4px';
                btnCancel.style.border = 'none';
                btnCancel.style.backgroundColor = '#e2e2e2';
                btnCancel.style.cursor = 'pointer';
                btnCancel.addEventListener('click', () => {
                    this._deleteDialogOpened = false;
                    this._itemToDelete = null;
                });
                // Delete button
                const btnConfirm = document.createElement('button');
                btnConfirm.textContent = 'Xóa';
                btnConfirm.style.padding = '8px 20px';
                btnConfirm.style.borderRadius = '4px';
                btnConfirm.style.border = 'none';
                btnConfirm.style.backgroundColor = '#5cb85c';
                btnConfirm.style.color = 'white';
                btnConfirm.style.cursor = 'pointer';
                btnConfirm.addEventListener('click', async () => {
                    if (this._itemToDelete) {
                        await this.handleDelete(this._itemToDelete);
                        this._deleteDialogOpened = false;
                        this._itemToDelete = null;
                    }
                });
                buttonContainer.appendChild(btnCancel);
                buttonContainer.appendChild(btnConfirm);
                content.appendChild(message);
                content.appendChild(buttonContainer);
                dialog.appendChild(header);
                dialog.appendChild(content);
                root.appendChild(dialog);
            }}"
        ></vaadin-dialog>
        `
    }

    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state)
    }

    formatNumber(value: string | number): string {
        if (!value) return "0"
        const number = Number.parseInt(value.toString().replace(/\D/g, ""))
        return number.toLocaleString("vi-VN")
    }

    protected async handleDelete(item: any) {
        try {
            const response = await manager.rest.api.AssetInfoResource.deleteLight(item.id, {
                headers: { "X-Realm": this.realmSelected },
            })

            if (response && response.data) {
                this.showNotification("Xóa đèn thành công!", false)

                // Reset to page 1 to ensure we get all data properly
                this.currentPage = 1

                // Fetch data again with reset pagination
                await this.fetchLightsData()
            } else {
                throw new Error("Delete failed")
            }
        } catch (error) {
            console.error("Error deleting light:", error)
            this.showNotification("Có lỗi xảy ra khi xóa đèn", true)
        }
    }
}
