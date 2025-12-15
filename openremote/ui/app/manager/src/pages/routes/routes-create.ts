import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import Swal from 'sweetalert2';
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
import"@vaadin/card"
import "@vaadin/text-area"
import "@vaadin/button"
import "@vaadin/upload"
import '@vaadin/text-field';
import '@vaadin/password-field';
import '@vaadin/date-picker';
import '@vaadin/text-area';
import"@vaadin/notification"
import { i18next } from "@openremote/or-translate";

pdfMake.vfs = pdfFonts.vfs;

@customElement("routes-create")
export class MyElement extends LitElement {
    @state() file=[]
@state() today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    @state() dataSaveQuan=[]
    @state() dataSaveXa=[]
    @state() rows=[
        { id: 1, type: '', assetId: '', status: '', activeDate: '', deactiveDate: '', updateDate: undefined, updateBy: '', isDefault: true,namefile:"" }
    ]
    @state() index=2
    @state() nameRoute =""
    @state() codeRoute =""
    @state() nameDiaChi =""
    @state() status
    @state() description =""
    @state() selectedDate
    @state() itemTinh = []
    @state() createBy =""
    @state() itemQuan  = []
    @state() itemDuong  = []
    @state() selectedTinh
    @state() selectedQuan
    @state() selectedDuong
    @state() itemsStatus = [
        { id: "A", name: 'Hoạt động' },
        { id: "M", name: 'Bảo trì' },
        { id: "P", name: 'Dừng hoạt động' }
    ];
    @state() itemsType = [
        { id: "LightAsset", name: 'Đèn' },
        { id: "ElectricalCabinetAsset", name: 'Tủ' },
    ];
    @state() isDisabledQuan = true
    @state() isDisabledXa = true
    @state() listLight = []
    static styles = css`
        :host {
    
        }
        //.form-grid {
        //    display: grid;
        //    grid-template-columns: 1fr 2fr; /* Cột trái nhỏ hơn cột phải */
        //    grid-template-rows: auto auto auto;
        //    gap: 12px;
        //}
        //
        //.right-cell {
        //    grid-row: 1 / span 3; /* Cột phải chiếm toàn bộ 3 hàng */
        //    width: 100%;
        //}
        //
        //.full-width {
        //    width: 100%;
        //}
        .form-grid {
            display: grid;
            grid-template-columns: 2fr 2fr; /* Cột 1 chiếm 1 phần, cột 2 chiếm 3 phần */
            grid-template-rows: auto auto auto; /* 3 hàng */
            gap: 12px;
        }

        .form-grid > .column1 {
            grid-column: 1; /* Cột 1 */
            grid-row: span 1; /* Mỗi item chiếm 1 hàng */
        }

        .form-grid > .column2 {
            grid-column: 2; /* Cột 2 */
            grid-row: 1 / span 3; /* Cột 2 chiếm tất cả 3 hàng */
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
        window.location.hash = '/routes';
    }
    private responsiveSteps:any= [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if layout's width exceeds 500px
        { minWidth: '500px', columns: 2 },
    ];
    addRow() {
        // Nếu không trùng thì thêm hàng mới
        this.rows = [...this.rows, {
            id: this.index++,
            type: '',
            assetId: '',
            status: '',
            activeDate: '',
            deactiveDate: '',
            updateDate: '',
            updateBy: '',
            isDefault: false,
            namefile: ''
        }];
        this.requestUpdate();
    }
    removeRow(id) {
        this.rows = this.rows.filter(row => row.id !== id || row.isDefault);

        // Cập nhật lại ID cho hàng còn lại
        this.rows = this.rows.map((row, index) => ({ ...row, id: index + 1 }));

        this.index = this.rows.length + 1; // Cập nhật lại chỉ số cho hàng tiếp theo
        this.requestUpdate();
    }
    updateRow(id, field, value) {
        this.rows = this.rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        );
        this.requestUpdate();
        console.log('this',this.rows)
    }
    handleLo(event){
        const max = 250;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.nameRoute = event.target.value
    }
    handleDiaChiChiTiet(event){
        const max = 500;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.nameDiaChi = event.target.value
    }
    handleMaLo(event){
        const input = event.target;
        // Chỉ giữ lại ký tự từ a-z, A-Z, 0-9, không dấu, không space
        input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
        const max = 30;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.codeRoute = event.target.value
    }
    handleChangeStatus(event){
        this.status = event.target.value
    }
    handleDateChange(event) {
        this.selectedDate = event.target.value;
        console.log("Ngày đã chọn:", this.selectedDate);
    }
    handleChangeTinh(event){
        this.selectedTinh = event.target.value
        this.selectedQuan = undefined
        this.selectedDuong = undefined
        console.log('event.target.value',event.target.value)
        if(event.target.value){
            this.isDisabledQuan = false
            manager.rest.api.DistrictResource.getData({data:{provinceId:event.target.value}})
                .then((response) => {
                    this.itemQuan = response.data
                    console.log('itemQuan',response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }else{
            this.isDisabledQuan = true
        }
        console.log('value',event.target.value)
    }
    handleChangeQuan(event){
        this.selectedQuan = event.target.value
        if(event.target.value){
            this.isDisabledXa = false
            manager.rest.api.WardResource.getAll({data:{districtId:event.target.value}})
                .then((response) => {
                    this.itemDuong = response.data
                    console.log('itemQuan',response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }else{
            this.isDisabledXa = true
        }
    }
    handleChangeDuong(event){
        this.selectedDuong = event.target.value
    }
    handleDescription(event){
        const max = 250;
        if (event.target.value.length > max) {
            event.target.value = event.target.value.slice(0, max);
        }
        this.description=event.target.value
    }
    async fetchApi() {
        manager.rest.api.ProvinceResource.getAll({})
            .then((response) => {
                this.itemTinh = response.data
                console.log('province',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                this.createBy = response.data?.username
                console.log('current',response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    firstUpdated(){
        this.fetchApi()
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
    @state() dataOverview = {}
    handleSave(){
         const objectPush ={
              routeCode :this.codeRoute,           // Mã tuyến
              routeName:this.nameRoute,              // Tên tuyến
              realm:window.sessionStorage.getItem('realm'),                  // Miền dữ liệu
               provinceId:this.selectedTinh,            // ID tỉnh/thành phố
               districtId:this.selectedQuan,            // ID quận/huyện
               wardId:this.selectedDuong,               // ID phường/xã
              // streetName:this.nameDiaChi;             // Tên đường
              address:this.nameDiaChi,             // Địa chỉ chi tiết
              status:this.status,            // Trạng thái
              // activeDate;      // Ngày hoạt động
              description:this.description,           // Mô tả thêm
              createDate:this.selectedDate + "00:00:00",     // Ngày tạo
              createBy: this.createBy,                // Người tạo
              routeAssetCreateDTOS:this.rows
              // updateDate;      // Ngày cập nhật
              // updateBy;
         }
         console.log('objectPush',objectPush)
        // const comboBox = this.shadowRoot?.querySelector('#nameRoute') as any; // Ép kiểu để truy cập validate()
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
            // const isValid = requiredFields.validate(); // Kiểm tra required
            if (!isAllValid) {
                console.log('Vui lòng chọn Tên tủ');
            }else{
                const notification = this.shadowRoot!.getElementById('myNotification3') as any;
                const hasValidAssetId = this.rows.some(row => row.assetId && row.assetId.trim() !== '');
                if(hasValidAssetId){
                    manager.rest.api.AssetResource.createRoute(objectPush,{realm:window.sessionStorage.getItem('realm')})
                        .then((response:any) => {
                            console.log('roadSetupSearch', response)
                            if(response.data?.errorMessage){
                                const notification = this.shadowRoot!.getElementById('myNotification3') as any;

                                notification.renderer = (root: HTMLElement) => {
                                    root.innerHTML = ''; // Xóa nội dung cũ
                                    const text = document.createElement('div');
                                    text.textContent = response.data?.errorMessage;
                                    root.appendChild(text);
                                };
                                notification.open();
                            }else{
                                const notification = this.shadowRoot!.getElementById('myNotification') as any;

                                notification.renderer = (root: HTMLElement) => {
                                    root.innerHTML = ''; // Xóa nội dung cũ
                                    const text = document.createElement('div');
                                    text.textContent = 'Thêm Lộ/Tuyến thành công!';
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
                                this.showWarningNotification("Bạn không có quyền tạo")
                            } else {
                                console.error('Lỗi khi gửi request:', error.message);
                            }
                        });
                }else{
                    this.showWarningNotification("Cần điền tiếp dữ liệu ở tab thông tin thiết bị")
                    setTimeout(() => {
                        this.selectedIndex = 1;
                    }, 2000);
                }
                console.log('abcd',objectPush)
            }
        }
    }
    handleSaveInfoDevice(){
        const objectPush ={
            routeCode :this.codeRoute,           // Mã tuyến
            routeName:this.nameRoute,              // Tên tuyến
            realm:window.sessionStorage.getItem('realm'),                  // Miền dữ liệu
            provinceId:this.selectedTinh,            // ID tỉnh/thành phố
            districtId:this.selectedQuan,            // ID quận/huyện
            wardId:this.selectedDuong,               // ID phường/xã
            // streetName:this.nameDiaChi;             // Tên đường
            address:this.nameDiaChi,             // Địa chỉ chi tiết
            status:this.status,            // Trạng thái
            // activeDate;      // Ngày hoạt động
            description:this.description,           // Mô tả thêm
            createDate:this.selectedDate + "00:00:00",     // Ngày tạo
            createBy: this.createBy,                // Người tạo
            routeAssetCreateDTOS:this.rows
            // updateDate;      // Ngày cập nhật
            // updateBy;
        }
        const requiredFields: any = this.shadowRoot?.querySelectorAll('.required-field') || [];

        let isAllValid = true;

        requiredFields.forEach((field: any) => {
            const isValid = field.validate?.() || field.reportValidity?.();
            if (!isValid) {
                isAllValid = false;
                console.log(`❌ Trường "${field.label}" không hợp lệ.`);
            }
        });
        if (requiredFields) {
            // const isValid = comboBox.validate(); // Kiểm tra required
            if (!isAllValid) {
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

            }else{
                const hasValidAssetId = this.rows.some(row => row.assetId && row.assetId.trim() !== '');
                if(hasValidAssetId){
                    manager.rest.api.AssetResource.createRoute(objectPush,{realm:window.sessionStorage.getItem('realm')})
                        .then((response) => {
                            console.log('roadSetupSearch', response)
                            const notification = this.shadowRoot!.getElementById('myNotification') as any;

                            notification.renderer = (root: HTMLElement) => {
                                root.innerHTML = ''; // Xóa nội dung cũ
                                const text = document.createElement('div');
                                text.textContent = 'Thêm Lộ/Tuyến thành công!';
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
                                this.showWarningNotification("Bạn không có quyền tạo")
                            } else {
                                console.error('Lỗi khi gửi request:', error.message);
                            }
                        });
                }else{
                    const notification = this.shadowRoot!.getElementById('myNotification2') as any;
                    notification.renderer = (root: HTMLElement) => {
                        root.innerHTML = ''; // Xóa nội dung cũ
                        const text = document.createElement('div');
                        text.textContent = 'Cần ít nhất 1 dữ liệu trong tab thiết bị!';
                        root.appendChild(text);
                    };
                    notification.open();
                }
            }
        }

        console.log('objectPush',objectPush)
    }
    handleLoai(event:any,idrow:any){
        console.log('valueLoai',event.target.value)
        const selectName = event.target.value
        manager.rest.api.AssetResource.getAssetName(window.sessionStorage.getItem('realm'),{types:event.target.value})
            .then((response) => {
                this.listLight = response.data
                console.log('roadSetupSearch2', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.rows = this.rows.map(row =>
            row.id === idrow
                ? {
                    ...row,
                    type:selectName,
                    assetId: undefined,
                    updateDate:undefined,
                    status:undefined,
                    activeDate:undefined,
                    deactiveDate:undefined
                }
                : row
        );
        console.log('valueLoai2',idrow)
        // this.updateRow(idrow, 'type', event.target.value)
    }
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    updated(){
        console.log('this.roww',this.rows)
    }
    handleName(event:any,idrow:any){
        const selectName = event.target.value;

// Tìm dòng hiện tại đang chọn để lấy type
        const currentRow = this.rows.find(row => row.id === idrow);

// Kiểm tra assetId đã tồn tại ở dòng khác chưa
        const isDuplicate = this.rows.some(row => row.assetId === selectName && row.id !== idrow);

        if (isDuplicate) {
            const notification = this.shadowRoot!.getElementById('myNotification2') as any;

            notification.renderer = (root: HTMLElement) => {
                console.log('currentRow?.type',currentRow?.type)
                root.innerHTML = ''; // Xóa nội dung cũ
                const text = document.createElement('div');
                if (currentRow?.type === 'ElectricalCabinetAsset') {
                    text.textContent = 'Tủ này đã gắn vào Lộ/Tuyến!';
                } else if (currentRow?.type === 'LightAsset') {
                    text.textContent = 'Đèn này đã gắn vào Lộ/Tuyến!';
                } else {
                    text.textContent = 'Thiết bị này đã gắn vào Lộ/Tuyến!';
                }
                root.appendChild(text);
            };
            notification.open();

            // Reset lại assetId nếu trùng
            this.rows = this.rows.map(row =>
                row.id === idrow
                    ? { ...row, assetId: '' }
                    : row
            );

            return;
        }
        const statusMap = {
            A: 'Hoạt động',
            M: 'Bảo trì',
            P: 'Dừng hoạt động',
        };
        manager.rest.api.AssetInfoResource.get(selectName)
            .then((response) => {
                console.log('response',response)
                this.rows = this.rows.map(row =>
                    row.id === idrow
                        ? {
                            ...row,
                            assetId: selectName,
                            updateDate: response.data.updateDate ? this.formatDate(response.data.updateDate) : undefined,
                            status:statusMap[response?.data?.status],
                            activeDate: response.data.activeDate ? this.formatDate(response.data.activeDate) : undefined,
                            deactiveDate: response.data.deactiveDate ? this.formatDate(response.data.deactiveDate) : undefined
                        }
                        : row
                );
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    @state() private selectedIndex = 0;
    private handleTabChange(e: CustomEvent) {
        this.selectedIndex = (e.target as any).selected;
        console.log('Đã chọn tab:', (e.target as any).selected);
    }
    render() {

        return html`
            <vaadin-notification id="myNotification3" duration="3000" position="bottom-end" theme="error"></vaadin-notification>
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end" theme="success"></vaadin-notification>
            <vaadin-notification id="myNotification2" duration="3000" position="bottom-end" theme="warning"></vaadin-notification>
            <vaadin-tabsheet>
                <vaadin-tabs slot="tabs"
                             .selected=${this.selectedIndex}
                             @selected-changed=${this.handleTabChange}
                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                    <vaadin-tab id="overview-tab">Thông tin cơ bản</vaadin-tab>
                    <vaadin-tab id="profiles-tab">Thông tin thiết bị</vaadin-tab>
                </vaadin-tabs>
                <div tab="overview-tab">
                    <div style="margin: 0 50px">
                        <h1 style="margin: 0;text-align: center">${i18next.t("Create Routes Management")}</h1>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="margin: 0 50px">
                        <vaadin-text-field class="required required-field" id="nameRoute" maxlength="10"    required error-message="Mã Lộ/Tuyến không được để trống" label="Mã Lộ/Tuyến" @input="${this.handleMaLo}"></vaadin-text-field>
                        <vaadin-text-field  class="required required-field" label="Tên Lộ/Tuyến" required error-message="Tên Lộ/Tuyến không được để trống" @input="${this.handleLo}"></vaadin-text-field>
                        <vaadin-combo-box
                                colspan="2"
                                required error-message="Trạng thái không được để trống"
                                class="required required-field"
                                clear-button-visible
                                label="Trạng thái"
                                .items="${this.itemsStatus}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleChangeStatus}">
                            ></vaadin-combo-box>
                        <lable style="margin-top: 10px"><b>Thông tin vị trí</b></lable>
                        <lable style="visibility: hidden"><b>Thông tin cá nhân</b></lable>
                      
                    </vaadin-form-layout>
                    <div class="form-grid" style="margin: 0 50px">
                        <vaadin-text-area
                                class="right-cell full-width column2"
                                colspan="2"
                                class="rowspan-2 full-width"
                                label="Địa chỉ chi tiết"
                                @input="${this.handleDiaChiChiTiet}"
                        ></vaadin-text-area>
                       <vaadin-combo-box
                                required error-message="Tỉnh/Thành phố không được để trống"
                                class="required required-field column1"
                                clear-button-visible
                                label="Tỉnh/Thành phố"
                                .items="${this.itemTinh}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleChangeTinh}"
                        ></vaadin-combo-box>
                        <vaadin-combo-box
                                required error-message="Quận/Huyện không được để trống"
                                class="required required-field column1"
                                clear-button-visible
                                id="nameQuan"
                                label="Quận/Huyện"
                                ?disabled="${this.isDisabledQuan}"
                                .items="${this.itemQuan}"
                                .value="${this.selectedQuan}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleChangeQuan}"
                        ></vaadin-combo-box>
                        <vaadin-combo-box
                                required error-message="Phường/Xã không được để trống"
                                class="required required-field column1"
                                id="namePhuong"
                                clear-button-visible
                                label="Phường/Xã"
                                ?disabled="${this.isDisabledXa}"
                                .items="${this.itemDuong}"
                                .value="${this.selectedDuong}"
                                item-label-path="name"
                                item-value-path="id"
                                @change="${this.handleChangeDuong}"
                        ></vaadin-combo-box>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="margin: 0 50px">
                        <vaadin-text-area
                                colspan="2"
                                label="Mô tả"
                                @input="${this.handleDescription}"
                        ></vaadin-text-area>
                    </vaadin-form-layout>
                    <div style="display: flex;justify-content: flex-end;margin: 0 50px">
                        <vaadin-button style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;" @click="${this.navigateToDashboard}">
                           Hủy
                        </vaadin-button>
                        <vaadin-button style="background: #4D9D2A;color: white;margin-left: 20px;margin-top: 10px" @click="${this.handleSave}">
                            Lưu
                        </vaadin-button>
                    </div>
                </div>
                <div tab="profiles-tab" style="margin: 0 20px">
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Loại</th>
                            <th>Tên</th>
                            <th>Trạng thái</th>
                            <th>Ngày bắt đầu hoạt động</th>
                            <th>Ngày dừng hoạt động</th>
                            <th>Ngày cập nhật</th>
                            <th>Người cập nhật</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody id="table-body">
                        ${this.rows.map(
                                row => html`
              <tr>
                <td style="width: 50px">${row.id}</td>
                <td>
                    <vaadin-combo-box
                            style="width: 150px"
                            clear-button-visible
                            placeholder="Loại"
                            .items="${this.itemsType}"
                            item-label-path="name"
                            item-value-path="id"
                            @value-changed="${(e) => this.handleLoai(e, row.id)}" .value="${row.type}"></vaadin-combo-box>
                </td>
                 
                <td>
                    <vaadin-combo-box
                            style="width: 150px"
                            placeholder="Tên"
                            .items="${this.listLight}"
                            clear-button-visible
                            item-label-path="name"
                            item-value-path="id"
                            style="width: 150px;"
                            @change=${(event) => this.handleName(event, row.id)}
                            .value="${row.assetId}"
                    ></vaadin-combo-box>
                </td>
                <td>
                    <vaadin-text-field
                            style="width: 150px"
                            disabled
                            @input="${(e) => this.updateRow(row.id, 'status', e.target.value)}" 
                            .value="${row.status}"
                            placeholder="Trạng thái"
                            clear-button-visible
                    >
                    </vaadin-text-field>
                </td>
                <td>
                    <vaadin-text-field
                            style="width: 150px"
                            disabled
                            @input="${(e) => this.updateRow(row.id, 'activeDate', e.target.value)}"
                            placeholder="Ngày bắt đầu"
                            .value="${row.activeDate}"
                            clear-button-visible
                    >
                    </vaadin-text-field>
                </td>
                  <td>
                      <vaadin-text-field
                              style="width: 150px"
                              disabled
                              @input="${(e) => this.updateRow(row.id, 'deactiveDate', e.target.value)}"
                              placeholder="Ngày dừng"
                              .value="${row.deactiveDate}"
                              clear-button-visible
                      >
                      </vaadin-text-field>
                  </td>
                  <td>
                      <vaadin-text-field
                              style="width: 150px"
                              disabled
                              @input="${(e) => this.updateRow(row.id, 'updateDate', e.target.value)}"
                              placeholder="Ngày Cập nhật"
                              .value="${row.updateDate}"
                              clear-button-visible
                      >
                      </vaadin-text-field>
                  </td>
                  <td>
                      <vaadin-text-field
                              style="width: 150px"
                              disabled
                              @input="${(e) => this.updateRow(row.id, 'updateBy', e.target.value)}" .value="${row.updateBy}"
                              placeholder="Người cập nhật"
                      >
                      </vaadin-text-field>
                  </td>
                <td>
                    <or-icon icon="plus"  @click="${this.addRow}"></or-icon>
                    ${row.isDefault || this.rows.length === 1 ? '' : html` <or-icon @click="${() => this.removeRow(row.id)}" icon="delete"></or-icon>`}
                </td>
              </tr>
            `
                        )}
                        </tbody>
                    </table>
                    <div style="display: flex;justify-content: flex-end">
                        <vaadin-button style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;" @click="${this.navigateToDashboard}">
                            Hủy
                        </vaadin-button>
                        <vaadin-button style="background: #4D9D2A;color: white;margin-left: 20px;margin-top: 10px" @click="${this.handleSaveInfoDevice}">
                            Lưu
                        </vaadin-button>
                    </div>
                </div>
            </vaadin-tabsheet>
        `;
    }
}
