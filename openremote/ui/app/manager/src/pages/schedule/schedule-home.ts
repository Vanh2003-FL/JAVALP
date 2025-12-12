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
import "@vaadin/date-picker"
import "@vaadin/time-picker"
import "@vaadin/icon"
import "@vaadin/icons"
import "./schedule-edit"
import "./schedule-create"
import "@vaadin/dialog"
import "@vaadin/button"
import "@vaadin/text-field"
import "@vaadin/select"

export interface ScheduleItem {
    id: string
    code: string
    name: string
    type: string
    isNew: boolean
    active?: number
}

export interface TimeSlot {
    startTime: string
    endTime: string
    brightness: number
    lightTypes?: LightType[]
}

export interface DeviceItem {
    id: number
    type: string
    code: string
    assetTypeId: string
    name: string
    position: string
    status?: number
    originalId?: string
    assetTypeCode?: string
    roadName?: string
}

export interface LightType {
    type: string
    brightness: number
    powerConsumption?: number
}

export interface SchTimePeriod {
    time_id?: number
    time_from?: string
    time_to?: string
    time_value?: number
}

export interface CustomizeLampType {
    time_id?: any
    lamp_type_id?: any
    lamp_type_code?: any
    lamp_type_name?: any
    lamp_type_value?: any
}

export interface TimeConfiguration {
    timePeriod: SchTimePeriod
    lampTypes: CustomizeLampType[]
}

export interface ScheduleInfo {
    id: string
    scheduleName: string
    scheduleCode: string
    realm: string
    active: number
    schType: string
    description: string
    deleted: number
    createBy: string
    createDate: number
    updateBy: string
    updateDate: number
    schFromDate?: number
    schToDate?: number
    isSchRepeatEnd?: boolean
    schRepeatOccu?: string
    schTimePeriods?: any[]
    customizeLampType?: any[]
    timeConfigurations?: any[]
    scheduleAssets?: any[]
}

export function pageScheduleProvider(store: Store<AppStateKeyed>, config?: ScheduleHome): PageProvider<AppStateKeyed> {
    return {
        name: "schedule",
        routes: ["schedule", "schedule/:id"],
        pageCreator: () => {
            const page = new ScheduleHome(store)
            if (config) {
                page.config = config
            }
            return page
        },
    }
}

@customElement("schedule-home")
export class ScheduleHome extends Page<AppStateKeyed> {
    static get styles() {
        return css`
            :host {
                display: inline-block !important;
                width: 100%;
                height: 100%;
                --primary-color: #4CAF50;
                --border-color: #e0e0e0;
            }

            .container {
                display: flex;
                min-height: 100%;
                background-color: white;
            }

            .add-button vaadin-icon {
                margin-right: 8px;
            }

            .status-active {
                color: #4caf50;
                font-weight: 500;
            }

            tr.selected-row {
                background-color: rgba(77, 157, 42, 0.2);
                position: relative;
            }

            tr.selected-row::after {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 4px;
                background-color: #4D9D2A;
            }

            tr {
                cursor: pointer;
                transition: background-color 0.2s ease;
                position: relative;
            }

            tr:hover:not(.selected-row) {
                background-color: rgba(77, 157, 42, 0.05);
            }

            .schedule-list {
                width: 45%;
                padding: 15px;
                background-color: white;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                height: 100%;
                overflow-x: hidden; /* Ngăn không cho nội dung tràn ngang */
                display: flex;
                flex-direction: column;
            }

            .schedule-detail {
                width: 55%;
                padding: 20px;
                background-color: white;
                margin-left: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .header-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }

            .header {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 0;
            }

            .add-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                font-size: 14px;
                margin-bottom: 5px;
            }

            .add-button svg {
                margin-right: 8px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
                table-layout: fixed; /* Cố định độ rộng cột */
                min-width: 100%; /* Đảm bảo bảng không nhỏ hơn container */
            }

            th, td {
                border: 1px solid #e0e0e0;
                padding: 8px 12px;
                text-align: left;
                color: black;
                overflow: hidden;
                text-overflow: ellipsis; /* Hiển thị dấu ... khi nội dung quá dài */
                white-space: nowrap; /* Không cho phép xuống dòng */
            }

            /* Thiết lập độ rộng cố định cho các cột */
            th:nth-child(1), td:nth-child(1) { width: 30px; } /* Checkbox */
            th:nth-child(2), td:nth-child(2) { width: 40px; } /* STT */
            th:nth-child(3), td:nth-child(3) { width: 80px; } /* Mã kịch bản - giảm xuống */
            th:nth-child(4), td:nth-child(4) { width: auto; min-width: 120px; } /* Tên kịch bản - linh hoạt nhưng có min-width */
            th:nth-child(5), td:nth-child(5) { width: 70px; } /* Lịch biểu - giảm xuống */
            th:nth-child(6), td:nth-child(6) { width: 90px; } /* Trạng thái - giảm xuống */
            th:nth-child(7), td:nth-child(7) { width: 70px; text-align: center; } /* Hành động - giảm xuống */

            th {
                background-color: #4D9D2A;
                font-weight: normal;
                color: white;
            }

            .action-cell {
                display: flex;
                justify-content: center;
                gap: 2px; /* Giảm khoảng cách giữa các nút */
            }

            .action-button {
                background: none;
                border: none;
                cursor: pointer;
                color: #555;
                padding: 2px; /* Giảm padding */
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 24px; /* Đảm bảo kích thước tối thiểu */
                min-height: 24px;
            }

            .action-button:hover {
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
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
            .status-active {
                color: #4caf50;
                font-weight: 500;
            }

            /* Pagination Styles */
            .pagination-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
                width: 100%;
            }

            .pagination-info {
                font-size: 14px;
                color: #666;
            }

            .pagination {
                display: flex;
                align-items: center;
            }

            .pagination a, .pagination .ellipsis {
                font-size: 14px;
                text-decoration: none;
                padding: 8px 12px;
                border-radius: 4px;
                color: #666;
                border: 1px solid #ddd;
                margin: 0 2px;
                display: inline-block;
            }

            .pagination .ellipsis {
                border: none;
                padding: 0 5px;
            }

            .pagination a[disabled] {
                color: #ccc;
                pointer-events: none;
                border-color: #eee;
            }

            .pagination a.active {
                background-color: #4D9D2A;
                color: white;
                border-color: #4D9D2A;
            }

            .pagination a.page-nav {
                background-color: #f8f9fa;
            }

            .pagination a:hover:not([disabled]):not(.active) {
                background-color: #f1f1f1;
            }

            .page-size-selector {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;
                margin-top: 0;
                margin-bottom: 5px;
            }

            .page-size-selector select {
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #ddd;
            }

            .table-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3px;
                width: 100%;
            }

            .table-controls > div:first-child {
                display: flex;
                gap: 8px;
            }

            /* Loading styles */
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10;
                backdrop-filter: blur(1px);
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Search styles */
            .search-container {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                width: 100%;
            }

            .search-field {
                width: 40%;
                min-width: 300px;
            }

            /* Tooltip cho nội dung bị cắt */
            [data-tooltip] {
                position: relative;
                cursor: pointer;
            }

            [data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                left: 0;
                top: 100%;
                background-color: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                z-index: 10;
                white-space: normal;
                max-width: 300px;
                word-wrap: break-word;
                font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                animation: fadeIn 0.3s;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Responsive styles */
            @media (max-width: 1200px) {
                .container {
                    flex-direction: column;
                }

                .schedule-list, .schedule-detail {
                    width: 100%;
                    margin-left: 0;
                    margin-bottom: 20px;
                }
            }

            /* Cải thiện hiển thị trên màn hình nhỏ */
            @media (max-width: 768px) {
                th:nth-child(3), td:nth-child(3), /* Mã kịch bản */
                th:nth-child(5), td:nth-child(5) { /* Lịch biểu */
                    display: none;
                }
            }
        `
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store)
        this.route = window.location.hash || "#/schedule"
        window.addEventListener("hashchange", this.updateRoute.bind(this))

        const savedPageSize = localStorage.getItem("scheduleListPageSize")
        if (savedPageSize) {
            this.pageSize = Number.parseInt(savedPageSize, 10)
        }

        this._totalItemsCount = 15
        this._loadSchedules()
    }

    updateRoute() {
        this.route = window.location.hash || "#/schedule"
        const id = window.location.hash.split("/").pop()

        if (id && id !== "schedule" && id !== "create") {
            this._selectedSchedule = id
            this.requestUpdate()
        } else if (id === "create") {
            this._selectedSchedule = null
            this.requestUpdate()
        } else if (id === "schedule") {
            if (this._schedules.length > 0 && !this._selectedSchedule) {
                this._selectedSchedule = this._schedules[0].id
            }
            this.requestUpdate()
        }
    }

    @property()
    public config?: ScheduleHome

    @property()
    public route?: {}

    @query("#rules")
    protected _orRules!: OrRules

    nextPage() {
        this.goToPage(this.currentPage + 1)
    }

    @state()
    protected _schedules: ScheduleItem[] = []

    @state()
    protected _scheduleToDeleteName = ""
    @state() realmSelected = sessionStorage.getItem("realm")
    
    @state()
    protected _isDeleting = false

    @state()
    protected _selectedSchedule: string | null = null

    @state()
    protected _isDeleteDialogOpen = false

    @state()
    protected _scheduleToDelete: string | null = null

    @state() private currentPage = 1
    @state() private pageSize = 5
    @state() private totalItems = 0
    @state() private totalPages = 0
    @state()
    protected _searchTerm = ""

    @state()
    protected _isLoading = false

    @state()
    protected _totalItemsCount = 15

    @state()
    protected _selectedSchedules: string[] = []

    prevPage() {
        this.goToPage(this.currentPage - 1)
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
        return "schedule"
    }

    navigateTo(path: string) {
        if (window.location.hash !== `#${path}`) {
            window.location.hash = path;
        } else {
            this.updateRoute();
        }
        this.requestUpdate();
    }

    navigateToCreate() {
        this._selectedSchedule = null
        this.requestUpdate()
        window.location.hash = "/schedule/create"
    }

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener("session-changed", this._onSessionChanged)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.addEventListener("session-changed", this._onSessionChanged)
    }
    _onSessionChanged = async (e) => {
        const { key, value } = e.detail
        if (key === "realm") {
            if (!window.location.hash.startsWith("#/schedule")) {
                return
            }
            this.currentPage = 1
            this.realmSelected = value
            this._selectedSchedule = null
            await this._loadSchedules()

            if (this._schedules && this._schedules.length > 0) {
                this._selectedSchedule = this._schedules[0].id
                this.navigateTo(`/schedule/${this._schedules[0].id}`)
            } else {
                this.navigateTo("/schedule")
            }
            this.requestUpdate()
        }
    }
    protected async _loadSchedules() {
        if (this._isDeleting) {
            return
        }
        
        this._isLoading = true
        try {
            const allDataResponse = await manager.rest.api.ScheduleInfoResource.getData({
                keyWord: this._searchTerm,
                page: 1,
                size: 1000,
                data: {
                    realm: this.realmSelected,
                },
            })

            const totalItems = allDataResponse.data ? allDataResponse.data.length : 0

            const recalculatedTotalPages = Math.ceil(totalItems / this.pageSize)

            // Nếu đang đứng ở trang vượt quá tổng số trang (ví dụ sau khi xóa phần tử cuối cùng của trang cuối),
            // thì tự động lùi về trang cuối hợp lệ trước khi gọi API lấy dữ liệu trang hiện tại
            if (recalculatedTotalPages > 0 && this.currentPage > recalculatedTotalPages) {
                this.currentPage = recalculatedTotalPages
            }

            // Sau đó lấy dữ liệu cho trang hiện tại
            const filterDTO = {
                keyWord: this._searchTerm,
                page: totalItems === 0 ? 1 : this.currentPage, // đảm bảo trang hợp lệ khi không có dữ liệu
                size: this.pageSize,
                data: {
                    realm: this.realmSelected,
                },
            }

            const response = await manager.rest.api.ScheduleInfoResource.getData(filterDTO)

            if (response && response.data && Array.isArray(response.data)) {
                this._schedules = response.data.map((schedule) => ({
                    id: schedule.id,
                    code: schedule.scheduleCode || "",
                    name: schedule.scheduleName || "",
                    type: schedule.schType ? this._mapScheduleTypeToDisplay(schedule.schType) : "Chưa phân loại",
                    isNew: false,
                    active: schedule.active,
                }))

                this.totalItems = totalItems
                this._totalItemsCount = totalItems
                this.totalPages = Math.ceil(totalItems / this.pageSize)


                if (this._schedules.length > 0 && !this._selectedSchedule) {
                    this._selectedSchedule = this._schedules[0].id
                    this.navigateTo(`/schedule/${this._schedules[0].id}`)
                }

                if (this._schedules.length === 0 && totalItems > 0 && this.currentPage > 1) {
                    this.currentPage = Math.max(1, this.currentPage - 1)
                    await this._loadSchedules()
                    return
                }
            } else {
                console.error("Invalid response format:", response)
                this._schedules = []
                this.totalItems = 0
                this._totalItemsCount = 0
                this.totalPages = 0
            }
        } catch (error) {
            console.error("Error loading schedules:", error)
            this._schedules = []
            this.totalItems = 0
            this._totalItemsCount = 0
            this.totalPages = 0
        } finally {
            this._isLoading = false
            this.requestUpdate()
        }
    }

    protected _mapScheduleTypeToDisplay(type: string): string {
        switch (type) {
            case "ALWAYS":
                return "Luôn luôn"
            case "REOCC":
                return "Lặp lại"
            case "ANOCC":
                return "Một lần"
            default:
                return type
        }
    }

    @state()
    protected _selectedScheduleId: string | null = null

    protected _handleEdit(id: string) {
        // this.navigateTo(`/schedule/${id}`);
        this._selectedSchedule = id;
        this.requestUpdate();
        setTimeout(() => {
            const scheduleEditComponent = this.shadowRoot?.querySelector("schedule-edit") as any;
            if (scheduleEditComponent && scheduleEditComponent._loadScheduleDetails) {
                scheduleEditComponent._loadScheduleDetails(id);
            }
        }, 100);
    }

    protected _handleDelete(id: string) {
        this._scheduleToDelete = id
        const scheduleToDelete = this._schedules.find((schedule) => schedule.id === id)
        this._scheduleToDeleteName = scheduleToDelete ? scheduleToDelete.name : ""
        this._isDeleteDialogOpen = true
    }

    // Add a method to handle outside clicks on the dialog
    protected _handleOutsideClick(e: Event) {
        e.preventDefault()
    }

    // Add these new methods for the delete dialog
    protected _cancelDelete() {
        this._isDeleteDialogOpen = false
        this._scheduleToDelete = null
    }

    protected async _confirmDelete() {
        if (this._scheduleToDelete) {
            this._isDeleteDialogOpen = false
            this.requestUpdate()

            try {
                this._isLoading = true
                this._isDeleting = true
                const scheduleToDeleteId = this._scheduleToDelete
                
                await manager.rest.api.ScheduleInfoResource.remove(scheduleToDeleteId)

                this._totalItemsCount--

                await new Promise(resolve => setTimeout(resolve, 500))

                this._selectedSchedule = null
                this._isDeleting = false
                await this._loadSchedules()

                const deletedScheduleStillExists = this._schedules.some(s => s.id === scheduleToDeleteId)
                
                if (this._schedules.length === 0) {
                    this.requestUpdate()
                    await this.updateComplete
                    this.navigateTo('/schedule')
                } else if (deletedScheduleStillExists) {
                    this._selectedSchedule = scheduleToDeleteId
                    this.requestUpdate()
                    await this.updateComplete
                    this.navigateTo(`/schedule/${scheduleToDeleteId}`)
                } else {
                    this.requestUpdate()
                }
            } catch (error) {
                console.error("Error deleting schedule:", error)
                this.showNotification("Lỗi khi xóa kịch bản", true)
            } finally {
                this._isLoading = false
            }
        }

        this._scheduleToDelete = null
    }

    // Pagination methods
    protected _goToPage(page: number) {
        if (page < 1 || page > this.totalPages) {
            return
        }
        this.currentPage = page
        this._selectedSchedules = []
        this._loadSchedules()
    }

    protected _goToPreviousPage() {
        if (this.currentPage > 1) {
            this._goToPage(this.currentPage - 1)
        }
    }

    protected _goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this._goToPage(this.currentPage + 1)
        }
    }

    protected _handlePageSizeChange(e: CustomEvent) {
        const newSize = Number.parseInt(e.detail.value)
        if (this.pageSize !== newSize) {
            this.pageSize = newSize
            localStorage.setItem("scheduleListPageSize", newSize.toString())
            this.currentPage = 1 // Reset to first page when changing page size
            this._loadSchedules()
        }
    }

    // Search methods
    protected _handleSearch() {
        const searchField = this.shadowRoot?.querySelector('vaadin-text-field[placeholder="Tìm kiếm kịch bản"]') as any
        if (searchField) {
            this._searchTerm = searchField.value || ""
            this.currentPage = 1 // Reset to first page when searching
            this._loadSchedules()
        }
    }

    protected _clearSearch() {
        this._searchTerm = ""
        const searchField = this.shadowRoot?.querySelector('vaadin-text-field[placeholder="Tìm kiếm kịch bản"]') as any
        if (searchField) {
            searchField.value = ""
        }
        this.currentPage = 1 // Reset to first page when clearing search
        this._loadSchedules()
    }

    @state() private notification = { show: false, message: "", isError: false }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError }

        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 3000)
    }

    handleSaveSchedule = async (e: CustomEvent) => {
        try {
            const schedule = e.detail
            const response = await manager.rest.api.ScheduleInfoResource.updateSchedule(schedule)

            if (response) {
                // Show success notification first
                this.showNotification("Lưu lịch thành công", false)

                // Add 1 second delay before updating
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Reload the schedules after delay
                await this._loadSchedules()

                const scheduleEditComponent = this.shadowRoot?.querySelector("schedule-edit") as any
                if (scheduleEditComponent && scheduleEditComponent._loadScheduleDetails) {
                    await scheduleEditComponent._loadScheduleDetails(schedule.id)
                }
            }
        } catch (error) {
            console.error("Error saving schedule:", error)
            this.showNotification("Lỗi khi lưu lịch", true)
        }
    }

    handleCreateSchedule = async (schedule: ScheduleInfo) => {
        try {
            // Increment total count after creation
            this._totalItemsCount++

            // Reset to first page after creating a new schedule
            this.currentPage = 1
            // Reload schedules after save
            await this._loadSchedules()

            // Navigate back to list
            this.navigateTo("/schedule")

            this._selectedSchedule = null
            // this.showNotification("Thêm kịch bản thành công")
        } catch (error) {
            console.error("Error saving schedule:", error)
            alert("Có lỗi xảy ra khi lưu kịch bản!")
        }
    }

    handleCancelEdit = () => {
        this._selectedSchedule = null
        this.navigateTo("/schedule")
        this.requestUpdate()
    }

    renderPagination() {
        if (this.totalItems === 0) {
            return html``
        }

        const pages = []
        const maxVisiblePages = 5

        // Calculate start and end pages
        let startPage = 1
        let endPage = this.totalPages

        if (this.totalPages > maxVisiblePages) {
            const middlePage = Math.floor(maxVisiblePages / 2)

            if (this.currentPage <= middlePage + 1) {
                endPage = maxVisiblePages
            } else if (this.currentPage >= this.totalPages - middlePage) {
                startPage = this.totalPages - maxVisiblePages + 1
            } else {
                startPage = this.currentPage - middlePage
                endPage = this.currentPage + middlePage
            }
        }

        // Generate page buttons
        for (let i = startPage; i <= endPage; i++) {
            pages.push(html`
                <a href="#"
                   class="${i === this.currentPage ? "active" : ""}"
                   @click=${(e: Event) => {
                       e.preventDefault()
                       this._goToPage(i)
                   }}>${i}</a>
            `)
        }

        return html`
            <div class="pagination-container">
                <div class="pagination-info">
                    Hiển thị ${(this.currentPage - 1) * this.pageSize + 1} -
                    ${Math.min(this.currentPage * this.pageSize, this.totalItems)}
                    trên ${this.totalItems} kết quả
                </div>
                <div class="pagination">
                    <a href="#"
                       class="page-nav"
                       ?disabled=${this.currentPage === 1}
                       @click=${(e: Event) => {
                           e.preventDefault()
                           if (this.currentPage > 1) this._goToPage(1)
                       }}>&laquo;</a>
                    <a href="#"
                       class="page-nav"
                       ?disabled=${this.currentPage === 1}
                       @click=${(e: Event) => {
                           e.preventDefault()
                           if (this.currentPage > 1) this._goToPage(this.currentPage - 1)
                       }}>&lt;</a>

                    ${pages}

                    <a href="#"
                       class="page-nav"
                       ?disabled=${this.currentPage === this.totalPages}
                       @click=${(e: Event) => {
                           e.preventDefault()
                           if (this.currentPage < this.totalPages) this._goToPage(this.currentPage + 1)
                       }}>&gt;</a>
                    <a href="#"
                       class="page-nav"
                       ?disabled=${this.currentPage === this.totalPages}
                       @click=${(e: Event) => {
                           e.preventDefault()
                           if (this.currentPage < this.totalPages) this._goToPage(this.totalPages)
                       }}>&raquo;</a>
                </div>
            </div>
        `
    }

    protected _toggleSelectSchedule(id: string) {
        if (this._selectedSchedules.includes(id)) {
            this._selectedSchedules = this._selectedSchedules.filter((sid) => sid !== id)
        } else {
            this._selectedSchedules = [...this._selectedSchedules, id]
        }
    }

    protected _toggleSelectAllSchedules() {
        // Chỉ chọn các id ở trang hiện tại
        const currentPageIds = this._schedules.map((s) => s.id)
        const allSelected = currentPageIds.every((id) => this._selectedSchedules.includes(id))
        if (allSelected) {
            // Bỏ chọn tất cả ở trang hiện tại
            this._selectedSchedules = this._selectedSchedules.filter((id) => !currentPageIds.includes(id))
        } else {
            // Thêm tất cả id ở trang hiện tại vào danh sách đã chọn (không trùng lặp)
            this._selectedSchedules = Array.from(new Set([...this._selectedSchedules, ...currentPageIds]))
        }
    }

    protected _handleBulkAction(active: number) {
        if (this._selectedSchedules.length === 0) {
            this.showNotification("Vui lòng chọn ít nhất 1 kịch bản để thực hiện hành động", true)
            return
        }
        this._bulkUpdateActiveStatus(active)
    }

    protected async _bulkUpdateActiveStatus(active: number) {
        if (this._selectedSchedules.length === 0) return
        this._isLoading = true
        try {
            // Gọi API cập nhật từng kịch bản
            await Promise.all(
                this._selectedSchedules.map(async (id) => {
                    try {
                        // Lấy chi tiết kịch bản để giữ nguyên các trường khác
                        const detail = await manager.rest.api.ScheduleInfoResource.getDetail(id)
                        const schedule = detail.data
                        schedule.active = active
                        await manager.rest.api.ScheduleInfoResource.updateSchedule(schedule)
                    } catch (e) {
                        // Có thể xử lý lỗi riêng từng cái nếu muốn
                    }
                }),
            )
            this.showNotification(`Đã cập nhật trạng thái cho ${this._selectedSchedules.length} kịch bản!`)
            // Nếu kịch bản đang chọn nằm trong danh sách vừa cập nhật, reload lại chi tiết bên phải
            if (this._selectedSchedule && this._selectedSchedules.includes(this._selectedSchedule)) {
                // Tìm component schedule-edit và gọi lại _loadScheduleDetails
                setTimeout(() => {
                    const scheduleEditComponent = this.shadowRoot?.querySelector("schedule-edit") as any
                    if (scheduleEditComponent && scheduleEditComponent._loadScheduleDetails) {
                        scheduleEditComponent._loadScheduleDetails(this._selectedSchedule!)
                    }
                }, 500)
            }
            this._selectedSchedules = []
            await this._loadSchedules()
        } catch (error) {
            this.showNotification("Có lỗi khi cập nhật trạng thái hàng loạt", true)
        } finally {
            this._isLoading = false
        }
    }

    protected _renderScheduleList() {
        return html`
            <div class="schedule-list">
                <div class="header-container">
                    <div class="header">Thiết lập kịch bản</div>
                    <button class="add-button" @click=${this.navigateToCreate}>
                        <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                        Thêm kịch bản
                    </button>
                </div>

                <!-- Table controls with bulk action buttons and page size selector on same row -->
                <div class="table-controls">
                    <div style="display: flex; gap: 8px;">
                        <button @click=${() => this._handleBulkAction(1)} style="background: #4caf50; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">Bật hoạt động</button>
                        <button @click=${() => this._handleBulkAction(0)} style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">Tắt hoạt động</button>
                    </div>
                    <div class="page-size-selector">
                        <span>Hiển thị</span>
                        <select @change=${(e: Event) =>
                                this._handlePageSizeChange({
                                    detail: { value: (e.target as HTMLSelectElement).value },
                                } as CustomEvent)}>
                            <option value="5" ?selected=${this.pageSize === 5}>5</option>
                            <option value="10" ?selected=${this.pageSize === 10}>10</option>
                            <option value="20" ?selected=${this.pageSize === 20}>20</option>
                            <option value="50" ?selected=${this.pageSize === 50}>50</option>
                        </select>
                        <span>mục trên mỗi trang</span>
                    </div>
                </div>

                ${
                        this._schedules && this._schedules.length > 0
                                ? html`
                                    <table>
                                        <thead>
                                        <tr>
                                            <th><input type="checkbox" @change=${() => this._toggleSelectAllSchedules()} .checked=${this._schedules.length > 0 && this._schedules.every((s) => this._selectedSchedules.includes(s.id))}></th>
                                            <th>STT</th>
                                            <th>Mã</th>
                                            <th>Tên kịch bản</th>
                                            <th>Lịch</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${this._schedules.map(
                                                (schedule, index) => {
                                                    const isSelected = String(this._selectedSchedule) === String(schedule.id)
                                                    return html`
                                                    <tr
                                                            class="${isSelected ? "selected-row" : ""}"
                                                            @click=${() => this._handleEdit(schedule.id)}
                                                    >
                                                        <td>
                                                            <input type="checkbox" @click=${(e: Event) => {
                                                                e.stopPropagation()
                                                                this._toggleSelectSchedule(schedule.id)
                                                            }} .checked=${this._selectedSchedules.includes(schedule.id)}>
                                                        </td>
                                                        <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
                                                        <td data-tooltip="${schedule.code}">${schedule.code}</td>
                                                        <td data-tooltip="${schedule.name}">${schedule.name}</td>
                                                        <td>${schedule.type}</td>
                                                        <td>
                                                            <span class="${schedule.active === 1 ? "status-active" : "status-inactive"}">
                                                                ${schedule.active === 1 ? "Hoạt động" : "Không hoạt động"}
                                                            </span>
                                                        </td>
                                                        <td class="action-cell">
                                                            <button class="action-button" @click=${(e) => {
                                                                e.stopPropagation();
                                                                this._handleEdit(schedule.id);
                                                            }}>
                                                                <vaadin-icon icon="vaadin:edit"></vaadin-icon>
                                                            </button>
                                                            <button class="action-button" @click=${(e) => {
                                                                e.stopPropagation(); // Ngăn chặn sự kiện click trên <tr>
                                                                this._handleDelete(schedule.id);
                                                            }}>
                                                                <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    `
                                                }
                                        )}
                                        </tbody>
                                    </table>

                                    <!-- Pagination controls -->
                                    ${this.renderPagination()}
                                `
                                : html`
                                    <p style="margin-top: 20px; text-align: center;">
                                        ${
                                                this._searchTerm
                                                        ? `Không tìm thấy kết quả phù hợp với "${this._searchTerm}"`
                                                        : "Không có dữ liệu kịch bản"
                                        }
                                    </p>
                                `
                }
            </div>
        `
    }
    protected render() {
        const isCreate = window.location.hash.includes("/schedule/create")
        const isEdit = this._selectedSchedule !== null && !isCreate


        return html`
            <div class="container">
                ${this._renderScheduleList()}
                ${
                        isEdit
                                ? html`<schedule-edit
                                        .scheduleId=${this._selectedSchedule}
                                        @save-schedule=${this.handleSaveSchedule}
                                        @cancel=${this.handleCancelEdit}>
                                </schedule-edit>`
                                : isCreate
                                        ? html`<schedule-create
                                                .onSave=${async (schedule) => {
                                                    await this._loadSchedules()
                                                    this.handleCreateSchedule(schedule)
                                                }}
                                                .onCancel=${this.handleCancelEdit}>
                                        </schedule-create>`
                                        : html``
                }

                <!-- Loading overlay -->
                ${
                        this._isLoading
                                ? html`
                                    <div class="loading-overlay">
                                        <div class="loading-spinner"></div>
                                    </div>
                                `
                                : ""
                }
                <vaadin-dialog
                        theme="no-padding"
                        .opened="${this._isDeleteDialogOpen}"
                        @opened-changed="${(e: CustomEvent) => (this._isDeleteDialogOpen = e.detail.value)}"
                        .renderer="${(root: HTMLElement) => {
                            if (root.firstElementChild) return

                            const dialog = document.createElement("div")
                            dialog.style.width = "auto"
                            dialog.style.maxWidth = "100%"
                            dialog.style.borderRadius = "4px"
                            dialog.style.overflow = "hidden"
                            dialog.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)"
                            dialog.style.padding = "0"

                            // Header
                            const header = document.createElement("div")
                            header.style.backgroundColor = "#4d9d2a"
                            header.style.color = "white"
                            header.style.padding = "12px 20px"
                            header.style.fontSize = "18px"
                            header.style.fontWeight = "500"
                            header.style.display = "flex"
                            header.style.justifyContent = "space-between"
                            header.style.alignItems = "center"

                            const titleContainer = document.createElement("div")
                            titleContainer.style.flex = "1"
                            titleContainer.style.textAlign = "center"
                            titleContainer.textContent = "Xác nhận"

                            const closeBtn = document.createElement("span")
                            closeBtn.innerHTML = "✕"
                            closeBtn.style.cursor = "pointer"
                            closeBtn.style.fontSize = "20px"
                            closeBtn.addEventListener("click", () => this._cancelDelete())

                            const placeholder = document.createElement("div")
                            placeholder.style.width = "20px"

                            header.appendChild(placeholder)
                            header.appendChild(titleContainer)
                            header.appendChild(closeBtn)

                            // Message content
                            const content = document.createElement("div")
                            content.style.padding = "20px"
                            content.style.backgroundColor = "white"

                            const message = document.createElement("p")
                            message.style.fontSize = "16px"
                            message.style.margin = "10px 0 20px"

                            const textBefore = document.createTextNode("Bạn có chắc chắn muốn xóa kịch bản ")
                            const boldName = document.createElement("span")
                            boldName.textContent = this._scheduleToDeleteName || ""
                            boldName.style.fontWeight = "bold"
                            const textAfter = document.createTextNode(" này?")

                            message.appendChild(textBefore)
                            message.appendChild(boldName)
                            message.appendChild(textAfter)

                            // Button container
                            const buttonContainer = document.createElement("div")
                            buttonContainer.style.display = "flex"
                            buttonContainer.style.justifyContent = "center"
                            buttonContainer.style.gap = "10px"
                            buttonContainer.style.marginTop = "20px"

                            // Cancel button
                            const btnCancel = document.createElement("button")
                            btnCancel.textContent = "Hủy"
                            btnCancel.style.padding = "8px 20px"
                            btnCancel.style.borderRadius = "4px"
                            btnCancel.style.border = "none"
                            btnCancel.style.backgroundColor = "#e2e2e2"
                            btnCancel.style.cursor = "pointer"
                            btnCancel.addEventListener("click", () => this._cancelDelete())

                            // Delete button
                            const btnConfirm = document.createElement("button")
                            btnConfirm.textContent = "Xóa"
                            btnConfirm.style.padding = "8px 20px"
                            btnConfirm.style.borderRadius = "4px"
                            btnConfirm.style.border = "none"
                            btnConfirm.style.backgroundColor = "#4d9d2a"
                            btnConfirm.style.color = "white"
                            btnConfirm.style.cursor = "pointer"
                            btnConfirm.addEventListener("click", () => this._confirmDelete())

                            // Append elements
                            buttonContainer.appendChild(btnCancel)
                            buttonContainer.appendChild(btnConfirm)
                            content.appendChild(message)
                            content.appendChild(buttonContainer)

                            dialog.appendChild(header)
                            dialog.appendChild(content)
                            root.appendChild(dialog)
                        }}">
                </vaadin-dialog>

                <!-- Notification toast -->
                ${
                        this.notification.show
                                ? html`
                                    <div class="notification ${this.notification.isError ? "error" : "success"}">
                                        ${this.notification.message}
                                    </div>
                                `
                                : ""
                }
            </div>
        `
    }

    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state)
    }

    goToPage(page: number) {
        this._goToPage(page)
    }

    // Add state for tracking save operation
    @state()
    protected _isSaving = false
}
