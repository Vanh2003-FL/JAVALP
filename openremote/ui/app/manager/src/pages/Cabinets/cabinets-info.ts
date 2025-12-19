import {LitElement, html, css} from "lit";
import {customElement, property, state,query} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
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
import "@vaadin/dialog"
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from 'chart.js';
import manager from "@openremote/core";
import { OrMap } from "@openremote/or-map";

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend, PieController,
    ArcElement,);
pdfMake.vfs = pdfFonts.vfs;

@customElement("cabinet-info")
export class MyElement extends LitElement {
    @property() infoTable : any = JSON.parse(localStorage.getItem('selectedRowInfoCabinet'));
    @query("#map")
    protected _map?: OrMap;
    @state() opened = false
    @state() lightAssetDTOList : any = []
    @state() items = [
        { id: 1, cabinetCode: 'Mã tủ 1', cabinetName: 'Tên tủ 1', type: 'Tủ', location: 'Hà Nội', status: 'Hoạt động', action: 'Edit' },
        { id: 2, cabinetCode: 'Mã tủ 2', cabinetName: 'Tên tủ 2', type: 'Tủ', location: 'Thanh Hóa', status: 'Hoạt động', action: 'Edit' },
    ];
    static styles = css`
        :host {
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #e8ebef;
            color: #5d6a79;
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
            border-radius: 4px;
            color: #666;
            border: 1px solid #ddd;
        }

        .pagination a.active {
            background-color: #4CAF50;
            color: white;
            border: 1px solid #4CAF50;
        }

        .pagination a:hover {
            background-color: #f1f1f1;
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
        vaadin-dialog::part(overlay) {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            padding: 0;
        }

        vaadin-dialog-overlay {
            width: 100vw !important;
            height: 100vh !important;
        }

    `;

    navigateToDashboard() {
        window.location.hash = '/cabinets';
    }

    private responsiveSteps: any = [
        // Use one column by default
        {minWidth: 0, columns: 1},
        // Use two columns, if layout's width exceeds 500px
        {minWidth: '500px', columns: 2},
    ];
    @state() chartSave = null
    renderChart() {
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", {willReadFrequently: true});
        if (!ctx) return;
        if (this.chartSave) {
            this.chartSave.destroy();
        }
        this.chartSave = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
                datasets: [{
                    label: 'Pha 1',
                    data: [100, 200, 150, 300],
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                    {
                        label: 'Pha 2',
                        data: [120, 100, 110, 600],
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        display: false // <<< Chặn vẽ số trên biểu đồ
                    },
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ điện áp hiện tại'
                    },
                }
            }
        });

    }
    formatDateArray(timestamps, separator = '/') {
        return timestamps.map(ts => {
            const date = new Date(ts);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
            const year = date.getFullYear();
            return `${day}${separator}${month}${separator}${year}`;
        });
    }
    formatTimeArray(timestamps) {
        if (!Array.isArray(timestamps)) return [];

        return timestamps.map(ts => {
            const date = new Date(ts);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        });
    }
    firstUpdated() {
        const formLayout = this.shadowRoot.querySelector('.my-layout');

        if (formLayout && formLayout.shadowRoot) {
            const style = document.createElement('style');
            style.textContent = `
      #layout {
     align-items: inherit
      }
    `;
            // Chèn CSS vào shadowRoot của `vaadin-form-layout`
            formLayout.shadowRoot.appendChild(style);
        }
        console.log('this.infoTable.cabinetAsset.id',this.infoTable)
        manager.rest.api.CabinetResource.getLightsBelongToCabinet(window.sessionStorage.getItem('realm'),{},{assetId:this.infoTable.cabinetAsset.id})
            .then((response) => {
                this.lightAssetDTOList = response.data
                console.log('this.infoTable.cabinetAsset.id', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.AssetDatapointResource.getAssetDatapoints(this.infoTable.cabinetAsset.id)
            .then((response) => {
                const distinctColors = ['#FF6384', '#36A2EB', '#FFCE56'];
                const translateLabel = (label) => {
                    if (label.includes("voltagePhase1")) return "Pha 1";
                    if (label.includes("voltagePhase2")) return "Pha 2";
                    if (label.includes("voltagePhase3")) return "Pha 3";
                    return label; // giữ nguyên nếu không khớp
                };
                const formattedData = response.data.datasets.map((item,index) => ({
                    label: translateLabel(item.label),
                    data: item.data,
                    borderColor:distinctColors[index % distinctColors.length],
                }));
                const fakeDataChart1 = {
                    labels: this.formatTimeArray(response.data.labels),
                    datasets:formattedData
                };
                this.chartSave.data.labels = fakeDataChart1.labels;
                this.chartSave.data.datasets = fakeDataChart1.datasets;
                this.chartSave.update()
                console.log('responseDataPoint',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.renderChart();
        const coords = this.infoTable?.cabinetAsset?.attributes?.location?.value?.coordinates;
        console.log('coordinates in firstUpdated:', coords);
        if (coords?.length === 2) {
            this.selectedLat = coords[1];
            this.selectedLng = coords[0];
            console.log('Lat/Lng updated in firstUpdated:', this.selectedLat, this.selectedLng);
        }
    }
    _dialogRenderer(root, dialog) {
        root.innerHTML = `
       <div style="display: flex; width: 80vw; height: 80vh; background: white;">
    <or-map></or-map>
      </div>
    `;
    }
    formatNumber(value: any) {
        if (value == null || isNaN(value)) return '0';
        return value.toLocaleString('vi-VN');
    }
    @state()
    selectedLat?: number =this.infoTable?.cabinetAsset?.attributes?.location?.value?.coordinates[1] ;

    @state()
    selectedLng?: number =this.infoTable?.cabinetAsset?.attributes?.location?.value?.coordinates[0] ;
    render() {
        console.log('abca',this.infoTable)
        return html`
            <div style="height: calc(100vh - 167px)">
                <div class="back-link" @click="${this.navigateToDashboard}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </div>
                <div  style="${this.infoTable.assetInfo.status == 'A'
                        ? 'padding:10px;background: #4d9d2a;color: white'
                        : this.infoTable.assetInfo.status == 'M'
                                ? 'padding:10px;background: #d48806;color: white'
                                : this.infoTable.assetInfo.status == 'P'
                                        ? 'padding:10px;background: red;color: white'
                                        : this.infoTable.assetInfo.status == 'D'
                                                ? 'padding:10px;background: red;color: white'
                                                : ''}">
                    <h3 style="margin: 0;color: white">${this.infoTable.cabinetAsset.name}</h3>
                    <h2 style="margin: 0;color: white">${this.infoTable.assetInfo.assetCode}</h2>
                </div>
                 <vaadin-tabsheet style="height: 100%">
                <vaadin-tabs slot="tabs" style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                    <vaadin-tab id="overview-tab">Thông tin</vaadin-tab>
                </vaadin-tabs>
                <div tab="overview-tab" style="height: 100vh">
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="background: white;height:100vh" class="my-layout">
                        <div>
                            <div colspan="1">
                                <lable style="margin:10px 0px"><b>Danh sách đèn kết nối</b></lable>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã đèn</th>
                                        <th>Tên đèn</th>
                                        <th>Loại đèn</th>
                                        <th>Công suất(W)</th>
<!--                                        <th>Giờ chiếu sáng</th>-->
                                        <th>Trạng thái</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    ${ this.lightAssetDTOList.map((item,index) => html`
                                        <tr>
                                            <td>${index+1}</td>
                                            <td>${item.assetCode}</td>
                                            <td>${item.assetName}</td>
                                            <td>${item.lampTypeName}</td>
                                            <td>${this.formatNumber(item?.asset?.attributes?.wattage?.value)}</td>
                                           
                                            <td>
                                             <span
                                                     style="${
                                                             item.status === 'A'
                                                                     ? 'color: green;font-size:16px'
                                                                     : item.status === 'I'
                                                                             ? 'color: red;font-size:16px'
                                                                             : item.status === 'D'
                                                                                     ? 'color: red;font-size:16px'
                                                                                     : ''
                                                     }"
                                             > 
                                                            ${item.status == 'A'
                                                                    ? 'Bật'
                                                                    : item.status == 'I'
                                                                            ? 'Tắt'
                                                                            : item.status == 'D'
                                                                                    ? 'Mất kết nối'
                                                                                    : ''}
                                                        </span></td>
                                        </tr>
                                `)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                                <div>
                                    <p style="margin:10px 0px"><b>Vị trí</b></p>
                                    <or-map
                                            id="map"
                                            style="height: 100px; width: 100%;"
                                            .center=${this.selectedLat && this.selectedLng ? [this.selectedLng, this.selectedLat] : undefined}
                                            .zoom=${15} <!-- Đặt mức thu phóng mặc định -->
                                    >
                                    ${this.selectedLat && this.selectedLng
                                            ? html`
              <or-map-marker
                .lat=${this.selectedLat}
                .lng=${this.selectedLng}
                icon="file-cabinet"
                active
                activeColor="#007bff"
              ></or-map-marker>
            `
                                            : html`<p>Không có tọa độ để hiển thị</p>`}
                                    </or-map>
                                    <canvas id="myChart" style="height: 300px !important;"></canvas>
                                </div>
                        </div>
                    </vaadin-form-layout>
                </div>
            </vaadin-tabsheet>
            </div>
        `;
    }
}
