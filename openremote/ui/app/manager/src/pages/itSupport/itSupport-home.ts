import { css, html } from "lit"
import { customElement, state } from "lit/decorators.js"
import { Page, type PageProvider } from "@openremote/or-app"
import type { AppStateKeyed } from "@openremote/or-app"
import type { Store } from "@reduxjs/toolkit"
import manager from "@openremote/core"
import "@openremote/or-icon"
import "@vaadin/combo-box"
import "@vaadin/button"
import "@vaadin/dialog"
import "@vaadin/icon"
import "@vaadin/icons"
import "./itSupport-detail"
import "./itSupport-create-modal"

const statusMap: { [key: string]: string } = {
    new: "Tạo mới",
    pending: "Đang chờ xử lý",
    inProcess: "Đang xử lý", 
    close: "Hoàn thành",
    cancel: "Đã hủy",
    reopen: "Mở lại yêu cầu",
    // Add possible alternative status values from server
    "PENDING": "Đang chờ xử lý",
    "IN_PROCESS": "Đang xử lý",
    "INPROCESS": "Đang xử lý",
    "NEW": "Tạo mới",
    "CLOSE": "Hoàn thành",
    "CLOSED": "Hoàn thành",
    "CANCEL": "Đã hủy",
    "CANCELLED": "Đã hủy",
    "REOPEN": "Mở lại yêu cầu",
    "REOPENED": "Mở lại yêu cầu",
}

const entityTypeMap: { [key: string]: string } = {
    LightAsset: "Đèn",
    ElectricalCabinetAsset: "Tủ điện", 
    RoadAsset: "Đường",
    LightGroupAsset: "Nhóm đèn",
    FixedGroupAsset: "Nhóm cố định",
    // Add possible alternative entity type values
    "LIGHT_ASSET": "Đèn",
    "ELECTRICAL_CABINET_ASSET": "Tủ điện",
    "ROAD_ASSET": "Đường", 
    "LIGHT_GROUP_ASSET": "Nhóm đèn",
    "FIXED_GROUP_ASSET": "Nhóm cố định",
    // Vietnamese names as keys (in case server returns Vietnamese)
    "Đèn": "Đèn",
    "Tủ điện": "Tủ điện",
    "Đường": "Đường",
    "Nhóm đèn": "Nhóm đèn",
    "Nhóm cố định": "Nhóm cố định",
}

const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
    "Tạo mới": { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    "Hoàn thành": { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    "Đang xử lý": { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
    "Đang chờ xử lý": { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
    "Đã hủy": { bg: "#F8FAFC", text: "#64748B", border: "#CBD5E1" },
    "Mở lại yêu cầu": { bg: "#F0F9FF", text: "#0284C7", border: "#BAE6FD" },
}

interface ITSupportTicket {
    id: string
    name: string
    code: string
    status: string
    entityType: string
    description: string
    note: string
    createdAt: number
    createdByName: string
    assignUserName: string
    assignedUser: string
    attachments: any[]
}

export function pageitSupportProvider(
    store: Store<AppStateKeyed>,
    config?: ItSupportHome,
): PageProvider<AppStateKeyed> {
    return {
        name: "itSupportHome",
        routes: ["it-support", "it-support/:id", "it-support/create", "it-support/edit"],
        pageCreator: () => {
            const page = new ItSupportHome(store)
            return page
        },
    }
}

@customElement("page-home-itsupport")
export class ItSupportHome extends Page<AppStateKeyed> {
    @state() filteredTickets: ITSupportTicket[] = []
    @state() loading = false
    @state() searchKeyword = ""
    @state() selectedStatus = ""
    @state() selectedType = ""
    @state() selectedHandler = ""
    @state() showCreateModal = false
    @state() showDeleteDialog = false
    @state() itemToDelete: any = null
    @state() tickets: ITSupportTicket[] = []
    @state() realmSelected = sessionStorage.getItem("realmSelected") || "default"
    @state() pageSize = 10
    @state() currentPage = 1
    @state() totalItems = 0
    @state() totalPages = 1
    @state() notification = {
        message: "",
        isError: false,
        visible: false,
    }

    static get styles() {
        return css`
            :host {
                display: inline-block !important;
                font-family: Roboto;
                background-color: #F8FAFC;
                min-height: 100vh;
            }

            /* Header styles matching light interface */
            .header-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
                padding: 0 20px;
            }

            .page-title {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #1F2937;
            }

            .action-buttons {
                display: flex;
                gap: 12px;
            }

            /* Button styles - green theme */
            vaadin-button[theme="primary"] {
                --vaadin-button-primary-background: #4D9D2A;
                --vaadin-button-primary-background-hover: #3D7D1A;
                --vaadin-button-primary-background-active: #2D5D0A;
            }

            vaadin-button {
                --vaadin-button-background: #4D9D2A;
                --vaadin-button-background-hover: #3D7D1A;
                --vaadin-button-text-color: white;
                border-radius: 6px;
                font-weight: 500;
            }

            /* Enhanced Filter section */
            .filters-section {
                background: white;
                margin: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .filter-header {
                background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
                color: white;
                padding: 16px 24px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filter-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filter-content {
                padding: 24px;
            }

            .search-container {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                align-items: flex-end;
            }

            .search-group {
                flex: 1;
                display: flex;
                flex-direction: column;
            }

            .search-label {
                font-size: 12px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .search-input {
                padding: 12px 16px;
                border: 2px solid #E5E7EB;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s ease;
                background: #F9FAFB;
            }

            .search-input:focus {
                outline: none;
                border-color: #4D9D2A;
                box-shadow: 0 0 0 3px rgba(77, 157, 42, 0.1);
                background: white;
            }

            .search-button {
                padding: 12px 20px;
                background: #4D9D2A;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(77, 157, 42, 0.3);
            }

            .search-button:hover {
                background: #3D7D1A;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(77, 157, 42, 0.4);
            }

            .filter-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 8px;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
            }

            .filter-label {
                font-size: 12px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            vaadin-combo-box {
                --vaadin-combo-box-overlay-max-height: 200px;
                --vaadin-input-field-border-color: #E5E7EB;
                --vaadin-input-field-hover-highlight-color: #4D9D2A;
                --vaadin-input-field-focus-ring-color: rgba(77, 157, 42, 0.3);
                --vaadin-input-field-background: #F9FAFB;
            }

            /* Table styles matching light interface */
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                background: white;
                border-radius: 8px;
                overflow: hidden;
            }

            th, td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #E5E7EB;
            }

            th {
                background-color: #4D9D2A;
                color: white;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            tr {
                background: white;
            }

            tr:hover {
                background-color: #F9FAFB;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                display: inline-block;
                border: 1px solid;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            /* Action icons matching light interface */
            .action-icons {
                display: flex;
                justify-content: center;
                gap: 8px;
            }

            vaadin-icon {
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            vaadin-icon:hover {
                background-color: #F3F4F6;
                transform: scale(1.1);
            }

            vaadin-icon[icon="vaadin:eye"] {
                color: black;
            }

            vaadin-icon[icon="vaadin:pencil"] {
                color: black;
            }

            vaadin-icon[icon="vaadin:trash"] {
                color: black;
            }

            /* Pagination matching light interface */
            .pagination-container {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                margin-top: 20px;
                padding: 0 20px;
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

            /* Notification styles */
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease-out forwards;
            }

            .notification.success {
                background-color: #10B981;
            }

            .notification.error {
                background-color: #EF4444;
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

            /* Loading state */
            .loading-container {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 40px;
                color: #6B7280;
            }

            .empty-state {
                text-align: center;
                padding: 40px;
                color: #6B7280;
            }

            /* Enhanced Mobile responsive */
            @media (max-width: 768px) {
                .header-container {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                    padding: 16px;
                }

                .filters-section {
                    margin: 16px;
                }

                .filter-content {
                    padding: 16px;
                }

                .search-container {
                    flex-direction: column;
                    gap: 16px;
                }

                .filter-row {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .action-buttons {
                    justify-content: center;
                }

                table {
                    font-size: 12px;
                }

                th, td {
                    padding: 8px 4px;
                }

                .pagination {
                    justify-content: center;
                }

                .page-info {
                    text-align: center;
                }
            }
        `
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store)
        this.filteredTickets = this.tickets
    }

    get name() {
        return "itSupportHome"
    }

    connectedCallback() {
        super.connectedCallback()
        this.fetchTickets()
        window.addEventListener("it-support-updated", this.handleTicketUpdated)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener("it-support-updated", this.handleTicketUpdated)
    }

    handleTicketUpdated = () => {
        this.fetchTickets()
    }

    async fetchTickets() {
        this.loading = true
        try {
            // Fetch all data without server-side filtering
            const filterDTO = {
                page: 1,
                size: 100000,
                keyWord: "", // Don't filter on server side
                data: {},
            }
            const response = await manager.rest.api.ItSupportResource.getAll(filterDTO, {
                params: { realm: this.realmSelected },
            })
            const allItems = Array.isArray(response.data) ? response.data : []
            if (allItems) {
                this.tickets = allItems.map((item: any, idx: number) => ({
                    id: item.id?.toString() || (item.code ? item.code : idx.toString()),
                    name: item.name || "",
                    code: item.code || "",
                    status: item.status || "new",
                    entityType: item.entityType || "LightAsset",
                    description: item.description || "",
                    note: item.note || "",
                    createdAt: item.createdAt || Date.now(),
                    createdByName: item.createdByName || "",
                    assignUserName: item.assignUserName || "",
                    assignedUser: item.assignedUser || "",
                    attachments: item.attachments || [],
                }))
                console.log("Fetched tickets:", this.tickets) // Debug log
                
                // Debug: Log unique status and entityType values from server
                const uniqueStatuses = [...new Set(this.tickets.map(t => t.status))]
                const uniqueEntityTypes = [...new Set(this.tickets.map(t => t.entityType))]
                const uniqueHandlers = [...new Set([
                    ...this.tickets.map(t => t.assignUserName).filter(Boolean),
                    ...this.tickets.map(t => t.createdByName).filter(Boolean)
                ])]
                
                console.log("=== SERVER DATA DEBUG ===")
                console.log("Unique statuses from server:", uniqueStatuses)
                console.log("Unique entity types from server:", uniqueEntityTypes)  
                console.log("Unique handlers from server:", uniqueHandlers)
                console.log("Status map keys:", Object.keys(statusMap))
                console.log("Entity type map keys:", Object.keys(entityTypeMap))
                console.log("===========================")
                
                this.applyFilters()
            } else {
                this.tickets = []
                this.applyFilters()
            }
        } catch (e) {
            console.error("Error fetching tickets:", e)
            this.showNotification("Có lỗi xảy ra khi tải dữ liệu", true)
            this.tickets = []
            this.applyFilters()
        } finally {
            this.loading = false
        }
    }

    applyFilters() {
        let filtered = [...this.tickets]
        
        console.log("Apply filters - Initial tickets:", this.tickets.length)
        console.log("Selected status:", this.selectedStatus)
        console.log("Selected type:", this.selectedType)
        console.log("Selected handler:", this.selectedHandler)
        console.log("Search keyword:", this.searchKeyword)

        if (this.searchKeyword) {
            const keyword = this.searchKeyword.toLowerCase()
            filtered = filtered.filter(
                (ticket) => 
                    ticket.name.toLowerCase().includes(keyword) || 
                    ticket.code.toLowerCase().includes(keyword) ||
                    ticket.description.toLowerCase().includes(keyword)
            )
            console.log("After search filter:", filtered.length)
        }

        if (this.selectedStatus !== "") {
            // Find all possible keys that map to the selected display value
            const statusKeys = Object.keys(statusMap).filter((key) => statusMap[key] === this.selectedStatus)
            console.log("Status keys found:", statusKeys, "for display value:", this.selectedStatus)
            if (statusKeys.length > 0) {
                const beforeFilter = filtered.length
                filtered = filtered.filter((ticket) => {
                    const matchesAnyKey = statusKeys.some(key => 
                        ticket.status === key || 
                        ticket.status?.toLowerCase() === key.toLowerCase() ||
                        ticket.status?.toUpperCase() === key.toUpperCase()
                    )
                    console.log(`Ticket ${ticket.code} status: "${ticket.status}" matches any of [${statusKeys.join(', ')}]?`, matchesAnyKey)
                    return matchesAnyKey
                })
                console.log(`After status filter: ${beforeFilter} -> ${filtered.length}`)
            }
        }

        if (this.selectedType) {
            // Find all possible keys that map to the selected display value
            const typeKeys = Object.keys(entityTypeMap).filter((key) => entityTypeMap[key] === this.selectedType)
            console.log("Type keys found:", typeKeys, "for display value:", this.selectedType)
            if (typeKeys.length > 0) {
                const beforeFilter = filtered.length
                filtered = filtered.filter((ticket) => {
                    const matchesAnyKey = typeKeys.some(key => 
                        ticket.entityType === key || 
                        ticket.entityType?.toLowerCase() === key.toLowerCase() ||
                        ticket.entityType?.toUpperCase() === key.toUpperCase()
                    )
                    console.log(`Ticket ${ticket.code} entityType: "${ticket.entityType}" matches any of [${typeKeys.join(', ')}]?`, matchesAnyKey)
                    return matchesAnyKey
                })
                console.log(`After type filter: ${beforeFilter} -> ${filtered.length}`)
            }
        }

        if (this.selectedHandler) {
            const beforeFilter = filtered.length
            console.log("Selected handler:", this.selectedHandler)
            const selectedHandlerTrimmed = this.selectedHandler.trim()
            filtered = filtered.filter((ticket) => {
                const assignUser = (ticket.assignUserName || "").trim()
                const createdBy = (ticket.createdByName || "").trim()
                
                // Exact match first
                const exactMatchAssign = assignUser === selectedHandlerTrimmed
                const exactMatchCreated = createdBy === selectedHandlerTrimmed
                
                // Case insensitive match
                const caseInsensitiveMatchAssign = assignUser.toLowerCase() === selectedHandlerTrimmed.toLowerCase()
                const caseInsensitiveMatchCreated = createdBy.toLowerCase() === selectedHandlerTrimmed.toLowerCase()
                
                const matches = exactMatchAssign || exactMatchCreated || caseInsensitiveMatchAssign || caseInsensitiveMatchCreated
                
                if (assignUser.includes(selectedHandlerTrimmed) || createdBy.includes(selectedHandlerTrimmed) || matches) {
                    console.log(`Ticket ${ticket.code}: assignUser="${assignUser}" createdBy="${createdBy}" selected="${selectedHandlerTrimmed}" matches=${matches}`)
                }
                
                return matches
            })
            console.log(`After handler filter: ${beforeFilter} -> ${filtered.length}`)
        }

        this.filteredTickets = filtered
        this.totalItems = filtered.length
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1
        
        // Reset to page 1 if current page exceeds total pages after filtering
        if (this.currentPage > this.totalPages) {
            this.currentPage = 1
        }
        
        console.log("Final filtered tickets:", this.filteredTickets.length)
    }

    handleSearch() {
        this.currentPage = 1
        this.applyFilters()
    }

    handleSearchInput(e: Event) {
        this.searchKeyword = (e.target as HTMLInputElement).value
    }

    handleStatusChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return
        const value = (e as any).detail?.value
        if (value === undefined || value === null) return // ignore blur
        this.selectedStatus = value || ""
        this.currentPage = 1 // Reset to page 1 when filter changes
        this.applyFilters()
    }

    handleTypeChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return
        const value = (e as any).detail?.value
        if (value === undefined || value === null) return // ignore blur
        this.selectedType = value || ""
        this.currentPage = 1 // Reset to page 1 when filter changes
        this.applyFilters()
    }

    handleHandlerChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return
        const value = (e as any).detail?.value
        if (value === undefined || value === null) return // ignore blur
        this.selectedHandler = value || ""
        this.currentPage = 1 // Reset to page 1 when filter changes
        this.applyFilters()
    }

    handleCreateTicket = async (ticket: any) => {
        this.showCreateModal = false
        if (ticket && ticket.name && ticket.description) {
            await this.fetchTickets()
            this.showNotification("Tạo yêu cầu thành công!", false)
        }
    }

    handleViewTicket(ticketId: string) {
        window.location.hash = `/it-support/edit?id=${ticketId}&mode=view`
    }

    handleEditTicket(ticketId: string) {
        window.location.hash = `/it-support/edit?id=${ticketId}&mode=edit`
    }

    handleDeleteTicket(ticketId: string) {
        const ticket = this.tickets.find((t) => t.id === ticketId)
        if (ticket) {
            this.itemToDelete = ticket
            this.showDeleteDialog = true
        }
    }

    async confirmDelete() {
        if (!this.itemToDelete) return
        try {
            this.tickets = this.tickets.filter((ticket) => ticket.id !== this.itemToDelete.id)
            this.applyFilters()
            this.showNotification("Xóa yêu cầu thành công!", false)
            this.showDeleteDialog = false
            this.itemToDelete = null
            if (this.currentPage > this.totalPages) {
                this.currentPage = 1
            }
        } catch (error) {
            console.error("Error deleting ticket:", error)
            this.showNotification("Có lỗi xảy ra khi xóa yêu cầu", true)
        }
    }

    cancelDelete() {
        this.showDeleteDialog = false
        this.itemToDelete = null
    }

    handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
            this.currentPage = newPage
        }
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
        }, 4000)
    }

    formatDate(timestamp: number) {
        const date = new Date(timestamp)
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
    }

    getStatusDisplay(status: string) {
        return statusMap[status] || status
    }

    getStatusColor(status: string) {
        const statusText = this.getStatusDisplay(status)
        return statusColors[statusText] || statusColors["Tạo mới"]
    }

    getEntityTypeDisplay(entityType: string) {
        return entityTypeMap[entityType] || entityType
    }

    getUniqueHandlers() {
        const handlers = new Set<string>()
        this.tickets.forEach((ticket) => {
            if (ticket.assignUserName) handlers.add(ticket.assignUserName)
            if (ticket.createdByName) handlers.add(ticket.createdByName)
        })
        return Array.from(handlers).sort()
    }

    // Helper method to get unique statuses for debugging
    getUniqueStatuses() {
        return [...new Set(this.tickets.map(t => t.status))].sort()
    }

    // Helper method to get unique entity types for debugging  
    getUniqueEntityTypes() {
        return [...new Set(this.tickets.map(t => t.entityType))].sort()
    }

    // Helper method to clear all filters for debugging
    clearAllFilters() {
        this.selectedStatus = ""
        this.selectedType = ""
        this.selectedHandler = ""
        this.searchKeyword = ""
        this.currentPage = 1
        this.applyFilters()
    }

    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.pageSize
        const end = start + this.pageSize
        return this.filteredTickets.slice(start, end)
    }

    renderPagination() {
        const pages = []
        const maxVisiblePages = 3

        // First page button
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

        // Previous button
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

        // Page numbers
        const startPage = this.currentPage
        const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)

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

        // Show ellipsis and last page if needed
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

        // Next button
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

        // Last page button
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

    render() {
        // Check if we should render the detail component
        if (window.location.hash.includes("/it-support/edit") || window.location.hash.match(/\/it-support\/[^/]+$/)) {
            return html`<it-support-detail></it-support-detail>`
        }

        const uniqueHandlers = this.getUniqueHandlers()
        const statusOptions = [...Object.values(statusMap)]
        const typeOptions = [...Object.values(entityTypeMap)]
        const handlerOptions = [...uniqueHandlers]
        const pageData = this.getCurrentPageData()

        return html`
            <div>
                <!-- Header matching light interface -->
                <div class="header-container">
                    <h1 class="page-title">Quản lý yêu cầu hỗ trợ</h1>
                    <div class="action-buttons">
                        <vaadin-button theme="primary" @click="${() => (this.showCreateModal = true)}">
                            <or-icon icon="plus" slot="prefix"></or-icon>
                            Tạo yêu cầu mới
                        </vaadin-button>
                    </div>
                </div>

                <!-- Enhanced Filters Section -->
                <div class="filters-section">
                    <div class="filter-header">
                        <or-icon icon="filter"></or-icon>
                        <div class="filter-title">Bộ lọc tìm kiếm</div>
                    </div>

                    <div class="filter-content">
                        <div class="search-container">
                            <div class="search-group">
                                <div class="search-label">Từ khóa tìm kiếm</div>
                                <input
                                        class="search-input"
                                        placeholder="Nhập tên hoặc mã yêu cầu..."
                                        .value="${this.searchKeyword}"
                                        @input="${this.handleSearchInput}"
                                        @keyup="${(e: KeyboardEvent) => e.key === "Enter" && this.handleSearch()}"
                                >
                            </div>
                            <button class="search-button" @click="${this.handleSearch}">
                                <or-icon icon="search"></or-icon>
                                Tìm kiếm
                            </button>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <div class="filter-label">Trạng thái</div>
                                <vaadin-combo-box
                                        .items="${statusOptions}"
                                        .value="${this.selectedStatus}"
                                        @value-changed="${this.handleStatusChange}"
                                        placeholder="Tất cả trạng thái"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>

                            <div class="filter-group">
                                <div class="filter-label">Loại tài sản</div>
                                <vaadin-combo-box
                                        .items="${typeOptions}"
                                        .value="${this.selectedType}"
                                        @value-changed="${this.handleTypeChange}"
                                        placeholder="Tất cả loại tài sản"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>

                            <div class="filter-group">
                                <div class="filter-label">Người xử lý</div>
                                <vaadin-combo-box
                                        .items="${handlerOptions}"
                                        .value="${this.selectedHandler}"
                                        @value-changed="${this.handleHandlerChange}"
                                        placeholder="Tất cả người xử lý"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div style="padding: 0 20px;">
                    ${
                            this.loading
                                    ? html`<div class="loading-container">Đang tải dữ liệu...</div>`
                                    : pageData.length === 0
                                            ? html`<div class="empty-state">Không có dữ liệu</div>`
                                            : html`
                                                <table>
                                                    <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>MÃ YÊU CẦU</th>
                                                        <th>TÊN YÊU CẦU</th>
                                                        <th>LOẠI TÀI SẢN</th>
                                                        <th>TRẠNG THÁI</th>
                                                        <th>NGƯỜI XỬ LÝ</th>
                                                        <th>NGÀY TẠO</th>
                                                        <th>THAO TÁC</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    ${pageData.map((ticket, idx) => {
                                                        const statusColor = this.getStatusColor(ticket.status)
                                                        const stt = (this.currentPage - 1) * this.pageSize + idx + 1
                                                        return html`
                                                            <tr>
                                                                <td>${stt}</td>
                                                                <td><strong>${ticket.code}</strong></td>
                                                                <td>${ticket.name}</td>
                                                                <td>${this.getEntityTypeDisplay(ticket.entityType)}</td>
                                                                <td>
                                                        <span class="status-badge" style="background-color: ${statusColor.bg}; color: ${statusColor.text}; border-color: ${statusColor.border};">
                                                            ${this.getStatusDisplay(ticket.status)}
                                                        </span>
                                                                </td>
                                                                <td>${ticket.assignUserName || ticket.createdByName || "Chưa phân công"}</td>
                                                                <td>${this.formatDate(ticket.createdAt)}</td>
                                                                <td>
                                                                    <div class="action-icons">
                                                                        <vaadin-icon
                                                                                icon="vaadin:eye"
                                                                                @click="${() => this.handleViewTicket(ticket.id)}"
                                                                                title="Xem chi tiết"
                                                                        ></vaadin-icon>
                                                                        <vaadin-icon
                                                                                icon="vaadin:pencil"
                                                                                @click="${() => this.handleEditTicket(ticket.id)}"
                                                                                title="Chỉnh sửa"
                                                                        ></vaadin-icon>
                                                                        <vaadin-icon
                                                                                icon="vaadin:trash"
                                                                                @click="${() => this.handleDeleteTicket(ticket.id)}"
                                                                                title="Xóa"
                                                                        ></vaadin-icon>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        `
                                                    })}
                                                    </tbody>
                                                </table>
                                                ${this.renderPagination()}
                                            `
                    }
                </div>
            </div>

            <!-- Delete Confirmation Dialog -->
            <vaadin-dialog
                    theme="no-padding"
                    .opened="${this.showDeleteDialog}"
                    @opened-changed="${(e: CustomEvent) => (this.showDeleteDialog = e.detail.value)}"
                    .renderer="${(root: HTMLElement) => {
                        if (root.firstElementChild) return
                        const dialog = document.createElement("div")
                        dialog.style.cssText =
                                "width: auto; max-width: 100%; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); padding: 0;"

                        const header = document.createElement("div")
                        header.style.cssText =
                                "background-color: #5cb85c; color: white; padding: 12px 20px; font-size: 18px; font-weight: 500; display: flex; justify-content: space-between; align-items: center;"

                        const titleContainer = document.createElement("div")
                        titleContainer.style.cssText = "flex: 1; text-align: center;"
                        titleContainer.textContent = "Xác nhận xóa"

                        const closeBtn = document.createElement("span")
                        closeBtn.innerHTML = "✕"
                        closeBtn.style.cssText = "cursor: pointer; font-size: 20px;"
                        closeBtn.addEventListener("click", () => this.cancelDelete())

                        const placeholder = document.createElement("div")
                        placeholder.style.width = "20px"

                        header.appendChild(placeholder)
                        header.appendChild(titleContainer)
                        header.appendChild(closeBtn)

                        const content = document.createElement("div")
                        content.style.cssText = "padding: 20px; background-color: white;"

                        const message = document.createElement("p")
                        message.style.cssText = "font-size: 16px; margin: 10px 0 20px;"
                        message.innerHTML = `Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ <strong>"${this.itemToDelete?.name || ""}"</strong> này không?`

                        const buttonContainer = document.createElement("div")
                        buttonContainer.style.cssText = "display: flex; justify-content: center; gap: 10px; margin-top: 20px;"

                        const btnCancel = document.createElement("button")
                        btnCancel.textContent = "Hủy"
                        btnCancel.style.cssText =
                                "padding: 8px 20px; border-radius: 4px; border: none; background-color: #e2e2e2; cursor: pointer;"
                        btnCancel.addEventListener("click", () => this.cancelDelete())

                        const btnConfirm = document.createElement("button")
                        btnConfirm.textContent = "Xóa"
                        btnConfirm.style.cssText =
                                "padding: 8px 20px; border-radius: 4px; border: none; background-color: #5cb85c; color: white; cursor: pointer;"
                        btnConfirm.addEventListener("click", () => this.confirmDelete())

                        buttonContainer.appendChild(btnCancel)
                        buttonContainer.appendChild(btnConfirm)
                        content.appendChild(message)
                        content.appendChild(buttonContainer)
                        dialog.appendChild(header)
                        dialog.appendChild(content)
                        root.appendChild(dialog)
                    }}"
            ></vaadin-dialog>

            <!-- Notification -->
            ${
                    this.notification.visible
                            ? html`<div class="notification ${this.notification.isError ? "error" : "success"}">
                                ${this.notification.message}
                            </div>`
                            : ""
            }

            <!-- Create Ticket Modal -->
            ${
                    this.showCreateModal
                            ? html`<it-support-create-modal
                                    .open=${true}
                                    @close="${() => (this.showCreateModal = false)}"
                                    @created="${(e: CustomEvent) => this.handleCreateTicket(e.detail)}"
                            ></it-support-create-modal>`
                            : ""
            }
        `
    }

    stateChanged(state: AppStateKeyed) {}
}
