import {css, html} from "lit";
import {customElement, property, query, state} from "lit/decorators.js";
import {createSlice, Store, PayloadAction} from "@reduxjs/toolkit";
import "@openremote/or-map";
import {
    MapAssetCardConfig,
    OrMap,
    OrMapAssetCardLoadAssetEvent,
    OrMapClickedEvent,
    OrMapMarkerAsset,
    OrMapMarkerClickedEvent,
    OrMapGeocoderChangeEvent,
    MapMarkerAssetConfig
} from "@openremote/or-map";
import manager, {Util} from "@openremote/core";
import {createSelector} from "reselect";
import {
    Asset,
    AssetEvent,
    AssetEventCause, AssetInfo, AssetInfoDto,
    AssetQuery,
    Attribute,
    AttributeEvent,
    GeoJSONPoint,
    WellknownAttributes,
    WellknownMetaItems
} from "@openremote/model";
import {getAssetsRoute, getMapRoute} from "../routes";
import {AppStateKeyed, Page, PageProvider, router} from "@openremote/or-app";
import {GenericAxiosResponse} from "@openremote/rest";
import { i18next } from "@openremote/or-translate";
export interface MapState {
    assets:AssetInfoDto[];
    currentAssetId: string;
}

export interface MapStateKeyed extends AppStateKeyed {
    map: MapState;
}

const INITIAL_STATE: MapState = {
    assets: [],
    currentAssetId: undefined,
};
export interface MapState {
    assets: AssetInfoDto[];
    currentAssetId: string | undefined; // Adjust to allow undefined as per INITIAL_STATE
}

const pageMapSlice = createSlice({
    name: "pageMap",
    initialState: INITIAL_STATE,
    reducers: {
        assetEventReceived(state: MapState, action: PayloadAction<AssetEvent>) {

            if (action.payload.cause === AssetEventCause.CREATE) {
                // Update and delete handled by attribute handler

                const asset = action.payload.assetInfoDto;
                const locationAttr = asset?.asset?.attributes && asset?.asset?.attributes.hasOwnProperty(WellknownAttributes.LOCATION) ? asset.asset.attributes[WellknownAttributes.LOCATION] as Attribute<GeoJSONPoint> : undefined;
                if (locationAttr && (!locationAttr.meta || locationAttr.meta && (!locationAttr.meta.hasOwnProperty(WellknownMetaItems.SHOWONDASHBOARD) || !!locationAttr.meta[WellknownMetaItems.SHOWONDASHBOARD]))) {
                    return {
                        ...state,
                        assets: [...state.assets, action.payload.assetInfoDto]
                    };
                }
            }

            return state;
        },
        attributeEventReceived(state: MapState, action: PayloadAction<[string[], AttributeEvent]>) {
            const assets = state.assets;
            const attrsOfInterest = action.payload[0];
            const attrEvent = action.payload[1];
            const attrName = attrEvent.ref.name;
            const assetId = attrEvent.ref.id;
            const index = assets.findIndex((asst) => asst?.asset?.id === assetId);
            const asset = index >= 0 ? assets[index] : null;

            if (!asset) {
                return state;
            }

            if (attrName === WellknownAttributes.LOCATION && attrEvent.deleted) {
                return {
                    ...state,
                    assets: [...assets.splice(index, 1)]
                };
            }

            // Only react if attribute is an attribute of interest
            if (!attrsOfInterest.includes(attrName)) {
                return;
            }

            assets[index] = Util.updateAsset({...asset}, attrEvent);
            return state;
        },
        setAssets(state, action: PayloadAction<AssetInfoDto[]>) {
            return {
                ...state,
                assets: action.payload
            };
        },
    }
});

const {assetEventReceived, attributeEventReceived, setAssets} = pageMapSlice.actions;
export const pageMapReducer = pageMapSlice.reducer;

export interface PageMapConfig {
    card?: MapAssetCardConfig,
    assetQuery?: AssetQuery,
    markers?: MapMarkerAssetConfig
}

export function pageMapProvider(store: Store<MapStateKeyed>, config?: PageMapConfig): PageProvider<MapStateKeyed> {
    return {
        name: "map",
        routes: [
            "map",
            "map/:id"
        ],
        pageCreator: () => {
            const page = new PageMap(store);
            page.config = config || {};
            return page
        }
    };
}


@customElement("page-map")
export class PageMap extends Page<MapStateKeyed> {
    static get styles() {
        // language=CSS
        return css`
            or-map-asset-card {
                height: 35vh;
                position: absolute;
                bottom: 0;
                right: 0;
                width: 100vw;
                z-index: 3;
            }

            or-map {
                display: block;
                height: 100%;
                width: 100%;
            }

            @media only screen and (min-width: 415px){
                or-map-asset-card {
                    position: absolute;
                    top: 10px;
                    right: 50px;
                    width: 400px;
                    margin: 0;
                    height: 400px; /* fallback for IE */
                    height: max-content;
                    max-height: calc(100vh - 150px);
                }
            }
        `;
    }
    @state() _intervalId?:number
    @state() lastTimePageMap :any
    @state() firmWarePageMap :any

    @property()
    public config?: PageMapConfig;

    @query("#map")
    protected _map?: OrMap;

    @state()
    protected _assets: AssetInfoDto[] = [];

    @state()
    protected _currentAsset?: AssetInfoDto;

    protected _assetSelector = (state: MapStateKeyed) => state.map.assets;
    protected _paramsSelector = (state: MapStateKeyed) => state.app.params;
    protected _realmSelector = (state: MapStateKeyed) => state.app.realm || manager.displayRealm;

    protected assetSubscriptionId: string;
    protected attributeSubscriptionId: string;

    protected getAttributesOfInterest(): (string | WellknownAttributes)[] {
        // Extract all label attributes configured in marker config
        let markerLabelAttributes = [];

        if (this.config && this.config.markers) {
            markerLabelAttributes = Object.values(this.config.markers)
                .filter(assetTypeMarkerConfig => assetTypeMarkerConfig.attributeName)
                .map(assetTypeMarkerConfig => assetTypeMarkerConfig.attributeName);
        }

        return [
            ...markerLabelAttributes,
            WellknownAttributes.LOCATION,
            WellknownAttributes.DIRECTION,
            WellknownAttributes.BRIGHTNESS,
            WellknownAttributes.ASSETSTATUS
        ];
    }
    async fetchAssetDetails(assetId: string) {
        // manager.rest.api.AssetResource.queryLastTimeActive(assetId)
        //     .then((response:any) => {
        //         const lastTimeActive = response.data;
        //         this.lastTimePageMap =lastTimeActive
        //         console.log('getAlldataRoute2', response)
        //     })
        //     .catch((error) => {
        //         console.error('Lỗi khi lấy dữ liệu:', error);
        //     });
        manager.rest.api.AssetResource.getInfoLightByLightId({lightId:assetId})
            .then((response) => {
                this.firmWarePageMap = response.data.firmwareVersion
                console.log('getAlldataRoute', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    protected subscribeAssets = async (realm: string) => {
        let response: GenericAxiosResponse<AssetInfoDto[]>;
        const attrsOfInterest = this.getAttributesOfInterest();
        const assetQuery: AssetQuery = this.config && this.config.assetQuery ? this.config.assetQuery : {
            realm: {
                name: realm
            },
            select: {
                attributes: attrsOfInterest,
            },
            attributes: {
                items: [
                    {
                        name: {
                            predicateType: "string",
                            value: WellknownAttributes.LOCATION
                        },
                        meta: [
                            {
                                name: {
                                    predicateType: "string",
                                    value: WellknownMetaItems.SHOWONDASHBOARD
                                },
                                negated: true
                            },
                            {
                                name: {
                                    predicateType: "string",
                                    value: WellknownMetaItems.SHOWONDASHBOARD
                                },
                                value: {
                                    predicateType: "boolean",
                                    value: true
                                }
                            }
                        ]
                    }
                ]
            }
        };

        try {
            console.log('assetQuery',assetQuery)
            response = await manager.rest.api.AssetResource.queryAssets(assetQuery);
            const filterArray = response?.data?.filter((item)=>item?.assetInfo?.statusAI === "D" || item?.assetInfo?.statusAI === "M"  || item?.assetInfo?.statusAI === "P")
            if(filterArray.length ===1){
                this._map!.center = [filterArray[0].asset?.attributes?.location?.value.coordinates[0],filterArray[0].asset?.attributes?.location?.value.coordinates[1]];
                this._map!.zoom = 20
            }
            this.fetchCabinet()
            console.log('res',filterArray)
            if (!this.isConnected || realm !== this._realmSelector(this.getState())) {
                // No longer connected or realm has changed
                return;
            }

            if (response.data) {
                const assets = response.data;
                console.log('' +
                    '',assets)
                this._store.dispatch(setAssets(assets));
                const assetSubscriptionId = await manager.events.subscribeAssetEvents(undefined, false, (event) => {
                    console.log('event',event)
                    this._store.dispatch(assetEventReceived(event));
                    const assetId = event.asset?.id;
                    console.log('event.assetInfoDto',event.asset)
                    if (assetId) {
                         this.fetchAssetDetails(assetId); // <--- fetchAssetDetails is called here
                    }
                });
                console.log('assetSubscriptionId',assetSubscriptionId)

                if (!this.isConnected || realm !== this._realmSelector(this.getState())) {
                    manager.events.unsubscribe(assetSubscriptionId);
                    return;
                }

                this.assetSubscriptionId = assetSubscriptionId;

                const attributeSubscriptionId = await manager.events.subscribeAttributeEvents(undefined, false, (event) => {
                    this._store.dispatch(attributeEventReceived([attrsOfInterest, event]));
                });

                if (!this.isConnected || realm !== this._realmSelector(this.getState())) {
                    this.assetSubscriptionId = undefined;
                    manager.events.unsubscribe(assetSubscriptionId);
                    manager.events.unsubscribe(attributeSubscriptionId);
                    return;
                }

                this.attributeSubscriptionId = attributeSubscriptionId;
            }
        } catch (e) {
            console.error("Failed to subscribe to assets", e)
        }
    };

    protected unsubscribeAssets = () => {
        if (this.assetSubscriptionId) {
            manager.events.unsubscribe(this.assetSubscriptionId);
            this.assetSubscriptionId = undefined;
        }
        if (this.attributeSubscriptionId) {
            manager.events.unsubscribe(this.attributeSubscriptionId);
            this.attributeSubscriptionId = undefined;
        }
    };

    protected getRealmState = createSelector(
        [this._realmSelector],
        async (realm) => {
            if (this._assets.length > 0) {
                // Clear existing assets
                this._assets = [];
            }
            this.unsubscribeAssets();
            this.subscribeAssets(realm);

            if (this._map) {
                this._map.refresh();
            }
        }
    )

    protected _getMapAssets = createSelector(
        [this._assetSelector],
        (assets) => {
            return assets;
        });

    protected _getCurrentAsset = createSelector(
        [this._assetSelector, this._paramsSelector],
        (assets, params) => {
            const currentId = params ? params.id : undefined;

            if (!currentId) {
                return null;
            }

            return assets.find((asset) => asset.asset.id === currentId);
        });

    protected _setCenter(geocode: any) {
        this._map!.center = [geocode.geometry.coordinates[0], geocode.geometry.coordinates[1]];
        // this._map!.zoom=15
    }

    get name(): string {
        return "map";
    }

    constructor(store: Store<MapStateKeyed>) {
        super(store);
        this.addEventListener(OrMapAssetCardLoadAssetEvent.NAME, this.onLoadAssetEvent);
    }


    @state() private isDeleteDialogOpen = false;
    @state()  idCabinet :any
    @state()  dataFilterCabinet = []
    openDeleteDialog() {
        this.isDeleteDialogOpen = true;
    }
    handleCabinet(e) {
        if (!e.detail.value) {
            this.idCabinet = ""
        }
        console.log('aaa',e.detail.value)
        this.idCabinet = e.detail.value
    }
    async fetchCabinet(){
        manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:window.sessionStorage.getItem('realm'),type:"ElectricalCabinetAsset"}}})
            .then((response) => {
                console.log('response2',response)
                const cabinetAssets = response.data.map(item => item.cabinetAsset);
                console.log('response3',cabinetAssets)
                this.dataFilterCabinet = cabinetAssets
                console.log('getAllCabinets', cabinetAssets)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }

    handleOpenedChanged(e: CustomEvent) {
        console.log('ads',e.detail.value)

        if (e.detail.value === true) {
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay');
                const resizer = overlay?.shadowRoot?.querySelector('.resizer-container') as HTMLElement;
                const content = overlay?.shadowRoot?.querySelector('[part="content"]') as HTMLElement;

                if (resizer) {
                    resizer.style.padding = '0px'; // Hoặc các style khác bạn muốn
                    resizer.style.overflow = 'hidden'; // ví dụ
                }
                if (content) {
                    content.style.padding = '0px';
                }
            }, 100);
        }else{
            this.isDeleteDialogOpen = false;
        }
    }
    cancelDelete() {
        this.isDeleteDialogOpen = false;

    }
    confirmDelete() {
        console.log('idCabinet',this.idCabinet)
        this._map!.center = [this.idCabinet?.attributes?.location?.value.coordinates[0],this.idCabinet?.attributes?.location?.value.coordinates[1]];
        router.navigate(getMapRoute(this.idCabinet?.id));
        this.isDeleteDialogOpen = false;
    }
    protected render() {
        console.log('this.assets22',this._assets)
        console.log('current',this._currentAsset)
        const filteredArray = this._assets.filter(item => item.asset?.type !== "FixedGroupAsset");
        return html`
<vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpen}" @opened-changed="${this.handleOpenedChanged}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Tìm kiếm tủ</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <div style="margin: 0 20px">
                            <vaadin-combo-box
                                    clear-button-visible
                                    label="${i18next.t("CabinetName")}"
                                    item-label-path="name"
                                    item-value-path="id"
                                    .value="${this.idCabinet?.id}"
                                    .items="${this.dataFilterCabinet}"
                                    @selected-item-changed="${this.handleCabinet}"
                                    style="width: 100%">
                            </vaadin-combo-box>
                        </div>
                       
                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDelete}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Tìm kiếm</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
            ${this._currentAsset ? html `<or-map-asset-card .firmWarePageMap="${this.firmWarePageMap}" .asset2="${this._currentAsset}" .config="${this.config?.card}" .assetId="${this._currentAsset.asset.id}" .markerconfig="${this.config?.markers}"></or-map-asset-card>` : ``}
            <or-map style="position: relative" id="map" class="or-map" showGeoCodingControl @or-map-geocoder-change="${(ev: OrMapGeocoderChangeEvent) => {this._setCenter(ev.detail.geocode);}}">
                    ${
                            filteredArray.filter((asset) => {
                                if (!asset.asset?.attributes) {
                                    return false;
                                }
                                const attr = asset.asset?.attributes[WellknownAttributes.LOCATION] as Attribute<GeoJSONPoint>;
                                return !attr?.meta || !attr?.meta.hasOwnProperty(WellknownMetaItems.SHOWONDASHBOARD) || !!Util.getMetaValue(WellknownMetaItems.SHOWONDASHBOARD, attr);
                            })
                                    .sort((a,b) => {
                                        if (a.asset?.attributes[WellknownAttributes.LOCATION]?.value && b.asset?.attributes[WellknownAttributes.LOCATION]?.value){
                                            return b.asset?.attributes[WellknownAttributes.LOCATION]?.value.coordinates[1] - a.asset?.attributes[WellknownAttributes.LOCATION]?.value.coordinates[1];
                                        } else {
                                            return;
                                        }
                                    })
                                    .map(asset => {
                                        console.log('mapmaker',asset)
                                        return html`
                                        ${asset.asset.type === "FixedGroupAsset" || asset.asset.type === "LightGroupAsset" ? html``:html`<or-map-marker-asset ?active="${this._currentAsset && this._currentAsset.asset.id === asset.asset.id}" .asset="${asset}" .config="${this.config.markers}"></or-map-marker-asset>`
                                        }
                                       
                                    `;
                                    })
                    }
                </or-map>
            <vaadin-button style="background: white;color: gray;position: absolute;top:50px;left: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;cursor: pointer" @click="${() => this.openDeleteDialog()}">
                Tìm tủ
            </vaadin-button>
        `;
    }

    public connectedCallback() {
        super.connectedCallback();
        this.addEventListener(OrMapMarkerClickedEvent.NAME, this.onMapMarkerClick);
        this.addEventListener(OrMapClickedEvent.NAME, this.onMapClick);
        // const realm = this._realmSelector(this.getState());
        // this.subscribeAssets(realm);
        // this._intervalId = window.setInterval(() => {
        //     const currentRealm = this._realmSelector(this.getState());
        //     this.subscribeAssets(currentRealm);
        // }, 2 * 60 * 1000);
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener(OrMapMarkerClickedEvent.NAME, this.onMapMarkerClick);
        this.removeEventListener(OrMapClickedEvent.NAME, this.onMapClick);
        this.unsubscribeAssets();
        // if (this._intervalId) {
        //     clearInterval(this._intervalId);
        //     this._intervalId = undefined;
        // }
    }

    stateChanged(state: MapStateKeyed) {
        this._assets = this._getMapAssets(state);
        console.log('statechange',this._getMapAssets(state))
        this._currentAsset = this._getCurrentAsset(state);
        console.log('this._getCurrentAsset(state)',this._getCurrentAsset(state))

        console.log('this.gteRema(state)',this.getRealmState(state))
    }

    protected onMapMarkerClick(e: OrMapMarkerClickedEvent) {
        const asset = (e.detail.marker as OrMapMarkerAsset).asset;
        console.log('asset',asset)
        router.navigate(getMapRoute(asset.asset?.id));
    }

    protected onMapClick(e: OrMapClickedEvent) {
        console.log('aacasc')
        router.navigate(getMapRoute());
    }

    protected getCurrentAsset() {
        this._getCurrentAsset(this.getState());
    }

    protected onLoadAssetEvent(loadAssetEvent: OrMapAssetCardLoadAssetEvent) {
        router.navigate(getAssetsRoute(false, loadAssetEvent.detail));
    }
}
