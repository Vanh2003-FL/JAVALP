import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Page, type PageProvider } from "@openremote/or-app";
import type { AppStateKeyed } from "@openremote/or-app";
import type { Store } from "@reduxjs/toolkit";
import manager from "@openremote/core";
import "@openremote/or-icon";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/icon";
import "@vaadin/icons";
import "./blog-detail";
import "./blog-category-create-modal";

const statusMap: { [key: string]: string } = {
    true: "Đã xuất bản",
    false: "Bản nháp",
};
const priorityMap: { [key: number]: string } = {
    1: "Thấp",
    2: "Trung bình",
    3: "Cao",
    4: "Rất cao",
    5: "Khẩn cấp",
};
const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
    "Đã xuất bản": { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    "Bản nháp": { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};
const priorityColors: { [key: string]: { bg: string; text: string; border: string } } = {
    Thấp: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
    "Trung bình": { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
    Cao: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    "Rất cao": { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    "Khẩn cấp": { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};
import type { Blog, BlogCategory } from "@openremote/model";

export function pageBlogProvider(store: Store<AppStateKeyed>, config?: BlogHome): PageProvider<AppStateKeyed> {
    return {
        name: "blogHome",
        routes: ["blog", "blog/:id", "blog/create", "blog/edit", "blog/edit/:id"],
        pageCreator: () => {
            const page = new BlogHome(store);
            return page;
        },
    };
}

@customElement("page-home-blog")
export class BlogHome extends Page<AppStateKeyed> {
    @state() filteredBlogs: Blog[] = [];
    @state() loading = false;
    @state() searchKeyword = "";
    @state() selectedStatus = "";
    @state() selectedCategory = "";
    @state() selectedPriority = "";
    @state() showCreateModal = false;
    @state() showDeleteDialog = false;
    @state() itemToDelete: any = null;
    @state() blogs: Blog[] = [];
    @state() categories: BlogCategory[] = [];
    @state() realmSelected = sessionStorage.getItem("realmSelected") || "default";
    @state() pageSize = 10;
    @state() currentPage = 1;
    @state() totalItems = 0;
    @state() totalPages = 1;
    @state() notification = {
        message: "",
        isError: false,
        visible: false,
    };
    @state() showEditModal = false;
    @state() blogToEdit: Blog | null = null;
    @state() showCreateCategoryModal = false; // New state for category modal

    static get styles() {
        return css`
            :host {
                display: inline-block !important;
                font-family: Roboto;
                background-color: #f8fafc;
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
                color: #1f2937;
            }
            .action-buttons {
                display: flex;
                gap: 12px;
            }
            /* Button styles - green theme */
            vaadin-button[theme="primary"] {
                --vaadin-button-primary-background: #4d9d2a;
                --vaadin-button-primary-background-hover: #3d7d1a;
                --vaadin-button-primary-background-active: #2d5d0a;
            }
            vaadin-button {
                --vaadin-button-background: #4d9d2a;
                --vaadin-button-background-hover: #3d7d1a;
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
                background: linear-gradient(135deg, #4d9d2a 0%, #3d7d1a 100%);
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
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s ease;
                background: #f9fafb;
            }
            .search-input:focus {
                outline: none;
                border-color: #4d9d2a;
                box-shadow: 0 0 0 3px rgba(77, 157, 42, 0.1);
                background: white;
            }
            .search-button {
                padding: 12px 20px;
                background: #4d9d2a;
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
                background: #3d7d1a;
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
                --vaadin-input-field-border-color: #e5e7eb;
                --vaadin-input-field-hover-highlight-color: #4d9d2a;
                --vaadin-input-field-focus-ring-color: rgba(77, 157, 42, 0.3);
                --vaadin-input-field-background: #f9fafb;
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
            th,
            td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }
            td.title-cell {
                text-align: left;
            }
            th {
                background-color: #4d9d2a;
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
                background-color: #f9fafb;
            }
            .status-badge,
            .priority-badge {
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
                background-color: #f3f4f6;
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
                bottom: 16px;
                right: 16px;
                padding: 10px 16px;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 500;
                max-width: 280px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease-out forwards;
            }
            .notification.success {
                background-color: #4d9d2a;
            }
            .notification.error {
                background-color: #ef4444;
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
                color: #6b7280;
            }
            .empty-state {
                text-align: center;
                padding: 40px;
                color: #6b7280;
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
                th,
                td {
                    padding: 8px 4px;
                }
                .pagination {
                    justify-content: center;
                }
                .page-info {
                    text-align: center;
                }
            }
        `;
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
    }

    get name() {
        return "blogHome";
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchBlogs();
        this.fetchCategories();
        // Reset filters if coming back from edit with draft/publish change
        try {
            if (sessionStorage.getItem('blogResetFilters') === 'true') {
                sessionStorage.removeItem('blogResetFilters');
                // Keep current filters but ensure the edited item remains visible
                this.selectedCategory = "";
                this.selectedPriority = "";
                this.selectedStatus = "";
                this.searchKeyword = "";
            }
        } catch {}
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    async fetchBlogs() {
        this.loading = true;
        try {
            const response = await manager.rest.api.BlogResource.getBlog({
                page: 1,
                size: 100000,
                keyWord: this.searchKeyword,
                data: {
                    categoryId: this.selectedCategory ? Number.parseInt(this.selectedCategory) : null,
                    status: this.selectedStatus !== "" ? this.selectedStatus === "true" : null,
                    priorityLevel: this.selectedPriority ? Number.parseInt(this.selectedPriority) : null,
                },
            });
            const allItems = response?.data || [];
            if (allItems) {
                this.blogs = allItems;
                // Ensure edited blog appears even if current filters exclude it
                try {
                    const ensureIdStr = sessionStorage.getItem('blogEnsureId');
                    if (ensureIdStr) {
                        const ensureId = Number(ensureIdStr);
                        const existing = this.blogs.find(b => Number(b.id) === ensureId);
                        if (!existing) {
                            const ensureResp = await manager.rest.api.BlogResource.getBlog({ data: { id: ensureId } });
                            const items = ensureResp?.data || [];
                            const target = items.find((b: any) => Number(b.id) === ensureId) || items[0];
                            if (target) this.blogs = [target, ...this.blogs];
                            // If status filter would hide the ensured item, clear the status filter
                            const ensureStatus = sessionStorage.getItem('blogEnsureStatus');
                            if (ensureStatus !== null && this.selectedStatus !== '' && this.selectedStatus !== ensureStatus) {
                                this.selectedStatus = '';
                            }
                        }
                        sessionStorage.removeItem('blogEnsureId');
                        sessionStorage.removeItem('blogEnsureStatus');
                    }
                } catch {}
                this.applyFilters();
            } else {
                this.blogs = [];
                this.applyFilters();
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            this.showNotification("Lỗi khi tải danh sách tin tức", true);
            this.blogs = [];
            this.applyFilters();
        } finally {
            this.loading = false;
        }
    }

    async fetchCategories() {
        try {
            const response = await manager.rest.api.BlogResource.getBlogCategory({});
            if (response && response.data) {
                this.categories = response.data;
            } else {
                this.categories = [];
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            this.categories = [];
        }
    }

    applyFilters() {
        let filtered = [...this.blogs];
        if (this.searchKeyword) {
            const keyword = this.searchKeyword.toLowerCase();
            filtered = filtered.filter(
                (blog) =>
                    blog.title.toLowerCase().includes(keyword) ||
                    blog.content.toLowerCase().includes(keyword) ||
                    blog.summary.toLowerCase().includes(keyword)
            );
        }
        if (this.selectedStatus !== "") {
            filtered = filtered.filter((blog) => String(blog.status) === this.selectedStatus);
        }
        if (this.selectedCategory) {
            filtered = filtered.filter((blog) => blog.categoryId.toString() === this.selectedCategory);
        }
        if (this.selectedPriority) {
            filtered = filtered.filter((blog) => String(blog.priorityLevel) === this.selectedPriority);
        }
        this.filteredBlogs = filtered;
        this.totalItems = filtered.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    }

    handleSearch() {
        this.currentPage = 1;
        this.applyFilters();
    }

    handleSearchInput(e: Event) {
        this.searchKeyword = (e.target as HTMLInputElement).value;
    }

    handleStatusChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return;
        const value = (e as any).detail?.value;
        if (value === undefined || value === null) return; // ignore blur
        if (value === '') {
            this.selectedStatus = '';
        } else if (value === "Đã xuất bản") {
            this.selectedStatus = 'true';
        } else if (value === "Bản nháp") {
            this.selectedStatus = 'false';
        } else {
            this.selectedStatus = '';
        }
        this.applyFilters();
    }

    handleCategoryChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return;
        const value = (e as any).detail?.value;
        if (value === undefined || value === null) return; // ignore blur
        if (value === '') {
            this.selectedCategory = '';
        } else {
            const category = this.categories.find(cat => cat.name === value);
            this.selectedCategory = category ? category.id.toString() : '';
        }
        this.applyFilters();
    }

    handlePriorityChange(e: CustomEvent) {
        if (!e || !('detail' in e)) return;
        const value = (e as any).detail?.value;
        if (value === undefined || value === null) return; // ignore blur
        if (value === '') {
            this.selectedPriority = '';
        } else {
            const priorityEntry = Object.entries(priorityMap).find(([key, val]) => val === value);
            this.selectedPriority = priorityEntry ? priorityEntry[0] : '';
        }
        this.applyFilters();
    }

    handleCreateBlog = async (blog: any) => {
        try {
            const response = await manager.rest.api.BlogResource.createBlog(blog);
            if (response && response.data) {
                this.showNotification("Tạo tin tức thành công");
                this.showCreateModal = false;
                this.fetchBlogs();
            } else {
                throw new Error("Failed to create blog");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            this.showNotification("Lỗi khi tạo tin tức", true);
        }
    };

    handleCreateBlogCategory = async (e: CustomEvent) => {
        const newCategoryData = e.detail;
        try {
            // The actual API call is handled inside blog-category-create-modal.ts
            // This event listener is just to react to the success/error from the modal
            this.showNotification("Tạo loại tin tức thành công");
            this.showCreateCategoryModal = false;
            this.fetchCategories(); // Re-fetch categories to update the dropdown
        } catch (error) {
            console.error("Error handling category creation:", error);
            this.showNotification("Lỗi khi tạo loại tin tức", true);
        }
    };

    handleViewBlog(blogId: number) {
        window.location.hash = `#/blog/${blogId}`;
    }

    handleEditBlog(blogId: number) {
        window.location.hash = `#/blog/edit/${blogId}`;
    }

    handleDeleteBlog(blogId: number) {
        this.itemToDelete = this.blogs.find((blog) => blog.id === blogId);
        this.showDeleteDialog = true;
    }

    async confirmDelete() {
        if (!this.itemToDelete) return;
        try {
            const response = await manager.rest.api.BlogResource.removeBlog(this.itemToDelete);
            if (response && response.data) {
                this.showNotification("Xóa tin tức thành công");
                this.fetchBlogs();
            } else {
                throw new Error("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            this.showNotification("Lỗi khi xóa tin tức", true);
        } finally {
            this.showDeleteDialog = false;
            this.itemToDelete = null;
        }
    }

    cancelDelete() {
        this.showDeleteDialog = false;
        this.itemToDelete = null;
    }

    handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
            this.currentPage = newPage;
        }
    }

    showNotification(message: string, isError = false) {
        this.notification = {
            message,
            isError,
            visible: true,
        };
        setTimeout(() => {
            this.notification = {
                ...this.notification,
                visible: false,
            };
        }, 4000);
    }

    formatDate(dateValue: string | number | undefined) {
        if (!dateValue) return "N/A";
        const date = typeof dateValue === "string" ? new Date(dateValue) : new Date(dateValue);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    }

    getStatusDisplay(status: boolean) {
        return statusMap[status.toString()];
    }

    getStatusColor(status: boolean) {
        return statusColors[statusMap[status.toString()]];
    }

    getPriorityDisplay(priority: number) {
        return priorityMap[priority] || "Không xác định";
    }

    getPriorityColor(priority: number) {
        return priorityColors[priorityMap[priority]] || { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" };
    }

    getCategoryName(categoryId: number) {
        const category = this.categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Không xác định";
    }

    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredBlogs.slice(start, end);
    }

    renderPagination() {
        const pages = [];
        const maxVisiblePages = 3;
        pages.push(html`
            <li>
                <a
                        href="#"
                        @click="${(e: Event) => {
                            e.preventDefault();
                            this.handlePageChange(1);
                        }}"
                        class="${this.currentPage === 1 ? "disabled" : ""}"
                        title="Trang đầu"
                >
                    <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                </a>
            </li>
        `);
        pages.push(html`
            <li>
                <a
                        href="#"
                        @click="${(e: Event) => {
                            e.preventDefault();
                            this.handlePageChange(this.currentPage - 1);
                        }}"
                        class="${this.currentPage === 1 ? "disabled" : ""}"
                        title="Trang trước"
                >
                    <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                </a>
            </li>
        `);
        const startPage = this.currentPage;
        const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(html`
                <li>
                    <a
                            href="#"
                            @click="${(e: Event) => {
                                e.preventDefault();
                                this.handlePageChange(i);
                            }}"
                            class="${this.currentPage === i ? "active" : ""}"
                    >
                        ${i}
                    </a>
                </li>
            `);
        }
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push(html`<li><span>...</span></li>`);
            }
            pages.push(html`
                <li>
                    <a
                            href="#"
                            @click="${(e: Event) => {
                                e.preventDefault();
                                this.handlePageChange(this.totalPages);
                            }}"
                            class="${this.currentPage === this.totalPages ? "active" : ""}"
                    >
                        ${this.totalPages}
                    </a>
                </li>
            `);
        }
        pages.push(html`
            <li>
                <a
                        href="#"
                        @click="${(e: Event) => {
                            e.preventDefault();
                            this.handlePageChange(this.currentPage + 1);
                        }}"
                        class="${this.currentPage === this.totalPages ? "disabled" : ""}"
                        title="Trang sau"
                >
                    <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                </a>
            </li>
        `);
        pages.push(html`
            <li>
                <a
                        href="#"
                        @click="${(e: Event) => {
                            e.preventDefault();
                            this.handlePageChange(this.totalPages);
                        }}"
                        class="${this.currentPage === this.totalPages ? "disabled" : ""}"
                        title="Trang cuối"
                >
                    <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                </a>
            </li>
        `);
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
        return html`
            <div class="pagination-container">
                <ul class="pagination">${pages}</ul>
                <div class="page-info">Hiển thị ${startItem}-${endItem} của ${this.totalItems} mục</div>
            </div>
        `;
    }

    navigateTo(path: string) {
        if (window.location.hash !== `#${path}`) {
            window.location.hash = path;
        } else {
            this.requestUpdate();
        }
    }

    render() {
        if (window.location.hash.match(/\/blog\/\d+$/)) {
            return html`<blog-detail></blog-detail>`;
        }
        if (window.location.hash.match(/\/blog\/edit\/(\d+)$/)) {
            return html`<blog-edit-page></blog-edit-page>`;
        }
        const statusOptions = [...Object.values(statusMap)];
        const priorityOptions = [...Object.values(priorityMap)];
        const categoryOptions = [...this.categories.map((cat) => cat.name || "")];
        
        // Get display values for current selections
        const statusDisplayValue = this.selectedStatus === "true" ? "Đã xuất bản" : 
                                  this.selectedStatus === "false" ? "Bản nháp" : (this.selectedStatus === '' ? '' : this.selectedStatus);
        const categoryDisplayValue = this.selectedCategory ? 
                                   this.categories.find(cat => cat.id.toString() === this.selectedCategory)?.name || "" : "";
        const priorityDisplayValue = this.selectedPriority ? 
                                   priorityMap[Number(this.selectedPriority)] || "" : "";
        const pageData = this.getCurrentPageData();
        return html`
            <div>
                <div class="header-container">
                    <h1 class="page-title">Quản lý tin tức</h1>
                    <div class="action-buttons">
                        <vaadin-button theme="primary" @click="${() => (this.showCreateCategoryModal = true)}">
                            <or-icon icon="folder-plus" slot="prefix"></or-icon>
                            Tạo loại tin tức mới
                        </vaadin-button>
                        <vaadin-button theme="primary" @click="${() => this.navigateTo("/blog/create")}">
                            <or-icon icon="plus" slot="prefix"></or-icon>
                            Tạo tin tức mới
                        </vaadin-button>
                    </div>
                </div>
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
                                        placeholder="Nhập tiêu đề hoặc nội dung tin tức ..."
                                        .value="${this.searchKeyword}"
                                        @input="${this.handleSearchInput}"
                                        @keyup="${(e: KeyboardEvent) => e.key === "Enter" && this.handleSearch()}"
                                />
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
                                        .value="${statusDisplayValue}"
                                        @value-changed="${this.handleStatusChange}"
                                        placeholder="Tất cả trạng thái"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>
                            <div class="filter-group">
                                <div class="filter-label">Danh mục</div>
                                <vaadin-combo-box
                                        .items="${categoryOptions}"
                                        .value="${categoryDisplayValue}"
                                        @value-changed="${this.handleCategoryChange}"
                                        placeholder="Tất cả danh mục"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>
                            <div class="filter-group">
                                <div class="filter-label">Độ ưu tiên</div>
                                <vaadin-combo-box
                                        .items="${priorityOptions}"
                                        .value="${priorityDisplayValue}"
                                        @value-changed="${this.handlePriorityChange}"
                                        placeholder="Tất cả độ ưu tiên"
                                        clear-button-visible
                                ></vaadin-combo-box>
                            </div>
                        </div>
                    </div>
                </div>
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
                                                        <th>TIÊU ĐỀ</th>
                                                        <th>DANH MỤC</th>
                                                        <th>TRẠNG THÁI</th>
                                                        <th>ĐỘ ƯU TIÊN</th>
                                                        <th>LƯỢT XEM</th>
                                                        <th>NGÀY TẠO</th>
                                                        <th>THAO TÁC</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    ${pageData.map((blog, idx) => {
                                                        const statusColor = this.getStatusColor(blog.status);
                                                        const priorityColor = this.getPriorityColor(blog.priorityLevel);
                                                        const stt = (this.currentPage - 1) * this.pageSize + idx + 1;
                                                        return html`
                                                            <tr>
                                                                <td>${stt}</td>
                                                                <td class="title-cell">
                                                                    <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                                        <strong>${blog.title}</strong>
                                                                    </div>
                                                                </td>
                                                                <td>${this.getCategoryName(blog.categoryId)}</td>
                                                                <td>
                                <span
                                        class="status-badge"
                                        style="background-color: ${statusColor.bg}; color: ${statusColor.text}; border-color: ${statusColor.border};"
                                >
                                  ${this.getStatusDisplay(blog.status)}
                                </span>
                                                                </td>
                                                                <td>
                                <span
                                        class="priority-badge"
                                        style="background-color: ${priorityColor.bg}; color: ${priorityColor.text}; border-color: ${priorityColor.border};"
                                >
                                  ${this.getPriorityDisplay(blog.priorityLevel)}
                                </span>
                                                                </td>
                                                                <td>${blog.viewCount || 0}</td>
                                                                <td>${this.formatDate(blog.createdAt)}</td>
                                                                <td>
                                                                    <div class="action-icons">
                                                                        <vaadin-icon
                                                                                icon="vaadin:eye"
                                                                                @click="${() => this.handleViewBlog(Number(blog.id))}"
                                                                                title="Xem chi tiết"
                                                                        ></vaadin-icon>
                                                                        <vaadin-icon
                                                                                icon="vaadin:pencil"
                                                                                @click="${() => this.handleEditBlog(Number(blog.id))}"
                                                                                title="Chỉnh sửa"
                                                                        ></vaadin-icon>
                                                                        <vaadin-icon
                                                                                icon="vaadin:trash"
                                                                                @click="${() => this.handleDeleteBlog(Number(blog.id))}"
                                                                                title="Xóa"
                                                                        ></vaadin-icon>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        `;
                                                    })}
                                                    </tbody>
                                                </table>
                                                ${this.renderPagination()}
                                            `
                    }
                </div>
            </div>
            <vaadin-dialog
                    theme="no-padding"
                    .opened="${this.showDeleteDialog}"
                    @opened-changed="${(e: CustomEvent) => (this.showDeleteDialog = e.detail.value)}"
                    .renderer="${(root: HTMLElement) => {
                        if (root.firstElementChild) return;
                        const dialog = document.createElement("div");
                        dialog.style.cssText =
                                "width: 400px; max-width: 90vw; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); padding: 0;";
                        const header = document.createElement("div");
                        header.style.cssText =
                                "background-color: #4d9d2a; color: white; padding: 16px 20px; font-size: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center;";
                        const titleContainer = document.createElement("div");
                        titleContainer.style.cssText = "flex: 1; text-align: center;";
                        titleContainer.textContent = "Xác nhận xóa";
                        const closeBtn = document.createElement("span");
                        closeBtn.innerHTML = "✕";
                        closeBtn.style.cssText = "cursor: pointer; font-size: 20px;";
                        closeBtn.addEventListener("click", () => this.cancelDelete());
                        const placeholder = document.createElement("div");
                        placeholder.style.width = "20px";
                        header.appendChild(placeholder);
                        header.appendChild(titleContainer);
                        header.appendChild(closeBtn);
                        const content = document.createElement("div");
                        content.style.cssText = "padding: 20px; background-color: white;";
                        const message = document.createElement("p");
                        message.style.cssText = "font-size: 14px; margin: 0 0 20px; line-height: 1.5; word-wrap: break-word;";
                        const title = this.itemToDelete?.title || "";
                        const truncatedTitle = title.length > 50 ? title.substring(0, 50) + "..." : title;
                        message.innerHTML = `Bạn có chắc chắn muốn xóa blog <strong>"${truncatedTitle}"</strong> này không?`;
                        const buttonContainer = document.createElement("div");
                        buttonContainer.style.cssText = "display: flex; justify-content: center; gap: 10px; margin-top: 20px;";
                        const btnCancel = document.createElement("button");
                        btnCancel.textContent = "Hủy";
                        btnCancel.style.cssText =
                                "padding: 10px 20px; border-radius: 6px; border: none; background-color: #f3f4f6; color: #374151; cursor: pointer; font-size: 14px; font-weight: 500;";
                        btnCancel.addEventListener("click", () => this.cancelDelete());
                        const btnConfirm = document.createElement("button");
                        btnConfirm.textContent = "Xóa";
                        btnConfirm.style.cssText =
                                "padding: 10px 20px; border-radius: 6px; border: none; background-color: #4d9d2a; color: white; cursor: pointer; font-size: 14px; font-weight: 500;";
                        btnConfirm.addEventListener("click", () => this.confirmDelete());
                        buttonContainer.appendChild(btnCancel);
                        buttonContainer.appendChild(btnConfirm);
                        content.appendChild(message);
                        content.appendChild(buttonContainer);
                        dialog.appendChild(header);
                        dialog.appendChild(content);
                        root.appendChild(dialog);
                    }}"
            ></vaadin-dialog>
            ${
                    this.notification.visible
                            ? html`<div class="notification ${this.notification.isError ? "error" : "success"}">
                                ${this.notification.message}
                            </div>`
                            : ""
            }
            ${
                    this.showCreateCategoryModal
                            ? html`<blog-category-create-modal
                                    .opened="${this.showCreateCategoryModal}"
                                    @close="${() => (this.showCreateCategoryModal = false)}"
                                    @category-created="${this.handleCreateBlogCategory}"
                                    @error="${(e: CustomEvent) => this.showNotification(e.detail, true)}"
                            ></blog-category-create-modal>`
                            : ""
            }
        `;
    }
    stateChanged(state: AppStateKeyed) {}
}
