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

@customElement("column-edit")
export class ColumnCreate extends LitElement {
    @property({ type: Object }) selectedItem: any;
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
                gap: 5px;
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
    updated(changedProps: Map<string, any>) {
        if (changedProps.has('selectedItem')) {
            const coordinates = this.selectedItem?.location?.value?.coordinates;

            if (Array.isArray(coordinates) && coordinates.length === 2) {
                const [lng, lat] = coordinates.map(Number);

                if (
                    lat >= -90 && lat <= 90 &&
                    lng >= -180 && lng <= 180
                ) {
                    this.selectedLat = lat;
                    this.selectedLng = lng;
                } else {
                    console.warn('Toạ độ không hợp lệ:', coordinates);
                    this.selectedLat = null;
                    this.selectedLng = null;
                }
            } else {
                this.selectedLat = null;
                this.selectedLng = null;
            }
        }
    }


    firstUpdated() {
        this.isInitialized = true;
        this.lamppostData.code = this.selectedItem?.code
        console.log('selectedItem',this.routeId)
        this.lamppostData.nemaCode = this.selectedItem?.nemaId
        // if (this.selectedItem?.location?.value?.coordinates?.length === 2) {
        //     this.selectedLng = Number(this.selectedItem.location.value.coordinates[0]);
        //     this.selectedLat = Number(this.selectedItem.location.value.coordinates[1]);
        // }
        console.log('selectedLng',this.selectedItem.location.value.coordinates[0])
        console.log('selectedLat',this.selectedItem.location.value.coordinates[1])
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
                this.lamppostData.lightType = this.selectedItem?.lampTypeId
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }

    @state() lamppostData = {
        code: "",
        cabinet: "",
        lightType: "",
        nemaCode: "",
    }
    @state()
    private selectedLat: number | null = null;

    @state()
    private selectedLng: number | null = null;


    handleLampostCode(event) {
        this.lamppostData.code = event.target.value
        console.log('lampostCode', event.target.value)
    }

    @state() dataNemaAndLocation
    @state() isInitialized = false;

    handleLightType(event) {
        this.lamppostData.lightType = event.target.value
        console.log('event', event.target.value)
        manager.rest.api.LamppostResource.getLightByLamppostType(event.target.value,this.routeId?.id)
            .then((response) => {
                this.dataNemaAndLocation = response.data
                console.log('response', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    handleNemaCode(event) {
        const value = event.target.value;
        if (!value || value === this.lamppostData.nemaCode) return;

        this.lamppostData.nemaCode = value;
        const filterData: any = this.dataNemaAndLocation?.filter(
            item => item.id === value
        );
        const coord = filterData?.[0]?.attributes?.location?.value?.coordinates;

        if (Array.isArray(coord) && coord.length >= 2) {
            const lng = Number(coord[0]);
            const lat = Number(coord[1]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.selectedLat = lat;
                this.selectedLng = lng;
                this.updateComplete.then(() => {
                    const map: any = this.shadowRoot!.querySelector('or-map');
                    map?.flyTo({ lat, lng, zoom: 13 });
                });
            } else {
                console.warn('Coordinates out of range:', coord);
                this.selectedLat = null;
                this.selectedLng = null;
            }
        } else {
            this.selectedLat = null;
            this.selectedLng = null;
        }
    }

    handleSave() {
        const requiredFields: any = this.shadowRoot?.querySelectorAll('.required-field') || [];
       console.log('this.ss',this.selectedItem)
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
                    routeId: String(this.routeId?.routeInfo?.id),
                    lampTypeId:this.lamppostData.lightType,
                    lightId:this.lamppostData.nemaCode
                }
                console.log('objectPush',objectPush)
                manager.rest.api.LamppostResource.update(this.selectedItem?.code,objectPush)
                    .then((response) => {
                        console.log('response',response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                window.dispatchEvent(new CustomEvent('data-updated'));
                setTimeout(() => {
                    this.backtoList();
                }, 2000);
                // this.backtoList()
            }
        }

        console.log('avcas', this.lamppostData)
    }

    render() {
        console.log('Map re-rendering with', this.selectedLat, this.selectedLng);
        return html`
            <div class="container">
                <div class="title">
                    ${i18next.t("Edit A NEW LAMP")}
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
                    <or-map .controls=${[]} style="height: 100px" .center=${this.selectedLat && this.selectedLng ? [this.selectedLng, this.selectedLat] : undefined}>
                        ${(this.selectedLat != null && this.selectedLng != null) ? html`
                            <or-map-marker
                                    .lat=${this.selectedLat}
                                    .lng=${this.selectedLng}
                                    icon="file-cabinet"
                                    active
                                    activeColor="#007bff"
                                    .key=${this.selectedLat + ',' + this.selectedLng}
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
