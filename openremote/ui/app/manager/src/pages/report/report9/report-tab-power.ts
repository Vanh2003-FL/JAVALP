
import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import * as XLSX from "xlsx"
import {saveAs} from "file-saver"
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import "@vaadin/date-picker"
import "@vaadin/combo-box"
import "@vaadin/form-layout"
import "@vaadin/multi-select-combo-box"
import "@vaadin/grid"
import "@vaadin/grid/vaadin-grid-column-group.js"
import manager, {subscribe, Util, DefaultColor5} from "@openremote/core";
import { i18next } from "@openremote/or-translate";
import ExcelJS from 'exceljs';
pdfMake.vfs = pdfFonts.vfs;

@customElement('report-tab-power')

export class ReportTabPower extends LitElement {
    @state() dataRoad = []
    @state() dataCabinet = []
    @state() idRoad = ""
    @state() idCabinet = ""
    @state() loading = false;
    @state() dataFilterCabinet = []
    @state() dataTable = [];
    @state() selectedKBC: string = "D";

    @state() dataInput: {} = {}
    @state()
    currentDateChooseDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    private currentYear = new Date().getFullYear();
    private startYear = 2020;
    private currentMonth = new Date().getMonth() + 1;
    private currentQuarter = Math.ceil(this.currentMonth / 3)

    @state() transformedDataGrouped = [];  // <-- Thêm dòng này
    @state()
    months = [];

    @state()
    selectedYear = `${this.currentYear}`;
    @state()
    years = Array.from({length: this.currentYear - this.startYear + 1}, (_, i) => `${this.startYear + i}`);
    @state()
    quarters = [];
    @state()
    selectedMonth = this.months.length > 0 ? this.months[this.months.length - 1] : '';

    @state()
    selectedQuarter = this.quarters.length > 0 ? this.quarters[this.quarters.length - 1].value : '';

    private responsiveSteps: any[] = [
        {minWidth: 0, columns: 1},
        // Use two columns, if layout's width exceeds 500px
        {minWidth: '500px', columns: 3},
    ];
    @state() roads: object[] = [
        {label: "Ngày", value: "D"},
        {label: "Tháng", value: "M"},
        {label: "Năm", value: "Y"},
        {label: "Quý", value: "Q"},
        {label: "Tùy chỉnh", value: "C"},
    ];
    @state()
    currentDateFromChooseC = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    @state()
    currentDateToChooseC = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    @state() fromDateNgay: Boolean = false
    @state() fromDateThang: Boolean = false
    @state() fromDateNam: Boolean = false
    @state() fromDateQuy: Boolean = false
    @state() fromDateC: Boolean = false
    @state() toDate: String = ""
    @state() objectDate:{
        fromDate: string;
        toDate:string;
    }={
        fromDate:"",
        toDate:""
    }
    @state() dates: string[] = [];
    @state() transformedData = [];
    formatNumberVN(num) {
        if (num === '-' || num === undefined || num === null) return '-';
        return Number(num).toLocaleString('vi-VN');
    }

    static styles = css`
        :host {

        }
        .table-container {
            overflow-x: auto;
            max-width: 100%;
            margin: 0 auto;
        }

        canvas {
            height: 500px !important;
            pointer-events: auto;
        }
        
        .scroll-container {
            width: 100%;
            overflow-x: auto;
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
            background-color: #8ed973;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        vaadin-button {
            cursor: pointer;
        }

        vaadin-button:active {

            transform: scale(0.95);
        }

        .pagination {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 5px;
        }
    `;
    private receivedMessage: any;
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("send-data", (event) => {
            this.receivedMessage = event;
            this.requestUpdate(); // Cập nhật giao diện
        });
        window.addEventListener('session-changed', this._onSessionChanged);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }


    _onSessionChanged = (e: CustomEvent) => {
        const { key, value } = e.detail;
        if (key === 'realm') {
            this.realmSelected = value
            this.idRoad = undefined
            this.idCabinet = undefined
            manager.rest.api.RouteInfoResource.getAll({data:{realm: value}})
                .then((response) => {
                    const routeInfoList = response.data.map(item => item.routeInfo);
                    console.log('routeInfoList',routeInfoList)
                    this.dataRoad = routeInfoList
                    console.log('getAlldataRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:value,type:"ElectricalCabinetAsset"}}})
                .then((response) => {
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                    console.log('getAllCabinets', cabinetAssets)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.handleSearch()
        }
    }
    firstUpdated() {
        this.realmSelected = window.sessionStorage.getItem('realm')
        manager.rest.api.AssetResource.getAllRoadAssets(window.sessionStorage.getItem('realm'))
            .then((response) => {
                const roadSetup = response?.data?.map((item: any) => {
                    return ({
                        label: item.name,
                        value: item.id
                    })
                })
                console.log('roadSetup', roadSetup)
                this.dataRoad = roadSetup
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                manager.rest.api.AssetResource.getAllCabinetAssets(response.data.realm)
                    .then((response) => {
                        const roadSetup = response?.data?.map((item: any) => {
                            return ({
                                id: item.id,         // <-- Đúng field combo-box cần
                                name: item.name,     // <-- Đúng field combo-box cần
                                parentId: item.parentId
                            })
                        })
                        this.dataFilterCabinet = roadSetup
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });



        this.updateMonths();
        this.updateQuarters()
    }

async exportToExcel() {
    if (!this.transformedDataGrouped || this.transformedDataGrouped.length === 0) {
        const notification = this.shadowRoot!.getElementById('myNotification') as any;
        notification.renderer = (root: HTMLElement) => {
            root.innerHTML = '';
            const text = document.createElement('div');
            text.textContent = 'Không có dữ liệu để xuất Excel!';
            root.appendChild(text);
        };
        notification.open();
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo Cáo');

    // ===== 1. Title =====
    const totalColumnIndex = 4 + this.dates.length + 1; // 4 cột cố định + số giờ + 1 cột Tổng
    worksheet.mergeCells(1, 1, 1, totalColumnIndex); // Merge hết từ A1 đến cột cuối
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Báo cáo công suất tiêu thụ từ ${this.objectDate.fromDate} đến ${this.objectDate.toDate}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);

    // ===== 2. Header Rows =====
    const titleRow = [
        "STT", "Mã đèn", "Tên đèn", "Lộ/Tuyến",
        "Công suất tiêu thụ", // gộp nhiều giờ thành 1
        ...Array(this.dates.length - 1).fill(""), // Các ô giờ sẽ nằm dòng dưới
        "Tổng"
    ];
    worksheet.addRow(titleRow);

    const hourRow = [
        "", "", "", "",
        ...this.dates,
        ""
    ];
    worksheet.addRow(hourRow);

    // ===== 3. Merge Header =====
    worksheet.mergeCells(3, 1, 4, 1); // STT
    worksheet.mergeCells(3, 2, 4, 2); // Mã đèn
    worksheet.mergeCells(3, 3, 4, 3); // Tên đèn
    worksheet.mergeCells(3, 4, 4, 4); // Lộ/Tuyến
    worksheet.mergeCells(3, 5, 3, 4 + this.dates.length); // Công suất tiêu thụ (gộp các cột giờ)
    worksheet.mergeCells(3, 4 + this.dates.length + 1, 4, 4 + this.dates.length + 1); // Tổng

    // ===== 4. Style Header =====
    [3, 4].forEach(rowIndex => {
        worksheet.getRow(rowIndex).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFCC' }
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // ===== 5. Data Rows =====
    let stt = 1;
    this.transformedDataGrouped.forEach(group => {
        const groupRow = worksheet.addRow([group.cabinetName]);
        worksheet.mergeCells(`A${groupRow.number}:D${groupRow.number}`);
        groupRow.font = { bold: true, color: { argb: '006400' } };
        groupRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E6FFE6' }
        };

        group.lights.forEach(light => {
            const dataRow = worksheet.addRow([
                stt++,
                light.code,
                light.name,
                light.road,
                ...this.dates.map(date => light.days[date] ?? "-"),
                light.total
            ]);
            dataRow.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Nếu là cột dữ liệu công suất (cột thứ 5 trở đi) thì định dạng số
                if (colNumber >= 5) {
                    if (!isNaN(Number(cell.value)) && cell.value !== "-") {
                        cell.value = Number(cell.value); // Đảm bảo là số
                        cell.numFmt = '#,##0'; // Format dạng 1,000
                    }
                }
            });

        });
    });

    // ===== 6. Auto width columns =====
    worksheet.columns.forEach((column, index) => {
        if (index === 0) { // STT
            column.width = 6;
        } else if (index === 1) { // Mã đèn
            column.width = 14;
        } else if (index === 2) { // Tên đèn
            column.width = 20;
        } else if (index === 3) { // Lộ/Tuyến
            column.width = 16;
        } else {
            column.width = 12; // Các giờ và Tổng
        }
    });

    // ===== 7. Save file =====
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(dataBlob, "BaoCaoCongSuatTieuThu.xlsx");
}







exportToPDF() {
        if (this.transformedDataGrouped.length === 0) {
            const notification = this.shadowRoot!.getElementById('myNotification2') as any;
            notification.renderer = (root: HTMLElement) => {
                root.innerHTML = '';
                const text = document.createElement('div');
                text.textContent = 'Không có dữ liệu để xuất PDF!';
                root.appendChild(text);
            };
            notification.open();
            return;
        }

        const headers = [
            { text: "STT", style: "tableHeader" },
            { text: "Mã đèn", style: "tableHeader" },
            { text: "Tên đèn", style: "tableHeader" },
            { text: "Lộ/Tuyến", style: "tableHeader" },
            ...this.dates.map(date => ({ text: date, style: "tableHeader" })),
            { text: "Tổng", style: "tableHeader" }
        ];

        const body = [headers];
        let rowIndex = 1;

        this.transformedDataGrouped.forEach(group => {
            // Dòng header cho tủ điện
            body.push([
                { text: group.cabinetName, colSpan: this.dates.length + 5, style: "cabinetStyle", alignment: "left" },
                ...new Array(this.dates.length + 4).fill("")
            ]);

            // Các đèn bên trong tủ
            group.lights.forEach(light => {
                body.push([
                    { text: rowIndex.toString(), style: "cell", alignment: "center" },
                    { text: light.code || "", style: "cell" },
                    { text: light.name || "", style: "cell" },
                    { text: light.road || "", style: "cell" },
                    ...this.dates.map(date => ({
                        text: light.days[date] || "-",
                        style: "cell",
                        alignment: "center"
                    })),
                    { text: light.total, style: "cell", alignment: "center" }
                ]);
                rowIndex++;
            });

        });

        const docDefinition = {
            content: [
                { text: "BÁO CÁO CÔNG SUẤT TIÊU THỤ THEO KỲ", style: "title" },
                { text: `Từ ngày ${this.objectDate.fromDate} đến ngày ${this.objectDate.toDate}`, style: "title" },
                {
                    table: {
                        headerRows: 1,
                        widths: new Array(this.dates.length + 5).fill("auto"),
                        body
                    }
                }
            ],
            styles: {
                title: {
                    fontSize: 14,
                    bold: true,
                    alignment: "center",
                    margin: [0, 0, 0, 10]
                },
                tableHeader: {
                    bold: true,
                    fillColor: "#A5D6A7",
                    alignment: "center"
                },
                cabinetStyle: {
                    bold: true,
                    fillColor: "#E3F2FD"
                },
                cell: {
                    fontSize: 9
                }
            },
            defaultStyle: {
                fontSize: 12
            },
            pageOrientation: "landscape",
            pageSize: "A2"
        };

        pdfMake.createPdf(docDefinition).download("BaoCaoCongSuatTieuThu.pdf");
    }



    handleChangeKBC(event) {
        console.log('value', event.target.value)
        this.selectedKBC = event.target.value
        if (event.target.value === "D") {
            this.selectedYear = `${new Date().getFullYear()}`
            this.fromDateNgay = true
            this.fromDateThang = false
            this.fromDateNam = false
            this.fromDateQuy = false
            this.fromDateC = false
        } else if (event.target.value === "M") {
            this.selectedYear = `${new Date().getFullYear()}`
            this.fromDateThang = true
            this.fromDateNgay = false
            this.fromDateNam = false
            this.fromDateQuy = false
            this.fromDateC = false
        } else if (event.target.value === "Y") {
            this.selectedYear = `${new Date().getFullYear()}`
            this.fromDateNam = true
            this.fromDateThang = false
            this.fromDateNgay = false
            this.fromDateQuy = false
            this.fromDateC = false
        } else if (event.target.value === "Q") {
            this.selectedYear = `${new Date().getFullYear()}`
            this.fromDateQuy = true
            this.fromDateNam = false
            this.fromDateThang = false
            this.fromDateNgay = false
            this.fromDateC = false
        } else if (event.target.value === "C") {
            this.selectedYear = `${new Date().getFullYear()}`
            this.fromDateQuy = false
            this.fromDateNam = false
            this.fromDateThang = false
            this.fromDateNgay = false
            this.fromDateC = true
        }

    }
    private getMaxToDate(fromDate: string): string {
        if (!fromDate) return '';

        const date = new Date(fromDate);
        date.setMonth(date.getMonth() + 1); // Thêm 1 tháng vào fromDate

        return date.toISOString().split('T')[0];
    }
    _onDateFromChangeChooseNgay(e) {
        this.currentDateFromChooseC = e.target.value;

        // Nếu fromDate mới lớn hơn toDate hiện tại, hoặc toDate vượt quá 1 tháng
        if (this.currentDateFromChooseC && this.currentDateToChooseC) {
            const fromDate = new Date(this.currentDateFromChooseC);
            const toDate = new Date(this.currentDateToChooseC);
            const maxToDate = new Date(fromDate);
            maxToDate.setMonth(maxToDate.getMonth() + 1);

            if (toDate > maxToDate) {
                // Reset toDate về đúng giới hạn
                this.currentDateToChooseC = maxToDate.toISOString().split('T')[0];
            }
        }
    }

    _onDateToChange(e) {
        this.currentDateToChooseC = e.target.value
        console.log('e', e.target.value)
    }

    updateMonths() {
        if (!this.selectedYear) {
            this.months = [];
            this.selectedMonth = 0;
            return;
        }
        const selectedYearInt = parseInt(this.selectedYear, 10);
        const maxMonth = selectedYearInt === this.currentYear ? new Date().getMonth() + 1 : 12;
        this.months = Array.from({length: maxMonth}, (_, i) => ({
            label: `Tháng ${i + 1}`,
            value: i + 1 // Kiểu số nguyên (int)
        }));
        this.selectedMonth = this.months.length > 0 ? this.months[this.months.length - 1].value : '';
    }

    updateQuarters() {
        if (!this.selectedYear) {
            this.quarters = [];
            this.selectedQuarter = '';
            return;
        }

        const selectedYearInt = parseInt(this.selectedYear, 10);
        // Cập nhật danh sách quý
        const maxQuarter = selectedYearInt === this.currentYear ? this.currentQuarter : 4;
        this.quarters = Array.from({length: maxQuarter}, (_, i) => ({
            label: `Quý ${i + 1} (Tháng ${i * 3 + 1}-${(i + 1) * 3})`,
            value: i + 1 // Giá trị là số nguyên (int)
        }));
        this.selectedQuarter = this.quarters.length > 0 ? this.quarters[this.quarters.length - 1].value : '';
    }


    updateDatesForSelectedKBC(fromDate: string, toDate: string) {
        const dates: string[] = [];

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (this.selectedKBC === "D") {
            for (let h = 0; h < 24; h++) {
                dates.push(`${String(h).padStart(2, '0')}:00`);
            }
        } else if (this.selectedKBC === "M" || this.selectedKBC === "C") {
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const day = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                dates.push(day);
            }
        } else if (this.selectedKBC === "Y") {
            for (let m = 1; m <= 12; m++) {
                dates.push(`Thg${m}`);
            }
        } else if (this.selectedKBC === "Q") {
            const startMonth = start.getMonth() + 1;
            const endMonth = end.getMonth() + 1;
            for (let m = startMonth; m <= endMonth; m++) {
                dates.push(`Thg${m}`);
            }
        }

        this.dates = dates;
    }

    handleYearChange(e) {
        this.selectedYear = e.target.value;
        this.updateMonths();
        this.updateQuarters();
        this.requestUpdate(); // Cập nhật giao diện ngay lập tức
    }

    handleMonthChange(e) {
        console.log('month chang2e', typeof e.target.value)
        this.selectedMonth = e.target.value
    }

    handleQuaterChange(e) {
        console.log('quater chang2e', e.target.value)
        this.selectedQuarter = e.target.value
    }

    @state() realmSelected
    handleSearch() {
        // Set loading state to true when starting search
        this.loading = true;
        
        function convertDateToVietnamese(dateString) {
            const date = new Date(dateString);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        if (this.selectedKBC === "D") {
            this.objectDate = {
                fromDate: convertDateToVietnamese(this.currentDateFromChooseC),
                toDate: convertDateToVietnamese(this.currentDateFromChooseC)
            };
            this.updateDatesForSelectedKBC(this.currentDateFromChooseC, this.currentDateFromChooseC);

            manager.rest.api.AssetDatapointResource.getReportPowerVoltage({
                fromDate: this.currentDateFromChooseC,
                toDate: this.currentDateFromChooseC,
                roadId: this.idRoad,
                cabinetId: this.idCabinet,
                realm: this.realmSelected
            })
                .then((response) => {
                    this.dataTable = response.data;
                    this.transformedDataGrouped = this.generateGroupedRealData();
                    this.loading = false;
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                    this.loading = false;
                });

        } else if (this.selectedKBC === "M") {
            const month = this.selectedMonth < 10 ? `0${this.selectedMonth}` : `${this.selectedMonth}`;
            const fromDateLocal = `${this.selectedYear}-${month}-01`;
            const lastDate = new Date(Number(this.selectedYear), Number(month), 0).getDate();
            const lastDateLocal = `${this.selectedYear}-${month}-${lastDate}`;

            this.objectDate = {
                fromDate: convertDateToVietnamese(fromDateLocal),
                toDate: convertDateToVietnamese(lastDateLocal)
            };
            this.updateDatesForSelectedKBC(fromDateLocal, lastDateLocal);

            manager.rest.api.AssetDatapointResource.getReportPowerVoltage({
                fromDate: fromDateLocal,
                toDate: lastDateLocal,
                roadId: this.idRoad,
                cabinetId: this.idCabinet,
                realm: this.realmSelected
            })
                .then((response) => {
                    this.dataTable = response.data;
                    this.transformedDataGrouped = this.generateGroupedRealData();
                    this.loading = false;
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                    this.loading = false;
                });

        } else if (this.selectedKBC === "Y") {
            const fromDateLocal = `${this.selectedYear}-01-01`;
            const lastDateLocal = `${this.selectedYear}-12-31`;

            this.objectDate = {
                fromDate: convertDateToVietnamese(fromDateLocal),
                toDate: convertDateToVietnamese(lastDateLocal)
            };
            this.updateDatesForSelectedKBC(fromDateLocal, lastDateLocal);

            manager.rest.api.AssetDatapointResource.getTotalReportPowerVoltage({
                fromDate: fromDateLocal,
                toDate: lastDateLocal,
                roadId: this.idRoad,
                cabinetId: this.idCabinet,
                realm: this.realmSelected
            }).then((response) => {
                this.dataTable = response.data;
                this.transformedDataGrouped = this.generateGroupedRealData();
                console.log(this.dataTable)
                this.loading = false;
            }).catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
                this.loading = false;
            });

            // manager.rest.api.AssetDatapointResource.getReportPowerVoltage({
            //     fromDate: fromDateLocal,
            //     toDate: lastDateLocal,
            //     roadId: this.idRoad,
            //     cabinetId: this.idCabinet,
            //     realm: this.realmSelected
            // })
            //     .then((response) => {
            //         this.dataTable = response.data;
            //         this.transformedDataGrouped = this.generateGroupedRealData();
            //     })
            //     .catch((error) => console.error('Lỗi khi lấy dữ liệu:', error));

        } else if (this.selectedKBC === "Q") {
            const quarter = this.selectedQuarter;
            const firstMonth = (quarter - 1) * 3 + 1;
            const lastMonth = quarter * 3;

            const startMonth = firstMonth < 10 ? `0${firstMonth}` : `${firstMonth}`;
            const endMonth = lastMonth < 10 ? `0${lastMonth}` : `${lastMonth}`;
            const fromDateLocal = `${this.selectedYear}-${startMonth}-01`;
            const lastDay = new Date(Number(this.selectedYear), Number(lastMonth), 0).getDate();
            const toDateLocal = `${this.selectedYear}-${endMonth}-${lastDay}`;

            this.objectDate = {
                fromDate: convertDateToVietnamese(fromDateLocal),
                toDate: convertDateToVietnamese(toDateLocal)
            };
            this.updateDatesForSelectedKBC(fromDateLocal, toDateLocal);

            manager.rest.api.AssetDatapointResource.getTotalReportPowerVoltage({
                fromDate: fromDateLocal,
                toDate: toDateLocal,
                roadId: this.idRoad,
                cabinetId: this.idCabinet,
                realm: this.realmSelected
            })
                .then((response) => {
                    this.dataTable = response.data;
                    this.transformedDataGrouped = this.generateGroupedRealData();
                    this.loading = false;
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                    this.loading = false;
                });

            // manager.rest.api.AssetDatapointResource.getReportPowerVoltage({
            //     fromDate: fromDateLocal,
            //     toDate: toDateLocal,
            //     roadId: this.idRoad,
            //     cabinetId: this.idCabinet,
            //     realm: this.realmSelected
            // })
            //     .then((response) => {
            //         this.dataTable = response.data;
            //         this.transformedDataGrouped = this.generateGroupedRealData();
            //     })
            //     .catch((error) => console.error('Lỗi khi lấy dữ liệu:', error));

        } else if (this.selectedKBC === "C") {
            this.objectDate = {
                fromDate: convertDateToVietnamese(this.currentDateFromChooseC),
                toDate: convertDateToVietnamese(this.currentDateToChooseC)
            };
            this.updateDatesForSelectedKBC(this.currentDateFromChooseC, this.currentDateToChooseC);

            manager.rest.api.AssetDatapointResource.getReportPowerVoltage({
                fromDate: this.currentDateFromChooseC,
                toDate: this.currentDateToChooseC,
                roadId: this.idRoad,
                cabinetId: this.idCabinet,
                realm: this.realmSelected
            })
                .then((response) => {
                    this.dataTable = response.data;
                    this.transformedDataGrouped = this.generateGroupedRealData();
                })
                .catch((error) => console.error('Lỗi khi lấy dữ liệu:', error));
        }
    }


    generateGroupedRealData() {
        if (!this.dataTable || this.dataTable.length === 0) {
            return [];
        }

        const groupedData = this.dataTable.map((cabinet) => {
            const lightMap = new Map();

            (cabinet.powerVoltageReport ?? []).forEach((light) => {
                let dayString = "";
                if (light.time) {
                    if (this.selectedKBC === "D") {
                        const hourPart = light.time.split(" ")[1];
                        dayString = `${hourPart.padStart(2, '0')}:00`;
                    } else if (["M", "C"].includes(this.selectedKBC)) {
                        const [year, month, day] = light.time.split(" ")[0].split("-");
                        dayString = `${day.padStart(2, '0')}-${month.padStart(2, '0')}`;
                    } else {
                        const [year, month] = light.time.split(" ")[0].split("-");
                        dayString = `Thg${parseInt(month, 10)}`;
                    }
                }

                const key = light.id;
                if (!lightMap.has(key)) {
                    // Khởi tạo bản ghi nếu chưa có
                    const initDays = {};
                    this.dates.forEach(date => initDays[date] = "-");
                    lightMap.set(key, {
                        code: light.lightCode,
                        name: light.lightName,
                        road: light.roadName || "",
                        days: initDays,
                        total: 0
                    });
                    console.log(lightMap.values())
                }

                const existing = lightMap.get(key);
                if (this.dates.includes(dayString)) {
                    existing.days[dayString] = `${light.wattageActual ?? 0}`;
                }

                existing.total += light.wattageActual ?? 0;
                console.log("stf: "+existing.total);
            });

            return {
                cabinetName: cabinet.cabinetName,
                lights: Array.from(lightMap.values())
            };
        });

        return groupedData;
    }




    protected handleSelectRoad(event) {
        this.idRoad = event.target.value;
        console.log('change', event.target.value)
        if(this.idCabinet !== ""){
            this.idCabinet = ""
        }
        if (event.target.value) {
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"},routeInfo:{id:event.target.value}}})
                .then((response) => {
                    console.log('responseHandle',response)
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }else{
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"}}})
                .then((response) => {
                    console.log('responseHandle',response)
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }

        if (!event.detail.value) {
            this.idRoad = ""
        }
    }

    handleCabinet(e) {
        if (!e.detail.value) {
            this.idCabinet = ""
        }
        console.log('aaa',e.target.value)
        this.idCabinet = e.target.value
    }

    render() {
        return html`
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end" theme="success"></vaadin-notification>
            <vaadin-notification id="myNotification2" duration="3000" position="bottom-end" theme="error"></vaadin-notification>

            <div style="padding:10px 0px; border-bottom:1px solid #e3e6ea; margin:20px; background:white; border-radius:10px" id="searchSection">
                <div>
                    <h2 style="margin-bottom:10px; margin-top:0px; margin-left:20px " id="searchHeader">
                        <or-translate value="search_information"></or-translate>
                    </h2>

                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="padding:0 20px">
                        <vaadin-combo-box
                                id="roadComboBox"
                                clear-button-visible
                                label=${i18next.t('road')}
                                item-label-path="label"
                                item-value-path="value"
                                .items="${this.dataRoad}"
                                .value="${this.idRoad}"
                                @selected-item-changed="${this.handleSelectRoad}"
                                style="width:150px;"
                        ></vaadin-combo-box>

                        <vaadin-combo-box
                                id="cabinetComboBox"
                                clear-button-visible
                                label=${i18next.t('cabinet_name')}
                                item-label-path="name"
                                item-value-path="id"
                                .items="${this.dataFilterCabinet}"
                                .value="${this.idCabinet}"
                                @selected-item-changed="${this.handleCabinet}"
                                style="width:150px;"
                        ></vaadin-combo-box>

                        <vaadin-combo-box
                                id="reportPeriodComboBox"
                                label=${i18next.t('report_period')}
                                item-label-path="label"
                                item-value-path="value"
                                style="width:150px;"
                                .items="${this.roads}"
                                .value="${this.selectedKBC}"
                                @selected-item-changed="${this.handleChangeKBC}"
                        ></vaadin-combo-box>

                        ${this.fromDateNgay ? html`
                            <vaadin-date-picker
                                    id="dayDatePicker"
                                    label=${i18next.t('day')}
                                    .value=${this.currentDateFromChooseC}
                                    @value-changed="${this._onDateFromChangeChooseNgay}"
                                    max="${new Date().toISOString().split("T")[0]}">
                            </vaadin-date-picker>
                        ` : ``}

                        ${this.fromDateThang ? html`
                            <vaadin-combo-box
                                    id="yearComboBox"
                                    label=${i18next.t('choose_year')}
                                    .items=${this.years}
                                    .value=${this.selectedYear}
                                    @change=${this.handleYearChange}>
                            </vaadin-combo-box>
                            <vaadin-combo-box
                                    id="monthComboBox"
                                    label=${i18next.t('choose_month')}
                                    item-label-path="label"
                                    item-value-path="value"
                                    .items=${this.months}
                                    .value=${this.selectedMonth}
                                    @change=${this.handleMonthChange}>
                            </vaadin-combo-box>
                        ` : ``}

                        ${this.fromDateNam ? html`
                            <vaadin-combo-box
                                    id="yearOnlyComboBox"
                                    label=${i18next.t('choose_year')}
                                    .items=${this.years}
                                    .value=${this.selectedYear}
                                    @change=${this.handleYearChange}>
                            </vaadin-combo-box>
                        ` : ``}

                        ${this.fromDateQuy ? html`
                            <vaadin-combo-box
                                    id="quarterYearComboBox"
                                    label=${i18next.t('choose_year')}
                                    .items=${this.years}
                                    .value=${this.selectedYear}
                                    @change=${this.handleYearChange}>
                            </vaadin-combo-box>
                            <vaadin-combo-box
                                    id="quarterComboBox"
                                    label=${i18next.t('choose_quarter')}
                                    item-label-path="label"
                                    item-value-path="value"
                                    .items=${this.quarters}
                                    .value=${this.selectedQuarter}
                                    @change=${this.handleQuaterChange}>
                            </vaadin-combo-box>
                        ` : ``}

                        ${this.fromDateC ? html`
                            <vaadin-date-picker
                                    label="${i18next.t("from_date")}"
                                    .value=${this.currentDateFromChooseC}
                                    @value-changed="${this._onDateFromChangeChooseNgay}"
                                    max="${new Date().toISOString().split("T")[0]}"
                            ></vaadin-date-picker>

                            <vaadin-date-picker
                                    label="${i18next.t("to_date")}"
                                    .value=${this.currentDateToChooseC}
                                    @value-changed="${this._onDateToChange}"
                                    .max="${this.getMaxToDate(this.currentDateFromChooseC)}" 
                            .min="${this.currentDateFromChooseC}" 
                            ></vaadin-date-picker>
                        ` : ''}
                    </vaadin-form-layout>
                </div>

                <div style="margin:20px;display:flex;justify-content:center;" id="actionButtons">
                    <vaadin-button @click="${this.handleSearch}" id="searchButton">
                        <or-icon icon="magnify" slot="prefix"></or-icon>
                        <or-translate value="search"></or-translate>
                    </vaadin-button>

                    <vaadin-button theme="secondary error" @click="${this.exportToPDF}" id="exportPdfButton" style="margin-left:10px;">
                        <or-icon icon="file-pdf-box" slot="prefix"></or-icon>
                        <or-translate value="export_pdf"></or-translate>
                    </vaadin-button>

                    <vaadin-button theme="secondary success" @click="${this.exportToExcel}" id="exportExcelButton" style="margin-left:10px;">
                        <or-icon icon="file-excel" slot="prefix"></or-icon>
                        <or-translate value="export_excel"></or-translate>
                    </vaadin-button>
                </div>
            </div>

            <div style="background:white; padding:15px 20px; margin:20px; border-radius:10px;">
                <h2 style="margin-top:0px;">
                    ${this.selectedKBC === "D"
                            ? html`<or-translate value="detailed_power_consumption_report"></or-translate> ${this.objectDate.fromDate}`
                            : html`<or-translate value="summary_power_consumption_report"></or-translate> ${
                                    this.selectedKBC === "M" ? `tháng ${this.selectedMonth}/${this.selectedYear}` :
                                            this.selectedKBC === "Y" ? `năm ${this.selectedYear}` :
                                                    this.selectedKBC === "Q" ? `quý ${this.selectedQuarter} năm ${this.selectedYear}` :
                                                            this.selectedKBC === "C" ? `từ ${this.objectDate.fromDate} đến ${this.objectDate.toDate}` :
                                                                    ''
                            }`
                    }
                </h2>

                <div class="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th rowspan="2"><or-translate value="no"></or-translate></th>
                            <th rowspan="2"><or-translate value="light_code"></or-translate></th>
                            <th rowspan="2"><or-translate value="light_name"></or-translate></th>
                            <th rowspan="2"><or-translate value="road"></or-translate></th>
                            <th colspan="${this.dates.length}" style="text-align:center;">
                                <or-translate value="power_consumption"></or-translate>
                            </th>
                            <th rowspan="2"><or-translate value="total"></or-translate></th>
                        </tr>
                        <tr>
                            ${this.dates.map(date => html`
                                <th style="text-align: center;">${date}</th>
                            `)}
                        </tr>
                        </thead>
                        <tbody>
                        ${this.loading
                                ? html`
                                    <tr>
                                        <td colspan="${5 + this.dates.length + 1}" style="text-align:center;">
                                            <vaadin-progress-bar indeterminate style="width:30%; min-width:200px;"></vaadin-progress-bar>
                                        </td>
                                    </tr>`
                                : this.transformedDataGrouped.length
                                        ? html`
                                            ${this.transformedDataGrouped.map(group => {
                                                console.log('Group:', group); // 👈 Ghi log tại đây
                                                return html`
        <tr style="background:#e8f5e9;">
            <td colspan="${4 + this.dates.length + 1}" style="font-weight:bold;">${group.cabinetName}</td>
        </tr>
        ${group.lights.map((light, index) => html`
            <tr>
                <td>${index + 1}</td>
                <td>${light.code}</td>
                <td>${light.name}</td>
                <td>${light.road}</td>
                ${this.dates.map(date => html`
                    <td>${this.formatNumberVN(light.days[date])}</td>
                `)}
                <td>${this.formatNumberVN(light.total)}</td>
            </tr>
        `)}
    `;
                                            })}

                                        `
                                        : html`
                                            <tr>
                                                <td colspan="${4 + this.dates.length + 1}" style="text-align:center;">
                                                    <or-translate value="no_data"></or-translate>
                                                </td>
                                            </tr>
                                        `
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}
