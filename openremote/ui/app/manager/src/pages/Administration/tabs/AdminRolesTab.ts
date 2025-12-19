import { html, LitElement, css, TemplateResult } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import "@openremote/or-icon"

interface Role {
  id: string
  name: string
  isDefault: boolean
}

interface PermissionItem {
  id: string
  name: string
  level: number
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
  other: boolean
  isCategory?: boolean
}

@customElement("admin-roles-tab")
export class AdminRolesTab extends LitElement {
  @property({ type: String }) selectedCategory: string = ""

  static styles = css`
    :host {
      --primary-color: #0a73db;
      --success-color: #1aaa55;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --border-color: #dfe6f2;
      --bg-light: #f5f7fb;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --header-bg: #A8DCFD;
      display: block;
      height: 100%;
    }

    .roles-content {
      flex: 1;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .content-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .content-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
    }

    .filter-select {
      height: 38px;
      padding: 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      min-width: 180px;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .filter-checkbox-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .filter-search-wrapper {
      position: relative;
    }

    .filter-search-input {
      height: 38px;
      padding: 0 36px 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      min-width: 200px;
    }

    .filter-search-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .filter-search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      color: var(--text-secondary);
    }

    .filter-spacer {
      flex: 1;
    }

    .role-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    .refresh-btn {
      width: 38px;
      height: 38px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-btn:hover {
      background: var(--bg-light);
    }

    .refresh-btn or-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      color: var(--text-secondary);
    }

    .permission-table-wrapper {
      flex: 1;
      overflow: auto;
    }

    .permission-table {
      width: 100%;
      border-collapse: collapse;
    }

    .permission-table thead {
      background: var(--header-bg);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .permission-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }

    .permission-table th.checkbox-col {
      width: 80px;
      text-align: center;
    }

    .permission-table tbody tr {
      border-bottom: 1px solid #f0f0f0;
    }

    .permission-table tbody tr:hover {
      background: #fafafa;
    }

    .permission-table td {
      padding: 10px 16px;
      font-size: 13px;
      color: var(--text-primary);
    }

    .permission-table td.checkbox-col {
      text-align: center;
    }

    .permission-table .category-row {
      background: #f8fafc;
      font-weight: 600;
    }

    .permission-table .category-row td {
      padding-left: 16px;
    }

    .permission-table .level-1 td:first-child {
      padding-left: 32px;
    }

    .permission-table .level-2 td:first-child {
      padding-left: 48px;
    }

    .permission-table .level-3 td:first-child {
      padding-left: 64px;
    }

    .permission-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    .content-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .btn or-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
    }

    .btn-primary {
      background: white;
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    .btn-primary:hover {
      background: var(--bg-light);
    }

    .btn-danger {
      background: white;
      border-color: var(--danger-color);
      color: var(--danger-color);
    }

    .btn-danger:hover {
      background: #fef2f2;
    }
  `

  @state() private selectedRoleId: string = "role2"
  @state() private searchPermission: string = ""
  @state() private selectAll: boolean = false
  @state() private showDefaultOnly: boolean = false

  private roles: Role[] = [
    { id: "role1", name: "Biên tập viên cấp xã/phường", isDefault: false },
    { id: "role2", name: "Quản lý cấp xã/ phường", isDefault: true },
    { id: "role3", name: "Quản lý cấp tỉnh/thành phố", isDefault: true },
    { id: "role4", name: "Chuyển đổi văn bản", isDefault: false },
    { id: "role5", name: "Khóa quyền sử dụng", isDefault: false },
    { id: "role6", name: "Quản trị hệ thống", isDefault: true },
    { id: "role7", name: "Thiết bị cảnh báo", isDefault: false },
  ]

  @state() private permissions: PermissionItem[] = [
    { id: "home", name: "Trang chủ", level: 0, view: true, add: true, edit: false, delete: true, other: true, isCategory: true },
    { id: "home1", name: "Trang chủ", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "home2", name: "Phát nhanh lịch phát", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "schedule", name: "Lịch phát", level: 0, view: true, add: false, edit: false, delete: false, other: false, isCategory: true },
    { id: "schedule1", name: "Quản lý lịch phát", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "schedule2", name: "Duyệt lịch phát", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "schedule3", name: "Duyệt lịch phát tự động", level: 1, view: true, add: false, edit: true, delete: false, other: true },
    { id: "schedule4", name: "Lịch sử bản tin", level: 1, view: true, add: true, edit: true, delete: true, other: true },
    { id: "content", name: "Chuyên mục và nội dung", level: 0, view: true, add: true, edit: true, delete: true, other: true, isCategory: true },
    { id: "content1", name: "Quản lý chuyên mục và nội dung", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "content2", name: "Duyệt nội dung", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "content3", name: "Quản lý danh sách phát", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "report", name: "Báo cáo", level: 0, view: false, add: false, edit: false, delete: false, other: false, isCategory: true },
    { id: "report1", name: "Tình trạng hoạt động của thiết bị", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "report2", name: "Bản tin đã phát", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin", name: "Quản trị", level: 0, view: false, add: false, edit: false, delete: false, other: false, isCategory: true },
    { id: "admin1", name: "Danh mục", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin1a", name: "Danh mục thiết bị âm thanh", level: 2, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin1b", name: "Danh mục thiết bị cảnh báo", level: 2, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin1c", name: "Danh mục Micro IP", level: 2, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin2", name: "Tiếp sóng", level: 1, view: true, add: true, edit: true, delete: true, other: true },
    { id: "admin3", name: "Lĩnh vực bản tin", level: 1, view: true, add: true, edit: false, delete: true, other: false },
    { id: "admin4", name: "Đơn vị hành chính", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin5", name: "Nhà cung cấp", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "admin6", name: "Nhà sản xuất", level: 1, view: true, add: true, edit: true, delete: true, other: true },
    { id: "user", name: "Người dùng", level: 0, view: true, add: true, edit: true, delete: true, other: true, isCategory: true },
    { id: "user1", name: "Danh sách nhân viên", level: 1, view: false, add: true, edit: false, delete: false, other: false },
    { id: "user2", name: "Nhật ký hoạt động người dùng", level: 1, view: true, add: false, edit: true, delete: true, other: false },
    { id: "role", name: "Phân quyền", level: 0, view: true, add: true, edit: true, delete: true, other: true, isCategory: true },
    { id: "config", name: "Cấu hình", level: 0, view: true, add: true, edit: true, delete: true, other: true, isCategory: true },
    { id: "config1", name: "Tham số thiết bị", level: 1, view: false, add: false, edit: false, delete: false, other: false },
    { id: "config2", name: "Nhà sản xuất", level: 1, view: true, add: true, edit: true, delete: true, other: true },
  ]

  private togglePermission(id: string, field: 'view' | 'add' | 'edit' | 'delete' | 'other'): void {
    this.permissions = this.permissions.map(p => {
      if (p.id === id) {
        return { ...p, [field]: !p[field] }
      }
      return p
    })
  }

  private toggleSelectAll(): void {
    this.selectAll = !this.selectAll
    this.permissions = this.permissions.map(p => ({
      ...p,
      view: this.selectAll,
      add: this.selectAll,
      edit: this.selectAll,
      delete: this.selectAll,
      other: this.selectAll
    }))
  }

  private getSelectedRoleName(): string {
    const role = this.roles.find(r => r.id === this.selectedRoleId)
    return role ? role.name : ""
  }

  protected render(): TemplateResult {
    return html`
      <div class="roles-content">
        <div class="content-header">PHÂN QUYỀN</div>
        <div class="content-filters">
          <select class="filter-select">
            <option>${this.getSelectedRoleName()}</option>
          </select>
          <label class="filter-checkbox-group">
            <input type="checkbox" class="role-checkbox" .checked=${this.showDefaultOnly} @change=${() => this.showDefaultOnly = !this.showDefaultOnly} />
            <span>Chọn quyền mặc định</span>
          </label>
          <div class="filter-search-wrapper">
            <input type="text" class="filter-search-input" placeholder="Nhập tên chức năng" 
                   .value=${this.searchPermission} @input=${(e: Event) => this.searchPermission = (e.target as HTMLInputElement).value} />
            <or-icon class="filter-search-icon" icon="magnify"></or-icon>
          </div>
          <div class="filter-spacer"></div>
          <label class="filter-checkbox-group">
            <input type="checkbox" class="role-checkbox" .checked=${this.selectAll} @change=${this.toggleSelectAll} />
            <span>Chọn tất cả</span>
          </label>
          <button class="refresh-btn">
            <or-icon icon="refresh"></or-icon>
          </button>
        </div>
        <div class="permission-table-wrapper">
          <table class="permission-table">
            <thead>
              <tr>
                <th>Chức năng</th>
                <th class="checkbox-col">Xem</th>
                <th class="checkbox-col">Thêm</th>
                <th class="checkbox-col">Sửa</th>
                <th class="checkbox-col">Xóa</th>
                <th class="checkbox-col">Xử lý khác</th>
              </tr>
            </thead>
            <tbody>
              ${this.permissions
        .filter(p => p.name.toLowerCase().includes(this.searchPermission.toLowerCase()))
        .map(permission => this.renderPermissionRow(permission))}
            </tbody>
          </table>
        </div>
        <div class="content-footer">
          <button class="btn btn-primary">
            <or-icon icon="content-save"></or-icon>
            Lưu
          </button>
          <button class="btn btn-danger">
            <or-icon icon="close"></or-icon>
            Hủy
          </button>
        </div>
      </div>
    `
  }

  private renderPermissionRow(permission: PermissionItem): TemplateResult {
    const rowClass = permission.isCategory ? 'category-row' : `level-${permission.level}`
    return html`
      <tr class="${rowClass}">
        <td>${permission.name}</td>
        <td class="checkbox-col">
          <input type="checkbox" class="permission-checkbox" 
                 .checked=${permission.view} 
                 @change=${() => this.togglePermission(permission.id, 'view')} />
        </td>
        <td class="checkbox-col">
          <input type="checkbox" class="permission-checkbox" 
                 .checked=${permission.add} 
                 @change=${() => this.togglePermission(permission.id, 'add')} />
        </td>
        <td class="checkbox-col">
          <input type="checkbox" class="permission-checkbox" 
                 .checked=${permission.edit} 
                 @change=${() => this.togglePermission(permission.id, 'edit')} />
        </td>
        <td class="checkbox-col">
          <input type="checkbox" class="permission-checkbox" 
                 .checked=${permission.delete} 
                 @change=${() => this.togglePermission(permission.id, 'delete')} />
        </td>
        <td class="checkbox-col">
          <input type="checkbox" class="permission-checkbox" 
                 .checked=${permission.other} 
                 @change=${() => this.togglePermission(permission.id, 'other')} />
        </td>
      </tr>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "admin-roles-tab": AdminRolesTab
  }
}
