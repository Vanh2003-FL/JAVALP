import { html, LitElement, css, TemplateResult } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import "@openremote/or-icon"

interface ConfigItem {
  id: string
  name: string
  value: string
  section: string
}

interface FileNormConfig {
  sampleRate: string
  bitRate: string
  audioChannel: string
  autoVolume: string
}

@customElement("admin-config-tab")
export class AdminConfigTab extends LitElement {
  @property({ type: String }) selectedConfigCategory: "system" | "file" = "system"

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
      height: 100%;
      box-sizing: border-box;
    }

    .header {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Filters/Search */
    .filters-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
    }

    .search-box {
      position: relative;
    }

    .filter-input {
      height: 38px;
      padding: 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      min-width: 200px;
    }

    .filter-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    /* Table */
    .table-wrapper {
      flex: 1;
      overflow: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    table {
      width: 100%;
      min-width: 600px;
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
      color: var(--text-primary);
      border-right: 1px solid var(--border-color);
    }

    th:first-child {
      width: 50%;
    }

    th:nth-child(2) {
      width: calc(50% - 100px);
    }

    th:last-child {
      text-align: center;
      width: 100px;
      border-right: none;
    }

    tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }

    tbody tr:hover {
      background: #eef5ff;
    }

    td {
      padding: 10px 14px;
      font-size: 13px;
      color: var(--text-primary);
      border-right: 1px solid #e5e7eb;
    }

    td:last-child {
      text-align: center;
      border-right: none;
    }

    .section-row {
      background: white;
    }

    .section-row td {
      padding: 8px 14px;
    }

    .section-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .config-row td:first-child {
      padding-left: 24px;
    }

    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: var(--bg-light);
    }

    .action-btn or-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      color: var(--primary-color);
    }

    /* Pagination */
    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-info {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .pagination-list {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 4px;
    }

    .pagination-list li {
      display: flex;
    }

    .pagination-list a {
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      border: 1px solid var(--border-color);
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--text-primary);
    }

    .pagination-list a:hover {
      background: var(--bg-light);
    }

    .pagination-list a.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .refresh-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .refresh-btn or-icon {
      --or-icon-width: 20px;
      --or-icon-height: 20px;
      color: var(--text-secondary);
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
    }

    .modal-btn {
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

    .modal-btn or-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
    }

    .modal-btn.primary {
      background: white;
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    .modal-btn.primary:hover {
      background: var(--bg-light);
    }

    .modal-btn.danger {
      background: white;
      border-color: var(--danger-color);
      color: var(--danger-color);
    }

    .modal-btn.danger:hover {
      background: #fef2f2;
    }

    /* File Normalization */
    .file-norm-container {
      flex: 1;
    }

    .file-norm-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .file-norm-field {
      display: flex;
      flex-direction: column;
    }

    .file-norm-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .file-norm-label .required {
      color: var(--danger-color);
    }

    .file-norm-select {
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .file-norm-select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .toolbar-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .btn or-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
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

  @state() private searchQuery: string = ""
  @state() private showEditModal: boolean = false
  @state() private editingConfig: ConfigItem | null = null
  @state() private editName: string = ""
  @state() private editValue: string = ""

  @state() private fileNormConfig: FileNormConfig = {
    sampleRate: "48000",
    bitRate: "128",
    audioChannel: "mono",
    autoVolume: "off"
  }

  private configItems: ConfigItem[] = [
    { id: "1", name: "Âm lượng mặc định của thiết bị phát", value: "80", section: "Cấu hình chung" },
    { id: "2", name: "Database Version", value: "0.1.7", section: "Cấu hình chung" },
    { id: "3", name: "Số ngày tự động tạo chương trình theo lịch phát", value: "30", section: "Cấu hình lịch phát" },
    { id: "4", name: "Tốc độ phát bản tin (kbps)", value: "64", section: "Cấu hình lịch phát" },
    { id: "5", name: "Định dạng file âm thanh", value: "mp3;wav;wma;aac;m4a;", section: "Cấu hình file" },
  ]

  private sampleRateOptions = [
    { value: "24000", label: "24.000 Hz" },
    { value: "32000", label: "32.000 Hz" },
    { value: "44100", label: "44.100 Hz" },
    { value: "48000", label: "48.000 Hz" },
  ]

  private bitRateOptions = [
    { value: "96", label: "96 kbps" },
    { value: "112", label: "112 kbps" },
    { value: "128", label: "128 kbps" },
    { value: "160", label: "160 kbps" },
  ]

  private audioChannelOptions = [
    { value: "mono", label: "Mono" },
    { value: "stereo", label: "Stereo" },
  ]

  private autoVolumeOptions = [
    { value: "off", label: "OFF" },
    { value: "auto", label: "Auto" },
  ]

  private openEditModal(config: ConfigItem): void {
    this.editingConfig = config
    this.editName = config.name
    this.editValue = config.value
    this.showEditModal = true
  }

  private closeEditModal(): void {
    this.showEditModal = false
    this.editingConfig = null
    this.editName = ""
    this.editValue = ""
  }

  private handleSaveEdit(): void {
    if (this.editingConfig) {
      console.log("Saving config:", this.editingConfig.id, this.editName, this.editValue)
    }
    this.closeEditModal()
  }

  private getGroupedConfigs(): Map<string, ConfigItem[]> {
    const filtered = this.configItems.filter(c =>
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    )
    const grouped = new Map<string, ConfigItem[]>()
    filtered.forEach(config => {
      const existing = grouped.get(config.section) || []
      existing.push(config)
      grouped.set(config.section, existing)
    })
    return grouped
  }

  protected render(): TemplateResult {
    return html`
      <div class="container">
        <div class="header">${this.selectedConfigCategory === "system" ? "CẤU HÌNH HỆ THỐNG" : "CẤU HÌNH CHUẨN HÓA FILE MP3"}</div>
        ${this.selectedConfigCategory === "system" ? this.renderSystemConfig() : this.renderFileNormConfig()}
      </div>
      ${this.showEditModal ? this.renderEditModal() : null}
    `
  }

  private renderSystemConfig(): TemplateResult {
    const grouped = this.getGroupedConfigs()
    return html`
      <div class="filters-section">
        <div class="filter-group search-box">
          <input type="text" class="filter-input" placeholder="Nhập tên cấu hình" 
                 .value=${this.searchQuery} @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value} />
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tên cấu hình</th>
              <th>Giá trị</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from(grouped.entries()).map(([section, items]) => html`
              <tr class="section-row">
                <td class="section-name">${section}</td>
                <td></td>
                <td></td>
              </tr>
              ${items.map(item => html`
                <tr class="config-row">
                  <td>${item.name}</td>
                  <td>${item.value}</td>
                  <td>
                    <button class="action-btn" @click=${() => this.openEditModal(item)}>
                      <or-icon icon="pencil"></or-icon>
                    </button>
                  </td>
                </tr>
              `)}
            `)}
          </tbody>
        </table>
      </div>
      <div class="pagination-section">
        <span class="pagination-info">Hiển thị 1 - 5 of 5 kết quả</span>
        <ul class="pagination-list">
          <li><a href="#">&lt;</a></li>
          <li><a href="#" class="active">1</a></li>
          <li><a href="#">&gt;</a></li>
        </ul>
        <select class="page-size-select">
          <option>10</option>
          <option>20</option>
          <option>50</option>
        </select>
      </div>
    `
  }

  private renderFileNormConfig(): TemplateResult {
    return html`
      <div class="file-norm-container">
        <div class="file-norm-row">
          <div class="file-norm-field">
            <label class="file-norm-label">Tần số lấy mẫu <span class="required">*</span></label>
            <select class="file-norm-select" .value=${this.fileNormConfig.sampleRate} 
                    @change=${(e: Event) => this.fileNormConfig = { ...this.fileNormConfig, sampleRate: (e.target as HTMLSelectElement).value }}>
              ${this.sampleRateOptions.map(opt => html`
                <option value=${opt.value} ?selected=${this.fileNormConfig.sampleRate === opt.value}>${opt.label}</option>
              `)}
            </select>
          </div>
          <div class="file-norm-field">
            <label class="file-norm-label">Tốc độ BIT <span class="required">*</span></label>
            <select class="file-norm-select" .value=${this.fileNormConfig.bitRate}
                    @change=${(e: Event) => this.fileNormConfig = { ...this.fileNormConfig, bitRate: (e.target as HTMLSelectElement).value }}>
              ${this.bitRateOptions.map(opt => html`
                <option value=${opt.value} ?selected=${this.fileNormConfig.bitRate === opt.value}>${opt.label}</option>
              `)}
            </select>
          </div>
          <div class="file-norm-field">
            <label class="file-norm-label">Kênh âm thanh <span class="required">*</span></label>
            <select class="file-norm-select" .value=${this.fileNormConfig.audioChannel}
                    @change=${(e: Event) => this.fileNormConfig = { ...this.fileNormConfig, audioChannel: (e.target as HTMLSelectElement).value }}>
              ${this.audioChannelOptions.map(opt => html`
                <option value=${opt.value} ?selected=${this.fileNormConfig.audioChannel === opt.value}>${opt.label}</option>
              `)}
            </select>
          </div>
          <div class="file-norm-field">
            <label class="file-norm-label">Âm lượng tự động <span class="required">*</span></label>
            <select class="file-norm-select" .value=${this.fileNormConfig.autoVolume}
                    @change=${(e: Event) => this.fileNormConfig = { ...this.fileNormConfig, autoVolume: (e.target as HTMLSelectElement).value }}>
              ${this.autoVolumeOptions.map(opt => html`
                <option value=${opt.value} ?selected=${this.fileNormConfig.autoVolume === opt.value}>${opt.label}</option>
              `)}
            </select>
          </div>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-primary">
          <or-icon icon="content-save"></or-icon>
          Lưu
        </button>
        <button class="btn btn-danger">
          <or-icon icon="close"></or-icon>
          Hủy
        </button>
      </div>
    `
  }

  private renderEditModal(): TemplateResult {
    return html`
      <div class="modal-overlay" @click=${this.closeEditModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">SỬA CẤU HÌNH</span>
            <button class="refresh-btn" @click=${this.closeEditModal}>
              <or-icon icon="sync"></or-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Tên cấu hình</label>
              <input type="text" class="form-input" placeholder="Nhập tên cấu hình" 
                     .value=${this.editName} @input=${(e: Event) => this.editName = (e.target as HTMLInputElement).value} />
            </div>
            <div class="form-group">
              <label class="form-label">Giá trị</label>
              <input type="text" class="form-input" placeholder="Nhập giá trị" 
                     .value=${this.editValue} @input=${(e: Event) => this.editValue = (e.target as HTMLInputElement).value} />
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn primary" @click=${this.handleSaveEdit}>
              <or-icon icon="content-save"></or-icon>
              Lưu
            </button>
            <button class="modal-btn danger" @click=${this.closeEditModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "admin-config-tab": AdminConfigTab
  }
}
