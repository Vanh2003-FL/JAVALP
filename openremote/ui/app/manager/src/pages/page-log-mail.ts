import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from "xlsx"
import "@vaadin/date-picker"
import "@vaadin/combo-box"
import "@vaadin/form-layout"
import "@vaadin/multi-select-combo-box"
import "@vaadin/grid"
import "@vaadin/grid/vaadin-grid-column-group.js"
import "@vaadin/notification"
import "@vaadin/progress-bar"
import "@vaadin/button"
import "@vaadin/horizontal-layout"
import "@vaadin/tabs"
import "@vaadin/tabsheet"
import "@openremote/or-map"
import "@vaadin/card"
import "@vaadin/form-layout"
import "@vaadin/vertical-layout"
import { i18next } from "@openremote/or-translate";
import manager from "@openremote/core";
pdfMake.vfs = pdfFonts.vfs;

@customElement("page-log-mail")
export class MyElement extends LitElement {
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    @property() activeTab = 'overview'; // Nhận từ routes-home
    @property() routeId = '';

    static styles = css`
        :host {
          
        }
        table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        th, td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4d9d2a;
            text-align: center;
            color: white;
        }
        tr{
            background: white;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        @media (max-width: 600px) {
            th, td {
                padding: 10px;
                font-size: 14px;
            }
        }
        vaadin-tabs {
            --vaadin-tabs-selected-text-color: green; /* Màu chữ của tab khi chọn */
            --vaadin-tabs-border-color: transparent; /* Ẩn đường viền mặc định */
        }
        vaadin-tab[selected] {
            color: green; /* Màu chữ khi tab được chọn */
            font-weight: bold;
        }

        vaadin-tab[selected]::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 3px;
            background-color: green; /* Gạch chân màu xanh */
        }
        vaadin-tab[selected]::before {
            background-color: green; /* Gạch chân màu xanh */
        }
        vaadin-tabsheet::part(content) {
            padding: 0 !important;
        }
        vaadin-text-field::part(input-field) {
            background: white !important;
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        }
        vaadin-combo-box::part(input-field) {
            background: white !important;
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        }
        vaadin-card {
            --vaadin-card-background: white !important;
        }
        p{
            margin-left:10px;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            color: #4D9D2A;
            font-weight: 500;
            padding: 10px;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .back-link:hover {
            opacity: 0.8;
        }

        .back-link vaadin-icon {
            margin-right: 8px;
        }
        .pagination {
            display: flex;
            justify-content: end;
            list-style-type: none;
            padding: 0;
        }
        .pagination li {
            margin: 0 5px;
        }
        .pagination a {
            text-decoration: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            color: #666;
            border: 1px solid #ddd;
        }
        .pagination a.active {
            background-color: #4D9D2A;
            cursor: pointer;
            color: white;
            border: 1px solid #4D9D2A;
        }
        .pagination a:hover {
            background-color: #ddd;
        }
        .pagination a[disabled] {
            cursor: not-allowed;
            color: #ccc;
        }
        .pagination a.disabled {
            pointer-events: none; /* Vô hiệu hóa click */
            color: #ccc;           /* Màu xám */
            cursor: default;       /* Không hiển thị icon cấm */
            text-decoration: none;
        }
    `;
    @state() searchQuery = ""
    @state() currentPage :any =1
    @state() totalPage :any =1
    @state() listData:any = []
    async fetchUsers(page) {
        manager.rest.api.NotificationResource.getAll({keyWord:this.searchQuery,page,size:5,data:{sourceId:window.sessionStorage.getItem('realm')}})
            .then((response:any) => {
                this.listData = response.data
                console.log('getAll', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.NotificationResource.countData({keyWord:this.searchQuery,data:{sourceId:window.sessionStorage.getItem('realm')}})
            .then((response) => {
                console.log('response',response)
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }
    firstUpdated(){
        this.fetchUsers(this.currentPage)
    }
    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.fetchUsers(page);
    }
    renderPagination() {
        console.log('current', this.currentPage)
        console.log('current2', this.totalPage)

        const total = this.totalPage;
        const current = this.currentPage;
        const delta = 2; // số trang hiển thị quanh current
        let pages = [];

        // luôn có trang 1
        pages.push(1);

        // thêm các trang quanh current
        for (let i = current - delta; i <= current + delta; i++) {
            if (i > 1 && i < total) {
                pages.push(i);
            }
        }

        // luôn có trang cuối
        if (total > 1) {
            pages.push(total);
        }

        // loại trùng và sắp xếp
        pages = [...new Set(pages)].sort((a, b) => a - b);

        // chèn "..."
        let pagination = [];
        let last = 0;
        for (let p of pages) {
            if (last && p - last > 1) {
                pagination.push('ellipsis');
            }
            pagination.push(p);
            last = p;
        }

        return html`
    <ul class="pagination">
      <li>
        <a 
          @click="${() => this.navigatePage(1)}" 
          class="${current === 1 ? 'disabled' : ''}"
        >&laquo;</a>
      </li>
      <li>
        <a 
          @click="${() => this.navigatePage(current - 1)}" 
          class="${current === 1 ? 'disabled' : ''}"
        >&lsaquo;</a>
      </li>

      ${pagination.map(p => p === 'ellipsis'
            ? html`<li><span class="ellipsis">...</span></li>`
            : html`
          <li>
            <a 
              class="${p === current ? 'active' : ''}" 
              @click="${() => this.navigatePage(p)}"
            >${p}</a>
          </li>`
        )}

      <li>
        <a 
          @click="${() => this.navigatePage(current + 1)}" 
          class="${current === total ? 'disabled' : ''}"
        >&rsaquo;</a>
      </li>
      <li>
        <a 
          @click="${() => this.navigatePage(total)}" 
          class="${current === total ? 'disabled' : ''}"
        >&raquo;</a>
      </li>
    </ul>
  `;
    }

    _onSearchQueryChanged(event) {
        this.searchQuery = event.target.value
    }
    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.currentPage = 1
            this.fetchUsers(this.currentPage)
        }
    }
    handleSearch(){
        this.currentPage = 1
        this.fetchUsers(this.currentPage)
    }
    formatDateNoTime(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year}`;
    }
    showWarningNotification(message: string) {
        // Xóa nếu đang có
        const existing = document.getElementById('custom-toast');
        if (existing) existing.remove();

        // Tạo container
        const toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = '#ffcc00'; // màu success
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        toast.style.transition = 'transform 0.4s ease-out, opacity 0.4s';

        // Gắn vào shadowRoot nếu cần
        (this.shadowRoot || document.body).appendChild(toast);

        // Kích hoạt animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Tự đóng sau 3s
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
    exportToExcel() {
        if (!this.listData || this.listData.length === 0) {
          this.showWarningNotification("Không có dữ liệu để xuất Excel")
        }else{
            // Chuẩn bị dữ liệu
            const excelData = [];

// Thêm tiêu đề chính cho báo cáo
            const reportTitle = ["Báo cáo cảnh báo mail"];
            excelData.push(reportTitle);
            excelData.push([""]);
// Thêm tiêu đề cột
            const headers = ["STT","Nội dung cảnh báo","Thời gian gửi", "Email nhận cảnh báo", "Tên thuộc tính","Khách hàng"];
            excelData.push(headers);

            this.listData.forEach((road,index) => {
                excelData.push([
                    index + 1,
                    road?.titleWarning?.replace(/\[.*?\]\s*/, ''),
                    this.formatDateNoTime(road?.timeSent),
                    road.emailCustomer,
                    road.attributeName,
                    road.realm,
                ]);
            });

// Tạo worksheet và workbook
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            // ws["!cols"] = [
            //     { wch: 25 },   // STT
            //     { wch: 25 },  // Tủ điện (Tên dài hơn)
            //     { wch: 25 }   // Tổng công suất
            // ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Lighting Report");
            const colCount = headers.length;

            const colWidths = Array.from({ length: colCount }).map((_, colIndex) => {
                const column = excelData.map(row => {
                    if (!Array.isArray(row)) return "";
                    return row[colIndex] !== undefined ? String(row[colIndex]) : "";
                });
                const maxLength = Math.max(...column.map(cell => cell.length));

                // Nếu là cột STT (colIndex === 0), giới hạn độ rộng tối đa
                const limitedLength = colIndex === 0 ? Math.min(maxLength, 5) : maxLength;

                return { wch: limitedLength + 2 }; // thêm 2 để tránh cắt chữ
            });


            ws["!cols"] = colWidths;
            XLSX.writeFile(wb, "Nhật ký Email.xlsx");
        }
    }
    @state() private dialogOpened = false;
    @state() private htmlWarning;
    openDialog() {
        this.dialogOpened = true;
    }
    extractStyledBody(htmlString: string): string {
        const styleMatch = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

        const style = styleMatch ? `<style>${styleMatch[1]}</style>` : '';
        const body = bodyMatch ? bodyMatch[1] : htmlString;

        return `${style}${body}`;
    }

    dialogRenderer(root: HTMLElement) {
        console.log('this.htmlWarning?.htmlWarning',this.htmlWarning?.htmlWarning)
        if (root.firstChild) return;

        const container = document.createElement('div');
        container.style.maxWidth = '600px';

        // Thêm tiêu đề căn giữa
        const title = document.createElement('div');
        title.textContent = 'Nội dung mail';
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.fontSize = '18px';
        title.style.marginBottom = '16px';

        // Nội dung HTML chính
        const content = document.createElement('div');
        content.innerHTML = this.extractStyledBody(this.htmlWarning?.htmlWarning);
        console.log(' content.innerHTML', content.innerHTML)
        // Thêm vào dialog
        container.appendChild(title);
        container.appendChild(content);
        root.appendChild(container);
    }


    extractBody(htmlString: string): string {
        const match = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return match ? match[1] : htmlString;
    }
    handleShowHtml(item){
        console.log('item',item)
        this.htmlWarning = item
        this.dialogOpened = true
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('session-changed', this._onSessionChanged);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }
    _onSessionChanged = (e) => {
        const { key, value } = e.detail;
        if (key === 'realm') {
            this.currentPage =1
            const page = this.currentPage
            manager.rest.api.NotificationResource.getAll({keyWord:this.searchQuery,page,size:5,data:{sourceId:value}})
                .then((response:any) => {
                    this.listData = response.data
                    console.log('getAll', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.NotificationResource.countData({keyWord:this.searchQuery,data:{sourceId:value}})
                .then((response) => {
                    console.log('response',response)
                    this.totalPage = Math.ceil(response.data / 5);
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
    }
    render() {
        return html`
            <vaadin-dialog
                    .opened=${this.dialogOpened}
                    .renderer=${this.dialogRenderer.bind(this)}
                    @opened-changed=${(e: CustomEvent) => (this.dialogOpened = e.detail.value)}
            ></vaadin-dialog>
            <div style="width: 100%;">
                 <div style="background: white;margin: 10px 20px;padding: 10px 0px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px">
                        <vaadin-horizontal-layout theme="spacing padding" style="flex-wrap: wrap">
                            <vaadin-text-field
                                    @keyup=${this.onKeyUp}
                                    placeholder="Nhập email,tên thuộc tính"
                                    clear-button-visible
                                    @value-changed="${this._onSearchQueryChanged}"
                            >
                            </vaadin-text-field>
                            <vaadin-button style="background: #4D9D2A;color: white;"  @click="${this.handleSearch}">
                                <or-icon icon="search" slot="prefix"></or-icon>
                                ${i18next.t("Search")}
                            </vaadin-button>
                            <vaadin-button style="background: #4D9D2A;color: white;" @click="${this.exportToExcel}">
                                <or-icon icon="file-excel" slot="prefix"></or-icon>
                                ${i18next.t("ExportExcel")}
                            </vaadin-button>
                        </vaadin-horizontal-layout>
                    </div>
                <div style="margin:20px 20px">
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Nội dung cảnh báo</th>
                            <th>Thời gian gửi</th>
                            <th>Email nhận cảnh báo</th>
                            <th>Tên thuộc tính</th>
                            <th>Khách hàng</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.listData?.length !== 0 ? this.listData?.map((item,index) => {
                            const rowNumber = (this.currentPage - 1) * 5 + index + 1
                            return html`
                                    <tr @click="${()=>this.handleShowHtml(item)}" style="cursor: pointer">
                                        <td>${rowNumber}</td>
                                        <td>${item?.titleWarning?.replace(/\[.*?\]\s*/, '')}
                                        </td>
                                        <td>${this.formatDateNoTime(item?.timeSent)}
                                        </td>
                                        <td>${item?.emailCustomer}
                                        </td>
                                        <td>${item?.attributeName}</td>
                                        <td>${item?.realm}</td>
                                    </tr>
                                `;
                        }) : html`
                                <tr>
                                    <td colspan="6">
                                        <div colspan="6"
                                             style="height: 200px;display: flex;align-items: center;justify-content: center">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>`}
                        </tbody>
                    </table> 
                    ${this.renderPagination()}
                </div>
            </div>
         
        `;
    }
}
