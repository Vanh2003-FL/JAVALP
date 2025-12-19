import { html, LitElement, type TemplateResult, css } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import "@openremote/or-icon"

type UserCategoryKey = "employee" | "activity_log"

interface Employee {
  id: string
  code: string
  name: string
  birthDate: string
  gender: string
  phone: string
  email: string
  address: string
  status: string
}

interface ActivityLog {
  id: string
  timestamp: string
  userName: string
  action: string
  content: string
}

@customElement("admin-users-tab")
export class AdminUsersTab extends LitElement {
  @property({ type: String }) selectedUserCategory: UserCategoryKey = "employee"

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
      display: block;
      height: 100%;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background-color: white;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #eef0f3;
      padding: 10px 12px;
      border-radius: 6px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .filters-section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      box-sizing: border-box;
      position: relative;
      z-index: 50;
    }

    .filter-group {
      display: flex;
      gap: 6px;
      align-items: center;
      min-width: 180px;
      flex: 0 0 auto;
      position: relative;
    }

    .filter-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #cfd6e3;
      border-radius: 6px;
      font-size: 14px;
      background-color: white;
      color: var(--text-primary);
      box-sizing: border-box;
      height: 38px;
    }

    .filter-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .filter-select {
      padding: 8px 10px;
      border: 1px solid #cfd6e3;
      border-radius: 6px;
      font-size: 14px;
      background-color: white;
      color: var(--text-primary);
      box-sizing: border-box;
      height: 38px;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: #0962c0;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
      position: relative;
      z-index: 1;
    }

    .toolbar-btn {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .toolbar-btn.import {
      background: #dcfce7;
      color: #16a34a;
    }

    .toolbar-btn.export {
      background: #dbeafe;
      color: #2563eb;
    }

    .toolbar-btn.create {
      background: var(--primary-color);
      color: white;
    }

    .toolbar-btn:hover {
      transform: scale(1.05);
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    table {
      width: 100%;
      min-width: 1200px;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background-color: #A8DCFD;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 700;
      color: #1f2937;
      white-space: nowrap;
      height: 44px;
      box-sizing: border-box;
      border-right: 1px solid #dfe6f2;
    }

    th:last-child {
      border-right: none;
    }

    tbody tr {
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.15s;
    }

    tbody tr:nth-child(even) {
      background-color: #f9fbff;
    }

    tbody tr:hover {
      background-color: #eef5ff;
    }

    td {
      padding: 10px 12px;
      color: var(--text-primary);
      border-right: 1px solid #dfe6f2;
      box-sizing: border-box;
    }

    td:last-child {
      border-right: none;
    }

    .code-link {
      color: #0a73db;
      text-decoration: none;
      cursor: pointer;
      font-weight: 600;
    }

    .code-link:hover {
      text-decoration: underline;
    }

    .status-text {
      font-weight: 600;
    }

    .status-active {
      color: #1aaa55;
    }

    .status-inactive {
      color: #f59e0b;
    }

    .status-pending {
      color: #6b7280;
    }

    .action-icons {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .action-btn.reset {
      background: #fef9c3;
      color: #ca8a04;
    }

    .action-btn.edit {
      background: #dbeafe;
      color: #2563eb;
    }

    .action-btn.delete {
      background: #fee2e2;
      color: #ef4444;
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      margin-top: 8px;
    }

    .pagination-info {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .pagination-list {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 4px;
    }

    .pagination-list li a {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border-radius: 6px;
      background: white;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
    }

    .pagination-list li a:hover {
      background: var(--bg-light);
    }

    .pagination-list li a.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group.full-width {
      flex: 0 0 100%;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-group label .required {
      color: var(--danger-color);
    }

    .form-input {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
    }

    .form-input:focus {
      border-color: var(--primary-color);
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #f9fafb;
    }

    .modal-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .modal-btn.primary {
      background: var(--primary-color);
      color: white;
    }

    .modal-btn.danger {
      background: white;
      color: var(--danger-color);
      border-color: var(--danger-color);
    }

    .refresh-btn {
      width: 32px;
      height: 32px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Import Modal Styles */
    .file-upload-area {
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .file-upload-area:hover {
      border-color: var(--primary-color);
      background-color: #f0f7ff;
    }

    .file-upload-area or-icon {
      --or-icon-width: 24px;
      --or-icon-height: 24px;
      color: var(--primary-color);
    }

    .file-upload-area input {
      display: none;
    }

    .file-name {
      color: var(--text-primary);
      font-size: 14px;
    }

    .file-placeholder {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .import-result {
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .import-result.success {
      background: #dcfce7;
      color: #166534;
    }

    .import-result.error {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Tree View Styles */
    .tree-node {
      padding: 2px 0;
    }

    .tree-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .tree-row.highlighted {
      background: #eef5ff;
    }

    .tree-row or-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
      color: #6b7280;
      cursor: pointer;
    }

    .tree-row or-icon.highlighted {
      color: #0a73db;
    }

    .tree-children {
      margin-left: 24px;
    }

    .tree-spacer {
      width: 16px;
    }

    .tree-checkbox-wrapper {
      position: relative;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tree-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #0a73db;
    }

    .tree-partial-checkbox {
      width: 18px;
      height: 18px;
      background: #0a73db;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .tree-partial-checkbox span {
      color: white;
      font-weight: bold;
      font-size: 16px;
      line-height: 1;
    }

    .tree-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      color: #6b7280;
    }

    .tree-icon.highlighted {
      color: #0a73db;
    }

    .tree-label {
      font-size: 14px;
      color: #374151;
    }

    /* Action Dropdown Styles */
    .action-dropdown {
      position: relative;
    }

    .action-dropdown-trigger {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .action-dropdown-trigger or-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
    }

    .action-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #dfe6f2;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 4px;
      min-width: 180px;
    }

    .action-dropdown-header {
      padding: 10px 14px;
      color: #6b7280;
      font-size: 13px;
      border-bottom: 1px solid #eee;
      font-style: italic;
    }

    .action-dropdown-options {
      padding: 8px 0;
    }

    .action-dropdown-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 14px;
    }

    .action-dropdown-option input {
      width: 16px;
      height: 16px;
      accent-color: #0a73db;
    }

    /* Form Layout Styles */
    .modal-form-layout {
      display: flex;
      gap: 24px;
    }

    .modal-form-left {
      flex: 1;
    }

    .modal-form-right {
      flex: 0 0 320px;
      border-left: 1px solid #dfe6f2;
      padding-left: 24px;
    }

    .area-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      display: block;
    }

    .area-search-wrapper {
      position: relative;
      margin-bottom: 12px;
    }

    .area-search-input {
      width: 100%;
      padding-right: 40px;
      box-sizing: border-box;
    }

    .area-search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      color: #6b7280;
      pointer-events: none;
    }

    .area-tree-container {
      border: 1px solid #dfe6f2;
      border-radius: 6px;
      padding: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .gender-row {
      align-items: center;
      flex-wrap: nowrap;
    }

    .gender-options {
      display: flex;
      gap: 20px;
      align-items: center;
      flex: 0 0 auto;
    }

    .gender-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    .gender-label input {
      width: 18px;
      height: 18px;
    }

    .birth-date-label-wrapper {
      flex: 0 0 80px;
      margin-left: 40px;
    }

    .birth-date-label {
      font-size: 14px;
      font-weight: 500;
    }

    .birth-date-input-wrapper {
      flex: 1;
    }
  `

  @state() private isModalOpen = false
  @state() private isImportModalOpen = false
  @state() private selectedFile: File | null = null
  @state() private currentPage = 1
  @state() private areaExpandedNodes = new Set<string>(["hanoi"])
  @state() private areaSelectedNodes = new Set<string>()
  @state() private actionDropdownOpen = false
  @state() private selectedActions = new Set<string>()
  private itemsPerPage = 10

  private areaTreeData = [
    {
      id: "hanoi",
      label: "Thành phố Hà Nội",
      children: [
        {
          id: "hoankiem",
          label: "Phường Hoàn Kiếm",
          children: [
            { id: "hk1", label: "Tổ 1" },
            { id: "hk2", label: "Tổ 2" },
          ]
        },
        {
          id: "badinh",
          label: "Phường Ba Đình",
          children: [
            { id: "bd1", label: "Tổ 1" },
            { id: "bd2", label: "Tổ 2" },
          ]
        },
        { id: "dongda", label: "Phường Đống Đa" },
        { id: "caugiay", label: "Phường Cầu Giấy" },
      ],
    },
  ]

  private mockEmployees: Employee[] = [
    { id: "1", code: "12562323", name: "Nguyễn Văn A", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "2", code: "012556363", name: "Nguyễn Văn B", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "3", code: "2256545", name: "Nguyễn Văn C", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "4", code: "012322", name: "Nguyễn Thị D", birthDate: "15/10/2025", gender: "Nữ", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "5", code: "22545666", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đang sử dụng" },
    { id: "6", code: "22456632", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "7", code: "12348525", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Đã kích hoạt" },
    { id: "8", code: "1156222", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Chưa kích hoạt" },
    { id: "9", code: "115222556", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Chưa kích hoạt" },
    { id: "10", code: "01265652", name: "Cụm 04 TT D", birthDate: "15/10/2025", gender: "Nam", phone: "", email: "nguyenvana@gmail.com", address: "Phường Văn Quán, Thành p...", status: "Chưa kích hoạt" },
  ]

  private mockActivityLogs: ActivityLog[] = [
    { id: "1", timestamp: "15/10/2025 00:00", userName: "Nguyễn Văn A", action: "Đăng nhập", content: "" },
    { id: "2", timestamp: "15/10/2025 00:00", userName: "Nguyễn Văn B", action: "Thêm", content: "" },
    { id: "3", timestamp: "15/10/2025 00:00", userName: "Nguyễn Văn C", action: "Cập nhật", content: "" },
    { id: "4", timestamp: "15/10/2025 00:00", userName: "Nguyễn Thị D", action: "Xóa", content: "" },
    { id: "5", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Đăng xuất", content: "" },
    { id: "6", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Đăng nhập", content: "" },
    { id: "7", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Thêm", content: "" },
    { id: "8", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Cập nhật", content: "" },
    { id: "9", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Hủy", content: "" },
    { id: "10", timestamp: "15/10/2025 00:00", userName: "Cụm 04 TT D", action: "Đăng nhập", content: "" },
  ]

  private toggleAreaNode(id: string): void {
    const next = new Set(this.areaExpandedNodes)
    next.has(id) ? next.delete(id) : next.add(id)
    this.areaExpandedNodes = next
  }

  private getAllChildIds(node: { id: string; children?: any[] }): string[] {
    const ids: string[] = [node.id]
    if (node.children) {
      node.children.forEach(child => {
        ids.push(...this.getAllChildIds(child))
      })
    }
    return ids
  }

  private findNodeById(nodes: any[], id: string): any | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = this.findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  private isPartiallySelected(node: { id: string; children?: any[] }): boolean {
    if (!node.children || node.children.length === 0) return false
    const childIds = this.getAllChildIds(node).filter(id => id !== node.id)
    const selectedCount = childIds.filter(id => this.areaSelectedNodes.has(id)).length
    return selectedCount > 0 && selectedCount < childIds.length
  }

  private isFullySelected(node: { id: string; children?: any[] }): boolean {
    if (!node.children || node.children.length === 0) {
      return this.areaSelectedNodes.has(node.id)
    }
    const childIds = this.getAllChildIds(node)
    return childIds.every(id => this.areaSelectedNodes.has(id))
  }

  private toggleAreaSelection(id: string, node?: any): void {
    const next = new Set(this.areaSelectedNodes)
    const targetNode = node || this.findNodeById(this.areaTreeData, id)

    if (targetNode) {
      const allIds = this.getAllChildIds(targetNode)
      const isCurrentlySelected = allIds.every(childId => next.has(childId))

      if (isCurrentlySelected) {
        // Unselect all
        allIds.forEach(childId => next.delete(childId))
      } else {
        // Select all
        allIds.forEach(childId => next.add(childId))
      }
    } else {
      // Simple toggle for leaf nodes
      next.has(id) ? next.delete(id) : next.add(id)
    }

    this.areaSelectedNodes = next
  }

  private openModal(): void {
    this.isModalOpen = true
  }

  private closeModal(): void {
    this.isModalOpen = false
  }

  private openImportModal(): void {
    this.isImportModalOpen = true
    this.selectedFile = null
  }

  private closeImportModal(): void {
    this.isImportModalOpen = false
    this.selectedFile = null
  }

  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]
    }
  }

  private handleUpload(): void {
    if (!this.selectedFile) {
      alert("Vui lòng chọn file trước khi tải lên")
      return
    }
    // Mock upload - in real app, call API here
    console.log("Uploading:", this.selectedFile.name)
    this.closeImportModal()
  }

  private toggleActionDropdown(): void {
    this.actionDropdownOpen = !this.actionDropdownOpen
  }

  private toggleAction(action: string): void {
    const next = new Set(this.selectedActions)
    if (action === 'all') {
      // Toggle all
      if (next.has('all')) {
        next.clear()
      } else {
        next.clear()
        next.add('all')
        next.add('login')
        next.add('logout')
        next.add('add')
        next.add('update')
        next.add('delete')
        next.add('cancel')
      }
    } else {
      if (next.has(action)) {
        next.delete(action)
        next.delete('all') // Uncheck "all" if any individual is unchecked
      } else {
        next.add(action)
      }
    }
    this.selectedActions = next
  }

  private getActionLabel(): string {
    if (this.selectedActions.size === 0) return 'Hành động'
    if (this.selectedActions.has('all')) return 'Tất cả'
    return `${this.selectedActions.size} đã chọn`
  }

  private renderAreaTreeNode(node: { id: string; label: string; children?: { id: string; label: string; children?: any[] }[] }): TemplateResult {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = this.areaExpandedNodes.has(node.id)
    const isFullySelected = this.isFullySelected(node)
    const isPartial = this.isPartiallySelected(node)
    const isHighlighted = isFullySelected || isPartial

    return html`
      <div class="tree-node">
        <div class="tree-row ${isHighlighted ? 'highlighted' : ''}" @click=${() => hasChildren && this.toggleAreaNode(node.id)}>
          ${hasChildren
        ? html`<or-icon icon="${isExpanded ? 'chevron-down' : 'chevron-right'}"></or-icon>`
        : html`<span class="tree-spacer"></span>`
      }
          <div class="tree-checkbox-wrapper">
            ${isPartial ? html`
              <div class="tree-partial-checkbox" @click=${(e: Event) => { e.stopPropagation(); this.toggleAreaSelection(node.id, node); }}>
                <span>−</span>
              </div>
            ` : html`
              <input type="checkbox" class="tree-checkbox"
                     .checked=${isFullySelected}
                     @click=${(e: Event) => e.stopPropagation()}
                     @change=${() => this.toggleAreaSelection(node.id, node)} />
            `}
          </div>
          <or-icon icon="office-building-outline" class="tree-icon ${isHighlighted ? 'highlighted' : ''}"></or-icon>
          <span class="tree-label">${node.label}</span>
        </div>
        ${hasChildren && isExpanded ? html`
          <div class="tree-children">
            ${node.children!.map(child => this.renderAreaTreeNode(child))}
          </div>
        ` : null}
      </div>
    `
  }

  private getStatusClass(status: string): string {
    if (status.includes("Đã kích hoạt") || status.includes("Đang sử dụng")) return "status-active"
    if (status.includes("Chưa kích hoạt")) return "status-inactive"
    return "status-pending"
  }

  private renderEmployeeRow(emp: Employee): TemplateResult {
    return html`
      <tr>
        <td>${emp.code}</td>
        <td><span class="code-link" @click=${this.openModal}>${emp.name}</span></td>
        <td>${emp.birthDate}</td>
        <td>${emp.gender}</td>
        <td>${emp.phone}</td>
        <td>${emp.email}</td>
        <td>${emp.address}</td>
        <td><span class="${this.getStatusClass(emp.status)}">${emp.status}</span></td>
        <td>
          <div class="action-icons">
            <button class="action-btn reset" title="Reset mật khẩu"><or-icon icon="lock-reset"></or-icon></button>
            <button class="action-btn edit"><or-icon icon="pencil"></or-icon></button>
            <button class="action-btn delete"><or-icon icon="delete"></or-icon></button>
          </div>
        </td>
      </tr>
    `
  }

  private renderModal(): TemplateResult | null {
    if (!this.isModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">THÔNG TIN CHI TIẾT</span>
            <button class="refresh-btn">
              <or-icon icon="refresh"></or-icon>
            </button>
          </div>
          <div class="modal-body" style="display: flex; gap: 24px;">
            <!-- Left: Form -->
            <div style="flex: 1;">
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Mã nhân viên <span class="required">*</span></label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="text" class="form-input" placeholder="Nhập mã nhân viên" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Họ tên nhân viên <span class="required">*</span></label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="text" class="form-input" placeholder="Nhập tên nhân viên" />
                </div>
              </div>
              <div class="form-row" style="align-items: center; flex-wrap: nowrap;">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Giới tính <span class="required">*</span></label>
                </div>
                <div style="display: flex; gap: 20px; align-items: center; flex: 0 0 auto;">
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer;">
                    <input type="radio" name="gender" value="nam" style="width: 18px; height: 18px;" />
                    <span>Nam</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer;">
                    <input type="radio" name="gender" value="nu" style="width: 18px; height: 18px;" />
                    <span>Nữ</span>
                  </label>
                </div>
                <div style="flex: 0 0 80px; margin-left: 40px;">
                  <label style="font-size: 14px; font-weight: 500;">Ngày sinh</label>
                </div>
                <div style="flex: 1;">
                  <input type="date" class="form-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Email <span class="required">*</span></label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="email" class="form-input" placeholder="Nhập email" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Số điện thoại</label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="tel" class="form-input" placeholder="Nhập SĐT" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Số hộ chiếu/CCCD <span class="required">*</span></label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="text" class="form-input" placeholder="Nhập số hộ chiếu/ CCCD" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Chức vụ</label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="text" class="form-input" placeholder="Nhập tên chức vụ" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;">
                  <label>Địa chỉ</label>
                </div>
                <div class="form-group" style="flex: 1;">
                  <select class="form-input">
                    <option value="">Tỉnh/Thành</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <select class="form-input">
                    <option value="">Xã/ Phường</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 0 0 120px;"></div>
                <div class="form-group" style="flex: 1;">
                  <select class="form-input">
                    <option value="">Thôn xóm/Khu phố</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <input type="text" class="form-input" placeholder="Số nhà, đường" />
                </div>
              </div>
            </div>
            
            <!-- Right: Tree View -->
            <div style="flex: 0 0 320px; border-left: 1px solid #dfe6f2; padding-left: 24px;">
              <label style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: block;">
                Khu vực quản lý <span class="required">*</span>
              </label>
              <div style="position: relative; margin-bottom: 12px;">
                <input type="text" class="form-input" placeholder="Nhập mã/ tên" style="width: 100%; padding-right: 40px; box-sizing: border-box;" />
                <or-icon icon="magnify" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); --or-icon-width: 18px; --or-icon-height: 18px; color: #6b7280; pointer-events: none;"></or-icon>
              </div>
              <div style="border: 1px solid #dfe6f2; border-radius: 6px; padding: 8px; max-height: 300px; overflow-y: auto;">
                ${this.areaTreeData.map(node => this.renderAreaTreeNode(node))}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn primary">
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  protected render(): TemplateResult {
    switch (this.selectedUserCategory) {
      case "activity_log":
        return this.renderActivityLogTab()
      case "employee":
      default:
        return this.renderEmployeeTab()
    }
  }

  private renderEmployeeTab(): TemplateResult {
    return html`
      <div class="container">
        <div class="header">NHÂN VIÊN</div>
        
        <div class="filters-section">
          <div class="filter-group" style="min-width: 200px;">
            <input type="text" class="filter-input" placeholder="Nhập mã/ tên nhân viên" />
          </div>
          <div class="filter-group" style="min-width: 120px;">
            <input type="text" class="filter-input" placeholder="SĐT/Email" />
          </div>
          <div class="filter-group" style="min-width: 100px;">
            <select class="filter-select">
              <option value="">Giới tính</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </div>
          <div class="filter-group" style="min-width: auto;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; white-space: nowrap;">
              <input type="checkbox" style="width: 16px; height: 16px;" />
              <span>Chưa kích hoạt</span>
            </label>
          </div>
          <button class="btn btn-primary primary-color">
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions">
            <button class="toolbar-btn import" title="Import Excel" @click=${this.openImportModal}>
              <or-icon icon="file-excel"></or-icon>
            </button>
            <button class="toolbar-btn export" title="Export Excel">
              <or-icon icon="file-export"></or-icon>
            </button>
            <button class="toolbar-btn create" title="Tạo mới" @click=${this.openModal}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Họ tên nhân viên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Tình trạng</th>
                <th style="width: 120px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.mockEmployees.map(emp => this.renderEmployeeRow(emp))}
            </tbody>
          </table>
        </div>

        <div class="pagination-section">
          <span class="pagination-info">Hiển thị 1 - 15 of 250 kết quả</span>
          <ul class="pagination-list">
            <li><a href="#">&laquo;</a></li>
            <li><a href="#">&lt;</a></li>
            <li><a href="#" class="active">1</a></li>
            <li><a href="#">2</a></li>
            <li><a href="#">3</a></li>
            <li><a href="#">4</a></li>
            <li><a href="#">&gt;</a></li>
            <li><a href="#">&raquo;</a></li>
          </ul>
        </div>
      </div>
      ${this.renderModal()}
      ${this.renderImportModal()}
    `
  }

  private renderImportModal(): TemplateResult | null {
    if (!this.isImportModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeImportModal}>
        <div class="modal-content" style="max-width: 500px;" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">IMPORT EXCEL</span>
            <button class="refresh-btn" @click=${this.closeImportModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div class="modal-body">
            <label class="file-upload-area">
              <or-icon icon="file-excel"></or-icon>
              ${this.selectedFile
        ? html`<span class="file-name">${this.selectedFile.name}</span>`
        : html`<span class="file-placeholder">Chọn file Excel (.xlsx, .xls)</span>`
      }
              <input type="file" accept=".xlsx,.xls" @change=${this.handleFileSelect} />
            </label>
          </div>
          <div class="modal-footer">
            <button class="modal-btn primary" @click=${this.handleUpload}>
              <or-icon icon="upload"></or-icon>
              Tải lên
            </button>
            <button class="modal-btn danger" @click=${this.closeImportModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderActivityLogTab(): TemplateResult {
    return html`
      <div class="container">
        <div class="header">NHẬT KÝ HOẠT ĐỘNG NGƯỜI DÙNG</div>
        
        <div class="filters-section">
          <div class="filter-group" style="min-width: 180px;">
            <input type="text" class="filter-input" placeholder="Nhập mã/ tên nhân viên" />
          </div>
          <div class="filter-group action-dropdown" style="min-width: 140px;">
            <div class="filter-select action-dropdown-trigger" @click=${this.toggleActionDropdown}>
              <span>${this.getActionLabel()}</span>
              <or-icon icon="${this.actionDropdownOpen ? 'chevron-up' : 'chevron-down'}"></or-icon>
            </div>
            ${this.actionDropdownOpen ? html`
              <div class="action-dropdown-menu">
                <div class="action-dropdown-header">-- Chọn hành động --</div>
                <div class="action-dropdown-options">
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('all')} @change=${() => this.toggleAction('all')} />
                    <span>Tất cả</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('login')} @change=${() => this.toggleAction('login')} />
                    <span>Đăng nhập</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('logout')} @change=${() => this.toggleAction('logout')} />
                    <span>Đăng xuất</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('add')} @change=${() => this.toggleAction('add')} />
                    <span>Thêm</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('update')} @change=${() => this.toggleAction('update')} />
                    <span>Cập nhật</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('delete')} @change=${() => this.toggleAction('delete')} />
                    <span>Xóa</span>
                  </label>
                  <label class="action-dropdown-option" @click=${(e: Event) => e.stopPropagation()}>
                    <input type="checkbox" .checked=${this.selectedActions.has('cancel')} @change=${() => this.toggleAction('cancel')} />
                    <span>Hủy</span>
                  </label>
                </div>
              </div>
            ` : null}
          </div>
          <div class="filter-group" style="min-width: 140px;">
            <input type="date" class="filter-input" placeholder="Từ ngày" />
          </div>
          <div class="filter-group" style="min-width: 140px;">
            <input type="date" class="filter-input" placeholder="Đến ngày" />
          </div>
          <button class="btn btn-primary primary-color">
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions">
            <button class="toolbar-btn export" title="Export Excel">
              <or-icon icon="file-export"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 150px;">Thời điểm thực hiện</th>
                <th style="width: 180px;">Người thực hiện</th>
                <th style="width: 150px;">Hành động</th>
                <th>Nội dung</th>
                <th style="width: 100px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.mockActivityLogs.map(log => this.renderActivityLogRow(log))}
            </tbody>
          </table>
        </div>

        <div class="pagination-section">
          <span class="pagination-info">Hiển thị 1 - 15 of 250 kết quả</span>
          <ul class="pagination-list">
            <li><a href="#">&laquo;</a></li>
            <li><a href="#">&lt;</a></li>
            <li><a href="#" class="active">1</a></li>
            <li><a href="#">2</a></li>
            <li><a href="#">3</a></li>
            <li><a href="#">4</a></li>
            <li><a href="#">&gt;</a></li>
            <li><a href="#">&raquo;</a></li>
          </ul>
        </div>
      </div>
    `
  }

  private renderActivityLogRow(log: ActivityLog): TemplateResult {
    return html`
      <tr>
        <td>${log.timestamp}</td>
        <td><span class="code-link">${log.userName}</span></td>
        <td>${log.action}</td>
        <td>${log.content}</td>
        <td>
          <div class="action-icons">
            <button class="action-btn delete"><or-icon icon="delete"></or-icon></button>
          </div>
        </td>
      </tr>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "admin-users-tab": AdminUsersTab
  }
}
