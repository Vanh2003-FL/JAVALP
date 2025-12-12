import { css, html, LitElement, type TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import manager from "@openremote/core"
import "@vaadin/combo-box"
import "@openremote/or-icon"
import "@vaadin/horizontal-layout"
import "@vaadin/date-picker"
import "@vaadin/time-picker"
import "@vaadin/icon"
import "@vaadin/icons"
import "@vaadin/dialog"
import type { DeviceItem, LightType, TimeSlot } from "./schedule-home"

// Extend the TimeSlot interface to include lightTypes
interface ExtendedTimeSlot extends TimeSlot {
    lightTypes?: LightType[]
}

// Updated DeviceTreeNode interface with new properties
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

@customElement("schedule-edit")
export class ScheduleEdit extends LitElement {
    static get styles() {
        // language=CSS
        return css`
            :host {
                width: 60%;
                padding: 20px;
                background-color: white;
                margin-left: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                height: 100%;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            }

            /* Override Vaadin Checkbox styles */
            vaadin-checkbox::part(checkbox) {
                background-color: white;
                border: 2px solid #ccc;
                border-radius: 3px;
                width: 18px;
                height: 18px;
            }

            vaadin-checkbox[checked]::part(checkbox) {
                background-color: #4D9D2A;
                border-color: #4D9D2A;
            }

            vaadin-checkbox::part(checkbox)::after {
                border-color: white;
            }

            vaadin-checkbox:hover::part(checkbox) {
                background-color: #f5f5f5;
            }

            vaadin-checkbox[disabled]::part(checkbox) {
                background-color: #f5f5f5;
                border-color: #ccc;
                opacity: 0.6;
            }

            /* Thêm style cho container của checkbox */
            .tree-item-row vaadin-checkbox {
                --lumo-primary-color: #4D9D2A;
                --lumo-primary-color-50pct: rgba(77, 157, 42, 0.5);
                --lumo-primary-color-10pct: rgba(77, 157, 42, 0.1);
            }

            .form-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
            }

            .form-row {
                display: flex;
                margin-bottom: 15px;
                align-items: center;
            }

            .form-label {
                width: 140px;
                font-size: 14px;
            }

            .form-field {
                flex: 1;
            }

            .date-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .date-group {
                width: 48%;
            }

            .date-label {
                font-size: 14px;
                margin-bottom: 5px;
            }

            input[type="text"], input[type="date"], input[type="time"] {
                width: 100%;
                padding: 8px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
            }

            .radio-group {
                display: flex;
                gap: 20px;
                margin: 15px 0;
            }

            .radio-option {
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .time-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .time-group {
                width: 48%;
            }

            .checkbox-container {
                margin: 15px 0;
            }

            .button-group {
                margin-top: 20px;
                display: flex;
                gap: 10px;
            }

            .save-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }

            .save-button[disabled] {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .secondary-button {
                background-color: #e0e0e0;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }

            .add-row-button {
                background: none;
                border: none;
                color: #1976d2;
                cursor: pointer;
                display: flex;
                align-items: center;
                padding: 0;
                margin: 10px 0;
                font-size: 14px;
            }

            .add-row-button:disabled {
                color: #cccccc;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .schedule-section {
                margin-top: 20px;
                margin-bottom: 20px;
            }

            .schedule-section-title {
                font-weight: bold;
                margin-bottom: 15px;
            }

            .day-buttons {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .day-button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #e0e0e0;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
            }

            .day-button.selected {
                background-color: #1976d2;
                color: white;
            }

            .tab-buttons {
                display: flex;
                margin-bottom: 20px;
            }

            .tab-button {
                padding: 8px 16px;
                border: none;
                background-color: rgb(232, 235, 240);
                cursor: pointer;
                font-size: 14px;
            }

            .tab-button.active {
                background-color: #4D9D2A;
                color: white;
            }

            .tab-button:first-child {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }

            .tab-button:last-child {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }

            .device-panel {
                margin-top: 20px;
            }

            .device-panel-header {
                font-weight: bold;
                margin-bottom: 10px;
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
                background-color: white;
                padding: 20px;
                border-radius: 4px;
                width: 400px;
                max-width: 90%;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .modal-title {
                font-weight: bold;
                font-size: 16px;
            }

            .close-button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 18px;
            }

            .light-type-cell {
                cursor: pointer;
                color: #1976d2;
                text-decoration: underline;
            }

            .light-type-table {
                width: 100%;
            }

            .light-type-row {
                display: flex;
                margin-bottom: 10px;
                align-items: center;
            }

            .light-type-cell-gray {
                background-color: #f5f5f5;
                padding: 8px;
                border-radius: 4px;
                width: 100px;
                text-align: center;
                margin-right: 10px;
            }

            .light-type-actions {
                display: flex;
                gap: 5px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }

            th, td {
                border: 1px solid #e0e0e0;
                padding: 8px 12px;
                text-align: left;
                color: black;
            }

            th {
                background-color: #4D9D2A;
                font-weight: normal;
                color: white;
            }

            .action-cell {
                display: flex;
                gap: 5px;
                justify-content: center;
                align-items: center;
                height: 65px;
            }

            .action-button {
                background: none;
                border: none;
                cursor: pointer;
                color: #555;
            }

            .action-button:disabled {
                color: #cccccc;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .device-tree-modal {
                width: 400px;
                max-height: 600px;
                overflow-y: auto;
            }

            .tree-container {
                max-height: 400px;
                overflow-y: auto;
                padding: 10px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                margin: 10px 0;
            }

            .tree-item {
                margin: 5px 0;
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
                margin-right: 4px;
            }

            .tree-type-item {
                font-weight: bold;
                background-color: #f5f5f5;
                padding: 8px;
                margin-top: 5px;
                border-radius: 4px;
            }

            .tree-device-item {
                padding-left: 20px;
            }

            .tree-children {
                margin-left: 20px;
            }

            .search-box {
                width: 100%;
                padding: 8px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                margin-bottom: 10px;
            }

            .no-results {
                padding: 10px;
                color: #666;
                font-style: italic;
                text-align: center;
            }

            .lamp-type-selector {
                cursor: pointer;
            }

            .lamp-type-dropdown {
                position: absolute;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                max-height: 200px;
                overflow-y: auto;
                width: 150px;
                z-index: 1000;
            }

            .lamp-type-option {
                padding: 8px;
                cursor: pointer;
            }

            .lamp-type-option.disabled {
                opacity: 0.5;
                background-color: #f0f0f0;
                cursor: not-allowed;
            }

            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideInUp 0.3s ease-out forwards;
            }

            .notification.success {
                background-color: #4caf50;
            }

            .notification.error {
                background-color: #f44336;
            }

            @keyframes slideInUp {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideInUp 0.3s ease-out forwards;
            }

            .toast.success {
                background-color: #4caf50;
            }

            .toast.error {
                background-color: #f44336;
            }

            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .error-toast {
                background-color: #f44336;
            }

            .checkbox-disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .add-light-button {
                background-color: #4D9D2A;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .add-light-button:disabled {
                background-color: #cccccc;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .empty-state {
                text-align: center;
                padding: 20px;
                color: #666;
            }
            *:focus-visible {
                outline: 2px solid #4D9D2A;
                outline-offset: 2px;
            }

            /* Toggle switch styles */
            .toggle-container {
                display: flex;
                align-items: center;
                margin: 10px 0;
                padding: 10px 0;
            }

            .toggle-label {
                margin-right: 10px;
                font-size: 14px;
                color: #333;
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
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
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

            .status-text {
                margin-left: 10px;
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }

            .status-text.active {
                color: #4D9D2A;
            }

            .status-text.inactive {
                color: #666;
            }

            .tree-node {
                margin: 5px 0;
            }

            .node-content {
                display: flex;
                align-items: center;
                padding: 5px;
                border-radius: 4px;
                transition: background-color 0.2s;
                min-height: 32px;
            }

            .node-content:hover {
                background-color: #f5f5f5;
            }

            .expand-icon, .expand-icon-placeholder {
                width: 24px;
                height: 32px; /* Đảm bảo chiều cao đủ lớn để căn giữa */
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
            }

            .checkbox-icon {
                width: 24px;
                height: 24px;
                min-width: 24px;
                min-height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #4D9D2A;
                border-radius: 4px;
                margin-right: 8px;
                color: #4D9D2A;
                font-weight: bold;
                background: #fff;
                box-sizing: border-box;
            }

            or-icon {
                margin-right: 8px;
                font-size: 22px;
                display: flex;
                align-items: center;
            }

            .node-name {
                font-size: 14px;
                color: #333;
            }

            .children {
                margin-left: 24px;
            }
            .status-text-cell {
                font-weight: 500;
            }
            .status-success {
                color: #2e7d32;
            }
            .status-pending {
                color: #f9a825;
            }
            .status-failed {
                color: #c62828;
            }
            .status-delete-success {
                color: #1976d2;
            }
            .status-delete-failed {
                color: #d32f2f;
            }

        `
    }

    @property({ type: String })
    scheduleId = ""

    @state()
    protected _scheduleType: "always" | "once" | "repeat" | undefined = undefined;

    @state() protected _currentDate = new Date()

    @state()
    protected _allDay = false

    @state()
    protected _noEndDate = false

    @state()
    protected _selectedDays: string[] = []

    @state()
    protected _activeTab: "dim" | "device" = "device"

    @state()
    protected _showLightTypeModal = false

    @state()
    protected _selectedTimeSlotIndex: number | null = null

    @state()
    protected _lightTypes: LightType[] = []

    @state()
    protected _startDate = ""

    @state()
    protected _startTime = ""

    @state()
    protected _endDate = (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split("T")[0]
    })()

    @state()
    protected _endTime = ""

    @state()
    protected _selectedScheduleName = ""

    @state()
    protected _selectedScheduleCode = ""

    @state()
    protected _timeSlots: ExtendedTimeSlot[] = []

    @state()
    protected _devices: (
        | DeviceItem
        | {
        id: number
        type: string
        code: string
        assetTypeId: string
        name: string
        position: string
        status?: number
        originalId?: string
        assetTypeCode?: string
        roadName?: string
    }
        )[] = []

    @state()
    protected _createDate = ""

    @state()
    protected _createBy = ""

    @state()
    protected _updateDate = ""

    @state()
    protected _updateBy = ""

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
    protected _lampTypesFromApi: any[] = []

    // Store the mapping between device IDs and their asset type IDs
    @state()
    protected _deviceAssetTypeMap: Map<string, string> = new Map()

    @state()
    protected _notification = { show: false, message: "", isError: false }

    @state()
    protected _isDeleteDeviceDialogOpen = false

    @state()
    protected _deviceToDelete: any = null

    // Add these state variables to track validation errors
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

    @property({ type: String })
    private _minEndDate = ""

    @property({ type: String })
    private _minEndTime = ""

    // Add a toggle switch for active/inactive status in the class properties
    @state()
    private _isActive = true

    @state() protected _updateTimer: ReturnType<typeof setInterval> | null = null

    @state() realmSelected = sessionStorage.getItem("realm")

    @state()
    protected _saveSelectedDevices = () => {
        // Helper function to check if all children of a node are selected
        const areAllChildrenSelected = (node: DeviceTreeNode): boolean => {
            if (!node.children || node.children.length === 0) return false
            return node.children.every((child) => {
                if (child.children && child.children.length > 0) {
                    return areAllChildrenSelected(child)
                }
                return this._selectedDeviceIds.includes(child.id)
            })
        }

        // Helper function to get parent node of a node
        const getParentNode = (nodeId: string): DeviceTreeNode | null => {
            const parentId = this._findParentId(nodeId)
            if (!parentId) return null
            return this._findNodeInDeviceTree(this._deviceTree, parentId)
        }

        // Helper function to get the highest selected parent of a node
        const getHighestSelectedParent = (nodeId: string): DeviceTreeNode | null => {
            const node = this._findNodeInDeviceTree(this._deviceTree, nodeId)
            if (!node) return null

            let highestParent = node
            let parent = getParentNode(node.id)

            while (parent) {
                if (this._selectedDeviceIds.includes(parent.id)) {
                    highestParent = parent
                }
                parent = getParentNode(parent.id)
            }

            return highestParent
        }

        const nodesToAdd = new Set<DeviceTreeNode>()
        const processedIds = new Set<string>()

        // Process all selected nodes
        this._selectedDeviceIds.forEach(id => {
            if (processedIds.has(id)) return

            // Get the highest selected parent for this node
            const highestParent = getHighestSelectedParent(id)
            if (!highestParent) return

            // If this is already the highest level or its parent is not fully selected
            if (!getParentNode(highestParent.id) || !areAllChildrenSelected(getParentNode(highestParent.id))) {
                nodesToAdd.add(highestParent)

                // Mark all descendants as processed
                processedIds.add(highestParent.id)
                this._getAllDescendantIds(highestParent).forEach(descendantId => {
                    processedIds.add(descendantId)
                })
            }
        })

        const newDevices: any[] = []
        const existingDeviceMap = new Map<string, any>()
        
        this._devices.forEach(device => {
            if (device.originalId) {
                existingDeviceMap.set(device.originalId, device)
                
                const hasStatus = device.status !== null && device.status !== undefined
                const isFromBackend = device.originalId && device.originalId.toString().length > 0
                
                if (hasStatus || isFromBackend) {
                    newDevices.push({
                        ...device,
                        roadName: this._findRoadName(device.originalId || device.code || "")
                    })
                }
            }
        })
        
        const preservedDeviceIds = new Set(newDevices.map(device => device.originalId))
        
        Array.from(nodesToAdd).forEach((node) => {
            if (node.type === "RoadAsset" && !node.parentId && node.children && node.children.length > 0) {
                node.children.forEach((child) => {
                    if (preservedDeviceIds.has(child.id)) return
                    
                    const existingDevice = existingDeviceMap.get(child.id)
                    if (existingDevice) {
                        newDevices.push({
                            ...existingDevice,
                            roadName: node.name,
                        })
                    } else {
                        newDevices.push({
                            id: Number.parseInt(child.id),
                            type: child.type,
                            code: child.assetTypeCode || "",
                            assetTypeId: child.assetTypeId || "",
                            name: child.name,
                            position: "",
                            originalId: child.id,
                            roadName: node.name,
                        })
                    }
                })
            } else {
                if (preservedDeviceIds.has(node.id)) return
                
                const existingDevice = existingDeviceMap.get(node.id)
                if (existingDevice) {
                    newDevices.push({
                        ...existingDevice,
                        roadName: this._findRoadName(node.id),
                    })
                } else {
                    newDevices.push({
                        id: Number.parseInt(node.id),
                        type: node.type,
                        code: node.assetTypeCode || "",
                        assetTypeId: node.assetTypeId || "",
                        name: node.name,
                        position: "",
                        originalId: node.id,
                        roadName: this._findRoadName(node.id),
                    })
                }
            }
        })

        this._devices = newDevices
        this._closeDeviceTreeModal()
    }

    connectedCallback() {
        super.connectedCallback()
        // Update current date every minute
        this._updateTimer = setInterval(() => {
            this._currentDate = new Date()
            this.requestUpdate()
        }, 60000) // Update every minute

        if (this.scheduleId) {
            this._loadScheduleDetails(this.scheduleId)
        }
        this._loadLampTypes()
        this._loadDevices() // Load devices right away to build the mapping
        document.addEventListener("click", this._handleClickOutside.bind(this))
        window.addEventListener("session-changed", this._onSessionChanged)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener("click", this._handleClickOutside.bind(this))
        if (this._updateTimer) {
            clearInterval(this._updateTimer)
        }
        window.addEventListener("session-changed", this._onSessionChanged)
    }
    _onSessionChanged = (e) => {
        const { key, value } = e.detail
        if (key === "realm") {
            this.realmSelected = value
            this._loadDevices()
        }
    }

    get today() {
        return this._currentDate.toISOString().split("T")[0]
    }

    protected async _loadLampTypes() {
        try {
            // Get all selected device IDs that need to be sent
            const assetIdsToSend: string[] = [];

            // Helper function to find a node by ID in the device tree
            const findNodeById = (nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null => {
                for (const node of nodes) {
                    if (node.id === id) return node;
                    if (node.children && node.children.length > 0) {
                        const found = findNodeById(node.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            // Process each selected device
            for (const deviceId of this._selectedDeviceIds) {
                const node = findNodeById(this._deviceTree, deviceId);
                if (node) {
                    if (node.children && node.children.length > 0) {
                        // If the device has children, add all child IDs
                        const childIds = this._getAllDescendantIds(node);
                        assetIdsToSend.push(...childIds);
                    } else {
                        // If the device has no children, add its own ID
                        assetIdsToSend.push(deviceId);
                    }
                }
            }

            // Remove duplicates from asset IDs
            const uniqueAssetIds = [...new Set(assetIdsToSend)];

            if (!uniqueAssetIds.length) {
                this._lampTypesFromApi = [];
                return;
            }

            const response = await manager.rest.api.ScheduleInfoResource.getLampTypesByAssets(uniqueAssetIds);

            // Filter out duplicate lamp types based on ID
            const uniqueLampTypes = response.data.reduce((acc: any[], current: any) => {
                const exists = acc.find(item => item.id === current.id);
                if (!exists) {
                    acc.push(current);
                }
                return acc;
            }, []);

            this._lampTypesFromApi = uniqueLampTypes;
            console.log("Unique lamp types loaded:", uniqueLampTypes);
        } catch (error) {
            console.error("Error loading lamp types:", error);
            this._showToast("Không thể tải dữ liệu loại đèn", true);
        }
    }

    protected async _loadDevices() {
        try {
            const response = await manager.rest.api.ScheduleInfoResource.getAllAssetTypes({ realm: this.realmSelected })
            console.log("Assets loaded:", response)

            if (response && response.data && Array.isArray(response.data)) {
                this._deviceTree = this._buildDeviceTree(response.data)
                console.log("Device tree built:", this._deviceTree)

                this._buildDeviceAssetTypeMap(response.data)
                this._updateDeviceRoadNames()
            }
        } catch (error) {
            console.error("Error loading assets:", error)
            this._showToast("Không thể tải dữ liệu thiết bị", true)
        }
    }

    protected _updateDeviceRoadNames() {
        if (!this._deviceTree || this._deviceTree.length === 0) {
            setTimeout(() => {
                this._updateDeviceRoadNames();
            }, 500);
            return;
        }
        
        this._devices = this._devices.map((device) => ({
            ...device,
            roadName: this._findRoadName(device.originalId || device.code || "")
        }))
        this.requestUpdate()
    }

    // Build a mapping between device IDs and their asset type IDs
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

    // Utility function to get all descendant ids of a node
    protected _getAllDescendantIds(node: DeviceTreeNode): string[] {
        let ids: string[] = []

        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
                ids.push(child.id)
                ids = [...ids, ...this._getAllDescendantIds(child)]
            })
        }

        return ids
    }

    // Utility function to check if any descendants of a node are selected
    protected _areAnyDescendantsSelected(node: DeviceTreeNode): boolean {
        if (!node.children || node.children.length === 0) {
            return false
        }

        const allDescendantIds = this._getAllDescendantIds(node)
        return allDescendantIds.some((id) => this._selectedDeviceIds.includes(id))
    }

    // Utility function to check if all descendants of a node are selected
    protected _areAllDescendantsSelected(node: DeviceTreeNode): boolean {
        if (!node.children || node.children.length === 0) {
            return true
        }

        const allDescendantIds = this._getAllDescendantIds(node)
        return allDescendantIds.every((id) => this._selectedDeviceIds.includes(id))
    }

    // Updated method to build a hierarchical device tree
    protected _buildDeviceTree(assets: any[]) {
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

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has("scheduleId") && this.scheduleId) {
            console.log("[LOG] scheduleId changed to:", this.scheduleId);
            this._scheduleType = undefined;
            this.requestUpdate();
            this._loadScheduleDetails(this.scheduleId)
        }

        if (changedProperties.has("_scheduleType")) {
            console.log("[LOG] _scheduleType changed to:", this._scheduleType);
            this.requestUpdate()
        }
    }

    // Fix for issue #2: Ensure lighting time and dim parameters time are handled independently
    // Update the _loadScheduleDetails method to properly separate these values

    protected async _loadScheduleDetails(id: string) {
        try {
            const response = await manager.rest.api.ScheduleInfoResource.getDetail(id)
            const data = response.data

            // Load basic schedule information
            this._selectedScheduleName = data.scheduleName
            this._selectedScheduleCode = data.scheduleCode
            this._isActive = data.active === 1
            this._createDate = new Date(data.createDate).toLocaleString()
            this._createBy = data.createBy
            this._updateDate = new Date(data.updateDate).toLocaleString()
            this._updateBy = data.updateBy

            // Set schedule type
            switch (data.schType) {
                case "ALWAYS":
                    this._scheduleType = "always"
                    break
                case "ANOCC":
                    this._scheduleType = "once"
                    break
                case "REOCC":
                case "REPEAT":
                    this._scheduleType = "repeat"
                    break
                default:
                    this._scheduleType = "once"
            }
            console.log("[LOG] _loadScheduleDetails: schType from DB:", data.schType, "=> _scheduleType:", this._scheduleType);

            // Set dates and times using UTC to prevent timezone issues
            const fromDate = new Date(data.schFromDate)
            const toDate = new Date(data.schToDate)

            // Format date as YYYY-MM-DD (local time)
            this._startDate = fromDate.getFullYear() + '-' + String(fromDate.getMonth()+1).padStart(2, '0') + '-' + String(fromDate.getDate()).padStart(2, '0')
            this._endDate = toDate.getFullYear() + '-' + String(toDate.getMonth()+1).padStart(2, '0') + '-' + String(toDate.getDate()).padStart(2, '0')

            // Set default times
            this._startTime = "00:00"
            this._endTime = "12:59"

            // Process time configurations
            if (data.timeConfigurations && Array.isArray(data.timeConfigurations)) {
                this._timeSlots = data.timeConfigurations.map((config) => {
                    // Create a new time slot with its own independent lightTypes
                    const timeSlot: ExtendedTimeSlot = {
                        startTime: config.timePeriod.time_from,
                        endTime: config.timePeriod.time_to,
                        brightness: config.timePeriod.time_value,
                        lightTypes: []
                    }

                    // Lấy toàn bộ lampTypes của slot này (không filter theo index)
                    if (config.lampTypes && Array.isArray(config.lampTypes)) {
                        timeSlot.lightTypes = config.lampTypes.map(lamp => ({
                            type: lamp.lamp_type_id,
                            brightness: parseInt(lamp.lamp_type_value)
                        }))
                    }

                    return timeSlot
                })
            } else {
                this._timeSlots = []
            }

            // ALWAYS reset devices and selected IDs first - this is critical!
            this._devices = []
            this._selectedDeviceIds = []
            
            // Only load devices if scheduleAssets exists and has content
            if (data.scheduleAssets && Array.isArray(data.scheduleAssets) && data.scheduleAssets.length > 0) {
                console.log("[DEBUG] Loading devices from scheduleAssets:", data.scheduleAssets.length, "devices")
                this._devices = data.scheduleAssets.map((asset) => ({
                    id: parseInt(asset.id || "0"),
                    type: asset.assetTypeName,
                    code: asset.assetTypeCode,
                    assetTypeId: asset.sys_asset_id,
                    name: asset.assetName,
                    position: "",
                    status: asset.status,
                    originalId: asset.asset_id,
                    assetTypeCode: asset.assetTypeCode,
                    roadName: "",
                }));
                this._selectedDeviceIds = this._devices.map(device => device.originalId?.toString() || device.code?.toString());
                await this._loadLampTypes();
                this._updateDeviceRoadNames();
            } else {
                console.log("[DEBUG] No scheduleAssets found, devices table will be empty")
                // Explicitly clear lamp types as well
                this._lampTypesFromApi = []
            }

            // Handle repeat schedule specific data
            if (this._scheduleType === "repeat") {
                this._noEndDate = !data.isSchRepeatEnd
                if (data.schRepeatOccu) {
                    this._selectedDays = this._parseRepeatOccurrences(data.schRepeatOccu)
                }
            }

            // Force UI update to reflect changes
            this.requestUpdate()

        } catch (error) {
            console.error("Error loading schedule details:", error)
            this.showNotification("Không thể tải thông tin lịch trình", true)
        }
    }

    // Add a method to map asset types to Vietnamese names
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

    protected _parseRepeatOccurrences(occurrences: string): string[] {
        if (!occurrences) return []

        // Map các giá trị từ DB sang UI
        const dayMap: { [key: string]: string } = {
            MON: "T2",
            TUE: "T3",
            WED: "T4",
            THU: "T5",
            FRI: "T6",
            SAT: "T7",
            CN: "SU",
            MO: "T2",
            TU: "T3",
            WE: "T4",
            TH: "T5",
            FR: "T6",
            SA: "T7",
            SU: "CN",
        }

        // Phân tách chuỗi thành mảng các ngày
        const daysFromDB = occurrences.split(",").map((day) => day.trim())

        // Chuyển đổi từ định dạng DB sang định dạng UI
        const result: string[] = []
        daysFromDB.forEach((day) => {
            const uiDay = dayMap[day.toUpperCase()]
            if (uiDay) {
                result.push(uiDay)
            }
        })

        console.log("Ngày từ DB:", occurrences)
        console.log("Đã chuyển đổi thành:", result)

        return result
    }

    protected _handleAllDayChange(e: Event) {
        this._allDay = (e.target as HTMLInputElement).checked
        // Always set default times since we removed the time pickers
        this._startTime = "00:00"
        this._endTime = "12:59"
    }

    protected _handleScheduleTypeChange(e: Event) {
        const target = e.target as HTMLInputElement
        const newScheduleType = target.value as "always" | "once" | "repeat"
        console.log("[LOG] User changed schedule type to:", newScheduleType);

        // Nếu chuyển từ always sang loại khác và ngày bắt đầu hoặc kết thúc là 2199-01-01 thì reset về hôm nay và ngày mai
        if (
            this._scheduleType === "always" &&
            (newScheduleType === "once" || newScheduleType === "repeat")
        ) {
            if (this._startDate === "2199-01-01" || this._endDate === "2199-01-01") {
                const today = new Date();
                const todayStr = today.toISOString().split("T")[0];
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split("T")[0];
                this._startDate = todayStr;
                this._endDate = tomorrowStr;
            }
        }

        // Nếu thay đổi từ một loại khác sang "repeat", cần khởi tạo ngày mặc định
        if (newScheduleType === "repeat" && this._scheduleType !== "repeat") {
            // Khởi tạo ngày mặc định nếu chưa có ngày nào được chọn
            if (this._selectedDays.length === 0) {
                this._selectedDays = []
            }
        }

        this._scheduleType = newScheduleType
        this.requestUpdate()
    }

    protected _handleTabChange(tab: "dim" | "device") {
        this._activeTab = tab

        // Khi chuyển sang tab tham số dim, gọi API để lấy danh sách loại đèn
        if (tab === "dim") {
            this._loadLampTypes();
        }
    }

    protected _toggleDay(day: string) {
        if (this._selectedDays.includes(day)) {
            this._selectedDays = this._selectedDays.filter((d) => d !== day)
        } else {
            this._selectedDays = [...this._selectedDays, day]
        }
    }

    protected _addTimeSlot() {
        if (this._timeSlots.length >= 5) {
            this._showToast("Chỉ được phép thêm tối đa 5 khoảng thời gian", true)
            return
        }
        this._timeSlots = [
            ...this._timeSlots,
            {
                startTime: "",
                endTime: "",
                brightness: 50,
                lightTypes: undefined,
            } as ExtendedTimeSlot,
        ]
        // Validate brightness=0 after adding
        setTimeout(() => {
            this._validateBrightnessZeroRule();
        }, 0);
    }

    protected _removeTimeSlot(index: number) {
        this._timeSlots = this._timeSlots.filter((_, i) => i !== index)
    }

    protected _copyTimeSlot(index: number) {
        if (this._timeSlots.length >= 5) {
            this._showToast("Chỉ được phép thêm tối đa 5 khoảng thời gian", true)
            return
        }
        const slotToCopy = this._timeSlots[index]

        // Create a completely independent copy of the time slot
        const newSlot: ExtendedTimeSlot = {
            startTime: slotToCopy.startTime,
            endTime: slotToCopy.endTime,
            brightness: slotToCopy.brightness,
            // Create a completely new array with new objects for lightTypes
            lightTypes: slotToCopy.lightTypes
                ? JSON.parse(JSON.stringify(slotToCopy.lightTypes))
                : undefined
        }

        // Add the copied slot at the end of the array
        this._timeSlots = [...this._timeSlots, newSlot]
    }

    // Find the _handleDeleteDevice method and replace it with this improved version
    protected _handleDeleteDevice(id: number) {
        const deviceToDelete = this._devices.find(device => device.id === id)
        if (!deviceToDelete) return

        if (deviceToDelete.status === null || deviceToDelete.status === undefined) {
            this._deleteDeviceDirectly(deviceToDelete)
        } else {
            this._deviceToDelete = deviceToDelete
            this._isDeleteDeviceDialogOpen = true
        }
    }

    protected _deleteDeviceDirectly(deviceToDelete: any) {
        if (!deviceToDelete.originalId) return

        const nodeToDelete = this._findNodeInDeviceTree(this._deviceTree, deviceToDelete.originalId)
        if (!nodeToDelete) return

        this._devices = this._devices.filter(device => {
            if (!device.originalId) return true
            if (device.originalId === deviceToDelete.originalId) return false
            return !this._isChildOf(device.originalId, deviceToDelete.originalId)
        })
    }

    // Helper method to find the parent ID of a device
    protected _findParentId(childId: string): string | null {
        // Find the child node in the device tree
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

    protected _cancelDeleteDevice() {
        this._isDeleteDeviceDialogOpen = false
        this._deviceToDelete = null
    }

    protected async _confirmDeleteDevice() {
        if (!this._deviceToDelete || !this.scheduleId) return

        this._isDeleteDeviceDialogOpen = false

        // Store current device order before making API call
        const currentDeviceOrder = this._devices.map((device, index) => ({
            originalId: device.originalId,
            order: index
        }))

        try {
            await manager.rest.api.ScheduleInfoResource.removeScriptOnCabinetId(
                parseInt(this.scheduleId),
                this._deviceToDelete.originalId || this._deviceToDelete.code
            )

            await new Promise(resolve => setTimeout(resolve, 500))
            await this._loadScheduleDetails(this.scheduleId)

            // Sort devices to maintain original order after reload
            this._sortDevicesByOriginalOrder(currentDeviceOrder)

        } catch (error) {
            console.error("Error removing script from device:", error)
            this._showToast("Lỗi khi gửi bản tin xóa xuống thiết bị", true)
        } finally {
            this._deviceToDelete = null
        }
    }

    protected _sortDevicesByOriginalOrder(originalOrder: { originalId: string | undefined, order: number }[]) {
        // Create a map for quick lookup of original order
        const orderMap = new Map<string, number>()
        originalOrder.forEach(item => {
            if (item.originalId) {
                orderMap.set(item.originalId, item.order)
            }
        })

        // Sort devices based on original order
        this._devices.sort((a, b) => {
            const orderA = a.originalId ? orderMap.get(a.originalId) : 999
            const orderB = b.originalId ? orderMap.get(b.originalId) : 999
            
            // If both have order, sort by order
            if (orderA !== undefined && orderB !== undefined) {
                return orderA - orderB
            }
            
            // If only one has order, prioritize it
            if (orderA !== undefined) return -1
            if (orderB !== undefined) return 1
            
            // If neither has order, maintain current order
            return 0
        })

        // Trigger UI update
        this.requestUpdate()
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

    // Helper method to check if a device is a child of another
    protected _isChildOf(childId: string, parentId: string): boolean {
        // Find the child node in the device tree
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

        // Check if the parent ID matches
        return childNode.parentId === parentId
    }

    // Lấy danh sách các loại đèn đã được chọn trong modal hiện tại
    protected _getSelectedLampTypes(): string[] {
        return this._lightTypes.map((lt) => lt.type)
    }

    protected _isLampTypeTimeConflict(lampTypeId: string, startTime: string, endTime: string): boolean {
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
            const deviceInSlot = devicesInSlot.some((device) => {
                const deviceOriginalId = "originalId" in device ? device.originalId : device.code
                return deviceOriginalId === deviceId
            })

            if (deviceInSlot) {
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

    // Update the _openLightTypeModal method to check for available light types first
    protected _openLightTypeModal(index: number) {
        // Nếu chưa chọn thiết bị, không cho mở modal chọn đèn và báo notification
        if (!this._devices || this._devices.length === 0) {
            this.showNotification("Vui lòng chọn thiết bị trước khi chọn loại đèn", true);
            return;
        }
        this._selectedTimeSlotIndex = index
        const slot = this._timeSlots[index]

        // Nếu slot hiện tại đã có đèn thì luôn cho phép mở modal để chỉnh sửa
        if (slot.lightTypes && slot.lightTypes.length > 0) {
            this._lightTypes = slot.lightTypes.map(light => {
                const lampType = this._lampTypesFromApi.find(lamp => lamp.id === light.type)
                if (lampType) {
                    return {
                        type: lampType.id,
                        brightness: light.brightness,
                        powerConsumption: lampType.powerConsumption
                    }
                }
                return null
            }).filter(light => light !== null)
            this._showLightTypeModal = true
            return
        }

        // Nếu slot chưa có đèn, kiểm tra loại đèn còn lại để chọn
        if (slot.startTime && slot.endTime) {
            const usedLampTypes = this._getUsedLampTypesInCurrentTimeRange()
            const availableLampTypes = this._lampTypesFromApi.filter((lamp) => !usedLampTypes.includes(lamp.id))
            if (availableLampTypes.length === 0) {
                this._showToast("Tất cả các loại đèn đã được chọn hoặc đã được sử dụng trong khung giờ này", true)
                return
            }
        }
        this._lightTypes = []
        this._showLightTypeModal = true
    }

    protected _closeLightTypeModal() {
        if (this._selectedTimeSlotIndex !== null && this._lightTypes.length > 0) {
            // Create a deep copy of current lightTypes using map to create new objects
            const updatedLightTypes = this._lightTypes.map((type) => {
                const lampType = this._lampTypesFromApi.find(lamp => lamp.id === type.type)
                return {
                    type: type.type,
                    brightness: type.brightness,
                    powerConsumption: lampType ? lampType.powerConsumption : 0
                }
            })

            console.log("Saving light types for slot", this._selectedTimeSlotIndex, updatedLightTypes)

            // Update the time slot with new lightTypes
            this._timeSlots = this._timeSlots.map((slot, index) =>
                index === this._selectedTimeSlotIndex ? { ...slot, lightTypes: updatedLightTypes } : slot
            )
        }

        this._showLightTypeModal = false
        this._selectedTimeSlotIndex = null
    }

    protected _findNextAvailableLampType(): any {
        // Lấy danh sách các loại đèn đã được sử dụng
        const usedTypes = this._lightTypes.map(light => light.type)

        // Tìm loại đèn đầu tiên chưa được sử dụng
        return this._lampTypesFromApi.find(lamp => !usedTypes.includes(lamp.id))
    }

    protected _addLightType() {
        const availableLampType = this._findNextAvailableLampType()

        if (availableLampType) {
            // Thêm loại đèn mới với giá trị mặc định và thông tin công suất
            this._lightTypes = [
                ...this._lightTypes,
                {
                    type: availableLampType.id,
                    brightness: 50,
                    powerConsumption: availableLampType.powerConsumption
                }
            ]

            // Tự động mở selector cho loại đèn mới
            setTimeout(() => {
                this._activeLampTypeSelector = this._lightTypes.length - 1
            }, 0)
        } else {
            this._showToast("Tất cả các loại đèn đã được sử dụng", true)
        }
    }

    protected _removeLightType(index: number) {
        // Cập nhật danh sách đèn trong modal
        this._lightTypes = this._lightTypes.filter((_, i) => i !== index)

        // Nếu đang có time slot được chọn, cập nhật ngay lập tức
        if (this._selectedTimeSlotIndex !== null) {
            // Tạo bản sao của lightTypes hiện tại
            const updatedLightTypes = this._lightTypes.map(type => ({
                type: type.type,
                brightness: type.brightness
            }))

            // Cập nhật time slot
            this._timeSlots = this._timeSlots.map((slot, idx) =>
                idx === this._selectedTimeSlotIndex
                    ? { ...slot, lightTypes: updatedLightTypes }
                    : slot
            )
        }

        // Nếu không còn đèn nào, đóng modal
        if (this._lightTypes.length === 0) {
            this._closeLightTypeModal()
        }
    }

    protected _updateLightType(index: number, field: "type" | "brightness", value: string | number) {
        this._lightTypes = this._lightTypes.map((light, i) => {
            if (i === index) {
                return { ...light, [field]: value }
            }
            return light
        })
    }

    protected _selectLightType(index: number, typeId: string) {
        if (this._activeLampTypeSelector !== null) {
            this._updateLightType(this._activeLampTypeSelector, "type", typeId);
            this._activeLampTypeSelector = null;
        }
    }

    _handleStartDateChange(value: string) {
        this._startDate = value
        this._minEndDate = value

        // Set default times since we removed the time pickers
        this._startTime = "00:00"

        // Clear all time slot validation errors when date changes
        if (this._errors.timeSlots) {
            this._errors.timeSlots = {}
            this.requestUpdate()
        }

        // Update end date if it's before start date
        if (this._endDate && this._endDate < value) {
            this._endDate = value
        }
    }

    // Add a method to check if a time is in the past
    protected _isTimeInPast(timeString: string): boolean {
        if (!timeString) return false

        const now = new Date()
        const today = now.toISOString().split("T")[0]

        // Chỉ kiểm tra nếu là ngày hiện tại
        if (this._startDate === today) {
            const [hours, minutes] = timeString.split(":").map(Number)
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()

            return hours < currentHour || (hours === currentHour && minutes < currentMinute)
        }

        return false
    }

    protected _handleStartTimeChange(value: string) {
        if (!value) return

        const now = new Date()
        const today = now.toISOString().split("T")[0]

        // Validate against current time if today
        if (this._startDate === today) {
            const [hours, minutes] = value.split(":").map(Number)
            const currentHours = now.getHours()
            const currentMinutes = now.getMinutes()

            if (hours < currentHours || (hours === currentHours && minutes < currentMinutes)) {
                this._errors.startTime = `Giờ bắt đầu không được nhỏ hơn giờ hiện tại (${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")})`
                this.requestUpdate()
                return
            }
        }

        // Clear any existing errors and update start time
        delete this._errors.startTime
        this._startTime = value

        // Validate time slots if they exist
        if (this._timeSlots.length > 0) {
            this._validateTimeSlotsOnScheduleChange()
        }

        this._updateEndTimeConstraints()
        this.requestUpdate()
    }

    protected _validateTimeSlotsOnScheduleChange() {
        // Only validate if we have both start and end times
        if (!this._startTime) return

        this._timeSlots.forEach((slot, index) => {
            if (slot.startTime) {
                this._validateTimeSlotInput(index, "startTime", slot.startTime, true)
            }
            if (slot.endTime) {
                this._validateTimeSlotInput(index, "endTime", slot.endTime, true)
            }
        })

        this.requestUpdate()
    }

    protected _validateAllTimeSlots() {
        // Initialize or reset the timeSlots errors
        if (!this._errors.timeSlots) {
            this._errors.timeSlots = {};
        } else {
            // Reset all existing time slot errors
            this._errors.timeSlots = {};
        }

        // Check each time slot for conflicts with other slots
        for (let i = 0; i < this._timeSlots.length; i++) {
            const slot = this._timeSlots[i];

            // Skip incomplete slots
            if (!slot.startTime || !slot.endTime) continue;

            // First validate that end time is greater than start time
            if (slot.startTime >= slot.endTime) {
                if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {};
                this._errors.timeSlots[i].startTime = "Từ giờ phải nhỏ hơn đến giờ";
                this._errors.timeSlots[i].endTime = "Đến giờ phải lớn hơn từ giờ";
                continue;
            }

            // Check for overlap with other time slots
            let hasOverlap = false;
            for (let j = 0; j < this._timeSlots.length; j++) {
                if (i === j) continue; // Skip comparing with itself

                const otherSlot = this._timeSlots[j];
                if (!otherSlot.startTime || !otherSlot.endTime) continue; // Skip incomplete slots

                // Check for time overlap
                if (this._isTimeOverlap(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime)) {
                    hasOverlap = true;
                    break;
                }
            }

            // Set error if there's an overlap
            if (hasOverlap) {
                if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {};
                this._errors.timeSlots[i].startTime = "Khoảng thời gian bị trùng với dòng khác";
                this._errors.timeSlots[i].endTime = "Khoảng thời gian bị trùng với dòng khác";
            }
        }

        // Clean up if no errors remain
        if (Object.keys(this._errors.timeSlots).length === 0) {
            delete this._errors.timeSlots;
        }

        this.requestUpdate();
    }

    protected _isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        const [start1Hours, start1Minutes] = start1.split(":").map(Number)
        const [end1Hours, end1Minutes] = end1.split(":").map(Number)
        const [start2Hours, start2Minutes] = start2.split(":").map(Number)
        const [end2Hours, end2Minutes] = end2.split(":").map(Number)

        const start1Time = start1Hours * 60 + start1Minutes
        const end1Time = end1Hours * 60 + end1Minutes
        const start2Time = start2Hours * 60 + start2Minutes
        const end2Time = end2Hours * 60 + end2Minutes

        // Hai khoảng thời gian trùng nhau khi:
        // 1. Thời gian bắt đầu của slot 1 nhỏ hơn thời gian kết thúc của slot 2 VÀ
        // 2. Thời gian kết thúc của slot 1 lớn hơn thời gian bắt đầu của slot 2
        // 3. Thời gian kết thúc của slot 1 không được bằng thời gian bắt đầu của slot 2
        // 4. Thời gian bắt đầu của slot 1 không được bằng thời gian kết thúc của slot 2
        const isOverlap = start1Time < end2Time && end1Time > start2Time && end1Time !== start2Time && start1Time !== end2Time

        return isOverlap
    }

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

            // Validate dates and times only for "once" and "repeat" schedules
            if (this._scheduleType !== "always") {
                const currentDate = new Date()
                currentDate.setHours(12, 0, 0, 0)

                const startDate = new Date(this._startDate)
                startDate.setHours(12, 0, 0, 0)

                if (this._scheduleType === "once" || (this._scheduleType === "repeat" && !this._noEndDate)) {
                    const endDate = new Date(this._endDate)
                    endDate.setHours(12, 0, 0, 0)

                    // Validate end date >= start date
                    if (endDate < startDate) {
                        this._errors.endDate = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
                        this._showToast("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", true)
                        return
                    }
                }
            }

            // Validate selected days for repeat schedule
            if (this._scheduleType === "repeat" && this._selectedDays.length === 0) {
                this._showToast("Vui lòng chọn ít nhất một ngày trong tuần cho lịch lặp lại", true)
                return
            }

            // Validate time slots - basic validation for all schedule types
            this._errors.timeSlots = {}
            for (let i = 0; i < this._timeSlots.length; i++) {
                const slot = this._timeSlots[i]

                if (!slot.startTime) {
                    if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                    this._errors.timeSlots[i].startTime = "Vui lòng nhập giờ bắt đầu"
                    this._showToast("Vui lòng nhập giờ bắt đầu cho tất cả các khoảng thời gian", true)
                    return
                }

                if (!slot.endTime) {
                    if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {}
                    this._errors.timeSlots[i].endTime = "Vui lòng nhập giờ kết thúc"
                    this._showToast("Vui lòng nhập giờ kết thúc cho tất cả các khoảng thời gian", true)
                    return
                }
            }

            // Validate at least one slot with brightness=0
            const hasBrightnessZero = this._timeSlots.some(slot => Number(slot.brightness) === 0);
            if (!hasBrightnessZero) {
                this._errors.brightnessZero = "Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0";
                this._activeTab = "dim";
                this._showToast("Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0", true);
                this.requestUpdate();
                return;
            }

            // Lấy dữ liệu hiện tại từ API
            const currentData = await manager.rest.api.ScheduleInfoResource.getDetail(this.scheduleId)
            console.log("Current data from API:", currentData.data)

            // Tạo đối tượng schedule dựa trên dữ liệu hiện tại
            const schedule: any = {
                id: this.scheduleId,
                scheduleName: this._selectedScheduleName,
                scheduleCode: this._selectedScheduleCode,
                realm: manager.displayRealm || "master",
                active: this._isActive ? 1 : 0,
                schType: this._mapScheduleTypeToApi(),
                description: currentData.data.description || "",
                deleted: 0,
                createBy: currentData.data.createBy,
                createDate: currentData.data.createDate,
                updateBy: manager.username || "admin",
                updateDate: new Date().getTime(),
            }

            // Create Date objects for start and end dates using UTC
            const startDate = new Date(this._startDate)
            const [sy, sm, sd] = this._startDate.split('-').map(Number)
            const localStartDate = new Date(sy, sm-1, sd, 0, 0, 0, 0)

            // Xử lý ngày kết thúc cho lịch lặp lại với "không kết thúc"
            let localEndDate: Date;
            if (this._scheduleType === "repeat" && this._noEndDate) {
                // Nếu chọn không kết thúc, set ngày kết thúc là ngày bắt đầu + 100 năm
                localEndDate = new Date(localStartDate)
                localEndDate.setFullYear(localEndDate.getFullYear() + 100)
            } else {
                const endDate = new Date(this._endDate)
                const [ey, em, ed] = this._endDate.split('-').map(Number)
                localEndDate = new Date(ey, em-1, ed, 23, 59, 59, 999)
            }

            schedule.schFromDate = localStartDate.getTime()
            schedule.schToDate = localEndDate.getTime()

            // Thiết lập lặp lại cho lịch trình lặp lại
            if (this._scheduleType === "repeat") {
                schedule.isSchRepeatEnd = !this._noEndDate

                // Only set schRepeatOccu if days are selected
                if (this._selectedDays.length > 0) {
                    schedule.schRepeatOccu = this._formatSelectedDays()
                } else {
                    // If no days selected, set to empty string or null
                    schedule.schRepeatOccu = ""
                }
            }

            // Khoảng thời gian
            schedule.schTimePeriods = this._timeSlots.map((slot, index) => ({
                time_id: index + 1,
                time_from: slot.startTime,
                time_to: slot.endTime,
                time_value: slot.brightness,
            }))

            // Cấu hình thời gian với cấu trúc chính xác
            schedule.timeConfigurations = this._timeSlots.map((slot, index) => {
                return {
                    timePeriod: {
                        time_id: index + 1,
                        time_value: parseInt(slot.brightness?.toString() || "50"), // Convert to number
                        time_from: slot.startTime,
                        time_to: slot.endTime,
                    },
                    lampTypes: (slot.lightTypes || []).map((type) => {
                        // Tìm thông tin đèn từ API để lấy tên đèn
                        const lampType = this._lampTypesFromApi.find(lamp => lamp.id === type.type);
                        return {
                            time_id: index + 1,
                            lamp_type_id: parseInt(type.type.toString()), // Convert to number
                            lamp_type_value: type.brightness.toString(),
                            lamp_type_name: lampType ? lampType.name : ""
                        }
                    }),
                }
            })

            // Loại bỏ customizeLampType vì chúng ta đã xử lý lightTypes trong timeConfigurations
            schedule.customizeLampType = []

            // Log dữ liệu trước khi gửi để debug
            console.log("Schedule data to be sent:", JSON.stringify(schedule, null, 2))

            // Fix the _saveSchedule method to handle DeviceItem type correctly
            schedule.scheduleAssets = this._devices.map((device) => {
                // Check if device has originalId property before accessing it
                const assetId = "originalId" in device ? device.originalId || device.code : device.code
                // Check if device has assetTypeCode property before accessing it
                const typeCode = "assetTypeCode" in device ? device.assetTypeCode || device.code : device.code

                return {
                    asset_id: assetId,
                    sys_asset_id: device.assetTypeId || "1",
                    assetName: device.name,
                    assetTypeName: device.type,
                    assetTypeCode: typeCode,
                }
            })

            // KHÔNG gọi API update ở đây nữa!
            // Chỉ emit event cho cha xử lý
            const event = new CustomEvent("save-schedule", {
                detail: {
                    ...schedule,
                    active: this._isActive ? 1 : 0, // Đảm bảo gửi đúng giá trị active
                },
                bubbles: true,
                composed: true,
            })
            this.dispatchEvent(event)

            // Có thể update local state nếu muốn, hoặc bỏ qua
        } catch (error) {
            console.error("Error saving schedule:", error)
            this.showNotification("Lỗi khi lưu lịch", true)
        }
    }

    protected _cancel() {
        this.dispatchEvent(new CustomEvent("cancel"))
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
                                style="width: 100%; ${this._errors.startDate ? "border: 1px solid red;" : ""}"
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
                                value="${this._endDate}"
                                style="width: 100%; ${this._errors.endDate ? "border: 1px solid red;" : ""}"
                                @value-changed=${(e: CustomEvent) => this._handleEndDateChange(e.detail.value)}>
                        </vaadin-date-picker>
                    </div>
                    ${this._errors.endDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;">${this._errors.endDate}</div>` : ""}
                </div>
            </div>
        `
    }

    // Update the _renderRepeatSchedule method to display validation errors
    protected _renderRepeatSchedule() {
        // Calculate the date difference in days
        const startDate = new Date(this._startDate)
        const endDate = new Date(this._endDate)
        const dateDifferenceInDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const showDaySelection = dateDifferenceInDays > 7 || this._noEndDate

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
                                        ${this._errors.endDate ? html`<div style="color: red; font-size: 12px; margin-top: 4px;margin-left: 165px;">${this._errors.endDate}</div>` : ""}
                                    </div>
                                `
                : ""
        }
            </div>

            <div class="checkbox-container">
                <input type="checkbox" id="noEndDate" ?checked=${this._noEndDate} @change=${(e: Event) => (this._noEndDate = (e.target as HTMLInputElement).checked)}>
                <label for="noEndDate">Không kết thúc</label>
            </div>

            ${html`
                <div class="schedule-section">
                    <div class="schedule-section-title">Lặp lại kịch bản</div>
                    <div class="day-buttons">
                        ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => {
            const isSelected = this._selectedDays.includes(day)
            return html`
                                <button
                                        class="day-button ${isSelected ? "selected" : ""}"
                                        @click=${() => this._toggleDay(day)}
                                >
                                    ${day}
                                </button>
                            `
        })}
                    </div>
                </div>
            `}
        `
    }

    // Update the _renderDimSettings method to show lamp types info
    protected _renderDimSettings() {
        // Check for brightness=0 validation error
        const hasBrightnessZero = this._timeSlots.some(slot => Number(slot.brightness) === 0);
        const brightnessZeroError = this._errors.brightnessZero;
        return html`
            <div>
                ${brightnessZeroError ? html`<div style="color: #e53935; font-size: 13px; margin-bottom: 8px;">${brightnessZeroError}</div>` : ""}
                <button 
                    class="add-row-button" 
                    ?disabled=${!this._areAllDevicesSuccess()} 
                    @click=${this._areAllDevicesSuccess() ? this._addTimeSlot : null}>
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
                                        ${slot.lightTypes && slot.lightTypes.length > 0 ? `${slot.lightTypes.length} loại đèn` : "Chọn loại đèn"}
                                    </td>
                                    <td class="action-cell">
                                        <button 
                                            class="action-button" 
                                            ?disabled=${!this._areAllDevicesSuccess()} 
                                            @click=${this._areAllDevicesSuccess() ? () => this._copyTimeSlot(index) : null}>
                                            <vaadin-icon icon="vaadin:copy"></vaadin-icon>
                                        </button>
                                        <button 
                                            class="action-button" 
                                            ?disabled=${!this._areAllDevicesSuccess()} 
                                            @click=${this._areAllDevicesSuccess() ? () => this._removeTimeSlot(index) : null}>
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

    protected
    _openDeviceTreeModal() {
        this._showDeviceTreeModal = true

        // Reset selected IDs with existing devices
        this._selectedDeviceIds = []

        // For each device in the table
        this._devices.forEach(device => {
            if (!device.originalId) return

            // Add the device ID itself
            this._selectedDeviceIds.push(device.originalId)

            // Find the node in tree
            const node = this._findNodeInDeviceTree(this._deviceTree, device.originalId)
            if (node) {
                // Add all descendant IDs
                this._getAllDescendantIds(node).forEach(id => {
                    if (!this._selectedDeviceIds.includes(id)) {
                        this._selectedDeviceIds.push(id)
                    }
                })
            }
        })
    }

    protected _closeDeviceTreeModal() {
        this._showDeviceTreeModal = false;
        this._searchTerm = "";
    }

    protected _toggleTypeExpanded(typeId: string) {
        if (this._expandedTypes.includes(typeId)) {
            this._expandedTypes = this._expandedTypes.filter((id) => id !== typeId)
        } else {
            this._expandedTypes = [...this._expandedTypes, typeId]
        }
    }

    // Utility function to find a node in the device tree
    protected _findNodeInDeviceTree(nodes: DeviceTreeNode[], id: string): DeviceTreeNode | null {
        for (const node of nodes) {
            if (node.id === id) {
                return node
            }
            if (node.children) {
                const found = this._findNodeInDeviceTree(node.children, id)
                if (found) {
                    return found
                }
            }
        }
        return null
    }

    protected _toggleDeviceSelection(nodeId: string) {
        const node = this._findNodeInDeviceTree(this._deviceTree, nodeId)
        if (!node) return

        // Get all descendant IDs of the current node
        const descendantIds = this._getAllDescendantIds(node)

        // If node is being selected
        if (!this._selectedDeviceIds.includes(nodeId)) {
            // Add the node and all its descendants
            this._selectedDeviceIds = [...this._selectedDeviceIds, nodeId, ...descendantIds]

            // Check if this selection completes a parent's children selection
            let currentNode = node
            let parent = this._findNodeInDeviceTree(this._deviceTree, this._findParentId(currentNode.id))

            while (parent) {
                const allSiblings = this._getAllDescendantIds(parent)
                const allSiblingsSelected = allSiblings.every(id => this._selectedDeviceIds.includes(id))

                if (allSiblingsSelected && !this._selectedDeviceIds.includes(parent.id)) {
                    // If all siblings are selected, also select the parent
                    this._selectedDeviceIds = [...this._selectedDeviceIds, parent.id]
                }

                currentNode = parent
                parent = this._findNodeInDeviceTree(this._deviceTree, this._findParentId(currentNode.id))
            }
        } else {
            // Remove the node and all its descendants
            this._selectedDeviceIds = this._selectedDeviceIds.filter(
                (id) => id !== nodeId && !descendantIds.includes(id)
            )

            // Also remove any parent nodes that were auto-selected
            let currentNode = node
            let parent = this._findNodeInDeviceTree(this._deviceTree, this._findParentId(currentNode.id))

            while (parent) {
                if (this._selectedDeviceIds.includes(parent.id)) {
                    this._selectedDeviceIds = this._selectedDeviceIds.filter(id => id !== parent.id)
                }
                currentNode = parent
                parent = this._findNodeInDeviceTree(this._deviceTree, this._findParentId(currentNode.id))
            }
        }

        this.requestUpdate()
    }

    protected _getNodeState(node: DeviceTreeNode): "selected" | "partial" | "none" {
        // If node is directly selected
        if (this._selectedDeviceIds.includes(node.id)) {
            return "selected"
        }

        // If node has children, check their states
        if (node.children && node.children.length > 0) {
            const descendantIds = this._getAllDescendantIds(node)
            const selectedDescendants = descendantIds.filter(id => this._selectedDeviceIds.includes(id))

            if (selectedDescendants.length === descendantIds.length) {
                // If all descendants are selected, mark this node as selected too
                if (!this._selectedDeviceIds.includes(node.id)) {
                    this._selectedDeviceIds = [...this._selectedDeviceIds, node.id]
                }
                return "selected"
            }

            return selectedDescendants.length > 0 ? "partial" : "none"
        }

        return "none"
    }
    private _getDeviceMdiIconInfo(type: string): { icon: string, color: string } {
        switch (type) {
            case "LightAsset":
                return { icon: "lightbulb", color: "#ff4081" }
            case "ElectricalCabinetAsset":
                return { icon: "file-cabinet", color: "#ffc107" }
            case "RoadAsset":
                return { icon: "road-variant", color: "#000000" }
            case "LightGroupAsset":
                return { icon: "lightbulb-group-outline", color: "#ff4081" }
            case "FixedGroupAsset":
                return { icon: "lightbulb-group", color: "#ff4081" }
            default:
                return { icon: "help-circle-outline", color: "#757575" }
        }
    }

    protected _renderDeviceTree(node: DeviceTreeNode, level = 0): TemplateResult {
        const nodeState = this._getNodeState(node)
        const isExpanded = this._expandedTypes.includes(node.id)
        const paddingLeft = level * 20
        const { icon, color } = this._getDeviceMdiIconInfo(node.type);

        return html`
            <div class="tree-node" style="padding-left: ${paddingLeft}px">
                <div class="node-content" @click=${() => this._toggleDeviceSelection(node.id)}>
                    ${
            node.children && node.children.length > 0
                ? html`
                                        <span class="expand-icon" @click=${(e: Event) => {
                    e.stopPropagation()
                    this._toggleTypeExpanded(node.id)
                }}>
                                ${this._expandedTypes.includes(node.id) ? "▼" : "▶"}
                            </span>`
                : html`<span class="expand-icon-placeholder"></span>`
        }
                    <span class="checkbox-icon">
                        ${nodeState === "selected" ? "✓" : nodeState === "partial" ? "•" : ""}
                    </span>
                    <or-icon icon="${icon}" style="--or-icon-fill: ${color}; font-size: 22px; margin-right: 8px;"></or-icon>
                    <span class="node-name">${node.name}</span>
                </div>
                ${
            node.children && this._expandedTypes.includes(node.id)
                ? node.children.map((child) => this._renderDeviceTree(child, level + 1))
                : ""
        }
            </div>
        `
    }

    protected _renderDeviceTreeModal() {
        if (!this._showDeviceTreeModal) {
            return html``
        }

        return html`
            <div class="modal-overlay">
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div class="modal-title">Chọn thiết bị</div>
                        <button class="close-button" @click=${this._closeDeviceTreeModal}>
                            <vaadin-icon icon="vaadin:close"></vaadin-icon>
                        </button>
                    </div>

                    <input
                            type="text"
                            class="search-box"
                            placeholder="Tìm kiếm thiết bị..."
                            @input=${this._handleSearch}
                            .value=${this._searchTerm}
                    >

                    <div class="tree-container">
                        ${
            this._filterDeviceTree().map((node) => this._renderDeviceTree(node, 0))
        }
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                        <button class="secondary-button" @click=${this._closeDeviceTreeModal}>Hủy</button>
                        <button class="save-button" @click=${this._saveSelectedDevices}>
                            Lưu thiết bị
                        </button>
                    </div>
                </div>
            </div>
        `
    }

    protected _renderDeviceSettings() {
        return html`
            <div class="device-panel">
                <button 
                    style="width: 30px; height: 30px; background-color: ${this._areAllDevicesSuccess() ? '#4D9D2A' : '#cccccc'}; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: none; cursor: ${this._areAllDevicesSuccess() ? 'pointer' : 'not-allowed'}; margin-bottom: 10px;" 
                    ?disabled=${!this._areAllDevicesSuccess()} 
                    @click=${this._areAllDevicesSuccess() ? this._openDeviceTreeModal : null}>
                    <vaadin-icon icon="vaadin:plus" style="color: white;"></vaadin-icon>
                </button>
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Loại</th>
                        <th>Tên</th>
                        <th>Thuộc đường</th>
                        <th>Trạng thái</th>
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
                                    <td>
                                        ${this._renderStatusForDevice(device)}
                                    </td>
                                    <td class="action-cell">
                                        <button 
                                            class="action-button" 
                                            ?disabled=${!this._areAllDevicesSuccess()} 
                                            @click=${this._areAllDevicesSuccess() ? () => this._handleDeleteDevice(device.id) : null}>
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

    protected _areAllDevicesSuccess(): boolean {
        if (!this._devices || this._devices.length === 0) return true
        // Disable save button if any device is pending (status === 0)
        // Enable if all devices are completed: successful (1), failed (-1), delete successful (2), or delete failed (-2)
        return !this._devices.some((device: any) => {
            const status: number | undefined = (device && 'status' in device) ? device.status : undefined
            return status === 0
        })
    }

    protected _mapStatusToText(status: number | undefined): string {
        switch (status) {
            case 1:
                return "Gửi thành công"
            case 0:
                return "Đang gửi"
            case -1:
                return "Gửi thất bại"
            case 2:
                return "Xóa thành công"
            case -2:
                return "Xóa thất bại"
            default:
                return "-"
        }
    }

    protected _mapStatusToClass(status: number | undefined): string {
        switch (status) {
            case 1:
                return "status-text-cell status-success"
            case 0:
                return "status-text-cell status-pending"
            case -1:
                return "status-text-cell status-failed"
            case 2:
                return "status-text-cell status-delete-success"
            case -2:
                return "status-text-cell status-delete-failed"
            default:
                return "status-text-cell"
        }
    }

    protected _renderStatusForDevice(device: any) {
        const status: number | undefined = (device && 'status' in device) ? (device as any).status : undefined
        const text = this._mapStatusToText(status)
        const cls = this._mapStatusToClass(status)
        return html`<span class="${cls}">${text}</span>`
    }

    protected _openLampTypeSelector(index: number) {
        this._activeLampTypeSelector = this._activeLampTypeSelector === index ? null : index
    }

    protected _selectLampType(index: number, typeId: string) {
        // Kiểm tra xem loại đèn đã được sử dụng chưa
        const usedTypes = this._lightTypes.map((light, i) => i !== index ? light.type : null).filter(type => type !== null);
        if (usedTypes.includes(typeId)) {
            this._showToast("Loại đèn này đã được chọn", true);
            return;
        }

        // Tìm thông tin đèn từ API
        const lampType = this._lampTypesFromApi.find(lamp => lamp.id === typeId);
        if (!lampType) {
            this._showToast("Không tìm thấy thông tin loại đèn", true);
            return;
        }

        // Cập nhật loại đèn với thông tin đầy đủ
        this._lightTypes = this._lightTypes.map((light, i) => {
            if (i === index) {
                return {
                    ...light,
                    type: typeId,
                    powerConsumption: lampType.powerConsumption
                };
            }
            return light;
        });

        // Đóng selector sau khi chọn
        this._activeLampTypeSelector = null;
    }

    protected _handleClickOutside(e: MouseEvent) {
        if (this._activeLampTypeSelector !== null) {
            const target = e.target as HTMLElement
            if (!target.closest(".lamp-type-selector") && !target.closest(".lamp-type-dropdown")) {
                this._activeLampTypeSelector = null
            }
        }
    }

    protected showNotification(message: string, isError = false) {
        this._notification = { show: true, message, isError }

        setTimeout(() => {
            this._notification = { ...this._notification, show: false }
        }, 3000)
    }

    protected _showToast(message: string, isError = false) {
        this._toast = { message, isError }
        setTimeout(() => {
            this._toast = null
        }, 3000)
    }

    // Thay đổi phần hiển thị độ sáng trong modal
    protected _renderLightTypeModal() {
        if (!this._showLightTypeModal) {
            return html``;
        }

        // Get list of used light types
        const usedTypes = this._lightTypes.map(light => light.type);

        return html`
            <div class="modal-overlay" @click=${this._closeLightTypeModal}>
                <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div class="modal-title">Loại đèn</div>
                        <button class="close-button" @click=${this._closeLightTypeModal}>
                            <vaadin-icon icon="vaadin:close"></vaadin-icon>
                        </button>
                    </div>

                    ${this._lightTypes.length === 0
            ? html`
                                <div class="empty-state">
                                    <p>Chưa có loại đèn nào được chọn</p>
                                    <button 
                                        class="add-light-button" 
                                        ?disabled=${!this._areAllDevicesSuccess()} 
                                        @click=${this._areAllDevicesSuccess() ? this._addFirstLightType : null}>
                                        <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                                        Thêm loại đèn
                                    </button>
                                </div>
                            `
            : html`
                                <div style="display: flex; margin-bottom: 15px; font-weight: bold;">
                                    <div style="width: 150px;">Loại đèn</div>
                                    <div style="width: 150px;">% Độ sáng</div>
                                </div>

                                ${this._lightTypes.map((light, index) => {
                const lampType = this._lampTypesFromApi.find(
                    (lamp) => lamp.id === light.type
                );

                return html`
                                        <div style="display: flex; margin-bottom: 15px; align-items: center;">
                                            <div style="width: 150px; margin-right: 10px;">
                                                <div class="lamp-type-selector"
                                                     style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                                                     @click=${() => this._openLampTypeSelector(index)}>
                                                    <span>${lampType ? lampType.powerConsumption : 0}W</span>
                                                    <vaadin-icon icon="vaadin:chevron-down"></vaadin-icon>
                                                </div>
                                                ${this._activeLampTypeSelector === index
                    ? html`
                                                            <div class="lamp-type-dropdown"
                                                                 style="position: absolute; background: white; border: 1px solid #e0e0e0; border-radius: 4px; max-height: 200px; overflow-y: auto; width: 150px; z-index: 1000;">
                                                                ${this._lampTypesFromApi.map((lamp) => {
                        const isDisabled = usedTypes.includes(lamp.id) && lamp.id !== light.type;

                        return html`
                                                                        <div class="lamp-type-option ${isDisabled ? "disabled" : ""}"
                                                                             style="padding: 8px; cursor: ${isDisabled ? "not-allowed" : "pointer"}; ${lamp.id === light.type ? "background-color: #f0f0f0;" : ""}"
                                                                             @click=${() => !isDisabled && this._selectLampType(index, lamp.id)}>
                                                                            ${lamp.powerConsumption}W
                                                                            ${isDisabled
                            ? html`<span style="color: red; font-size: 12px; margin-left: 5px;">(Đã được sử dụng)</span>`
                            : ""}
                                                                        </div>
                                                                    `;
                    })}
                                                            </div>
                                                        `
                    : ""}
                                            </div>
                                            <div style="width: 100px; margin-left: 40px;">
                                                <input type="number"
                                                       min="0"
                                                       max="100"
                                                       .value=${light.brightness.toString()}
                                                       @input=${(e: Event) => {
                    let value = Number.parseInt((e.target as HTMLInputElement).value) || 0;
                    if (value < 0) value = 0;
                    if (value > 100) value = 100;
                    (e.target as HTMLInputElement).value = value.toString();
                    this._lightTypes = this._lightTypes.map((lt, i) =>
                        i === index ? { ...lt, brightness: value } : lt
                    );
                }}
                                                       style="width: 60px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;">
                                            </div>
                                            <div class="light-type-actions">
                                                <button 
                                                    class="action-button" 
                                                    ?disabled=${!this._areAllDevicesSuccess()} 
                                                    @click=${this._areAllDevicesSuccess() ? this._addLightType : null}>
                                                    <vaadin-icon icon="vaadin:plus"></vaadin-icon>
                                                    Thêm loại đèn
                                                </button>
                                            </div>
                                            <button 
                                                class="action-button"
                                                ?disabled=${!this._areAllDevicesSuccess()}
                                                @click=${this._areAllDevicesSuccess() ? () => this._removeLightType(index) : null}
                                                style="margin-left: 10px;">
                                                <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                            </button>
                                        </div>
                                    `;
            })}
                            `}

                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                        <button class="save-button" @click=${this._closeLightTypeModal}>Close</button>
                    </div>
                </div>
            </div>
        `;
    }

    protected _renderDeleteDeviceModal() {
        if (!this._isDeleteDeviceDialogOpen) {
            return html``;
        }

        return html`
            <vaadin-dialog 
                theme="no-padding"
                .opened=${this._isDeleteDeviceDialogOpen}
                @opened-changed="${(e: CustomEvent) => (this._isDeleteDeviceDialogOpen = e.detail.value)}"
                .renderer="${(root: HTMLElement) => {
                    if (root.firstElementChild) return

                    const dialog = document.createElement("div")
                    dialog.style.width = "auto"
                    dialog.style.maxWidth = "100%"
                    dialog.style.borderRadius = "4px"
                    dialog.style.overflow = "hidden"
                    dialog.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)"
                    dialog.style.padding = "0"

                    const header = document.createElement("div")
                    header.style.backgroundColor = "#4d9d2a"
                    header.style.color = "white"
                    header.style.padding = "12px 20px"
                    header.style.fontSize = "18px"
                    header.style.fontWeight = "500"
                    header.style.display = "flex"
                    header.style.justifyContent = "space-between"
                    header.style.alignItems = "center"

                    const titleContainer = document.createElement("div")
                    titleContainer.style.flex = "1"
                    titleContainer.style.textAlign = "center"
                    titleContainer.textContent = "Xác nhận"

                    const closeBtn = document.createElement("span")
                    closeBtn.innerHTML = "✕"
                    closeBtn.style.cursor = "pointer"
                    closeBtn.style.fontSize = "20px"
                    closeBtn.addEventListener("click", () => this._cancelDeleteDevice())

                    const placeholder = document.createElement("div")
                    placeholder.style.width = "20px"

                    header.appendChild(placeholder)
                    header.appendChild(titleContainer)
                    header.appendChild(closeBtn)

                    const content = document.createElement("div")
                    content.style.padding = "20px"
                    content.style.backgroundColor = "white"
                    content.style.textAlign = "center"
                    content.style.fontSize = "16px"
                    content.style.lineHeight = "1.5"
                    content.innerHTML = "Bạn có muốn gửi bản tin xóa kịch bản này xuống thiết bị <strong>" + (this._deviceToDelete?.name || "") + "</strong> không?"

                    const footer = document.createElement("div")
                    footer.style.display = "flex"
                    footer.style.justifyContent = "center"
                    footer.style.gap = "10px"
                    footer.style.padding = "0 20px 20px"

                    const cancelBtn = document.createElement("button")
                    cancelBtn.textContent = "Hủy"
                    cancelBtn.style.backgroundColor = "#e0e0e0"
                    cancelBtn.style.color = "#333"
                    cancelBtn.style.border = "none"
                    cancelBtn.style.padding = "8px 20px"
                    cancelBtn.style.borderRadius = "4px"
                    cancelBtn.style.cursor = "pointer"
                    cancelBtn.style.fontSize = "14px"
                    cancelBtn.addEventListener("click", () => this._cancelDeleteDevice())

                    const confirmBtn = document.createElement("button")
                    confirmBtn.textContent = "Xóa"
                    confirmBtn.style.backgroundColor = "#4d9d2a"
                    confirmBtn.style.color = "white"
                    confirmBtn.style.border = "none"
                    confirmBtn.style.padding = "8px 20px"
                    confirmBtn.style.borderRadius = "4px"
                    confirmBtn.style.cursor = "pointer"
                    confirmBtn.style.fontSize = "14px"
                    confirmBtn.addEventListener("click", () => this._confirmDeleteDevice())

                    footer.appendChild(cancelBtn)
                    footer.appendChild(confirmBtn)

                    dialog.appendChild(header)
                    dialog.appendChild(content)
                    dialog.appendChild(footer)

                    root.appendChild(dialog)
                }}"
            ></vaadin-dialog>
        `;
    }

    protected _updateEndTimeConstraints() {
        if (!this._allDay && this._startTime) {
            this._minEndTime = this._startTime

            if (this._endTime && this._startDate === this._endDate) {
                if (this._endTime < this._startTime) {
                    this._errors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu trong cùng một ngày"
                } else {
                    delete this._errors.endTime
                }
            }
        } else {
            this._minEndTime = ""
            delete this._errors.endTime
        }

        this.requestUpdate()
    }

    protected _validateTimeSlotInput(
        index: number,
        field: "startTime" | "endTime",
        value: string,
        skipValidation = false,
    ) {
        // Cập nhật giá trị mới vào slot
        if (field === "startTime") {
            this._timeSlots[index].startTime = value;
        } else {
            this._timeSlots[index].endTime = value;
        }

        // Validate tất cả các time slots lại từ đầu để xử lý đúng khi có sự thay đổi
        this._validateAllTimeSlots();
    }

    // protected _validateAllTimeSlots() {
    //     // Khởi tạo hoặc reset lỗi timeSlots
    //     if (!this._errors.timeSlots) {
    //         this._errors.timeSlots = {};
    //     } else {
    //         // Reset tất cả lỗi slot hiện có
    //         this._errors.timeSlots = {};
    //     }
    //
    //     // Kiểm tra từng khoảng thời gian có xung đột với các khoảng khác không
    //     for (let i = 0; i < this._timeSlots.length; i++) {
    //         const slot = this._timeSlots[i];
    //
    //         // Bỏ qua nếu slot chưa đầy đủ thông tin
    //         if (!slot.startTime || !slot.endTime) continue;
    //
    //         // Đầu tiên kiểm tra thời gian kết thúc > thời gian bắt đầu
    //         if (slot.startTime >= slot.endTime) {
    //             if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {};
    //             this._errors.timeSlots[i].startTime = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc";
    //             this._errors.timeSlots[i].endTime = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc";
    //             continue;
    //         }
    //
    //         // Kiểm tra xung đột với các khoảng thời gian khác
    //         let hasOverlap = false;
    //         for (let j = 0; j < this._timeSlots.length; j++) {
    //             if (i === j) continue; // Bỏ qua so sánh với chính nó
    //
    //             const otherSlot = this._timeSlots[j];
    //             if (!otherSlot.startTime || !otherSlot.endTime) continue; // Bỏ qua slot chưa đầy đủ
    //
    //             // Kiểm tra xung đột thời gian
    //             if (this._isTimeOverlap(slot.startTime, slot.endTime, otherSlot.startTime, otherSlot.endTime)) {
    //                 hasOverlap = true;
    //                 break;
    //             }
    //         }
    //
    //         // Đặt lỗi nếu có xung đột
    //         if (hasOverlap) {
    //             if (!this._errors.timeSlots[i]) this._errors.timeSlots[i] = {};
    //             this._errors.timeSlots[i].startTime = "Khoảng thời gian bị trùng với dòng khác";
    //             this._errors.timeSlots[i].endTime = "Khoảng thời gian bị trùng với dòng khác";
    //         }
    //     }
    //
    //     // Dọn dẹp nếu không còn lỗi
    //     if (Object.keys(this._errors.timeSlots).length === 0) {
    //         delete this._errors.timeSlots;
    //     }
    //
    //     this.requestUpdate();
    // }

    protected _isValidTimeFormat(time: string): boolean {
        if (!time) return false
        const [hours, minutes] = time.split(":").map(Number)
        return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    }

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

    protected _formatSelectedDays(): string {
        // Map từ UI sang DB
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

        const dbDays = this._selectedDays.map((day) => dayMap[day] || day)
        return dbDays.join(",")
    }

    _handleEndDateChange(value: string) {
        this._endDate = value

        // Set default times since we removed the time pickers
        this._endTime = "12:59"

        // Clear all time slot validation errors when date changes
        if (this._errors.timeSlots) {
            this._errors.timeSlots = {}
            this.requestUpdate()
        }
    }

    _handleEndTimeChange(value: string) {
        if (!value) return

        this._endTime = value

        // Validate ngay khi thay đổi giờ kết thúc
        if (this._startTime) {
            if (this._startDate === this._endDate && value <= this._startTime) {
                this._errors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu trong cùng một ngày"
            } else {
                delete this._errors.endTime
            }
        }

        this._updateEndTimeConstraints()
        this._validateTimeSlotsOnScheduleChange()
        this.requestUpdate()
    }

    render() {
        console.log("[LOG] render() with _scheduleType:", this._scheduleType, "scheduleId:", this.scheduleId);
        if (!this._scheduleType) {
            return html`<div>Đang tải dữ liệu...</div>`;
        }
        return html`
            <div class="form-title">${this._selectedScheduleName}</div>
            <div class="toggle-container">
                <span class="toggle-label">Trạng thái:</span>
                <label class="toggle-switch">
                    <input
                            type="checkbox"
                            .checked=${this._isActive}
                            @change=${(e: Event) => {
            this._isActive = (e.target as HTMLInputElement).checked
            console.log("Toggle changed to:", this._isActive)
            this.requestUpdate()
        }}
                    >
                    <span class="toggle-slider"></span>
                </label>
                <span class="status-text ${this._isActive ? "active" : "inactive"}">
                    ${this._isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
            </div>

            <div class="date-container">
                <div class="date-group">
                    <div class="date-label">Ngày tạo</div>
                    <input type="text" value="${this._createDate}" readonly>
                    <div class="date-label" style="margin-top: 10px;">Người tạo</div>
                    <input type="text" value="${this._createBy}" readonly>
                </div>
                <div class="date-group">
                    <div class="date-label">Ngày cập nhật</div>
                    <input type="text" value="${this._updateDate}" readonly>
                    <div class="date-label" style="margin-top: 10px;">Người cập nhật</div>
                    <input type="text" value="${this._updateBy}" readonly>
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
                    <input type="radio" id="always" name="scheduleType-${this.scheduleId}" value="always"
                           ?checked=${this._scheduleType === "always"}
                           @change=${this._handleScheduleTypeChange}>
                    <label for="always">Luôn luôn</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="once" name="scheduleType-${this.scheduleId}" value="once"
                           ?checked=${this._scheduleType === "once"}
                           @change=${this._handleScheduleTypeChange}>
                    <label for="once">Lịch một lần</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="repeat" name="scheduleType-${this.scheduleId}" value="repeat"
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
                    <div class="tab-buttons" style="margin-bottom: 0;">
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
                    ${this._activeTab === "dim" ? html`
                        <div style="color: #e53935; font-size: 14px; font-weight: 500; white-space: nowrap;">
                            <b>Lưu ý:</b> Chỉ được phép thêm tối đa 5 khoảng thời gian và phải có ít nhất 1 khoảng thời gian có % độ sáng = 0.
                        </div>
                    ` : ""}
                </div>

                ${this._activeTab === "dim" ? this._renderDimSettings() : this._renderDeviceSettings()}
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button class="secondary-button" style="margin-right: 10px;" @click=${this._cancel}>Hủy</button>
                <button class="save-button" ?disabled=${!this._areAllDevicesSuccess()} @click=${this._saveSchedule}>Lưu</button>
            </div>

            ${this._renderLightTypeModal()}
            ${this._renderDeleteDeviceModal()}
            ${this._renderToast()}
            ${
            this._notification.show
                ? html`
                                <div class="notification ${this._notification.isError ? "error" : "success"}">
                                    ${this._notification.message}
                                </div>
                            `
                : ""
        }
        `
    }

    protected _addFirstLightType() {
        // Lấy loại đèn đầu tiên từ danh sách
        const firstLampType = this._lampTypesFromApi[0]

        if (firstLampType) {
            this._lightTypes = [{ type: firstLampType.id, brightness: 50 }]
        } else {
            this._showToast("Không có loại đèn nào", true)
            this._closeLightTypeModal()
        }
    }

    protected _renderToast() {
        if (!this._toast) return html``

        return html`
            <div class="toast ${this._toast.isError ? 'error' : 'success'}">
                ${this._toast.message}
            </div>
        `
    }

    protected _validateBrightnessZeroRule() {
        const hasBrightnessZero = this._timeSlots.some(slot => Number(slot.brightness) === 0);
        if (!hasBrightnessZero) {
            this._errors.brightnessZero = "Phải có ít nhất 1 khoảng thời gian có % độ sáng = 0";
        } else {
            if (this._errors.brightnessZero) delete this._errors.brightnessZero;
        }
        this.requestUpdate();
    }

    protected _handleSearch(e: Event) {
        this._searchTerm = (e.target as HTMLInputElement).value;
        this.requestUpdate();
    }

    protected _filterDeviceTree(): DeviceTreeNode[] {
        if (!this._searchTerm) {
            return this._deviceTree;
        }
        const searchTermLower = this._searchTerm.toLowerCase();
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
        const filterChildren = (children: DeviceTreeNode[]): DeviceTreeNode[] => {
            return children
                .filter((node) => nodeMatchesSearch(node))
                .map((node) => ({
                    ...node,
                    children: node.children ? filterChildren(node.children) : [],
                }));
        };
        return this._deviceTree
            .filter((node) => nodeMatchesSearch(node))
            .map((node) => ({
                ...node,
                children: node.children ? filterChildren(node.children) : [],
            }));
    }
}


