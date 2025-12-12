import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import '@vaadin/icon';
import manager from "@openremote/core";
import "@vaadin/dialog"
import { i18next } from "@openremote/or-translate";
import { Notification } from '@vaadin/notification';

@customElement("master-data-page5")
export class SupplierComponent extends LitElement {
    @state() private editedSupplier = { id: "", code: "", name: "", status: "", createdBy: "", createdDate: "" };
    @state() private isDeleteDialogOpen = false;
    @state() private selectedItemId = null;
    @state() items = [];
    @state() private searchText = "";
    @state() private currentPage = 1;
    @state() private totalPages = 1;
    @state() private pageSize = 5;
    @state() private totalItems = 0;
    @state() private selectedSupplier: any = null;
    @state() private isLoading = false;
    @state() private errorMessage = '';
    @state() private notification = { show: false, message: "", isError: false };

    static styles = css`
        :host {
            display: block;
            padding: 20px;
            font-size: 24px;
            text-align: center;
            position: relative;
        }
        
        vaadin-dialog[theme~="no-padding"]::part(overlay) {
            padding: 0;
        }

        vaadin-dialog[theme~="no-padding"]::part(content) {
            padding: 0;
        }
        .top-content {
            display: flex;
            background: white;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding: 0 20px;
            border-radius: 5px;
        }
        .mid-content {
            background: white;
            justify-content: space-between;
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
        #supplierName {
            max-width: 400px;
            min-width: 300px;
            width: 40%;
        }
        
        .pagination a {
            font-size: 16px;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 4px;
            color: #666;
            border: 1px solid #ddd;
            cursor: pointer;
        }
        .pagination a.active {
            background-color: #4d9d2a;
            color: white;
            font-weight: bold;
        }
        vaadin-button, or-icon {
            cursor: pointer;
        }
        .pagination {
            display: flex;
            text-align: right;
            padding-bottom: 13px;
            justify-content: space-between;
        }
        .pagination-info {
            font-size: 14px;
            color: #666;
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
            font-size: 14px;
            max-width: 250px;
        }
        .notification.success {
            background-color: #4d9d2a;
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
        
        ul {
            list-style: none;
            padding:0;
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
            padding-bottom: 10px;
            width: 100%;
        }

        .pagination {
            display: flex;
            list-style: none;
            padding-bottom: 10px;
            margin: 0;
        }

        .pagination li {
            margin: 0 2px;
        }

        .pagination a, .pagination .ellipsis {
            font-size: 14px;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 4px;
            color: #666;
            border: 1px solid #ddd;
            display: inline-block;
            text-align: center;
        }

        .pagination .ellipsis {
            border: none;
            padding: 0 5px;
        }

        .pagination a.active {
            background-color: #4d9d2a;
            color: white;
            border-color: #4d9d2a;
        }

        .pagination a[disabled] {
            color: #ccc;
            pointer-events: none;
            border-color: #eee;
        }


        .pagination-info {
            font-size: 14px;
            color: #666;
        }
    `;

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    firstUpdated() {
        this.fetchData();
    }

    async fetchData() {
        this.isLoading = true;
        try {
            const countResponse = await manager.rest.api.SupplierResource.countData({
                data: {
                    name: this.searchText.trim()
                }
            });
            this.totalItems = countResponse?.data || 0;

            const filterDTO = {
                page: this.currentPage,
                size: this.pageSize,
                sort: ["id,asc"],
                data: {
                    name: this.searchText.trim(),
                    deleted: 0
                }
            };


            const [userResponse, dataResponse] = await Promise.all([
                manager.rest.api.UserResource.getCurrent(),
                manager.rest.api.SupplierResource.getAll(filterDTO)
            ]);

            const currentUser = userResponse?.data?.username || "Không xác định";

            this.items = dataResponse?.data.map((item: any) => ({
                id: item.id,
                code: item.code || "-",
                name: item.name,
                status: item.active === 1 ? "Hoạt động" : "Không hoạt động",
                createdBy: currentUser,
                createdDate: this.formatDate(item.createDate)
            }));


            this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        } catch (error) {
            console.error("Error fetching supplier data:", error);
            this.errorMessage = "Đã có lỗi xảy ra khi tải dữ liệu";
            this.showNotification("Đã có lỗi xảy ra khi tải dữ liệu", true);
        } finally {
            this.isLoading = false;
        }
    }

    formatDate(timestamp: number | string): string {
        if (!timestamp) return "";

        const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
        const date = new Date(ts);

        if (isNaN(date.getTime())) return "";

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    handleSearch() {
        this.currentPage = 1;
        this.fetchData();
    }

    navigateToCreate() {
        window.location.hash = '/master-data/supplier-create';
    }

    navigateToEdit(item: any) {
        sessionStorage.setItem('editedSupplier', JSON.stringify(item));

        const queryString = new URLSearchParams({
            id: item.id,
            code: item.code,
            name: item.name,
            active: item.status === "Hoạt động" ? "1" : "0"
        }).toString();
        window.location.hash = `/master-data/supplier-edit?${queryString}`;
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.fetchData();
        }
    }

    prevPage() {
        this.goToPage(this.currentPage - 1);
    }

    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    updatePageSize(newSize: number) {
        this.pageSize = newSize;
        this.currentPage = 1;
        this.fetchData();
    }

    openDeleteDialog(item: any) {
        this.selectedItemId = item.id;
        this.selectedSupplier = item;
        this.isDeleteDialogOpen = true;
    }

    async confirmDelete() {
        try {
            await manager.rest.api.SupplierResource.remove({ id: this.selectedItemId });
            this.items = this.items.filter(item => item.id !== this.selectedItemId);
            this.isDeleteDialogOpen = false;
            this.showNotification(i18next.t("DeleteSuccess"));
            this.fetchData();
        } catch (error) {
            this.showNotification("Đã có lỗi xảy ra khi xóa nhà cung cấp", true);
        }
    }

    cancelDelete() {
        this.isDeleteDialogOpen = false;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    }

    renderPagination() {
        const pages = [];
        const lastPage = this.totalPages;
        const current = this.currentPage;
        const visibleCount = 5;

        let startPage = Math.max(1, current - Math.floor(visibleCount / 2));
        let endPage = startPage + visibleCount - 1;

        if (endPage > lastPage) {
            endPage = lastPage;
            startPage = Math.max(1, endPage - visibleCount + 1);
        }

        // Nút trang đầu
        if (startPage > 1) {
            pages.push(this.renderPageButton(1));
            if (startPage > 2) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`);
            }
        }

        // Các nút trang chính giữa
        for (let i = startPage; i <= endPage; i++) {
            pages.push(this.renderPageButton(i));
        }

        // Nút trang cuối
        if (endPage < lastPage) {
            if (endPage < lastPage - 1) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`);
            }
            pages.push(this.renderPageButton(lastPage));
        }

        return html`
            <div class="pagination-container">
            <span class="pagination-info">
  ${i18next.t("Showing")} ${(this.currentPage - 1) * this.pageSize + 1} -
  ${Math.min(this.totalItems, this.currentPage * this.pageSize)} 
  ${i18next.t("Of")} ${this.totalItems} ${i18next.t("Results")}
</span>

                <ul class="pagination">
                    <li>
                        <a href="#" @click=${(e: Event) => { e.preventDefault(); this.goToPage(1); }}
                           ?disabled=${this.currentPage === 1}>&laquo;</a>
                    </li>
                    <li>
                        <a href="#" @click=${(e: Event) => { e.preventDefault(); this.prevPage(); }}
                           ?disabled=${this.currentPage === 1}>&lt;</a>
                    </li>
                    ${pages}
                    <li>
                        <a href="#" @click=${(e: Event) => { e.preventDefault(); this.nextPage(); }}
                           ?disabled=${this.currentPage === this.totalPages}>&gt;</a>
                    </li>
                    <li>
                        <a href="#" @click=${(e: Event) => { e.preventDefault(); this.goToPage(this.totalPages); }}
                           ?disabled=${this.currentPage === this.totalPages}>&raquo;</a>
                    </li>
                </ul>
            </div>
        `;
    }



// ✅ Helper để render từng nút trang
    private renderPageButton(page: number) {
        return html`
        <li>
            <a href="#" class="${page === this.currentPage ? 'active' : ''}"
               @click=${(e: Event) => { e.preventDefault(); this.goToPage(page); }}>
                ${page}
            </a>
        </li>
    `;
    }

    render() {
        return html`
            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    <span slot="navbar">${i18next.t("SupplierListTitle")}</span>
                </div>
            </div>

            ${this.isLoading ? html`
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                </div>
            ` : ''}

            ${this.errorMessage ? html`
                <div class="error-message">
                    <or-icon icon="alert-circle"></or-icon>
                    ${this.errorMessage}
                </div>
            ` : ''}

            ${this.notification.show ? html`
                <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                    ${this.notification.message}
                </div>
            ` : ''}

            <div class="top-content">
                <vaadin-horizontal-layout style="width: 120%; justify-content: space-between; align-items: center; padding: 16px">
                    <div style="text-align: left;width: 100%">
                        <vaadin-text-field
                                id="supplierName"
                                aria-label="${i18next.t("SearchSupplier")}"
                                placeholder="${i18next.t("EnterSupplierName")}"
                                @keydown="${this.handleKeyDown}"
                                clear-button-visible
                                @input="${(e: any) => this.searchText = e.target.value}">
                            
                        </vaadin-text-field>
                        <vaadin-button
                                @click="${() => this.handleSearch()}"
                                style="background: #4d9d2a; color: white; margin-left: 10px;">
                            ${i18next.t("Search")}
                        </vaadin-button>
                    </div>
                    <vaadin-button
                            @click="${() => this.navigateToCreate()}"
                            style="background: #4d9d2a; color: white">
                        ${i18next.t("AddNew")}
                    </vaadin-button>
                </vaadin-horizontal-layout>
            </div>
            <div class="mid-content">
                <div style="text-align: left;padding: 10px 0px 25px 0px">
                    <or-translate style="font-size: 14px" value="pagination_show_label"></or-translate>
                    <select @change=${(e: Event) => this.updatePageSize(parseInt((e.target as HTMLSelectElement).value, 10))}>
                        <option value="5" ?selected=${this.pageSize === 5}>5</option>
                        <option value="10" ?selected=${this.pageSize === 10}>10</option>
                        <option value="20" ?selected=${this.pageSize === 20}>20</option>
                        <option value="50" ?selected=${this.pageSize === 50}>50</option>
                    </select>
                    <or-translate style="font-size: 14px" value="pagination_perPage_label"></or-translate>
                </div>
                <table style="margin-top: 0px">
                    <thead>
                    <tr>
                        <th>${i18next.t("Index")}</th>
<th>${i18next.t("SupplierCode")}</th>
<th>${i18next.t("SupplierName")}</th>
<th>${i18next.t("Status")}</th>
<th>${i18next.t("CreatedBy")}</th>
<th>${i18next.t("CreatedDate")}</th>
<th>${i18next.t("Action")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${this.items.length === 0
                            ? html`<tr><td colspan="7" style="padding: 20px; text-align: center; color: #888;">Không có dữ liệu</td></tr>`
                            : this.items.map((item, index) => html`
                                <tr>
                                    <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
                                    <td>${item.code}</td>
                                    <td>${item.name}</td>
                                    <td>${item.status}</td>
                                    <td>${item.createdBy}</td>
                                    <td>${item.createdDate}</td>
                                    <td>
                                        <or-icon icon="pencil" style="color: blue"
                                                 @click="${(e) => { e.stopPropagation(); this.navigateToEdit(item); }}">
                                        </or-icon>
                                        <or-icon icon="delete" style="color: blue"
                                                 @click="${(e) => { e.stopPropagation(); this.openDeleteDialog(item); }}">
                                        </or-icon>
                                    </td>
                                </tr>`)
                    }
                    </tbody>
                </table>
                ${this.renderPagination()}
            </div>
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
                        header.style.backgroundColor = '#4d9d2a';
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
                        titleContainer.textContent = i18next.t("Confirm");

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

                        const message = document.createElement('p');
                        message.innerHTML = `${i18next.t("ConfirmDeleteSupplier")} <strong>${this.selectedSupplier?.name || ''}</strong>?`;
                        message.style.fontSize = '16px';
                        message.style.margin = '10px 0 20px';

                        // Button container
                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.display = 'flex';
                        buttonContainer.style.justifyContent = 'center';
                        buttonContainer.style.gap = '10px';
                        buttonContainer.style.marginTop = '20px';

                        // Cancel button
                        const btnCancel = document.createElement('button');
                        btnCancel.textContent = i18next.t("Cancel");
                        btnCancel.style.padding = '8px 20px';
                        btnCancel.style.borderRadius = '4px';
                        btnCancel.style.border = 'none';
                        btnCancel.style.backgroundColor = '#e2e2e2';
                        btnCancel.style.cursor = 'pointer';
                        btnCancel.addEventListener('click', () => this.cancelDelete());

                        // Delete button
                        const btnConfirm = document.createElement('button');
                        btnConfirm.textContent = i18next.t("Delete");
                        btnConfirm.style.padding = '8px 20px';
                        btnConfirm.style.borderRadius = '4px';
                        btnConfirm.style.border = 'none';
                        btnConfirm.style.backgroundColor = '#4d9d2a';
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
        `;
    }
}
