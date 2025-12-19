import {AssetDatapointLTTBQuery, AssetDatapointQueryUnion, Attribute, AttributeRef, ValueDatapoint, AssetModelUtil, ReadAttributeEvent} from "@openremote/model";
import {html, PropertyValues, TemplateResult, css, unsafeCSS} from "lit";
import { when } from "lit/directives/when.js";
import {TimePresetCallback} from "@openremote/or-chart";
import moment from "moment";
import {OrAssetWidget} from "../util/or-asset-widget";
import { customElement, state } from "lit/decorators.js";
import {WidgetConfig} from "../util/widget-config";
import {OrWidget, WidgetManifest} from "../util/or-widget";
import {ChartSettings} from "../settings/chart-settings";
import {WidgetSettings} from "../util/widget-settings";
import {manager, Util, DefaultColor3} from "@openremote/core";
import {getAssetDescriptorIconTemplate} from "@openremote/or-icon";
import "@openremote/or-chart";

export interface ChartWidgetConfig extends WidgetConfig {
    attributeRefs: AttributeRef[];
    rightAxisAttributes: AttributeRef[];
    datapointQuery: AssetDatapointQueryUnion;
    chartOptions?: any; // ChartConfiguration<"line", ScatterDataPoint[]>
    showTimestampControls: boolean;
    defaultTimePresetKey: string;
    showLegend: boolean;
}

function getDefaultTimePresetOptions(): Map<string, TimePresetCallback> {
    return new Map<string, TimePresetCallback>([
        ["lastHour", (date: Date) => [moment(date).subtract(1, 'hour').toDate(), date]],
        ["last24Hours", (date: Date) => [moment(date).subtract(24, 'hours').toDate(), date]],
        ["last7Days", (date: Date) => [moment(date).subtract(7, 'days').toDate(), date]],
        ["last30Days", (date: Date) => [moment(date).subtract(30, 'days').toDate(), date]],
        ["last90Days", (date: Date) => [moment(date).subtract(90, 'days').toDate(), date]],
        ["last6Months", (date: Date) => [moment(date).subtract(6, 'months').toDate(), date]],
        ["lastYear", (date: Date) => [moment(date).subtract(1, 'year').toDate(), date]],
        ["thisHour", (date: Date) => [moment(date).startOf('hour').toDate(), moment(date).endOf('hour').toDate()]],
        ["thisDay", (date: Date) => [moment(date).startOf('day').toDate(), moment(date).endOf('day').toDate()]],
        ["thisWeek", (date: Date) => [moment(date).startOf('isoWeek').toDate(), moment(date).endOf('isoWeek').toDate()]],
        ["thisMonth", (date: Date) => [moment(date).startOf('month').toDate(), moment(date).endOf('month').toDate()]],
        ["thisYear", (date: Date) => [moment(date).startOf('year').toDate(), moment(date).endOf('year').toDate()]],
        ["yesterday", (date: Date) => [moment(date).subtract(24, 'hours').startOf('day').toDate(), moment(date).subtract(24, 'hours').endOf('day').toDate()]],
        ["thisDayLastWeek", (date: Date) => [moment(date).subtract(1, 'week').startOf('day').toDate(), moment(date).subtract(1, 'week').endOf('day').toDate()]],
        ["previousWeek", (date: Date) => [moment(date).subtract(1, 'week').startOf('isoWeek').toDate(), moment(date).subtract(1, 'week').endOf('isoWeek').toDate()]],
        ["previousMonth", (date: Date) => [moment(date).subtract(1, 'month').startOf('month').toDate(), moment(date).subtract(1, 'month').endOf('month').toDate()]],
        ["previousYear", (date: Date) => [moment(date).subtract(1, 'year').startOf('year').toDate(), moment(date).subtract(1, 'year').endOf('year').toDate()]]
    ]);
}

function getDefaultSamplingOptions(): Map<string, string> {
    return new Map<string, string>([["lttb", 'lttb'], ["withInterval", 'interval']]);
}

function getDefaultWidgetConfig(): ChartWidgetConfig {
    const preset = "last24Hours"
    const dateFunc = getDefaultTimePresetOptions().get(preset) as TimePresetCallback;
    const dates = dateFunc(new Date());
    return {
        attributeRefs: [],
        rightAxisAttributes: [],
        datapointQuery: {
            type: "lttb",
            fromTimestamp: dates[0].getTime(),
            toTimestamp: dates[1].getTime(),
            amountOfPoints: 100
        },
        chartOptions: {
            options: {
                scales: {
                    y: {
                        min: undefined,
                        max: undefined
                    },
                    y1: {
                        min: undefined,
                        max: undefined
                    }
                },
                plugins: {
                    datalabels: {
                        display: false,
                        formatter: () => ""
                    },
                    tooltip: {
                        enabled: true,
                        displayColors: false
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 4,
                        borderWidth: 0,
                        display: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            },
        },
        showTimestampControls: false,
        defaultTimePresetKey: preset,
        showLegend: true
    };
}

/* --------------------------------------------------- */

const chartWidgetStyle = css`
    .chart-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    
    .value-wrapper {
        width: 100%;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        padding: 8px 0;
        min-height: 50px;
    }
    
    .value-icon {
        font-size: 24px;
        margin-right: 10px;
        display: flex;
    }
    
    .value-number {
        color: var(--internal-or-asset-viewer-title-text-color, #333);
        font-size: 36px;
        font-weight: 500;
    }
    
    .value-unit {
        font-size: 36px;
        color: var(--internal-or-asset-viewer-title-text-color, #333);
        font-weight: 300;
        margin-left: 4px;
    }
    
    .chart-wrapper {
        flex: 1;
        position: relative;
        min-height: 0;
        width: 100%;
    }
    
    .delta-wrapper {
        position: absolute;
        top: 8px;
        right: 16px;
        z-index: 10;
        text-align: right;
    }
    
    .delta {
        color: var(--or-app-color3, ${unsafeCSS(DefaultColor3)});
        font-weight: bold;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.9);
        padding: 2px 6px;
        border-radius: 4px;
    }
`;

@customElement('chart-widget')
export class ChartWidget extends OrAssetWidget {

    static get styles() {
        return [chartWidgetStyle];
    }

    @state()
    protected datapointQuery!: AssetDatapointQueryUnion;
    
    @state()
    protected currentValue?: number;
    
    @state()
    protected formattedValue?: {value: number, unit: string};
    
    @state()
    protected delta?: {val?: number, unit?: string};
    
    @state()
    protected deltaPlus: string = "";
    
    @state()
    protected datapoints?: ValueDatapoint<any>[];

    // Override of widgetConfig with extended type
    protected widgetConfig!: ChartWidgetConfig;

    static getManifest(): WidgetManifest {
        return {
            displayName: "Line Chart",
            displayIcon: "chart-line",
            minColumnWidth: 2,
            minColumnHeight: 2,
            getContentHtml(config: ChartWidgetConfig): OrWidget {
                return new ChartWidget(config);
            },
            getSettingsHtml(config: ChartWidgetConfig): WidgetSettings {
                const settings = new ChartSettings(config);
                settings.setTimePresetOptions(getDefaultTimePresetOptions());
                settings.setSamplingOptions(getDefaultSamplingOptions());
                return settings;
            },
            getDefaultConfig(): ChartWidgetConfig {
                return getDefaultWidgetConfig();
            }
        }
    }

    // Method called on every refresh/reload of the widget
    // We either refresh the datapointQuery or the full widgetConfig depending on the force parameter.
    // TODO: Improve this to a more efficient approach, instead of duplicating the object
    public refreshContent(force: boolean) {
        if(!force) {
            const datapointQuery = JSON.parse(JSON.stringify(this.widgetConfig.datapointQuery)) as AssetDatapointQueryUnion;
            datapointQuery.fromTimestamp = undefined;
            datapointQuery.toTimestamp = undefined;
            this.datapointQuery = datapointQuery;
        } else {
            this.widgetConfig = JSON.parse(JSON.stringify(this.widgetConfig)) as ChartWidgetConfig;
        }
    }


    /* ---------------------------------- */

    // WebComponent lifecycle method, that occurs DURING every state update
    protected willUpdate(changedProps: PropertyValues) {

        // Add datapointQuery if not set yet (due to migration)
        if(!this.widgetConfig.datapointQuery) {
            this.widgetConfig.datapointQuery = this.getDefaultQuery();
            if(!changedProps.has("widgetConfig")) {
                changedProps.set("widgetConfig", this.widgetConfig);
            }
        }

        if(changedProps.has('widgetConfig') && this.widgetConfig) {
            this.datapointQuery = this.widgetConfig.datapointQuery;
        }

        return super.willUpdate(changedProps);
    }

    // WebComponent lifecycle method, that occurs AFTER every state update
    protected updated(changedProps: Map<string, any>) {
        super.updated(changedProps);

        // If widgetConfig, and the attributeRefs of them have changed...
        if(changedProps.has("widgetConfig") && this.widgetConfig) {
            const attributeRefs = this.widgetConfig.attributeRefs;
            const missingAssets = attributeRefs?.filter((attrRef: AttributeRef) => !this.isAttributeRefLoaded(attrRef));
            if (missingAssets.length > 0) {

                // Fetch the new list of assets
                this.fetchAssets(attributeRefs).then((assets) => {
                    this.loadedAssets = assets;
                    this.assetAttributes = attributeRefs?.map((attrRef: AttributeRef) => {
                        const assetIndex = assets.findIndex((asset) => asset.asset?.id === attrRef.id);
                        const foundAsset = assetIndex >= 0 ? assets[assetIndex] : undefined;
                        return foundAsset && foundAsset.asset?.attributes ? [assetIndex, foundAsset.asset?.attributes[attrRef.name!]] : undefined;
                    }).filter((indexAndAttr: any) => !!indexAndAttr) as [number, Attribute<any>][];
                    
                    // Load current value and datapoints for first attribute
                    if (this.assetAttributes && this.assetAttributes.length > 0 && this.datapointQuery) {
                        this.loadCurrentValueAndDelta();
                    }
                });

            }
        }
        
        // Load current value when datapointQuery changes
        if (changedProps.has("datapointQuery") && this.assetAttributes && this.assetAttributes.length > 0) {
            this.loadCurrentValueAndDelta();
        }
        
        return super.updated(changedProps);
    }
    
    protected async loadCurrentValueAndDelta() {
        if (!this.loadedAssets || !this.assetAttributes || this.assetAttributes.length === 0) {
            return;
        }
        
        const [assetIndex, attribute] = this.assetAttributes[0];
        const asset = this.loadedAssets[assetIndex];
        
        if (!asset || !attribute) {
            return;
        }
        
        // Get current value from attribute
        this.currentValue = attribute.value;
        this.formattedValue = this.getFormattedValue(this.currentValue, attribute, asset.asset?.type);
        this.requestUpdate();
        
        // Get datapoints to calculate delta
        if (this.datapointQuery && asset.asset?.id && attribute.name) {
            try {
                const response = await manager.rest.api.AssetDatapointResource.getDatapoints(
                    asset.asset.id,
                    attribute.name,
                    this.datapointQuery
                );
                
                if (response.status === 200 && response.data) {
                    this.datapoints = response.data;
                    const firstVal = this.getFirstKnownMeasurement(this.datapoints);
                    const lastVal = this.getLastKnownMeasurement(this.datapoints);
                    this.delta = this.getFormattedDelta(firstVal, lastVal);
                    this.deltaPlus = this.delta && this.delta.val! > 0 ? "+" : "";
                    this.requestUpdate();
                }
            } catch (e) {
                console.error("Failed to load datapoints for delta calculation", e);
            }
        }
    }
    
    protected getFirstKnownMeasurement(data: ValueDatapoint<any>[]): number {
        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i].y !== undefined && data[i].y !== null) {
                return data[i].y;
            }
        }
        return 0;
    }
    
    protected getLastKnownMeasurement(data: ValueDatapoint<any>[]): number {
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i] && data[i].y !== undefined && data[i].y !== null) {
                return data[i].y;
            }
        }
        return 0;
    }
    
    protected getFormattedDelta(firstVal: number, lastVal: number): {val?: number, unit?: string} {
        return {val: Math.round(lastVal - firstVal), unit: ""};
    }
    
    protected getFormattedValue(value: number | undefined, attribute: Attribute<any>, assetType?: string): {value: number, unit: string} | undefined {
        if (value === undefined || !attribute.name || !assetType) {
            return undefined;
        }
        
        const roundedVal = +value.toFixed(0);
        const attributeDescriptor = AssetModelUtil.getAttributeDescriptor(attribute.name, assetType);
        const units = Util.resolveUnits(Util.getAttributeUnits(attribute, attributeDescriptor, assetType));
        
        if (!units) {
            return {value: roundedVal, unit: ""};
        }
        
        return {
            value: roundedVal,
            unit: units
        };
    }

    protected render(): TemplateResult {
        return html`
            ${when(this.loadedAssets && this.assetAttributes && this.loadedAssets.length > 0 && this.assetAttributes.length > 0, () => {
                const [assetIndex, attribute] = this.assetAttributes[0];
                const asset = this.loadedAssets[assetIndex];
                return html`
                    <div class="chart-container">
                        <div class="value-wrapper">
                            ${asset ? getAssetDescriptorIconTemplate(AssetModelUtil.getAssetDescriptor(asset.asset?.type!)) : ""}
                            <span class="value-number">${this.formattedValue ? this.formattedValue.value : ""}</span>
                            <span class="value-unit">${this.formattedValue ? this.formattedValue.unit : ""}</span>
                        </div>
                        <div class="chart-wrapper">
                            <div class="delta-wrapper">
                                <span class="delta">${this.delta ? this.deltaPlus + (this.delta.val !== undefined && this.delta.val !== null ? this.delta.val : "") + (this.delta.unit || "") : ""}</span>
                            </div>
                            <or-chart .assets="${this.loadedAssets}" .assetAttributes="${this.assetAttributes}" .rightAxisAttributes="${this.widgetConfig.rightAxisAttributes}"
                                      .showLegend="${(this.widgetConfig?.showLegend != null) ? this.widgetConfig?.showLegend : true}"
                                      .attributeControls="${false}" .timestampControls="${!this.widgetConfig?.showTimestampControls}"
                                      .timePresetOptions="${getDefaultTimePresetOptions()}" .timePresetKey="${this.widgetConfig?.defaultTimePresetKey}"
                                      .datapointQuery="${this.datapointQuery}" .chartOptions="${this.widgetConfig?.chartOptions}"
                                      style="height: 100%; width: 100%;"
                            ></or-chart>
                        </div>
                    </div>
                `;
            }, () => {
                return html`
                    <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
                        <span><or-translate value="noAttributesConnected"></or-translate></span>
                    </div>
                `
            })}
        `;
    }

    protected getDefaultQuery(): AssetDatapointLTTBQuery {
        return {
            type: "lttb",
            fromTimestamp: moment().set('minute', -60).toDate().getTime(),
            toTimestamp: moment().set('minute', 60).toDate().getTime(),
            amountOfPoints: 100
        }
    }
}
