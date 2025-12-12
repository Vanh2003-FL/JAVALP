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
import"@vaadin/card"
import "@vaadin/text-area"
import "@vaadin/button"
import "@vaadin/upload"
import {PageMapConfig} from "../page-map";
import {CenterControl, CoordinatesControl, LngLatLike, OrMap, OrMapLongPressEvent, OrMapMarker} from "@openremote/or-map";
import manager from "@openremote/core";
pdfMake.vfs = pdfFonts.vfs;

@customElement("routes-overview")
export class MyElement extends LitElement {
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    @property()
    public config?: PageMapConfig;
    @state() opened = false
    @state() openedLightOn = false
    @state() openedLightMatketnoi = false
    @state() openedBaotri = false
    @state() openedStop = false
    @state() openedCabinetOn = false
    @state() openedMatKetNoi = false
    @query("#map")
    protected _map?: OrMap;
    private object1 = {
        "asset": {
            "id": "3sDwquxO4H4P9Utkw6J5ql",
            "name": "Consoles",
            "type": "GroupAsset",
            "attributes": {
                "location": {
                    "name": "location",
                    "type": "GEO_JSONPoint",
                    "meta": {},
                    "value": {
                        "coordinates": [
                            105.95494424734329,
                            21.112971210658017
                        ],
                        "type": "Point"
                    },
                    "timestamp": 1742811674472
                }
            }
        },
        "assetInfo": {
            "isControlByCabinet": true,
            "active": true
        }

    }
    @state() file=[
        {
            "name": "BaoCaoCongSuat (1) (1).pdf",
            "size": 18145,
            "type": "PDF",
            "icon": "file-pdf-box",
            "color": "red",
            "uploadTime": "15:14:42 31/3/2025",
            "downloadUrl": "blob:http://localhost:9000/67cd048d-4b8d-4115-a7c3-5bf1c7942893"
        }
    ]
    static styles = css`
        :host {
         display: block;
            box-sizing: border-box;
            height: 100%;
        }
        vaadin-tabs {
            --vaadin-tabs-selected-text-color: green; /* Màu chữ của tab khi chọn */
            --vaadin-tabs-border-color: transparent; /* Ẩn đường viền mặc định */
        }
        vaadin-tab[selected] {
            color: green; /* Màu chữ khi tab được chọn */
            font-weight: bold;
        }
        vaadin-text-area::part(input-field) {
            border-top-left-radius: 10px;
            border-top-right-radius: 10px
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
        h1,h2,h3{
            margin: 0;
            font-size: 16px;
        }

        @mixin tablet-and-up {
            @media screen and (min-width: 769px) { @content; }
        }
        @mixin mobile-and-up {
            @media screen and (min-width: 601px) { @content; }
        }
        @mixin tablet-and-down  {
            @media screen and (max-width: 768px) { @content; }
        }
        @mixin mobile-only {
            @media screen and (max-width: 600px) { @content; }
        }


        ul, li{
            list-style: none;
            padding: 0;
        }
        p{
            color: #4f4f4f;
            font-family: sans-serif;
            line-height: 1.5;
            margin-top:0.4rem;
            @include mobile-only{
                font-size: .9rem;
            }
        }
        vaadin-upload-file {
            display: none !important;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        th, td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #e8ebef;
            text-align: center;
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
    `;
    navigateToDashboard() {
        window.location.hash = '/routes';
    }
    @state() dataLocation:any = []
    @state() dataInfo:any = {}
    @state() createBy:any={}
    @state() listLightOff:any = []
    @state() listLightOn:any = []
    @state() listLightDisconnect :any =[]
    @state() listCabinetStop = []
    @state() listCabinetBaoTri = []
    @state() listCabinetMatKetNoi = []
    @state() listCabinetOn = []
    firstUpdated() {
        // this._map!.center =  [
        //     105.95494424734329,
        //     21.112971210658017
        // ]
        manager.rest.api.RouteInfoResource.getInfoDetail({id:this.infoTable.routeInfo.id,realm:window.sessionStorage.getItem('realm')})
            .then((response) => {
                this.dataInfo = response.data
                const filteredArray = response.data?.cabinetCount?.listAsset?.map(item => ({
                    ...item,
                    asset: {
                        ...item.asset,
                        attributes: {
                            location: item.asset.attributes.location
                        }
                    }
                }));
                this.dataLocation = filteredArray
                this.listLightOff = response.data?.lightCount?.offLightList
                this.listLightDisconnect = response.data?.lightCount?.disconnectLightList
                this.listLightOn = response.data?.lightCount?.onLightList
                const filtered = response.data?.cabinetCount?.listAsset?.filter(item => item.assetInfo.status === 'M');
                const filtered2 = response.data?.cabinetCount?.listAsset?.filter(item => item.assetInfo.status === 'P');
                const filtered3 = response.data?.cabinetCount?.listAsset?.filter(item => item.assetInfo.status === 'D');
                const filtered4 = response.data?.cabinetCount?.listAsset?.filter(item => item.assetInfo.status === 'A');
                this.listCabinetOn = filtered4
                this.listCabinetMatKetNoi  =filtered3
                this.listCabinetBaoTri = filtered
                this.listCabinetStop = filtered2
                console.log('filtered',filtered);
                console.log('filteredArr',filteredArray);

                console.log('roadSetupSearch', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                this.createBy = response.data
                console.log('current',response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    updated(){
        console.log('file',this.file)
    }

    _dialogRendererOff(root: HTMLElement, dialog: any) {
        console.log('this.listLightOff',this.listLightOff)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listLightOff?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset.name}</td>
      <td style="padding: 10px; text-align: left;">
          ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererLightOn(root: HTMLElement, dialog: any) {
        console.log('this.listLightOff',this.listLightOn)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listLightOn?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset.name}</td>
      <td style="padding: 10px; text-align: left;">
          ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererLightDisConnect(root: HTMLElement, dialog: any) {
        console.log('this.listLightOff',this.listLightDisconnect)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên đèn</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listLightDisconnect?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset.name}</td>
      <td style="padding: 10px; text-align: left;">
          ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererStop(root: HTMLElement, dialog: any) {
        console.log('abcde',this.listCabinetStop)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listCabinetStop?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo?.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset?.name}</td>
      <td style="padding: 10px; text-align: left;">
                  ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererCabinetOn(root: HTMLElement, dialog: any) {
        console.log('abcde', this.listCabinetOn)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML =  this.listCabinetOn?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo?.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset?.name}</td>
      <td style="padding: 10px; text-align: left;">
                  ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererBaoTri(root: HTMLElement, dialog: any) {
        console.log('abcde',this.listCabinetBaoTri)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listCabinetBaoTri?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo?.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset.name}</td>
      <td style="padding: 10px; text-align: left;">
                  ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    _dialogRendererMatKetNoi(root: HTMLElement, dialog: any) {
        console.log('abcde',this.listCabinetBaoTri)
        if (!root.firstElementChild) {
            const table = document.createElement('table');

            // Thêm CSS trực tiếp vào bảng
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontFamily = 'Arial, sans-serif';

            table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Mã tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Tên tủ</th>
          <th style="padding: 10px; text-align: left; background-color: #f4f4f4; font-weight: bold; border-bottom: 1px solid #ddd;">Vị trí</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
            root.appendChild(table);
        }

        const tbody = root.querySelector('tbody');
        tbody.innerHTML = this.listCabinetMatKetNoi?.map(item => `
    <tr style="background-color: #fff; border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${item.assetInfo?.assetCode}</td>
      <td style="padding: 10px; text-align: left;">${item.asset.name}</td>
      <td style="padding: 10px; text-align: left;">
                  ${item.asset?.attributes?.location?.value?.coordinates?.[0]?item.asset?.attributes?.location?.value?.coordinates?.[0] + "-" +item.asset?.attributes?.location?.value?.coordinates?.[1]:""}
      </td>
    </tr>
  `).join('');
    }
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    async reloadBUIE() {
        console.log('thâ',this.infoTable?.routeInfo?.id)
        try {
            const response = await manager.rest.api.AssetResource.reloadBUIE(this.infoTable?.routeInfo?.id);
        } catch (e) {
            console.log('call Faile')
        }
    }
    render() {
        const responsiveSteps: any = [
            // Use one column by default
            { minWidth: 0, columns: 1 },
            // Use two columns, if layout's width exceeds 500px
            { minWidth: '500px', columns: 2 },
        ];
        const responsiveSteps2: any = [
            // Use one column by default
            { minWidth: 0, columns: 1 },
            // Use two columns, if layout's width exceeds 500px
            { minWidth: '100px', columns:4  },
        ];

        console.log('infoTable',this.infoTable)
        return html`
            <vaadin-dialog
                    theme="fullscreen"
                    .opened="${this.opened}"
                    @opened-changed="${(e) => (this.opened = e.detail.value)}"
                    .renderer="${(root, dialog) => this._dialogRendererOff(root, dialog)}"
            ></vaadin-dialog>
            <vaadin-dialog
                    theme="fullscreen"
                    .opened="${this.openedLightOn}"
                    @opened-changed="${(e) => (this.openedLightOn = e.detail.value)}"
                    .renderer="${(root, dialog) => this._dialogRendererLightOn(root, dialog)}"
            ></vaadin-dialog>
            <vaadin-dialog
                    theme="fullscreen"
                    .opened="${this.openedLightMatketnoi}"
                    @opened-changed="${(e) => (this.openedLightMatketnoi = e.detail.value)}"
                    .renderer="${(root, dialog) => this._dialogRendererLightDisConnect(root, dialog)}"
            ></vaadin-dialog>
            <vaadin-horizontal-layout style="display: flex;flex-direction: column; width: 100%;height: 100%">
                    <div style="flex : 3;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;padding: 0px;background: white">
                       <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                           <div>
                               <div style="display: flex;justify-content: space-between">
                                   <h2 style="margin-left: 10px;font-size:24px">${new Date().toLocaleDateString('vi-VN', {
                                       weekday: 'long',
                                       day: '2-digit',
                                       month: '2-digit',
                                       year: 'numeric'
                                   }).replace(',', '')}</h2>
                                   <or-icon class="beauty-button" icon="refresh" style="color:green;cursor: pointer" @click="${this.reloadBUIE}"></or-icon>
                               </div>
                               <vaadin-form-layout .responsiveSteps="${responsiveSteps2}" style="margin-left: 10px">
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <p style="color: #4D9D2A">${this.dataInfo?.lightCount?.total}</p>
                                       <p>Tổng số đèn</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color: #4D9D2A">${this.dataInfo?.lightCount?.onLight}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedLightOn = true)}"></or-icon>
                                       </div>
                                       <p>Bật</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color:#FF0909">${this.dataInfo?.lightCount?.offLight}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.opened = true)}"></or-icon>
                                       </div>
                                       <p>Tắt</p>
                                       
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color:#FF0909">${this.dataInfo?.lightCount?.disconnectLight}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedLightMatketnoi = true)}"></or-icon>
                                       </div>
                                       <p>Mất kết nối</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <p style="color: #4D9D2A">${this.dataInfo?.cabinetCount?.total}</p>
                                       
                                       <p>Tổng số tủ điện</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                        <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                            <p style="color: #4D9D2A">${this.dataInfo?.cabinetCount?.active}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedCabinetOn = true)}"></or-icon>
                                           <vaadin-dialog
                                                   theme="fullscreen"
                                                   .opened="${this.openedCabinetOn}"
                                                   @opened-changed="${(e) => (this.openedCabinetOn = e.detail.value)}"
                                                   .renderer="${(root, dialog) => this._dialogRendererCabinetOn(root, dialog)}"
                                           ></vaadin-dialog>
                                       </div>
                                       <p>Hoạt động</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color:#FF0909">${this.dataInfo?.cabinetCount?.pending}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedStop = true)}"></or-icon>
                                           <vaadin-dialog
                                                   theme="fullscreen"
                                                   .opened="${this.openedStop}"
                                                   @opened-changed="${(e) => (this.openedStop = e.detail.value)}"
                                                   .renderer="${(root, dialog) => this._dialogRendererStop(root, dialog)}"
                                           ></vaadin-dialog>
                                       </div>
                                       <p>Tạm dừng</p>
                                   </div>
                                   <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color:#FF0909">${this.dataInfo?.cabinetCount?.maintenance}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedBaotri = true)}"></or-icon>
                                           <vaadin-dialog
                                                   theme="fullscreen"
                                                   .opened="${this.openedBaotri}"
                                                   @opened-changed="${(e) => (this.openedBaotri = e.detail.value)}"
                                                   .renderer="${(root, dialog) => this._dialogRendererBaoTri(root, dialog)}"
                                           ></vaadin-dialog>
                                       </div>
                                       <p>Bảo trì</p>
                                   </div>
                                    <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 10px;margin-top: 10px">
                                       <div style="display: flex;justify-content: space-between;width: 100%">
                                           <p style="visibility: hidden">20</p>
                                           <p style="color:#FF0909">${this.dataInfo?.cabinetCount?.disconnect}</p>
                                           <or-icon icon="eye" style="cursor: pointer;margin:5px 5px 0 0"  @click="${() => (this.openedMatKetNoi = true)}"></or-icon>
                                           <vaadin-dialog
                                                   theme="fullscreen"
                                                   .opened="${this.openedMatKetNoi}"
                                                   @opened-changed="${(e) => (this.openedMatKetNoi = e.detail.value)}"
                                                   .renderer="${(root, dialog) => this._dialogRendererMatKetNoi(root, dialog)}"
                                           ></vaadin-dialog>
                                       </div>
                                       <p>Mất kết nối</p>
                                   </div>
                               </vaadin-form-layout>
                           </div>
                            <div style="margin: 10px">
                                <div style="padding: 20px">
                                    <h1 style="font-size: 24px">Thông tin chung</h1>
                                    <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Tên lộ/Tuyến</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.dataInfo?.routeInfo?.routeName}</h3>
                                        </div>
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Mã lộ/tuyến</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.dataInfo?.routeInfo?.routeCode}</h3>
                                        </div>
<!--                                        <div>-->
<!--                                            <h2 style="margin: 0;font-size: 20px;font-weight: 100">Ưu tiên</h2>-->
<!--                                            <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Cao</h3>-->
<!--                                        </div>-->
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Người tạo</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.createBy?.username}</h3>
                                        </div>
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Ngày tạo</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.formatDate(this.dataInfo?.routeInfo?.createDate)}</h3>
                                        </div>
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Người cập nhật</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.dataInfo?.routeInfo?.updateBy}</h3>
                                        </div>
                                       
                                        <div style="margin: 8px">
                                            <h2 style="margin: 0;font-size: 16px;font-weight: 100">Ngày cập nhật</h2>
                                            <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.formatDate(this.dataInfo?.routeInfo?.updateDate)}</h3>
                                        </div>
                                    </vaadin-form-layout>
                                    <h2 style="margin: 0;font-size: 16px;font-weight: 100">Mô tả</h2>
                                    <h3 style="margin: 0;;font-size: 16px;font-weight: 600">${this.dataInfo?.routeInfo?.description}</h3>
                                </div>
                            </div>
                        </vaadin-form-layout>
                    
                    </div>
                    <div style="flex : 1 1 auto">
                        <or-map id="map" class="or-map" style="width: 100%; height: 100px !important;" zoom="7">
                            ${this.dataLocation?.map(
                                    (asset) => html`
          <or-map-marker-asset
            .asset=${asset}
            .config=${this.config?.markers}>
          </or-map-marker-asset>
        `
                            )}
                        </or-map>
                    </div>
            </vaadin-horizontal-layout>
        `;
    }
}
