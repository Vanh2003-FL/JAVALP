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

pdfMake.vfs = pdfFonts.vfs;

@customElement("reportonlightingperformanceandefficiencyby-period")
export class MyElement extends LitElement {
    @state() dataRoad = []
    @state() dataCabinet = []
    @state() idRoad = ""
    @state() idCabinet = ""
    @state() loading = false;
    @state() dataFilterCabinet = []
    @state() dataTable = [];
    @state() selectedKBC: String = "D"
    @state() dataInput: {} = {}
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
    @state() objectDate:{
        fromDate: string;
        toDate:string;
    }={
        fromDate:"",
        toDate:""
    }
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
        }else{
            const reportTitle = `Báo cáo hiệu suất và hiệu quả vận hành chiếu sáng theo kỳ`;

            const headers = ["STT", "Tên đèn", "Dòng điện (A)", "Công suất (W)","Quang thông (Lm)","Hiệu suất sáng (Lm/W)", "Thời gian hoạt động (h)", "Công suất tiêu thụ (W)"];
            let dataWithHeaders = [
                [reportTitle], // Tiêu đề chính
                [`Từ ngày ${this.objectDate?.fromDate} đến ngày ${this.objectDate?.toDate} `], // Dòng trống
                [],
                headers, // Tiêu đề bảng
            ];

// Biến tính tổng toàn bộ
            let grandTotalAmperage = 0;
            let grandTotalWattage = 0;
            let grandTotalTimeActive = 0;
            let grandTotalConsumption = 0;

            let rowIndex = 1; // STT bắt đầu từ 1

            this.dataTable.forEach((cabinet) => {
                let cabinetTotalAmperage = 0;
                let cabinetTotalWattage = 0;
                let cabinetTotalTimeActive = 0;
                let cabinetTotalConsumption = 0;

                // Tính tổng từng tủ điện
                cabinet.lightDtos?.forEach((light) => {
                    const amperage = light.amperage || 0;
                    const wattage = light.wattageActual || 0;
                    const timeActive = light.activeDuration || 0;
                    const consumption = light.powerConsumption || 0; // Công suất tiêu thụ

                    cabinetTotalAmperage += amperage;
                    cabinetTotalWattage += wattage;
                    cabinetTotalTimeActive += timeActive;
                    cabinetTotalConsumption += consumption;
                });

                // Cộng tổng vào biến toàn cục
                grandTotalAmperage += cabinetTotalAmperage;
                grandTotalWattage += cabinetTotalWattage;
                grandTotalTimeActive += cabinetTotalTimeActive;
                grandTotalConsumption += cabinetTotalConsumption;

                // 🟢 Thêm dòng CabinetName (Hợp nhất STT + Tên đèn)
                dataWithHeaders.push([
                    cabinet.cabinetName.toString(),
                    "",
                    cabinetTotalAmperage.toString(), // Tổng dòng điện của tủ
                    cabinetTotalWattage.toString(), // Tổng công suất của tủ
                    "",
                    "",
                    cabinetTotalTimeActive.toString(), // Tổng thời gian hoạt động của tủ
                    cabinetTotalConsumption.toString() // Tổng công suất tiêu thụ của tủ
                ]);

                // 🟢 Thêm từng đèn trong tủ
                if(cabinet.lightDtos !== undefined){
                    cabinet.lightDtos?.forEach((light, index) => {
                        dataWithHeaders.push([
                            (index + 1).toString(), // STT của từng đèn
                            light.lightName?.toString(), // Tên đèn
                            light.amperage?.toString(),
                            light.wattageActual?.toString(),
                            light.luminousFlux?.toString(),
                            light.luminousEfficacy?.toString(),
                            light.activeDuration?.toString(),
                            (light.powerConsumption)?.toString() // Công suất tiêu thụ
                        ])
                    });
                }
                rowIndex++; // Tăng STT cho cabinet tiếp theo
            });

// 🔹 Thêm hàng "Tổng" cuối cùng
            dataWithHeaders.push([
                "Tổng", // Hợp nhất STT & Tên đèn
                "",
                "", // Tổng dòng điện toàn bộ tủ
                "", // Tổng công suất toàn bộ tủ
                "",
                "",
                grandTotalTimeActive.toString(), // Tổng thời gian hoạt động toàn bộ tủ
                grandTotalConsumption.toString(), // Tổng công suất tiêu thụ toàn bộ tủ
            ]);

// Xuất file Excel
            const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Báo Cáo");

// ⚡ Merge cột STT + Tên đèn ở các dòng `cabinetName` & Tổng
            worksheet["!merges"] = dataWithHeaders.map((row, i) =>
                i >= 3 && row[1] === "" // Duyệt từ hàng 3 trở đi (bỏ tiêu đề), nếu cột 1 trống thì merge
                    ? {s: {r: i, c: 0}, e: {r: i, c: 1}} // Merge từ cột 0 -> 1
                    : null
            ).filter(Boolean);
            worksheet["!cols"] = headers.map((header, colIndex) => ({
                wch: 20 // Cột rộng 20 ký tự, dễ đọc hơn
            }));

            worksheet["!rows"] = [
                {hpx: 20}, // Tiêu đề chính cao 30px
                {hpx: 15}, // Dòng trống
                {hpx: 20}, // Tiêu đề bảng
                {hpx: 20}  // Tiêu đề con (cao hơn để rõ chữ)
            ];


// Xuất file
            const excelBuffer = XLSX.write(workbook, {bookType: "xlsx", type: "array"});
            const dataBlob = new Blob([excelBuffer], {type: "application/octet-stream"});
            saveAs(dataBlob, "BaoCaoHieuSuat.xlsx");
        }


    }

    exportToPDF() {
            if(this.dataTable.length !== 0){
                const headers = [
                    {text: "STT", style: "tableHeader"},
                    {text: "Tên đèn", style: "tableHeader"},
                    {text: "Dòng điện (A)", style: "tableHeader"},
                    {text: "Công suất (W)", style: "tableHeader"},
                    {text: "Quang thông (Lm)", style: "tableHeader"},
                    {text: "Hiệu suất sáng (Lm/W)", style: "tableHeader"},
                    {text: "Thời gian hoạt động (h)", style: "tableHeader"},
                    {text: "Công suất tiêu thụ (W)", style: "tableHeader"},
                ];
                let body = [];
                let rowIndex = 1;
                let grandTotalAmperage = 0;
                let grandTotalWattage = 0;
                let grandTotalTimeActive = 0;
                let grandTotalConsumption = 0;

                this.dataTable.forEach((cabinet) => {
                    let cabinetTotalAmperage = 0;
                    let cabinetTotalWattage = 0;
                    let cabinetTotalTimeActive = 0;
                    let cabinetTotalConsumption = 0;

                    // 🟢 Tính tổng từng tủ
                    cabinet.lightDtos?.forEach((light) => {
                        const amperage = light.amperage || 0;
                        const wattage = light.wattageActual || 0;
                        const timeActive = light.activeDuration || 0;
                        const consumption = light.powerConsumption || 0;

                        cabinetTotalAmperage += amperage;
                        cabinetTotalWattage += wattage;
                        cabinetTotalTimeActive += timeActive;
                        cabinetTotalConsumption += consumption;
                    });

                    // 🟢 Cộng tổng vào biến toàn cục
                    grandTotalAmperage += cabinetTotalAmperage;
                    grandTotalWattage += cabinetTotalWattage;
                    grandTotalTimeActive += cabinetTotalTimeActive;
                    grandTotalConsumption += cabinetTotalConsumption;

                    // 🟢 Dòng CabinetName (Merge STT + Tên đèn)
                    body.push([
                        {text: `${rowIndex}.${cabinet.cabinetName}`, colSpan: 2, style: "cabinetStyle"}, "",
                        {text: cabinetTotalAmperage.toFixed(2), style: "boldText"},
                        {text: cabinetTotalWattage.toFixed(2), style: "boldText"},
                        {text: ``, style: "boldText"},
                        {text: ``, style: "boldText"},
                        {text: cabinetTotalTimeActive.toFixed(2), style: "boldText"},
                        {text: cabinetTotalConsumption.toFixed(2), style: "boldText"}
                    ]);

                    // 🟢 Thêm từng đèn trong tủ// 🟢 Thêm từng đèn trong tủ
                    cabinet.lightDtos?.forEach((light, index) => {
                        body.push([
                            {text: index + 1}, // STT
                            {text: light.lightName}, // Tên đèn
                            {text:  light.amperage?.toFixed(2)},
                            {text: light.wattageActual?.toFixed(2)},
                            {text: light.luminousFlux?.toFixed(2)},
                            {text: light.luminousEfficacy?.toFixed(2)},
                            {text: light.activeDuration?.toFixed(2)},
                            {text: (light.powerConsumption)?.toFixed(2)}
                        ]);
                    });


                    rowIndex++;
                });
                console.log('body',body)
                // 🟢 Thêm dòng "Tổng" cuối bảng
                body.push([
                    {text: "Tổng", colSpan: 2, style: "totalStyle"}, "",
                    {text:``, style: "boldText"},
                    {text: ``, style: "boldText"},
                    {text: ``, style: "boldText"},
                    {text: ``, style: "boldText"},
                    {text: grandTotalTimeActive.toFixed(2), style: "boldText"},
                    {text: grandTotalConsumption.toFixed(2), style: "boldText"}
                ]);

                // 🟢 Cấu trúc tài liệu PDF
                const docDefinition = {
                    content: [
                        {text: "Báo Cáo hiệu suất và hiệu quả vận hành chiếu sáng theo kỳ", style: "title"},
                        { text: `Từ ngày ${this.objectDate?.fromDate} đến ngày ${this.objectDate?.toDate} `, style: "title" },
                        {
                            table: {
                                headerRows: 1,
                                widths: ["auto", "*", "auto", "auto", "auto", "auto","auto","auto"],
                                body: [headers, ...body]
                            }
                        }
                    ],
                    styles: {
                        title: {fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 10]},
                        tableHeader: {bold: true, fillColor: "#eeeeee", alignment: "center"},
                        cabinetStyle: {bold: true, fontSize: 12, fillColor: "#d9edf7", alignment: "center"},
                        totalStyle: {bold: true, fontSize: 12, fillColor: "#f7d9d9", alignment: "center"},
                        boldText: {bold: true}
                    }
                };
                // 🟢 Xuất PDF
                pdfMake.createPdf(docDefinition).download("BaoCaoHieuSuat.pdf");
            }else{
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
    @state() realmSelected
    handleSearch() {
        function convertDateToVietnamese(dateString) {
            const date = new Date(dateString);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        if (this.selectedKBC === "D") {
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
            manager.rest.api.AssetDatapointResource.getLightReport(
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
                });

            console.log('data update', this.dataInput)
        } else if (this.selectedKBC === "M") {
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
            manager.rest.api.AssetDatapointResource.getLightReport(
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
                });
        } else if (this.selectedKBC === "Y") {
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
                fromDate:convertDateToVietnamese(fromDateLocal),
                toDate:convertDateToVietnamese(lastDateLocal)
            }
            manager.rest.api.AssetDatapointResource.getLightReport(
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
                });
        } else if (this.selectedKBC === "Q") {
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
                fromDate:convertDateToVietnamese(fromDateLocal),
                toDate:convertDateToVietnamese(lastDateLocal)
            }
            manager.rest.api.AssetDatapointResource.getLightReport(
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
                });
        } else if (this.selectedKBC === "C") {
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
            manager.rest.api.AssetDatapointResource.getLightReport(
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
        let totalAmperage = 0;
        let totalWattageActual = 0;
        let totalTimeActive = 0;
        let totalPowerConsumption = 0;
        let grandTotalTimeActive = 0;
        let grandTotalConsumption = 0;
        return html`
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end" theme="success"></vaadin-notification>
            <vaadin-notification  id="myNotification2" duration="3000" position="bottom-end" theme="error"></vaadin-notification>
            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    <span slot="navbar">${i18next.t("REPORTONLIGHTINGPERFORMANCEANDEFFICIENCYBYPERIOD2")}</span>
                </div>
            </div>
            <div style="padding : 10px 0px;border-bottom: 1px solid #e3e6ea;margin: 20px 20px;;background: white;border-radius:10px">
                <div>
                    <h2 style="margin-bottom: 10px;margin-top: 0px;margin-left: 20px">Thông tin tìm kiếm
                    </h2>
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
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên đèn</th>
                        <th>Dòng điện (A)</th>
                        <th>Công suất (W)</th>
                        <th>Quang thông (Lm)</th>
                        <th>Hiệu suất sáng (Lm/W)</th>
                        <th>Thời gian hoạt động (h)</th>
                        <th>Công suất tiêu thụ (W)</th>
                    </tr>
                    </thead>
                    <tbody>
                     ${this.loading
            ? html`
                    <tr style="font-weight: bold; background: #f0f0f0;">
                        <td colspan="12" style="text-align: center;"> <vaadin-progress-bar indeterminate></vaadin-progress-bar></td>
                    </tr>
            `
            : html``}
                    ${
                            this.dataTable.length !== 0 && this.dataTable ? html`${this.dataTable.map((cabinet) => {
                                // Tính tổng của từng tủ
                                console.log('cabinet.lightDtos',cabinet.lightDtos)
                                const sumAmperage = cabinet.lightDtos && Array.isArray(cabinet.lightDtos)
                                        ? cabinet.lightDtos.reduce((sum, item) => sum + (item.amperage || 0), 0)
                                        : 0;
                                const sumWattageActual = cabinet.lightDtos && Array.isArray(cabinet.lightDtos)
                                        ? cabinet.lightDtos.reduce((sum, item) => sum + (item.wattageActual || 0), 0)
                                        : 0;
                                const sumTimeActive = cabinet.lightDtos && Array.isArray(cabinet.lightDtos)
                                        ? cabinet.lightDtos.reduce((sum, item) => sum + (item.activeDuration || 0), 0)
                                        : 0;
                                const sumPowerConsumption = cabinet.lightDtos && Array.isArray(cabinet.lightDtos)
                                        ? cabinet.lightDtos.reduce((sum, item) => sum + (item.powerConsumption || 0), 0)
                                        : 0;
                                console.log('sumAmperage',sumAmperage)
                                // Cộng dồn vào tổng toàn bộ bảng
                                totalAmperage += sumAmperage;
                                totalWattageActual += sumWattageActual;
                                totalTimeActive += sumTimeActive;
                                totalPowerConsumption += sumPowerConsumption;
                                const isEmptyObject = (obj) => {
                                    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
                                };
                                console.log('totalTimeActive',totalTimeActive)
                                grandTotalTimeActive +=totalTimeActive
                                grandTotalConsumption +=totalPowerConsumption
                                return html`
                                    <!-- Hàng chứa tên Cabinet -->
                                    <tr class="cabinet-row">
                                        <td colspan="2" style="font-weight: bold">${cabinet.cabinetName}</td>
                                        <td style="font-weight: bold">${isNaN(sumAmperage) ?0:sumAmperage}</td>
                                        <td style="font-weight: bold">${isNaN(sumWattageActual) ?0:sumWattageActual}</td>
                                        <td style="font-weight: bold"></td>
                                        <td style="font-weight: bold"></td>
                                        <td style="font-weight: bold">${isNaN(sumTimeActive) ?0:sumTimeActive}</td>
                                        <td style="font-weight: bold">${isNaN(sumPowerConsumption) ?0:sumPowerConsumption}</td>
                                    </tr>
                                    <!-- Các hàng dữ liệu của đèn -->
                                    ${cabinet.lightDtos !== undefined ? html`
                                        ${cabinet.lightDtos.map((light, index) => html`
                                      <tr>
                                            <td>${index + 1}</td>
                                            <td>${light.lightName}</td>
                                            <td>${light.amperage}</td>
                                            <td>${light.wattageActual}</td>
                                            <td>${light.luminousFlux}</td>
                                            <td>${light.luminousEfficacy}</td>
                                            <td>${light.activeDuration}</td>
                                            <td>${light.powerConsumption}</td>
                                        </tr>
                                      
                                    `)}`:``}
                                `;
                            })}
                            <!-- Hàng tổng cuối bảng -->
                            <tr class="total-row">
                                <td style="font-weight: bold">Tổng</td>
                                <td>-</td>
                                <td style="font-weight: bold">-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td style="font-weight: bold"> ${grandTotalTimeActive}</td>
                                <td style="font-weight: bold">${grandTotalConsumption}</td>
                            </tr>
                            </tbody>
                            </table>
                            </div>` : html`<tr><td colspan="8">Không có dữ liệu</td></tr>`
                    }
        `;
    }
}
