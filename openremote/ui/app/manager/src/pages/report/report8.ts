import { LitElement, html, css } from "lit";
import { customElement, property,state} from "lit/decorators.js";
import * as XLSX from  "xlsx"
import {saveAs} from  "file-saver"
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from 'chart.js';
Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,PieController,
    ArcElement,);
export enum InputType {
    BUTTON = "button",
    DATETIME = "datetime-local",
    JSON = "json",
    TEXT = "text",
}
pdfMake.vfs = pdfFonts.vfs;
@customElement("electricityconsumptionchartduring-year")
export class MyElement extends LitElement {
    @property({ type: String }) name = "LitElement";
    @state() dataTable = [];
    @state() selectedYear  = null;
    @state() selectedMonth = "";
    @state() showPopup   = false;
    @state() listYear = [];
    @state() currentPage = 1;
    @state() pageSize = 5;
    @state() totalPages = 1;
    private chart: Chart | null = null
    static styles = css`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/antd/4.23.1/antd.min.css');
    :host {
       
    }
        canvas {
          height: 500px !important;
            pointer-events: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: rgb(120, 190, 90);
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .beauty-button {
            background-color: #4d9d2a; /* Pink color */
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.3s;
        }

        .beauty-button:hover {
            transform: scale(1.05);
        }

        .beauty-button:active {
            transform: scale(0.95);
        }
        .pagination {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 5px;
        }
        .input-year {
            padding: 10px;
            width: 150px;
            font-size: 16px;
            background:#F5F5F5 ;
            border-radius: 5px;
            border: none;
            border-bottom: 1px solid #4c4c4c;
            cursor: pointer;
        }
        .popup {
            display: block; /* Đảm bảo rằng popup luôn hiển thị khi showPopup là true */
            position: absolute;
            background: white;
            left: 350px;
            top: 117px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 10px;
            z-index: 1000;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        .year-item {
            padding: 10px;
            text-align: center;
            border: 1px solid #007BFF;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .year-item:hover {
            background: #007BFF;
            color: white;
        }
    `;
    firstUpdated() {
        console.log('chart',this.chart)
        const currentYear = new Date().getFullYear();
        const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
            const year = (1900 + i).toString();
            return [year, year];
        });
        this.listYear = yearOptions
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        this.chart = new Chart(ctx, {
            type: 'bar', // Loại biểu đồ
            data: {
                labels: ['Thg1','Thg2','Thg3','Thg4','Thg5','Thg6','Thg7','Thg8','Thg9','Thg10','Thg11','Thg12'],
                datasets: [{
                    label: 'MT01',
                    data: [12,2],
                    barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                    categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                },
                    {
                        label: 'MT02',
                        data: [10],
                        barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                        categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'MT03',
                        data: [8],
                        barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                        categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }

                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    },

                },
                interaction: {
                    mode: 'nearest',  // Hover tốt hơn
                    axis: 'x',        // Hover theo trục X
                    intersect: false  // Hover trên toàn bộ cột
                },
            }
        });
    }
    exportToExcel() {
        const reportTitle = "Báo Cáo Danh Sách Sản Phẩm";
        const headers = ["Mã Loại SP", "Tên Loại SP", "Ngày Tạo", "Trạng Thái", "Người Tạo", "ID"];

        // Dữ liệu Excel, thêm tiêu đề vào dòng đầu tiên
        const dataWithHeaders = [
            [reportTitle], // 📝 Dòng tiêu đề
            [], // 🏷️ Dòng trống để tạo khoảng cách
            headers,
            ...this.dataTable.map(item => [
                item.maloaisp,
                item.tenloaisp,
                item.ngaytao,
                item.trangthai,
                item.nguoitao,
                item.id
            ])
        ];

        // Tạo worksheet và workbook
        const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Sản Phẩm");

        // Hợp nhất ô tiêu đề báo cáo (trải dài hết bảng)
        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } } // Gộp từ cột 0 đến cuối cùng
        ];

        // **Thêm style cho tiêu đề**
        const titleCell = worksheet["A1"];
        if (titleCell) {
            titleCell.s = {
                font: { bold: true, sz: 16, color: { rgb: "FF0000" } }, // 🔴 Chữ to, đỏ, đậm
                alignment: { horizontal: "center", vertical: "center" }, // ⬆️⬅️ Căn giữa theo chiều ngang & dọc
            };
        }

        // **Tự động điều chỉnh độ rộng cột**
        worksheet["!cols"] = headers.map((header, colIndex) => {
            const maxLength = Math.max(
                header.length,
                ...this.dataTable.map(row => row[Object.keys(row)[colIndex]]?.toString().length || 0)
            );
            return { wch: maxLength + 2 }; // +2 để có khoảng trống
        });

        // **Xuất file**
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(dataBlob, "DanhSachSanPham.xlsx");
    }
    exportToPDF() {
        const dataFromAPI = [
            ["John", 25, "Hà Nội","",""],
            ["Jane", 30, "HCM","",""]
        ];

        // Thêm tiêu đề vào đầu mảng
        const dataWithHeaders = [
            ["Name", "Age", "Address","Male","Female"], // Tiêu đề cột
            ...(dataFromAPI.length > 0 ? dataFromAPI : [["Không có dữ liệu", "", "","",""]]) // Nếu rỗng, hiển thị dòng thông báo
        ];

        const docDefinition = {
            content: [
                { text: 'Danh sách nhân viên', style: 'header' },
                {
                    table: {
                        headerRows: 1, // Đánh dấu dòng đầu tiên là header
                        widths: ['auto', 'auto', 'auto',"auto","auto"], // Kích thước cột
                        body: dataWithHeaders // Dữ liệu bảng
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 0, 0, 10]
                }
            }
        };

        pdfMake.createPdf(docDefinition).download('example.pdf');
    }

    changePage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        fetch(`https://reqres.in/api/users?page=${this.currentPage}`)
            .then(response => response.json()) // Chuyển đổi dữ liệu thành JSON
            .then(data => {
                this.dataTable = data.data;
                this.totalPages = data?.total_pages;
            }) // Xử lý dữ liệu
            .catch(error => console.error("Lỗi:", error)); // Bắt lỗi
    }
    handleDateChange(event) {
        console.log("Ngày đã chọn:", event.target.value);
    }
    static properties = {
        selectedMonth: { type: String },
        isOpen: { type: Boolean }
    };

    constructor() {
        super();
    }
    selectMonth(month) {
        this.selectedMonth = month;
        this.dispatchEvent(new CustomEvent("month-selected", { detail: month }));
    }
    handleYearChange(event) {
        this.selectedYear = Number(event.target.value);
    }
    togglePopup() {
        this.showPopup = !this.showPopup;
    }

    selectYear(year) {
        this.selectedYear = year;
        this.showPopup = false;
        this.dispatchEvent(new CustomEvent('year-selected', { detail: year }));
    }

    closePopup(event) {
        if (this.showPopup && !this.shadowRoot.contains(event.target)) {
            this.showPopup = false;
        }
    }
    render() {
        const months = [
            [1, "Tháng 1"],
            [2, "Tháng 2"],
            [3, "Tháng 3"],
            [4, "Tháng 4"],
            [5, "Tháng 5"],
            [6, "Tháng 6"],
            [7, "Tháng 7"],
            [8, "Tháng 8"],
            [9, "Tháng 9"],
            [10, "Tháng 10"],
            [11, "Tháng 11"],
            [12, "Tháng 12"]
        ];
        return html`
            <div style="background: white;padding : 10px 0px">
                <div>
                    <h1 style="text-align: center;margin-bottom: 10px;margin-top: 0px">Tìm kiếm biểu đồ tiêu thụ điện năng trong năm</h1>
                </div>
                <div style="display: flex;justify-content: space-around">
                    <input
                            class="input-year"
                            .value=${this.selectedYear ? this.selectedYear : 'Năm'}
                            @click=${this.togglePopup}
                            readonly
                    >

                    ${this.showPopup
                            ? html`<div class="popup">
                    <div class="grid">
                        ${Array.from({length: 26}, (_, i) => 2000 + i).map(year =>
                                    html`<div class="year-item" @click=${() => this.selectYear(year)}>${year}</div>`
                            )}
                    </div>
                </div>`
                            : ''}
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Tháng"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.selectMonth(event)}"
                        </or-mwc-input>
                    </div>
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Lộ/Tuyến"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.handleYearChange(event)}"
                        </or-mwc-input>
                    </div>
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Số lượng đèn"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.handleYearChange(event)}"
                        </or-mwc-input>
                    </div>
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Tên"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.handleYearChange(event)}"
                        </or-mwc-input>
                    </div>
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Công suất"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.handleYearChange(event)}"
                        </or-mwc-input>
                    </div>
                    <div>
                        <or-mwc-input
                                style="width: 150px"
                                label="Năng lượng tiêu thụ"
                                type="select"
                                .options="${months}"
                                @or-mwc-input-changed="${(event) => this.handleYearChange(event)}"
                        </or-mwc-input>
                    </div>
                 
                     
                  
                </div>
                <div style="margin-right: 10px;margin-top: 20px;margin-bottom: 10px;display: flex;justify-content: center">
                    <button class="beauty-button" style="background: rgb(255, 179, 102)">Search</button>
                    <button class="beauty-button" style="background: rgb(255, 179, 102);margin-left: 10px" @click="${this.exportToPDF}">Xuất PDF</button>
                    <button style="margin-left: 10px;background: rgb(240, 200, 80)" class="beauty-button" @click="${this.exportToExcel}">Xuất file</button>
                </div>
            </div>
            <div>
                <canvas id="myChart"></canvas>
            </div>
            
        `;
    }
}
