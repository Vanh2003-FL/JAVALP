import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import manager from "@openremote/core"
import "./district/district-create"
import "@vaadin/dialog"
import "@vaadin/button"
import "@vaadin/text-field"
import "@vaadin/select"

@customElement("master-data-page2")
export class MyElement extends LitElement {
    @state() private editedDistrict = { id: "", name: "", district: "", status: "", createdBy: "", createdDate: "" }
    @state() items = []
    @state() private currentPage = 1
    @state() private pageSize = 5
    @state() private totalItems = 0
    @state() private totalPages = 0
    @state() private isDeleteDialogOpen = false
    @state() private selectedItemId = null
    @state() private selectedItemName = ""
    @state() private provinceMap: Map<number, string> = new Map()
    @state() private searchTerm = ""
    @state() private isLoading = false
    @state() private errorMessage = ""

    @state() private notification = { show: false, message: "", isError: false }

    static styles = css`
        :host {
            display: block;
            padding: 20px;
            font-size: 24px;
            text-align: center;
            position: relative;
        }
        .top-content, .mid-content {
            display: flex;
            background: white;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding: 0 20px;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        th, td {
            font-size: 16px;
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #e8ebef;
            text-align: center;
            color: #5d6a79;
        }
        tr {
            background: white;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        ul li {
            display: inline;
            margin: 0 5px;
        }
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
            background-color: #4caf50;
            color: white;
            border-color: #4caf50;
        }
        .pagination a.page-nav {
            background-color: #f8f9fa;
        }
        .pagination a:hover:not([disabled]):not(.active) {
            background-color: #f1f1f1;
        }
        vaadin-button, or-icon {
            cursor: pointer;
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

        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: #666;
        }

        .empty-state-icon {
            font-size: 48px;
            color: #ccc;
            margin-bottom: 16px;
        }

        .empty-state-message {
            font-size: 16px;
            margin-bottom: 20px;
        }

        /* Error message */
        .error-message {
            background-color: #fef2f2;
            color: #e74c3c;
            padding: 12px 16px;
            border-radius: 4px;
            margin: 16px 0;
            display: flex;
            align-items: center;
        }

        .error-message or-icon {
            margin-right: 8px;
        }

        /* Table controls */
        .table-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            width: 100%;
        }

        .page-size-selector {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;
        }

        .page-size-selector select {
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        /* Dialog styles */
        .delete-dialog {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 400px;
            border-radius: 4px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .delete-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #4D9D2A;
            color: white;
            padding: 12px 16px;
        }

        .delete-dialog-title {
            font-weight: 500;
            font-size: 16px;
        }

        .delete-dialog-close {
            cursor: pointer;
            font-weight: bold;
            padding: 4px;
        }

        .delete-dialog-content {
            padding: 20px;
            text-align: center;
        }

        .delete-dialog-content p {
            margin-bottom: 20px;
            font-size: 16px;
        }

        .delete-dialog-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 20px;
        }

        /* Custom button styles for the dialog */
        .btn-cancel {
            background-color: #e0e0e0;
            color: #333;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            min-width: 80px;
        }

        .btn-delete {
            background-color: #4D9D2A;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            min-width: 80px;
        }

        /* Override vaadin-dialog-overlay styles */
        vaadin-dialog-overlay::part(overlay) {
            padding: 0;
            background: transparent;
        }

        vaadin-dialog-overlay::part(content) {
            padding: 0;
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
            max-width: 250px; /* Limit width */
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out forwards;
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

    async loadProvinces() {
        try {
            const filterDTO = {
                page: 1,
                size: 1000, // Large enough to get all provinces
                sort: ["id,asc"],
                data: {},
            }

            const response = await manager.rest.api.ProvinceResource.getAll(filterDTO)

            if (response?.data) {
                // Create a mapping of province_id to province_name
                this.provinceMap.clear()
                response.data.forEach((province) => {
                    this.provinceMap.set(province.id, province.name)
                })
                console.log("Province mapping created:", this.provinceMap)
            }
        } catch (error) {
            console.error("Error loading provinces:", error)
            this.errorMessage = "Không thể tải dữ liệu tỉnh/thành phố. Vui lòng thử lại sau."
        }
    }

    // Add notification method
    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError }

        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 3000)
    }

    handleSearch() {
        const searchField = this.shadowRoot?.querySelector('vaadin-text-field[aria-label="search"]') as any
        if (searchField) {
            this.searchTerm = searchField.value || ""
            this.currentPage = 1
            this.loadData(1)
        }
    }

    clearSearch() {
        this.searchTerm = ""
        const searchField = this.shadowRoot?.querySelector('vaadin-text-field[aria-label="search"]') as any
        if (searchField) {
            searchField.value = ""
        }
        this.loadData(1)
    }

    firstUpdated() {
        this.loadProvinces().then(() => {
            this.loadData(1)
        })
    }

    loadData(page = 1) {
        this.isLoading = true
        this.errorMessage = ""
        this.currentPage = page

        const searchFilter: any = {}
        if (this.searchTerm.trim()) {
            // Use simple search format that the server understands
            searchFilter.name = this.searchTerm.trim()
        }

        // Log the filter for debugging
        console.log("Search filter:", JSON.stringify(searchFilter))

        // Direct approach: Fetch all data matching the filter without pagination first
        const allDataFilterDTO = {
            page: 1,
            size: 1000, // Large enough to get all matching items
            data: searchFilter,
        }
        manager.rest.api.DistrictResource.getData(allDataFilterDTO)
            .then((response) => {
                // Calculate total items from the actual filtered results
                const allMatchingData = response?.data || []
                this.totalItems = allMatchingData.length
                this.totalPages = Math.ceil(this.totalItems / this.pageSize)

                // Adjust current page if necessary
                if (this.totalPages === 0) {
                    this.currentPage = 1
                } else if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages
                }

                console.log(
                    `Searching with term: "${this.searchTerm}", Total matching items: ${this.totalItems}, Current page: ${this.currentPage}, Total pages: ${this.totalPages}`,
                )

                // If we already have all the data, just slice it for the current page
                // instead of making another API call
                const startIndex = (this.currentPage - 1) * this.pageSize
                const endIndex = Math.min(startIndex + this.pageSize, allMatchingData.length)
                const pageData = allMatchingData.slice(startIndex, endIndex)

                // Process the data for the current page
                this.items = pageData.map((item: any) => {
                    const provinceId = item.provinceId
                    const provinceName =
                        provinceId !== undefined
                            ? this.provinceMap.get(Number(provinceId)) || "Unknown Province"
                            : "Unknown Province"

                    let formattedDate = "N/A"
                    if (item.createDate) {
                        const date = new Date(item.createDate)
                        const day = date.getDate().toString().padStart(2, "0")
                        const month = (date.getMonth() + 1).toString().padStart(2, "0")
                        const year = date.getFullYear()
                        const hours = date.getHours().toString().padStart(2, "0")
                        const minutes = date.getMinutes().toString().padStart(2, "0")
                        const seconds = date.getSeconds().toString().padStart(2, "0")
                        formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
                    }

                    return {
                        id: item.id,
                        provinceId: provinceId,
                        provinceName: provinceName,
                        name: provinceName,
                        district: item.name,
                        status: item.active === 1 ? "Hoạt động" : "Không hoạt động",
                        createdBy: item.createBy || "Không xác định",
                        createdDate: formattedDate,
                    }
                })

                console.log(
                    `Page ${this.currentPage}/${this.totalPages}, Total items: ${this.totalItems}, Search term: "${this.searchTerm}", Items on page: ${this.items.length}`,
                )
                this.isLoading = false
            })
            .catch((error) => {
                console.error("Lỗi khi lấy danh sách huyện:", error)
                this.items = []
                this.totalItems = 0
                this.totalPages = 0
                this.isLoading = false
                this.errorMessage = "Không thể tải dữ liệu. Vui lòng thử lại sau."
            })
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return
        }
        this.loadData(page)
    }

    prevPage() {
        this.goToPage(this.currentPage - 1)
    }

    nextPage() {
        this.goToPage(this.currentPage + 1)
    }

    updatePageSize(newSize: number) {
        this.pageSize = newSize
        localStorage.setItem("districtListPageSize", newSize.toString())
        this.currentPage = 1
        this.loadData(1)
    }

    connectedCallback() {
        super.connectedCallback()

        // Load user preferences
        const savedPageSize = localStorage.getItem("districtListPageSize")
        if (savedPageSize) {
            this.pageSize = Number.parseInt(savedPageSize, 10)
        }

        const params = new URLSearchParams(window.location.hash.split("?")[1])
        this.editedDistrict = {
            id: params.get("id") || "",
            name: params.get("name") || "",
            district: params.get("district") || "",
            status: params.get("status") === "Hoạt động" ? "1" : "0",
            createdBy: params.get("createdBy") || "",
            createdDate: params.get("createdDate") || "",
        }
    }

    // Replace the handleOutsideClick method with this improved version
    handleOutsideClick(e: Event) {
        // We need to properly reset the state when clicking outside
        this.isDeleteDialogOpen = false
        this.selectedItemId = null

        // Make sure we're not preventing the default behavior in a way that breaks future interactions
        // We don't need to call preventDefault here
    }

    // Also update the openDeleteDialog method to ensure it always works
    openDeleteDialog(itemId) {
        // Force reset the state before opening to ensure it always works
        this.isDeleteDialogOpen = false

        // Use setTimeout to ensure the state is updated in the next event cycle
        setTimeout(() => {
            this.selectedItemId = itemId
            const selectedItem = this.items.find((item) => item.id === itemId)
            if (selectedItem) {
                this.selectedItemName = selectedItem.district
            }
            this.isDeleteDialogOpen = true
        }, 0)
    }

    cancelDelete() {
        this.isDeleteDialogOpen = false
        this.selectedItemId = null
    }

    confirmDelete() {
        if (this.selectedItemId) {
            this.isLoading = true

            // Get the district name before deletion for the success message
            const districtToDelete = this.items.find((item) => item.id === this.selectedItemId)
            const districtName = districtToDelete ? districtToDelete.district : ""

            manager.rest.api.DistrictResource.remove({ id: this.selectedItemId })
                .then(() => {
                    this.isDeleteDialogOpen = false
                    this.selectedItemId = null
                    this.loadData(this.currentPage)
                    // Show success notification
                    this.showNotification("Xóa quận/huyện thành công", false)
                })
                .catch((error) => {
                    console.error("Lỗi khi xóa huyện:", error)
                    this.isLoading = false
                    this.errorMessage = "Không thể xóa huyện. Vui lòng thử lại sau."
                    // Show error notification
                    this.showNotification("Lỗi khi xóa quận/huyện", true)
                    // Close the dialog but keep the error message visible
                    this.isDeleteDialogOpen = false
                })
        }
    }

    getSelectedDistrictName() {
        if (this.selectedItemId) {
            const selectedItem = this.items.find((item) => item.id === this.selectedItemId)
            return selectedItem ? selectedItem.district : ""
        }
        return ""
    }

    navigateToCreate() {
        window.location.hash = "/master-data/district-create"
    }

    navigateToEdit(item: any) {
        const params = new URLSearchParams()
        params.append("id", item.id)
        params.append("name", item.name)
        params.append("district", item.district)
        params.append("status", item.status === "Hoạt động" ? "1" : "0")
        params.append("createdBy", item.createdBy)
        params.append("createdDate", item.createdDate)
        params.append("provinceId", item.provinceId)
        window.location.hash = `/master-data/district-edit?${params.toString()}`
    }

    renderPagination() {
        if (this.totalPages <= 1) {
            return html``
        }

        const pages = []
        const maxVisiblePages = 5

        // Calculate start and end pages more intelligently
        let startPage, endPage

        if (this.totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than maxVisiblePages
            startPage = 1
            endPage = this.totalPages
        } else {
            // Calculate pages to show based on current page position
            const middlePage = Math.floor(maxVisiblePages / 2)

            if (this.currentPage <= middlePage + 1) {
                // Near the beginning
                startPage = 1
                endPage = maxVisiblePages
            } else if (this.currentPage >= this.totalPages - middlePage) {
                // Near the end
                startPage = this.totalPages - maxVisiblePages + 1
                endPage = this.totalPages
            } else {
                // In the middle
                startPage = this.currentPage - middlePage
                endPage = this.currentPage + middlePage
            }
        }

        // Always show first page
        if (startPage > 1) {
            pages.push(html`
                <li><a href="#" @click=${(e: Event) => {
                    e.preventDefault()
                    this.goToPage(1)
                }}>1</a></li>
            `)

            if (startPage > 2) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`)
            }
        }

        // Add visible page links
        for (let i = startPage; i <= endPage; i++) {
            pages.push(html`
                <li><a href="#" class="${i === this.currentPage ? "active" : ""}"
                       @click=${(e: Event) => {
                           e.preventDefault()
                           this.goToPage(i)
                       }}>${i}</a></li>
            `)
        }

        // Always show last page
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`)
            }

            pages.push(html`
                <li><a href="#" @click=${(e: Event) => {
                    e.preventDefault()
                    this.goToPage(this.totalPages)
                }}>${this.totalPages}</a></li>
            `)
        }

        return html`
            <div class="pagination-container">
            <span class="pagination-info">
                Hiển thị ${Math.min(this.totalItems, (this.currentPage - 1) * this.pageSize + 1)} - 
                ${Math.min(this.totalItems, this.currentPage * this.pageSize)} 
                trên ${this.totalItems} kết quả
            </span>
                <ul class="pagination">
                    <!-- First page button -->
                    <li><a href="#" class="page-nav" @click=${(e: Event) => {
                        e.preventDefault()
                        this.goToPage(1)
                    }} ?disabled=${this.currentPage === 1}>&laquo;</a></li>

                    <!-- Previous page button -->
                    <li><a href="#" class="page-nav" @click=${(e: Event) => {
                        e.preventDefault()
                        this.prevPage()
                    }} ?disabled=${this.currentPage === 1}>&lt;</a></li>

                    ${pages}

                    <!-- Next page button -->
                    <li><a href="#" class="page-nav" @click=${(e: Event) => {
                        e.preventDefault()
                        this.nextPage()
                    }} ?disabled=${this.currentPage === this.totalPages}>&gt;</a></li>

                    <!-- Last page button -->
                    <li><a href="#" class="page-nav" @click=${(e: Event) => {
                        e.preventDefault()
                        this.goToPage(this.totalPages)
                    }} ?disabled=${this.currentPage === this.totalPages}>&raquo;</a></li>
                </ul>
            </div>
        `
    }

    render() {
        return html`
            ${this.isLoading
                    ? html`
                        <div class="loading-overlay">
                            <div class="loading-spinner"></div>
                        </div>
                    `
                    : ""
            }

            ${this.notification.show
                    ? html`
                        <div class="notification ${this.notification.isError ? "error" : "success"}">
                            ${this.notification.message}
                        </div>
                    `
                    : ""
            }

            <vaadin-dialog
                    theme="no-padding"
                    .opened="${this.isDeleteDialogOpen}"
                    @opened-changed="${(e: CustomEvent) => this.isDeleteDialogOpen = e.detail.value}"
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
                        closeBtn.addEventListener('click', () => this.cancelDelete());

                        const placeholder = document.createElement('div');
                        placeholder.style.width = '20px';

                        header.appendChild(placeholder);
                        header.appendChild(titleContainer);
                        header.appendChild(closeBtn);

                        // Message content
                        const content = document.createElement('div');
                        content.style.padding = '20px';
                        content.style.backgroundColor = 'white';

                        // Replace the message creation part with this code
                        const message = document.createElement('p');
                        message.style.fontSize = '16px';
                        message.style.margin = '10px 0 20px';

                        const textBefore = document.createTextNode('Bạn có chắc chắn muốn xóa quận huyện ');
                        const boldName = document.createElement('span');
                        boldName.textContent = this.selectedItemName || '';
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
                        btnCancel.addEventListener('click', () => this.cancelDelete());

                        // Delete button
                        const btnConfirm = document.createElement('button');
                        btnConfirm.textContent = 'Xóa';
                        btnConfirm.style.padding = '8px 20px';
                        btnConfirm.style.borderRadius = '4px';
                        btnConfirm.style.border = 'none';
                        btnConfirm.style.backgroundColor = '#5cb85c';
                        btnConfirm.style.color = 'white';
                        btnConfirm.style.cursor = 'pointer';
                        btnConfirm.addEventListener('click', () => this.confirmDelete());

                        // Append elements
                        buttonContainer.appendChild(btnCancel);
                        buttonContainer.appendChild(btnConfirm);
                        content.appendChild(message);
                        content.appendChild(buttonContainer);

                        dialog.appendChild(header);
                        dialog.appendChild(content);
                        root.appendChild(dialog);
                    }}">
            </vaadin-dialog>

            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    <span slot="navbar">Danh sách quận/huyện</span>
                </div>
            </div>
            <div class="top-content">
                <vaadin-horizontal-layout style="width: 120%; justify-content: space-between; align-items: center; padding: 16px">
                    <div style="display: flex; align-items: center; width: 85%;">
                        <vaadin-text-field
                                aria-label="search"
                                placeholder="Nhập tên quận/huyện"
                                clear-button-visible
                                style="width: 40%; max-width: 400px;"
                                @keyup="${(e) => e.key === "Enter" && this.handleSearch()}"
                                @clear="${() => this.clearSearch()}"
                        >
                        </vaadin-text-field>
                        <vaadin-button
                                @click="${() => this.handleSearch()}"
                                style="background: #4D9D2A; color: white; margin-left: 15px;"
                        >
                            Tìm kiếm
                        </vaadin-button>
                    </div>
                    <vaadin-button
                            @click="${() => this.navigateToCreate()}"
                            style="background: #4D9D2A; color: white"
                    >
                        Thêm mới
                    </vaadin-button>
                </vaadin-horizontal-layout>
            </div>

            ${
                    this.errorMessage
                            ? html`
                                <div class="error-message">
                                    <or-icon icon="error"></or-icon>
                                    ${this.errorMessage}
                                    <vaadin-button @click="${() => this.loadData(this.currentPage)}" theme="tertiary">
                                        Thử lại
                                    </vaadin-button>
                                </div>
                            `
                            : ""
            }

            <div class="mid-content">
                <vaadin-horizontal-layout style="display:flex; flex-direction: column; align-items: flex-end; width: 120%; justify-content: space-between; padding: 16px">
                    <div class="table-controls">
                        <div class="page-size-selector">
                            <span>Hiển thị</span>
                            <select @change=${(e: Event) => this.updatePageSize(Number.parseInt((e.target as HTMLSelectElement).value, 10))}>
                                <option value="5" ?selected=${this.pageSize === 5}>5</option>
                                <option value="10" ?selected=${this.pageSize === 10}>10</option>
                                <option value="20" ?selected=${this.pageSize === 20}>20</option>
                                <option value="50" ?selected=${this.pageSize === 50}>50</option>
                            </select>
                            <span>mục trên mỗi trang</span>
                        </div>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên quận/huyện</th>
                            <th>Trạng thái</th>
                            <th>Người tạo</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${
                                this.items.length > 0
                                        ? this.items.map((item, index) => {
                                            // Calculate row number based on current page and index
                                            const rowNumber = (this.currentPage - 1) * this.pageSize + index + 1

                                            return html`
                                                <tr>
                                                    <td>${rowNumber}</td>
                                                    <td>${item.district}</td>
                                                    <td>${item.status}</td>
                                                    <td>${item.createdBy}</td>
                                                    <td>${item.createdDate}</td>
                                                    <td>
                                                        <or-icon icon="pencil" style="color: blue; margin-right: 10px;"
                                                                 @click="${(e) => {
                                                                     e.stopPropagation()
                                                                     this.navigateToEdit(item)
                                                                 }}"
                                                        ></or-icon>
                                                        <or-icon icon="delete" style="color: blue"
                                                                 @click="${(e) => {
                                                                     e.stopPropagation()
                                                                     this.openDeleteDialog(item.id)
                                                                 }}"
                                                        ></or-icon>
                                                    </td>
                                                </tr>
                                            `
                                        })
                                        : html`
                                            <tr>
                                                <td colspan="6">
                                                    <div class="empty-state">
                                                        <or-icon icon="search" class="empty-state-icon"></or-icon>
                                                        <p class="empty-state-message">
                                                            ${
                                                                    this.searchTerm
                                                                            ? `Không có dữ liệu`
                                                                            : "Không có dữ liệu huyện nào"
                                                            }
                                                    </div>
                                                </td>
                                            </tr>
                                        `
                        }
                        </tbody>
                    </table>

                    ${this.renderPagination()}
                </vaadin-horizontal-layout>
            </div>
        `
    }
}
