import {css, html, LitElement} from "lit"
import {customElement, state, property} from "lit/decorators.js"
import "@vaadin/text-field"
import "@vaadin/combo-box"
import "@vaadin/button"
import "@vaadin/horizontal-layout"
import "@openremote/or-translate"
import "@openremote/or-icon"
import "@openremote/or-map"
import {i18next} from "@openremote/or-translate"
import manager from "@openremote/core"

@customElement("column-create")
export class ColumnCreate extends LitElement {
    @property({type: Function}) backtoList;
    @property() routeId;

    static get styles() {
        // language=CSS
        return css`
            :host {
                display: block;
                padding: 20px;
                background-color: white;
            }
            .required::part(label)::after {
                content: '*';
                color: red;
            }
            /* Ẩn icon chấm tròn mặc định nếu có */
            .required::part(required-indicator) {
                display: none;
            }
            .container {
                /*max-width: 800px;*/
                /*margin: 0 auto;*/
            }

            .title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
            }

            .section-title {
                font-size: 16px;
                font-weight: bold;
                margin: 20px 0 15px 0;
                color: #333;
            }

            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }

            .form-field {
                display: flex;
                flex-direction: column;
                /*gap: 5px;*/
            }

            .form-field label {
                font-size: 14px;
                color: #555;
            }

            .map-container {
                height: 250px;
                background-color: #f1f1f1;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-top: 10px;
                margin-bottom: 20px;
            }

            .map-container.selection-active {
                cursor: crosshair;
            }

            .map-help-text {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
                font-style: italic;
            }

            .divider {
                height: 1px;
                background-color: #e0e0e0;
                margin: 20px 0;
            }

            .actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 80px;
                margin-left: auto;
            }

            .save-button {
                background-color: #4d9d2a;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .map-controls {
                display: flex;
                margin-bottom: 10px;
                align-items: center;
            }

            .selection-mode-active {
                background-color: #ff9800 !important;
                color: white !important;
            }

            .selection-mode-button {
                margin-right: 10px;
            }

            .map-coordinates {
                position: absolute;
                bottom: 10px;
                left: 10px;
                right: 10px;
                background-color: white;
                border-radius: 4px;
                padding: 8px 12px;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                z-index: 1;
            }

            .map-coordinates-icon {
                width: 20px;
                height: 20px;
                margin-right: 8px;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='29' height='29' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M10 4C9 4 9 5 9 5v.1A5 5 0 005.1 9H5s-1 0-1 1 1 1 1 1h.1A5 5 0 009 14.9v.1s0 1 1 1 1-1 1-1v-.1a5 5 0 003.9-3.9h.1s1 0 1-1-1-1-1-1h-.1A5 5 0 0011 5.1V5s0-1-1-1zm0 2.5a3.5 3.5 0 110 7 3.5 3.5 0 110-7z'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: center;
            }

            .map-coordinates-text {
                font-size: 14px;
                font-family: monospace;
                color: #333;
            }

        `
    }

    @state() dataRoute = []
    @state() listLampType = []

    firstUpdated() {
        manager.rest.api.RouteInfoResource.getAll({})
            .then((response) => {
                this.dataRoute = response.data
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.LamppostResource.getLamppostType()
            .then((response) => {
                console.log('lamportType', response.data)
                this.listLampType = response.data
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }

    @state()
    protected lamppostData = {
        name: "",
        code: "",
        route: "",
        cabinet: "",
        lightType: "",
        nemaCode: "",
        location: {
            lat: 10.762622,
            lng: 106.660172, // Default to Ho Chi Minh City
        },
    }

    @state() routes = [
        {label: "Lộ tuyến A", value: "route-a"},
        {label: "Lộ tuyến B", value: "route-b"},
        {label: "Lộ tuyến C", value: "route-c"},
    ]

    @state() cabinets = [
        {label: "Tủ điện 01", value: "cabinet-01"},
        {label: "Tủ điện 02", value: "cabinet-02"},
        {label: "Tủ điện 03", value: "cabinet-03"},
    ]

    @state() lightTypes = [
        {label: "LED 50W", value: "led-50w"},
        {label: "LED 75W", value: "led-75w"},
        {label: "LED 100W", value: "led-100w"},
    ]

    @property({ type: Number }) selectedLat = null;
    @property({ type: Number }) selectedLng = null;


    handleLampostCode(event) {
        this.lamppostData.code = event.target.value
        console.log('lampostCode', event.target.value)
    }

    handleLampostName(event) {
        this.lamppostData.name = event.target.value
        console.log('lampostCode', event.target.value)
    }

    handleLampostRoute(event) {
        this.lamppostData.route = event.target.value
    }

    @state() dataNemaAndLocation

    handleLightType(event) {
        this.lamppostData.lightType = event.target.value
        console.log('event', this.routeId.routeInfo.id)
        console.log('event2', event.target.value)
        manager.rest.api.LamppostResource.getLightByLamppostType(event.target.value,this.routeId.routeInfo.id)
            .then((response) => {
                this.dataNemaAndLocation = response.data
                console.log('response', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    handleNemaCode(event) {
        this.lamppostData.nemaCode = event.target.value
        const value = event.target.value;
        const filterData: any = this.dataNemaAndLocation?.filter(
            item => item.id === value
        );
        const coord = filterData?.[0]?.attributes?.location?.value?.coordinates;

        // Kiểm tra đúng mảng và độ dài
        if (Array.isArray(coord) && coord.length >= 2) {
            // GeoJSON: [lng, lat]
            const lng = Number(coord[0]);
            const lat = Number(coord[1]);

            // Kiểm tra dải giá trị hợp lệ
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.selectedLat = lat;
                this.selectedLng = lng;

                // (tuỳ chọn) Fly map tới vị trí mới
                this.updateComplete.then(() => {
                    const map:any = this.shadowRoot!.querySelector('or-map');
                    if (map) {
                        map.flyTo({ lat, lng, zoom: 13 });
                    }
                });
            } else {
                console.warn('Coordinates out of range:', coord);
                this.selectedLat = null;
                this.selectedLng = null;
            }
        } else {
            // không có tọa độ → ẩn marker
            this.selectedLat = null;
            this.selectedLng = null;
        }
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
    handleSave() {
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
            } else {
                const objectPush :any= {
                    lamppostCode: this.lamppostData.code,
                    routeId: String(this.routeId.routeInfo.id),
                    lampTypeId:this.lamppostData.lightType,
                    lightId:this.lamppostData.nemaCode
                }
                console.log('objectPush',objectPush)
                manager.rest.api.LamppostResource.create(objectPush,{realm:window.sessionStorage.getItem('realm')})
                    .then((response) => {
                        console.log('response',response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                this.showCustomNotification("Thêm cột đèn thành công")
                window.dispatchEvent(new CustomEvent('data-updated'));
                setTimeout(() => {
                    this.backtoList();
                }, 2000);
            }
        }

        console.log('avcas', this.lamppostData)
    }

    render() {
        console.log('routeId', window.sessionStorage.getItem('realm'))
        return html`
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end"
                                 theme="success"></vaadin-notification>
            <div class="container">
                <div class="title">
                    ${i18next.t("CREATE A NEW LAMP")}
                </div>

                <div class="section-title">
                    <or-translate value="Thông tin cơ bản"></or-translate>
                </div>

                <div class="form-grid">
                    <div class="form-field">
                        <vaadin-combo-box
                                label="Loại đèn"
                                class="required required-field"
                                required error-message="Loại đèn không được để trống"
                                .items="${this.listLampType}"
                                .value="${this.lamppostData.lightType}"
                                @value-changed="${this.handleLightType}"
                                item-label-path="lampTypeName"
                                item-value-path="id"
                        ></vaadin-combo-box>
                    </div>

                    <div class="form-field">
                        <vaadin-combo-box
                                label="Tên đèn(Nema)"
                                .items="${this.dataNemaAndLocation}"
                                .value="${this.lamppostData.nemaCode}"
                                @value-changed="${this.handleNemaCode}"
                                item-label-path="name"
                                item-value-path="id"
                        ></vaadin-combo-box>
                    </div>
                </div>

                <div class="section-title">
                    <or-translate value="Thông tin vị trí"></or-translate>
                </div>

                <div class="map-container">
                    <or-map .controls=${[]} style="height: 100px">
                        ${this.selectedLat !== null && this.selectedLng !== null ? html`
                            <or-map-marker
                                   
                                    .lat=${this.selectedLat}
                                    .lng=${this.selectedLng}
                                    icon="file-cabinet"
                                    active
                                    activeColor="#007bff"
                            ></or-map-marker>
                        ` : ''}
                    </or-map>



                </div>

                <div class="actions">
                    <vaadin-button
                            @click="${this.backtoList}"
                            style="background: white;color: black;margin-right: 20px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                        Hủy
                    </vaadin-button>
                    <vaadin-button
                            theme="primary"
                            class="save-button"
                            style="background: #4D9D2A"
                            @click="${this.handleSave}"
                    >
                        <or-translate value="Lưu"></or-translate>
                    </vaadin-button>
                </div>
            </div>
        `
    }
}
