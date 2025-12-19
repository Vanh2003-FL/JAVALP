import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { adminStyles } from "./admin.styles";
import "./tabs/AdminCatalogTab";
import "./tabs/AdminUsersTab";
import "./tabs/AdminRolesTab";
import "./tabs/AdminConfigTab";
import "@openremote/or-icon";

type AdminTabKey = "catalog" | "users" | "roles" | "settings";
type TreeNode = { id: string; label: string; children?: TreeNode[] };
type CategoryOption = { id: string; label: string };
export type CategoryKey = "audio" | "warning" | "micro" | "relay" | "news" | "admin" | "vendor" | "maker" | "source" | "channel";

@customElement("admin-shell")
export class AdminShell extends LitElement {
    static styles = [adminStyles];

    @state()
    private activeTab: AdminTabKey = "catalog";

    @state()
    private expanded = new Set<string>(["hanoi"]);

    @state()
    private categoryOpen = false;
    @state()
    private selectedCategory: CategoryKey = "audio";

    private categoryOptions: CategoryOption[] = [
        { id: "audio", label: "Thiết bị âm thanh" },
        // { id: "warning", label: "Thiết bị cảnh báo" },
        { id: "micro", label: "Micro IP" },
        { id: "relay", label: "Tiếp sóng" },
        { id: "news", label: "Lĩnh vực bản tin" },
        { id: "admin", label: "Đơn vị hành chính" },
        { id: "source", label: "Nguồn tiếp sóng" },
        { id: "channel", label: "Kênh" },
        // { id: "vendor", label: "Nhà cung cấp" },
        // { id: "maker", label: "Nhà sản xuất" },
    ];

    // User category options for Users tab
    @state()
    private selectedUserCategory: "employee" | "activity_log" = "employee";

    private userCategoryOptions: CategoryOption[] = [
        { id: "employee", label: "Nhân viên" },
        { id: "activity_log", label: "Nhật ký hoạt động người dùng" },
    ];

    // Config category options for Settings tab
    @state()
    private selectedConfigCategory: "system" | "file" = "system";

    private configCategoryOptions: CategoryOption[] = [
        { id: "system", label: "Cấu hình hệ thống" },
        { id: "file", label: "Cấu hình chuẩn hóa file" },
    ];

    // Roles sidebar data
    @state()
    private selectedRoleId: string = "role2";
    @state()
    private searchRole: string = "";

    private rolesData = [
        { id: "role1", name: "Biên tập viên cấp xã/phường", isDefault: false },
        { id: "role2", name: "Quản lý cấp xã/ phường", isDefault: true },
        { id: "role3", name: "Quản lý cấp tỉnh/thành phố", isDefault: true },
        { id: "role4", name: "Chuyển đổi văn bản", isDefault: false },
        { id: "role5", name: "Khóa quyền sử dụng", isDefault: false },
        { id: "role6", name: "Quản trị hệ thống", isDefault: true },
        { id: "role7", name: "Thiết bị cảnh báo", isDefault: false },
    ];

    private treeData: TreeNode[] = [
        {
            id: "hanoi",
            label: "Thành phố Hà Nội",
            children: [
                { id: "hk", label: "Phường Hoàn Kiếm" },
                { id: "bd", label: "Phường Ba Đình" },
                { id: "hk2", label: "Phường Hoàn Kiếm" },
                { id: "bd2", label: "Phường Ba Đình" },
            ],
        },
    ];

    private tabs: { key: AdminTabKey; label: string }[] = [
        { key: "catalog", label: "Danh mục" },
        { key: "users", label: "Người dùng" },
        { key: "roles", label: "Phân quyền" },
        { key: "settings", label: "Cấu hình" },
    ];

    protected render(): TemplateResult {
        return html`
                <div class="page">
                    <div class="top-row">
                        <div class="tabs">
                            ${this.tabs.map(({ key, label }) => html`
                                <div
                                    class="tab ${this.activeTab === key ? "active" : ""}"
                                    @click=${() => this.onTabClick(key)}
                                >
                                    ${label}
                                </div>
                            `)}
                        </div>
                        <div class="tabs-right">
                            ${this.activeTab === "roles" ? null : html`
                            <div class="category-dropdown" @click=${this.toggleCategory}>
                                <span class="category-selected">${this.getDropdownLabel()}</span>
                                <or-icon icon="chevron-down"></or-icon>
                            </div>
                            ${this.categoryOpen ? html`
                                <div class="category-menu" @click=${(e: Event) => e.stopPropagation()}>
                                    ${this.activeTab === "catalog" ? html`
                                        <div class="category-placeholder">-- Chọn danh mục --</div>
                                        ${this.categoryOptions.map(opt => html`
                                            <label class="category-item">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    .checked=${this.selectedCategory === opt.id}
                                                    @change=${() => this.selectCategory(opt.id as CategoryKey)}
                                                />
                                                <span>${opt.label}</span>
                                            </label>
                                        `)}
                                    ` : this.activeTab === "users" ? html`
                                        <div class="category-placeholder">-- Chọn loại --</div>
                                        ${this.userCategoryOptions.map(opt => html`
                                            <label class="category-item">
                                                <input
                                                    type="radio"
                                                    name="userCategory"
                                                    .checked=${this.selectedUserCategory === opt.id}
                                                    @change=${() => this.selectUserCategory(opt.id as "employee" | "activity_log")}
                                                />
                                                <span>${opt.label}</span>
                                            </label>
                                        `)}
                                    ` : this.activeTab === "settings" ? html`
                                        <div class="category-placeholder">-- Chọn cấu hình --</div>
                                        ${this.configCategoryOptions.map(opt => html`
                                            <label class="category-item">
                                                <input
                                                    type="radio"
                                                    name="configCategory"
                                                    .checked=${this.selectedConfigCategory === opt.id}
                                                    @change=${() => this.selectConfigCategory(opt.id as "system" | "file")}
                                                />
                                                <span>${opt.label}</span>
                                            </label>
                                        `)}
                                    ` : null}
                                </div>
                            ` : null}
                            `}
                        </div>
                    </div>

                    <div class="body-row" style="${this.activeTab === 'settings' || (this.activeTab === 'catalog' && (this.selectedCategory === 'news' || this.selectedCategory === 'admin' || this.selectedCategory === 'source' || this.selectedCategory === 'channel')) ? 'grid-template-columns: 1fr;' : ''}">
                        ${this.activeTab !== "settings" && !(this.activeTab === 'catalog' && (this.selectedCategory === 'news' || this.selectedCategory === 'admin' || this.selectedCategory === 'source' || this.selectedCategory === 'channel')) ? (this.activeTab === "roles" ? html`
                        <aside class="sidepanel">
                            <div class="sidepanel-search" style="padding: 12px; display: flex; gap: 8px;">
                                <input type="text" placeholder="Nhập mã/ tên" style="flex: 1;" 
                                       .value=${this.searchRole} @input=${(e: Event) => this.searchRole = (e.target as HTMLInputElement).value} />
                                <button class="add-btn" style="width: 36px; height: 36px; background: var(--or-app-color, #0a73db); border: none; border-radius: 4px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                    <or-icon icon="plus"></or-icon>
                                </button>
                            </div>
                            <div class="roles-header" style="display: flex; padding: 10px 12px; background: #f5f7fb; border-bottom: 1px solid #dfe6f2; font-size: 12px; font-weight: 600; color: #6b7280;">
                                <span style="flex: 1;">Tên quyền</span>
                                <span style="width: 90px; text-align: center;">Quyền mặc định</span>
                            </div>
                            <div class="roles-list" style="flex: 1; overflow-y: auto;">
                                ${this.rolesData.filter(r => r.name.toLowerCase().includes(this.searchRole.toLowerCase())).map(role => html`
                                    <div class="role-item" style="display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; ${role.id === this.selectedRoleId ? 'background: #eef5ff;' : ''}" 
                                         @click=${() => this.selectRole(role.id)}>
                                        <span style="flex: 1; font-size: 13px; ${role.id === this.selectedRoleId ? 'color: #0a73db; font-weight: 500;' : 'color: #111827;'}">${role.name}</span>
                                        <div style="width: 90px; display: flex; justify-content: center;">
                                            <input type="checkbox" style="width: 18px; height: 18px; accent-color: #0a73db; cursor: pointer;" .checked=${role.isDefault} @click=${(e: Event) => e.stopPropagation()} />
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </aside>
                        ` : html`
                        <aside class="sidepanel">
                            <div class="sidepanel-header">
                                <span class="sidepanel-title">Danh mục</span>
                            </div>
                            <div class="sidepanel-search">
                                <input type="text" placeholder="Nhập mã/ tên" />
                                <or-icon class="icon-search" icon="magnify"></or-icon>
                            </div>
                            <ul class="tree-root">
                                ${this.treeData.map((node) => this.renderNode(node))}
                            </ul>
                        </aside>
                        `) : null}

                        <div class="content" style="${this.activeTab === 'settings' || (this.activeTab === 'catalog' && (this.selectedCategory === 'news' || this.selectedCategory === 'admin')) ? 'width: 100%; flex: 1 1 100%;' : ''}">
                            ${this.renderTab()}
                        </div>
                    </div>
                </div>
            `;
    }

    private onTabClick(tab: AdminTabKey): void {
        if (this.activeTab === tab) {
            return;
        }
        this.activeTab = tab;
    }

    private toggleNode(id: string): void {
        const next = new Set(this.expanded);
        next.has(id) ? next.delete(id) : next.add(id);
        this.expanded = next;
    }

    private toggleCategory(): void {
        this.categoryOpen = !this.categoryOpen;
    }

    private selectCategory(id: CategoryKey): void {
        this.selectedCategory = id;
        this.categoryOpen = false;
    }

    private getCategoryLabel(): string {
        const found = this.categoryOptions.find(o => o.id === this.selectedCategory);
        return found ? found.label : "Chọn danh mục";
    }

    private getDropdownLabel(): string {
        if (this.activeTab === "catalog") {
            return this.getCategoryLabel();
        } else if (this.activeTab === "users") {
            const found = this.userCategoryOptions.find(o => o.id === this.selectedUserCategory);
            return found ? found.label : "Nhân viên";
        } else if (this.activeTab === "settings") {
            const found = this.configCategoryOptions.find(o => o.id === this.selectedConfigCategory);
            return found ? found.label : "Cấu hình hệ thống";
        }
        return "";
    }

    private selectUserCategory(id: "employee" | "activity_log"): void {
        this.selectedUserCategory = id;
        this.categoryOpen = false;
    }

    private selectConfigCategory(id: "system" | "file"): void {
        this.selectedConfigCategory = id;
        this.categoryOpen = false;
    }

    private selectRole(roleId: string): void {
        this.selectedRoleId = roleId;
    }

    private renderNode(node: TreeNode): TemplateResult {
        const hasChildren = !!node.children && node.children.length > 0;
        const isOpen = this.expanded.has(node.id);
        return html`
                <li class="tree-item ${isOpen ? "open" : ""}">
                    <div class="tree-row" @click=${() => hasChildren && this.toggleNode(node.id)}>
                        ${hasChildren
                ? html`<or-icon class="caret" icon=${isOpen ? "chevron-down" : "chevron-right"}></or-icon>`
                : html`<span class="caret spacer"></span>`}
                        <or-icon class="tree-icon" icon="office-building-outline"></or-icon>
                        <span class="tree-label">${node.label}</span>
                    </div>
                    ${hasChildren && isOpen
                ? html`<ul class="tree-children">
                            ${node.children!.map((child) => this.renderNode(child))}
                        </ul>`
                : null}
                </li>
            `;
    }

    private renderTab(): TemplateResult {
        switch (this.activeTab) {
            case "catalog":
                return html`<admin-catalog-tab .selectedCategory=${this.selectedCategory}></admin-catalog-tab>`;
            case "users":
                return html`<admin-users-tab .selectedUserCategory=${this.selectedUserCategory}></admin-users-tab>`;
            case "roles":
                return html`<admin-roles-tab></admin-roles-tab>`;
            case "settings":
                return html`<admin-config-tab .selectedConfigCategory=${this.selectedConfigCategory}></admin-config-tab>`;
            default:
                return html``;
        }
    }

}

