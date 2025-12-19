import {LitElement, html, css} from "lit";
import {customElement, property, state, query} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import manager from "@openremote/core";
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
import "@vaadin/text-area"
import "@vaadin/button"
import "@vaadin/upload"
import '@vaadin/text-field';
import '@vaadin/password-field';
import '@vaadin/date-picker';
import '@vaadin/text-area';
import "@vaadin/notification"
import "@vaadin/upload"
import * as XLSX from "xlsx"
import {
    CenterControl,
    CoordinatesControl,
    LngLatLike,
    OrMap,
    OrMapLongPressEvent,
    OrMapMarker
} from "@openremote/or-map";
import {i18next} from "@openremote/or-translate";


pdfMake.vfs = pdfFonts.vfs;

@customElement("cabinets-edit")
export class MyElement extends LitElement {
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRowEditCabinet'));
    @state() file = []
    @state() today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    @query("#map")
    protected _map?: OrMap;
    @state() dataSaveQuan = []
    @state() dataSaveXa = []
    @state() modelAsset = this.infoTable?.assetInfo?.assetModel
    handleModelAsset(event){
        this.modelAsset = event.target.value
    }
    @state() rows: any = [
        {
            idTang: 1,
            id: '',
            nemaCode: '',
            powerConsumption: '',
            lightingTime: '',
            status: '',
            isDefault: true,
            namefile: ""
        }
    ]
    @state() rowsBackup = [
        {
            idTang: 1,
            id: '',
            nemaCode: '',
            powerConsumption: '',
            lightingTime: '',
            status: '',
            isDefault: true,
            namefile: ""
        }
    ]
    @state() index = 2
    @state() nameRoute = this.infoTable.cabinetAsset.name
    @state() codeRoute = this.infoTable.assetInfo.assetCode
    @state() nameDiaChi = ""
    @state() status =
        this.infoTable.assetInfo.status == 'A'
            ? 'A'
            : this.infoTable.assetInfo.status == 'M'
                ? 'M'
                : 'P'
    @state() description = ""
    @state() selectedDate
    @state() itemTinh = []
    @state() createBy = ""
    @state() itemQuan = []
    @state() itemDuong = []
    @state() selectedTinh
    @state() selectedQuan
    @state() selectedDuong
    @state() itemsStatus = [
        {id: "A", name: 'Hoạt động'},
        {id: "M", name: 'Bảo trì'},
        {id: "P", name: 'Dừng hoạt động'}
    ];
    @state() itemsType = [
        {id: "LightAsset", name: 'Đèn'},
        {id: "ElectricalCabinetAsset", name: 'Tủ'},
    ];
    @state() isDisabledQuan = true
    @state() isDisabledXa = true
    @state() listLight = []
    static styles = css`
        :host {

        }

        vaadin-upload-file {
            display: none !important;
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

        .success {
            --vaadin-notification-background: #28a745; /* Xanh lá */
            --vaadin-notification-text-color: white;
        }

        .error {
            --vaadin-notification-background: #dc3545; /* Đỏ */
            --vaadin-notification-text-color: white;
        }

        .required::part(label)::after {
            content: '*';
            color: red;
        }

        /* Ẩn icon chấm tròn mặc định nếu có */

        .required::part(required-indicator) {
            display: none;
        }
    `;

    navigateToDashboard() {
        window.location.hash = '/cabinets';
    }
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
    private responsiveSteps: any = [
        // Use one column by default
        {minWidth: 0, columns: 1},
        // Use two columns, if layout's width exceeds 500px
        {minWidth: '500px', columns: 2},
    ];

    addRow() {
        this.rows = [...this.rows, {
            idTang: this.index++,
            id: '',
            nemaCode: '',
            powerConsumption: '',
            lightingTime: '',
            status: '',
            isDefault: false,
            namefile: ""
        }];

        this.requestUpdate();
    }

    removeRow(id) {
        const rowToRemove = this.rows.find(row => row.idTang === id);

        if (rowToRemove && rowToRemove.status === 'A') {
            this.showCustomNotification("Đèn ở trạng thái bật không được xóa")
            return;
        }
        this.rows = this.rows.filter(row => row.idTang !== id || row.isDefault);

        // Cập nhật lại ID cho hàng còn lại
        this.rows = this.rows.map((row, index) => ({...row, idTang: index + 1}));

        this.index = this.rows.length + 1; // Cập nhật lại chỉ số cho hàng tiếp theo
        this.requestUpdate();
    }

    updateRow(id, field, value) {
        this.rows = this.rows.map(row =>
            row.idTang === id ? {...row, [field]: value} : row
        );
        this.requestUpdate();
        console.log('this', this.rows)
    }

    handleLo(event) {
        const max = 250;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.nameRoute = event.target.value
    }

    handleDiaChiChiTiet(event) {
        this.nameDiaChi = event.target.value
    }

    handleMaLo(event) {
        const input = event.target;
        // Chỉ giữ lại ký tự từ a-z, A-Z, 0-9, không dấu, không space
        input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
        const max = 30;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.codeRoute = event.target.value
    }

    handleChangeStatus(event) {
        this.status = event.target.value
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;
        console.log("Ngày đã chọn:", this.selectedDate);
    }

    handleChangeTinh(event) {
        this.selectedTinh = event.target.value
        console.log('event.target.value', event.target.value)
        if (event.target.value) {
            this.isDisabledQuan = false
            manager.rest.api.DistrictResource.getData({data: {provinceId: event.target.value}})
                .then((response) => {
                    this.itemQuan = response.data
                    console.log('itemQuan', response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        } else {
            this.isDisabledQuan = true
        }
        console.log('value', event.target.value)
    }

    handleChangeQuan(event) {
        this.selectedQuan = event.target.value
        if (event.target.value) {
            this.isDisabledXa = false
            manager.rest.api.WardResource.getAll({data: {districtId: event.target.value}})
                .then((response) => {
                    this.itemDuong = response.data
                    console.log('itemQuan', response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        } else {
            this.isDisabledXa = true
        }
    }

    handleChangeDuong(event) {
        this.selectedDuong = event.target.value
    }

    handleDescription(event) {
        this.description = event.target.value
    }

    @state() dataRoute = []
    @state() getRealm
    @state() creatByName
    @state() lightAssetDTOList

    async fetchApi() {
        manager.rest.api.ProvinceResource.getAll({})
            .then((response) => {
                this.itemTinh = response.data
                console.log('province', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.CabinetResource.getLightsBelongToCabinet(window.sessionStorage.getItem('realm'),{},{assetId:this.infoTable.cabinetAsset.id})
            .then((response) => {
                this.lightAssetDTOList = response.data
                if (this.lightAssetDTOList?.length !== 0) {
                    const result = this.lightAssetDTOList?.map((item, index) => {
                        return {
                            ...item,
                            idTang: index + 1,
                            id: item.id,
                            nemaCode: item.lampTypeId,
                            powerConsumption: item.powerConsumption,
                            lightingTime: item.lightingTime,
                            status: item.status,
                            isDefault: false
                        };
                    });
                    const rowBackup = this.rowsBackup?.map((item: any, index) => ({
                        ...item,
                        idTang: index + 1, // bắt đầu từ 1
                        id: item.id,
                        nemaCode: item.lampTypeId,
                        powerConsumption: item.powerConsumption,
                        lightingTime: item.lightingTime,
                        status: item.status,
                        isDefault: false
                    }));
                    this.rows = this.lightAssetDTOList?.length === 0 || this.lightAssetDTOList === undefined ? rowBackup : result
                }
                if (this.lightAssetDTOList?.length === 0 || this.lightAssetDTOList === undefined || this.lightAssetDTOList?.length === 1) {
                    this.index++
                } else {
                    this.index = this.lightAssetDTOList?.length + 1
                }
                console.log('this.infoTable.cabinetAsset.id', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        // manager.rest.api.UserResource.getCurrent()
        //     .then((response) => {
        //         this.createBy = response.data?.id
        //         this.getRealm = response.data.realm
        //         this.creatByName = response.data?.username
        //         console.log('current', response)
        //     })
        //     .catch((error) => {
        //         console.error('Lỗi khi lấy dữ liệu:', error);
        //     });
        this.getRealm = window.sessionStorage.getItem('realm')
        manager.rest.api.RouteInfoResource.getAll({data: {realm: window.sessionStorage.getItem('realm')}})
            .then((response) => {
                const routeInfoList = response.data.map(item => item.routeInfo);
                console.log('routeInfoList', routeInfoList)
                this.dataRoute = routeInfoList
                console.log('getAlldataRoute', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.LampTypeResource.getAll({})
            .then((response) => {
                console.log('getAllCabinet', response)
                this.listTypeLight = response.data
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });

        // this.listTypeLight = this.infoTable.lightAssetDTOList
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('session-changed', this._onSessionChanged);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }

    _onSessionChanged = (e: CustomEvent) => {
        const {key, value} = e.detail;
        if (key === 'realm') {
            manager.rest.api.RouteInfoResource.getAll({data: {realm: value}})
                .then((response) => {
                    const routeInfoList = response.data.map(item => item.routeInfo);
                    console.log('routeInfoList', routeInfoList)
                    this.dataRoute = routeInfoList
                    console.log('getAlldataRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
    }

    firstUpdated() {
        this.fetchApi()
        console.log('status', this.status)
    }

    @state() dataOverview = {}
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
        toast.style.color = 'black';
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
    handleSave() {
        const objectPush: any = {
            cabinetAsset: {
                id: this.infoTable.cabinetAsset.id,
                name: this.nameRoute,
                path: this.infoTable.cabinetAsset.path,
                type: "ElectricalCabinetAsset",
                realm: this.getRealm,
                attributes: {
                    ...this.infoTable.cabinetAsset.attributes,
                    location: {
                        name: "location",
                        type: "GEO_JSONPoint",
                        meta: {},
                        value: {
                            coordinates: [
                                this.selectedLng,
                                this.selectedLat
                            ],
                            type: "Point"
                        },
                        timestamp: Date.now()
                    }
                }
            },
            assetInfo: {
                id: this.infoTable.cabinetAsset.id,
                assetCode: this.codeRoute,
                createBy: this.creatByName,
                status: this.status,
                assetModel:this.modelAsset
            },
            routeInfo: {
                id: this.valueLoTuyen
            }
        }
        console.log('objectPush', objectPush)
        const requiredFields: any = this.shadowRoot?.querySelectorAll('.required-field') || [];

        let isAllValid = true;

        requiredFields.forEach((field: any) => {
            const isValid = field.validate();
            if (!isValid) {
                isAllValid = false;
                console.log(`❌ Trường "${field.label}" không hợp lệ.`);
            }
        });
        if (requiredFields) {
            // const isValid = comboBox.validate(); // Kiểm tra required
            if (!isAllValid) {
                console.log('Vui lòng chọn Tên tủ');
            } else {
                manager.rest.api.AssetResource.createCabinetAsset(objectPush)
                    .then((response: any) => {
                        console.log('roadSetupSearch', response)
                        if (response.data?.errorMessage) {
                            const notification = this.shadowRoot!.getElementById('myNotification3') as any;

                            notification.renderer = (root: HTMLElement) => {
                                root.innerHTML = ''; // Xóa nội dung cũ
                                const text = document.createElement('div');
                                text.textContent = response.data?.errorMessage;
                                root.appendChild(text);
                            };
                            notification.open();
                        } else {
                            const notification = this.shadowRoot!.getElementById('myNotification') as any;

                            notification.renderer = (root: HTMLElement) => {
                                root.innerHTML = ''; // Xóa nội dung cũ
                                const text = document.createElement('div');
                                text.textContent = 'Cập nhật tủ điện thành công!';
                                root.appendChild(text);
                            };
                            notification.open();
                            window.dispatchEvent(new CustomEvent('data-updated'));
                            setTimeout(() => {
                                this.navigateToDashboard();
                            }, 2000);
                        }


                    })
                    .catch((error) => {
                        if (error?.response?.status === 403) {
                            this.showWarningNotification("Bạn không có quyền sửa")
                        } else {
                            console.error('Lỗi khi gửi request:', error.message);
                        }
                    });
                console.log('abcd', objectPush)
            }
        }
    }

    handleSaveInfoDevice() {
        const cleanedList = this.rows.map(({
                                               idTang,
                                               namefile,
                                               isDefault,
                                               luminousFlux,
                                               assetName,
                                               lampTypeName,
                                               ...rest
                                           }) => rest);
        const objectPush: any = {
            cabinetAsset: {
                id: this.infoTable.cabinetAsset.id,
                type: "ElectricalCabinetAsset"
            },
            assetInfo: {
                id: this.infoTable.cabinetAsset.id,
                assetCode: this.codeRoute,
                createBy: this.creatByName,
                status: this.status,
                assetModel:this.modelAsset
            },
            lightAssetDTOList: cleanedList
        }
        console.log('objectPush', objectPush)
        const comboBox = this.shadowRoot?.querySelector('#nameRoute') as any; // Ép kiểu để truy cập validate()
        if (comboBox) {
            const isValid = comboBox.validate(); // Kiểm tra required
            if (!isValid) {
                const notification = this.shadowRoot!.getElementById('myNotification2') as any;
                notification.renderer = (root: HTMLElement) => {
                    root.innerHTML = ''; // Xóa nội dung cũ
                    const text = document.createElement('div');
                    text.textContent = 'Cần điền dữ liệu trong tab thông tin cơ bản trước!';
                    root.appendChild(text);
                };
                notification.open();
                setTimeout(() => {
                    this.selectedIndex = 0;
                }, 2000);

            } else {
                const firstRow = this.rows[0];

                if (!firstRow?.id) {
                    const notification = this.shadowRoot!.getElementById('myNotification3') as any;

                    notification.renderer = (root: HTMLElement) => {
                        root.innerHTML = ''; // Xóa nội dung cũ
                        const text = document.createElement('div');
                        text.textContent = "Thêm mới không thành công";
                        root.appendChild(text);
                    };
                    notification.open();
                } else {
                    manager.rest.api.CabinetResource.createCabinetAssetExtend(objectPush)
                        .then((response) => {
                            console.log('roadSetupSearch', response)
                            const notification = this.shadowRoot!.getElementById('myNotification') as any;

                            notification.renderer = (root: HTMLElement) => {
                                root.innerHTML = ''; // Xóa nội dung cũ
                                const text = document.createElement('div');
                                text.textContent = 'Sửa tủ điện thành công!';
                                root.appendChild(text);
                            };
                            notification.open();
                            window.dispatchEvent(new CustomEvent('data-updated'));
                            setTimeout(() => {
                                this.navigateToDashboard();
                            }, 2000);
                        })
                        .catch((error) => {
                            if (error?.response?.status === 403) {
                                this.showWarningNotification("Bạn không có quyền sửa")
                            } else {
                                console.error('Lỗi khi gửi request:', error.message);
                            }
                        });
                }

            }
        }

        console.log('objectPush', objectPush)
    }

    @state() listTypeNema = []

    handleLoai(event: any, idrow: any) {
        console.log('valueLoai', event.target.value)
        const selectName = event.target.value;
        if (event.target.value) {
            manager.rest.api.CabinetResource.getLightsBelongToCabinet(window.sessionStorage.getItem('realm'), {id: selectName})
                .then((response) => {
                    console.log('response',response.data)
                    this.listTypeNema = response.data
                    this.rows = this.rows.map(row =>
                        row.idTang === idrow
                            ? {
                                ...row,
                                nemaCode: selectName,
                                // id: undefined,
                                // powerConsumption: undefined,
                                // lightingTime: undefined,
                                // status: undefined,
                                // isDefault: false
                            }
                            : row
                    );
                    console.log('getAllCabinet2', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        // else{
        //     this.rows = this.rows.map(row =>
        //         row.idTang === idrow
        //             ? {
        //                 ...row,
        //                 // Giữ nguyên idTang
        //                 nemaCode:undefined,
        //                 id: undefined,
        //                 powerConsumption: undefined,
        //                 lightingTime: undefined,
        //                 status: undefined,
        //                 isDefault: false
        //             }
        //             : row
        //     );
        // }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    updated() {
        console.log('this.roww', this.rows)
    }

    handleName(event: any, idrow: any) {
        console.log('valueName', event.target.value)
        const selectName = event.target.value;
        // const currentRow = this.rows.find(row => row.idTang === idrow);
        if(event.target.value){
            // Kiểm tra assetId đã tồn tại ở dòng khác chưa
            const isDuplicate = this.rows.some(row => row.id === selectName && row.idTang !== idrow);

            if (isDuplicate) {
                const notification = this.shadowRoot!.getElementById('myNotification2') as any;
                if(event.target.value){
                    notification.renderer = (root: HTMLElement) => {
                        // console.log('currentRow?.type',currentRow?.type)
                        root.innerHTML = ''; // Xóa nội dung cũ
                        const text = document.createElement('div');
                        text.textContent = 'Loại đèn này đã gán vào tủ điện!';
                        root.appendChild(text);
                    };
                    notification.open();
                }

                // Reset lại assetId nếu trùng
                this.rows = this.rows.map(row =>
                    row.idTang === idrow
                        ? { ...row, id: '' }
                        : row
                );

                return;
            }
            if (this.listTypeNema.length !== 0) {
                const filter = this.listTypeNema.filter((item) => item.id = selectName)
                console.log('selectName',selectName)
                const selectedType = filter[0];
                console.log('row2', this.listTypeNema)
                this.rows = this.rows.map(row =>
                    row.idTang === idrow
                        ? {
                            ...row,
                            // Giữ nguyên idTang
                            id: selectName,
                            powerConsumption: selectedType?.powerConsumption,
                            lightingTime: selectedType?.lightingTime,
                            status: selectedType?.status,
                            isDefault: false
                        }
                        : row
                );
            }
        }
    }

    @state() private selectedIndex = 0;

    private handleTabChange(e: CustomEvent) {
        this.selectedIndex = (e.target as any).selected;
        console.log('Đã chọn tab:', (e.target as any).selected);
    }

    // handleExcelImport(event: any) {
    //     console.log('File input event triggered:', event);
    //     const file = event.target.files[0];
    //     if (!file) {
    //         console.warn('No file selected');
    //         return;
    //     }
    //
    //     console.log('Selected file:', file.name, file.type);
    //     const validTypes = [
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //         'application/vnd.ms-excel'
    //     ];
    //     if (!validTypes.includes(file.type)) {
    //         console.warn('Invalid file type:', file.type);
    //         return;
    //     }
    //
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         try {
    //             console.log('FileReader onload triggered');
    //             const data = new Uint8Array(e.target!.result as ArrayBuffer);
    //             const workbook = XLSX.read(data, { type: 'array' });
    //             console.log('Workbook sheets:', workbook.SheetNames);
    //             const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    //             const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
    //             console.log('Parsed JSON data:', jsonData);
    //
    //             // Map Excel data to rows with minimal validation
    //             const newRows = jsonData.map((item: any) => {
    //                 const type = item.type || '';
    //                 const status = item.status || '';
    //                 console.log('Processing row:', item);
    //                 return {
    //                     id: this.index++,
    //                     type: type,
    //                     assetId: item.assetId || '',
    //                     status: status,
    //                     activeDate: item.activeDate || '',
    //                     deactiveDate: item.deactiveDate || '',
    //                     updateDate: item.updateDate || undefined,
    //                     updateBy: item.updateBy || '',
    //                     isDefault: false,
    //                     namefile: ''
    //                 };
    //             });
    //
    //             console.log('New rows to add:', newRows);
    //             if (newRows.length === 0) {
    //                 console.warn('No rows parsed from file');
    //                 return;
    //             }
    //
    //             // Append new rows
    //             this.rows = [...this.rows, ...newRows];
    //             console.log('Updated rows:', this.rows);
    //             this.requestUpdate();
    //
    //             // Reset input
    //             event.target.value = '';
    //         } catch (error) {
    //             console.error('Error parsing Excel file:', error);
    //         }
    //     };
    //     reader.readAsArrayBuffer(file);
    // }
    @state() valueLoTuyen = this.infoTable?.routeInfo?.id

    handleChangeLoTuyen(event) {
        if (event.target.value) {
            this.valueLoTuyen = event.target.value
        } else {
            this.valueLoTuyen = undefined
        }
    }

    @state()
    selectedLat?: number = this.infoTable?.cabinetAsset?.attributes?.location?.value?.coordinates[1];

    @state()
    selectedLng?: number = this.infoTable?.cabinetAsset?.attributes?.location?.value?.coordinates[0];

    handleMapLongPress(e: CustomEvent) {
        const lngLat: any = e.detail.lngLat;
        this.selectedLat = lngLat.lat;
        this.selectedLng = lngLat.lng;
    }

    @state() listTypeLight = []

    render() {
        console.log('infoTable', this.infoTable)
        return html`
            <vaadin-notification id="myNotification3" duration="3000" position="bottom-end"
                                 theme="error"></vaadin-notification>
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end"
                                 theme="success"></vaadin-notification>
            <vaadin-notification id="myNotification2" duration="3000" position="bottom-end"
                                 theme="warning"></vaadin-notification>
            <vaadin-tabsheet>
                <vaadin-tabs slot="tabs"
                             .selected=${this.selectedIndex}
                             @selected-changed=${this.handleTabChange}
                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                    <vaadin-tab id="overview-tab">Thông tin cơ bản</vaadin-tab>
                    <vaadin-tab id="profiles-tab">Thông tin đèn</vaadin-tab>
                </vaadin-tabs>
                <div tab="overview-tab">
                    <div style="margin: 0 50px">
                        <h1 style="margin: 0;text-align: center">${i18next.t("Edit Cabinet")}</h1>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="margin: 0 50px">
                        <vaadin-text-field class="required required-field" id="nameRoute" value="${this.codeRoute}"
                                           required error-message="Mã tủ không được để trống" label="Mã tủ"
                                           @input="${this.handleMaLo}"></vaadin-text-field>
                        <vaadin-combo-box
                                clear-button-visible
                                label="Lộ tuyến"
                                .items="${this.dataRoute}"
                                .value="${this.valueLoTuyen}"
                                item-label-path="routeName"
                                item-value-path="id"
                                @change="${this.handleChangeLoTuyen}">
                            >
                        </vaadin-combo-box>
                        <vaadin-text-field label="Tên tủ" value="${this.nameRoute}" @input="${this.handleLo}"
                                           class="required required-field"
                                           required error-message="Tên tủ không được để trống"></vaadin-text-field>
                        ${this.infoTable.assetInfo.status === "D" ? html`Trạng thái:Mất kết nối`:html`<vaadin-combo-box
                                class="required required-field"
                                required error-message="Trạng thái không được để trống"
                                clear-button-visible
                                label="Trạng thái"
                                .items="${this.itemsStatus}"
                                .value="${this.status}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleChangeStatus}">
                            >
                        </vaadin-combo-box>`}
                        <vaadin-text-field class="required required-field" id="nameModel" required error-message="Model Thiết bị không được để trống"
                                           label="Model Thiết bị" @input="${this.handleModelAsset}" .value="${this.modelAsset}"></vaadin-text-field>
                        <div colspan="2">
                            <lable>Vui lòng giữ chuột trái để chọn vị trí</lable>
                            <or-map id="map"
                                    .center=${this.selectedLat && this.selectedLng ? [this.selectedLng, this.selectedLat] : undefined}
                                    .controls=${[]} @or-map-long-press=${this.handleMapLongPress.bind(this)}
                                    style="height: 100px">
                                <or-map-marker
                                        .lat=${this.selectedLat}
                                        .lng=${this.selectedLng}
                                        icon="file-cabinet"
                                        active
                                        activeColor="#007bff"
                                ></or-map-marker>
                            </or-map>
                        </div>
                    </vaadin-form-layout>
                    <div style="display: flex;justify-content: flex-end;margin: 0 50px">
                        <vaadin-button
                                style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                @click="${this.navigateToDashboard}">
                            Hủy
                        </vaadin-button>
                        <vaadin-button style="background:  #4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                       @click="${this.handleSave}">
                            Lưu
                        </vaadin-button>
                    </div>
                </div>
                <div tab="profiles-tab" style="margin: 0 20px">
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Loại đèn</th>
                            <th>Tên đèn</th>
                            <th>Công suất</th>
                            <th>Giờ chiếu sáng</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody id="table-body">
                        ${this.rows?.map(
                                row => html`
                                    <tr>
                                        <td>${row.idTang}</td>
                                        <td>
                                            ${this.listTypeLight?.some(type => type.id === row.id)
                                                    ? html`
                                                        <vaadin-combo-box
                                                                clear-button-visible
                                                                placeholder="Loại đèn"
                                                                .items="${this.listTypeLight}"
                                                                item-label-path="lampTypeName"
                                                                item-value-path="id"
                                                                .value="${row.nemaCode}"
                                                                @value-changed="${(e) => this.handleLoai(e, row.idTang)}">
                                                        </vaadin-combo-box>
                                                    `
                                                    : html`
                                                        <span>
          ${this.lightAssetDTOList?.find(item => item.id === row.id)?.lampTypeName || html`
              <vaadin-combo-box
                      clear-button-visible
                      placeholder="Loại đèn"
                      .items="${this.listTypeLight}"
                      item-label-path="lampTypeName"
                      item-value-path="id"
                      .value="${row.nemaCode}"
                      @value-changed="${(e) => this.handleLoai(e, row.idTang)}">
              </vaadin-combo-box>`}
        </span>
                                                    `}

                                        </td>
                                        <td>
                                            ${this.listTypeNema?.some(type => type.id === row.id)
                                                    ? html`
                                                        <vaadin-combo-box
                                                                .items="${this.listTypeNema}"
                                                                @value-changed="${(e) => this.handleName(e, row.idTang)}"
                                                                .value="${row.id}"
                                                                item-label-path="assetName"
                                                                item-value-path="id"
                                                                placeholder="Tên đèn"
                                                                clear-button-visible
                                                        >
                                                        </vaadin-combo-box>
                                                    `
                                                    : html`
                                                        <span>
          ${this.lightAssetDTOList?.find(item => item.id === row.id)?.assetName || html`
              <vaadin-combo-box
                      .items="${this.listTypeNema}"
                      @value-changed="${(e) => this.handleName(e, row.idTang)}"
                      .value="${row.id}"
                      item-label-path="assetName"
                      item-value-path="id"
                      placeholder="Tên đèn"
                      clear-button-visible
              >
              </vaadin-combo-box>`}
        </span>
                                                    `}
                                        </td>
                                        <td>
                                            <vaadin-text-field
                                                    disabled
                                                    @input="${(e) => this.updateRow(row.idTang, 'powerConsumption', e.target.value)}"
                                                    .value="${row.powerConsumption}"
                                                    placeholder="Công suất"
                                                    clear-button-visible
                                            >
                                            </vaadin-text-field>
                                        </td>
                                        <td>
                                            <vaadin-text-field
                                                    disabled
                                                    @input="${(e) => this.updateRow(row.idTang, 'lightingTime', e.target.value)}"
                                                    placeholder="Giờ chiếu sáng"
                                                    .value="${row.lightingTime}"
                                                    clear-button-visible
                                            >
                                            </vaadin-text-field>
                                        </td>
                                        <td>
                                            <vaadin-text-field
                                                    disabled
                                                    @input="${(e) => this.updateRow(row.idTang, 'status', e.target.value)}"
                                                    placeholder="Trạng thái"
                                                    .value="${row.status === 'I'
                                                            ? 'Tắt'
                                                            : row.status === 'A'
                                                                    ? 'Bật'
                                                                    : ''}"
                                                    clear-button-visible
                                            >
                                            </vaadin-text-field>
                                        </td>
                                        <td>
                                            <or-icon icon="plus" @click="${this.addRow}"></or-icon>
                                            ${row.isDefault || this.rows.length === 1 ? '' : html`
                                                <or-icon @click="${() => this.removeRow(row.idTang)}"
                                                         icon="delete"></or-icon>`}
                                        </td>
                                    </tr>
                                `
                        )}
                        </tbody>
                    </table>
                    <div style="display: flex;justify-content: flex-end">
                        <vaadin-button
                                style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                @click="${this.navigateToDashboard}">
                            Hủy
                        </vaadin-button>
                        <vaadin-button style="background:  #4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                       @click="${this.handleSaveInfoDevice}">
                            Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-tabsheet>
        `;
    }
}
