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
import "@vaadin/date-time-picker"
import manager from "@openremote/core";
import"@vaadin/notification"
import { i18next } from "@openremote/or-translate";
import "@vaadin/progress-bar"

pdfMake.vfs = pdfFonts.vfs;

@customElement("reportlampoperating-status")
export class MyElement extends LitElement {
    @state() dataTable:any = []
    static properties = {
        receivedMessage: { type: String },
    };
    @state() users:any

    @state()  dataRoad = []
    @state()  dataCabinet = []
    @state()  idRoad =""
    @state() loading = false;
    @state()  idCabinet =""
    @state()  dataFilterCabinet = []
    @state()
    valueTime :any = this.getCurrentTime()
    @state() timeDate = ""
    private responsiveSteps: any[] = [
        {minWidth: 0, columns: 1},
        // Use two columns, if layout's width exceeds 500px
        {minWidth: '500px', columns: 3},
    ];
    @state()
    currentDateFromChooseC = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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
        vaadin-button{
            cursor: pointer;
        }
        vaadin-button:active{
           
            transform: scale(0.95);
        }
        .pagination {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 5px;
        }
        vaadin-date-picker,
        vaadin-combo-box,
        input[type="time"] {
            width: 100%;
        }

        input[type="time"] {
            padding: 8px 0px;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid rgb(204, 204, 204);
            margin: 0px;
            background: #e3e6ea;
        }
        .success {
            --vaadin-notification-background: #28a745; /* Xanh lá */
            --vaadin-notification-text-color: white;
        }
        .error {
            --vaadin-notification-background: #dc3545; /* Đỏ */
            --vaadin-notification-text-color: white;
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

    async firstUpdated() {
        console.log('window.sessionStorage.getItem(\'realm\')',typeof window.sessionStorage.getItem('realm'))
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
        // manager.rest.api.UserResource.getCurrent()
        //     .then((response) => {
        //         console.log('response',response.data)
        //         manager.rest.api.AssetResource.getAllRoadAssets(response.data.realm)
        //             .then((response) => {
        //                 const roadSetup = response?.data?.map((item: any) => {
        //                     return ({
        //                         label: item.name,
        //                         value: item.id
        //                     })
        //                 })
        //                 console.log('roadSetup', roadSetup)
        //                 this.dataRoad = roadSetup
        //             })
        //             .catch((error) => {
        //                 console.error('Lỗi khi lấy dữ liệu:', error);
        //             });
        //     })
        //     .catch((error) => {
        //         console.error('Lỗi khi lấy dữ liệu:', error);
        //     });
        // manager.rest.api.UserResource.getCurrent()
        //     .then((response) => {
        //         manager.rest.api.AssetResource.getAllCabinetAssets(response.data.realm)
        //             .then((response) => {
        //                 const roadSetup = response?.data?.map((item: any) => {
        //                     return ({
        //                         label: item.name,
        //                         value: item.id,
        //                         parentId: item.parentId
        //                     })
        //                 })
        //                 this.dataFilterCabinet = roadSetup
        //             })
        //             .catch((error) => {
        //                 console.error('Lỗi khi lấy dữ liệu:', error);
        //             });
        //     })
        //     .catch((error) => {
        //         console.error('Lỗi khi lấy dữ liệu:', error);
        //     });
        console.log('this.users',this.users)
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
            // Chuẩn bị dữ liệu
            const excelData = [];

// Thêm tiêu đề chính cho báo cáo
            const reportTitle = ["Báo cáo trạng thái hoạt động của đèn"];
            excelData.push(reportTitle);
            excelData.push([`Ngày : ${this.timeDate}`]); // Dòng trống để cách tiêu đề và tiêu đề cột
            excelData.push([""]);
// Thêm tiêu đề cột
            const headers = ["STT", "Đèn", "Độ sáng(%)", "Trạng thái", "Lần hoạt động cuối"];
            excelData.push(headers);

            this.dataTable.forEach((road) => {
                // Dòng tên lộ (chiếm 1 hàng)
                excelData.push([road.roadName, "", "", "", ""]);

                road.lightingReports?.forEach((cabinet) => {
                    // Dòng tên tủ (chiếm 1 hàng)
                    excelData.push([cabinet.cabinetName, "", "", "", ""]);

                    cabinet.lightDtos?.forEach((light, index) => {
                        const statusText = light.status === true ? "Bật" : light.status === false ? "Tắt" : "Tắt";
                        const formattedDate = light.lastTimeActive ?
                            light.lastTimeActive.slice(8, 10) + "/" + light.lastTimeActive.slice(5, 7) + "/" + light.lastTimeActive.slice(0, 4) + " " +
                            light.lastTimeActive.slice(11, 16) : '';

                        // Dòng dữ liệu đèn
                        excelData.push([
                            index + 1,
                            light.lightName,
                            light.brightness + "%",
                            statusText, // Trạng thái đèn
                            formattedDate, // Lần hoạt động cuối
                        ]);
                    });

                    // Thêm dòng trống sau mỗi tủ
                    // excelData.push(["", "", "", "", ""]);
                });

                // Thêm dòng trống sau mỗi lộ
                // excelData.push(["", "", "", "", ""]);
            });

// Tạo worksheet và workbook
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Lighting Report");

// Thiết lập độ rộng cột
            ws["!cols"] = headers.map(() => ({ wch: 20 }));

// Xuất file Excel
            XLSX.writeFile(wb, "BaoCaoTrangThai.xlsx");
        }
    }

    exportToPDF() {
        const safeValue = (value) => (value !== undefined && value !== null ? value : "");
        if (!this.dataTable || this.dataTable.length === 0) {
            const notification = this.shadowRoot!.getElementById('myNotification2') as any;
            notification.renderer = (root: HTMLElement) => {
                root.innerHTML = ''; // Xóa nội dung cũ
                const text = document.createElement('div');
                text.textContent = 'Không có dữ liệu để xuất PDF!';
                root.appendChild(text);
            };
            notification.open();
        }else{

            const tableBody = [];

            // Tiêu đề cột
            tableBody.push([
                { text: "STT", style: "tableHeader" },
                { text: "Đèn", style: "tableHeader" },
                { text: "Độ sáng(%)", style: "tableHeader" },
                { text: "Trạng thái", style: "tableHeader" },
                { text: "Lần hoạt động cuối", style: "tableHeader" }
            ]);

            this.dataTable.forEach((road) => {
                // Dòng tên lộ
                tableBody.push([{ text: safeValue(road.roadName), colSpan: 5, style: "roadHeader" }, "", "", "", ""]);

                (road.lightingReports || []).forEach((cabinet) => {
                    // Dòng tên tủ
                    tableBody.push([{ text: safeValue(cabinet.cabinetName), colSpan: 5, style: "cabinetHeader" }, "", "", "", ""]);

                    (cabinet.lightDtos || []).forEach((light, index) => {
                        const statusText = light.status === true ? "Bật" : light.status === false ? "Tắt" : "Tắt";
                        const formattedDate = light.lastTimeActive? light.lastTimeActive?.slice(8, 10) + "/" + light.lastTimeActive?.slice(5, 7) + "/" + light.lastTimeActive?.slice(0, 4) + " " + light.lastTimeActive?.slice(11, 16):'';
                        // Dòng dữ liệu đèn
                        tableBody.push([
                            { text: safeValue(index + 1), alignment: "center" },
                            {text:safeValue(light.lightName), alignment: "center" },
                            {text:safeValue(light.brightness), alignment: "center" },
                            {text:safeValue(statusText), alignment: "center" },
                            {text:safeValue(formattedDate), alignment: "center" },
                        ]);
                    });

                    // Dòng trống sau mỗi tủ
                    // tableBody.push(["", "", "", "", ""]);
                });

                // Dòng trống sau mỗi lộ
                // tableBody.push(["", "", "", "", ""]);
            });

            const docDefinition = {
                content: [
                    { text: "Lighting Report", style: "title", alignment: "center", margin: [0, 0, 0, 10] },
                    { text: `Ngày : ${this.timeDate}`, style: "title", alignment: "center", margin: [0, 0, 0, 10] },
                    {
                        table: {
                            headerRows: 1,
                            widths: ["auto", "*", "auto", "auto", "auto"],
                            body: tableBody,
                        },
                        layout: "lightHorizontalLines",
                    }
                ],
                styles: {
                    title: {
                        fontSize: 16,
                        bold: true,
                    },
                    tableHeader: {
                        bold: true,
                        fillColor: "#f3f3f3",
                        alignment: "center",
                    },
                    roadHeader: {
                        fontSize: 12,
                        bold: true,
                        fillColor: "#d9edf7",
                        margin: [0, 5, 0, 5],
                    },
                    cabinetHeader: {
                        fontSize: 11,
                        bold: true,
                        fillColor: "#f7ecb5",
                        margin: [0, 3, 0, 3],
                    },
                }
            };

            pdfMake.createPdf(docDefinition).download("BaoCaoTrangThai.pdf");
        }
    }
    @state() realmSelected
    _onDateFromChangeChooseNgay(e) {
        this.currentDateFromChooseC = e.target.value
        if(!e.target.value){
            this.currentDateFromChooseC = ""
        }
        console.log('valueNgay', e.target.value)
    }
    handleSearch(){
        console.log('a', {
            timeActive:`${this.currentDateFromChooseC}T${this.valueTime}` ,
            roadId: this.idRoad,
            cabinetId: this.idCabinet,
            realm:this.realmSelected
        })
        function convertDateToVietnamese(dateString) {
            const date = new Date(dateString);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        this.loading = true
        this.timeDate = `${convertDateToVietnamese(this.currentDateFromChooseC)} ${this.valueTime}`
        manager.rest.api.AssetDatapointResource.getStatusLightReport(
            {
                timeActive:`${this.currentDateFromChooseC}T${this.valueTime}` ,
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
    handleTime(event){
        this.valueTime = event.target.value
        console.log('valueTime',event.target.value)
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
    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');  // Định dạng 2 chữ số
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
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
        return html`
        <vaadin-notification id="myNotification" duration="3000" position="bottom-end" theme="success"></vaadin-notification>
        <vaadin-notification id="myNotification2" duration="3000" position="bottom-end" theme="error"></vaadin-notification>
        <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
            <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
            <div style="font-weight: 500;font-size: 16px">
                <span slot="navbar">${i18next.t("ReportLampOperatingStatus")}</span>
            </div>
        </div>
        <div style="padding: 10px 0px; border-bottom: 1px solid #e3e6ea; margin: 20px 20px; background: white; border-radius: 10px;">
            <div>
                <h2 style="margin-bottom: 10px; margin-top: 0px; margin-left: 20px;">
                    ${i18next.t("SearchInformation")}
                </h2>
                <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="padding: 0 20px">
                    <vaadin-combo-box
                        clear-button-visible
                        label="${i18next.t("Road")}"
                        item-label-path="routeName"
                        item-value-path="id"
                        .items="${this.dataRoad}"
                        .value="${this.idRoad}"
                        @selected-item-changed="${this.handleSelectRoad}"
                        style="width: 150px;">
                    </vaadin-combo-box>
                    <vaadin-combo-box
                        clear-button-visible
                        label="${i18next.t("CabinetName")}"
                        item-label-path="name"
                        item-value-path="id"
                        .value="${this.idCabinet}"
                        .items="${this.dataFilterCabinet}"
                        @selected-item-changed="${this.handleCabinet}"
                        style="width: 150px;">
                    </vaadin-combo-box>
                    <vaadin-date-picker label="${i18next.t("Date")}" .value=${this.currentDateFromChooseC}
                        @value-changed="${this._onDateFromChangeChooseNgay}"
                        max="${new Date().toISOString().split("T")[0]}">
                    </vaadin-date-picker>
                    <div style="display: flex;flex-direction: column">
                        <label>${i18next.t("Time")}</label>
                        <input value="${this.valueTime}" @change="${this.handleTime}" placeholder="${i18next.t("SelectTime")}"
                               type="time" min="09:00" max="18:00" required />
                    </div>
                </vaadin-form-layout>
            </div>
            <div style="margin: 20px 10px 10px; display: flex; justify-content: center">
                <vaadin-button @click="${this.handleSearch}">
                    <or-icon icon="magnify" slot="prefix"></or-icon>
                    ${i18next.t("Search")}
                </vaadin-button>
                <vaadin-button theme="secondary error" @click="${this.exportToPDF}" style="margin-left: 10px">
                    <or-icon icon="file-pdf-box" slot="prefix"></or-icon>
                    ${i18next.t("ExportPDF")}
                </vaadin-button>
                <vaadin-button theme="secondary success" @click="${this.exportToExcel}" style="margin-left: 10px">
                    <or-icon icon="file-excel" slot="prefix"></or-icon>
                    ${i18next.t("ExportExcel")}
                </vaadin-button>
            </div>
        </div>

        <div style="background: white; padding: 15px 20px 20px 20px; margin: 20px; border-radius: 10px">
            <h2 style="margin-top:0px">${i18next.t("List")}</h2>
            <table>
                <thead>
                <tr>
                    <th>${i18next.t("Index")}</th>
                    <th>${i18next.t("Lamp")}</th>
                    <th>${i18next.t("BrightnessPercent")}</th>
                    <th>U(V)</th>
                    <th>I(A)</th>
                    <th>P(W)</th>
                    <th>${i18next.t("Status")}</th>
                    <th>${i18next.t("LastOperation")}</th>
                </tr>
                </thead>
                <tbody>
                ${this.loading
            ? html`
                        <tr style="font-weight: bold; background: #f0f0f0;">
                            <td colspan="8" style="text-align: center;">
                                <vaadin-progress-bar indeterminate></vaadin-progress-bar>
                            </td>
                        </tr>
                    `
            : html`
                        ${this.dataTable.length
                ? this.dataTable.map(road => html`
                                <tr class="road-row"><td colspan="8">${road.roadName}</td></tr>
                                ${road.lightingReports?.map(cabinet => html`
                                    <tr class="cabinet-row"><td colspan="8">${cabinet.cabinetName}</td></tr>
                                    ${cabinet.lightDtos?.map((light, index) => {
                    const statusText =   light.status == 'A'
                                                ? 'Bật'
                                                : light.status == 'I'
                                                        ? 'Tắt'
                                                        : light.status == 'D'
                                                                ? 'Mất kết nối'
                                                                : ''
                    const formattedDate = light.lastTimeActive
                        ? `${light.lastTimeActive.slice(8, 10)}/${light.lastTimeActive.slice(5, 7)}/${light.lastTimeActive.slice(0, 4)} ${light.lastTimeActive.slice(11, 16)}`
                        : '';
                    return html`
                                            <tr>
                                                <td>${index + 1}</td>
                                                <td>${light.lightName}</td>
                                                <td>${light.brightness}</td>
                                                <td>${light.voltage}</td>
                                                <td>${light.amperage}</td>
                                                <td>${light.wattage}</td>
                                                <td>${statusText}</td>
                                                <td>${formattedDate}</td>
                                            </tr>
                                        `;
                })}
                                `)}
                            `)
                : html`<tr><td colspan="8">${i18next.t("NoData")}</td></tr>`}
                    `}
                </tbody>
            </table>
        </div>
    `;
    }

}
