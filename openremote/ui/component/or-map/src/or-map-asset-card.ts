import {
    CSSResultGroup,
    html,
    LitElement,
    PropertyValues,
    TemplateResult
} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {classMap} from 'lit-html/directives/class-map.js';
import {
    Asset,
    AssetEvent,
    AssetEventCause,
    AttributeEvent,
    SharedEvent,
    WellknownAttributes,
    WellknownMetaItems,
    AssetModelUtil, AssetInfo, AssetInfoDto
} from "@openremote/model";
import manager, {subscribe, Util} from "@openremote/core";
import "@openremote/or-icon";
import {mapAssetCardStyle} from "./style";
import {InputType} from "@openremote/or-mwc-components/or-mwc-input";
import {getMarkerIconAndColorFromAssetType} from "./util";
import {getMarkerConfigAttributeName, MapMarkerAssetConfig} from "./markers/or-map-marker-asset";

export interface MapAssetCardTypeConfig {
    include?: string[];
    exclude?: string[];
    hideViewAsset?: boolean;
}

export interface MapAssetCardConfig {
    default?: MapAssetCardTypeConfig;
    assetTypes?: { [assetType: string]: MapAssetCardTypeConfig };
}

export class OrMapAssetCardLoadAssetEvent extends CustomEvent<string> {

    public static readonly NAME = "or-map-asset-card-load-asset";

    constructor(assetId: string) {
        super(OrMapAssetCardLoadAssetEvent.NAME, {
            bubbles: true,
            composed: true,
            detail: assetId
        });
    }
}

declare global {
    export interface HTMLElementEventMap {
        [OrMapAssetCardLoadAssetEvent.NAME]: OrMapAssetCardLoadAssetEvent;
    }
}


export const DefaultConfig: MapAssetCardConfig = {
    default: {
        exclude: ["notes"]
    },
    assetTypes: {}
};

@customElement("or-map-asset-card")
export class OrMapAssetCard extends subscribe(manager)(LitElement) {
    @property({type: Object})
    public assetDetails?: any;

    @property({type: Object})
    public firmWarePageMap?: any;

    @property({type: String, reflect: true, attribute: true})
    public assetId?: string;

    @property({type: Object, attribute: true})
    public asset?: AssetInfoDto;
    @property({type: Object, attribute: true})
    public asset2?: AssetInfoDto;

    @property({type: Object})
    public config?: MapAssetCardConfig;

    @property({type: Object})
    public markerconfig?: MapMarkerAssetConfig;

    @property({type: Boolean, attribute: true})
    public useAssetColor: boolean = true;

    static get styles(): CSSResultGroup {
        return mapAssetCardStyle;
    }

    protected shouldUpdate(_changedProperties: PropertyValues): boolean {
        console.log('this.a', this.asset)
        if (_changedProperties.has("assetId")) {
            this.title = "";
            this.assetIds = this.assetId && this.assetId.length > 0 ? [this.assetId] : undefined;

            if (_changedProperties.size === 1) {
                return false;
            }
        }

        return super.shouldUpdate(_changedProperties);
    }

    public _onEvent(event: SharedEvent) {
        if (event.eventType === "asset") {
            const assetEvent = event as AssetEvent;
            manager.rest.api.AssetResource.getInfoLightByLightId({lightId: assetEvent?.assetInfoDto?.asset?.id})
                .then((response) => {
                    this.firmWare = response.data.firmwareVersion
                    console.log('getAlldataRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            // manager.rest.api.AssetResource.queryLastTimeActive(assetEvent?.assetInfoDto?.asset?.id)
            //     .then((response:any) => {
            //         this.lasTime = response.data
            //         console.log('getAlldataRoute2', response)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            console.log('or-card', assetEvent)
            switch (assetEvent.cause) {
                case AssetEventCause.READ:
                case AssetEventCause.CREATE:
                case AssetEventCause.UPDATE:
                    this.asset = assetEvent.assetInfoDto;
                    break;
                case AssetEventCause.DELETE:
                    this.asset = undefined;
                    break;
            }
        }

        if (event.eventType === "attribute") {
            if (this.asset) {
                this.asset = Util.updateAsset(this.asset, event as AttributeEvent);
                this.requestUpdate();
            }
        }
    }

    protected getCardConfig(): MapAssetCardTypeConfig | undefined {
        let cardConfig = this.config || DefaultConfig;

        if (!this.asset) {
            return cardConfig.default;
        }

        return cardConfig.assetTypes && cardConfig.assetTypes.hasOwnProperty(this.asset.asset?.type!) ? cardConfig.assetTypes[this.asset.asset?.type!] : cardConfig.default;
    }

    convertAttributesToPhaseArray(attributes: any) {
        const result: any = [];

        const getOrCreatePhaseObj = (phase: any) => {
            let phaseObj = result.find((p: any) => p.phase === phase);
            if (!phaseObj) {
                phaseObj = {phase};
                result.push(phaseObj);
            }
            return phaseObj;
        };

        Object.keys(attributes).forEach(key => {
            const value = attributes[key]?.value; // không bỏ qua null nữa

            const matchVolt = key.match(/^voltagePhase(\d+)$/);
            const matchAmp = key.match(/^amperagePhase(\d+)$/);
            const matchWattActual = key.match(/^wattageActualPhase(\d+)$/);
            const matchWatt = key.match(/^wattagePhase(\d+)$/);

            if (matchVolt) {
                const phase = Number(matchVolt[1]);
                getOrCreatePhaseObj(phase).volt = value ?? null;
            }

            if (matchAmp) {
                const phase = Number(matchAmp[1]);
                getOrCreatePhaseObj(phase).amp = value ?? null;
            }

            if (matchWattActual) {
                const phase = Number(matchWattActual[1]);
                getOrCreatePhaseObj(phase).wattActual = value ?? null;
            }

            if (matchWatt) {
                const phase = Number(matchWatt[1]);
                getOrCreatePhaseObj(phase).watt = value ?? null;
            }
        });

        return result.sort((a: any, b: any) => a.phase - b.phase);
    }


    formatNumber(value: any) {
        if (value == null || isNaN(value) || value == "") return '0';
        return value.toLocaleString('vi-VN');
    }

    formatDate(timestamp: any) {
        if (timestamp === '' || timestamp === undefined) {
            return ''
        } else {
            const date = new Date(timestamp);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
    }

    @state() firmWare: any
    @state() lasTime: any

    updated() {

    }

    firstUpdated() {
        console.log('this.asset?.asset?.id', this.asset2)
        manager.rest.api.AssetResource.getInfoLightByLightId({lightId: this.asset2?.asset?.id})
            .then((response) => {
                this.firmWare = response.data.firmwareVersion
                console.log('getAlldataRoute', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.AssetResource.queryLastTimeActive(this.asset2?.asset?.id)
            .then((response: any) => {
                this.lasTime = response.data
                console.log('getAlldataRoute2', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
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
    changeLinkDevice() {
        manager.rest.api.AssetResource.getAsset(this.asset?.asset?.path?.[0])
            .then((response) => {
                if(response?.data?.[0]?.asset?.type === "RoadAsset"){
                    const path = this.asset?.asset?.path?.[0] ?? 'defaultValue';
                    console.log('path', path)
                    console.log('path2', this.asset?.asset?.path?.[0])
                    window.location.hash = `/routes/info/device/${path}`
                    sessionStorage.setItem('assetIdChoose', JSON.stringify(this.asset));
                }else{
                    this.showWarningNotification(`Không nằm trong lộ nào`)
                }
               console.log('responseParent',response)

            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });



    }

    getLatestTimestampItem(data: any) {
        if (!data || typeof data !== 'object') return null;

        let latestItem = null;
        let latestTimestamp = -Infinity;

        for (const key in data) {
            const item = data[key];
            if (item && typeof item === 'object' && typeof item.timestamp === 'number') {
                if (item.timestamp > latestTimestamp) {
                    latestTimestamp = item.timestamp;
                    latestItem = item;
                }
            }
        }

        return latestItem;
    }

    protected render(): TemplateResult | undefined {
        console.log('this.341', this.asset2)
        console.log('this.3412', this.asset)
        const latestItem = this.getLatestTimestampItem(this.asset?.asset?.attributes);
        console.log('latestItem', latestItem)
        console.log('latestItem2', this.assetDetails)
        console.log('firmWarePageMap', this.firmWarePageMap)
        if (!this.asset) {
            return html``;
        }

        const icon = this.getIcon();
        const color = this.getColor();
        const styleStr = color ? "--internal-or-map-asset-card-header-color: #" + color + ";" : "";
        const cardConfig = this.getCardConfig();
        const attributes = Object.values(this.asset.asset?.attributes!).filter((attr) => attr.name !== WellknownAttributes.LOCATION);
        const includedAttributes = cardConfig && cardConfig.include ? cardConfig.include : undefined;
        const excludedAttributes = cardConfig && cardConfig.exclude ? cardConfig.exclude : [];
        const attrs = attributes.filter((attr) =>
            (!includedAttributes || includedAttributes.indexOf(attr.name!) >= 0)
            && (!excludedAttributes || excludedAttributes.indexOf(attr.name!) < 0)
            && (!attr.meta || !attr.meta.hasOwnProperty(WellknownMetaItems.SHOWONDASHBOARD) || !!Util.getMetaValue(WellknownMetaItems.SHOWONDASHBOARD, attr)))
            .sort(Util.sortByString((listItem) => listItem.name!));

        const highlightedAttr = getMarkerConfigAttributeName(this.markerconfig, this.asset.asset?.type);
        const listPhase = this.convertAttributesToPhaseArray(this.asset.asset?.attributes)
        console.log('listPhase', listPhase)
        return html`
            <div id="card-container" style="${styleStr}">
                <div id="header">
                    ${icon ? html`
                        <or-icon icon="${icon}"
                                 class="${this.asset?.asset?.attributes?.assetStatus?.value == 'D' ? 'blink-red-yellow' : ''}"
                                 style="${this.asset?.asset?.attributes?.assetStatus?.value === 'A' && this.asset.asset?.type === "LightAsset" ? `color:yellow` : `color:black`}"></or-icon>` : ``}
                    <span id="title">${this.asset.asset?.name}</span>
                    ${this.asset.asset?.type === "ElectricalCabinetAsset" ? " - " + this.asset.assetInfo?.assetCode : ""}
                </div>
                <div id="attribute-list">
                    ${this.asset.asset?.type === "ElectricalCabinetAsset" ? html`
                                <div>
                                    <p>Trạng thái tủ :
                                        <span style="${this.asset?.asset?.attributes?.assetStatus?.value == 'A'
                                                ? 'color: green;font-size:16px'
                                                : this.asset?.asset?.attributes?.assetStatus?.value == 'M'
                                                        ? 'color: yellow;font-size:16px'
                                                        : this.asset?.asset?.attributes?.assetStatus?.value == 'P'
                                                                ? 'color: red;font-size:16px'
                                                                : this.asset?.asset?.attributes?.assetStatus?.value == 'D'
                                                                        ? 'color: red;font-size:16px'
                                                                        : ''}">
                                    ${this.asset?.asset?.attributes?.assetStatus?.value == 'A'
                                            ? 'Hoạt động'
                                            : this.asset?.asset?.attributes?.assetStatus?.value == 'M'
                                                    ? 'Bảo trì'
                                                    : this.asset?.asset?.attributes?.assetStatus?.value == 'P'
                                                            ? 'Dừng hoạt động'
                                                            : this.asset?.asset?.attributes?.assetStatus?.value == 'D'
                                                                    ? 'Mất kết nối'
                                                                    : ''}
                                </span>
                                    </p>
                                    <!--                             <p>Kết nối : </p>-->
                                    <p>Đo điện năng tổng</p>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Phase</th>
                                            <th>U(Volt)</th>
                                            <th>I(A)</th>
                                            <th>P(W)</th>
                                            <th>Tiêu thụ(Wh)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${listPhase.map((item: any) => html`
                                            <tr>
                                                <td>${item.phase}</td>
                                                <td>${this.formatNumber(item.volt)}</td>
                                                <td>${this.formatNumber((item.amp) / 1000)}</td>
                                                <td>${this.formatNumber(item.watt)}</td>
                                                <td>${this.formatNumber(item.wattActual)}</td>
                                            </tr>
                                        `)}
                                        </tbody>
                                    </table>
                                    <p>Hoạt động gần nhất :
                                        ${latestItem?.timestamp ? this.formatDate(latestItem?.timestamp) : ""}</p>
                                    <label style="color: green" @click="${this.changeLinkDevice}">Xem chi tiết</label>
                                </div>
                            `
                            : ``}
                    ${this.asset.asset?.type === "LightAsset" ? html`
                        <div>
                            <p>Trạng thái đèn :
                                <span style="${
                                        this.asset?.asset?.attributes?.assetStatus?.value === 'A'
                                                ? 'color: green;font-size:16px'
                                                : this.asset?.asset?.attributes?.assetStatus?.value === 'I'
                                                        ? 'color: red;font-size:16px'
                                                        : this.asset?.asset?.attributes?.assetStatus?.value === 'D'
                                                                ? 'color: red;font-size:16px'
                                                                : ''
                                }"> ${this.asset?.asset?.attributes?.assetStatus?.value == 'A'
                                        ? 'Bật'
                                        : this.asset?.asset?.attributes?.assetStatus?.value == 'I'
                                                ? 'Tắt'
                                                : this.asset?.asset?.attributes?.assetStatus?.value == 'D'
                                                        ? 'Mất kết nối'
                                                        : ''}</span>
                            </p>
                            <p>Dim(%) :
                                ${this.asset?.asset?.attributes?.brightness?.value ? this.asset?.asset?.attributes?.brightness?.value : 0}</p>
                            <p>Công suất(W) :
                                ${this.asset?.asset?.attributes?.wattage?.value ? this.formatNumber(this.asset?.asset?.attributes?.wattage?.value) : 0}</p>
                            <p>Firmware : ${this.firmWarePageMap ? this.firmWarePageMap : this.firmWare}</p>
                            <p>Hoạt động gần nhất :
                                ${latestItem?.timestamp ? this.formatDate(latestItem?.timestamp) : ""}</p>
                            <label style="color: green" @click="${this.changeLinkDevice}">Xem chi tiết</label>

                        </div>

                    ` : ``}
                    ${this.asset.asset?.type === "FixedGroupAsset" ? html`
                        <div>
                            <p>Trạng thái đèn : <span style="${
                                    this.asset?.assetInfo?.statusAI === 'A'
                                            ? 'color: green;font-size:16px'
                                            : this.asset?.assetInfo?.statusAI === 'I'
                                                    ? 'color: red;font-size:16px'
                                                    : this.asset?.assetInfo?.statusAI === 'D'
                                                            ? 'color: red;font-size:16px'
                                                            : ''
                            }"> ${this.asset?.assetInfo?.statusAI == 'A'
                                    ? 'Bật'
                                    : this.asset?.assetInfo?.statusAI == 'I'
                                            ? 'Tắt'
                                            : this.asset?.assetInfo?.statusAI == 'D'
                                                    ? 'Mất kết nối'
                                                    : ''}</span></p>
                            <p>Dim :
                                ${this.asset?.asset?.attributes?.brightness?.value ? this.asset?.asset?.attributes?.brightness?.value : 0}</p>
                            <p>Công suất :
                                ${this.asset?.asset?.attributes?.wattageActual?.value ? this.formatNumber(this.asset?.asset?.attributes?.wattageActual?.value) : 0}</p>
                            <p>Hoạt động gần nhất : ${latestItem?.timestamp ? latestItem?.timestamp : ""}</p>
                            <label style="color: green" @click="${this.changeLinkDevice}">Xem chi tiết</label>

                        </div>

                    ` : ``}
                    ${this.asset.asset?.type === "LightGroupAsset" ? html`
                        <div>
                            <p>Trạng thái đèn : <span style="${this.asset?.asset?.attributes?.brightness?.value > 0
                                    ? 'color: green'
                                    : 'color:red'}">${this.asset?.asset?.attributes?.brightness?.value > 0
                                    ? 'Bật'
                                    : 'Tắt'}</span></p>
                            <p>Dim :
                                ${this.asset?.asset?.attributes?.brightness?.value ? this.asset?.asset?.attributes?.brightness?.value : 0}</p>
                            <p>Công suất :
                                ${this.asset?.asset?.attributes?.wattageActual?.value ? this.formatNumber(this.asset?.asset?.attributes?.wattageActual?.value) : 0}</p>
                            <p>Hoạt động gần nhất : ${latestItem?.timestamp ? latestItem?.timestamp : ""}</p>
                            <label style="color: green" @click="${this.changeLinkDevice}">Xem chi tiết</label>
                        </div>

                    ` : ``}
                </div>

            </div>
        `;
    }

    protected _loadAsset(assetId: string) {
        this.dispatchEvent(new OrMapAssetCardLoadAssetEvent(assetId));
    }

    protected getIcon(): string | undefined {
        if (this.asset) {
            const descriptor = AssetModelUtil.getAssetDescriptor(this.asset.asset?.type);
            const icon = getMarkerIconAndColorFromAssetType(descriptor)?.icon;
            return icon ? icon : undefined;
        }
    }

    protected getColor(): string | undefined {
        if (this.asset) {
            const descriptor = AssetModelUtil.getAssetDescriptor(this.asset.asset?.type);
            const color = getMarkerIconAndColorFromAssetType(descriptor)?.color;
            if (color) {
                // check if range
                return (typeof color === 'string') ? color : color![0].colour;
            }
        }
    }
}
