import { css, html, LitElement } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "@vaadin/combo-box"
import "@openremote/or-icon"
import "@vaadin/horizontal-layout"
import "@vaadin/date-picker"
import "@vaadin/time-picker"
import "@vaadin/icon"
import "@vaadin/icons"
import manager from "@openremote/core"
import "@vaadin/dialog"
import "@vaadin/checkbox"
import "@vaadin/checkbox-group"
import "@vaadin/text-field"
import "@vaadin/button"

export interface TimeSlot {
    startTime: string
    endTime: string
    brightness: number
    lightTypes?: LightType[]
}

export interface LampTypeDTO {
    id?: any
    powerConsumption?: number
}

export interface AssetDTO {
    id?: any
    name?: any
    type?: any
    assetTypeCode?: any
    assets?: any[]
}

export interface LightType {
    type: string
    brightness: number
}

export interface SchTimePeriod {
    time_id?: number
    time_value?: number
    time_from?: any
    time_to?: any
}

export interface CustomizeLampType {
    time_id?: any
    lamp_type_id?: any
    lamp_type_code?: any
    lamp_type_name?: any
    lamp_type_value?: any
}

export interface TimeConfiguration {
    timePeriod?: SchTimePeriod
    lampTypes?: CustomizeLampType[]
}

export interface ScheduleAsset {
    id?: any
    scheduleId?: any
    asset_id?: any
    sys_asset_id?: any
    assetId?: any
    assetName?: any
    assetType?: any
}

export interface ScheduleInfo {
    id?: any
    scheduleCode?: any
    scheduleName?: any
    realm?: any
    active?: any
    schType?: any
    schFromDate?: number
    schToDate?: number
    schRepeatOccu?: any
    isSchRepeatEnd?: any
    schTimePeriods?: SchTimePeriod[]
    customizeLampType?: CustomizeLampType[]
    deleted?: any
    description?: any
    createDate?: number
    createBy?: any
    updateDate?: number
    updateBy?: any
    timeConfigurations?: TimeConfiguration[]
    scheduleAssets?: ScheduleAsset[]
}

export interface DeviceTreeNode {
    id: string
    name: string
    type: string
    assetTypeCode?: string
    assetTypeId?: string
    parentId?: string
    children: DeviceTreeNode[]
    isType: boolean
    isAsset: boolean
}

@customElement("schedule-create")
export class ScheduleCreate extends LitElement {
    static get styles() {
        return css`
            :host {
                width: 60%;
                padding: 24px;
                background-color: white;
                margin-left: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                border-radius: 8px;
                height: 100%;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            }

            .field-container {
                position: relative;
                display: flex;
                flex-direction: column;
                width: 100%;
            }

            .field-label {
                width: 180px;
                font-size: 14px;
                color: #555;
                font-weight: 500;
                display: inline-block;
                text-align: left;
                margin-bottom: 6px;
            }

            .required-asterisk {
                color: #e53935;
                margin-left: 4px;
                font-weight: bold;
            }

            /* Increase specificity to override Vaadin styles */
            vaadin-combo-box::part(label),
            vaadin-text-field::part(label) {
                display: none !important;
            }

            .form-title {
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 24px;
                text-align: center;
                color: #4D9D2A;
                padding-bottom: 16px;
                border-bottom: 1px solid #eaeaea;
            }

            .form-row {
                display: flex;
                margin-bottom: 20px;
                align-items: flex-start;
            }

            .form-label {
                width: 180px; /* Increase width to accommodate all labels */
                font-size: 14px;
                color: #555;
                font-weight: 500;
                display: inline-block; /* Ensure consistent display */
                text-align: left; /* Ensure consistent alignment */
            }

            .form-field {
                flex: 1;
                max-width: calc(100% - 180px);
            }

            .date-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
                gap: 20px;
            }

            .date-group {
                width: 48%;
            }

            .date-label {
                font-size: 14px;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }

            input[type="text"],
            input[type="date"],
            input[type="time"],
            textarea {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
                max-width: 100%;
            }

            input[type="text"]:focus, input[type="date"]:focus, input[type="time"]:focus, textarea:focus {
                border-color: #4D9D2A;
                box-shadow: 0 0 0 2px rgba(77, 157, 42, 0.2);
                outline: none;
            }

            input[type="text"]:read-only, input[type="date"]:read-only, input[type="time"]:read-only {
                background-color: #f9f9f9;
                color: #666;
            }

            textarea {
                min-height: 100px;
                resize: vertical;
            }

            .radio-group {
                display: flex;
                gap: 24px;
                margin: 18px 0;
                margin-left: 140px;
            }

            .radio-option {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .radio-option input[type="radio"] {
                accent-color: #4D9D2A;
                width: 16px;
                height: 16px;
            }

            .time-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
                gap: 20px;
                margin-left: 140px;
            }

            .time-group {
                width: 48%;
            }

            .checkbox-container {
                margin: 18px 0;
                margin-left: 140px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .checkbox-container input[type="checkbox"] {
                accent-color: #4D9D2A;
                width: 16px;
                height: 16px;
            }

            .button-group {
                margin-top: 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .save-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.2s;
            }

            .save-button:hover {
                background-color: #3c7c21;
            }

            .secondary-button {
                background-color: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.2s;
            }

            .secondary-button:hover {
                background-color: #e8e8e8;
            }

            .add-row-button {
                background: none;
                border: none;
                color: #4D9D2A;
                cursor: pointer;
                display: flex;
                align-items: center;
                padding: 8px 12px;
                margin: 12px 0;
                font-size: 14px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .add-row-button:hover {
                background-color: rgba(77, 157, 42, 0.1);
            }

            .schedule-section {
                margin-top: 24px;
                margin-bottom: 24px;
            }

            .schedule-section-title {
                font-weight: 600;
                margin-bottom: 16px;
                color: #333;
            }

            .day-buttons {
                display: flex;
                gap: 12px;
                margin-top: 16px;
            }

            .day-button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .day-button.selected {
                background-color: #4D9D2A;
                color: white;
                border-color: #4D9D2A;
            }

            .day-button:hover:not(.selected) {
                background-color: #e8e8e8;
            }

            .tab-buttons {
                display: flex;
                margin-bottom: 24px;
                border-radius: 6px;
                overflow: hidden;
                width: 400px;
            }

            .tab-button {
                padding: 10px 20px;
                border: none;
                background-color: #f5f5f5;
                cursor: pointer;
                font-size: 14px;
                flex: 1;
                transition: all 0.2s;
                font-weight: 500;
            }

            .tab-button.active {
                background-color: #4D9D2A;
                color: white;
            }

            .tab-button:hover:not(.active) {
                background-color: #e8e8e8;
            }

            .device-panel {
                margin-top: 20px;
                border: 1px solid #eaeaea;
                border-radius: 6px;
                padding: 16px;
            }

            .device-panel-header {
                font-weight: 600;
                margin-bottom: 16px;
                color: #333;
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal {
                background: white;
                border-radius: 8px;
                padding: 24px;
                min-width: 400px;
                max-width: 600px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }

            .tree-container {
                height: 350px;
                overflow-y: auto;
                border: 1px solid #eaeaea;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .tree-node {
                display: flex;
                flex-direction: column;
                margin-bottom: 4px;
            }

            .node-content {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 0 12px;
                border-radius: 6px;
                transition: background 0.2s;
            }

            .node-content:hover {
                background: #f0f4f8;
            }

            .node-icon.material-icons {
                font-size: 22px;
                color: #4D9D2A;
                margin-right: 8px;
            }

            .checkbox {
                width: 22px;
                height: 22px;
                margin-right: 10px;
            }

            .expand-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
                user-select: none;
            }

            .expand-icon-placeholder {
                width: 20px;
            }

            .checkbox {
                width: 18px;
                height: 18px;
                border: 2px solid #ccc;
                border-radius: 3px;
                margin: 0 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .checkbox.full {
                background-color: #4CAF50;
                border-color: #4CAF50;
                color: white;
            }

            .checkbox.partial {
                background-color: #9E9E9E;
                border-color: #9E9E9E;
                color: white;
            }

            .checkbox:hover {
                border-color: #4CAF50;
            }

            .node-name {
                font-size: 14px;
                color: #333;
                user-select: none;
            }

            .search-box {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                margin-bottom: 16px;
            }

            .button-container {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 16px;
            }

            .save-button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }

            .cancel-button {
                background-color: #9E9E9E;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }

            .light-type-cell {
                cursor: pointer;
                color: #4D9D2A;
                text-decoration: underline;
                transition: color 0.2s;
            }

            .light-type-cell:hover {
                color: #3c7c21;
            }

            .light-type-table {
                width: 100%;
            }

            .light-type-row {
                display: flex;
                margin-bottom: 12px;
                align-items: center;
            }

            .light-type-cell-gray {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 6px;
                width: 100px;
                text-align: center;
                margin-right: 12px;
                border: 1px solid #eaeaea;
            }

            .light-type-actions {
                display: flex;
                gap: 8px;
            }

            table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-bottom: 24px;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            th, td {
                border: 1px solid #eaeaea;
                padding: 12px 16px;
                text-align: left;
                color: #333;
            }

            th {
                background-color: #4D9D2A;
                font-weight: 500;
                color: white;
                border-color: #3c7c21;
            }

            tr:nth-child(even) {
                background-color: #f9f9f9;
            }

            tr:hover {
                background-color: #f5f5f5;
            }

            .action-cell {
                display: flex;
                gap: 8px;
                justify-content: center;
                align-items: center;
                height: 65px;
            }

            .action-button {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                width: 32px;
                height: 32px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .action-button:hover {
                background-color: #f0f0f0;
                color: #333;
            }

            .device-tree-modal {
                width: 500px;
                max-height: 600px;
                overflow: hidden; /* Changed from overflow-y: auto to prevent double scrollbars */
            }

            .tree-container {
                max-height: 400px;
                overflow-y: auto;
                border: 1px solid #eaeaea;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .tree-item {
                padding: 10px 6px;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s;
            }

            .tree-item:hover {
                background-color: #f9f9f9;
            }

            .tree-item:last-child {
                border-bottom: none;
            }

            .tree-item-row {
                display: flex;
                align-items: center;
            }

            .tree-item-content {
                display: flex;
                align-items: center;
                cursor: pointer;
                margin-left: 8px;
                flex: 1;
            }

            .tree-toggle-icon, .tree-toggle-icon-placeholder {
                display: inline-block;
                width: 16px;
                text-align: center;
                margin-right: 6px;
                cursor: pointer;
                color: #666;
            }

            .tree-type-item {
                font-weight: 600;
                background-color: #f5f5f5;
                padding: 10px;
                margin-top: 6px;
                border-radius: 6px;
            }

            .tree-device-item {
                padding-left: 24px;
            }

            .search-box {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }

            .search-box:focus {
                border-color: #4D9D2A;
                box-shadow: 0 0 0 2px rgba(77, 157, 42, 0.2);
                outline: none;
            }

            .no-results {
                padding: 16px;
                color: #666;
                font-style: italic;
                text-align: center;
                background-color: #f9f9f9;
                border-radius: 6px;
            }

            .lamp-type-selector {
                cursor: pointer;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 10px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: border-color 0.2s;
            }

            .lamp-type-selector:hover {
                border-color: #4D9D2A;
            }

            .lamp-type-dropdown {
                position: absolute;
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                max-height: 200px;
                overflow-y: auto;
                width: 180px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .lamp-type-option {
                padding: 10px 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .lamp-type-option:hover:not(.disabled) {
                background-color: #f5f5f5;
            }

            .lamp-type-option.disabled {
                opacity: 0.6;
                background-color: #f9f9f9;
                cursor: not-allowed;
            }

            .toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background-color: #4CAF50;
                color: white;
                padding: 16px 24px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
                animation-fill-mode: forwards;
                font-weight: 500;
            }

            @keyframes fadeIn {
                from {opacity: 0; transform: translateY(20px);}
                to {opacity: 1; transform: translateY(0);}
            }

            @keyframes fadeOut {
                from {opacity: 1; transform: translateY(0);}
                to {opacity: 0; transform: translateY(20px);}
            }

            .error-toast {
                background-color: #f44336;
            }

            .notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 12px 24px;
                border-radius: 6px;
                color: white;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-weight: 500;
                animation: fadeIn 0.3s;
            }

            .notification.success {
                background-color: #4CAF50;
            }

            .notification.error {
                background-color: #F44336;
            }

            .checkbox-disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .add-light-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                cursor: pointer;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                transition: background-color 0.2s;
            }

            .add-light-button:hover {
                background-color: #3c7c21;
            }

            .empty-state {
                text-align: center;
                padding: 32px 24px;
                color: #666;
                background-color: #f9f9f9;
                border-radius: 6px;
                margin-bottom: 16px;
            }

            /* Styling for validation errors */
            .error-message {
                color: #e53935;
                font-size: 12px;
                margin-top: 4px;
                font-weight: 500;
            }

            /* Styling for Vaadin components */
            vaadin-date-picker,
            vaadin-time-picker {
                --lumo-primary-color: #4D9D2A;
                --lumo-primary-text-color: #4D9D2A;
                --lumo-border-radius: 6px;
            }

            vaadin-checkbox {
                --lumo-primary-color: #4D9D2A;
            }

            vaadin-icon {
                color: #666;
            }

            /* Section dividers */
            .section-divider {
                margin: 24px 0;
                border-top: 1px solid #eaeaea;
                padding-top: 24px;
            }

            /* Section titles */
            .section-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #333;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Improve focus styles for accessibility */
            *:focus-visible {
                outline: 2px solid #4D9D2A;
                outline-offset: 2px;
            }

            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: #4D9D2A;
            }

            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }

            .toggle-label {
                margin-right: 16px;
                font-size: 16px;
                font-weight: 500;
                color: #555;
            }


            .toggle-container {
                display: flex;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #eaeaea;
            }

            vaadin-switch {
                --lumo-primary-color: #4D9D2A;
            }

            .checkbox {
                width: 16px;
                height: 16px;
                border: 1px solid #ccc;
                margin-right: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
            .checkbox.full {
                background-color: #4CAF50;
                color: white;
            }
            .checkbox.partial {
                background-color: #9E9E9E;
                color: white;
            }

            .tree-node {
                display: flex;
                flex-direction: column;
                margin-bottom: 4px;
            }

            .node-content {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 0 12px;
                border-radius: 6px;
                transition: background 0.2s;
            }

            .node-content:hover {
                background: #f0f4f8;
            }

            .node-icon.material-icons {
                font-size: 22px;
                color: #4D9D2A;
                margin-right: 8px;
            }

            .checkbox {
                width: 22px;
                height: 22px;
                margin-right: 10px;
            }

            .expand-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
                user-select: none;
            }

            .expand-icon-placeholder {
                width: 20px;
            }

            .checkbox {
                width: 18px;
                height: 18px;
                border: 2px solid #ccc;
                border-radius: 3px;
                margin: 0 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .checkbox.full {
                background-color: #4CAF50;
                border-color: #4CAF50;
                color: white;
            }

            .checkbox.partial {
                background-color: #9E9E9E;
                border-color: #9E9E9E;
                color: white;
            }

            .checkbox:hover {
                border-color: #4CAF50;
            }

            .node-name {
                font-size: 14px;
                color: #333;
                user-select: none;
            }

            .device-tree-container {
                padding: 8px;
                border: none;
                border-radius: 4px;
            }
        `
    }

    @property({ type: Object })
    public onSave?: (schedule: ScheduleInfo) => Promise<void>

    @property({ type: Object })
    public onCancel?: () => void

    @state()
    protected _scheduleType: "always" | "once" | "repeat" = "once"

    @state() today = new Date().toISOString().split("T")[0] // yyyy-mm-dd

    @state()
    protected _allDay = false

    @state()
    private _isActive = true

    @state()
    protected _noEndDate = false

    @state()
    protected _selectedDays: string[] = []

    @state()
    protected _activeTab: "dim" | "device" = "device"

    @state()
    protected _active = true

    @state()
    protected _showLightTypeModal = false

    @state()
    protected _selectedTimeSlotIndex: number | null = null

    @state()
    protected _timeSlots: TimeSlot[] = []

    @state()
    protected _lightTypes: LightType[] = []

    @state()
    protected _lampTypesFromApi: LampTypeDTO[] = []

    @state()
    protected _devices: any[] = []

    @state()
    protected _startDate = new Date().toISOString().split("T")[0]

    @state()
    protected _startTime = ""

    @state()
    protected _endDate = (() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        return date.toISOString().split("T")[0]
    })()

    @state()
    protected _endTime = ""

    @state()
    protected _showDeviceTreeModal = false

    @state()
    protected _deviceTree: DeviceTreeNode[] = []

    @state()
    protected _selectedDeviceIds: string[] = []

    @state()
    protected _expandedTypes: string[] = []

    @state()
    protected _searchTerm = ""

    @state()
    protected _activeLampTypeSelector: number | null = null

    @state()
    protected _toast: { message: string; isError: boolean } | null = null

    @state()
    protected _deviceAssetTypeMap: Map<string, string> = new Map()

    @state()
    protected _scheduleName = ""

    @state()
    protected _scheduleDescription = ""

    @state()
    protected _errors: {
        scheduleName?: string
        scheduleCode?: string
        startDate?: string
        endDate?: string
        startTime?: string
        endTime?: string
        timeSlots?: { [index: number]: { startTime?: string; endTime?: string } }
        brightnessZero?: string
    } = {}

    // Function to check if text contains Vietnamese characters
    protected _containsVietnamese(text: string): boolean {
        const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
        return vietnameseRegex.test(text);
    }

    // Function to remove Vietnamese characters and show warning
    protected _handleScheduleNameInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        
        if (this._containsVietnamese(value)) {
            // Remove Vietnamese characters
            const cleanValue = value.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, '');
            
            // Update input value and state
            input.value = cleanValue;
            this._scheduleName = cleanValue;
            
            // Show warning message
            this._errors.scheduleName = "Tên kịch bản không được chứa ký tự tiếng Việt";
            
            // Show toast notification
            this._toast = {
                message: "Không được phép nhập ký tự tiếng Việt trong tên kịch bản!",
                isError: true
            };
            
            // Hide toast after 3 seconds
            setTimeout(() => {
                this._toast = null;
            }, 3000);
        } else {
            // Valid input, clear error and update state
            this._scheduleName = value;
            if (this._errors.scheduleName === "Tên kịch bản không được chứa ký tự tiếng Việt") {
                this._errors.scheduleName = "";
            }
        }
    }

    // Function to handle description input normally (allow Vietnamese)
    protected _handleNormalDescriptionInput(e: Event): void {
        const textarea = e.target as HTMLTextAreaElement;
        const value = textarea.value;
        
        // Simply update state without any Vietnamese character blocking
        this._scheduleDescription = value;
    }

    protected _isTimeOverlap(time1Start: string, time1End: string, time2Start: string, time2End: string): boolean {
        if (!time1Start || !time1End || !time2Start || !time2End) return false

        // Convert times to minutes for easier comparison
        const [start1Hours, start1Minutes] = time1Start.split(":").map(Number)
        const [end1Hours, end1Minutes] = time1End.split(":").map(Number)
        const [start2Hours, start2Minutes] = time2Start.split(":").map(Number)
        const [end2Hours, end2Minutes] = time2End.split(":").map(Number)

        const start1TotalMinutes = start1Hours * 60 + start1Minutes
        const end1TotalMinutes = end1Hours * 60 + end1Minutes
        const start2TotalMinutes = start2Hours * 60 + start2Minutes
        const end2TotalMinutes = end2Hours * 60 + end2Minutes

        // Check if one range is completely inside the other
        // or if ranges overlap
        return start1TotalMinutes < end2TotalMinutes && end1TotalMinutes > start2TotalMinutes
    }

    protected _hasTimeOverlapWithOtherSlots(currentIndex: number, startTime: string, endTime: string): boolean {
        return this._timeSlots.some((slot, index) => {
            if (index === currentIndex) return false // Skip comparing with itself
            if (!slot.startTime || !slot.endTime) return false // Skip incomplete slots
            return this._isTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)
        })
    }

    protected _handleSearch(e: Event) {
        this._searchTerm = (e.target as HTMLInputElement).value;
        this.requestUpdate();
    }

    @state() realmSelected = sessionStorage.getItem("realm")
    @state() createBy = ""

    // Kết nối component và tải dữ liệu ban đầu
    connectedCallback() {
        super.connectedCallback()
        this._startDate = new Date().toISOString().split("T")[0] // Set default to today
        this._loadLampTypes()
        document.addEventListener("click", this._handleClickOutside.bind(this))
        window.addEventListener("session-changed", this._onSessionChanged)
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                this.createBy = response.data?.username || ""
                console.log("Current user:", response.data)
            })
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu:", error)
            })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener("click", this._handleClickOutside.bind(this))
        window.addEventListener("session-changed", this._onSessionChanged)
    }

    _onSessionChanged = (e) => {
        const { key, value } = e.detail
        if (key === "realm") {
            this.realmSelected = value
            this._loadDevices()
        }
    }

    // Tải dữ liệu loại đèn từ API
    protected async _loadLampTypes() {
        try {
            // Get all selected device IDs that need to be sent
            const assetIdsToSend: string[] = []

            // Helper function to find a node by ID in the device tree
            const findNodeById = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
                for (const node of nodes) {
                    if (node.id === id) return node
                    if (node.children && node.children.length > 0) {
                        const found = findNodeById(node.children, id)
                        if (found) return found
                    }
                }
                return null
            }

            // Process each selected device
            for (const deviceId of this._selectedDeviceIds) {
                const node = findNodeById(this._deviceTree, deviceId)
                if (node) {
                    if (node.children && node.children.length > 0) {
                        // If the device has children, add all child IDs
                        const childIds = this._getAllDescendantIds(node)
                        assetIdsToSend.push(...childIds)
                    } else {
                        // If the device has no children, add its own ID
                        assetIdsToSend.push(deviceId)
                    }
                }
            }

            // Remove duplicates from asset IDs
            const uniqueAssetIds = [...new Set(assetIdsToSend)]

            if (!uniqueAssetIds.length) {
                this._lampTypesFromApi = []
                return
            }

            const response = await manager.rest.api.ScheduleInfoResource.getLampTypesByAssets(uniqueAssetIds)

            // Filter out duplicate lamp types based on ID
            const uniqueLampTypes = response.data.reduce((acc: any[], current: any) => {
                const exists = acc.find((item) => item.id === current.id)
                if (!exists) {
                    acc.push(current)
                }
                return acc
            }, [])

            this._lampTypesFromApi = uniqueLampTypes
            console.log("Unique lamp types loaded:", uniqueLampTypes)
        } catch (error) {
            console.error("Error loading lamp types:", error)
            this._showToast("Không thể tải dữ liệu loại đèn", true)
        }
    }

    // Update the _buildDeviceTree method with the improved version from schedule-edit.ts:
    protected _buildDeviceTree(assets: any[]): DeviceTreeNode[] {
        console.log("Building device tree from assets:", assets)

        if (!assets || !Array.isArray(assets) || assets.length === 0) {
            return []
        }

        // Tạo map của tất cả các thiết bị để tìm kiếm nhanh
        const assetMap = new Map<string, DeviceTreeNode>()

        // Tạo danh sách tất cả các thiết bị từ tất cả các loại
        assets.forEach((assetType) => {
            if (assetType.assets && Array.isArray(assetType.assets)) {
                assetType.assets.forEach((asset: any) => {
                    if (!asset) return

                    const assetNode: DeviceTreeNode = {
                        id: asset.id,
                        name: asset.name || `Asset ${asset.id}`,
                        type: asset.type || assetType.assetTypeName,
                        assetTypeCode: assetType.assetTypeCode,
                        assetTypeId: assetType.id?.toString(),
                        parentId: asset.parentId,
                        children: [],
                        isType: false,
                        isAsset: true,
                    }

                    assetMap.set(asset.id, assetNode)
                })
            }
        })

        // Xây dựng cây phân cấp bằng cách thêm các thiết bị con vào thiết bị cha
        assetMap.forEach((node) => {
            if (node.parentId && assetMap.has(node.parentId)) {
                const parentNode = assetMap.get(node.parentId)
                if (parentNode) {
                    parentNode.children.push(node)
                }
            }
        })

        // Lấy các thiết bị gốc (không có parentId hoặc parentId không tồn tại trong danh sách)
        const rootNodes: DeviceTreeNode[] = []
        assetMap.forEach((node) => {
            if (!node.parentId || !assetMap.has(node.parentId)) {
                rootNodes.push(node)
            }
        })

        console.log("Built hierarchical device tree:", rootNodes)
        return rootNodes
    }

    // Add the _buildDeviceAssetTypeMap method from schedule-edit.ts:
    protected _buildDeviceAssetTypeMap(assets: any[]) {
        this._deviceAssetTypeMap = new Map()

        if (assets && assets.length > 0) {
            assets.forEach((assetType) => {
                if (assetType.assets && Array.isArray(assetType.assets)) {
                    assetType.assets.forEach((device: any) => {
                        if (device && device.id) {
                            // Map device ID to asset type ID
                            this._deviceAssetTypeMap.set(device.id, assetType.id.toString())
                        }
                    })
                }
            })
        }

        console.log("Device to asset type mapping built:", this._deviceAssetTypeMap)
    }

    // Add these utility methods from schedule-edit.ts:
    protected _getAllDescendantIds(node: DeviceTreeNode): string[] {
        let ids: string[] = []

        if (node.isAsset) {
            ids.push(node.id)
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
                ids = [...ids, ...this._getAllDescendantIds(child)]
            })
        }

        return ids
    }

    protected _areAnyDescendantsSelected(node: DeviceTreeNode): boolean {
        if (!node.children) return false
        return node.children.some(
            (child) => this._selectedDeviceIds.includes(child.id) || this._areAnyDescendantsSelected(child),
        )
    }

    protected _areAllDescendantsSelected(node: DeviceTreeNode): boolean {
        if (!node.children || node.children.length === 0) {
            return this._selectedDeviceIds.includes(node.id)
        }

        return node.children.every((child) => {
            if (child.children && child.children.length > 0) {
                return this._areAllDescendantsSelected(child)
            }
            return this._selectedDeviceIds.includes(child.id)
        })
    }

    protected _getNodeSelectionState(node: DeviceTreeNode): "none" | "partial" | "full" {
        // First check if this node is directly selected
        const isSelected = this._selectedDeviceIds.includes(node.id)

        if (!node.children || node.children.length === 0) {
            return isSelected ? "full" : "none"
        }

        // For parent nodes, check descendants
        const allSelected = this._areAllDescendantsSelected(node)
        if (allSelected) return "full"

        const anySelected = node.children.some(
            (child) =>
                this._selectedDeviceIds.includes(child.id) ||
                (child.children && child.children.length > 0 && this._areAnyDescendantsSelected(child)),
        )

        return anySelected ? "partial" : "none"
    }

    protected async _loadDevices() {
        try {
            const response = await manager.rest.api.ScheduleInfoResource.getAllAssetTypes({ realm: this.realmSelected })
            console.log("Assets loaded:", response)

            if (response && response.data && Array.isArray(response.data)) {
                this._deviceTree = this._buildDeviceTree(response.data)
                console.log("Device tree built:", this._deviceTree)

                // Build the mapping between device IDs and their asset type IDs
                this._buildDeviceAssetTypeMap(response.data)

                // Expand types that contain selected devices
                this._expandTypesWithSelectedDevices()
            }
        } catch (error) {
            console.error("Error loading assets:", error)
            this._showToast("Không thể tải dữ liệu thiết bị", true)
        }
    }

    // Add a new method to expand types that contain selected devices
    protected _expandTypesWithSelectedDevices() {
        if (!this._selectedDeviceIds.length) return

        // Find all parent nodes that contain selected devices
        const findParentTypes = (nodes: DeviceTreeNode[]) => {
            nodes.forEach((node) => {
                // Check if this node has any selected descendants
                const hasSelectedDescendant = this._areAnyDescendantsSelected(node)

                if (hasSelectedDescendant && !this._expandedTypes.includes(node.id)) {
                    this._expandedTypes.push(node.id)
                }

                // Recursively check children
                if (node.children && node.children.length > 0) {
                    findParentTypes(node.children)
                }
            })
        }

        findParentTypes(this._deviceTree)
    }

    protected _handleAllDayChange(e: Event) {
        this._allDay = (e.target as HTMLInputElement).checked
        if (this._allDay) {
            this._startTime = "00:00"
            this._endTime = "12:59"
        }
    }

    protected _handleScheduleTypeChange(e: Event) {
        const target = e.target as HTMLInputElement
        this._scheduleType = target.value as "always" | "once" | "repeat"
    }

    protected _handleTabChange(tab: "dim" | "device") {
        this._activeTab = tab

        // Khi chuyển sang tab tham số dim, gọi API để lấy danh sách loại đèn
        if (tab === "dim") {
            this._loadLampTypes()
        }
    }

    protected _addTimeSlot() {
        if (this._timeSlots.length >= 5) {
            this._showToast("Chỉ được phép thêm tối đa 5 dòng", true)
            return
        }
        const newSlot = {
            startTime: "",
            endTime: "",
            brightness: 50,
        }
        this._timeSlots = [...this._timeSlots, newSlot]
        // Validate brightness=0 after adding
        setTimeout(() => {
            this._validateBrightnessZeroRule()
        }, 0)
    }

    protected _removeTimeSlot(index: number) {
        this._timeSlots = this._timeSlots.filter((_, i) => i !== index)
        // Clear any errors for this slot
        if (this._errors.timeSlots?.[index]) {
            delete this._errors.timeSlots[index]
            if (Object.keys(this._errors.timeSlots).length === 0) {
                delete this._errors.timeSlots
            }
        }
    }

    protected _copyTimeSlot(index: number) {
        if (this._timeSlots.length >= 5) {
            this._showToast("Chỉ được phép thêm tối đa 5 dòng", true)
            return
        }

        const slotToCopy = this._timeSlots[index]

        // Check for time overlap before copying
        if (slotToCopy.startTime && slotToCopy.endTime) {
            if (this._hasTimeOverlapWithOtherSlots(index, slotToCopy.startTime, slotToCopy.endTime)) {
                this._showToast("Không thể copy vì khoảng thời gian bị trùng với dòng khác", true)
                return
            }
        }

        const newSlot = {
            startTime: slotToCopy.startTime,
            endTime: slotToCopy.endTime,
            brightness: slotToCopy.brightness,
            lightTypes: slotToCopy.lightTypes ? JSON.parse(JSON.stringify(slotToCopy.lightTypes)) : undefined,
        }
        this._timeSlots = [...this._timeSlots, newSlot]
    }

    // Find the _toggleDeviceSelection method and replace it with this improved version:
    protected _toggleDeviceSelection(nodeId: string) {
        const findNode = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node
                if (node.children) {
                    const found = findNode(node.children, id)
                    if (found) return found
                }
            }
            return null
        }

        const node = findNode(this._deviceTree, nodeId)
        if (!node) return

        // If node has children, toggle all children
        if (node.children && node.children.length > 0) {
            const allSelected = this._areAllDescendantsSelected(node)
            const descendantIds = this._getAllDescendantIds(node)

            if (allSelected) {
                // Deselect all descendants
                this._selectedDeviceIds = this._selectedDeviceIds.filter((id) => !descendantIds.includes(id))
            } else {
                // Select all descendants
                const newIds = descendantIds.filter((id) => !this._selectedDeviceIds.includes(id))
                this._selectedDeviceIds = [...this._selectedDeviceIds, ...newIds]
            }
        } else {
            // For leaf nodes, just toggle the selection
            const index = this._selectedDeviceIds.indexOf(nodeId)
            if (index === -1) {
                this._selectedDeviceIds = [...this._selectedDeviceIds, nodeId]
            } else {
                this._selectedDeviceIds = this._selectedDeviceIds.filter((id) => id !== nodeId)
            }
        }

        // Update parent selection states
        this._updateParentSelectionStates(node)
        this.requestUpdate()
    }

    // Add this new method to update parent selection states when a child is deselected
    protected _updateParentSelectionStates(node: DeviceTreeNode) {
        if (!node.parentId) return

        // Find the parent node
        const findParentNode = (nodes: DeviceTreeNode[], childId: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.children && node.children.some((child) => child.id === childId)) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findParentNode(node.children, childId)
                    if (found) return found
                }
            }
            return null
        }

        const parent = findParentNode(this._deviceTree, node.id)
        if (!parent) return

        // Check if any siblings are still selected
        const anyChildrenSelected = parent.children.some(
            (child) => this._selectedDeviceIds.includes(child.id) || this._areAnyDescendantsSelected(child),
        )

        // If no children are selected, deselect the parent
        if (!anyChildrenSelected) {
            this._selectedDeviceIds = this._selectedDeviceIds.filter((id) => id !== parent.id)
            // Recursively update the parent's parent
            this._updateParentSelectionStates(parent)
        }
    }

    // Add this method to select all parent nodes when a child is selected
    protected _selectParentNodes(node: DeviceTreeNode) {
        if (!node.parentId) return

        // Find the parent node
        const findParentNode = (nodes: DeviceTreeNode[], childId: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.children && node.children.some((child) => child.id === childId)) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findParentNode(node.children, childId)
                    if (found) return found
                }
            }
            return null
        }

        const parent = findParentNode(this._deviceTree, node.id)
        if (!parent) return

        // Select the parent if not already selected
        if (!this._selectedDeviceIds.includes(parent.id)) {
            this._selectedDeviceIds = [...this._selectedDeviceIds, parent.id]
        }

        // Recursively select the parent's parent
        this._selectParentNodes(parent)
    }

    // Update the _saveSelectedDevices method to only add leaf nodes or fully selected parent nodes
    protected _saveSelectedDevices() {
        console.log("Starting save with selected IDs:", this._selectedDeviceIds)

        const findNodeById = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node
                if (node.children) {
                    const found = findNodeById(node.children, id)
                    if (found) return found
                }
            }
            return null
        }

        // Get all nodes at each level
        const getAllNodesAtLevel = (level: number): DeviceTreeNode[] => {
            const traverse = (node: DeviceTreeNode, currentLevel: number): DeviceTreeNode[] => {
                if (currentLevel === level) return [node]
                if (!node.children) return []
                return node.children.flatMap((child) => traverse(child, currentLevel + 1))
            }
            return this._deviceTree.flatMap((root) => traverse(root, 0))
        }

        // Check if node should be saved (all descendants are selected)
        const shouldSaveNode = (node: DeviceTreeNode): boolean => {
            if (!node.children || node.children.length === 0) {
                return this._selectedDeviceIds.includes(node.id)
            }
            return this._areAllDescendantsSelected(node)
        }

        const nodesToSave: DeviceTreeNode[] = []
        const processedIds = new Set<string>()

        // Process level by level, starting from root
        let currentLevel = 0
        let hasNodesAtLevel = true

        while (hasNodesAtLevel) {
            const nodesAtLevel = getAllNodesAtLevel(currentLevel)
            console.log(
                `Processing level ${currentLevel}:`,
                nodesAtLevel.map((n) => n.name),
            )

            if (nodesAtLevel.length === 0) {
                hasNodesAtLevel = false
                continue
            }

            for (const node of nodesAtLevel) {
                // Skip if already processed
                if (processedIds.has(node.id)) continue

                // If this node has all descendants selected
                if (shouldSaveNode(node)) {
                    console.log(`Node ${node.name} has all descendants selected`)
                    nodesToSave.push(node)

                    // Mark this node and all its descendants as processed
                    processedIds.add(node.id)
                    const descendantIds = this._getAllDescendantIds(node)
                    descendantIds.forEach((id) => processedIds.add(id))
                }
            }

            currentLevel++
        }

        console.log(
            "Nodes to save:",
            nodesToSave.map((n) => n.name),
        )

        // Filter out nodes whose ancestors are already in the save list
        const finalNodesToSave = nodesToSave.filter((node) => {
            const parentId = this._findParentId(node.id)
            if (!parentId) return true // Keep root nodes

            // Don't keep this node if any ancestor is in the save list
            let currentParentId = parentId
            while (currentParentId) {
                if (nodesToSave.some((n) => n.id === currentParentId)) {
                    return false
                }
                currentParentId = this._findParentId(currentParentId)
            }
            return true
        })

        console.log(
            "Final nodes to save after filtering:",
            finalNodesToSave.map((n) => n.name),
        )

        const newDevices: any[] = []
        
        finalNodesToSave.forEach((node) => {
            if (node.type === "RoadAsset" && !node.parentId && node.children && node.children.length > 0) {
                node.children.forEach((child) => {
                    newDevices.push({
                        id: child.id,
                        name: child.name,
                        type: child.type,
                        assetTypeCode: child.assetTypeCode || "",
                        assetTypeId: child.assetTypeId || "",
                        roadName: node.name,
                    })
                })
            } else {
                newDevices.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    assetTypeCode: node.assetTypeCode || "",
                    assetTypeId: node.assetTypeId || "",
                    roadName: this._findRoadName(node.id),
                })
            }
        })
        this._devices = newDevices
        console.log("Updated devices array:", this._devices)
        this._loadLampTypes()

        this._showDeviceTreeModal = false
        this.requestUpdate()
    }

    protected _handleDeleteDevice(id: number) {
        const deviceToDelete = this._devices.find((device) => device.id === id)
        if (!deviceToDelete) return

        // Get the originalId of the device to be deleted
        const originalId = "originalId" in deviceToDelete ? deviceToDelete.originalId : deviceToDelete.code

        // Check if this is a parent device
        const isParent = this._devices.some((device) => {
            const deviceOriginalId = "originalId" in device ? device.originalId : device.code
            return deviceOriginalId !== originalId && this._isChildOf(deviceOriginalId, originalId)
        })

        if (isParent) {
            // If deleting a parent, also delete all its children
            const childDevices = this._devices.filter((device) => {
                const deviceOriginalId = "originalId" in device ? device.originalId : device.code
                return deviceOriginalId !== originalId && this._isChildOf(deviceOriginalId, originalId)
            })

            const idsToDelete = [id, ...childDevices.map((d) => d.id)]
            this._devices = this._devices.filter((device) => !idsToDelete.includes(device.id))

            // Show notification about deleting children
            // this._showToast(`Đã xóa thiết bị cha và ${childDevices.length} thiết bị con`)
        } else {
            // Just delete the selected device
            this._devices = this._devices.filter((device) => device.id !== id)
            // this._showToast("Đã xóa thiết bị")
        }
    }

    protected _findRoadName(nodeId: string): string {
        const findNode = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findNode(node.children, id)
                    if (found) {
                        return found
                    }
                }
            }
            return null
        }

        const node = findNode(this._deviceTree, nodeId)
        if (!node) return ""

        if (node.type === "RoadAsset" && !node.parentId) {
            return node.name
        }

        let currentNode = node
        while (currentNode.parentId) {
            const parent = findNode(this._deviceTree, currentNode.parentId)
            if (!parent) break
            
            if (parent.type === "RoadAsset" && !parent.parentId) {
                return parent.name
            }
            
            currentNode = parent
        }

        if (currentNode.type === "RoadAsset") {
            return currentNode.name
        }

        return ""
    }

    protected _isChildOf(childId: string, parentId: string): boolean {
        const findNode = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findNode(node.children, id)
                    if (found) {
                        return found
                    }
                }
            }
            return null
        }

        const childNode = findNode(this._deviceTree, childId)
        if (!childNode) return false

        if (childNode.parentId === parentId) return true

        let currentNode = childNode
        while (currentNode.parentId) {
            const parent = findNode(this._deviceTree, currentNode.parentId)
            if (!parent) break

            if (parent.id === parentId) return true
            currentNode = parent
        }

        return false
    }

    protected _findParentId(childId: string): string | null {
        const findNode = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findNode(node.children, id)
                    if (found) {
                        return found
                    }
                }
            }
            return null
        }

        const childNode = findNode(this._deviceTree, childId)
        if (!childNode || !childNode.parentId) return null

        return childNode.parentId
    }

    protected _toggleDay(day: string) {
        if (this._selectedDays.includes(day)) {
            this._selectedDays = this._selectedDays.filter((d) => d !== day)
        } else {
            this._selectedDays = [...this._selectedDays, day]
        }
    }

    // Lấy danh sách các loại đèn đã được chọn trong modal hiện tại
    protected _getSelectedLampTypes(): string[] {
        return this._lightTypes.map((lt) => lt.type)
    }

    // Kiểm tra xem loại đèn có bị xung đột thời gian không
    protected _isLampTypeTimeConflict(lampTypeId: string, startTime: string, endTime: string): boolean {
        // Nếu không có thời gian bắt đầu hoặc kết thúc, không thể kiểm tra xung đột
        if (!startTime || !endTime) return false

        // Kiểm tra tất cả các time slot đã có
        for (let i = 0; i < this._timeSlots.length; i++) {
            // Bỏ qua time slot hiện tại nếu đang chỉnh sửa
            if (i === this._selectedTimeSlotIndex) continue

            const slot = this._timeSlots[i]

            // Nếu slot không có thời gian hoặc không có loại đèn, bỏ qua
            if (!slot.startTime || !slot.endTime || !slot.lightTypes || slot.lightTypes.length === 0) continue

            // Kiểm tra xem loại đèn này có trong slot không
            const lampTypeInSlot = slot.lightTypes.some((lt) => lt.type === lampTypeId)

            if (lampTypeInSlot) {
                // Kiểm tra xung đột thời gian
                // Xung đột xảy ra khi:
                // 1. Thời gian bắt đầu mới nằm trong khoảng thời gian cũ
                // 2. Thời gian kết thúc mới nằm trong khoảng thời gian cũ
                // 3. Khoảng thời gian mới bao trùm khoảng thời gian cũ
                if (
                    (startTime >= slot.startTime && startTime < slot.endTime) ||
                    (endTime > slot.startTime && endTime <= slot.endTime) ||
                    (startTime <= slot.startTime && endTime >= slot.endTime)
                ) {
                    return true // Có xung đột
                }
            }
        }

        return false // Không có xung đột
    }

    // Lấy danh sách các loại đèn đã được sử dụng trong khung giờ hiện tại
    protected _getUsedLampTypesInCurrentTimeRange(): string[] {
        if (this._selectedTimeSlotIndex === null) return []

        const currentSlot = this._timeSlots[this._selectedTimeSlotIndex]
        if (!currentSlot || !currentSlot.startTime || !currentSlot.endTime) return []

        const usedLampTypes: string[] = []

        // Kiểm tra tất cả các time slot khác
        for (let i = 0; i < this._timeSlots.length; i++) {
            // Bỏ qua time slot hiện tại
            if (i === this._selectedTimeSlotIndex) continue

            const slot = this._timeSlots[i]

            // Nếu slot không có thời gian hoặc không có loại đèn, bỏ qua
            if (!slot.startTime || !slot.endTime || !slot.lightTypes || slot.lightTypes.length === 0) continue

            // Kiểm tra xem có xung đột thời gian không
            const isTimeConflict =
                (currentSlot.startTime >= slot.startTime && currentSlot.startTime < slot.endTime) ||
                (currentSlot.endTime > slot.startTime && currentSlot.endTime <= slot.endTime) ||
                (currentSlot.startTime <= slot.startTime && currentSlot.endTime >= slot.endTime)

            if (isTimeConflict) {
                // Nếu có xung đột thời gian, thêm tất cả các loại đèn trong slot này vào danh sách đã sử dụng
                slot.lightTypes.forEach((lt) => {
                    if (!usedLampTypes.includes(lt.type)) {
                        usedLampTypes.push(lt.type)
                    }
                })
            }
        }

        return usedLampTypes
    }

    // Replace the _openLightTypeModal method with this updated version that checks for available light types first
    protected _openLightTypeModal(index: number) {
        // Nếu chưa chọn thiết bị, không cho mở modal chọn đèn và báo notification
        if (!this._devices || this._devices.length === 0) {
            this.showNotification("Vui lòng chọn thiết bị trước khi chọn loại đèn", true)
            return
        }
        this._selectedTimeSlotIndex = index
        const slot = this._timeSlots[index]

        // Check if there are any available light types for this time slot
        if (slot.startTime && slot.endTime) {
            // Get all used lamp types in the current time range
            const usedLampTypes = this._getUsedLampTypesInCurrentTimeRange()

            // Check if all lamp types are already used in this time range
            const availableLampTypes = this._lampTypesFromApi.filter((lamp) => !usedLampTypes.includes(lamp.id))

            // If no lamp types are available, show error message and don't open the modal
            if (availableLampTypes.length === 0 && (!slot.lightTypes || slot.lightTypes.length === 0)) {
                this._showToast("Tất cả các loại đèn đã được chọn hoặc đã được sử dụng trong khung giờ này", true)
                return
            }
        }

        // Initialize lightTypes from the selected slot if available
        if (slot.lightTypes && slot.lightTypes.length > 0) {
            this._lightTypes = JSON.parse(JSON.stringify(slot.lightTypes))
            console.log("Loaded light types for slot", index, this._lightTypes)
            console.log(
                "Light types values:",
                this._lightTypes.map((lt) => lt.type),
            )
            console.log(
                "Available lamp types:",
                this._lampTypesFromApi.map((lamp) => ({ id: lamp.id, power: lamp.powerConsumption })),
            )
        } else {
            // Initialize with empty array
            this._lightTypes = []
        }

        this._showLightTypeModal = true
    }

    // Update the _closeLightTypeModal method to properly save light types to time slots
    protected _closeLightTypeModal() {
        this._showLightTypeModal = false

        // Cập nhật lại timeSlots khi đóng modal
        if (this._selectedTimeSlotIndex !== null) {
            // Tạo bản sao của timeSlots để tránh tham chiếu trực tiếp
            const updatedTimeSlots = [...this._timeSlots]

            // Cập nhật lightTypes cho time slot được chọn
            updatedTimeSlots[this._selectedTimeSlotIndex] = {
                ...updatedTimeSlots[this._selectedTimeSlotIndex],
                lightTypes: [...this._lightTypes], // Sử dụng state hiện tại của _lightTypes
            }

            // Cập nhật state
            this._timeSlots = updatedTimeSlots
        }

        // Reset selected index
        this._selectedTimeSlotIndex = null
    }

    // Add a new method to add the first light type when the modal is empty
    // Also update the _addFirstLightType method to check for available light types
    protected _addFirstLightType() {
        // Get all used lamp types in the current time range
        const usedLampTypes = this._getUsedLampTypesInCurrentTimeRange()

        // Find the first available lamp type that's not already used
        const availableLampType = this._lampTypesFromApi.find((lamp) => !usedLampTypes.includes(lamp.id))

        if (availableLampType) {
            // Add the first available lamp type with default brightness
            this._lightTypes = [{ type: availableLampType.id, brightness: 50 }]
        } else {
            this._showToast("Tất cả các loại đèn đã được chọn hoặc đã được sử dụng trong khung giờ này", true)
            this._closeLightTypeModal()
        }
    }

    protected _addLightType() {
        // Lấy danh sách các loại đèn đã được chọn trong modal hiện tại
        const selectedTypes = this._getSelectedLampTypes()

        // Lấy danh sách các loại đèn đã được sử dụng trong khung giờ hiện tại
        const usedLampTypes = this._getUsedLampTypesInCurrentTimeRange()

        // Tìm loại đèn đầu tiên chưa được chọn và chưa được sử dụng trong khung giờ hiện tại
        const availableLampType = this._lampTypesFromApi.find(
            (lamp) => !selectedTypes.includes(lamp.id) && !usedLampTypes.includes(lamp.id),
        )

        if (availableLampType) {
            this._lightTypes = [...this._lightTypes, { type: availableLampType.id, brightness: 50 }]
        } else {
            this._showToast("Tất cả các loại đèn đã được chọn hoặc đã được sử dụng trong khung giờ này", true)
        }
    }

    protected _removeLightType(index: number) {
        // Tạo bản sao của mảng lightTypes và xóa phần tử
        const updatedLightTypes = [...this._lightTypes]
        updatedLightTypes.splice(index, 1)

        // Cập nhật state
        this._lightTypes = updatedLightTypes
    }

    @property({ type: String })
    private _minEndDate = ""

    _handleStartDateChange(value: string) {
        this._startDate = value
        this._minEndDate = value

        this._updateEndTimeConstraints()

        if (this._endDate && this._endDate < value) {
            this._endDate = value
            this._updateEndTimeConstraints()
        }
    }

    @property({ type: String })
    private _minEndTime = ""
    _handleStartTimeChange(value: string) {
        if (!value) return

        this._startTime = value

        // Validate against current time if today
        if (this._startDate === this.today) {
            const now = new Date()
            const [hours, minutes] = value.split(":").map(Number)
            const currentHours = now.getHours()
            const currentMinutes = now.getMinutes()

            if (hours < currentHours || (hours === currentHours && minutes < currentMinutes)) {
                this._errors.startTime = `Giờ bắt đầu không được nhỏ hơn giờ hiện tại (${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")})`
            } else {
                delete this._errors.startTime
            }
        }

        this._updateEndTimeConstraints()

        // Validate all time slots against the new start time
        this._validateTimeSlotsOnScheduleChange()

        this.requestUpdate()
    }

    _handleEndDateChange(value: string) {
        this._endDate = value
        this._updateEndTimeConstraints()

        // Revalidate all time slots when end date changes
        if (this._startDate === this._endDate) {
            // If changed to same day schedule, validate all time slots
            this._timeSlots.forEach((slot, index) => {
                if (slot.startTime && slot.endTime) {
                    // Validate against schedule times
                    if (slot.startTime < this._startTime) {
                        if (!this._errors.timeSlots) this._errors.timeSlots = {}
                        if (!this._errors.timeSlots[index]) this._errors.timeSlots[index] = {}
                        this._errors.timeSlots[index].startTime = `Từ giờ không được nhỏ hơn giờ bắt đầu lịch (${this._startTime})`
                    }
                    if (slot.endTime > this._endTime) {
                        if (!this._errors.timeSlots) this._errors.timeSlots = {}
                        if (!this._errors.timeSlots[index]) this._errors.timeSlots[index] = {}
                        this._errors.timeSlots[index].endTime = `Đến giờ không được lớn hơn giờ kết thúc lịch (${this._endTime})`
                    }

                    // Validate time slot range
                    const isOvernight = this._isOvernightTime(slot.startTime, slot.endTime)
                    if (!isOvernight && slot.startTime >= slot.endTime) {
                        if (!this._errors.timeSlots) this._errors.timeSlots = {}
                        if (!this._errors.timeSlots[index]) this._errors.timeSlots[index] = {}
                        this._errors.timeSlots[index].startTime = "Từ giờ phải nhỏ hơn đến giờ"
                        this._errors.timeSlots[index].endTime = "Đến giờ phải lớn hơn từ giờ"
                    }
                }
            })
        } else {
            // If changed to multi-day schedule, clear all time slot validation errors
            if (this._errors.timeSlots) {
                Object.keys(this._errors.timeSlots).forEach((index) => {
                    delete this._errors.timeSlots[index].startTime
                    delete this._errors.timeSlots[index].endTime
                    if (Object.keys(this._errors.timeSlots[index]).length === 0) {
                        delete this._errors.timeSlots[index]
                    }
                })
                if (Object.keys(this._errors.timeSlots).length === 0) {
                    delete this._errors.timeSlots
                }
            }
        }

        this.requestUpdate()
    }

    // Find the _updateEndTimeConstraints method and replace it with this updated version
    _updateEndTimeConstraints() {
        // Chỉ áp dụng ràng buộc khi không phải cả ngày và ngày bắt đầu = ngày kết thúc
        if (!this._allDay && this._startDate && this._endDate && this._startDate === this._endDate) {
            if (this._startTime) {
                this._minEndTime = this._startTime
                if (this._endTime && this._endTime < this._startTime) {
                    const [startHours] = this._startTime.split(":").map(Number)
                    const [endHours] = this._endTime.split(":").map(Number)

                    const isLikelyOvernight = startHours >= 18 && endHours < 12

                    if (!isLikelyOvernight) {
                        this._errors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu"
                        this._errors.startTime = "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"
                    } else {
                        delete this._errors.endTime
                        delete this._errors.startTime
                    }
                } else {
                    delete this._errors.endTime
                    delete this._errors.startTime
                }
            }
        } else {
            this._minEndTime = ""
            delete this._errors.endTime
            delete this._errors.startTime
        }

        this.requestUpdate()
    }

    // Add a method to check if a time is in the past
    protected _isTimeInPast(timeString: string): boolean {
        if (!timeString || this._startDate !== this.today) {
            return false // Only validate for today
        }

        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        const [hours, minutes] = timeString.split(":").map(Number)

        return hours < currentHour || (hours === currentHour && minutes < currentMinute)
    }

    _handleEndTimeChange(value: string) {
        if (!value) return

        this._endTime = value

        // Validate against current time if today
        if (this._endDate === this.today) {
            const now = new Date()
            const [hours, minutes] = value.split(":").map(Number)
            const currentHours = now.getHours()
            const currentMinutes = now.getMinutes()

            if (hours < currentHours || (hours === currentHours && minutes < currentMinutes)) {
                this._errors.endTime = `Giờ kết thúc không được nhỏ hơn giờ hiện tại (${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")})`
            } else {
                delete this._errors.endTime
            }
        }

        // Validate against start time if same day
        if (this._startDate === this._endDate && this._startTime) {
            if (value < this._startTime) {
                this._errors.endTime = `Giờ kết thúc phải lớn hơn giờ bắt đầu (${this._startTime})`
            } else {
                delete this._errors.endTime
            }
        }

        // Validate all time slots against the new end time
        this._validateTimeSlotsOnScheduleChange()
    }

    // ... existing code ...

    protected _mapScheduleTypeToApi(): string {
        switch (this._scheduleType) {
            case "once":
                return "ANOCC"
            case "repeat":
                return "REOCC"
            case "always":
                return "ALWAYS"
            default:
                return "ANOCC"
        }
    }

    // Fix the issue with repeat schedule days selection
    // Modify the _formatSelectedDays method to handle empty day selection
    protected _formatSelectedDays(): string {
        const dayMap: { [key: string]: string } = {
            T2: "MO",
            T3: "TU",
            T4: "WE",
            T5: "TH",
            T6: "FR",
            T7: "SA",
            CN: "SU",
        }

        // If no days selected, return empty string
        if (this._selectedDays.length === 0) {
            return ""
        }

        return this._selectedDays.map((day) => dayMap[day] || day).join(",")
    }

    // Hiển thị thông báo toast
    protected _showToast(message: string, isError = false, durationMs: number = 2000) {
        this._toast = { message, isError }

        // Tự động ẩn toast sau durationMs (mặc định 2 giây)
        setTimeout(() => {
            this._toast = null
        }, durationMs)
    }

    // Extract readable error text from various error shapes
    protected _extractErrorText(error: any): string {
        try {
            if (!error) return "";
            // Common REST error shapes
            const respData = (error.response && (error.response.data || error.response)) || null
            if (respData) {
                if (typeof respData === "string") return respData
                if (respData.message) return String(respData.message)
                if (respData.error) return String(respData.error)
            }
            if (error.message) return String(error.message)
            const asString = error.toString ? error.toString() : ""
            return String(asString || "")
        } catch (_) {
            return ""
        }
    }

    // Detect duplicate schedule code error from backend response
    protected _isDuplicateScheduleCodeError(error: any): boolean {
        const text = (this._extractErrorText(error) || "").toLowerCase()
        return (
            text.includes("đã tồn tại") ||
            text.includes("already exists") ||
            text.includes("exists")
        )
    }
    @state()
    protected notification = {
        show: false,
        message: "",
        isError: false,
    }

    // Method to show notification
    showNotification(message: string, isError = false) {
        this.notification = {
            show: true,
            message: message,
            isError: isError,
        }

        // Hide the notification after 3 seconds
        setTimeout(() => {
            this.notification = { ...this.notification, show: false }
        }, 3000)
    }

    // Add this method to validate schedule code input (block special characters, spaces, etc.)
    protected _validateScheduleCodeInput(e: Event) {
        const input = e.target as HTMLInputElement
        const value = input.value
        // Only allow alphanumeric characters (letters and numbers)
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "")

        if (sanitizedValue !== value) {
            input.value = sanitizedValue
        }
    }

    // Kiểm tra xem thiết bị có bị xung đột thời gian không
    protected _isDeviceTimeConflict(deviceId: string, startTime: string, endTime: string): boolean {
        // Nếu không có thời gian bắt đầu hoặc kết thúc, không thể kiểm tra xung đột
        if (!startTime || !endTime) return false

        // Kiểm tra tất cả các time slot đã có
        for (let i = 0; i < this._timeSlots.length; i++) {
            // Bỏ qua time slot hiện tại nếu đang chỉnh sửa
            if (i === this._selectedTimeSlotIndex) continue

            const slot = this._timeSlots[i]

            // Nếu slot không có thời gian, bỏ qua
            if (!slot.startTime || !slot.endTime) continue

            // Kiểm tra xem có thiết bị nào trong slot này không
            const devicesInSlot = this._devices.filter((device) => {
                // Kiểm tra xem thiết bị có được sử dụng trong slot này không
                // Điều này phụ thuộc vào cách bạn lưu trữ mối quan hệ giữa thiết bị và time slot
                // Đây là một ví dụ đơn giản, bạn có thể cần điều chỉnh
                return true // Giả sử tất cả thiết bị đều được sử dụng trong tất cả các slot
            })

            // Kiểm tra xem thiết bị có trong danh sách thiết bị của slot này không
            const deviceInSlot = devicesInSlot.some((device) => device.originalId === deviceId || device.code === deviceId)

            if (deviceInSlot) {
                if (
                    (startTime >= slot.startTime && startTime < slot.endTime) ||
                    (endTime > slot.startTime && endTime <= slot.endTime) ||
                    (startTime <= slot.startTime && endTime >= slot.endTime)
                ) {
                    return true
                }
            }
        }

        return false
    }

    // Modify the _saveSchedule method to include validation
    protected async _saveSchedule() {
        // Gọi validate lại toàn bộ time slot trước khi kiểm tra lỗi
        this._validateAllTimeSlots();
        // Log lỗi để debug
        console.log("[DEBUG] Errors after validate all time slots:", this._errors);
        // Kiểm tra lỗi trùng khoảng thời gian
        let hasTimeSlotOverlapError = false;
        if (this._errors.timeSlots) {
            for (const i in this._errors.timeSlots) {
                const slotError = this._errors.timeSlots[i];
                if (
                    slotError.startTime === "Khoảng thời gian bị trùng với dòng khác" ||
                    slotError.endTime === "Khoảng thời gian bị trùng với dòng khác"
                ) {
                    hasTimeSlotOverlapError = true;
                    break;
                }
            }
        }
        if (hasTimeSlotOverlapError) {
            this._showToast("Có khoảng thời gian bị trùng, vui lòng kiểm tra lại!", true);
            console.log("[DEBUG] Không lưu do lỗi trùng khoảng thời gian");
            return;
        }
        try {
            // Reset errors
            this._errors = {}
            console.log("Starting save schedule...")

            const scheduleNameInput = this.shadowRoot?.querySelector(
                'input[placeholder="Nhập tên kịch bản"]',
            ) as HTMLInputElement
            const scheduleCodeInput = this.shadowRoot?.querySelector(
                'input[placeholder="Nhập mã kịch bản"]',
            ) as HTMLInputElement
            const descriptionInput = this.shadowRoot?.querySelector(
                'textarea[placeholder="Mô tả kịch bản"]',
            ) as HTMLTextAreaElement

            const scheduleName = this._scheduleName || ""
            const scheduleCode = scheduleCodeInput?.value || ""
            const description = this._scheduleDescription || ""

            console.log("Basic info:", { scheduleName, scheduleCode, description })

            // Validate required fields
            let hasError = false

            if (!scheduleName) {
                this._errors.scheduleName = "Tên kịch bản không được để trống"
                hasError = true
                console.log("Error: Missing schedule name")
            }

            if (!scheduleCode) {
                this._errors.scheduleCode = "Mã kịch bản không được để trống"
                hasError = true
                console.log("Error: Missing schedule code")
            }

            // Validate dates and times
            const currentDate = new Date()
            currentDate.setHours(12, 0, 0, 0)

            console.log("Schedule type:", this._scheduleType)
            console.log("Current schedule state:", {
                startDate: this._startDate,
                endDate: this._endDate,
                noEndDate: this._noEndDate,
                selectedDays: this._selectedDays,
                timeSlots: this._timeSlots,
                devices: this._devices,
            })

            if (this._scheduleType !== "always") {
                const startDate = new Date(this._startDate)
                startDate.setHours(12, 0, 0, 0)

                // Validate start date >= current date
                if (startDate < currentDate) {
                    this._errors.startDate = "Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại"
                    hasError = true
                    console.log("Error: Start date is in the past")
                }

                if (this._scheduleType === "once" || (this._scheduleType === "repeat" && !this._noEndDate)) {
                    const endDate = new Date(this._endDate)
                    endDate.setHours(12, 0, 0, 0)

                    // Validate end date >= start date
                    if (endDate < startDate) {
                        this._errors.endDate = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
                        hasError = true
                        console.log("Error: End date is before start date")
                    }
                }
            }

            // Check if there are devices selected
            const hasDevices = this._devices && this._devices.length > 0
            console.log("Has devices:", hasDevices, "Devices:", this._devices)

            // Check if there are dim parameters set
            const hasDimParameters =
                this._timeSlots && this._timeSlots.length > 0 && this._timeSlots.some((slot) => slot.startTime && slot.endTime)
            console.log("Has dim parameters:", hasDimParameters, "Time slots:", this._timeSlots)

            // Validate device and dim parameter requirements
            if (!hasDevices) {
                this.showNotification("Cần thêm thiết bị trong tab Thiết bị", true)
                this._activeTab = "device"
                console.log("Error: No devices selected")
                return
            }

            if (!hasDimParameters) {
                this.showNotification("Cần thiết lập tham số dim trong tab Tham số dim", true)
                this._activeTab = "dim"
                console.log("Error: No dim parameters set")
                return
            }

            // Validate time slots
            if (this._timeSlots && this._timeSlots.length > 0) {
                console.log("Validating time slots...")
                this._errors.timeSlots = {}
                for (let i = 0; i < this._timeSlots.length; i++) {
                    const slot = this._timeSlots[i]
                    console.log(`Checking slot ${i}:`, slot)

                    if (!slot.startTime) {
                        if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                        this._errors.timeSlots[i].startTime = "Vui lòng nhập giờ bắt đầu"
                        hasError = true
                        console.log(`Error: Missing start time in slot ${i}`)
                    }

                    if (!slot.endTime) {
                        if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                        this._errors.timeSlots[i].endTime = "Vui lòng nhập giờ kết thúc"
                        hasError = true
                        console.log(`Error: Missing end time in slot ${i}`)
                    }

                    if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
                        if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                        this._errors.timeSlots[i].startTime = "Từ giờ phải nhỏ hơn đến giờ"
                        this._errors.timeSlots[i].endTime = "Đến giờ phải lớn hơn từ giờ"
                        hasError = true
                        console.log(`Error: Invalid time range in slot ${i}`)
                    }
                }
                // Bổ sung kiểm tra lỗi trùng khoảng thời gian
                if (this._errors.timeSlots) {
                    for (const i in this._errors.timeSlots) {
                        const slotError = this._errors.timeSlots[i];
                        if (
                            slotError.startTime === "Khoảng thời gian bị trùng với dòng khác" ||
                            slotError.endTime === "Khoảng thời gian bị trùng với dòng khác"
                        ) {
                            hasError = true;
                        }
                    }
                }
            }

            if (this._scheduleType === "repeat") {
                const selectedDays = this._formatSelectedDays()
                console.log("Selected days for repeat schedule:", selectedDays)
                if (!selectedDays) {
                    this.showNotification("Vui lòng chọn ít nhất một ngày trong tuần để lặp lại", true)
                    console.log("Error: No days selected for repeat schedule")
                    return
                }
            }

            if (hasError) {
                console.log("Validation failed. Current errors:", this._errors)
                this._showToast("Vui lòng kiểm tra lại thông tin nhập liệu", true)
                return
            }

            // Validate at least one slot with brightness=0
            const hasBrightnessZero = this._timeSlots.some((slot) => Number(slot.brightness) === 0)
            if (!hasBrightnessZero) {
                this._errors.brightnessZero = "Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0"
                this._activeTab = "dim"
                this._showToast("Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0", true)
                this.requestUpdate()
                return
            }

            // If we get here, all validation passed
            console.log("All validation passed, proceeding with save...")

            const currentTime = new Date().getTime()
            manager.rest.api.UserResource.getCurrent()
                .then((response) => {
                    this.createBy = response.data?.username
                    console.log("current", response)
                })
                .catch((error) => {
                    console.error("Lỗi khi lấy dữ liệu:", error)
                })

            // Update the _saveSchedule method to include the active status
            const schedule: ScheduleInfo = {
                scheduleName: scheduleName,
                scheduleCode: scheduleCode || `SCH${new Date().getTime().toString().slice(-6)}`,
                realm: this.realmSelected || "master",
                active: this._isActive ? 1 : 0,
                schType: this._mapScheduleTypeToApi(),
                description: description,
                deleted: 0,
                createDate: currentTime,
                createBy: this.createBy,
                updateDate: currentTime,
                updateBy: manager.username || "admin",
            }

            // Find this section in the _saveSchedule method where dates are processed:
            if (this._scheduleType === "always") {
                // Lịch luôn luôn không cần ngày bắt đầu/kết thúc hoặc lặp lại
                // Set default dates to ensure they're not the same
                const now = new Date()
                const tomorrow = new Date(now)
                tomorrow.setDate(tomorrow.getDate() + 1)
                schedule.schFromDate = now.getTime()
                schedule.schToDate = tomorrow.getTime()
                // Clear selectedDays nếu chuyển sang always
                this._selectedDays = []
            } else if (this._scheduleType === "once") {
                // Ensure proper date and time format for timestamp creation
                let startTime = this._startTime || "00:00"
                let endTime = this._endTime || "12:59"
                // Ensure the time format has seconds
                if (startTime.split(":").length === 2) startTime += ":00"
                if (endTime.split(":").length === 2) endTime += ":00"
                // Parse local date and time
                const [sy, sm, sd] = this._startDate.split("-").map(Number)
                const [sh, smin, ss] = startTime.split(":").map(Number)
                const localStartDate = new Date(sy, sm - 1, sd, sh, smin, ss, 0)
                const [ey, em, ed] = this._endDate.split("-").map(Number)
                const [eh, emin, es] = endTime.split(":").map(Number)
                const localEndDate = new Date(ey, em - 1, ed, eh, emin, es, 0)
                schedule.schFromDate = localStartDate.getTime()
                schedule.schToDate = localEndDate.getTime()
                // Clear selectedDays nếu chuyển sang once
                this._selectedDays = []
            }
            // Update the _saveSchedule method to handle repeat schedule without days
            else if (this._scheduleType === "repeat") {
                // Lịch lặp lại cần ngày bắt đầu, có thể có ngày kết thúc, và mẫu lặp lại
                let startTime = this._startTime || "00:00"
                if (startTime.split(":").length === 2) startTime += ":00"
                const [sy, sm, sd] = this._startDate.split("-").map(Number)
                const [sh, smin, ss] = startTime.split(":").map(Number)
                const localStartDate = new Date(sy, sm - 1, sd, sh, smin, ss, 0)
                schedule.schFromDate = localStartDate.getTime()
                if (!this._noEndDate) {
                    let endTime = this._endTime || "12:59"
                    if (endTime.split(":").length === 2) endTime += ":00"
                    const [ey, em, ed] = this._endDate.split("-").map(Number)
                    const [eh, emin, es] = endTime.split(":").map(Number)
                    const localEndDate = new Date(ey, em - 1, ed, eh, emin, es, 0)
                    schedule.schToDate = localEndDate.getTime()
                } else {
                    // Nếu chọn không kết thúc, set ngày kết thúc là ngày bắt đầu + 100 năm
                    const farFuture = new Date(localStartDate)
                    farFuture.setFullYear(farFuture.getFullYear() + 100)
                    schedule.schToDate = farFuture.getTime()
                }
                schedule.isSchRepeatEnd = !this._noEndDate
                // Only set schRepeatOccu if days are selected, otherwise set to empty string
                const selectedDays = this._formatSelectedDays()
                if (!selectedDays && this._scheduleType === "repeat") {
                    this.showNotification("Vui lòng chọn ít nhất một ngày trong tuần để lặp lại", true)
                    return
                }
                schedule.schRepeatOccu = selectedDays
            }

            // Time periods
            schedule.schTimePeriods = this._timeSlots.map((slot, index) => ({
                time_id: index + 1,
                time_from: slot.startTime,
                time_to: slot.endTime,
                time_value: slot.brightness,
            }))

            // Time configurations
            schedule.timeConfigurations = this._timeSlots.map((slot, index) => {
                // Chỉ lấy lightTypes của slot, không lấy this._lightTypes nữa!
                const slotLightTypes = slot.lightTypes && slot.lightTypes.length > 0 ? slot.lightTypes : []

                return {
                    timePeriod: {
                        time_id: index + 1,
                        time_from: slot.startTime,
                        time_to: slot.endTime,
                        time_value: slot.brightness,
                    },
                    lampTypes: slotLightTypes.map((type) => ({
                        time_id: index + 1,
                        lamp_type_id: type.type,
                        lamp_type_value: type.brightness.toString(),
                    })),
                }
            })

            // Sửa customizeLampType: chỉ lấy loại đèn của từng slot nếu có
            schedule.customizeLampType = []
            this._timeSlots.forEach((slot, index) => {
                if (slot.lightTypes && slot.lightTypes.length > 0) {
                    slot.lightTypes.forEach((type) => {
                        schedule.customizeLampType.push({
                            time_id: index + 1,
                            lamp_type_id: type.type,
                            lamp_type_value: type.brightness.toString(),
                        })
                    })
                }
            })

            // Thêm thông tin thiết bị được chọn
            schedule.scheduleAssets = this._mapSelectedDevicesToScheduleAssets()

            console.log("Saving schedule:", schedule)

            // Gọi API để lưu kịch bản
            try {
                const response = await manager.rest.api.ScheduleInfoResource.createSchedule(schedule)

                console.log("Schedule saved successfully:", response)
                this._showToast("Lập lịch thành công. Hệ thống sẽ kết nối với tủ vui lòng check lại email.", false, 2000)

                // Đợi 2 giây để người dùng kịp đọc thông báo rồi mới tiếp tục
                await new Promise((resolve) => setTimeout(resolve, 2000))

                // Nếu có callback onSave, gọi nó với dữ liệu trả về
                if (this.onSave) {
                    await this.onSave(response.data)
                }
            } catch (error) {
                console.error("Error saving schedule:", error)
                const isDuplicate = this._isDuplicateScheduleCodeError(error)
                if (isDuplicate) {
                    // Set field-level error and show friendly notification
                    this._errors.scheduleCode = `Mã kịch bản đã tồn tại, vui lòng nhập mã khác.`
                    this.showNotification("Mã kịch bản đã tồn tại, vui lòng nhập mã khác.", true)
                    this.requestUpdate()
                } else {
                    const errorText = this._extractErrorText(error)
                    if (errorText && errorText.toLowerCase().includes("chọn ít nhất")) {
                        this.showNotification("Vui lòng chọn ít nhất một ngày trong tuần để lặp lại", true)
                    } else {
                        this.showNotification("Có lỗi xảy ra khi lưu kịch bản!", true)
                    }
                }
            }
        } catch (error) {
            console.error("Error saving schedule:", error)
            this.showNotification("Có lỗi xảy ra khi lưu kịch bản!", true)
        }
    }

    // Add validation for time slots in the dim parameters section
    // Update the _validateTimeSlotInput method to check for time conflicts
    // Find the _validateTimeSlotInput method and replace it with this improved version
    protected _validateTimeSlotInput(index: number, field: "startTime" | "endTime", value: string) {
        if (!value) return

        // Update the time slot value
        const updatedSlots = [...this._timeSlots]
        updatedSlots[index] = {
            ...updatedSlots[index],
            [field]: value,
        }
        this._timeSlots = updatedSlots

        // Validate all time slots again to handle cases where a change in one slot may resolve conflicts in others
        this._validateAllTimeSlots()
    }

    protected _validateAllTimeSlots() {
        // Initialize or reset the timeSlots errors
        if (!this._errors.timeSlots) {
            this._errors.timeSlots = {}
        } else {
            // Reset all existing time slot errors
            this._errors.timeSlots = {}
        }

        // Check each time slot for conflicts with other slots
        for (let i = 0; i < this._timeSlots.length; i++) {
            const slot = this._timeSlots[i]

            // Skip incomplete slots
            if (!slot.startTime || !slot.endTime) continue

            // First validate that end time is greater than start time
            if (slot.startTime >= slot.endTime) {
                if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                this._errors.timeSlots[i].startTime = "Từ giờ phải nhỏ hơn đến giờ"
                this._errors.timeSlots[i].endTime = "Đến giờ phải lớn hơn từ giờ"
                continue
            }

            // Check for overlap with other time slots
            let hasOverlap = false
            for (let j = 0; j < this._timeSlots.length; j++) {
                if (i === j) continue // Skip comparing with itself

                const otherSlot = this._timeSlots[j]
                if (!otherSlot.startTime || !otherSlot.endTime) continue // Skip incomplete slots

                // Check for time overlap
                if (this._isTimeOverlap(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime)) {
                    hasOverlap = true
                    break
                }
            }

            // Set error if there's an overlap
            if (hasOverlap) {
                if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                this._errors.timeSlots[i].startTime = "Khoảng thời gian bị trùng với dòng khác"
                this._errors.timeSlots[i].endTime = "Khoảng thời gian bị trùng với dòng khác"
            }
        }

        // Clean up if no errors remain
        if (Object.keys(this._errors.timeSlots).length === 0) {
            delete this._errors.timeSlots
        }

        this.requestUpdate()
    }

    // Add this method to validate time slots when schedule times change
    protected _validateTimeSlotsOnScheduleChange() {
        this._validateAllTimeSlots()
    }

    // Add a helper method to detect overnight time ranges
    protected _isOvernightTime(startTime: string, endTime: string): boolean {
        if (!startTime || !endTime) return false

        // Convert times to minutes for easier comparison
        const [startHours, startMinutes] = startTime.split(":").map(Number)
        const [endHours, endMinutes] = endTime.split(":").map(Number)

        const startTotalMinutes = startHours * 60 + startMinutes
        const endTotalMinutes = endHours * 60 + endMinutes

        // If end time is less than start time, it's an overnight range
        return endTotalMinutes <= startTotalMinutes
    }

    protected _mapSelectedDevicesToScheduleAssets(): ScheduleAsset[] {
        const findNodeById = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {
                    return node
                }
                if (node.children && node.children.length > 0) {
                    const found = findNodeById(node.children, id)
                    if (found) {
                        return found
                    }
                }
            }
            return null
        }

        // Only map devices that are in the devices array (displayed in table)
        const scheduleAssets: ScheduleAsset[] = []
        this._devices.forEach((device) => {
            const node = findNodeById(this._deviceTree, device.id.toString())
            if (node && node.isAsset) {
                // Get the asset type ID from our mapping
                const assetTypeId = node.assetTypeId || this._deviceAssetTypeMap.get(node.id) || "1"

                scheduleAssets.push({
                    asset_id: node.id,
                    sys_asset_id: assetTypeId,
                    assetName: node.name,
                    assetType: node.type,
                })
            }
        })

        return scheduleAssets
    }

    protected _renderOnceSchedule() {
        return html`
            <div class="time-container">
                <div class="time-group">
                    <div class="date-label">Bắt đầu</div>
                    <div style="display: flex; gap: 10px;">
                        <vaadin-date-picker
                                .min="${this.today}"
                                placeholder="Chọn ngày"
                                value="${this._startDate}"
                                style="width: 100%;"
                                @value-changed=${(e: CustomEvent) => this._handleStartDateChange(e.detail.value)}>
                        </vaadin-date-picker>
                    </div>
                    ${this._errors.startDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;">${this._errors.startDate}</div>` : ""}
                </div>
                <div class="time-group">
                    <div class="date-label">Kết thúc</div>
                    <div style="display: flex; gap: 10px;">
                        <vaadin-date-picker
                                .min="${this._minEndDate || this._startDate || this.today}"
                                placeholder="Chọn ngày"
                                value="${this.today}"
                                style="width: 100%;"
                                @value-changed=${(e: CustomEvent) => this._handleEndDateChange(e.detail.value)}>
                        </vaadin-date-picker>
                    </div>
                    ${this._errors.endDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;;">${this._errors.endDate}</div>` : ""}
                </div>
            </div>
        `
    }

    protected _renderRepeatSchedule() {
        return html`
            <div class="time-container">
                <div class="time-group">
                    <div class="date-label">Bắt đầu</div>
                    <div style="display: flex; gap: 10px;">
                        <vaadin-date-picker
                                .min="${this.today}"
                                placeholder="Chọn ngày"
                                value="${this._startDate}"
                                style="width: 100%;"
                                @value-changed=${(e: CustomEvent) => this._handleStartDateChange(e.detail.value)}>
                        </vaadin-date-picker>
                    </div>
                    ${this._errors.startDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;">${this._errors.startDate}</div>` : ""}
                </div>
                ${
            !this._noEndDate
                ? html`
                                    <div class="time-group">
                                        <div class="date-label">Kết thúc</div>
                                        <div style="display: flex; gap: 10px;">
                                            <vaadin-date-picker
                                                    .min="${this._minEndDate || this._startDate || this.today}"
                                                    placeholder="Chọn ngày"
                                                    value="${this._endDate}"
                                                    style="width: 100%;"
                                                    @value-changed=${(e: CustomEvent) => this._handleEndDateChange(e.detail.value)}>
                                            </vaadin-date-picker>
                                        </div>
                                        ${this._errors.endDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;;">${this._errors.endDate}</div>` : ""}
                                    </div> `
                : ""
        }
            </div>

            <div class="checkbox-container">
                <input type="checkbox" id="noEndDate" ?checked=${this._noEndDate}
                       @change=${(e: Event) => (this._noEndDate = (e.target as HTMLInputElement).checked)}>
                <label for="noEndDate">Không kết thúc</label>
            </div>

            ${html`
                <div class="schedule-section">
                    <div class="schedule-section-title">Lặp lại kịch bản</div>
                    <div class="day-buttons">
                        ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
            (day) => html`
                                    <button
                                            class="day-button ${this._selectedDays.includes(day) ? "selected" : ""}"
                                            @click=${() => this._toggleDay(day)}
                                    >
                                        ${day}
                                    </button>
                                `,
        )}
                    </div>
                </div>
            `}
        `
    }

    protected _renderDimSettings() {
        // Check for brightness=0 validation error
        const hasBrightnessZero = this._timeSlots.some((slot) => Number(slot.brightness) === 0)
        const brightnessZeroError = this._errors.brightnessZero
        return html`
            <div>
                ${brightnessZeroError ? html`<div style="color: #e53935; font-size: 13px; margin-bottom: 8px;">${brightnessZeroError}</div>` : ""}
                <button class="add-row-button" @click=${this._addTimeSlot}>
                    <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                    <span>Thêm dòng...</span>
                </button>

                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Từ giờ</th>
                        <th>Đến giờ</th>
                        <th>% Độ sáng</th>
                        <th>Loại đèn</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${this._timeSlots.map(
            (slot, index) => html`
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <vaadin-time-picker
                                                value="${slot.startTime}"
                                                @value-changed=${(e: CustomEvent) => {
                this._validateTimeSlotInput(index, "startTime", e.detail.value)
            }}
                                                style="${this._errors.timeSlots && this._errors.timeSlots[index] && this._errors.timeSlots[index].startTime ? "border: 1px solid red;" : ""}"
                                        ></vaadin-time-picker>
                                        ${
                this._errors.timeSlots &&
                this._errors.timeSlots[index] &&
                this._errors.timeSlots[index].startTime
                    ? html`<div style="color: red; font-size: 12px;">${this._errors.timeSlots[index].startTime}</div>`
                    : ""
            }
                                    </td>
                                    <td>
                                        <vaadin-time-picker
                                                value="${slot.endTime}"
                                                @value-changed=${(e: CustomEvent) => {
                this._validateTimeSlotInput(index, "endTime", e.detail.value)
            }}
                                                style="${this._errors.timeSlots && this._errors.timeSlots[index] && this._errors.timeSlots[index].endTime ? "border: 1px solid red;" : ""}"
                                        ></vaadin-time-picker>
                                        ${
                this._errors.timeSlots &&
                this._errors.timeSlots[index] &&
                this._errors.timeSlots[index].endTime
                    ? html`<div style="color: red; font-size: 12px;">${this._errors.timeSlots[index].endTime}</div>`
                    : ""
            }
                                    </td>
                                    <td>
                                        <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value="${slot.brightness}"
                                                @input=${(e: Event) => {
                let value = Number.parseInt((e.target as HTMLInputElement).value) || 0
                // Restrict value between 0 and 100
                if (value < 0) value = 0
                if (value > 100) value = 100
                ;(e.target as HTMLInputElement).value = value.toString()
                this._timeSlots = this._timeSlots.map((s, i) =>
                    i === index ? { ...s, brightness: value } : s,
                )
            }}
                                        >
                                    </td>
                                    <td class="light-type-cell" @click=${() => this._openLightTypeModal(index)}>
                                        ${
                slot.lightTypes && slot.lightTypes.length > 0
                    ? html`${slot.lightTypes.length} loại đèn`
                    : html`<span style="color: #666;">Chọn loại đèn</span>`
            }
                                    </td>
                                    <td class="action-cell">
                                        <button class="action-button" @click=${() => this._copyTimeSlot(index)}>
                                            <vaadin-icon icon="vaadin:copy"></vaadin-icon>
                                        </button>
                                        <button class="action-button" @click=${() => this._removeTimeSlot(index)}>
                                            <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                        </button>
                                    </td>
                                </tr>
                            `,
        )}
                    </tbody>
                </table>
            </div>
        `
    }

    // Mở modal chọn thiết bị và tải dữ liệu thiết bị
    protected async _openDeviceTreeModal() {
        // Reset search term
        this._searchTerm = ""

        // Load devices if not loaded yet
        if (this._deviceTree.length === 0) {
            await this._loadDevices()
        }

        // Initialize selected devices from the devices array
        this._selectedDeviceIds = []
        const processNode = (node: DeviceTreeNode) => {
            // Check if this node is in the devices array
            const isInDevices = this._devices.some((d) => d.id === node.id)
            if (isInDevices) {
                console.log("Found device in array:", node.name)
                this._selectedDeviceIds.push(node.id)
                // If this is a parent node, also select all its descendants
                if (node.children && node.children.length > 0) {
                    const descendantIds = this._getAllDescendantIds(node)
                    this._selectedDeviceIds.push(...descendantIds)
                }
            }
            // Recursively process children
            if (node.children) {
                node.children.forEach((child) => processNode(child))
            }
        }

        // Process all nodes in the tree
        this._deviceTree.forEach((node) => processNode(node))

        // Expand types that have selected devices
        this._expandTypesWithSelectedDevices()

        console.log("Device tree:", this._deviceTree)
        console.log("Selected devices:", this._selectedDeviceIds)
        console.log("Current devices in table:", this._devices)

        this._showDeviceTreeModal = true
        this.requestUpdate()
    }

    protected _closeDeviceTreeModal() {
        this._showDeviceTreeModal = false
    }

    // Chuyển đổi trạng thái mở rộng của loại thiết bị
    protected _toggleTypeExpanded(typeId: string) {
        if (this._expandedTypes.includes(typeId)) {
            this._expandedTypes = this._expandedTypes.filter((id) => id !== typeId)
        } else {
            this._expandedTypes = [...this._expandedTypes, typeId]
        }
    }

    // Update the _filterDeviceTree method with the improved version from schedule-edit.ts:
    protected _filterDeviceTree(): DeviceTreeNode[] {
        if (!this._searchTerm) {
            return this._deviceTree
        }
        const searchTermLower = this._searchTerm.toLowerCase();
        // Hàm kiểm tra xem node hoặc bất kỳ con nào của nó có khớp với từ khóa tìm kiếm không
        const nodeMatchesSearch = (node: DeviceTreeNode): boolean => {
            const nodeMatches = node.name.toLowerCase().includes(searchTermLower);
            if (nodeMatches) {
                return true;
            }
            if (node.children && node.children.length > 0) {
                return node.children.some((child) => nodeMatchesSearch(child));
            }
            return false;
        };
        // Hàm lọc con đệ quy
        const filterChildren = (children: DeviceTreeNode[]): DeviceTreeNode[] => {
            return children
                .filter((node) => nodeMatchesSearch(node))
                .map((node) => ({
                    ...node,
                    children: node.children ? filterChildren(node.children) : [],
                }));
        };
        // Lọc cây
        return this._deviceTree
            .filter((node) => nodeMatchesSearch(node))
            .map((node) => ({
                ...node,
                children: node.children ? filterChildren(node.children) : [],
            }));
    }

    // Kiểm tra xem thiết bị có bị xung đột thời gian không
    protected _isDeviceDisabled(nodeId: string): boolean {
        if (!this._selectedTimeSlotIndex) return false

        const currentSlot = this._timeSlots[this._selectedTimeSlotIndex]
        if (!currentSlot || !currentSlot.startTime || !currentSlot.endTime) return false

        return this._isDeviceTimeConflict(nodeId, currentSlot.startTime, currentSlot.endTime)
    }

    // Update the _renderDeviceTree method with the improved version from schedule-edit.ts:
    protected _renderDeviceTree() {
        const renderNode = (node: DeviceTreeNode, level = 0) => {
            const selectionState = this._getNodeSelectionState(node)
            const isExpanded = this._expandedTypes.includes(node.id)
            const marginLeft = level * 24 // Increased spacing for better hierarchy visibility
            const { icon, color } = this._getDeviceMdiIconInfo(node.type);

            return html`
                <div class="tree-node">
                    <div class="node-content" style="margin-left: ${marginLeft}px">
                        ${
                node.children && node.children.length > 0
                    ? html`
                                            <span
                                                    class="expand-icon"
                                                    @click=${() => this._toggleTypeExpanded(node.id)}
                                            >
                                    ${isExpanded ? "▼" : "▶"}
                                </span>`
                    : html`<span class="expand-icon-placeholder"></span>`
            }
                        <div
                                class="checkbox ${selectionState}"
                                @click=${() => this._toggleDeviceSelection(node.id)}
                        >
                            ${selectionState === "full" ? "✓" : selectionState === "partial" ? "•" : ""}
                        </div>
                        <or-icon icon="${icon}" style="--or-icon-fill: ${color}; font-size: 22px; margin-right: 8px;"></or-icon>
                        <span class="node-name">${node.name}</span>
                    </div>
                    ${node.children && isExpanded ? node.children.map((child) => renderNode(child, level + 1)) : ""}
                </div>
            `
        }

        const filteredTree = this._filterDeviceTree()
        return html`
            <div class="device-tree-container">
                ${filteredTree.map((node) => renderNode(node))}
            </div>
        `
    }

    // Render modal chọn thiết bị
    protected _renderDeviceTreeModal() {
        if (!this._showDeviceTreeModal) {
            return html``
        }

        return html`
            <div class="modal-overlay">
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div class="modal-title">Chọn thiết bị</div>
                        <vaadin-button theme="tertiary icon" @click=${this._closeDeviceTreeModal}>
                            <vaadin-icon icon="vaadin:close"></vaadin-icon>
                        </vaadin-button>
                    </div>

                    <vaadin-text-field
                            placeholder="Tìm kiếm thiết bị..."
                            .value=${this._searchTerm}
                            @input=${(e: InputEvent) => {
            const target = e.target as HTMLInputElement
            this._searchTerm = target.value
            this.requestUpdate()
        }}
                            style="width: 100%; margin-bottom: 16px;"
                    ></vaadin-text-field>

                    <div class="tree-container">
                        ${this._renderDeviceTree()}
                    </div>

                    <div class="button-container">
                        <vaadin-button
                                theme="secondary"
                                @click=${this._closeDeviceTreeModal}
                        >
                            Hủy
                        </vaadin-button>
                        <vaadin-button
                                theme="primary"
                                @click=${this._saveSelectedDevices}
                        >
                            Lưu thiết bị
                        </vaadin-button>
                    </div>
                </div>
            </div>
        `
    }

    protected _mapAssetTypeToVietnamese(assetType: string): string {
        switch (assetType) {
            case "LightAsset":
                return "Đèn"
            case "ElectricalCabinetAsset":
                return "Tủ điện"
            case "RoadAsset":
                return "Đường"
            case "LightGroupAsset":
                return "Nhóm đèn"
            case "FixedGroupAsset":
                return "Nhóm thiết bị cố định"
            default:
                return assetType
        }
    }

    protected _renderDeviceSettings() {
        return html`
            <div class="device-panel">
                <button style="width: 30px; height: 30px; background-color: #4D9D2A; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; margin-bottom: 10px;" @click=${this._openDeviceTreeModal}>
                    <vaadin-icon icon="vaadin:plus" style="color: white;"></vaadin-icon>
                </button>
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Loại</th>
                        <th>Tên</th>
                        <th>Thuộc đường</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${this._devices.map(
            (device, index) => html`
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${this._mapAssetTypeToVietnamese(device.type)}</td>
                                    <td>${device.name}</td>
                                    <td>${device.roadName || ""}</td>
                                    <td class="action-cell">
                                        <button class="action-button" @click=${() => this._handleDeleteDevice(device.id)}>
                                            <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                        </button>
                                    </td>
                                </tr>
                            `,
        )}
                    </tbody>
                </table>
            </div>
            ${this._renderDeviceTreeModal()}
        `
    }

    protected _openLampTypeSelector(index: number) {
        this._activeLampTypeSelector = this._activeLampTypeSelector === index ? null : index
    }

    protected _selectLampType(index: number, typeId: string) {
        this._lightTypes = this._lightTypes.map((lt, i) => (i === index ? { ...lt, type: typeId } : lt))
        this._activeLampTypeSelector = null
    }

    protected _handleClickOutside(e: MouseEvent) {
        if (this._activeLampTypeSelector !== null) {
            const target = e.target as HTMLElement
            if (!target.closest(".lamp-type-selector") && !target.closest(".lamp-type-dropdown")) {
                this._activeLampTypeSelector = null
            }
        }
    }

    protected _renderLightTypeModal() {
        if (!this._showLightTypeModal) {
            return html``
        }

        // Lấy danh sách các loại đèn đã được chọn trong modal hiện tại
        const selectedLampTypes = this._getSelectedLampTypes()

        // Lấy danh sách các loại đèn đã được sử dụng trong khung giờ hiện tại
        const usedLampTypes = this._getUsedLampTypesInCurrentTimeRange()

        return html`
            <div class="modal-overlay" @click=${this._closeLightTypeModal}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div class="modal-title">Loại đèn</div>
                        <button class="close-button" @click=${this._closeLightTypeModal}>
                            <vaadin-icon icon="vaadin:close"></vaadin-icon>
                        </button>
                    </div>

                    ${
            this._lightTypes.length === 0
                ? html`
                                        <div class="empty-state">
                                            <p>Chưa có loại đèn nào được chọn</p>
                                            <button class="add-light-button" @click=${this._addFirstLightType}>
                                                <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                                                Thêm loại đèn
                                            </button>
                                        </div>
                                    `
                : html`
                                        <div style="display: flex; margin-bottom: 15px; font-weight: bold;">
                                            <div style="width: 150px;">Loại đèn</div>
                                            <div style="width: 150px;">% độ sáng</div>
                                        </div>

                                        ${this._lightTypes.map((light, index) => {
                    // Tìm lamp type tương ứng để hiển thị
                    const lampType = this._lampTypesFromApi.find(
                        (lamp) => lamp.id === light.type,
                    ) || {
                        id: light.type,
                        powerConsumption: 0,
                    }

                    return html`
                                                <div style="display: flex; margin-bottom: 15px; align-items: center;">
                                                    <div style="width: 150px; margin-right: 10px;">
                                                        <div class="lamp-type-selector" style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                                                             @click=${() => this._openLampTypeSelector(index)}>
                                                            <span>${lampType.powerConsumption} W</span>
                                                            <vaadin-icon icon="vaadin:chevron-down"></vaadin-icon>
                                                        </div>
                                                        ${
                        this._activeLampTypeSelector === index
                            ? html`
                                                                            <div class="lamp-type-dropdown" style="position: absolute; background: white; border: 1px solid #e0e0e0; border-radius: 4px; max-height: 200px; overflow-y: auto; width: 150px; z-index: 1000;">
                                                                                ${this._lampTypesFromApi.map((lamp) => {
                                // Kiểm tra xem loại đèn này đã được chọn chưa
                                const isAlreadySelected =
                                    selectedLampTypes.includes(
                                        lamp.id,
                                    ) && lamp.id !== light.type

                                // Kiểm tra xem loại đèn này đã được sử dụng trong khung giờ hiện tại chưa
                                const isUsedInTimeRange =
                                    usedLampTypes.includes(lamp.id) &&
                                    lamp.id !== light.type

                                // Loại đèn bị vô hiệu hóa nếu đã được chọn hoặc đã được sử dụng trong khung giờ hiện tại
                                const isDisabled =
                                    isAlreadySelected ||
                                    isUsedInTimeRange

                                return html`
                                                                                        <div class="lamp-type-option ${isDisabled ? "disabled" : ""}"
                                                                                             style="padding: 8px; cursor: ${isDisabled ? "not-allowed" : "pointer"}; ${lamp.id === light.type ? "background-color: #f0f0f0;" : ""}"
                                                                                             @click=${() => !isDisabled && this._selectLampType(index, lamp.id)}>
                                                                                            ${lamp.powerConsumption} W
                                                                                            ${isAlreadySelected ? html`<span style="color: red; font-size: 12px; margin-left: 5px;">(Đã chọn)</span>` : ""}
                                                                                            ${isUsedInTimeRange && !isAlreadySelected ? html`<span style="color: red; font-size: 12px; margin-left: 5px;">(Đã được sử dụng)</span>` : ""}
                                                                                        </div>
                                                                                    `
                            })}
                                                                            </div>
                                                                        `
                            : ""
                    }
                                                    </div>
                                                    <div style="width: 100px;">
                                                        <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                .value=${light.brightness.toString()}
                                                                @input=${(e: Event) => {
                        let value =
                            Number.parseInt(
                                (e.target as HTMLInputElement).value,
                            ) || 0
                        // Restrict value between 0 and 100
                        if (value < 0) value = 0
                        if (value > 100) value = 100
                        ;(e.target as HTMLInputElement).value =
                            value.toString()
                        this._lightTypes = this._lightTypes.map((lt, i) =>
                            i === index ? { ...lt, brightness: value } : lt,
                        )
                    }}
                                                                style="width: 60px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;"
                                                        >
                                                    </div>
                                                    <div style="display: flex; gap: 5px; margin-left: 10px;">
                                                        <button class="action-button" @click=${() => this._addLightType()}>
                                                            <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                                                        </button>
                                                        <button class="action-button" @click=${() => this._removeLightType(index)}>
                                                            <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                                        </button>
                                                    </div>
                                                </div>
                                            `
                })}

                                        ${
                    this._lightTypes.length > 0
                        ? html`
                                                            <button class="add-light-button" @click=${this._addLightType}>
                                                                <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                                                                Thêm loại đèn
                                                            </button>
                                                        `
                        : ""
                }
                                    `
        }

                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                        <button class="save-button" @click=${this._closeLightTypeModal}>Đóng</button>
                    </div>
                </div>
            </div>
        `
    }

    // Render thông báo toast
    protected _renderToast() {
        if (!this._toast) return html``

        return html`
            <div class="toast ${this._toast.isError ? "error-toast" : ""}">
                ${this._toast.message}
            </div>
        `
    }

    protected render() {
        return html`
            <div class="form-title">Thêm kịch bản</div>
            <div class="toggle-container">
                <span class="toggle-label">Trạng thái:</span>
                <label class="toggle-switch">
                    <input type="checkbox" ?checked=${this._isActive} @change=${(e: Event) => (this._isActive = (e.target as HTMLInputElement).checked)}>
                    <span class="toggle-slider"></span>
                </label>
                <span style="margin-left: 8px; font-size: 14px;">${this._isActive ? "Hoạt động" : "Không hoạt động"}</span>
            </div>
            <div class="form-row">
                <div class="field-label">
                    Tên kịch bản
                    <span class="required-asterisk">*</span>
                </div>
                <div class="form-field">
                    <input 
                        type="text" 
                        placeholder="Nhập tên kịch bản (chỉ ký tự tiếng Anh và số)"
                        .value="${this._scheduleName}"
                        @input="${this._handleScheduleNameInput}"
                    >
                    ${this._errors.scheduleName ? html`<div style="color: red; font-size: 12px; margin-top: 4px;">${this._errors.scheduleName}</div>` : ""}
                </div>
            </div>
            <div class="form-row">
                <div class="field-label">
                    Mã kịch bản
                    <span class="required-asterisk">*</span>
                </div>
                <div class="form-field">
                    <input
                            type="text"
                            placeholder="Nhập mã kịch bản"
                            @input=${this._validateScheduleCodeInput}
                    >
                    ${this._errors.scheduleCode ? html`<div style="color: red; font-size: 12px; margin-top: 4px;">${this._errors.scheduleCode}</div>` : ""}
                </div>
            </div>
            <div class="form-row">
                <div class="form-label">Người tạo</div>
                <div class="form-field">
                    <input type="text" placeholder="Nhập tên người tạo" value="${this.createBy}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-label">Ngày tạo</div>
                <div class="form-field">
                    <input type="text" value="${new Date().toLocaleDateString("vi-VN")}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-label">Mô tả</div>
                <div class="form-field">
                    <textarea 
                        placeholder="Mô tả kịch bản" 
                        rows="3" 
                        style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;"
                        .value="${this._scheduleDescription}"
                        @input="${this._handleNormalDescriptionInput}"
                    ></textarea>
                </div>
            </div>

            <div class="form-row">
                <div class="form-label">Thời gian chiếu sáng</div>
                <div class="form-field">
                    <vaadin-icon icon="vaadin:calendar"></vaadin-icon>
                </div>
            </div>

            <div class="radio-group">
                <div class="radio-option">
                    <input type="radio" id="always" name="scheduleType" value="always"
                           ?checked=${this._scheduleType === "always"}
                           @change=${this._handleScheduleTypeChange}>
                    <label for="always">Luôn luôn</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="once" name="scheduleType" value="once"
                           ?checked=${this._scheduleType === "once"}
                           @change=${this._handleScheduleTypeChange}>
                    <label for="once">Lịch một lần</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="repeat" name="scheduleType" value="repeat"
                           ?checked=${this._scheduleType === "repeat"}
                           @change=${this._handleScheduleTypeChange}>
                    <label for="repeat">Lịch lặp lại</label>
                </div>
            </div>

            ${this._scheduleType === "once" ? this._renderOnceSchedule() : ""}
            ${this._scheduleType === "repeat" ? this._renderRepeatSchedule() : ""}

            <div style="margin-top: 30px;">
                <div class="form-label">Cài đặt kịch bản</div>

                <div style="display: flex; align-items: center; margin-bottom: 20px; gap: 24px;">
                    <div class="tab-buttons">
                        <button
                                class="tab-button ${this._activeTab === "device" ? "active" : ""}"
                                @click=${() => this._handleTabChange("device")}
                        >
                            Thiết bị
                        </button>
                        <button
                                class="tab-button ${this._activeTab === "dim" ? "active" : ""}"
                                @click=${() => this._handleTabChange("dim")}
                        >
                            Tham số dim
                        </button>
                    </div>
                    ${
            this._activeTab === "dim"
                ? html`
                                        <div style="color: #e53935; font-size: 14px; font-weight: 500; white-space: nowrap;">
                                            <b>Lưu ý:</b> Chỉ được phép thêm tối đa 5 khoảng thời gian và phải có ít nhất 1 khoảng thời gian có % độ sáng = 0.
                                        </div>
                                    `
                : ""
        }
                </div>

                ${this._activeTab === "dim" ? this._renderDimSettings() : this._renderDeviceSettings()}
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 20px; gap: 10px;">
                <button class="secondary-button" @click=${() => this.onCancel && this.onCancel()}>Hủy</button>
                <button class="save-button" @click=${this._saveSchedule}>Lưu</button>
            </div>

            ${this._renderLightTypeModal()}
            ${this._renderToast()}
            ${
            this.notification.show
                ? html`
                                <div class="notification ${this.notification.isError ? "error" : "success"}">
                                    ${this.notification.message}
                                </div>
                            `
                : ""
        }
        `
    }

    protected _validateBrightnessZeroRule() {
        const hasBrightnessZero = this._timeSlots.some((slot) => Number(slot.brightness) === 0)
        if (!hasBrightnessZero) {
            this._errors.brightnessZero = "Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0"
        } else {
            if (this._errors.brightnessZero) delete this._errors.brightnessZero
        }
        this.requestUpdate()
    }

    protected _updateSelectedDevices(newSelectedDeviceIds: string[]) {
        this._selectedDeviceIds = newSelectedDeviceIds
        this._loadLampTypes() // Gọi API getLampTypesByAssets sau khi danh sách thiết bị được cập nhật
    }

    // Hàm trả về tên icon và màu sắc cho từng loại thiết bị (dùng cho <or-icon>)
    private _getDeviceMdiIconInfo(type: string): { icon: string, color: string } {
        switch (type) {
            case "LightAsset":
                return { icon: "lightbulb", color: "#ff4081" } // Đèn
            case "ElectricalCabinetAsset":
                return { icon: "file-cabinet", color: "#ffc107" } // Tủ
            case "RoadAsset":
                return { icon: "road-variant", color: "#000000" } // Đường
            case "LightGroupAsset":
                return { icon: "lightbulb-group-outline", color: "#ff4081" } // Nhóm đèn
            case "FixedGroupAsset":
                return { icon: "lightbulb-group", color: "#ff4081" } // Nhóm cố định
            default:
                return { icon: "help-circle-outline", color: "#757575" }
        }
    }
}
