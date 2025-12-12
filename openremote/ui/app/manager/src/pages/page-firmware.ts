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
import {i18next} from "@openremote/or-translate";
import manager from "@openremote/core";

pdfMake.vfs = pdfFonts.vfs;

@customElement("page-firmware")
export class MyElement extends LitElement {
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    @property() activeTab = 'overview'; // Nhận từ routes-home
    @property() routeId = '';
    @state() showErrorFile
    @state() showIconClose = false

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

        tr {
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

        p {
            margin-left: 10px;
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
            color: #ccc; /* Màu xám */
            cursor: default; /* Không hiển thị icon cấm */
            text-decoration: none;
        }
    `;

    @state() currentPage: any = 1
    @state() totalPage: any = 1
    @state() listData: any = []

    @state() currentPageModel: any = 1
    @state() totalPageModel: any = 1
    @state() listDataModel: any = []

    @state() currentPageDSTB: any = 1
    @state() totalPageDSTB: any = 1
    @state() listDataDSTB: any = []
    showCustomNotification(message: string) {
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
        toast.style.background = '#4D9D2A'; // màu success
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

    async fetchUsers(page) {
        manager.rest.api.FirmwareInfoResource.getAll({
            page,
            size: 5,
        })
            .then((response: any) => {
                this.listData = response.data
                console.log('getAll', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.FirmwareInfoResource.countData()
            .then((response) => {
                console.log('response', response)
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }
    async fetchModel(page) {
        console.log('this.infoFW?.id',this.infoFW?.id)
        manager.rest.api.FirmwareInfoDetailResource.getFrwInfoDetailByFrwInfoId(this.infoFW?.id,{
            page,
            size: 5,
        })
            .then((response: any) => {
                this.listDataModel = response.data
                console.log('getAllModel', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.FirmwareInfoDetailResource.countData({id:this.infoFW?.id})
            .then((response) => {
                console.log('response', response)
                this.totalPageModel = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }
    async fetchDSTB(page) {
        console.log('this.dataDSTBCurrent?.id',this.dataDSTBCurrent?.id)
        manager.rest.api.FirmwareInfoAssetResource.getFrwInfoAssetByFrwInfoDetailId(this.dataDSTBCurrent?.id,{
            page,
            size: 5,
        })
            .then((response: any) => {
                this.listDataDSTB = response.data
                console.log('getAllModelInfo', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.FirmwareInfoAssetResource.countData({id:this.dataDSTBCurrent?.id})
            .then((response) => {
                console.log('response', response)
                this.totalPageDSTB = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }

    @state() currentUser

    firstUpdated() {
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                this.currentUser = response.data
                console.log('roadSetup2', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.fetchUsers(this.currentPage)
        const formLayout = this.shadowRoot.querySelector('vaadin-form-layout');
        if (formLayout) {
            const style = document.createElement('style');
            style.textContent = `
        #layout {
         height:100%;
         align-items:unset;
         justify-content:space-between
        }
        #layout ::slotted(*){
        margin:0px
        }
      `;
            // Thêm style vào shadowRoot của vaadin-form-layout
            formLayout?.shadowRoot?.appendChild(style);
        }
    }

    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.fetchUsers(page);
    }

    renderPagination() {
        console.log('current', this.currentPage)
        console.log('current2', this.totalPage)
        return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePage(1)}" class="${this.currentPage === 1 ? 'disabled' : ''}">&laquo;</a>
                </li>
                <li><a @click="${() => this.navigatePage(this.currentPage - 1)}"
                       class="${this.currentPage === 1 ? 'disabled' : ''}">&lsaquo;</a></li>
                ${Array.from({length: this.totalPage}, (_, i) => i + 1).map(page => html`
                    <li><a class="${page === this.currentPage ? 'active' : ''}"
                           @click="${() => this.navigatePage(page)}">${page}</a></li>
                `)}
                <li><a @click="${() => this.navigatePage(this.currentPage + 1)}"
                       class="${this.currentPage === this.totalPage ? 'disabled' : ''}">&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePage(this.totalPage)}"
                       class="${this.currentPage === this.totalPage ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
    }

    navigatePageInfoPB(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.fetchUsers(page);
    }
    navigatePageModel(page) {
        if (page < 1 || page > this.totalPageModel) return;
        this.currentPageModel = page
        this.fetchModel(page);
    }
    navigatePageDSTB(page) {
        if (page < 1 || page > this.totalPageDSTB) return;
        this.currentPageDSTB = page
        this.fetchDSTB(page);
    }

    renderPaginationInfoPB() {
        console.log('current', this.currentPage)
        console.log('current2', this.totalPage)
        return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePageInfoPB(1)}" class="${this.currentPage === 1 ? 'disabled' : ''}">&laquo;</a>
                </li>
                <li><a @click="${() => this.navigatePageInfoPB(this.currentPage - 1)}"
                       class="${this.currentPage === 1 ? 'disabled' : ''}">&lsaquo;</a></li>
                ${Array.from({length: this.totalPage}, (_, i) => i + 1).map(page => html`
                    <li><a class="${page === this.currentPage ? 'active' : ''}"
                           @click="${() => this.navigatePageInfoPB(page)}">${page}</a></li>
                `)}
                <li><a @click="${() => this.navigatePageInfoPB(this.currentPage + 1)}"
                       class="${this.currentPage === this.totalPage ? 'disabled' : ''}">&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePageInfoPB(this.totalPage)}"
                       class="${this.currentPage === this.totalPage ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
    }
    renderPaginationModel() {
        return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePageModel(1)}" class="${this.currentPageModel === 1 ? 'disabled' : ''}">&laquo;</a>
                </li>
                <li><a @click="${() => this.navigatePageModel(this.currentPageModel - 1)}"
                       class="${this.currentPageModel === 1 ? 'disabled' : ''}">&lsaquo;</a></li>
                ${Array.from({length: this.totalPageModel}, (_, i) => i + 1).map(page => html`
                    <li><a class="${page === this.currentPageModel ? 'active' : ''}"
                           @click="${() => this.navigatePageModel(page)}">${page}</a></li>
                `)}
                <li><a @click="${() => this.navigatePageModel(this.currentPageModel + 1)}"
                       class="${this.currentPageModel === this.totalPageModel ? 'disabled' : ''}">&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePageModel(this.totalPageModel)}"
                       class="${this.currentPageModel === this.totalPageModel ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
    }
    renderPaginationDSTB() {
        return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePageDSTB(1)}" class="${this.currentPageDSTB === 1 ? 'disabled' : ''}">&laquo;</a>
                </li>
                <li><a @click="${() => this.navigatePageDSTB(this.currentPageDSTB - 1)}"
                       class="${this.currentPageDSTB === 1 ? 'disabled' : ''}">&lsaquo;</a></li>
                ${Array.from({length: this.totalPageDSTB}, (_, i) => i + 1).map(page => html`
                    <li><a class="${page === this.currentPageDSTB ? 'active' : ''}"
                           @click="${() => this.navigatePageDSTB(page)}">${page}</a></li>
                `)}
                <li><a @click="${() => this.navigatePageDSTB(this.currentPageDSTB + 1)}"
                       class="${this.currentPageDSTB === this.totalPageDSTB ? 'disabled' : ''}">&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePageDSTB(this.totalPageDSTB)}"
                       class="${this.currentPageDSTB === this.totalPageDSTB ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
    }



    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.currentPage = 1
            this.fetchUsers(this.currentPage)
        }
    }

    handleSearch() {
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

    formatDateTimeDefault(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
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
        } else {
            // Chuẩn bị dữ liệu
            const excelData = [];

// Thêm tiêu đề chính cho báo cáo
            const reportTitle = ["Báo cáo cảnh báo mail"];
            excelData.push(reportTitle);
            excelData.push([""]);
// Thêm tiêu đề cột
            const headers = ["STT", "Nội dung cảnh báo", "Thời gian gửi", "Email nhận cảnh báo", "Tên thuộc tính", "Khách hàng"];
            excelData.push(headers);

            this.listData.forEach((road, index) => {
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

            const colWidths = Array.from({length: colCount}).map((_, colIndex) => {
                const column = excelData.map(row => {
                    if (!Array.isArray(row)) return "";
                    return row[colIndex] !== undefined ? String(row[colIndex]) : "";
                });
                const maxLength = Math.max(...column.map(cell => cell.length));

                // Nếu là cột STT (colIndex === 0), giới hạn độ rộng tối đa
                const limitedLength = colIndex === 0 ? Math.min(maxLength, 5) : maxLength;

                return {wch: limitedLength + 2}; // thêm 2 để tránh cắt chữ
            });


            ws["!cols"] = colWidths;
            XLSX.writeFile(wb, "Nhật ký Email.xlsx");
        }
    }


    extractBody(htmlString: string): string {
        const match = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return match ? match[1] : htmlString;
    }

    @state() infoFW
    @state() selectIndexInfoPB = -1
    @state() selectIndexModel = -1
    @state() dataDSTBCurrent
    handleShowHtml(item,index) {
        console.log('item', item)
        this.infoFW = item
        this.selectIndexInfoPB = index;
        this.selectIndexModel = -1
        this.listDataDSTB = []
        this.fetchModel(this.currentPageModel)
    }
    handleShowModel(item,index){
        this.dataDSTBCurrent = item
        this.selectIndexModel = index;
        this.fetchDSTB(this.currentPageDSTB)
    }
    handleShowDSTB(item,index){

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
        const {key, value} = e.detail;
        if (key === 'realm') {
            this.currentPage = 1
            const page = this.currentPage
            // manager.rest.api.NotificationResource.getAll({
            //     keyWord: this.searchQuery,
            //     page,
            //     size: 5,
            //     data: {sourceId: value}
            // })
            //     .then((response: any) => {
            //         this.listData = response.data
            //         console.log('getAll', response)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            // manager.rest.api.NotificationResource.countData({keyWord: this.searchQuery, data: {sourceId: value}})
            //     .then((response) => {
            //         console.log('response', response)
            //         this.totalPage = Math.ceil(response.data / 5);
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
        }
    }
    private responsiveSteps: any = [
        // Use one column by default
        {minWidth: 0, columns: 1},
        // Use two columns, if layout's width exceeds 500px
        {minWidth: '500px', columns: 2},
    ];
    @state() selected: any
    @state() fileInfo: any = {}
    @state() pathFirmware

    handleTabChange(e) {
        this.selected = e.detail.value;
    }

    handleExcelImport(event: any) {
        const file = event.target.files[0];
        console.log('file',file)
        if (!file) {
            this.showIconClose = false
            return;
        }
        if(file){
            this.showIconClose = true
            this.showErrorFile = false
        }
        this.nameFileDefault = file?.name
        // const validTypes = [
        //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //     'application/vnd.ms-excel'
        // ];
        // if (!validTypes.includes(file.type)) {
        //     console.warn('Invalid file type:', file.type);
        //     return;
        // }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const base64Content = (e.target!.result as string).split(',')[1]; // loại bỏ phần "data:...;base64,"
                console.log('Base64 content:', base64Content);
                const fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: base64Content
                };
                this.fileInfo = fileInfo
                console.log('fileInfo', fileInfo)

            } catch (err) {
                console.error('Error converting file to base64:', err);
            }
        };

        reader.readAsDataURL(file);
    }

    @state() private isCreateInfoPB = false;
    @state() private isCreateModel = false;
    @state() private isEditModel = false;
    @state() private isEditInfoPB = false;
    @state() private isDeleteDialogInfoPB = false;
    @state() private isDeleteDialogModel = false;
    @state() private isDeleteDialogDSTB = false;
    @state() private isPheDuyetDialogInfoPB = false;
    @state() private isHuyDialogInfoPB = false;
    handleOpenedChangedCreateInfoPB(e: CustomEvent) {
        // this.codeColumnDialog = undefined
        // this.nameColumnDialog = undefined
        // this.statusDidalog = undefined
        // this.description = undefined
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isCreateInfoPB = false;
        }
    }
    handleOpenedChangedCreateModel(e: CustomEvent) {
        // this.codeColumnDialog = undefined
        // this.nameColumnDialog = undefined
        // this.statusDidalog = undefined
        // this.description = undefined
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isCreateModel = false;
        }
    }
    handleOpenedChangedEditModel(e: CustomEvent) {
        // this.codeColumnDialog = undefined
        // this.nameColumnDialog = undefined
        // this.statusDidalog = undefined
        // this.description = undefined
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isEditModel = false;
        }
    }

    handleOpenedChangedEditInfoPB(e: CustomEvent) {
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isEditInfoPB = false;
        }
    }

    handleOpenedChangedDeleteInfoPB(e: CustomEvent) {
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isDeleteDialogInfoPB = false;
        }
    }
    handleOpenedChangedDeleteModel(e: CustomEvent) {
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isDeleteDialogModel = false;
        }
    }
    handleOpenedChangedDeleteDSTB(e: CustomEvent) {
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isDeleteDialogDSTB = false;
        }
    }

    handleOpenedChangedHuyInfoPB(e){
        console.log('ads', e.detail.value)
        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        } else {
            this.isHuyDialogInfoPB = false;
        }
    }
    confirmCreate() {
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#mpb') as any;
        const lampostCodeField2 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#ltb') as any;
        const lampostCodeField3 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#nbd') as any;
        const lampostCodeField4 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#ctltb') as any;
        const isNameValid = lampostCodeField.validate();
        const isNameValid2 = lampostCodeField2.validate();
        const isNameValid3 = lampostCodeField3.validate();
        const isNameValid4 = lampostCodeField4.validate();
        if(this.pathFirmware){
            this.showErrorFile = false

        }else{
            this.showErrorFile = true
            this.nameFileDefault = `Vui lòng chọn file .bin`
        }
        if (!isNameValid || !isNameValid2 || !isNameValid3 || !isNameValid4) {
            return; // Ngừng lại nếu có lỗi
        }
        const versionPattern = /^\d+(\.\d+){0,2}$/;
        const isValid = versionPattern.test(this.frwVersion);

        if (!isValid) {
            lampostCodeField.invalid = true;
            lampostCodeField.errorMessage = 'Định dạng phải là số.số.số (vd: 1.1.2)';
            return;
        } else {
            lampostCodeField.invalid = false;
            lampostCodeField.errorMessage = '';
        }
        manager.rest.api.ConfigurationResource.fileUploadExtend({
            name: this.fileInfo?.name,
            contents: this.fileInfo?.content,
            binary: true,
            firmware:true
        }, {path: `/${this.fileInfo?.name}`})
            .then((response) => {
                this.pathFirmware = response.data
                const object: any = {
                    frwVersion: this.frwVersion,
                    assetType: this.assetType,
                    subAssetType: this.subAssetType,
                    upgradeDate: this.upgradeDate,
                    status: "N",
                    pathFirmware: this.pathFirmware,
                    fileName: this.fileInfo?.name,
                    description: this.description,
                    createBy: this.currentUser?.username,
                    // updateBy?: any;
                }


                console.log('object', object)
                manager.rest.api.FirmwareInfoResource.create(object)
                    .then((response) => {
                        this.fetchUsers(1)
                        this.showCustomNotification("Tạo mới thành công")
                        this.isCreateInfoPB = false
                        console.log('done')
                    })
                    .catch((error) => {
                        this.showCustomNotification("Tạo mới không thành công")
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });

            })
            .catch((error) => {
                this.showCustomNotification("Tạo mới không thành công")
                console.error('Lỗi khi lấy dữ liệu:', error);
            });

    }
    confirmCreateModel() {
        const object: any = {
            frwInfoId: this.infoFW?.id,
            assetModel: this.model,
            description: this.descriptionModel,
            createBy: this.currentUser?.username,
            // updateBy?: any;
        }
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#model') as any;
        const isNameValid = lampostCodeField.validate();
        if (!isNameValid) {
            return; // Ngừng lại nếu có lỗi
        }
        console.log('object', this.currentUser)
        manager.rest.api.FirmwareInfoDetailResource.create(object)
            .then((response) => {
                this.fetchModel(1)
                this.showCustomNotification("Tạo mới thành công")
                this.selectIndexModel = -1
                console.log('done')
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isCreateModel = false
    }
    confirmEditModal(){
        const object: any = {
            id:this.currentAssetModel?.id,
            frwInfoId: this.infoFW?.id,
            // assetModel: this.model,
            description: this.descriptionModel,
            createBy: this.currentUser?.username,
            // updateBy?: any;
        }
        console.log('object', this.currentUser)
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#model') as any;
        const isNameValid = lampostCodeField.validate();
        if (!isNameValid) {
            return; // Ngừng lại nếu có lỗi
        }
        manager.rest.api.FirmwareInfoDetailResource.update(object)
            .then((response) => {
                this.fetchModel(1)
                this.showCustomNotification("Chỉnh sửa thành công")
                this.selectIndexModel = -1
                console.log('done')
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isEditModel = false
    }

    confirmEdit() {
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#mpb') as any;
        const lampostCodeField2 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#ltb') as any;
        const lampostCodeField3 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#nbd') as any;
        const lampostCodeField4 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#ctltb') as any;
        const isNameValid = lampostCodeField.validate();
        const isNameValid2 = lampostCodeField2.validate();
        const isNameValid3 = lampostCodeField3.validate();
        const isNameValid4 = lampostCodeField4.validate();
        if(this.pathFirmware){
            this.showErrorFile = false

        }else{
            this.showErrorFile = true
            this.nameFileDefault = `Vui lòng chọn file .bin`
        }
        if (!isNameValid || !isNameValid2 || !isNameValid3 || !isNameValid4) {
            return; // Ngừng lại nếu có lỗi
        }
        const versionPattern = /^\d+(\.\d+){0,2}$/;
        const isValid = versionPattern.test(this.frwVersion);

        if (!isValid) {
            lampostCodeField.invalid = true;
            lampostCodeField.errorMessage = 'Định dạng phải là số.số.số (vd: 1.1.2)';
            return;
        } else {
            lampostCodeField.invalid = false;
            lampostCodeField.errorMessage = '';
        }
        manager.rest.api.ConfigurationResource.fileUploadExtend({
            name: this.fileInfo?.name,
            contents: this.fileInfo?.content,
            binary: true,
            firmware:true
        }, {path: `/${this.fileInfo?.name}`})
            .then((response) => {
                this.pathFirmware = response.data
                const object: any = {
                    id: this.currentAssetType?.id,
                    frwVersion: this.frwVersion,
                    assetType: this.assetType,
                    subAssetType: this.subAssetType,
                    upgradeDate: this.upgradeDate,
                    status: this.status,
                    pathFirmware: this.pathFirmware,
                    fileName: this.fileInfo?.name,
                    description: this.description,
                    updateBy: this.currentUser?.username
                }
                console.log('object', object)

                manager.rest.api.FirmwareInfoResource.update(object)
                    .then((response) => {
                        this.fetchUsers(1)
                        this.showCustomNotification("Chỉnh sửa thành công")
                        this.isEditInfoPB = false
                        console.log('done')
                    })
                    .catch((error) => {
                        this.showCustomNotification("Chỉnh sửa không thành công")
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
            })
            .catch((error) => {
                this.showCustomNotification("Chỉnh sửa không thành công")
                console.error('Lỗi khi lấy dữ liệu:', error);
            });


    }

    @state() frwVersion
    @state() assetType
    @state() status
    @state() upgradeDate
    @state() subAssetType
    @state() description
    @state() itemsAssetType = [
        {id: "LightAsset", name: 'Đèn'},
        {id: "ElectricalCabinetAsset", name: 'Tủ'},
    ];
    @state() itemsStatus = [
        {id: "N", name: 'Khởi tạo, chờ phê duyệt'},
        {id: "A", name: 'Phê duyệt'},
        {id: "C", name: 'Hủy'},
    ];
    @state() itemsDetailDevice = [
        {id: "SCU", name: 'SCU'},
        {id: "TDU", name: 'TDU'},
        {id: "EDU", name: 'EDU'},
        {id: "NEMA", name: 'Nema'},
    ];

    handleStatus(e) {
        this.status = e.target.value

    }

    handleAssetType(e) {
        this.assetType = e.target.value
        console.log('abc', e.target.value)
        if (e.target.value === "LightAsset") {
            this.itemsDetailDevice = [
                {id: "NEMA", name: 'Nema'},]
            this.subAssetType = undefined
        } else if (e.target.value === "ElectricalCabinetAsset") {
            this.itemsDetailDevice = [{id: "SCU", name: 'SCU'},
                {id: "TDU", name: 'TDU'},
                {id: "EDU", name: 'EDU'},]
            this.subAssetType = undefined
        } else {
            this.itemsDetailDevice = []
            this.subAssetType = undefined
        }
    }
    openRemoveFile(){
        this.showIconClose = false
        if(this.currentAssetType){
            this.nameFileDefault  = ""
        }else{
            this.nameFileDefault  = "Không có tệp nào"
        }

        this.fileInfo = {
           name:""
        }
        this.pathFirmware = undefined
    }

    formCreate() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isCreateInfoPB}"
                                   @opened-changed="${this.handleOpenedChangedCreateInfoPB}" id="myDialog">
                <style>
                    .required::part(label)::after {
                        content: '*';
                        color: red;
                    }

                    /* Ẩn icon chấm tròn mặc định nếu có */
                    .required::part(required-indicator) {
                        display: none;
                    }

                    .file-input {
                        display: none; /* Ẩn input file */
                    }

                    .required::part(label)::after {
                        content: '*';
                        color: red;
                    }

                    /* Ẩn icon chấm tròn mặc định nếu có */
                    .required::part(required-indicator) {
                        display: none;
                    }
                </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới phiên bản</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isCreateInfoPB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                id="mpb"
                                class="required required-field"
                                required error-message="Mã phiên bản không được để trống"
                                label="Mã phiên bản"
                                .value="${this.frwVersion}"
                                @input="${(e)=>this.handleMaPB(e)}">
                        </vaadin-text-field>
                        <vaadin-date-picker id="nbd" class="required required-field"
                                            required error-message="Ngày bắt đầu không được để trống"
                                            .value="${this.upgradeDate}" min="${new Date().toISOString().split("T")[0]}"
                                            label="Ngày bắt đầu"
                                            @value-changed="${(e) => this.upgradeDate = e.target.value}">

                        </vaadin-date-picker>
                        <vaadin-combo-box
                                id="ltb"
                                class="required required-field"
                                required error-message="Loại thiết bị không được để trống"
                                label="Loại thiết bị"
                                clear-button-visible
                                placeholder="Loại thiết bị"
                                .value="${this.assetType}"
                                .items="${this.itemsAssetType}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleAssetType}"></vaadin-combo-box>
                        <vaadin-combo-box
                                id="ctltb"
                                class="required required-field"
                                required error-message="Chi tiết loại thiết bị không được để trống"
                                label="Chi tiết loại thiết bị"
                                clear-button-visible
                                placeholder="Chi tiết loại TB"
                                .value="${this.subAssetType}"
                                .items="${this.itemsDetailDevice}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${(e) => this.subAssetType = e.target.value}"></vaadin-combo-box>
                        <vaadin-text-field
                                label="Mô tả"
                                .value="${this.description}"
                                @input="${(e) => this.description = e.target.value}">
                        </vaadin-text-field>
                        <div style="padding-top: 30px">
                            <label for="excelInput" >
                                <vaadin-button> Chọn File</vaadin-button>
                            </label>
                            ${this.showIconClose ? html`
                                <vaadin-icon icon="vaadin:close"
                                             style="color: red;cursor: pointer;margin: 0 5px"
                                             @click="${() => this.openRemoveFile()}"></vaadin-icon>` : html``}
                            <span id="fileNameDisplay"
                                  style="${this.showErrorFile ? `color:red;margin-left: 10px` : `margin-left: 10px`}">
                                ${this.nameFileDefault ? this.nameFileDefault : "Không có tệp nào"}
                            </span>
                            <input
                                    type="file"
                                    id="excelInput"
                                    class="file-input"
                                    accept=".bin"
                                    @change="${this.handleExcelImport}"
                            />
                        </div>
                        <vaadin-text-field
                                disabled
                                label="Tên file"
                                .value="${this.fileInfo?.name}"
                        >
                        </vaadin-text-field>

                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isCreateInfoPB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${() => this.confirmCreate()}">Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    @state() model
    @state() descriptionModel
    formCreateModal() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isCreateModel}"
                                   @opened-changed="${this.handleOpenedChangedCreateModel}" id="myDialog">
                <style>
                    .required::part(label)::after {
                        content: '*';
                        color: red;
                    }

                    /* Ẩn icon chấm tròn mặc định nếu có */
                    .required::part(required-indicator) {
                        display: none;
                    }

                    .file-input {
                        display: none; /* Ẩn input file */
                    }
                </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới Model</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isCreateModel = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                id="model"
                                class="required required-field"
                                required error-message="Model không được để trống"
                                label="Model"
                                .value="${this.model}"
                                @input="${(e) => this.model = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-text-field
                                label="Mô tả"
                                .value="${this.descriptionModel}"
                                @input="${(e) => this.descriptionModel = e.target.value}">
                        </vaadin-text-field>
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isCreateModel = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${() => this.confirmCreateModel()}">Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formEditModal() {
    const responsiveSteps2: any = [
            // Use one column by default
            {minWidth: 0, columns: 1},
            // Use two columns, if layout's width exceeds 500px
            {minWidth: '400px', columns: 1},
        ];
        return html`
            <vaadin-dialog-overlay ?opened="${this.isEditModel}"
                                   @opened-changed="${this.handleOpenedChangedEditModel}" id="myDialog">
                <style>
                    .required::part(label)::after {
                        content: '*';
                        color: red;
                    }

                    /* Ẩn icon chấm tròn mặc định nếu có */
                    .required::part(required-indicator) {
                        display: none;
                    }

                    .file-input {
                        display: none; /* Ẩn input file */
                    }
                </style>
                <div style="width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới Model</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isEditModel = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${responsiveSteps2}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                label="Mô tả"
                                .value="${this.descriptionModel}"
                                @input="${(e) => this.descriptionModel = e.target.value}">
                        </vaadin-text-field>
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isEditModel = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${() => this.confirmEditModal()}">Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    handleMaPB(e){
        const value = e.target.value;
        this.frwVersion = value;
    }
    formEdit() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isEditInfoPB}"
                                   @opened-changed="${this.handleOpenedChangedEditInfoPB}" id="myDialog">
                <style>
                    .required::part(label)::after {
                        content: '*';
                        color: red;
                    }

                    /* Ẩn icon chấm tròn mặc định nếu có */
                    .required::part(required-indicator) {
                        display: none;
                    }

                    .file-input {
                        display: none; /* Ẩn input file */
                    }
                </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới email</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isEditInfoPB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                id="mpb"
                                class="required required-field"
                                required error-message="Mã phiên bản không được để trống"
                                label="Mã phiên bản"
                                .value="${this.frwVersion}"
                                @input="${(e)=>this.handleMaPB(e)}">
                        </vaadin-text-field>
                        <vaadin-date-picker id="nbd"   class="required required-field"
                                              required error-message="Mã phiên bản không được để trống" .value="${this.upgradeDate}" min="${new Date().toISOString().split("T")[0]}"
                                            label="Ngày bắt đầu"
                                            @value-changed="${(e) => this.upgradeDate = e.target.value}">

                        </vaadin-date-picker>
                        <vaadin-combo-box
                                id="ltb"
                                class="required required-field"
                                required error-message="Mã phiên bản không được để trống"
                                label="Loại thiết bị"
                                clear-button-visible
                                placeholder="Loại thiết bị"
                                .value="${this.assetType}"
                                .items="${this.itemsAssetType}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleAssetType}"></vaadin-combo-box>
                        <vaadin-combo-box
                                id="ctltb"
                                class="required required-field"
                                required error-message="Mã phiên bản không được để trống"
                                label="Chi tiết loại thiết bị"
                                clear-button-visible
                                placeholder="Chi tiết loại TB"
                                .value="${this.subAssetType}"
                                .items="${this.itemsDetailDevice}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${(e) => this.subAssetType = e.target.value}"></vaadin-combo-box>
                        <vaadin-text-field
                                label="Mô tả"
                                .value="${this.description}"
                                @input="${(e) => this.description = e.target.value}">
                        </vaadin-text-field>
                        <div style="padding-top: 30px">
                            <label for="excelInput" >
                                <vaadin-button> Chọn File</vaadin-button>
                            </label>
                            ${this.showIconClose ? html`
                                <vaadin-icon icon="vaadin:close"
                                             style="color: red;cursor: pointer;margin: 0 5px"
                                             @click="${() => this.openRemoveFile()}"></vaadin-icon>` : html``}
                            <span id="fileNameDisplay"
                                  style="${this.showErrorFile ? `color:red;margin-left: 10px` : `margin-left: 10px`}">
                                ${this.nameFileDefault ? this.nameFileDefault : "Không có tệp nào"}
                            </span>
                            <input
                                    type="file"
                                    id="excelInput"
                                    class="file-input"
                                    accept=".bin"
                                    @change="${this.handleExcelImport}"
                            />
                        </div>
                        <vaadin-text-field
                                label="Tên file"
                                .value="${this.fileInfo?.name}"
                        >
                        </vaadin-text-field>

                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isEditInfoPB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${() => this.confirmEdit()}">Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }

    openCreateInfoPb() {
        const input = document.getElementById("excelInput") as HTMLInputElement;
        if (input) {
            input.value = "";
        }
        this.frwVersion = undefined
        this.assetType = undefined
        this.fileInfo = undefined
        this.pathFirmware = undefined
        this.status = undefined
        this.upgradeDate = undefined
        this.subAssetType = undefined
        this.description = undefined
        this.isCreateInfoPB = true
        this.nameFileDefault = undefined
        this.showIconClose = false
    }
    openCreateModel(){
        this.model = undefined
        this.descriptionModel  =undefined
        this.isCreateModel = true
    }

    @state() dataDeleteInfoPB
    @state() currentAssetType
    @state() currentAssetModel

    updated(changedProps) {
        if (changedProps.has('isEditInfoPB')) {
            if (this.itemsDetailDevice?.length > 0 && this.currentAssetType) {
                this.subAssetType = this.currentAssetType?.subAssetType;
            }
        }
        if (changedProps.has('isPheDuyetDialogInfoPB')) {
            if (this.itemsDetailDevice?.length > 0 && this.currentAssetType) {
                this.subAssetType = this.dataPheDuyetInfoPB?.subAssetType;
            }
        }
        if (changedProps.has('isHuyDialogInfoPB')) {
            if (this.itemsDetailDevice?.length > 0 && this.currentAssetType) {
                this.subAssetType = this.dataHuyInfoPB?.subAssetType;
            }
        }
    }

    openEditInfoPb(item) {
        this.showIconClose = true
        this.currentAssetType = item;
        if (item.assetType === "LightAsset") {
            this.itemsDetailDevice = [
                {id: "NEMA", name: 'Nema'},]
        } else if (item.assetType === "ElectricalCabinetAsset") {
            this.itemsDetailDevice = [{id: "SCU", name: 'SCU'},
                {id: "TDU", name: 'TDU'},
                {id: "EDU", name: 'EDU'},]
        } else {
            this.itemsDetailDevice = []
        }
        // if (this.itemsDetailDevice.length > 0) {
        //     console.log('itemsDetailDevice',this.itemsDetailDevice)
        //     this.subAssetType = item.subAssetType
        // }
        this.frwVersion = item.frwVersion
        this.assetType = item.assetType
        this.pathFirmware = item.pathFirmware
        this.status = item.status
        this.upgradeDate = this.formatDateTimeDefault(item.upgradeDate)
        // this.subAssetType = item.subAssetType
        this.description = item.description
        this.nameFileDefault = item?.fileName
        this.isEditInfoPB = true
        this.fileInfo = {
            name:item?.fileName
        }

    }
    openEditModel(item){
        console.log('this.infoFW',this.infoFW)
        this.currentAssetModel = item
        // this.model = item?.assetModel
        this.descriptionModel = item?.description
        this.isEditModel = true
    }
    @state() dataPheDuyetInfoPB
    @state() dataModelDelete
    @state() dataHuyInfoPB
    @state() dataDSTBDelete
    openDeleteInfoPb(item) {
        this.dataDeleteInfoPB = item
        this.isDeleteDialogInfoPB = true
    }
    openDeleteModel(item){
        this.dataModelDelete = item
        this.isDeleteDialogModel = true
    }
    openDeleteDSTB(item){
        this.dataDSTBDelete = item
        this.isDeleteDialogDSTB = true
    }
    openPheDuyetInfoPb(item) {
        this.dataPheDuyetInfoPB = item
        this.currentAssetType = item;
        if (item.assetType === "LightAsset") {
            this.itemsDetailDevice = [
                {id: "NEMA", name: 'Nema'},]
        } else if (item.assetType === "ElectricalCabinetAsset") {
            this.itemsDetailDevice = [{id: "SCU", name: 'SCU'},
                {id: "TDU", name: 'TDU'},
                {id: "EDU", name: 'EDU'},]
        } else {
            this.itemsDetailDevice = []
        }
        this.frwVersion = item.frwVersion
        this.assetType = item.assetType
        this.pathFirmware = item.pathFirmware
        this.status = item.status
        this.upgradeDate = this.formatDateTimeDefault(item.upgradeDate)
        this.description = item.description
        this.nameFileDefault = item?.fileName
        this.isPheDuyetDialogInfoPB = true
    }

    openHuyInfoPb(item){
        this.dataHuyInfoPB = item
        this.currentAssetType = item;
        if (item.assetType === "LightAsset") {
            this.itemsDetailDevice = [
                {id: "NEMA", name: 'Nema'},]
        } else if (item.assetType === "ElectricalCabinetAsset") {
            this.itemsDetailDevice = [{id: "SCU", name: 'SCU'},
                {id: "TDU", name: 'TDU'},
                {id: "EDU", name: 'EDU'},]
        } else {
            this.itemsDetailDevice = []
        }
        this.frwVersion = item.frwVersion
        this.assetType = item.assetType
        this.pathFirmware = item.pathFirmware
        this.status = item.status
        this.upgradeDate = this.formatDateTimeDefault(item.upgradeDate)
        this.description = item.description
        this.nameFileDefault = item?.fileName
        this.isHuyDialogInfoPB = true
    }


    confirmDeleteInfoPB() {
        if (this.dataDeleteInfoPB?.status === "A") {
            this.isDeleteDialogInfoPB = false
            this.showWarningNotification("Không được xóa do đang ở trạng thái phê duyệt")
        } else {
            manager.rest.api.FirmwareInfoResource.delete(this.dataDeleteInfoPB?.id)
                .then((response) => {
                    this.fetchUsers(1)
                    this.showCustomNotification("Xóa thành công")
                    console.log('done')
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isDeleteDialogInfoPB = false
        }
    }
    confirmDeleteDSTB(){
        if (this.infoFW?.status === "A") {
            this.isDeleteDialogDSTB = false
            this.showWarningNotification("Không được xóa do đang ở trạng thái phê duyệt")
        } else {
            manager.rest.api.FirmwareInfoAssetResource.delete(this.dataDSTBDelete?.id)
                .then((response) => {
                    this.fetchDSTB(1)
                    this.showCustomNotification("Xóa thành công")
                    console.log('done')
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isDeleteDialogDSTB = false
        }
    }
    confirmDeleteModel(){
        if (this.infoFW?.status === "A") {
            this.isDeleteDialogModel = false
            this.showWarningNotification("Không được xóa do đang ở trạng thái phê duyệt")
        } else {
            manager.rest.api.FirmwareInfoDetailResource.delete(this.dataModelDelete?.id)
                .then((response) => {
                    this.fetchModel(1)
                    this.showCustomNotification("Xóa thành công")
                    console.log('done')
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isDeleteDialogModel = false
        }

    }
    confirmPheDuyetInfoPB(){
        const object: any = {
            id: this.dataPheDuyetInfoPB?.id,
            frwVersion: this.frwVersion,
            assetType: this.assetType,
            subAssetType: this.subAssetType,
            upgradeDate: this.upgradeDate,
            status: "A",
            pathFirmware: this.pathFirmware,
            fileName: this.nameFileDefault,
            description: this.description,
            updateBy: this.currentUser?.username
        }
        console.log('object', object)
        manager.rest.api.FirmwareInfoResource.update(object)
            .then((response) => {
                this.fetchUsers(1)
                this.showCustomNotification("Phê duyệt thành công")
                console.log('done')
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isPheDuyetDialogInfoPB = false
    }
    confirmHuyInfoPB(){
        const object: any = {
            id: this.dataHuyInfoPB?.id,
            frwVersion: this.frwVersion,
            assetType: this.assetType,
            subAssetType: this.subAssetType,
            upgradeDate: this.upgradeDate,
            status: "C",
            pathFirmware: this.pathFirmware,
            fileName: this.nameFileDefault,
            description: this.description,
            updateBy: this.currentUser?.username
        }
        console.log('object', object)
        manager.rest.api.FirmwareInfoResource.update(object)
            .then((response) => {
                this.fetchUsers(1)
                this.showCustomNotification("Hủy thành công")
                console.log('done')
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isHuyDialogInfoPB = false
    }

    @state() nameFileDefault

    formDelete() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDeleteDialogInfoPB}"
                                   @opened-changed="${this.handleOpenedChangedDeleteInfoPB}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isDeleteDialogInfoPB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn xóa phiên bản <span
                            style="font-weight: bold">${this.dataDeleteInfoPB?.frwVersion}</span> này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isDeleteDialogInfoPB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${this.confirmDeleteInfoPB}">Xóa
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formDeleteModal() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDeleteDialogModel}"
                                   @opened-changed="${this.handleOpenedChangedDeleteModel}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isDeleteDialogModel = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn xóa model <span
                            style="font-weight: bold">${this.dataModelDelete?.assetModel}</span> này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isDeleteDialogModel = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${this.confirmDeleteModel}">Xóa
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formDeleteDSTB() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDeleteDialogDSTB}"
                                   @opened-changed="${this.handleOpenedChangedDeleteDSTB}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isDeleteDialogDSTB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn xóa thiết bị <span
                            style="font-weight: bold">${this.dataDSTBDelete?.assetName}</span> này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isDeleteDialogDSTB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${this.confirmDeleteDSTB}">Xóa
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }

    formPheDuyet() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isPheDuyetDialogInfoPB}"
                                   @opened-changed="${this.handleOpenedChangedDeleteInfoPB}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isPheDuyetDialogInfoPB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn phê duyệt phiên bản <span
                            style="font-weight: bold">${this.dataPheDuyetInfoPB?.frwVersion}</span> này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isPheDuyetDialogInfoPB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${this.confirmPheDuyetInfoPB}">Phê duyệt
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formHuy() {
        return html`
            <vaadin-dialog-overlay ?opened="${this.isHuyDialogInfoPB}"
                                   @opened-changed="${this.handleOpenedChangedHuyInfoPB}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close"
                                 @click="${() => this.isHuyDialogInfoPB = false}"
                                 style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn hủy phiên bản <span
                            style="font-weight: bold">${this.dataHuyInfoPB?.frwVersion}</span> này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black"
                                       @click="${() => this.isHuyDialogInfoPB = false}">Hủy
                        </vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white"
                                       @click="${this.confirmHuyInfoPB}">Hủy phê duyệt
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }

    render() {
        return html`
            ${this.formCreate()}
            ${this.formCreateModal()}
            ${this.formEdit()}
            ${this.formEditModal()}
            ${this.formDelete()}
            ${this.formDeleteModal()}
            ${this.formPheDuyet()}
            ${this.formHuy()}
            ${this.formDeleteDSTB()}
            <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="height: 100%">
                <div style="width: 100%;">
                    <div style="margin:20px 20px">
                        <h2 style="margin:10px 0px;font-size: 16px;">Thông tin phiên bản</h2>
                        <vaadin-button style="background: #4D9D2A;color: white;margin-top: 10px"
                                       @click="${() => this.openCreateInfoPb()}">
                            Thêm mới
                        </vaadin-button>
                        <table>
                            <thead>
                            <tr>
                                <th>STT</th>
                                <th>Phiên bản</th>
                                <th>Ngày cập nhật</th>
                                <th>Loại TB</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.listData?.length !== 0 ? this.listData?.map((item, index) => {
                                const rowNumber = (this.currentPage - 1) * 5 + index + 1
                                return html`
                                    <tr @click="${() => this.handleShowHtml(item,index)}" style="background-color: ${this.selectIndexInfoPB === index ? '#dbebd4' : 'transparent'}; cursor: pointer;">
                                        <td>${rowNumber}</td>
                                        <td>${item?.frwVersion}
                                        </td>
                                        <td>${this.formatDateNoTime(item?.upgradeDate)}
                                        </td>
                                        <td>
                                            ${item?.assetType === "LightAsset" ? "Đèn" : item?.assetType === "ElectricalCabinetAsset" ? "Tủ" : ""}
                                        </td>
                                        <td>
                                            ${item?.status === "N" ? "Khởi tạo,chờ phê duyệt" : item?.status === "A" ? "Phê duyệt" : item?.status === "C" ? "Hủy" : ""}
                                        </td>
                                        <td>
                                            <vaadin-icon icon="vaadin:check"
                                                         style="color: black;cursor: pointer;margin: 0 5px" @click="${() => this.openPheDuyetInfoPb(item)}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:close"
                                                         style="color: black;cursor: pointer;margin: 0 5px" @click="${() => this.openHuyInfoPb(item)}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:pencil"
                                                         style="color: black;cursor: pointer;margin: 0 5px"
                                                         @click="${() => this.openEditInfoPb(item)}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:trash"
                                                         style="color: black;cursor: pointer"
                                                         @click="${() => this.openDeleteInfoPb(item)}"></vaadin-icon>
                                        </td>
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
                        ${this.renderPaginationInfoPB()}
                        <h2 style="margin:10px 0px;font-size: 16px">Chi tiết phiên bản</h2>
                        <div style="display: flex;justify-content: space-between">
                            <div style="display: flex;flex-direction: column;">
                                <p>Mã phiên bản : ${this.infoFW?.frwVersion}</p>
                                <p>Loại thiết bị :
                                    ${this.infoFW?.assetType === "LightAsset" ? "Đèn" : this.infoFW?.assetType === "ElectricalCabinetAsset" ? "Tủ" : ""}
                                </p>
                                <p>Chi tiết loại TB : ${this.infoFW?.subAssetType} </p>
                                <p>Tên file : ${this.infoFW?.fileName}</p>
                            </div>
                            <div style="display: flex;flex-direction: column">
                                <p>Trạng thái :
                                    ${this.infoFW?.status === "N" ? "Khởi tạo,chờ phê duyệt" : this.infoFW?.status === "A" ? "Phê duyêt" : this.infoFW?.status === "C" ? "Hủy" : ""}</p>
                                <p>Ngày áp dụng :
                                    ${this.infoFW?.upgradeDate ? this.formatDateNoTime(this.infoFW?.upgradeDate) : ""}</p>
                                <p>Mô tả : ${this.infoFW?.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 style="margin:10px 0px;font-size: 16px;">Model áp dụng</h2>
                    <vaadin-button style="background: #4D9D2A;color: white;margin-top: 10px"
                                   @click="${() => this.openCreateModel()}">
                        Thêm mới
                    </vaadin-button>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Model</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.listDataModel?.length !== 0 ? this.listDataModel?.map((item, index) => {
                            const rowNumber = (this.currentPageModel - 1) * 5 + index + 1
                            return html`
                                <tr @click="${() => this.handleShowModel(item,index)}" style="background-color: ${this.selectIndexModel === index ? '#dbebd4' : 'transparent'}; cursor: pointer;">
                                    <td>${rowNumber}</td>
                                    <td>${item?.assetModel}
                                    </td>
                                    <td>${item?.description}
                                    </td>
                                    <td>
                                        <vaadin-icon icon="vaadin:pencil"
                                                     style="color: black;cursor: pointer;margin: 0 5px" @click="${() => this.openEditModel(item)}"></vaadin-icon>
                                        <vaadin-icon icon="vaadin:trash"
                                                     style="color: black;cursor: pointer" @click="${() => this.openDeleteModel(item)}"></vaadin-icon>
                                    </td>
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
                    ${this.renderPaginationModel()}
                    <h2 style="margin:10px 0px;font-size: 16px;">Danh sách thiết bị</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Thiết bị</th>
                            <th>Phiên bản cũ</th>
                            <th>Phiên bản mới</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.listDataDSTB?.length !== 0 ? this.listDataDSTB?.map((item, index) => {
                            const rowNumber = (this.currentPageDSTB - 1) * 5 + index + 1
                            return html`
                                <tr @click="${() => this.handleShowDSTB(item,index)}" style="cursor: pointer">
                                    <td>${rowNumber}</td>
                                    <td>${item.assetName}
                                    </td>
                                    <td>${item?.frwVersionOld}
                                    </td>
                                    <td>${item?.frwVersionNew}
                                    </td>
                                    <td>${item?.status === "N" ? "Chưa gửi" : item?.status === "S" ? "Đang gửi,chờ phản hồi" : item?.status === "D" ? "Hoàn thành nâng cấp" : item?.status === "E" ? "Lõi":""}</td>
                                    <td>
                                        <vaadin-icon icon="vaadin:trash"
                                                     style="color: black;cursor: pointer" @click="${() => this.openDeleteDSTB(item)}"></vaadin-icon>
                                    </td>
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
                    ${this.renderPaginationDSTB()}
                </div>
            </vaadin-form-layout>
        `;
    }
}
