import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { AppStateKeyed, Page } from "@openremote/or-app";
import "@openremote/or-icon";
import { homePageStyles } from "./home-page.styles";
import "@openremote/or-map";
import { fakeDevices, fakeDevices2, fakeSchedule, treeLocations } from "./dataFake";

type TreeNode = { id: string; label: string; children?: TreeNode[] };

@customElement("or-home-page")
export class HomePage extends Page<AppStateKeyed> {
  public name = "home";
  static styles = homePageStyles;

  @state()
  private expanded = new Set<string>(["hanoi"]);

  @state() private menuRowId: string | null = null;
  @state() private contextMenuPos = { x: 0, y: 0 };
  @state() private showContextMenu = false;
  @state() private contextItem: any = null;
  @state() showVolumePopup = false;
  @state() currentVolume = 50;
  @state() showDeviceInfo = false;
  @state()
  private activeDeviceTab: "info" | "history" = "info";

  @state()
  private activePage: "table" | "map" = "table";

  @state()
  private deviceHistory: { time: string; action: string }[] = [];

  @state()
  private showSchedulePopup = false;

  @state()
  private selectedDevicesFull = [];

  @state()
  private selectedDevice: any = null;

  @state()
  private items = fakeDevices;

  @state()
  private scheduleItems = fakeSchedule;

  @state()
  private treeData = treeLocations;

  openDeviceInfo(item: any) {
    this.selectedDevice = item;
    this.activeDeviceTab = "info";

    this.fetchDeviceHistory(item.deviceCode);

    this.showDeviceInfo = true;
  }

  async fetchDeviceHistory(deviceCode: string) {
    // Thay bằng API thật
    // Ví dụ trả về dữ liệu tĩnh
    this.deviceHistory = [
      { time: "2025-12-09 08:00", action: "Bật thiết bị" },
      { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
      { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
      { time: "2025-12-09 08:00", action: "Bật thiết bị" },
      { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
      { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
      { time: "2025-12-09 08:00", action: "Bật thiết bị" },
      { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
      { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
      { time: "2025-12-09 08:00", action: "Bật thiết bị" },
      { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
      { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
      { time: "2025-12-09 08:00", action: "Bật thiết bị" },
      { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
      { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
    ];

    // Nếu là fetch từ API:
    // const res = await fetch(`/api/device/${deviceCode}/history`);
    // this.deviceHistory = await res.json();
  }

  closeDeviceInfo() {
    this.showDeviceInfo = false;
  }

  openVolumePopup(item: any) {
    this.currentVolume = item.volume;
    this.showVolumePopup = true;
  }

  closeVolumePopup() {
    this.showVolumePopup = false;
  }

  saveVolume() {
    console.log("Âm lượng mới:", this.currentVolume);
    this.showVolumePopup = false;
  }

  private openContextMenu(e: MouseEvent, item: any) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    this.contextMenuPos = {
      x: rect.left,
      y: rect.bottom - 15, // cách nút 4px
    };

    this.contextItem = item;
    this.showContextMenu = true;

    e.stopPropagation();
  }

  private openSchedulePopup(item: any) {
    this.selectedDevice = item;
    this.showSchedulePopup = true;
  }

  private closeSchedulePopup() {
    this.showSchedulePopup = false;
  }

  onStart() {
    console.log("Start clicked");
  }

  onPause() {
    console.log("Pause clicked");
  }

  onLock() {
    console.log("Lock clicked");
  }

  onUnlock() {
    console.log("Unlock clicked");
  }

  onTurnOff() {
    console.log("Turn Off clicked");
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.handleClickOutside);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleClickOutside);
    super.disconnectedCallback();
  }

  private handleClickOutside = (e: MouseEvent) => {
    if (!this.shadowRoot?.contains(e.target as Node)) {
      this.showContextMenu = false;
    }
  };

  stateChanged(state: AppStateKeyed): void {
    // bạn có thể để trống hoặc log
    console.log("Store updated:", state);
  }

  private toggleNode(id: string): void {
    const next = new Set(this.expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded = next;
  }

  private onTreeSelect(node: TreeNode) {
    console.log("Selected tree node:", node);
    if (node.id === "hk-1") {
      this.items = fakeDevices2;
    } else {
      this.items = fakeDevices;
    }
  }

  // loadDevices(location: string) {
  //   this.deviceService.getDevices(location).subscribe({
  //     next: (res) => {
  //       this.items = res.data; // cập nhật table
  //     },
  //     error: (err) => {
  //       console.error("API error:", err);
  //     },
  //   });
  // }

  // getDevices(location: string) {
  //   return this.http.get(`/api/devices?location=${location}`);
  // }

  private renderNode(node: TreeNode, level = 1) {
    const hasChildren = !!node.children && node.children.length > 0;
    const isOpen = this.expanded.has(node.id);

    const icon =
      level === 1
        ? "/manager/images/city.png"
        : level === 2
        ? "/manager/images/ward.png"
        : "/manager/images/mute-menu.png";

    return html`
      <li class="tree-item ${isOpen ? "open" : ""}">
        <div
          class="tree-row"
          @click=${() => {
            hasChildren && this.toggleNode(node.id);
            this.onTreeSelect(node);
          }}
        >
          ${hasChildren
            ? html`<or-icon class="caret" icon=${isOpen ? "chevron-down" : "chevron-right"}></or-icon>`
            : html`<span class="caret spacer"></span>`}

          <img src="${icon}" width="25" height="25" />
          <span class="tree-label">${node.label}</span>
        </div>

        ${hasChildren && isOpen
          ? html`
              <ul class="tree-children">
                ${node.children!.map((child) => this.renderNode(child, level + 1))}
              </ul>
            `
          : null}
      </li>
    `;
  }

  private renderScheduleTable() {
    return html`
      <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 20px; width: 100%">
        <p style="color: #1545BE; margin: 13px 0; font-weight: bold;">CHƯƠNG TRÌNH PHÁT TRONG NGÀY</p>
        <input type="date" style="padding: 5px; border-radius: 5px; margin-bottom: 5px" />
        <div class="table-responsive-wrapper" style="max-width: 300px">
          <table>
            <thead>
              <tr>
                <th>Giờ phát</th>
                <th>Tên chương trình</th>
              </tr>
            </thead>
            <tbody>
              ${this.scheduleItems.map(
                (item) => html`
                  <tr>
                    <td>${item.time}</td>
                    <td>${item.programName}</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderHistoryTable() {
    return html`
      <table>
        <thead>
          <tr>
            <th>Giờ phát</th>
            <th>Tên chương trình</th>
            <th>Người thực hiện</th>
          </tr>
        </thead>
        <tbody>
          ${this.deviceHistory.map(
            (item) => html`
              <tr>
                <td>${item.time}</td>
                <td>${item.action}</td>
                <td>${item.action}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }

  private renderDeviceTable() {
    return html`
      <div class="table-responsive-wrapper" style="max-width: 880px;">
        <table>
          <thead>
            <tr>
              <th>Mã thiết bị</th>
              <th>Tên thiết bị</th>
              <th>Chương trình hiện tại</th>
              <th>Số loa</th>
              <th>Âm lượng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${this.items.map(
              (item) => html`
                <tr>
                  <td>${item.deviceCode}</td>
                  <td>${item.deviceName}</td>
                  <td>${item.currentProgram}</td>
                  <td>${item.speakerCount}</td>
                  <td>
                    <div style="display: flex; align-items: center; justify-content: center">
                      <button
                        class="action-btn more"
                        @click=${() => this.openVolumePopup(item)}
                        style="background: none; border: none; cursor: pointer; padding: 0; margin-right: 6px;"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#1545BE">
                          <path d="M3 10v4h4l5 5V5l-5 5H3z" />
                          <path
                            d="M14.5 8.5c1 1 1 4 0 5"
                            stroke="#1545BE"
                            stroke-width="2"
                            fill="none"
                            stroke-linecap="round"
                          />
                          <path
                            d="M17.5 6c2 2 2 8 0 10"
                            stroke="#1545BE"
                            stroke-width="2"
                            fill="none"
                            stroke-linecap="round"
                          />
                        </svg>
                      </button>
                      <input type="range" min="0" max="100" .value="${item.volume}" disabled />
                      <span style="width: 30px; text-align: left;">${item.volume}</span>
                    </div>
                  </td>
                  <td>${item.status ? "Hoạt động" : "Không hoạt động"}</td>
                  <td>
                    <button class="action-btn edit-btn" @click=${() => this.openVolumePopup(item)}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 10v4h4l5 5V5l-5 5H3z" />
                        <path
                          d="M14.5 8.5c1 1 1 4 0 5"
                          stroke="#1545BE"
                          stroke-width="2"
                          fill="none"
                          stroke-linecap="round"
                        />
                        <path
                          d="M17.5 6c2 2 2 8 0 10"
                          stroke="#1545BE"
                          stroke-width="2"
                          fill="none"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                    <button class="action-btn edit-btn" @click=${() => this.openDeviceInfo(item)}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <!-- Mắt -->
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <!-- Con ngươi -->
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    <button class="action-btn more" @click=${(e: MouseEvent) => this.openContextMenu(e, item)}>
                      ⋯
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderMapView() {
    this.selectedDevicesFull = [...this.items];

    return html`
      <div style="height: 500px;">
        <or-map zoom="13" lat="21.03" lng="105.83" style="width: 100%; height: 100%;">
          ${this.selectedDevicesFull.map(
            (d) => html`
              <or-map-marker .lat=${d.lat} .lng=${d.lng} active activeColor=${d.status ? "#eabb4c" : "#336666"}>
                <or-icon icon="lucide:volume-2"></or-icon>
              </or-map-marker>
            `
          )}
        </or-map>
      </div>
    `;
  }

  protected render() {
    return html`
      <div class="page">
        <!-- SIDEBAR -->
        <aside class="sidepanel">
          <div class="sidepanel-header">Danh mục</div>
          <div class="sidepanel-search">
            <input type="text" placeholder="Nhập mã/ tên" />
            <or-icon class="icon-search" icon="magnify"></or-icon>
          </div>
          <ul class="tree-root">
            ${this.treeData.map((node) => this.renderNode(node))}
          </ul>
        </aside>

        <!-- NỘI DUNG -->
        <div class="content">
          <!-- Container 2 table -->
          <div class="content-tables">
            <!-- Bảng thiết bị -->
            <div class="device-wrapper">
              <div style="display: flex; gap: 20px; padding-left: 20px; margin-bottom: 10px;">
                <button
                  class="tab-btn"
                  ?active=${this.activePage === "table"}
                  @click=${() => (this.activePage = "table")}
                >
                  Danh sách
                </button>
                <button class="tab-btn" ?active=${this.activePage === "map"} @click=${() => (this.activePage = "map")}>
                  Bản đồ
                </button>
              </div>
              <div style="display: flex">
                <div style="flex: 2; padding-right: 5px;">
                  <div class="headerHomepage">
                    <div class="equipmentInformation" style="border-color:#A1A1A1">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Đang tắt</p>
                    </div>
                    <div class="equipmentInformation" style="border-color:#02A61B">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Đang phát</p>
                    </div>
                    <div class="equipmentInformation" style="border-color:#1545BE">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Dừng phát</p>
                    </div>
                    <div class="equipmentInformation" style="border-color:#FF4343">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Mất kết nối</p>
                    </div>
                    <div class="equipmentInformation" style="border-color:#FEAA0F">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Bảo trì</p>
                    </div>
                    <div class="equipmentInformation" style="border-color:#BC57FF">
                      <p class="txtEquipment">1</p>
                      <p class="txtEquipment">Đang kết nối</p>
                    </div>
                  </div>
                  <div class="table-map-container">
                    ${this.activePage === "table" ? this.renderDeviceTable() : this.renderMapView()}
                  </div>
                </div>
                <div style="flex: 1;">${this.renderScheduleTable()}</div>
              </div>
            </div>
          </div>
        </div>
        ${this.showSchedulePopup
          ? html`
              <div class="popup-overlay" @click=${this.closeSchedulePopup}></div>

              <div class="popup-box">
                <div class="popup-header">
                  <h3>Chương trình phát - ${this.selectedDevice?.deviceName}</h3>
                  <button class="close-btn" @click=${this.closeSchedulePopup}>✖</button>
                </div>

                <div class="popup-content">${this.renderScheduleTable()}</div>
              </div>
            `
          : null}
        ${this.showContextMenu
          ? html`
              <div
                class="context-menu"
                style="top:${this.contextMenuPos.y}px; left:${this.contextMenuPos.x}px;"
                @click=${(e: Event) => e.stopPropagation()}
              >
                <label><input type="radio" name="action" value="start" /> Phát</label>
                <label><input type="radio" name="action" value="pause" /> Tạm dừng</label>
                <label><input type="radio" name="action" value="off" /> Tắt</label>
                <label><input type="radio" name="action" value="on" /> Bật</label>
                <label><input type="radio" name="action" value="fix" /> Bảo trì</label>
              </div>
            `
          : null}
        ${this.showVolumePopup
          ? html`
              <div class="popup-overlay" @click=${this.closeVolumePopup}></div>

              <div class="popup-box volume-popup" @click=${(e: Event) => e.stopPropagation()}>
                <h3 class="volume-title">Điều chỉnh âm lượng thiết bị</h3>

                <div class="volume-body">
                  <svg width="28" height="28" fill="#1545BE">
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  </svg>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    .value=${this.currentVolume}
                    @input=${(e: any) => (this.currentVolume = Number(e.target.value))}
                    class="volume-slider"
                  />
                  <span class="volume-value">${this.currentVolume}</span>
                </div>

                <div class="volume-actions">
                  <button class="btn-save" @click=${this.saveVolume}>
                    <img src="/manager/images/save.png" width="25" height="25" /> Lưu
                  </button>
                  <button class="btn-cancel" @click=${this.closeVolumePopup}>
                    <img src="/manager/images/huy.png" width="25" height="25" /> Hủy
                  </button>
                </div>
              </div>
            `
          : null}
        ${this.showDeviceInfo
          ? html`
              <div class="popup-overlay" @click=${this.closeDeviceInfo}></div>

              <div class="popup-box device-info-popup" @click=${(e: Event) => e.stopPropagation()}>
                <div class="device-info-container">
                  <!-- LEFT: Device Info + Tabs -->
                  <div class="device-info-left">
                    <div style="display: flex; gap: 20px; padding-left: 20px; margin-bottom: 10px;">
                      <button
                        class="tab-btn"
                        ?active=${this.activeDeviceTab === "info"}
                        @click=${() => (this.activeDeviceTab = "info")}
                      >
                        Thông tin thiết bị
                      </button>
                      <button
                        class="tab-btn"
                        ?active=${this.activeDeviceTab === "history"}
                        @click=${() => (this.activeDeviceTab = "history")}
                      >
                        Lịch sử hoạt động
                      </button>
                    </div>

                    <div class="detailEquipment">
                      ${this.activeDeviceTab === "info"
                        ? html`
                            <h4>Thông tin chung</h4>
                            <div style="display: flex; gap: 30px">
                              <div class="info-row">
                                <span class="label">Mã thiết bị:</span>
                                <span class="value">${this.selectedDevice?.deviceCode}</span>
                              </div>
                              <div class="info-row">
                                <span class="label">Tên thiết bị:</span>
                                <span class="value">${this.selectedDevice?.deviceName}</span>
                              </div>
                            </div>

                            <div class="info-row">
                              <span class="label">Số điện thoại:</span>
                              <span class="value">${this.selectedDevice?.address}</span>
                            </div>

                            <div class="info-row">
                              <span class="label">Nhóm thiết bị:</span>
                              <span class="value">${this.selectedDevice?.address}</span>
                            </div>

                            <div class="info-row">
                              <span class="label">Địa chỉ lắp đặt:</span>
                              <span class="value">${this.selectedDevice?.address}</span>
                            </div>

                            <div style="display: flex; gap: 30px">
                              <div class="info-row">
                                <span class="label">Nhà sản xuất:</span>
                                <span class="value">${this.selectedDevice?.manufacturer}</span>
                              </div>
                              <div class="info-row">
                                <span class="label">Nhà cung cấp:</span>
                                <span class="value">${this.selectedDevice?.deviceName}</span>
                              </div>
                            </div>

                            <div class="info-row">
                              <span class="label">Số seri:</span>
                              <span class="value">${this.selectedDevice?.serial}</span>
                            </div>

                            <div class="info-row">
                              <span class="label">Ghi chú:</span>
                              <span class="value">${this.selectedDevice?.serial}</span>
                            </div>

                            <h4>Thông tin trạng thái</h4>
                            <div class="info-row">
                              <span class="label">Trạng thái hoạt động:</span>
                              <span class="value">${this.selectedDevice?.status}</span>
                            </div>

                            <div class="info-row">
                              <span class="label">Chương trình đang phát:</span>
                              <span class="value">${this.selectedDevice?.currentProgram}</span>
                            </div>

                            <div class="info-row">
                              <span class="label">Mức độ tín hiệu:</span>
                              <span class="value">${this.selectedDevice?.volume}%</span>
                            </div>

                            <h4>Điều khiển</h4>
                            <div class="info-row">
                              <span class="label">Trạng thái hoạt động:</span>
                              <div style="display: flex; gap: 12px">
                                <button class="icon-btn" @click=${this.onStart}>
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1545BE">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </button>
                                <button class="icon-btn" @click=${this.onPause}>
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1545BE">
                                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                                  </svg>
                                </button>
                                <button class="icon-btn" @click=${this.onLock}>
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1545BE">
                                    <path
                                      d="M17 8h-1V6a4 4 0 00-8 0v2H7a2 2 0 00-2 2v10a2 2 0 
                              002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm-5 9a2 2 0 110-4 2 2 0 
                              010 4zm3-9H9V6a3 3 0 016 0v2z"
                                    />
                                  </svg>
                                </button>
                                <button class="icon-btn" @click=${this.onUnlock}>
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1545BE">
                                    <path
                                      d="M17 8h-6V6a3 3 0 016 0h2a5 5 0 00-10 0v2H7a2 2 0 00-2 2v10a2 2 0 
                              002 2h10a2 2 0 
                              002-2V10a2 2 0 00-2-2zm-5 9a2 2 0 110-4 2 2 0 
                              010 4z"
                                    />
                                  </svg>
                                </button>
                                <button class="icon-btn" @click=${this.onTurnOff}>
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1545BE">
                                    <path
                                      d="M13 3h-2v10h2V3zm4.83 1.17l-1.42 1.42A7 7 0 0119 12c0 
                              3.87-3.13 7-7 7s-7-3.13-7-7a7 7 0 012.59-5.41L6.17 
                              4.17A8.98 8.98 0 003 12c0 4.97 4.03 9 9 9s9-4.03 
                              9-9a8.98 8.98 0 00-3.17-7.83z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div class="info-row">
                              <span class="label">Âm lượng:</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                .value=${this.selectedDevice.volume}
                                @input=${(e: any) => {
                                  const newVol = Number(e.target.value);
                                  this.selectedDevice = { ...this.selectedDevice, volume: newVol };
                                }}
                                class="volume-slider"
                              />
                              <span class="volume-value">${this.selectedDevice.volume}</span>
                            </div>
                          `
                        : html`
                            <h4>Lịch sử hoạt động</h4>
                            <div class="popup-content">${this.renderHistoryTable()}</div>
                          `}
                    </div>

                    <div class="volume-actions">
                      <button class="btn-save" @click=${this.saveVolume}>
                        <img src="/manager/images/save.png" width="25" height="25" /> Lưu
                      </button>
                      <button class="btn-cancel" @click=${this.closeDeviceInfo}>
                        <img src="/manager/images/huy.png" width="25" height="25" /> Hủy
                      </button>
                    </div>
                  </div>

                  <!-- RIGHT: MAP -->
                  <div class="device-info-map">
                    <or-map
                      style="width: 100%; height: 100%;"
                      .lat=${this.selectedDevice.lat}
                      .lng=${this.selectedDevice.lng}
                      zoom="14"
                    >
                      <or-map-marker
                        .lat=${this.selectedDevice.lat}
                        .lng=${this.selectedDevice.lng}
                        icon="place"
                        active
                        activeColor="#FF0000"
                      ></or-map-marker>
                    </or-map>
                  </div>
                </div>
              </div>
            `
          : null}
      </div>
    `;
  }
}
