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
    import "@vaadin/notification"
    import "@vaadin/progress-bar"
    import { i18next } from "@openremote/or-translate";
    pdfMake.vfs = pdfFonts.vfs;
    
    @customElement("lighting-report")
    export class MyElement extends LitElement {
        @state() dataRoad = []
        @state() dataCabinet = []
        @state() idRoad = ""
        @state() idCabinet = ""
        @state() loading = false;
        @state() dataFilterCabinet = []
        @state() dataTable :any= [];
        @state() selectedKBC: String = "D"
        @state() dataInput: {} = {}
        @state() objectDate:{
            fromDate: string;
            toDate:string;
        }={
            fromDate:"",
            toDate:""
        }
        @state() realmSelected
        @state()
        currentDateChooseDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
        private currentYear = new Date().getFullYear();
        private startYear = 2020;
        private currentMonth = new Date().getMonth() + 1;
        private currentQuarter = Math.ceil(this.currentMonth / 3)
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
        @state() currentPage = 1;
        @state() pageSize = 5;
        @state() totalPages = 1;
    
        static styles = css`
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
        connectedCallback() {
            super.connectedCallback();
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
            manager.rest.api.RouteInfoResource.getAll({data:{realm: this.realmSelected}})
                .then((response) => {
                    const routeInfoList = response.data.map(item => item.routeInfo);
                    console.log('routeInfoList',routeInfoList)
                    this.dataRoad = routeInfoList
                    console.log('getAlldataRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"}}})
                .then((response) => {
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                    console.log('getAllCabinets', cabinetAssets)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.updateMonths();
            this.updateQuarters()
        }
    
        exportToExcel() {
            if (!this.dataTable || this.dataTable.length === 0) {
                const notification = this.shadowRoot!.getElementById('myNotification') as any;
                notification.renderer = (root: HTMLElement) => {
                    root.innerHTML = ''; // Xóa nội dung cũ
                    const text = document.createElement('div');
                    text.textContent = 'Không có dữ liệu để xuất Excel!';
                    root.appendChild(text);
                };
                notification.open();
            } else {
                const wsData = [];
                wsData.push(["Báo cáo công suất của tủ điện theo kỳ"]);
                wsData.push([`Từ ngày ${this.objectDate?.fromDate} đến ngày ${this.objectDate?.toDate} `]);
    
                // Header 1 (Pha 1, Pha 2, Pha 3 gộp cột)
                wsData.push([
                    "STT", "Tủ điện",
                    "Pha 1", "", "",
                    "Pha 2", "", "",
                    "Pha 3", "", "",
                    "Tổng công suất tiêu thụ(KWh)"
                ]);
    
                // Header 2 (Điện áp, Dòng điện, Công suất tiêu thụ)
                wsData.push([
                    "", "",
                    "Điện áp(V)", "Dòng điện(A)", "Công suất tiêu thụ(KWh)",
                    "Điện áp(V)", "Dòng điện(A)", "Công suất tiêu thụ(KWh)",
                    "Điện áp(V)", "Dòng điện(A)", "Công suất tiêu thụ(KWh)",
                    ""
                ]);
    
                // Biến tổng cộng cho từng pha
                let grandTotalPowerPhase1 = 0, grandTotalPowerPhase2 = 0, grandTotalPowerPhase3 = 0, grandTotalConsumption = 0;
    
                this.dataTable.forEach((road) => {
                    let totalPowerPhase1 = 0, totalPowerPhase2 = 0, totalPowerPhase3 = 0, totalPowerConsumption = 0;
    
                    road.cabinetReportDTOS?.forEach(cabinet => {
                        totalPowerPhase1 += cabinet.wattageActualPhase1 || 0;
                        totalPowerPhase2 += cabinet.wattageActualPhase2 || 0;
                        totalPowerPhase3 += cabinet.wattageActualPhase3 || 0;
                    });
    
                    totalPowerConsumption = totalPowerPhase1 + totalPowerPhase2 + totalPowerPhase3;
    
                    // Cộng vào tổng toàn bộ
                    grandTotalPowerPhase1 += totalPowerPhase1;
                    grandTotalPowerPhase2 += totalPowerPhase2;
                    grandTotalPowerPhase3 += totalPowerPhase3;
                    grandTotalConsumption += totalPowerConsumption;
    
                    // Thêm hàng Road
                    wsData.push([
                        "", road.nameR,
                        "", "", totalPowerPhase1?.toFixed(2),
                        "", "", totalPowerPhase2?.toFixed(2),
                        "", "", totalPowerPhase3?.toFixed(2),
                        totalPowerConsumption.toFixed(2)
                    ]);
    
                    // Dữ liệu từng cabinet
                    road.cabinetReportDTOS?.forEach((cabinet, cabIndex) => {
                        wsData.push([
                            cabIndex + 1, cabinet.nameC,
                            cabinet.voltagePhase1?.toFixed(2), cabinet.amperagePhase1?.toFixed(2), cabinet.wattageActualPhase1?.toFixed(2),
                            cabinet.voltagePhase2?.toFixed(2), cabinet.amperagePhase2?.toFixed(2), cabinet.wattageActualPhase2?.toFixed(2),
                            cabinet.voltagePhase3?.toFixed(2), cabinet.amperagePhase3?.toFixed(2), cabinet.wattageActualPhase3?.toFixed(2),
                            ((cabinet.wattageActualPhase1 || 0) + (cabinet.wattageActualPhase2 || 0) + (cabinet.wattageActualPhase3 || 0))?.toFixed(2)
                        ]);
                    });
                });
    
                // Thêm hàng tổng cuối bảng
                wsData.push([
                    "", "Tổng cộng",
                    "", "", grandTotalPowerPhase1?.toFixed(2),
                    "", "", grandTotalPowerPhase2?.toFixed(2),
                    "", "", grandTotalPowerPhase3?.toFixed(2),
                    grandTotalConsumption?.toFixed(2)
                ]);
    
                // Tạo Workbook và Sheet
                const ws = XLSX.utils.aoa_to_sheet(wsData);
    
                // Hợp nhất ô cho Pha 1, Pha 2, Pha 3
                ws["!merges"] = [
                    { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // Merge "Pha 1"
                    { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // Merge "Pha 2"
                    { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } } // Merge "Pha 3"
                ];
                ws["!cols"] = [
                    { wch: 5 },   // STT
                    { wch: 25 },  // Tủ điện (Tên dài hơn)
                    { wch: 12 }, { wch: 12 }, { wch: 18 }, // Pha 1
                    { wch: 12 }, { wch: 12 }, { wch: 18 }, // Pha 2
                    { wch: 12 }, { wch: 12 }, { wch: 18 }, // Pha 3
                    { wch: 25 }   // Tổng công suất
                ];
    
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
    
                // Xuất file Excel
                const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const data = new Blob([excelBuffer], { type: "application/octet-stream" });
                saveAs(data, "BaoCaoCongSuat.xlsx");
            }
    
        }
    
        exportToPDF() {
            if (this.dataTable.length !== 0) {
                const headers = [
                    { text: "STT", style: "tableHeader" },
                    { text: "Tủ điện", style: "tableHeader" },
                    { text: "Pha 1", colSpan: 3, style: "tableHeader" }, "", "",
                    { text: "Pha 2", colSpan: 3, style: "tableHeader" }, "", "",
                    { text: "Pha 3", colSpan: 3, style: "tableHeader" }, "", "",
                    { text: "Tổng công suất tiêu thụ (KWh)", style: "tableHeader" }
                ];
    
                const subHeaders = [
                    "", "",
                    { text: "Điện áp (V)", style: "tableHeader" },
                    { text: "Dòng điện (A)", style: "tableHeader" },
                    { text: "Công suất tiêu thụ (KWh)", style: "tableHeader" },
                    { text: "Điện áp (V)", style: "tableHeader" },
                    { text: "Dòng điện (A)", style: "tableHeader" },
                    { text: "Công suất tiêu thụ (KWh)", style: "tableHeader" },
                    { text: "Điện áp (V)", style: "tableHeader" },
                    { text: "Dòng điện (A)", style: "tableHeader" },
                    { text: "Công suất tiêu thụ (KWh)", style: "tableHeader" },
                    ""
                ];
    
                let body = [headers, subHeaders];
    
                let grandTotalPowerPhase1 = 0, grandTotalPowerPhase2 = 0, grandTotalPowerPhase3 = 0, grandTotalPowerConsumption = 0;
    
                this.dataTable.forEach((road, roadIndex) => {
                    let totalPowerPhase1 = 0, totalPowerPhase2 = 0, totalPowerPhase3 = 0, totalPowerConsumption = 0;
    
                    road.cabinetReportDTOS?.forEach(cabinet => {
                        totalPowerPhase1 += cabinet.wattageActualPhase1 || 0;
                        totalPowerPhase2 += cabinet.wattageActualPhase2 || 0;
                        totalPowerPhase3 += cabinet.wattageActualPhase3 || 0;
                    });
    
                    totalPowerConsumption = totalPowerPhase1 + totalPowerPhase2 + totalPowerPhase3;
    
                    // Cộng dồn vào tổng chung
                    grandTotalPowerPhase1 += totalPowerPhase1;
                    grandTotalPowerPhase2 += totalPowerPhase2;
                    grandTotalPowerPhase3 += totalPowerPhase3;
                    grandTotalPowerConsumption += totalPowerConsumption;
    
                    // Dòng Road (Gộp 2 cột đầu, để trống các cột còn lại)
                    body.push([
                        "", { text: road.nameR, style: "boldText" },
                        "", "", totalPowerPhase1?.toFixed(2),
                        "", "", totalPowerPhase2?.toFixed(2),
                        "", "", totalPowerPhase3?.toFixed(2),
                        totalPowerConsumption?.toFixed(2)
                    ]);
    
                    // Dữ liệu từng cabinet
                    road.cabinetReportDTOS?.forEach((cabinet, cabIndex) => {
                        body.push([
                            cabIndex + 1, cabinet.nameC,
                            cabinet.voltagePhase1 !== undefined? cabinet.voltagePhase1.toFixed(2) : 0,  cabinet.amperagePhase1 !== undefined? cabinet.amperagePhase1?.toFixed(2) :0,cabinet.wattageActualPhase1 !== undefined? cabinet.wattageActualPhase1?.toFixed(2):0,
                            cabinet.voltagePhase2 !== undefined?cabinet.voltagePhase2?.toFixed(2):0, cabinet.amperagePhase2 !== undefined? cabinet.amperagePhase2?.toFixed(2):0,cabinet.wattageActualPhase2 !== undefined? cabinet.wattageActualPhase2?.toFixed(2):0,
                            cabinet.voltagePhase3 !== undefined?cabinet.voltagePhase3?.toFixed(2):0, cabinet.amperagePhase3 !== undefined? cabinet.amperagePhase3?.toFixed(2):0,cabinet.wattageActualPhase3 !== undefined? cabinet.wattageActualPhase3?.toFixed(2):0,
                            (
                                (cabinet.wattageActualPhase1 || 0) +
                                (cabinet.wattageActualPhase2 || 0) +
                                (cabinet.wattageActualPhase3 || 0)
                            )?.toFixed(2)
                        ]);
                    });
                });
    
                // Thêm dòng tổng cộng
                body.push([
                    "",
                    { text: "Tổng cộng", style: "boldText"},
                    "", "", { text: grandTotalPowerPhase1?.toFixed(2), style: "boldText" },
                    "", "", { text: grandTotalPowerPhase2?.toFixed(2), style: "boldText" },
                    "", "", { text: grandTotalPowerPhase3?.toFixed(2), style: "boldText" },
                    { text: grandTotalPowerConsumption?.toFixed(2), style: "boldText" },
                ]);
                // Định nghĩa cấu trúc tài liệu PDF
                const docDefinition = {
                    content: [
                        { text: "Báo cáo công suất của tủ điện theo kỳ", style: "title" },
                        { text: `Từ ngày ${this.objectDate?.fromDate} đến ngày ${this.objectDate?.toDate} `, style: "title" },
                        {
                            table: {
                                headerRows: 2,
                                widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                                body: body
                            }
                        }
                    ],
                    styles: {
                        title: { fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
                        tableHeader: { bold: true, fillColor: "#eeeeee", alignment: "center" },
                        boldText: { bold: true }
                    }
                };
    
                // Xuất PDF
                pdfMake.createPdf(docDefinition)?.download("BaoCaoCongSuat.pdf");
            } else {
                const notification = this.shadowRoot!.getElementById('myNotification2') as any;
                notification.renderer = (root: HTMLElement) => {
                    root.innerHTML = ''; // Xóa nội dung cũ
                    const text = document.createElement('div');
                    text.textContent = 'Không có dữ liệu để xuất PDF!';
                    root.appendChild(text);
                };
                notification.open();
            }
    
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
    
        _onDateFromChangeChooseNgay(e) {
            this.currentDateFromChooseC = e.target.value
            console.log('valueNgay', e.target.value)
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
    
        handleSearch() {
            function convertDateToVietnamese(dateString) {
                const date = new Date(dateString);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            }
            if (this.selectedKBC === "D") {
                this.loading = true
                console.log('a', {
                    fromDate: this.currentDateFromChooseC,
                    toDate: this.currentDateFromChooseC,
                    roadId: this.idRoad,
                    cabinetId: this.idCabinet
                })
                this.objectDate = {
                    fromDate: convertDateToVietnamese(this.currentDateFromChooseC),
                    toDate:convertDateToVietnamese(this.currentDateFromChooseC)
                }
                manager.rest.api.AssetDatapointResource.cabinetMetrics(
                    {
                        fromDate: this.currentDateFromChooseC,
                        toDate: this.currentDateFromChooseC,
                        roadId: this.idRoad,
                        cabinetId: this.idCabinet,
                        realm:this.realmSelected
                    })
                    .then((response) => {
    
                        this.dataTable = response.data
                        console.log('response', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    })
                    .finally(() => {
                    this.loading = false; // Dừng loading
                });
                console.log('data update', this.dataInput)
            } else if (this.selectedKBC === "M") {
                this.loading = true
                const addZero = this.selectedMonth < 10 ? "0" + this.selectedMonth : String(this.selectedMonth);
                console.log('addZero',typeof addZero)
                const fromDateLocal = `${this.selectedYear}-${addZero}-01`
                const lastDate = new Date(Number(this.selectedYear.toString()), Number(addZero), 0).getDate();
                const lastDateLocal = `${this.selectedYear}-${addZero}-${lastDate}`
                console.log('a', {
                    fromDate: fromDateLocal,
                    toDate: lastDateLocal,
                    roadId: this.idRoad,
                    cabinetId: this.idCabinet
                })
                this.objectDate = {
                    fromDate:convertDateToVietnamese(fromDateLocal),
                    toDate:convertDateToVietnamese(lastDateLocal)
                }
                manager.rest.api.AssetDatapointResource.cabinetMetrics(
                    {
                        fromDate: fromDateLocal,
                        toDate: lastDateLocal,
                        roadId: this.idRoad,
                        cabinetId: this.idCabinet,
                        realm:this.realmSelected
                    })
                    .then((response) => {
                        this.dataTable = response.data
                        console.log('response', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    })
            .finally(() => {
                    this.loading = false; // Dừng loading
                });
            } else if (this.selectedKBC === "Y") {
                this.loading = true
                const fromDateLocal = `${this.selectedYear}-01-01`
                const lastDate = new Date(Number(this.selectedYear.toString()), 12, 0).getDate();
                const lastDateLocal = `${this.selectedYear}-12-${lastDate}`
                console.log('fromDateLocal', fromDateLocal)
                console.log('lastDateLocal', lastDateLocal)
                console.log('a', {
                    idKBC: this.selectedKBC,
                    fromDate: fromDateLocal,
                    toDate: lastDateLocal,
                    idRoad: this.idRoad,
                    idCabinet: this.idCabinet
                })
                this.objectDate = {
                    fromDate:convertDateToVietnamese(fromDateLocal) ,
                    toDate:convertDateToVietnamese(lastDateLocal)
                }
                manager.rest.api.AssetDatapointResource.cabinetMetrics(
                    {
                        fromDate: fromDateLocal,
                        toDate: lastDateLocal,
                        roadId: this.idRoad,
                        cabinetId: this.idCabinet,
                        realm:this.realmSelected
                    })
                    .then((response) => {
                        this.dataTable = response.data
                        console.log('response', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    })
                    .finally(() => {
                        this.loading = false; // Dừng loading
                    });
            } else if (this.selectedKBC === "Q") {
                this.loading = true
                console.log('selectedQuarter',this.selectedQuarter)
                const getFirstMonthOfQuarter = (quarter) => {
                    if (quarter < 1 || quarter > 4) {
                        throw new Error("Quý không hợp lệ. Vui lòng nhập từ 1 đến 4.");
                    }
                    return (quarter - 1) * 3 + 1; // Tháng đầu tiên của quý
                };
                const addZero = getFirstMonthOfQuarter(this.selectedQuarter) < 10 ? "0" + getFirstMonthOfQuarter(this.selectedQuarter) : String(getFirstMonthOfQuarter(this.selectedQuarter));
                console.log('getFirstMonthOfQuarter',getFirstMonthOfQuarter(this.selectedQuarter))
                const fromDateLocal = `${this.selectedYear}-${addZero}-01`
                const getLastMonthOfQuarter = (quarter) => {
                    if (quarter < 1 || quarter > 4) {
                        throw new Error("Quý không hợp lệ. Vui lòng nhập từ 1 đến 4.");
                    }
                    return quarter * 3; // Tháng cuối cùng của quý
                };
                const getLastDayOfQuarter = (year, quarter) => {
                    const month = getLastMonthOfQuarter(quarter);
                    return new Date(year, month, 0).getDate(); // Ngày cuối cùng của tháng cuối quý
                };
                const addZero2 = getLastMonthOfQuarter(this.selectedQuarter) < 10 ? "0" + getLastMonthOfQuarter(this.selectedQuarter) : String(getLastMonthOfQuarter(this.selectedQuarter));
                const lastDateLocal = `${this.selectedYear}-${addZero2}-${getLastDayOfQuarter(this.selectedYear,this.selectedQuarter)}`
                console.log('a',{
                    fromDate: fromDateLocal,
                    toDate: lastDateLocal,
                    roadId: this.idRoad,
                    cabinetId: this.idCabinet
                })
                this.objectDate = {
                    fromDate: convertDateToVietnamese(fromDateLocal) ,
                    toDate:convertDateToVietnamese(lastDateLocal)
                }
                manager.rest.api.AssetDatapointResource.cabinetMetrics(
                    {
                        fromDate: fromDateLocal,
                        toDate: lastDateLocal,
                        roadId: this.idRoad,
                        cabinetId: this.idCabinet,
                        realm:this.realmSelected
                    })
                    .then((response) => {
                        this.dataTable = response.data
                        console.log('response', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    })
            .finally(() => {
                    this.loading = false; // Dừng loading
                });
            } else if (this.selectedKBC === "C") {
                this.loading = true
                console.log('data update', {
                    fromDate: this.currentDateFromChooseC,
                    toDate: this.currentDateToChooseC,
                    roadId: this.idRoad,
                    cabinetId: this.idCabinet
                })
                this.objectDate = {
                    fromDate:convertDateToVietnamese(this.currentDateFromChooseC) ,
                    toDate:convertDateToVietnamese(this.currentDateToChooseC)
                }
                manager.rest.api.AssetDatapointResource.cabinetMetrics(
                    {
                        fromDate: this.currentDateFromChooseC,
                        toDate: this.currentDateToChooseC,
                        roadId: this.idRoad,
                        cabinetId: this.idCabinet,
                        realm:this.realmSelected
                    })
                    .then((response) => {
                        this.dataTable = response.data
                        console.log('response', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    })
                    .finally(() => {
                        this.loading = false; // Dừng loading
                    });
    
            }
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
            console.log('this.dataFilterCabinet', this.dataFilterCabinet)
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
            let totalWattagePhase1 = 0;
            let totalWattagePhase2 = 0;
            let totalWattagePhase3 = 0;
    
            this.dataTable?.cabinetReportDTOS?.forEach(cabinet => {
                totalWattagePhase1 += cabinet.wattageActualPhase1;
                totalWattagePhase2 += cabinet.wattageActualPhase2;
                totalWattagePhase3 += cabinet.wattageActualPhase3;
            });
    
            let totalWattageAll = totalWattagePhase1 + totalWattagePhase2 + totalWattagePhase3;
            return html`
                <vaadin-notification id="myNotification" duration="3000" position="bottom-end" theme="success"></vaadin-notification>
                <vaadin-notification  id="myNotification2" duration="3000" position="bottom-end" theme="error"></vaadin-notification>
                <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <div style="font-weight: 500;font-size: 16px">
                        <span slot="navbar">${i18next.t("PeriodicElectricalCabinetCapacityReport")}</span>
                    </div>
                </div>
                <div style="padding : 10px 0px;border-bottom: 1px solid #e3e6ea;margin: 20px 20px;;background: white;border-radius:10px">
                    <div>
                        <h2 style="margin-bottom: 10px;margin-top: 0px;margin-left: 20px">Thông tin tìm kiếm</h2>
                        <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="padding: 0 20px">
                            <vaadin-combo-box
                                    clear-button-visible
                                    label="Lộ/Tuyến"
                                    item-label-path="routeName"
                                    item-value-path="id"
                                    .items="${this.dataRoad}"
                                    .value="${this.idRoad}"
                                    @selected-item-changed="${this.handleSelectRoad}"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-combo-box
                                    clear-button-visible
                                    label="Tên tủ"
                                    item-label-path="name"
                                    item-value-path="id"
                                    .value="${this.idCabinet}"
                                    .items="${this.dataFilterCabinet}"
                                    @selected-item-changed="${this.handleCabinet}"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-combo-box
                                    label="Kỳ báo cáo"
                                    item-label-path="label"
                                    item-value-path="value"
                                    style="width: 150px;"
                                    .items="${this.roads}"
                                    .value="${this.selectedKBC}"
                                    @selected-item-changed="${this.handleChangeKBC}"
                            ></vaadin-combo-box>
                            ${this.fromDateNgay ? html`
                                <vaadin-date-picker label="Ngày" .value=${this.currentDateFromChooseC} 
                                                    @value-changed="${this._onDateFromChangeChooseNgay}"
                                                    max="${new Date().toISOString().split("T")[0]}">>
                                </vaadin-date-picker>` : ``}
                            ${this.fromDateThang ? html`
                                <vaadin-combo-box
                                        label="Chọn năm"
                                        .items=${this.years}
                                        .value=${this.selectedYear}
                                        @change=${this.handleYearChange}>
                                </vaadin-combo-box>
                                <vaadin-combo-box
                                        label="Chọn tháng"
                                        item-label-path="label"
                                        item-value-path="value"
                                        .items=${this.months}
                                        .value=${this.selectedMonth}
                                        @change=${this.handleMonthChange}>
                                </vaadin-combo-box>
    
                            ` : ``}
                            ${this.fromDateNam ? html`
                                <vaadin-combo-box
                                        label="Chọn năm"
                                        .items=${this.years}
                                        .value=${this.selectedYear}
                                        @change=${this.handleYearChange}>
                                </vaadin-combo-box>` : ``}
                            ${this.fromDateQuy ? html`
                                <vaadin-combo-box
                                        label="Chọn năm"
                                        .items=${this.years}
                                        .value=${this.selectedYear}
                                        @change=${this.handleYearChange}>
                                </vaadin-combo-box>
                                <vaadin-combo-box
                                        label="Chọn quý"
                                        item-label-path="label"
                                        item-value-path="value"
                                        .items=${this.quarters}
                                        .value=${this.selectedQuarter}
                                        @change=${this.handleQuaterChange}>
                                </vaadin-combo-box>
                            ` : ``}
                            ${this.fromDateC ? html`
                                <vaadin-date-picker label="Từ ngày" .value=${this.currentDateFromChooseC}
                                                    @value-changed="${this._onDateFromChangeChooseNgay}">>
                                </vaadin-date-picker>
                                <vaadin-date-picker .value=${this.currentDateToChooseC} label="Đến ngày"
                                                    @value-changed="${this._onDateToChange}"></vaadin-date-picker>` : ``}
    
                            <!-- Stretch the username field over 2 columns -->
    
                        </vaadin-form-layout>
                    </div>
                    <div style="margin-right: 10px;margin-top: 20px;margin-bottom: 10px;display: flex;justify-content: center">
                        <vaadin-button @click="${this.handleSearch}">
                            <or-icon icon="magnify" slot="prefix"></or-icon>
                            Tìm kiếm
                        </vaadin-button>
                        <vaadin-button theme="secondary error" @click="${this.exportToPDF}" style="margin-left: 10px">
                            <or-icon icon="file-pdf-box" slot="prefix"></or-icon>
                            Xuất file
                        </vaadin-button>
                        <vaadin-button theme="secondary success" @click="${this.exportToExcel}" style="margin-left: 10px">
                            <or-icon icon="file-excel" slot="prefix"></or-icon>
                            Xuất file
                        </vaadin-button>
                    </div>
                </div>
    
                <div style="background: white;
        padding: 15px 20px 20px 20px ;margin: 20px;
        border-radius: 10px;">
                    <h2 style="margin-top:0px">Danh sách</h2>
                    <table>
                        <thead style="color:#1B2B41B0">
                        <tr>
                            <th rowspan="2">STT</th>
                            <th rowspan="2">Tủ điện</th>
                            <th colspan="3" style="text-align: center">Pha 1</th>
                            <th colspan="3" style="text-align: center">Pha 2</th>
                            <th colspan="3" style="text-align: center">Pha 3</th>
                            <th rowspan="2">Tổng công suất tiêu thụ(KWh)</th>
                        </tr>
                        <tr>
                            <th>Điện áp(V)</th>
                            <th>Dòng điện(A)</th>
                            <th>Công suất tiêu thụ(KWh)</th>
                            <th>Điện áp(V)</th>
                            <th>Dòng điện(A)</th>
                            <th>Công suất tiêu thụ(KWh)</th>
                            <th>Điện áp(V)</th>
                            <th>Dòng điện(A)</th>
                            <th>Công suất tiêu thụ(KWh)</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.loading
                                ? html`
                                    <tr style="font-weight: bold; background: #f0f0f0;">
                                        <td colspan="12" style="text-align: center;"> <vaadin-progress-bar indeterminate></vaadin-progress-bar></td>
                                    </tr>
              `
                                : html`
                                    ${this.dataTable.length !== 0 && this.dataTable ? html`
                ${this.dataTable.map((road) => {
                                        let totalPowerPhase1 = 0, totalPowerPhase2 = 0, totalPowerPhase3 = 0, totalPowerConsumption = 0;
    
                                        road.cabinetReportDTOS?.forEach((cabinet) => {
                                            totalPowerPhase1 += cabinet.wattageActualPhase1 || 0;
                                            totalPowerPhase2 += cabinet.wattageActualPhase2 || 0;
                                            totalPowerPhase3 += cabinet.wattageActualPhase3 || 0;
                                            totalPowerConsumption += (cabinet.wattageActualPhase1 || 0) + (cabinet.wattageActualPhase2 || 0) + (cabinet.wattageActualPhase3 || 0);
                                        });
    
                                        return html`
                        <tr style="font-weight: bold; background: #f0f0f0;">
                            <td colspan="2" style="text-align: center;">${road.nameR}</td>
                            <td></td>
                            <td></td>
                            <td>${totalPowerPhase1.toFixed(2)}</td>
                            <td></td>
                            <td></td>
                            <td>${totalPowerPhase2.toFixed(2)}</td>
                            <td></td>
                            <td></td>
                            <td>${totalPowerPhase3.toFixed(2)}</td>
                            <td>${totalPowerConsumption.toFixed(2)}</td>
                        </tr>
                        ${road.cabinetReportDTOS.map((cabinet, cabIndex) => html`
                            <tr>
                                <td>${cabIndex + 1}</td>
                                <td>${cabinet.nameC}</td>
                                <td>${cabinet.voltagePhase1?.toFixed(2)}</td>
                                <td>${cabinet.amperagePhase1?.toFixed(2)}</td>
                                <td>${cabinet.wattageActualPhase1?.toFixed(2)}</td>
                                <td>${cabinet.voltagePhase2?.toFixed(2)}</td>
                                <td>${cabinet.amperagePhase2?.toFixed(2)}</td>
                                <td>${cabinet.wattageActualPhase2?.toFixed(2)}</td>
                                <td>${cabinet.voltagePhase3?.toFixed(2)}</td>
                                <td>${cabinet.amperagePhase3?.toFixed(2)}</td>
                                <td>${cabinet.wattageActualPhase3?.toFixed(2)}</td>
                                <td>${((cabinet.wattageActualPhase1 || 0) + (cabinet.wattageActualPhase2 || 0) + (cabinet.wattageActualPhase3 || 0))?.toFixed(2)}</td>
                            </tr>
                        `)}
                    `;
                                    })}
                <tr style="font-weight: bold">
                    <td colspan="2" style="text-align: center;">Tổng</td>
                    <td></td>
                    <td></td>
                    <td>${this.dataTable.reduce((sum, road) => sum + road.cabinetReportDTOS.reduce((s, c) => s + (c.wattageActualPhase1 || 0), 0), 0).toFixed(2)}</td>
                    <td></td>
                    <td></td>
                    <td>${this.dataTable.reduce((sum, road) => sum + road.cabinetReportDTOS.reduce((s, c) => s + (c.wattageActualPhase2 || 0), 0), 0).toFixed(2)}</td>
                    <td></td>
                    <td></td>
                    <td>${this.dataTable.reduce((sum, road) => sum + road.cabinetReportDTOS.reduce((s, c) => s + (c.wattageActualPhase3 || 0), 0), 0).toFixed(2)}</td>
                    <td>${this.dataTable.reduce((sum, road) => sum + road.cabinetReportDTOS.reduce((s, c) => s + ((c.wattageActualPhase1 || 0) + (c.wattageActualPhase2 || 0) + (c.wattageActualPhase3 || 0)), 0), 0).toFixed(2)}</td>
                </tr>
            ` : html`<tr><td colspan="12">Không có dữ liệu</td></tr>`}
                                `}
                        </tbody>
                    </table>
                </div>
    
    
            `;
        }
    }
