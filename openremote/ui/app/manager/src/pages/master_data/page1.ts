import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import '@vaadin/icon';
import "./province/province-create"
import manager, {subscribe, Util, DefaultColor5} from "@openremote/core";
import "@vaadin/dialog"
import '@vaadin/notification';
import {i18next} from "@openremote/or-translate"
@customElement("master-data-page1")
export class MyElement extends LitElement {
    @state() private editedProvince = { id: "", name: "", status: "", createdBy: "", createdDate: "" };
    @state() dataRoad = [];
    @state() items = [];
    @state() thisPage = 1;
    @state() totalPages = 1;
    @state() pageSize = 5;
    @state() private isDeleteDialogOpen = false;
    @state() private selectedItemId = null;
    @state() private searchText = "";
    @state() private totalItems = 0;
    @state() private notificationText = '';
    @state() private selectedName = '';
    @state() private notification = { show: false, message: "", isError: false };

    static properties = {
        items: { type: Array },
        currentPage: { type: Number },
        totalPages: { type: Number }
    };
    static styles = css`
        :host {
            display: block;
            padding: 20px;
            font-size: 24px;
            text-align: center;
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
        .mid-content{
            
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
        ul {
            list-style: none;
            padding: 0;
        }
        ul li {
            display: inline;
            margin: 0 5px;
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
        #provinceName{
            max-width: 400px;
            min-width: 300px;
            width: 40%;
        }
        .pagination a.active {
            background-color: #4caf50;  /* Màu nền xanh lá */
            color: white;  /* Màu chữ trắng */
            font-weight: bold;
        }
        vaadin-button, or-icon{
            cursor: pointer;
        }
        .pagination-info{
            font-size: 14px;
            color: #666;
        }
        ::part(notification-card) {
            padding: 0;
            margin: 0;
            box-shadow: none;
            background: transparent;
        }
        
        .empty-state{
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: rgb(102, 102, 102);
        }

        .page-size-selector {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;
        }

        .cancel-button::part(button) {
            cursor: pointer;
        }
        .delete-button::part(button) {
            cursor: pointer;
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
            animation: slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes slideInRight {
            from {
                transform: translateX(120%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification.success {
            background-color: #4caf50;
        }

        .notification.error {
            background-color: #f44336;
        }

        vaadin-button::part(button) {
            cursor: pointer;
        }
        .custom-dialog-wrapper {
            padding: 0;
        }

    `;

    @state() private currentPage = window.location.hash;
    private updatePage = () => {
        this.currentPage = window.location.hash;
        this.requestUpdate();
    };

    firstUpdated() {
        this.fetchData();
    }

    async fetchData() {
        try {
            const response = await manager.rest.api.ProvinceResource.countData({
                data: {
                    name: this.searchText.trim()
                }
            });
            this.totalItems = response?.data || 0;
            const filterDTO = {
                page: this.thisPage,
                size: this.pageSize,
                sort: ["id,asc"],
                data: {
                    name: this.searchText.trim() // Chỉ tìm kiếm nếu có dữ liệu
                }
            };

            const dataResponse = await manager.rest.api.ProvinceResource.getAll(filterDTO);
            this.items = dataResponse?.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                status: item.active,
                createdBy: item.createBy ?? "Không xác định",
                createdDate: this.formatDate(item.createDate)
            }));
            console.log(this.items)

            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    handleSearch() {
        this.thisPage = 1; // Reset về trang 1 nếu đang ở trang khác
        this.fetchData();
    }

    connectedCallback() {
        super.connectedCallback();
        // Lấy dữ liệu đã lưu trong sessionStorage
        const storedItem = sessionStorage.getItem('editedItem');
        if (storedItem) {
            // Cập nhật state từ dữ liệu đã lưu
            this.editedProvince = JSON.parse(storedItem);
        }
    }

    navigateToCreate() {
        window.location.hash = '/master-data/province-create';
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };

        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }
    navigateToEdit(item) {
        // Lưu trữ item vào sessionStorage
        sessionStorage.setItem('editedItem', JSON.stringify(item));
        // Chuyển hướng tới trang chỉnh sửa
        window.location.hash = `/master-data/province-edit`;
    }
    clearSessionData() {
        // Xóa dữ liệu khỏi sessionStorage khi không cần thiết
        sessionStorage.removeItem('editedItem');
    }

    navigatePage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.thisPage = page;
            this.fetchData();
        }
    }
    openDeleteDialog(itemId) {
        this.selectedItemId = itemId;
        this.isDeleteDialogOpen = true;
    }

    renderPagination() {
        // Luôn hiển thị thanh phân trang, kể cả khi chỉ có 1 trang
        const pages = [];
        const maxVisiblePages = 5;
        let startPage, endPage;
        const current = this.thisPage;
        const total = this.totalPages;

        if (total <= maxVisiblePages) {
            startPage = 1;
            endPage = total;
        } else {
            const middlePage = Math.floor(maxVisiblePages / 2);
            if (current <= middlePage + 1) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (current >= total - middlePage) {
                startPage = total - maxVisiblePages + 1;
                endPage = total;
            } else {
                startPage = current - middlePage;
                endPage = current + middlePage;
            }
        }

        // Always show first page
        if (startPage > 1) {
            pages.push(html`
                <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(1); }} >1</a></li>
            `);
            if (startPage > 2) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`);
            }
        }

        // Add visible page links
        for (let i = startPage; i <= endPage; i++) {
            pages.push(html`
                <li><a href="#" class="${i === current ? "active" : ""}"
                       @click=${(e: Event) => { e.preventDefault(); this.navigatePage(i); }}>${i}</a></li>
            `);
        }

        // Always show last page
        if (endPage < total) {
            if (endPage < total - 1) {
                pages.push(html`<li><span class="ellipsis">...</span></li>`);
            }
            pages.push(html`
                <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(total); }} >${total}</a></li>
            `);
        }

        return html`
            <div class="pagination" style="display: flex; text-align: right; padding-bottom: 13px; justify-content: space-between;">
                <span class="pagination-info">
                    Hiển thị ${Math.min(this.totalItems, (current - 1) * this.pageSize + 1)} -
                    ${Math.min(this.totalItems, current * this.pageSize)}
                    trên ${this.totalItems} kết quả
                </span>
                <ul style="display: flex; align-items: center; list-style: none; margin: 0; padding: 0;">
                    <li><a href="#" class="page-nav" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(1); }} ?disabled=${current === 1}>&laquo;</a></li>
                    <li><a href="#" class="page-nav" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(current - 1); }} ?disabled=${current === 1}>&lt;</a></li>
                    ${pages}
                    <li><a href="#" class="page-nav" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(current + 1); }} ?disabled=${current === total}>&gt;</a></li>
                    <li><a href="#" class="page-nav" @click=${(e: Event) => { e.preventDefault(); this.navigatePage(total); }} ?disabled=${current === total}>&raquo;</a></li>
                </ul>
            </div>
        `;
    }


    deleteItem(item) {
        this.selectedItemId = item.id;
        this.selectedName = item.name
        this.isDeleteDialogOpen = true;
    }

    async confirmDelete() {
        try {
            await manager.rest.api.ProvinceResource.remove({ id: this.selectedItemId });
            this.items = this.items.filter(item => item.id !== this.selectedItemId);
            this.isDeleteDialogOpen = false;
            this.showNotification("Xóa tỉnh/thành phố thành công", false);
            await this.fetchData();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }


    cancelDelete() {
        this.isDeleteDialogOpen = false;
    }

    updatePageSize(newSize: number) {
        this.pageSize = newSize;
        this.thisPage = 1;
        this.fetchData();
    }

    render() {
        return html`
            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    <span slot="navbar">Danh sách tỉnh/thành phố</span>
                </div>
            </div>
            <div class="top-content">
                <vaadin-horizontal-layout style="width: 120%; justify-content: space-between; align-items: center; padding: 16px">
                    <div style = "text-align: left;width: 100%">
                        <vaadin-text-field
                                id = "provinceName"
                                aria-label="Tìm tỉnh/thành phố"
                                placeholder="${i18next.t("Enter province")}"
                                clear-button-visible
                                @change="${(e: any) => this.searchText = e.target.value}"
                                @keydown="${(e: KeyboardEvent) => {
                                    if (e.key === 'Enter') {
                                        this.handleSearch();
                                    }
                                }}"
                        >
                        </vaadin-text-field>
                        <vaadin-button
                                @click="${() => this.handleSearch()}"
                                style="background: #4d9d2a; color: white; margin-left: 10px;">
                            Tìm kiếm
                        </vaadin-button>
                    </div>
                    <vaadin-button
                            @click="${() => this.navigateToCreate()}"
                            style="background: #4d9d2a; color: white">
                        Thêm mới
                    </vaadin-button>
                </vaadin-horizontal-layout>
            </div>
            <div class="mid-content">
                <div>
                    <div class="page-size-selector" style="text-align: left;padding: 20px 0px 15px 0px; margin-bottom: 16px;">
                    <span style="font-size: 14px;">Hiển thị </span>
                    <select @change=${(e: Event) => this.updatePageSize(parseInt((e.target as HTMLSelectElement).value, 10))}>
                                <option value="5" ?selected=${this.pageSize === 5}>5</option>
                                <option value="10" ?selected=${this.pageSize === 10}>10</option>
                                <option value="20" ?selected=${this.pageSize === 20}>20</option>
                                <option value="50" ?selected=${this.pageSize === 50}>50</option></select>
                    <span style="font-size: 14px;"> mục trên mỗi trang</span> 
                </div>
                <table style="margin-top: 0px">
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên tỉnh/thành phố</th>
                        <th>Trạng thái</th>
                        <th>Người tạo</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${this.items.length > 0
            ? this.items.map((item, index) => html`
                                <tr>
                                    <td>${(this.thisPage - 1) * this.pageSize + index + 1}</td>
                                  <td>${item.name}</td>
                                  <td>${item.status ? 'Hoạt động' : 'Không hoạt động'}</td>
                                  <td>${item.createdBy}</td>
                                  <td>${item.createdDate}</td>
                                  <td>
                                      <or-icon icon="pencil" style="color: blue; margin-right: 10px;"
                                               @click="${(e) => {
                e.stopPropagation()
                this.navigateToEdit(item)
            }}">
                                      </or-icon>
                                      <or-icon icon="delete" style="color: blue"
                                               @click="${(e) => {
                e.stopPropagation()
                this.deleteItem(item)
            }}"
                                      ></or-icon>
                                  </td>
                                </tr>
                              `)
            : html`
                                <tr>
                                    <td colspan="6">
                                        <div class ="empty-state">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>
                              `
        }
                    </tbody>
                </table>
                </div>
                ${this.renderPagination()}
            </div>
            ${this.notification.show ? html`
                <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                    ${this.notification.message}
                </div>
            ` : ''}
            
            <!-- Delete Confirmation Dialog -->
            <vaadin-dialog
                    theme="no-padding"
                    .opened="${this.isDeleteDialogOpen}"
                    @opened-changed="${(e: CustomEvent) => {
                        this.isDeleteDialogOpen = e.detail.value;
                    }}"
                    .renderer="${(root: HTMLElement) => {
                        if (!root.firstElementChild) {
                            const wrapper = document.createElement('div');
                            wrapper.classList.add('custom-dialog-wrapper');
                            wrapper.innerHTML = `
                                    <div style="position: relative;">
                                          <button id="closeDialogBtn" 
                                              style="
                                                  position: absolute;
                                                  top: 10px;
                                                  right: 10px;
                                                  background: transparent;
                                                  border: none;
                                                  font-size: 20px;
                                                  color: white;
                                                  cursor: pointer;
                                              ">✕</button>
                                      </div>
                                      <div class="deleteTitle" style="height: 50px;
                                          align-items: center;
                                          display: flex;
                                          background: #4d9d2a;
                                          justify-content: center;
                                          font-size: 20px;
                                          font-weight: 500;
                                          color: white;">
                                          Xác nhận
                                      </div>
                                      <div style="text-align:center;">
                                          <p style="margin: 25px 55px 25px 55px;">
                                              Bạn có chắc chắn muốn xóa tỉnh/ thành phố 
                                               <span style="font-weight: 500">
                                                    ${this.selectedName}
                                               </span>?
                                          </p>
                                          <vaadin-button 
                                              id="cancelBtn"
                                              theme="tertiary"
                                              style="padding: 8px 20px; border-radius: 4px; background-color: #e2e2e2;">
                                              Hủy
                                          </vaadin-button>
                                          <vaadin-button 
                                              id="confirmBtn"
                                              theme="tertiary"
                                              style="padding: 8px 20px; border-radius: 4px; background-color: #5cb85c; color: white;">
                                              Xóa
                                          </vaadin-button>
                                      </div>
                                `;
                            root.appendChild(wrapper);

                            // Gán sự kiện sau khi render xong
                            setTimeout(() => {
                                root.querySelector('#cancelBtn')?.addEventListener('click', () => this.cancelDelete());
                                root.querySelector('#confirmBtn')?.addEventListener('click', () => this.confirmDelete());
                                root.querySelector('#closeDialogBtn')?.addEventListener('click', () => this.cancelDelete());
                            });
                        }
                    }}">
            </vaadin-dialog>
        `;
    }

}
