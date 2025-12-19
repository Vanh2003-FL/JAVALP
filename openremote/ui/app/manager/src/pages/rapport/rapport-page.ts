import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { AppStateKeyed, Page } from "@openremote/or-app";
import "@openremote/or-icon";
import { rapportPageStyles } from "./rapport-page.styles";

type TreeNode = { id: string; label: string; children?: TreeNode[] };

@customElement("or-rapport-page")
export class RapportPage extends Page<AppStateKeyed> {
  public name = "home";
  static styles = rapportPageStyles;

  @state()
  private expanded = new Set<string>(["hanoi"]);

  @state() showVolumePopup = false;
  @state() currentVolume = 50;
  @state() showDeviceInfo = false;

  @state()
  private activePage: "device" | "news" | "micro" = "device";

  @state()
  private selectedDevice: any = null;

  @state()
  private equipments = [
    {
      deviceCode: "EQP-001",
      deviceName: "Loa Cổng Trường",
      startDate: "2023-01-15",
      status: true,
      note: "Hoạt động ổn định",
      playTime: "06:00 - 06:30",
    },
    {
      deviceCode: "EQP-002",
      deviceName: "Loa Sân Trường",
      startDate: "2022-11-02",
      status: false,
      note: "Đang bảo trì bộ khuếch đại",
      playTime: "07:00 - 07:15",
    },
    {
      deviceCode: "EQP-003",
      deviceName: "Loa Nhà Đa Năng",
      startDate: "2023-03-10",
      status: true,
      note: "Âm lượng hơi nhỏ",
      playTime: "08:00 - 08:20",
    },
    {
      deviceCode: "EQP-004",
      deviceName: "Loa Hành Lang Tầng 1",
      startDate: "2023-05-22",
      status: true,
      note: "Sử dụng cho chuông báo",
      playTime: "12:00 - 12:10",
    },
    {
      deviceCode: "EQP-005",
      deviceName: "Loa Hội Trường Lớn",
      startDate: "2021-09-01",
      status: false,
      note: "Hỏng micro input",
      playTime: "15:00 - 15:30",
    },
  ];

  @state()
  private newsItems = [
    {
      fieldName: "Thông báo học đường",
      newsPlayed: 12,
      totalDuration: "48 phút",
      level: "Trung bình",
    },
    {
      fieldName: "Âm nhạc giải trí",
      newsPlayed: 25,
      totalDuration: "2 giờ 15 phút",
      level: "Cao",
    },
    {
      fieldName: "An toàn giao thông",
      newsPlayed: 8,
      totalDuration: "32 phút",
      level: "Thấp",
    },
    {
      fieldName: "Tuyên truyền phòng cháy chữa cháy",
      newsPlayed: 5,
      totalDuration: "20 phút",
      level: "Thấp",
    },
    {
      fieldName: "Tin tức nhà trường",
      newsPlayed: 14,
      totalDuration: "1 giờ 05 phút",
      level: "Trung bình",
    },
  ];

  @state()
  private microDeviceItems = [
    {
      deviceCode: "DEV-001",
      deviceName: "Loa Hội Trường A",
      isLocked: false,
      area: "Khu A",
      createdBy: "Nguyễn Văn A",
      createdDate: "2024-01-12",
    },
    {
      deviceCode: "DEV-002",
      deviceName: "Loa Sân Trường",
      isLocked: true,
      area: "Sân Chính",
      createdBy: "Trần Thị B",
      createdDate: "2024-02-05",
    },
    {
      deviceCode: "DEV-003",
      deviceName: "Loa Phòng Họp 1",
      isLocked: false,
      area: "Tầng 2 - Phòng họp",
      createdBy: "Lê Văn C",
      createdDate: "2024-03-19",
    },
    {
      deviceCode: "DEV-004",
      deviceName: "Micro Sự Kiện",
      isLocked: true,
      area: "Hội trường lớn",
      createdBy: "Phạm Minh D",
      createdDate: "2024-04-01",
    },
    {
      deviceCode: "DEV-005",
      deviceName: "Loa Phòng Lab 2",
      isLocked: false,
      area: "Tầng 3 - Lab 2",
      createdBy: "Nguyễn Hà E",
      createdDate: "2024-05-22",
    },
  ];

  @state() private searchName = "";
  @state() private searchStatus = "";
  @state() private searchDate = "";
  @state() private filteredItems = this.equipments;
  @state() private filteredMicro = [...this.newsItems];

  private treeData: TreeNode[] = [
    {
      id: "hanoi",
      label: "Thành phố Hà Nội",
      children: [
        {
          id: "hk",
          label: "Phường Hoàn Kiếm",
          children: [
            { id: "hk-1", label: "Tổ dân phố 01" },
            { id: "hk-2", label: "Tổ dân phố 02" },
          ],
        },
        {
          id: "bd",
          label: "Phường Ba Đình",
          children: [
            { id: "bd-1", label: "Tổ dân phố 05" },
            { id: "bd-2", label: "Tổ dân phố 06" },
          ],
        },
      ],
    },
  ];

  stateChanged(state: AppStateKeyed): void {
    console.log("Store updated:", state);
  }

  private handleSearch() {
    this.filteredItems = this.equipments.filter((item) => {
      const matchName = !this.searchName || item.deviceName.toLowerCase().includes(this.searchName.toLowerCase());

      const matchStatus = !this.searchStatus || String(item.status) === this.searchStatus;

      const matchDate = !this.searchDate || item.startDate === this.searchDate;

      return matchName && matchStatus && matchDate;
    });
  }

  private formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN");
  }

  private toggleNode(id: string): void {
    const next = new Set(this.expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded = next;
  }

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
        <div class="tree-row" @click=${() => hasChildren && this.toggleNode(node.id)}>
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

  private renderActivePage() {
    switch (this.activePage) {
      case "device":
        return this.renderDeviceTable();
      case "news":
        return this.renderNewsTable();
      case "micro":
        return this.renderMicroTable();
      default:
        return html`<p>Không có dữ liệu</p>`;
    }
  }

  private renderDeviceTable() {
    return html`
      <!-- Header Search -->
      <div class="search-header">
        <input
          type="text"
          placeholder="Tên thiết bị..."
          class="search-input"
          @input=${(e: any) => (this.searchName = e.target.value)}
        />

        <select class="search-input" @change=${(e: any) => (this.searchStatus = e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>

        <input type="date" class="search-input" @change=${(e: any) => (this.searchDate = e.target.value)} />

        <button class="search-btn" @click=${this.handleSearch}>Tìm kiếm</button>
      </div>

      <!-- Device Table -->
      <div class="table-responsive-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mã thiết bị</th>
              <th>Tên thiết bị</th>
              <th>Ngày bắt đầu hoạt động</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th>Thời gian phát</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredItems.map(
              (item) => html`
                <tr>
                  <td>${item.deviceCode}</td>
                  <td>${item.deviceName}</td>
                  <td>${this.formatDate(item.startDate)}</td>
                  <td>
                    <span style="color: ${item.status ? "green" : "red"}">
                      ${item.status ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>${item.note}</td>
                  <td>${item.playTime}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderNewsTable() {
    return html`
      <!-- Header Search -->
      <div class="search-header">
        <input
          type="text"
          placeholder="Tên thiết bị..."
          class="search-input"
          @input=${(e: any) => (this.searchName = e.target.value)}
        />

        <select class="search-input" @change=${(e: any) => (this.searchStatus = e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>

        <input type="date" class="search-input" @change=${(e: any) => (this.searchDate = e.target.value)} />

        <button class="search-btn" @click=${this.handleSearch}>Tìm kiếm</button>
      </div>
      <!-- News Table -->
      <div class="table-responsive-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tên lĩnh vực</th>
              <th>Loại phát</th>
              <th>Tổng thời lượng phát</th>
              <th>Mức độ</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredMicro.map(
              (item) => html`
                <tr>
                  <td>${item.fieldName}</td>
                  <td>${item.newsPlayed}</td>
                  <td>${item.totalDuration}</td>
                  <td>
                    <span
                      style="
                      color: ${item.level === "Cao" ? "red" : item.level === "Trung bình" ? "orange" : "green"};
                      font-weight: 600;
                    "
                    >
                      ${item.level}
                    </span>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderMicroTable() {
    return html`
      <!-- Header Search -->
      <div class="search-header">
        <input
          type="text"
          placeholder="Tên thiết bị..."
          class="search-input"
          @input=${(e: any) => (this.searchName = e.target.value)}
        />

        <select class="search-input" @change=${(e: any) => (this.searchStatus = e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>

        <input type="date" class="search-input" @change=${(e: any) => (this.searchDate = e.target.value)} />

        <button class="search-btn" @click=${this.handleSearch}>Tìm kiếm</button>
      </div>
      
      <div class="table-responsive-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mã thiết bị</th>
              <th>Tên thiết bị</th>
              <th>Tạm khóa</th>
              <th>Khu vực</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>

          <tbody>
            ${this.microDeviceItems.map(
              (item) => html`
                <tr>
                  <td>${item.deviceCode}</td>
                  <td>${item.deviceName}</td>

                  <td>
                    <span style="color: ${item.isLocked ? "red" : "green"};">
                      ${item.isLocked ? "Đã khóa" : "Đang mở"}
                    </span>
                  </td>

                  <td>${item.area}</td>
                  <td>${item.createdBy}</td>
                  <td>${this.formatDate(item.createdDate)}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
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
                  ?active=${this.activePage === "device"}
                  @click=${() => (this.activePage = "device")}
                >
                  Tình trạng thiết bị
                </button>

                <button
                  class="tab-btn"
                  ?active=${this.activePage === "news"}
                  @click=${() => (this.activePage = "news")}
                >
                  Bản tin đã phát
                </button>

                <button
                  class="tab-btn"
                  ?active=${this.activePage === "micro"}
                  @click=${() => (this.activePage = "micro")}
                >
                  Micro đã phát
                </button>
              </div>

              <div class="table-map-container">${this.renderActivePage()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
