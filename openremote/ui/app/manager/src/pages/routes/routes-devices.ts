import manager from "@openremote/core";
import {LitElement, html, css} from "lit";
import {customElement, property, state, query} from "lit/decorators.js";
import "@vaadin/tabs"
import "@vaadin/tabsheet"
import "@vaadin/details"
import "@vaadin/vertical-layout"
import "@vaadin/card"
import "@openremote/or-asset-tree"
import 'jqtree'; // Import jqTree
import 'jqtree/jqtree.css';
import Qs from "qs";
import {PageMapConfig} from "../page-map";
import "@vaadin/notification"
import annotationPlugin from 'chartjs-plugin-annotation';
import"@vaadin/radio-group"
import {
    CenterControl,
    CoordinatesControl,
    LngLatLike,
    OrMap,
    OrMapLongPressEvent,
    OrMapMarker
} from "@openremote/or-map";
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from 'chart.js';
import { i18next } from "@openremote/or-translate";

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend, PieController,
    ArcElement, annotationPlugin);

@customElement("routes-devices")
export class MyElement extends LitElement {
    @state() value = 20
    @query("#map")
    protected _map?: OrMap;
    @state() treeData = [
        {id: 1, name: 'Node 1', children: [{id: 2, name: 'Node 1.1'}]},
        {id: 3, name: 'Node 2'}
    ];
    @state() showCabinet = false
    @state() showLight = false
    @state() showColumn = false
    @state() showFixed = false
    @state() loadingBUIE = false;
    static styles = css`
        :host {
            //display: block;
            //box-sizing: border-box;
        }
        .beauty-button {
            transition: transform 0.1s ease;
            cursor: pointer;
        }

        .beauty-button:active {
            transform: scale(0.6); 
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
        :host::part(content) {
            padding:0px;
            margin-top:10px;
        }
        ul.jqtree-tree {
            list-style: none outside;
            margin-left: 0;
            margin-bottom: 0;
            padding: 0;
        }

        ul.jqtree-tree.jqtree-dnd {
            margin: 0;
            touch-action: none;
        }

        ul.jqtree-tree ul.jqtree_common {
            list-style: none outside;
            margin-left: 12px;
            margin-right: 0;
            margin-bottom: 0;
            padding: 0;
            display: block;
        }

        ul.jqtree-tree li.jqtree-closed > ul.jqtree_common {
            display: none;
        }

        ul.jqtree-tree li.jqtree_common {
            clear: both;
            list-style-type: none;
        }

        ul.jqtree-tree .jqtree-toggler {
            border-bottom: none;
            color: #333;
            text-decoration: none;
            vertical-align: middle;
        }

        ul.jqtree-tree .jqtree-toggler:hover {
            color: #000;
            text-decoration: none;
        }

        ul.jqtree-tree .jqtree-toggler.jqtree-closed {
            background-position: 0 0;
        }

        ul.jqtree-tree .jqtree-toggler.jqtree-toggler-left {
            margin-right: 0.5em;
        }

        ul.jqtree-tree .jqtree-toggler.jqtree-toggler-right {
            margin-left: 0.5em;
        }

        ul.jqtree-tree .jqtree-element {
            cursor: pointer;
            position: relative;
            display: flex;
        }

        ul.jqtree-tree .jqtree-element:has(.jqtree-title-button-right) {
            display: block;
        }

        ul.jqtree-tree .jqtree-title {
            color: #1c4257;
            vertical-align: middle;
        }

        ul.jqtree-tree .jqtree-title-button-left {
            //margin-left: 1.5em;
        }

        ul.jqtree-tree .jqtree-title-button-left.jqtree-title-folder {
            margin-left: 0;
        }

        ul.jqtree-tree li.jqtree-folder {
            margin-bottom: 4px;
        }

        ul.jqtree-tree li.jqtree-folder.jqtree-closed {
            margin-bottom: 1px;
        }

        ul.jqtree-tree li.jqtree-ghost {
            position: relative;
            z-index: 10;
            margin-right: 10px;
        }

        ul.jqtree-tree li.jqtree-ghost span {
            display: block;
        }

        ul.jqtree-tree li.jqtree-ghost span.jqtree-circle {
            border: solid 2px #4D9D2A;
            border-radius: 100px;
            height: 8px;
            width: 8px;
            position: absolute;
            top: -4px;
            left: -6px;
            box-sizing: border-box;
        }

        ul.jqtree-tree li.jqtree-ghost span.jqtree-line {
            background-color: #4D9D2A;
            height: 2px;
            padding: 0;
            position: absolute;
            top: -1px;
            left: 2px;
            width: 100%;
        }

        .square.zero {
            background-color: red;
        }

        ul.jqtree-tree li.jqtree-ghost.jqtree-inside {
            margin-left: 48px;
        }

        ul.jqtree-tree span.jqtree-border {
            position: absolute;
            display: block;
            left: -2px;
            top: 0;
            border: solid 2px #4D9D2A;
            border-radius: 6px;
            margin: 0;
            box-sizing: content-box;
        }

        ul.jqtree-tree li.jqtree-selected > .jqtree-element,
        ul.jqtree-tree li.jqtree-selected > .jqtree-element:hover {
            background-color: #8bc34a; /* Màu xanh lá cây nhạt */
            background: linear-gradient(#a8e06e, #6aaf36); /* Gradient xanh lá cây */
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
            color: white
        }


        ul.jqtree-tree .jqtree-moving > .jqtree-element .jqtree-title {
            outline: dashed 1px #4D9D2A;
        }

        ul.jqtree-tree.jqtree-rtl {
            direction: rtl;
        }

        ul.jqtree-tree.jqtree-rtl ul.jqtree_common {
            margin-left: 0;
            margin-right: 12px;
        }

        ul.jqtree-tree.jqtree-rtl .jqtree-toggler {
            margin-left: 0.5em;
            margin-right: 0;
        }

        ul.jqtree-tree.jqtree-rtl .jqtree-title {
            margin-left: 0;
            margin-right: 1.5em;
        }

        ul.jqtree-tree.jqtree-rtl .jqtree-title.jqtree-title-folder {
            margin-right: 0;
        }

        ul.jqtree-tree.jqtree-rtl li.jqtree-ghost {
            margin-right: 0;
            margin-left: 10px;
        }

        ul.jqtree-tree.jqtree-rtl li.jqtree-ghost span.jqtree-circle {
            right: -6px;
        }

        ul.jqtree-tree.jqtree-rtl li.jqtree-ghost span.jqtree-line {
            right: 2px;
        }

        ul.jqtree-tree.jqtree-rtl li.jqtree-ghost.jqtree-inside {
            margin-left: 0;
            margin-right: 48px;
        }

        ul.jqtree-tree.jqtree-rtl span.jqtree-border {
            right: -2px;
        }

        span.jqtree-dragging {
            color: #fff;
            background: #000;
            opacity: 0.6;
            cursor: pointer;
            padding: 2px 8px;
        }

        .margin20 {
            margin: 0 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        th, td {
            padding: 12px;
            text-align: center;
            color: black;
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
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0;
            right: 0; bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .switch input:checked + .slider {
            background-color: #4CAF50;
        }

        .switch input:checked + .slider:before {
            transform: translateX(24px);
        }

        /* Rounded sliders */

        .slider.round {
            border-radius: 34px;
        }

        .slider.round:before {
            border-radius: 50%;
        }

        .square-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }

        .square {
            flex: 1;
            height: 40px;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            border: 1px solid black;
        }

        .square:not(:last-child) {
            border-right: none;
        }

        .square.active {
            background-color: #4D9D2A;
            color: white;
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
            cursor: pointer;
            border-radius: 4px;
            color: #666;
            border: 1px solid #ddd;
        }
        .pagination a.active {
            background-color: #4D9D2A;
            cursor: pointer;
            color: white;
            border: 1px solid #4D9D2A;
        }
        .pagination a:hover {
            background-color: #ddd;
        }
        .pagination a[disabled] {
            cursor: not-allowed;
            color: #ccc;
        }
        .pagination a.disabled {
            pointer-events: none; /* Vô hiệu hóa click */
            color: #ccc;           /* Màu xám */
            cursor: default;       /* Không hiển thị icon cấm */
            text-decoration: none;
        }
    `;
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    @state() foundItemLighColumn
    convertAttributesToPhaseArrayCabinet(attributes:any) {
        const result:any = [];

        const getOrCreatePhaseObj = (phase:any) => {
            let phaseObj = result.find((p:any) => p.phase === phase);
            if (!phaseObj) {
                phaseObj = { phase };
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

        return result.sort((a:any, b:any) => a.phase - b.phase);
    }
    formatNumber(value: any) {
        if (value == null || isNaN(value)) return '0';
        return value.toLocaleString('vi-VN');
    }
    buildTree(data) {
        const idToNodeMap = {};
        const tree = [];

        // Tạo node trước (chưa gắn children)
        data.forEach(item => {
            const node = {
                id: item.asset.id,
                label: item.asset.name,
                type: item.asset.type
            };
            idToNodeMap[item.asset.id] = node;
        });

        // Gắn vào tree hoặc làm children tùy theo điều kiện
        data.forEach(item => {
            const {id, name, parentId, type} = item.asset;
            const node = idToNodeMap[id];

            // Nếu có parentId và KHÔNG phải ElectricalCabinetAsset → là con
            if (parentId && type !== 'ElectricalCabinetAsset' && idToNodeMap[parentId]) {
                const parentNode = idToNodeMap[parentId];
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push(node);
            } else {
                // Là node độc lập
                tree.push(node);
            }
        });

        return tree;
    }

    private chart: Chart | null = null
    @state() dataClick: any = []

    updated(changedProperties) {
        super.updated(changedProperties);
        // Ví dụ: Nếu 'count' thay đổi, làm điều gì đó
        // if (changedProperties.has('nodeSelect')) {
        //     this.renderChart()
        //     this.renderChartLight()
        // }
        if (changedProperties.has('showCabinet') && this.showCabinet) {
            requestAnimationFrame(() => {
                const canvas = this.shadowRoot?.querySelector('#myChart');
                if (canvas) {
                    this.renderChart();
                } else {
                    console.warn('❌ Vẫn chưa thấy canvas trong DOM');
                }
            });
        }
        if (changedProperties.has('showLight') && this.showLight) {
            requestAnimationFrame(() => {
                const canvas = this.shadowRoot?.querySelector('#myChart');
                if (canvas) {
                    this.renderChartLight()
                } else {
                    console.warn('❌ Vẫn chưa thấy canvas trong DOM');
                }
            });
        }
        console.log('showCabinet', this.showCabinet)
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
    showStopNotification(message: string) {
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
        toast.style.background = 'red'; // màu success
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
    handleNodeMoved(movedNode, targetNode){
        let parentId = movedNode.parent.id ? movedNode.parent.id:this.infoTable.routeInfo.id
        let assetIds = movedNode.id
        const _assetChild = movedNode.children.map((item)=> item.id)
        console.log('assetsIdsAsset222',assetIds)
        console.log('assetsIdsParent',parentId)
        console.log('assetsIdsChild',_assetChild)
        manager.rest.api.AssetResource.updateParent(parentId, { assetIds : assetIds,childIds:_assetChild })
            .then((response) => {
                this.fetchTree()
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        console.log('aaaaa')

    }
@state() allTree :any = []
    findNearestFixedGroupAsset(tree, targetId) {
        function dfs(node, path = []) {
            const newPath = [...path, node];
            if (node.id === targetId) {
                return newPath;
            }
            if (node.children) {
                for (const child of node.children) {
                    const result = dfs(child, newPath);
                    if (result) return result;
                }
            }
            return null;
        }

        for (const root of tree) {
            const pathToTarget = dfs(root);
            if (pathToTarget) {
                // Duyệt ngược từ dưới lên để tìm node gần nhất có type FixedGroupAsset
                for (let i = pathToTarget.length - 2; i >= 0; i--) {
                    if (pathToTarget[i].type === 'FixedGroupAsset') {
                        return pathToTarget[i].id;
                    }
                }
            }
        }

        return null; // Không tìm thấy
    }
    findTopMostParentId(tree, targetId) {
        function containsTarget(node) {
            if (node.id === targetId) return true;
            if (!node.children) return false;
            return node.children.some(containsTarget);
        }

        for (const root of tree) {
            if (containsTarget(root)) {
                return root.id;
            }
        }

        return null;
    }
    @state() turnOnLightColumnAndLight
    @state() preSelectedNodeId
    @state() private preferredNodeId:any = JSON.parse(sessionStorage.getItem('assetIdChoose'))
    private findNodeById(nodes: any[], id: string): any | null {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = this.findNodeById(node.children, id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    async fetchTree() {
        this.showCabinet = false; // Tạm ẩn trước để đảm bảo re-render lại khi bật lên
        this.showLight = false;
        this.showColumn = false;
        this.showFixed = false
        console.log('realm',window.sessionStorage.getItem('realm'))
        console.log('this.infoTable.routeInfo.id',this.infoTable.routeInfo.id)
        manager.rest.api.AssetResource.queryTreeRoutes(this.preferredNodeId?.asset?.path?.[0]?this.preferredNodeId?.asset?.path?.[0]:this.infoTable.routeInfo.id, {realm : window.sessionStorage.getItem('realm')})
            .then((response) => {
                console.log('listtree',response.data)
                this.allTree = response.data
                const dataTreeApi = this.buildTree(response.data)
                console.log('dataTreeApi', dataTreeApi)
                 this.turnOnLightColumnAndLight = dataTreeApi
                const treeContainer = this.shadowRoot.querySelector('#tree');
                $(treeContainer).tree('destroy');
                $(treeContainer).tree({
                        data: dataTreeApi,
                        dragAndDrop: true,
                        autoOpen: true,
                        openFolderDelay: 100,
                        selectable: true,
                        onCreateLi: (node, $li) => {
                            const $title = $li.find('.jqtree-title');
                            let iconName = 'file-cabinet';
                            let color = 'black';
                            if (node.type === "ElectricalCabinetAsset") {
                                iconName = 'file-cabinet';
                                color = '#f3ce65';
                            } else if (node.type === 'LightAsset') {
                                iconName = 'lightbulb';
                                color = '#336666';
                            } else if (node.type === 'FixedGroupAsset') {
                                iconName = 'lightbulb-group';
                                color = '#e6688a';
                            } else if (node.type === 'LightGroupAsset') {
                                iconName = 'lightbulb-group-outline';
                                color = '#e6688a';
                            }
                            const iconElement = `<or-icon icon="${iconName}" style="color: ${color}; margin-right: 6px;"></or-icon>`;
                            $title.prepend(iconElement);
                            if (node.type === "ElectricalCabinetAsset") {
                                const $btn = $(
                                    `<or-icon icon="plus"></or-icon>`
                                );
                                // chút CSS tuỳ chỉnh
                                $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                // 3) Handler click: dừng sự kiện tree (không chọn node),
                                //    rồi show modal với dữ liệu từ `node`
                                $btn.on('click', e => {
                                    this.openDeleteDialog(node.id,node)
                                    e.stopPropagation();
                                });
                                $title.append($btn);
                            }
                            if (node.type === "LightGroupAsset") {
                                const $btn = $(
                                    `<or-icon icon="plus"></or-icon>`
                                );
                                // chút CSS tuỳ chỉnh
                                $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                // 3) Handler click: dừng sự kiện tree (không chọn node),
                                //    rồi show modal với dữ liệu từ `node`
                                $btn.on('click', e => {
                                    this.openDeleteDialog(node.id,node)
                                    e.stopPropagation();
                                });
                                $title.append($btn);
                            }
                            if (node.type === "FixedGroupAsset") {
                                const $btn = $(
                                    `<or-icon icon="plus"></or-icon>`
                                );
                                // chút CSS tuỳ chỉnh
                                $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                // 3) Handler click: dừng sự kiện tree (không chọn node),
                                //    rồi show modal với dữ liệu từ `node`
                                $btn.on('click', e => {
                                    this.openDeleteDialog(node.id,node)
                                    e.stopPropagation();
                                });
                                $title.append($btn);
                            }

                        }
                    }
                );
                $(treeContainer).on('tree.click', (event: any) => {
                    const node = event; // Lấy node từ sự kiện
                    console.log('event', event?.node)
                    this.onNodeClick(event.node)
                    if (!node) return;
                });
                $(treeContainer).on('tree.move', (event:any) => {
                    const movedNode = event.move_info.moved_node;
                    const targetNode = event.move_info.target_node;
                    if (
                        movedNode.type === 'LightAsset' &&
                        targetNode?.type === 'LightAsset'
                    ) {
                        this.showWarningNotification("Không được phép kéo đèn vào trong đèn")
                        return false;
                    }
                    if (movedNode.type === 'ElectricalCabinetAsset') {
                        this.showWarningNotification("Không được phép di chuyển tủ");
                        return false;
                    }
                    event.move_info.do_move();
                    const position = event.move_info.position; // 'before', 'after', or 'inside'
                    this.handleNodeMoved(movedNode, targetNode);
                    console.log('Node vừa được kéo:', movedNode.parent.id);
                    console.log('Được thả vào node:', targetNode);
                    console.log('Vị trí:', position);

                    // Ví dụ: gửi thông tin về server hoặc cập nhật state
                    // this.handleNodeMoved(movedNode, targetNode, position);

                    // Nếu bạn muốn chấp nhận việc di chuyển

                });
                console.log('preferredNodeId',this.preferredNodeId)
                // Nếu có id biết trước → ưu tiên chọn theo id
                setTimeout(() => {
                    const tree = $(treeContainer).tree('getTree') as any;
                    console.log('tree',tree)
                    let selectedNode = null;
                    if (this.preferredNodeId) {
                        console.log('Searching for node with ID:', this.findNodeById(tree.children || [], this.preferredNodeId?.asset?.id));
                        selectedNode = this.findNodeById(tree.children || [], this.preferredNodeId?.asset?.id)
                        if (selectedNode) {
                            console.log('Found preferred node:', selectedNode);
                        } else {
                            console.log('Preferred node not found, falling back to first node');
                        }
                    }
                    if (!selectedNode && tree.children && tree.children.length > 0) {
                        selectedNode = tree.children[0];
                        console.log('Selecting first node:', selectedNode);
                    }
                    console.log('selectNodeMout',selectedNode)
                    if (selectedNode) {
                        $(treeContainer).tree('selectNode', selectedNode);
                        $(treeContainer).tree('scrollToNode', selectedNode);
                        console.log('Calling onNodeClick for selected node:', selectedNode);
                        this.onNodeClick(selectedNode);
                    } else {
                        console.warn('No nodes found in tree after initialization');
                        this.showWarningNotification('Cây không có node để chọn');
                    }
                }, 200);
                console.log('ahuhu')
                console.log('getRealm', dataTreeApi)
            })
            .catch((error) => {

                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }

    @state() realmSelected
    @state() listMaTu = []
    @state() turnOnAll :any = []
    firstUpdated() {
        this.realmSelected = sessionStorage.getItem('realm')
        this.checkedList = this.checkedList = this.turnOnAll.map(() => 0);
        console.log('this.infoTable.routeInfo.id', this.infoTable.routeInfo.id)
       this.fetchTree()
        const formLayout = this.shadowRoot.querySelector('vaadin-form-layout');
        if (formLayout) {
            const style = document.createElement('style');
            style.textContent = `
        #layout {
         height:100%;
         align-items:unset;
         justify-content:space-between
        }
        #layout ::slotted(*){
        margin:0px
        }
      `;
            // Thêm style vào shadowRoot của vaadin-form-layout
            formLayout?.shadowRoot?.appendChild(style);
        }
        // Khởi tạo jqTree vào một phần tử DOM (có thể là div hoặc bất kỳ thẻ nào)
    }

    @state() dataPhase = []
    @state() dataTableLightGroup = []
    @state() nodeSelect

    formatDateArray(timestamps, separator = '/') {
        return timestamps.map(ts => {
            const date = new Date(ts);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
            const year = date.getFullYear();
            return `${day}${separator}${month}${separator}${year}`;
        });
    }
    formatTimeArray(timestamps) {
        if (!Array.isArray(timestamps)) return [];

        return timestamps.map(ts => {
            const date = new Date(ts);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        });
    }

    @state() currentPage :any =1
    @state() totalPage :any =1
    @state() codeColumn
    @state() listDKT = []
    @state() thongsokythuat
    @state() columnAndLightTurnOn
    @state() parentTu
    @state() listLocationLightGroup
     getMaxTimestampFormatted(data: any[]): string | null {
        let maxTimestamp = 0;

        data.forEach(obj => {
            const attributes = obj.attributes;

            if (typeof attributes === 'object' && attributes !== null) {
                Object.values(attributes).forEach(attr => {
                    if (
                        typeof attr === 'object' &&
                        attr !== null &&
                        'timestamp' in attr &&
                        typeof attr.timestamp === 'number'
                    ) {
                        if (attr.timestamp > maxTimestamp) {
                            maxTimestamp = attr.timestamp;
                        }
                    }
                });
            }
        });

        if (maxTimestamp === 0) return null;

        // Format timestamp thành chuỗi yyyy-mm-dd HH:MM:ss
        const date = new Date(maxTimestamp);
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const HH = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
    }
@state() lastTimeColumn

    onNodeClick(node) {
        console.log('nodeClick', node)
        const filteredAsset =  this.allTree.find(item => item.asset.id === node.parent.id);
        this.codeColumn = filteredAsset
        console.log('filteredAsset',filteredAsset)
        manager.rest.api.ScheduleInfoResource.getSchedulesByAssetId(node.id,{page:this.currentPage,size:5})
            .then((response) => {
                this.listDataKBADForCabinet = response.data
                console.log('response.data',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.ScheduleInfoResource.countByAssetId({assetId:node.id})
            .then((response) => {
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.nodeSelect = node
        const tree = $('#tree');
        const nodeName = node.label; // Lấy tên node
        console.log('aca', {
            "type": "lttb",
            "fromTime": "2025-04-10T00:00:00",
            "toTime": "2025-04-12T00:00:00",
            "amountOfPoints": 5
        })

        console.log('foundItem',this.allTree);

        if (node.type.includes("Electrical")) {
            this.showCabinet = false; // Tạm ẩn trước để đảm bảo re-render lại khi bật lên
            this.showLight = false;
            this.showColumn = false;
            this.showFixed = false
            manager.rest.api.AssetResource.getAsset(node.id)
                .then((response) => {
                    this.dataClick = response.data;
                    this.lastTimective = this.getLatestTimestampItem(response?.data?.[0].asset.attributes)
                    console.log('response?.data?.[0].asset.attributes',this.getLatestTimestampItem(response?.data?.[0].asset.attributes))
                    console.log('this.dataClick',this.dataClick)
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(node.id)
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            const enrichedList = enrichStatusList(this.dataClick?.[0].asset?.attributes ? this.dataClick?.[0].asset : {}, response.data);
                            this.listDKT = enrichedList
                            const allValueIsOne = enrichedList.every(item => item.value === 1);
                            const allValueIsZero = enrichedList.every(item => item.value === 0);
                            console.log('enrichedList',enrichedList)
                            if(this.dataClick?.[0].assetInfo?.statusAI !== "A"){
                                this.checked = false
                                // const listValue = enrichedList
                                // listValue.forEach(item => {
                                //     item.value = 0;
                                // });
                                // this.listDKT = listValue
                                // console.log(' this.listDKT', this.listDKT)
                            }
                            if(this.dataClick?.[0].assetInfo?.statusAI === "A" && allValueIsOne){
                                this.checked = true
                                // const listValue = enrichedList
                                //
                                // listValue.forEach(item => {
                                //     item.value = 1;
                                // });
                                // this.listDKT = listValue
                            }
                            if(this.dataClick?.[0].assetInfo?.statusAI === "A" && allValueIsZero){
                                this.checked = false;
                               // const listValue = enrichedList
                               //
                               //  listValue.forEach(item => {
                               //      item.value = 0;
                               //  });
                               //  this.listDKT = listValue
                            }
                            // if (allValueIsOne) {
                            //     this.checked = true;
                            //     this.listDKT.forEach(item => {
                            //         item.value = 1;
                            //     });
                            // } else if (allValueIsZero) {
                            //     this.checked = false;
                            //     this.listDKT.forEach(item => {
                            //         item.value = 0;
                            //     });
                            // }
                            console.log('responselistDKT',enrichedList)
                            console.log('responselistDKT2',this.dataClick[0])
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    const arrayTable = this.convertAttributesToPhaseArrayCabinet(response.data[0].asset.attributes);
                    console.log('arrayTable',arrayTable)
                    this.dataPhase = arrayTable;
                    this.value = response.data[0].asset.attributes.brightness.value;
                    console.log('getDataTu', response.data);
                    const translateLabel = (label) => {
                        if (label.includes("voltagePhase1")) return "Pha 1";
                        if (label.includes("voltagePhase2")) return "Pha 2";
                        if (label.includes("voltagePhase3")) return "Pha 3";
                        return label; // giữ nguyên nếu không khớp
                    };
                    manager.rest.api.AssetDatapointResource.getAssetDatapoints(node.id)
                        .then((response) => {
                            console.log('response',response)
                            const distinctColors = ['#FF6384', '#36A2EB', '#FFCE56'];
                            const formattedData = response.data.datasets.map((item, index) => ({
                                label: translateLabel(item.label),
                                data: item.data,
                                borderColor: distinctColors[index % distinctColors.length],
                            }));
                            const fakeDataChart1 = {
                                labels: this.formatTimeArray(response.data.labels),
                                datasets: formattedData
                            };
                            this.chartSave.data.labels = fakeDataChart1.labels;
                            this.chartSave.data.datasets = fakeDataChart1.datasets;
                            this.chartSave.update()
                            console.log('abc2', formattedData)
                            console.log('abc', fakeDataChart1)
                            console.log('responseDataPoint', response.data)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    this.showCabinet = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            console.log('node.id',typeof node.id)
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }


            console.log('ahihi',this.formatTimeArray(1676448023))
            // manager.rest.api.CabinetGroupResource.getAll(node.id)
            //     .then((response) => {
            //         console.log('CabinetGroupResource',response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });

        } else if (node.type.includes("LightAsset")) {
            this.showLight = false;
            this.showCabinet = false;
            this.showColumn = false
            this.showFixed = false
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
            console.log('this.turnOnLightColumnAndLight',node.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                .then((response:any) => {
                    const abc = response.data
                    console.log('response.data',response.data)
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            console.log('abc',abc)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id));
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            console.log('parentTu2',this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(node.id)
                .then((response) => {
                    this.dataClick = response.data;
                    this.lastTimective = this.getLatestTimestampItem(response?.data?.[0].asset.attributes)
                    console.log(' this.dataClick ', this.dataClick )
                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data?.[0].asset?.attributes?.brightness?.value;
                    console.log('getDataTu', response.data);
                    manager.rest.api.AssetDatapointResource.getAssetDatapoints(node.id)
                        .then((response) => {
                            console.log('response',response.data)
                            const distinctColors = ['#FF6384', '#36A2EB', '#FFCE56'];
                            const translateLabel = (label) => {
                                if (label.includes("amperage")) return "Cường độ dòng điện";
                                return label; // giữ nguyên nếu không khớp
                            };
                            const formattedData = response.data.datasets.map((item, index) => {
                                const newData = item?.data?.map(num => num / 1000);
                                return {
                                    label: translateLabel(item.label),
                                    data: newData,
                                    borderColor: distinctColors[index % distinctColors.length],
                                };
                            });
                            console.log('formattedData',formattedData)
                            const fakeDataChart1 = {
                                labels: this.formatTimeArray(response?.data?.labels),
                                datasets: formattedData
                            };
                            this.chartSave.data.labels = fakeDataChart1.labels;
                            this.chartSave.data.datasets = fakeDataChart1.datasets;
                            this.chartSave.options = {
                                plugins: {
                                    datalabels: {
                                        display: false // <<< Chặn vẽ số trên biểu đồ
                                    },
                                    title: {
                                        display: true,
                                        text: 'Biểu đồ biến thiên dòng điện trong ngày'
                                    },
                                    legend: {
                                        position: 'bottom',
                                    },
                                    // annotation: {
                                    //     annotations: {
                                    //         horizontalLine: {
                                    //             type: 'line',
                                    //             yMin: response.data.y0 === "null" ? 0 : response.data.y0,
                                    //             yMax: response.data.y0 === "null" ? 0 : response.data.y0,
                                    //             borderColor: 'black',
                                    //             borderWidth: 2,
                                    //         }
                                    //     }
                                    // }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Thời gian', // Nhãn trục X
                                            font: {
                                                size: 10,
                                                weight: 'bold'
                                            },
                                            color: '#333'
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Dòng điện(A)', // Nhãn trục Y
                                            font: {
                                                size: 10,
                                                weight: 'bold'
                                            },
                                            color: '#333'
                                        },
                                        min:0
                                    }
                                },
                            };
                            this.chartSave.update()
                            console.log('abc2', formattedData)
                            console.log('abc', fakeDataChart1)
                            console.log('responseDataPoint', response.data)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    this.showLight = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.AssetResource.getInfoLightAsset(node.id)
                .then((response) => {
                    this.thongsokythuat = response.data
                    console.log('getInfoLightAsset',response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        } else if (node.type.includes("LightGroupAsset")) {
            this.showLight = false;
            this.showCabinet = false;
            this.showColumn = false
            this.showFixed = false
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
            console.log('this.turnOnLightColumnAndLight',node.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                .then((response:any) => {
                    const abc = response.data
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id));
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            // console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(node.id)
                .then((response) => {
                    this.dataClick = response.data;


                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data?.[0].asset?.attributes?.brightness?.value;
                    const filteredData2 = this.processAssets(response.data).filter(item => item.id !== node.id);
                    const filteredData3 = response.data.filter(item => item.asset.id !== node.id);
                    this.listLocationLightGroup = filteredData3
                    console.log('getDataTu', this.extractWattageAmperageVoltage(response.data));
                    this.dataTableLightGroup = filteredData2
                    console.log('getDataTu2', response.data);
                    console.log('getDataTu3', filteredData2);
                    this.lastTimeColumn = this.getMaxTimestampFormatted(filteredData2)
                    console.log('abc',this.getMaxTimestampFormatted(filteredData2))
                    console.log('filteredData3',filteredData3)
                    this.showColumn = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }else if (node.type.includes("FixedGroupAsset")) {
            this.showLight = false;
            this.showCabinet = false;
            this.showColumn = false
            this.showFixed = false
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
            console.log('this.turnOnLightColumnAndLight',node.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                .then((response:any) => {
                    const abc = response.data
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,node.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === node.id);
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            // console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(node.id)
                .then((response) => {
                    this.dataClick = response.data;
                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data?.[0].asset?.attributes?.brightness?.value;
                    const filteredData2 = this.processAssets(response.data).filter(item => item.id !== node.id);
                    console.log('getDataTu', this.extractWattageAmperageVoltage(response.data));
                    this.dataTableLightGroup = filteredData2
                    console.log('getDataTu2', response.data);
                    this.lastTimeColumn = this.getMaxTimestampFormatted(filteredData2)
                    console.log('getDataTu3', filteredData2);
                    console.log('2', response.data);
                    this.showFixed = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        // if (node.children && node.children.length > 0) {
        //     if (nodeName === 'Tủ 1') {
        //         // Chỉ chọn node cha, bỏ chọn tất cả node con
        //         tree.tree('selectNode', node);
        //         node.children.forEach(child => {
        //             const childNode = tree.tree('getNodeById', child.id);
        //             if (childNode) {
        //                 tree.tree('removeFromSelection', childNode);
        //             }
        //         });
        //     } else if (nodeName === 'Tủ 2') {
        //         // Chọn cả node cha và các node con
        //         tree.tree('selectNode', node);
        //         node.children.forEach(child => {
        //             const childNode = tree.tree('getNodeById', child.id);
        //             if (childNode) {
        //                 tree.tree('selectNode', childNode);
        //             }
        //         });
        //     }
        // } else {
        //     // Nếu là node con, chọn bình thường
        //     tree.tree('selectNode', node);
        // }
    }

    selectSquare(event) {
        this.value = Number(event.target.textContent);
        this.requestUpdate();
    }

    @state() items = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            email2: 'Active',
            email3: 'Admin',
            email45: '2024-03-14',
            email6: 'Edit'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            email2: 'Inactive',
            email3: 'User',
            email45: '2024-03-13',
            email6: 'Edit'
        }
    ];

    navigateToDashboard() {
        window.location.hash = '/routes';
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
    formatDateNoTime(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year}`;
    }

    @state() opened = false
    public config?: PageMapConfig;

    convertAttributesToPhaseArray(attributes) {
        const result = [];
        if (!attributes || typeof attributes !== 'object') return result;
        Object.keys(attributes).forEach(key => {
            const matchVolt = key.match(/^voltagePhase(\d+)$/);
            const matchKwh = key.match(/^wattageActualPhase(\d+)$/);
            const matchAmp = key.match(/^amperagePhase(\d+)$/);

            if (matchVolt) {
                const phase = Number(matchVolt[1]);
                let phaseObj = result.find(p => p.phase === phase);
                if (!phaseObj) {
                    phaseObj = {phase};
                    result.push(phaseObj);
                }
                phaseObj.volt = attributes[key].value;
            }

            if (matchKwh) {
                const phase = Number(matchKwh[1]);
                let phaseObj = result.find(p => p.phase === phase);
                if (!phaseObj) {
                    phaseObj = {phase};
                    result.push(phaseObj);
                }
                phaseObj.kwh = attributes[key].value;
            }

            if (matchAmp) {
                const phase = Number(matchAmp[1]);
                let phaseObj = result.find(p => p.phase === phase);
                if (!phaseObj) {
                    phaseObj = {phase};
                    result.push(phaseObj);
                }
                phaseObj.amp = attributes[key].value;
            }
        });

        return result.sort((a, b) => a.phase - b.phase);
    }

    extractWattageAmperageVoltage(data) {
        return data.map(item => {
            const attributes = item.asset?.attributes || {};

            return {
                id: item.asset?.id ?? null,
                name: item.asset?.name ?? null,
                wattage: attributes.wattage?.value ?? null,
                amperage: attributes.amperage?.value ?? null,
                voltage: attributes.voltage?.value ?? null
            };
        });
    }

     processAssets(rawData) {
        return rawData.map(item => {
            const { asset, assetInfo = {} } = item;
            const { id, name, attributes = {} } = asset;
            const { assetCode = null, statusAI = null } = assetInfo;

            return {
                id,
                name,
                // Giữ nguyên toàn bộ object attributes
                attributes,
                // Lấy thêm assetCode và statusAI
                assetCode,
                statusAI
            };
        });
    }
    getAssetTypeLabel(type){
        switch (type) {
            case 'LightAsset':
                return 'Đèn';
            case 'ElectricalCabinetAsset':
                return 'Tủ';
            case 'FixedGroupAsset':
                return 'Nhóm cố định';
            case 'LightGroupAsset':
                return 'Nhóm linh hoạt';
            default:
                return 'Không xác định';
        }
    }

    handleSaveAttribute() {
        const obj = new Number(this.value);
        const kj = {
            assetId: this.dataClick[0].asset?.id,
            value: obj
        }
        console.log('kj', kj)
        console.log('aa',this.foundItemLighColumn)
        console.log('aa2',this.parentTu)
        if(this.dataClick[0].asset.type === "ElectricalCabinetAsset" && this.dataClick[0].assetInfo?.statusAI === 'D') {
            this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng do mất kết nối`)
            return false
        }
        if(this.dataClick[0].asset.type !== "ElectricalCabinetAsset" && this.parentTu?.[0].assetInfo?.statusAI === 'D') {
            this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng do tủ mất kết nối`)
            return false
        }
        if(this.foundItemLighColumn?.value === 0 && this.dataClick[0].asset.type !== "ElectricalCabinetAsset" && this.parentTu?.[0].assetInfo?.statusAI !== "A") {
                this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng do khởi của tủ đang tắt`)
                return false
        }
        if(this.foundItemLighColumn?.value === 0 && this.dataClick[0].asset.type !== "ElectricalCabinetAsset" && this.parentTu?.[0].assetInfo?.statusAI === "A") {
            this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng do khởi của tủ đang tắt`)
            return false
        }
        if(this.parentTu?.[0].assetInfo?.statusAI !== "A" && this.dataClick[0].asset.type !== "ElectricalCabinetAsset") {
            this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng do khởi của tủ đang tắt`)
            return false
        }
            if(this.dataClick[0].assetInfo?.statusAI === 'M' && this.dataClick[0].asset.type === "ElectricalCabinetAsset"){
                this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} bảo trì không thể điều khiển đèn`)
                return false
            }
            if(this.dataClick[0].assetInfo?.statusAI === 'P' && this.dataClick[0].asset.type === "ElectricalCabinetAsset"){
                this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} dừng hoạt động không thể điều khiển đèn`)
                return false
            }
            if(this.dataClick[0].assetInfo?.statusAI === "" && this.dataClick[0].asset.type === "ElectricalCabinetAsset"){
                this.showWarningNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng `)
                return false
            }

        // if(this.columnAndLightTurnOn?.assetInfo?.statusAI === 'M'){
        //     this.showCustomNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} do tủ bảo trì không thể điều khiển đèn`)
        //     return false
        // }
        // if(this.columnAndLightTurnOn?.assetInfo?.statusAI === 'P'){
        //     this.showCustomNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} do tủ dừng hoạt động không thể điều khiển đèn`)
        //     return false
        // }
        // if(this.columnAndLightTurnOn?.assetInfo?.statusAI === ""){
        //     this.showCustomNotification(`${this.getAssetTypeLabel(this.dataClick[0].asset.type)} không chỉnh được độ sáng `)
        //     return false
        // }
        console.log('foundItemLighColumn',this.foundItemLighColumn)
        console.log('this.listDKT?.every(item => item.value === 0)?true:false',this.listDKT?.every(item => item.value === 0))
        console.log('this.listDKT?.every(item => item.value === 0)?true:false',this.listDKT)

        if(this.listDKT?.every(item => item.value === 0) && this.dataClick[0].asset?.type === "ElectricalCabinetAsset"){
            this.showWarningNotification(`Toàn bộ khởi đang tắt không điều khiển được đèn`)
            return false
        }
        if(this.dataClick[0].asset.type === "LightAsset" && this.dataClick[0].assetInfo?.statusAI === 'D') {
            this.showWarningNotification(`Đèn đang mất kết nối`)
            return false
        }
            manager.rest.api.AssetResource.writeAttributeValue(this.dataClick[0].asset?.id, "brightness", obj)
                .then((response) => {
                    const notification = this.shadowRoot!.getElementById('myNotification') as any;

                    notification.renderer = (root: HTMLElement) => {
                        root.innerHTML = ''; // Xóa nội dung cũ
                        const text = document.createElement('div');
                        text.textContent = 'Chỉnh độ sáng thành công!';
                        root.appendChild(text);
                    };
                    notification.open();
                    console.log('getRealm23333', response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

    }

    @state() chartSave = null

    renderChart() {
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", {willReadFrequently: true});
        if (!ctx) return;
        if (this.chartSave) {
            this.chartSave.destroy();
        }
        this.chartSave = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
                datasets: [{
                    label: 'Điện áp pha 1',
                    data: [100, 200, 150, 300],
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                    {
                        label: 'Điện áp pha 2',
                        data: [120, 100, 110, 600],
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian', // Nhãn trục X
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Điện áp(U)', // Nhãn trục Y
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    }
                },
                responsive: true,
                plugins: {
                    datalabels: {
                        display: false // <<< Chặn vẽ số trên biểu đồ
                    },
                    legend: {
                        position: this.showLight ? 'top' : 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ điện áp hiện tại'
                    },
                }
            }
        });

    }

    renderChartLight() {
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", {willReadFrequently: true});
        if (!ctx) return;
        if (this.chartSave) {
            this.chartSave.destroy();
        }
        this.chartSave = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
                datasets: [{
                    label: 'amperage',
                    data: [100, 200, 150, 300],
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian', // Nhãn trục X
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Dòng điện(A)', // Nhãn trục Y
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    }
                },
                responsive: true,
                plugins: {
                    datalabels: {
                        display: false // <<< Chặn vẽ số trên biểu đồ
                    },
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ biến thiên dòng điện trong ngày'
                    },
                    // annotation: {
                    //     annotations: {
                    //         horizontalLine: {
                    //             type: 'line',
                    //             yMin: 200,  // vị trí trục Y mà đường nằm ngang sẽ nằm
                    //             yMax: 200,
                    //             borderColor: 'black',
                    //             borderWidth: 2,
                    //         }
                    //     }
                    // }
                }
            }
        });

    }
    @state() private isDeleteDialogOpen = false;
    @state() private isDeleteDialogOpenReal = false;
    @state() dataPushTree:any
    handleOpenedChanged(e: CustomEvent) {
        const foundItem:any = this.allTree.find(item => item.asset.id === this.selectIdNode);
        this.dataPushTree = foundItem
        console.log('ads',foundItem)
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
    handleOpenedChangedDelete(e: CustomEvent) {
        const foundItem:any = this.allTree.find(item => item.asset.id === this.selectIdNode);
        this.dataPushTree = foundItem
        console.log('ads',foundItem)
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
            this.isDeleteDialogOpenReal = false;
        }
    }
    handleOpenedChangedCabinet(e: CustomEvent) {
        const foundItem:any = this.allTree.find(item => item.asset.id === this.selectIdNode);
        this.dataPushTree = foundItem
        console.log('ads',foundItem)
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
            this.isDialogCabinet = false;
        }
    }
    handleOpenedChangedLampType(e: CustomEvent) {
        const foundItem:any = this.allTree.find(item => item.asset.id === this.selectIdNode);
        this.dataPushTree = foundItem
        console.log('ads',foundItem)
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
            this.isDialogCabinetLampType = false;
        }
    }
    cancelDelete() {
        this.isDeleteDialogOpen = false;

    }
    cancelDeleteReal() {
        this.isDeleteDialogOpenReal = false;

    }
    confirmDeleteReal() {
        this.deleteTree()
        this.isDeleteDialogOpenReal = false
    }
    confirmDelete() {
        const filter = this.allTree.filter((item)=> item.asset.id === this.selectIdNode)
        console.log('filter',filter)
        console.log('this.dataPushTree2',this.selectIdNode)
        console.log('this.dataPushTree',this.checkNode4)
        const typeMap = {
            ElectricalCabinetAsset: 'FixedGroupAsset',
            FixedGroupAsset: 'LightGroupAsset',
            LightGroupAsset: 'LightGroupAsset',
        };

        const newType = typeMap[this.checkNode4.type] || this.checkNode4.type;
        console.log('newType',newType)

        const clonedData = JSON.parse(JSON.stringify(this.dataPushTree));

        clonedData.assetInfo.assetCode = this.checkNode4.type === "ElectricalCabinetAsset" ? filter?.[0].assetInfo.assetCode : this.tenNhomLightAndColumn;
        clonedData.asset.name = this.tenNhom;
        clonedData.asset.id = undefined;
        clonedData.asset.parentId = this.selectIdNode;
        clonedData.assetInfo.id = undefined;
        clonedData.asset.type = newType;

        const filtered : any = {
            ...clonedData,
            asset: {
                ...clonedData.asset,
                attributes: {
                    location: clonedData.asset.attributes.location,
                    brightness: clonedData.asset.attributes.brightness
                }
            },
            cabinetGroup:this.maNhom,
            cabinetId:this.selectIdNode
        };
        console.log('dataPushTreeCreate',filtered)
        const _assetChild = this.checkNode4.children.map((item)=> item.type)
        console.log('_assetChild',_assetChild)
        const fixedGroupCount = _assetChild.filter(type => type === "FixedGroupAsset").length;
        console.log('fixedGroupCount',fixedGroupCount)
        // if (clonedData.asset.type === "FixedGroupAsset" && fixedGroupCount > 3 ) {
        //     console.log('Chặn lại vì có >= 4 phần tử đều là FixedGroupAsset');
        //     this.showCustomNotification("Tủ chỉ được tối đa 4 nhóm cố định")
        //     return false
        // }

        console.log('_assetChild222',_assetChild)
        if(this.checkNode4.type === "ElectricalCabinetAsset"){
            manager.rest.api.AssetResource.createGroupCabinet(filtered)
                .then((response) => {
                    console.log('response.data',response.data)
                    const merged = [...this.allTree, JSON.parse(JSON.stringify(response.data))];
                    console.log('dataTreeApi2', merged)
                    console.log(this.dataPushTree === merged[merged.length - 1]); // nếu là true thì bị dính reference
                    const dataTreeApi = this.buildTree(merged)
                    this.allTree = merged;
                    console.log('dataTreeApi', dataTreeApi)
                    const treeContainer = this.shadowRoot.querySelector('#tree');
                    $(treeContainer).tree('destroy');
                    $(treeContainer).tree({
                            data: dataTreeApi,
                            dragAndDrop: true,
                            autoOpen: true,

                            selectable: true,
                            onCreateLi: (node, $li) => {
                                const $title = $li.find('.jqtree-title');
                                let iconName = 'file-cabinet';
                                let color = 'black';
                                if (node.type === "ElectricalCabinetAsset") {
                                    iconName = 'file-cabinet';
                                    color = '#f3ce65';
                                } else if (node.type === 'LightAsset') {
                                    iconName = 'lightbulb';
                                    color = '#336666';
                                } else if (node.type === 'FixedGroupAsset') {
                                    iconName = 'lightbulb-group';
                                    color = '#e6688a';
                                } else if (node.type === 'LightGroupAsset') {
                                    iconName = 'lightbulb-group-outline';
                                    color = '#e6688a';
                                }
                                const iconElement = `<or-icon icon="${iconName}" style="color: ${color}; margin-right: 6px;"></or-icon>`;
                                $title.prepend(iconElement);
                                if (node.type === "ElectricalCabinetAsset") {
                                    const $btn = $(
                                        `<or-icon icon="plus"></or-icon>`
                                    );
                                    // chút CSS tuỳ chỉnh
                                    $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                    // 3) Handler click: dừng sự kiện tree (không chọn node),
                                    //    rồi show modal với dữ liệu từ `node`
                                    $btn.on('click', e => {
                                        this.openDeleteDialog(node.id,node)
                                        e.stopPropagation();
                                    });
                                    $title.append($btn);
                                }
                                if (node.type === "LightGroupAsset") {
                                    const $btn = $(
                                        `<or-icon icon="plus"></or-icon>`
                                    );
                                    // chút CSS tuỳ chỉnh
                                    $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                    // 3) Handler click: dừng sự kiện tree (không chọn node),
                                    //    rồi show modal với dữ liệu từ `node`
                                    $btn.on('click', e => {
                                        this.openDeleteDialog(node.id,node)
                                        e.stopPropagation();
                                    });
                                    $title.append($btn);
                                }
                                if (node.type === "FixedGroupAsset") {
                                    const $btn = $(
                                        `<or-icon icon="plus"></or-icon>`
                                    );
                                    // chút CSS tuỳ chỉnh
                                    $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                    // 3) Handler click: dừng sự kiện tree (không chọn node),
                                    //    rồi show modal với dữ liệu từ `node`
                                    $btn.on('click', e => {
                                        this.openDeleteDialog(node.id,node)
                                        e.stopPropagation();
                                    });
                                    $title.append($btn);
                                }

                            }
                        }
                    );
                    $(treeContainer).on('tree.click', (event: any) => {
                        const node = event; // Lấy node từ sự kiện
                        console.log('event', event?.node)
                        this.onNodeClick(event.node)
                        if (!node) return;
                    });
                    setTimeout(() => {
                        const treeInstance = ($(treeContainer) as any).tree('getTree');
                        const defaultNode = treeInstance.getNodeById(1);
                        if (defaultNode) {
                            $(treeContainer).tree('selectNode', defaultNode);
                            this.showCabinet = true;
                            this.showLight = false;
                        }
                    }, 100);
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }else{
            manager.rest.api.AssetResource.create(filtered)
                .then((response:any) => {
                    if(response.data?.errorMessage){
                        this.showStopNotification(response.data?.errorMessage)
                    }else{
                        console.log('response.data',response)
                        const merged = [...this.allTree, JSON.parse(JSON.stringify(response.data))];
                        console.log('dataTreeApi2', merged)
                        console.log(this.dataPushTree === merged[merged.length - 1]); // nếu là true thì bị dính reference
                        const dataTreeApi = this.buildTree(merged)
                        this.allTree = merged;
                        console.log('dataTreeApi', dataTreeApi)
                        const treeContainer = this.shadowRoot.querySelector('#tree');
                        $(treeContainer).tree('destroy');
                        $(treeContainer).tree({
                                data: dataTreeApi,
                                dragAndDrop: true,
                                autoOpen: true,

                                selectable: true,
                                onCreateLi: (node, $li) => {
                                    const $title = $li.find('.jqtree-title');
                                    let iconName = 'file-cabinet';
                                    let color = 'black';
                                    if (node.type === "ElectricalCabinetAsset") {
                                        iconName = 'file-cabinet';
                                        color = '#f3ce65';
                                    } else if (node.type === 'LightAsset') {
                                        iconName = 'lightbulb';
                                        color = '#336666';
                                    } else if (node.type === 'FixedGroupAsset') {
                                        iconName = 'lightbulb-group';
                                        color = '#e6688a';
                                    } else if (node.type === 'LightGroupAsset') {
                                        iconName = 'lightbulb-group-outline';
                                        color = '#e6688a';
                                    }
                                    const iconElement = `<or-icon icon="${iconName}" style="color: ${color}; margin-right: 6px;"></or-icon>`;
                                    $title.prepend(iconElement);
                                    if (node.type === "ElectricalCabinetAsset") {
                                        const $btn = $(
                                            `<or-icon icon="plus"></or-icon>`
                                        );
                                        // chút CSS tuỳ chỉnh
                                        $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                        // 3) Handler click: dừng sự kiện tree (không chọn node),
                                        //    rồi show modal với dữ liệu từ `node`
                                        $btn.on('click', e => {
                                            this.openDeleteDialog(node.id,node)
                                            e.stopPropagation();
                                        });
                                        $title.append($btn);
                                    }
                                    if (node.type === "LightGroupAsset") {
                                        const $btn = $(
                                            `<or-icon icon="plus"></or-icon>`
                                        );
                                        // chút CSS tuỳ chỉnh
                                        $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                        // 3) Handler click: dừng sự kiện tree (không chọn node),
                                        //    rồi show modal với dữ liệu từ `node`
                                        $btn.on('click', e => {
                                            this.openDeleteDialog(node.id,node)
                                            e.stopPropagation();
                                        });
                                        $title.append($btn);
                                    }
                                    if (node.type === "FixedGroupAsset") {
                                        const $btn = $(
                                            `<or-icon icon="plus"></or-icon>`
                                        );
                                        // chút CSS tuỳ chỉnh
                                        $btn.css({'position':'absolute','right':'8px','top':'0px', 'line-height': '1', 'padding': '0 6px'});

                                        // 3) Handler click: dừng sự kiện tree (không chọn node),
                                        //    rồi show modal với dữ liệu từ `node`
                                        $btn.on('click', e => {
                                            this.openDeleteDialog(node.id,node)
                                            e.stopPropagation();
                                        });
                                        $title.append($btn);
                                    }

                                }
                            }
                        );
                        $(treeContainer).on('tree.click', (event: any) => {
                            const node = event; // Lấy node từ sự kiện
                            console.log('event', event?.node)
                            this.onNodeClick(event.node)
                            if (!node) return;
                        });
                        setTimeout(() => {
                            const treeInstance = ($(treeContainer) as any).tree('getTree');
                            const defaultNode = treeInstance.getNodeById(1);
                            if (defaultNode) {
                                $(treeContainer).tree('selectNode', defaultNode);
                                this.showCabinet = true;
                                this.showLight = false;
                            }
                        }, 100);
                    }

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }

        this.isDeleteDialogOpen = false;

    }
    @state() selectIdNode
    @state() checkNode4
    openDeleteDialog(user,node) {
        this.maNhom  =undefined
        this.tenNhom = undefined
        this.tenNhomLightAndColumn  =undefined
        console.log('user',user)
        this.isDeleteDialogOpen = true;
        this.selectIdNode = user
        this.checkNode4 = node
        console.log('checkNode4',this.checkNode4)
        manager.rest.api.CabinetGroupResource.getAll(node.id)
            .then((response) => {
                this.listMaTu = response.data
                console.log('matu',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        // reset dataPushTree
    }
    @state() maNhom
    @state() tenNhom
    handleMaNhom(event){
        console.log('event',event.detail.value)
        this.maNhom = event.detail.value
    }
    handleTenNhom(event){
        this.tenNhom = event.target.value
    }
    @state() tenNhomLightAndColumn
    handleMaNhomLightAndColumn(event){
        this.tenNhomLightAndColumn = event.target.value
    }
    @state() selectedGroup = "economy"
    @state() GroupLight
    handleGroupChange(e) {
        this.selectedGroup = e.detail.value;
        if(e.detail.value === "economy"){
            this.GroupLight = "FixedGroupAsset"
        }
        if(e.detail.value === "business"){
            this.GroupLight = "LightGroupAsset"
        }
        console.log('Giá trị được chọn:', this.selectedGroup);
    }
    // handleGroupChange(e) {
    //     this.selectedGroup = e.detail.value;
    //     console.log('Giá trị được chọn:', this.selectedGroup);
    // }
    @state() listDataKBADForCabinet = []
    @state() listDataKBADForLight = []
     getAllIdsFromObject(node) {
        let result = [node.id]; // lấy id hiện tại

        if (Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach(child => {
                result = result.concat(this.getAllIdsFromObject(child)); // đệ quy vào children
            });
        }

        return result;
    }
    deleteTree(){
        this.getAllIdsFromObject(this.nodeSelect)
        console.log('nodeSelect',this.nodeSelect)
        console.log('nodeSelect2',this.getAllIdsFromObject(this.nodeSelect))
        manager.rest.api.AssetResource.delete({
            assetId: this.getAllIdsFromObject(this.nodeSelect)
        }, {
            paramsSerializer: params => Qs.stringify(params, {arrayFormat: 'repeat'})
        }).then((response) => {
            this.nodeSelect = null;
            this.fetchTree()
            setTimeout(() => {
                this.fetchTree(); // gọi lại sau một chút
            }, 300); // thử 300-500ms
        }).catch((reason) => {

        });
    }
    @state() private isDialogCabinet = false;
    @state() dataKB : any
    openDialogCabinet(user) {
        manager.rest.api.ScheduleInfoResource.getDetail(user.id)
            .then((response) => {
                this.dataKB = response.data
                console.log('respon1',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });

        console.log('user',user)
        this.isDialogCabinet = true;
        this.dataKB = user
    }
    @state() dataLampType
    @state() isDialogCabinetLampType = false
    openDialogCabinetLampType(user) {
        console.log('userType',user)
        this.dataLampType  = user
        this.isDialogCabinetLampType = true;
    }
    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        manager.rest.api.ScheduleInfoResource.getSchedulesByAssetId(this.nodeSelect.id,{page:this.currentPage,size:5})
            .then((response) => {
                this.listDataKBADForCabinet = response.data
                console.log('response.data',response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.ScheduleInfoResource.countByAssetId({assetId:this.nodeSelect.id})
            .then((response) => {
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    renderPagination() {
        console.log('current',this.currentPage)
        console.log('current2',this.totalPage)
        return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePage(1)}"  class="${this.currentPage === 1 ? 'disabled' : ''}" >&laquo;</a></li>
                <li><a @click="${() => this.navigatePage(this.currentPage - 1)}"  class="${this.currentPage === 1 ? 'disabled' : ''}" >&lsaquo;</a></li>
                ${Array.from({ length: this.totalPage }, (_, i) => i + 1).map(page => html`
        <li><a class="${page === this.currentPage ? 'active' : ''}" @click="${() => this.navigatePage(page)}">${page}</a></li>
    `)}
                <li><a @click="${() => this.navigatePage(this.currentPage + 1)}"  class="${this.currentPage === this.totalPage ? 'disabled' : ''}" >&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePage(this.totalPage)}"  class="${this.currentPage === this.totalPage ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
    }
    @state() checked :any = this.listDKT?.every(item => item.value === 1)?true:false
    toggle(e) {
        this.checked = !this.checked;
        const formattedArray: any = this.listDKT.map(item => ({
            ref: {
                id: this.nodeSelect.id,
                name: item.cabinetGroup.name,
            },
            value: e.target.checked ? 1 : 0,
        }));
        console.log('filteredArray',formattedArray)
        if(this.dataClick?.[0].assetInfo?.statusAI === "A") {
            manager.rest.api.AssetResource.writeAttributeValues(formattedArray)
                .then((response) => {
                    console.log('responseValue', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        if(this.dataClick?.[0].assetInfo?.statusAI === "D") {
            this.showWarningNotification(`Tủ đang mất kết nối`)
        }
        if(this.dataClick?.[0].assetInfo?.statusAI === "M") {
            this.showWarningNotification(`Tủ đang bảo trì`)
        }
        if(this.dataClick?.[0].assetInfo?.statusAI === "P") {
            this.showWarningNotification(`Tủ đang dừng hoạt động`)
        }
        this.listDKT = this.listDKT.map(item => ({
            ...item,
            value: e.target.checked ? 1 : 0
        }));
    }
    @state() checkedList

    toggleSwitch(index,item,e) {
        const isChecked = e.target.checked; // true nếu bật, false nếu tắt
        const newValue = isChecked ? 1 : 0;
        console.log('item',item)
        // // Toggle sang 1 hoặc 0
        // const newValue = prevValue === 1 ? 0 : 1;
        // this.checkedList[item.id] = newValue;
        const obj = new Number(newValue);
        console.log('item',obj)
        console.log('cabinetGroup',item.cabinetGroup)
        console.log('item',this.dataClick[0].asset?.id)
        this.requestUpdate();
        if(this.dataClick?.[0].assetInfo?.statusAI === "A"){
            manager.rest.api.AssetResource.writeAttributeValue(this.dataClick[0].asset?.id,item.cabinetGroup.name, obj)
                .then((response) => {
                    console.log('responseValue',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.listDKT = this.listDKT.map(dktItem =>
                dktItem.idCabinetGroupAsset === item.idCabinetGroupAsset
                    ? { ...dktItem, value: newValue }
                    : dktItem
            );
            console.log(' this.listDKT', this.listDKT)
            console.log('node.id',typeof this.nodeSelect.id)
        }
        if(this.dataClick?.[0].assetInfo?.statusAI === "D") {
            this.showWarningNotification(`Tủ đang mất kết nối`)
        }
        console.log(`Switch ${index} is now:`, this.checkedList[item.id]);
    }
    getLatestTimestampItem(data:any) {
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
    @state() lastTimective
    async reloadBUIE() {
        console.log('thâ',this.nodeSelect)
        try {
            const response = await manager.rest.api.AssetResource.reloadBUIE(this.nodeSelect.id);
        } catch (e) {
            console.log('call Faile')
        }
        if(this.dataClick[0].asset.type === "ElectricalCabinetAsset"){
            manager.rest.api.AssetResource.getAsset(this.nodeSelect.id)
                .then((response) => {
                    console.log('response.data',response.data)
                    this.dataClick = response.data;
                    this.lastTimective = this.getLatestTimestampItem(response?.data?.[0].asset.attributes)
                    console.log('response?.data?.[0].asset.attributes',this.getLatestTimestampItem(response?.data?.[0].asset.attributes))
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.nodeSelect.id)
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            const enrichedList = enrichStatusList(this.dataClick?.[0].asset?.attributes ? this.dataClick?.[0].asset : {}, response.data);
                            this.listDKT = enrichedList
                            const allValueIsOne = enrichedList.every(item => item.value === 1);
                            const allValueIsZero = enrichedList.every(item => item.value === 0);
                            console.log('abc',enrichedList)
                            if(this.dataClick?.[0].assetInfo?.statusAI !== "A"){
                                const listValue = enrichedList
                                this.checked = false
                                listValue.forEach(item => {
                                    item.value = 0;
                                });
                                this.listDKT = listValue
                                console.log(' this.listDKT', this.listDKT)
                            }
                            if(this.dataClick?.[0].assetInfo?.statusAI === "A" && allValueIsOne){
                                const listValue = enrichedList
                                this.checked = true
                                listValue.forEach(item => {
                                    item.value = 1;
                                });
                                this.listDKT = listValue
                            }
                            if(this.dataClick?.[0].assetInfo?.statusAI === "A" && allValueIsZero){
                                const listValue = enrichedList
                                this.checked = false;
                                listValue.forEach(item => {
                                    item.value = 0;
                                });
                                this.listDKT = listValue
                            }
                            // if (allValueIsOne) {
                            //     this.checked = true;
                            //     this.listDKT.forEach(item => {
                            //         item.value = 1;
                            //     });
                            // } else if (allValueIsZero) {
                            //     this.checked = false;
                            //     this.listDKT.forEach(item => {
                            //         item.value = 0;
                            //     });
                            // }
                            console.log('responselistDKT',enrichedList)
                            console.log('responselistDKT2',this.dataClick[0])
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    const arrayTable = this.convertAttributesToPhaseArrayCabinet(response.data[0].asset.attributes);
                    console.log('arrayTable',arrayTable)
                    this.dataPhase = arrayTable;
                    this.value = response.data[0].asset.attributes.brightness.value;
                    console.log('getDataTu', response.data);
                    const translateLabel = (label) => {
                        if (label.includes("voltagePhase1")) return "Pha 1";
                        if (label.includes("voltagePhase2")) return "Pha 2";
                        if (label.includes("voltagePhase3")) return "Pha 3";
                        return label; // giữ nguyên nếu không khớp
                    };
                    manager.rest.api.AssetDatapointResource.getAssetDatapoints(this.nodeSelect.id)
                        .then((response) => {
                            console.log('response',response)
                            const distinctColors = ['#FF6384', '#36A2EB', '#FFCE56'];
                            const formattedData = response.data.datasets.map((item, index) => ({
                                label: translateLabel(item.label),
                                data: item.data,
                                borderColor: distinctColors[index % distinctColors.length],
                            }));
                            const fakeDataChart1 = {
                                labels: this.formatTimeArray(response.data.labels),
                                datasets: formattedData
                            };
                            this.chartSave.data.labels = fakeDataChart1.labels;
                            this.chartSave.data.datasets = fakeDataChart1.datasets;
                            this.chartSave.update()
                            console.log('abc2', formattedData)
                            console.log('abc', fakeDataChart1)
                            console.log('responseDataPoint', response.data)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    this.showCabinet = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            console.log('node.id',typeof this.nodeSelect.id)
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
        }
        if(this.dataClick[0].asset.type === "LightAsset"){
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            console.log('this.turnOnLightColumnAndLight',this.nodeSelect.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                .then((response:any) => {
                    const abc = response.data
                    console.log('response.data',response.data)
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            console.log('abc',abc)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,this.nodeSelect.id));
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            console.log('parentTu2',this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(this.nodeSelect.id)
                .then((response) => {
                    this.dataClick = response.data;
                    this.lastTimective = this.getLatestTimestampItem(response?.data?.[0].asset.attributes)
                    console.log(' this.dataClick ', this.dataClick )
                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data[0].asset.attributes.brightness.value;
                    console.log('getDataTu', response.data);
                    manager.rest.api.AssetDatapointResource.getAssetDatapoints(this.nodeSelect.id)
                        .then((response) => {
                            const distinctColors = ['#FF6384', '#36A2EB', '#FFCE56'];
                            const translateLabel = (label) => {
                                if (label.includes("wattageActual")) return "Công suất thực tế";
                                return label; // giữ nguyên nếu không khớp
                            };
                            const formattedData = response.data.datasets.map((item, index) => ({
                                label: translateLabel(item.label),
                                data: item.data,
                                borderColor: distinctColors[index % distinctColors.length],
                            }));
                            const fakeDataChart1 = {
                                labels: this.formatTimeArray(response?.data?.labels),
                                datasets: formattedData
                            };
                            this.chartSave.data.labels = fakeDataChart1.labels;
                            this.chartSave.data.datasets = fakeDataChart1.datasets;
                            this.chartSave.options = {

                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Năng lượng tiêu thụ thực tế trong ngày'
                                    },
                                    datalabels: {
                                        display: false
                                    },
                                    legend: {
                                        position: 'bottom',
                                    },
                                    // annotation: {
                                    //     annotations: {
                                    //         horizontalLine: {
                                    //             type: 'line',
                                    //             yMin: response.data.y0 === "null" ? 0 : response.data.y0,
                                    //             yMax: response.data.y0 === "null" ? 0 : response.data.y0,
                                    //             borderColor: 'black',
                                    //             borderWidth: 2,
                                    //         }
                                    //     }
                                    // }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Thời gian', // Nhãn trục X
                                            font: {
                                                size: 10,
                                                weight: 'bold'
                                            },
                                            color: '#333'
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Năng lượng(W)', // Nhãn trục Y
                                            font: {
                                                size: 10,
                                                weight: 'bold'
                                            },
                                            color: '#333'
                                        },
                                        min:0
                                    }
                                },
                            };
                            this.chartSave.update()
                            console.log('abc2', formattedData)
                            console.log('abc', fakeDataChart1)
                            console.log('responseDataPoint', response.data)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    this.showLight = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.AssetResource.getInfoLightAsset(this.nodeSelect.id)
                .then((response) => {
                    this.thongsokythuat = response.data
                    console.log('getInfoLightAsset',response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        if(this.dataClick[0].asset.type === "LightGroupAsset"){
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            console.log('this.turnOnLightColumnAndLight',this.nodeSelect.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                .then((response:any) => {
                    const abc = response.data
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,this.nodeSelect.id));
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            // console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(this.nodeSelect.id)
                .then((response) => {
                    this.dataClick = response.data;
                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data[0].asset.attributes.brightness.value;
                    const filteredData2 = this.processAssets(response.data).filter(item => item.id !== this.nodeSelect.id);
                    const filteredData3 = response.data.filter(item => item.asset.id !== this.nodeSelect.id);
                    this.listLocationLightGroup = filteredData3
                    console.log('getDataTu', this.extractWattageAmperageVoltage(response.data));
                    this.dataTableLightGroup = filteredData2
                    this.lastTimeColumn = this.getMaxTimestampFormatted(filteredData2)
                    console.log('getDataTu2', response.data);
                    console.log('getDataTu3', filteredData2);
                    this.showColumn = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        if(this.dataClick[0].asset.type === "FixedGroupAsset"){
            function enrichStatusList(asset, statusList) {
                return statusList.map(item => {
                    const attr = asset.attributes[item?.cabinetGroup?.name];
                    return {
                        ...item,
                        value: attr ? attr.value : null // hoặc undefined tùy bạn
                    };
                });
            }
            console.log('this.turnOnLightColumnAndLight',this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            console.log('this.turnOnLightColumnAndLight',this.nodeSelect.id)

            console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,this.nodeSelect.id))
            manager.rest.api.AssetResource.getAsset(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                .then((response:any) => {
                    const abc = response.data
                    manager.rest.api.CabinetGroupResource.getCabinetGroupByCabinet(this.findTopMostParentId(this.turnOnLightColumnAndLight,this.nodeSelect.id))
                        .then((response:any) => {
                            console.log('esprons.dât',response.data)
                            this.parentTu = abc
                            const enrichedList = enrichStatusList(abc[0].asset?.attributes ? abc[0].asset : {}, response.data);
                            const foundItem = enrichedList.find(item => item.idCabinetGroupAsset === this.nodeSelect.id);
                            this.foundItemLighColumn = foundItem
                            console.log('responselistDKT2',foundItem)
                            console.log('enrichedList',enrichedList)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

            // console.log('parentTu',this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            // manager.rest.api.AssetResource.getAsset(this.findNearestFixedGroupAsset(this.turnOnLightColumnAndLight,node.id))
            //     .then((response) => {
            //         this.columnAndLightTurnOn = response.data[0]
            //         console.log('getRealm234', response.data)
            //     })
            //     .catch((error) => {
            //         console.error('Lỗi khi lấy dữ liệu:', error);
            //     });
            manager.rest.api.AssetResource.getAsset(this.nodeSelect.id)
                .then((response) => {
                    this.dataClick = response.data;
                    const arrayTable = this.convertAttributesToPhaseArray(response.data[0].asset.attributes);
                    this.dataPhase = arrayTable;
                    this.value = response.data[0].asset.attributes.brightness.value;
                    const filteredData2 = this.processAssets(response.data).filter(item => item.id !== this.nodeSelect.id);
                    console.log('getDataTu', this.extractWattageAmperageVoltage(response.data));
                    this.dataTableLightGroup = filteredData2
                    console.log('getDataTu2', response.data);
                    console.log('getDataTu3', filteredData2);
                    this.lastTimeColumn = this.getMaxTimestampFormatted(filteredData2)
                    console.log('2', response.data);
                    this.showFixed = true;

                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
    }

    render() {
        console.log('${this.formatDateNoTime(this.dataKB?.schFromDate)',typeof this.formatDateNoTime(this.dataKB?.schFromDate))
        const responsiveSteps: any = [
            // Use one column by default
            {minWidth: 0, columns: 1},
            // Use two columns, if layout's width exceeds 500px
            {minWidth: '500px', columns: 5},
        ];
        const responsiveSteps2: any = [
            // Use one column by default
            {minWidth: 0, columns: 1},
            // Use two columns, if layout's width exceeds 500px
            {minWidth: '500px', columns: 2},
        ];
        const responsiveSteps3: any = [
            // Use one column by default
            {minWidth: 0, columns: 1},
            // Use two columns, if layout's width exceeds 500px
            {minWidth: '500px', columns: 3},
        ];
        console.log('abc', this.dataClick)
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDialogCabinetLampType}" @opened-changed="${this.handleOpenedChangedLampType}">
                   <style>
                       table {
                           width: 100%;
                           border-collapse: collapse;
                           margin-top: 20px;
                           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                       }

                       th, td {
                           padding: 12px;
                           text-align: center;
                           color: black;
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
                   </style>
                    <div style="text-align: center;width: 520px">
                        <table>
                            <thead>
                            <tr>
                                <th>Loại đèn</th>
                                <th>Độ sáng</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.dataLampType?.lampTypes?.length !== 0 ? this.dataLampType?.lampTypes?.map((item,index) => {
                                return html`
                                    <tr>
                                        <td>${item?.lamp_type_name}
                                        </td>
                                        <td>${item?.lamp_type_value}
                                        </td>
                                    </tr>
                                `;
                            }) : html`
                                <tr>
                                    <td colspan="6">
                                        <div colspan="6"
                                             style="height: 200px;display: flex;align-items: center;justify-content: center">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>`}

                            </tbody>
                        </table>
                    </div>
                </vaadin-dialog-overlay>
               <vaadin-dialog-overlay ?opened="${this.isDialogCabinet}" @opened-changed="${this.handleOpenedChangedCabinet}">
                   <style>
                       table {
                           width: 100%;
                           border-collapse: collapse;
                           margin-top: 20px;
                           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                       }

                       th, td {
                           padding: 12px;
                           text-align: center;
                           color: black;
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
                   </style>
                    <div style="width: 520px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">${this.dataKB?.scheduleName + "-" + this.dataKB?.scheduleCode }</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDialogCabinet = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <div style="display: flex;justify-content: space-between;margin: 0 10px">
                            <div style="display: flex;flex-direction: column">
                                <p>Ngày bắt đầu</p>
                                <p style="font-weight: bold">${this.formatDateNoTime(this.dataKB?.schFromDate) === "01/01/2199" ? "Luôn luôn": this.formatDateNoTime(this.dataKB?.schFromDate)}</p>
                            </div>
                            <div style="display: flex;flex-direction: column">
                                <p>Ngày kết thúc</p>
                                <p style="font-weight: bold">${this.formatDateNoTime(this.dataKB?.schToDate) === "01/01/2199" ? "Không giới hạn": this.formatDateNoTime(this.dataKB?.schToDate)}</p>
                            </div>
                            <div style="display: flex;flex-direction: column">
                                <p>Ngày cập nhật</p>
                                <p style="font-weight: bold">${this.formatDateNoTime(this.dataKB?.updateDate)}</p>
                            </div>
                        </div>
                        <div>
                            <p style="margin:0 20px">Tham số dim</p>
                            <table>
                                <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Từ giờ</th>
                                    <th>Đến giờ</th>
                                    <th>Độ sáng</th>
                                    <th>Loại đèn</th>
                                </tr>
                                </thead>
                                <tbody>
                                ${this.dataKB?.timeConfigurations?.length !== 0 ? this.dataKB?.timeConfigurations?.map((item,index) => {
                                    return html`
                                    <tr>
                                        <td>${index + 1}
                                        </td>
                                        <td>${item?.timePeriod?.time_from}
                                        </td>
                                        <td>${item?.timePeriod?.time_to}</td>
                                        <td>
                                            ${item?.timePeriod?.time_value}
                                        </td>
                                        <td style="color: rgb(25, 118, 210);cursor: pointer;text-decoration: underline" @click="${() => this.openDialogCabinetLampType(item)}">Loại đèn</td>
                                    </tr>
                                `;
                                }) : html`
                                <tr>
                                    <td colspan="6">
                                        <div colspan="6"
                                             style="height: 200px;display: flex;align-items: center;justify-content: center">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>`}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
               <vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpen}" @opened-changed="${this.handleOpenedChanged}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Thêm nhóm đèn</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                            ${this.checkNode4?.type === "ElectricalCabinetAsset" ? html`
                                <p>Nhóm đèn cố định</p>
                                `:``}
                            ${this.checkNode4?.type === "FixedGroupAsset" ? html`
                                <p>Nhóm đèn linh hoạt</p>
                                `:``}
                            ${this.checkNode4?.type === "LightGroupAsset" ? html`
                                <p>Nhóm đèn linh hoạt</p>
                                `:``}
                        <div style="width: 100%;display: flex;flex-direction: column">
                             ${this.checkNode4?.type !== "ElectricalCabinetAsset" ? html`
                                 <vaadin-text-field
                                         placeholder="Mã nhóm"
                                         clear-button-visible
                                         .value="${this.tenNhomLightAndColumn}"
                                         @input="${this.handleMaNhomLightAndColumn}"
                                 ></vaadin-text-field>
                             `:html`<vaadin-combo-box
                                    placeholder="Mã nhóm"
                                    .items="${this.listMaTu}"
                                    .value="${this.maNhom?.id}"
                                    item-label-path="code"
                                    item-value-path="id"
                                    @selected-item-changed="${this.handleMaNhom}"
                            ></vaadin-combo-box>`}
                            <vaadin-text-field
                                    placeholder="Tên nhóm"
                                    .value="${this.tenNhom}"
                                    clear-button-visible
                                    @input="${this.handleTenNhom}"
                            ></vaadin-text-field>
                        </div>
                       
                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDelete}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Lưu</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
              <vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpenReal}" @opened-changed="${this.handleOpenedChangedDelete}">
                  <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                      <p style="visibility: hidden;padding: 0">abc</p>
                      <p style="padding: 0;color: white">Xác nhận</p>
                      <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpenReal = false}" style="color:white;margin-right: 10px"></or-icon>
                  </div>
                    <div style="text-align: center;width: 400px">
                        <div style="margin: 10px 0px">Bạn có chắc chắn muốn xóa không</div>
                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDeleteReal}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDeleteReal}">Lưu</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
            <vaadin-notification id="myNotification" duration="3000" position="bottom-end"
                                 theme="success"></vaadin-notification>
            <div style="height: 100%">
                <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                    <div style="margin-right:0;background: white">
                        <div style="background: linear-gradient(#a8e06e, #6aaf36);color:white;padding: 10px 5px">
                            Thiết bị
                        </div>
                        <div id="tree"></div>
                    </div>
                    ${this.showCabinet ? html`
                        <div colspan="4" style="height: 100%;margin:0">
                            <div style="display: flex;justify-content:space-between;align-items: center;background: white">
                                <p style="visibility: hidden">
                                    ${this.dataClick[0].assetInfo?.statusAI == 'A' ? 'Hoạt động' : this.dataClick[0].assetInfo?.statusAI == 'M' ? 'Bảo trì' : 'Dừng hoạt động'}</p>
                                <h2 style="text-align: center;margin: 0">
                                    ${this.dataClick[0].asset?.name + "-" + this.dataClick[0].assetInfo?.assetCode} <span   style="${this.dataClick[0].assetInfo?.statusAI == 'A'
                                        ? 'color: green;font-size:16px'
                                        : this.dataClick[0].assetInfo?.statusAI == 'M'
                                                ? 'color: yellow;font-size:16px'
                                                : this.dataClick[0].assetInfo?.statusAI == 'P'
                                                        ? 'color: red;font-size:16px'
                                                        : this.dataClick[0].assetInfo?.statusAI == 'D'
                                                                ? 'color: red;font-size:16px'
                                                                : ''}">
                                    ${this.dataClick[0].assetInfo?.statusAI == 'A'
                                            ? 'Hoạt động'
                                            : this.dataClick[0].assetInfo?.statusAI == 'M'
                                                    ? 'Bảo trì'
                                                    : this.dataClick[0].assetInfo?.statusAI == 'P'
                                                            ? 'Dừng hoạt động'
                                                            : this.dataClick[0].assetInfo?.statusAI == 'D'
                                                                    ? 'Mất kết nối'
                                                                    : ''}
                                </span></h2>
                                <div style="visibility: hidden">
                                    <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=> this.isDeleteDialogOpenReal = true}">Xóa</vaadin-button>
                                </div>
                            </div>
                            <vaadin-tabsheet style="">
                                <vaadin-tabs slot="tabs"
                                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px">
                                    <vaadin-tab id="overview-tab">Thông tin tủ</vaadin-tab>
                                    <vaadin-tab id="devices-tab">Kịch bản áp dụng</vaadin-tab>
                                </vaadin-tabs>
                                <div tab="overview-tab" style="height: 100%">
                                    <div style="box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white;height: 100%">
                                        <div>
                                            <div style="display: flex">
                                                <div style="flex:2">
                                                    <div style="display: flex;justify-content: space-between;align-items: center;margin: 0 20px">
                                                        <p>Kết nối: ${this.dataClick?.[0].assetInfo?.lightNumberInCabinet} đèn</p>
                                                        <or-icon  class="beauty-button" icon="refresh" style="color:green;cursor: pointer" @click="${this.reloadBUIE}"></or-icon>
                                                    </div>
                                                    <div  class="margin20" style="display: flex;justify-content: space-between;align-items: center">
                                                        <p>Đo điện năng tổng</p>
                                                        <p>Hoạt động lần cuối :
                                                            ${this.lastTimective?.timestamp?this.formatDate(this.lastTimective?.timestamp):""}</p>
                                                    </div>
                                                    <div style="margin: 0 20px">
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
                                                            ${this.dataPhase.map(item => html`
                                                                <tr>
                                                                    <td>${this.formatNumber(item.phase)}</td>
                                                                    <td>${this.formatNumber(item.volt)}</td>
                                                                    <td>${this.formatNumber((item.amp)/1000)}</td>
                                                                    <td>${this.formatNumber(item.watt)}</td>
                                                                    <td>${this.formatNumber(item.wattActual)}</td>
                                                                </tr>
                                                            `)}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div style="display: flex;justify-content: space-between;margin: 10px 20px;align-items: center">
                                                        <p>Điều khiển khởi</p>
                                                        <div>
                                                            <label>Tắt</label>
                                                            <label class="switch">
                                                                <input type="checkbox" .checked="${this.checked}" @change=${(e)=>this.toggle(e)}>
                                                                <span class="slider"></span>
                                                            </label>
                                                            <label>Bật</label>
                                                        </div>
                                                    </div>
                                                    <div style="margin: 0 20px">
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <th>Mã nhóm</th>
                                                                <th>Tên nhóm</th>
                                                                <th>Tổng số đèn</th>
                                                                <th>Trạng thái</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            ${this.listDKT.map((item,index) => html`
                                                                <tr>
                                                                    <td>${item.cabinetGroup?.code}</td>
                                                                    <td>${item.name}</td>
                                                                    <td>${item.countLight}</td>
                                                                    <td>
                                                                        <label>Tắt</label>
                                                                        <label class="switch">
                                                                            <input type="checkbox"
                                                                                   .checked=${item.value}
                                                                                   disabled
                                                                                   style="pointer-events: none; opacity: 1;">
                                                                            <span class="slider" style="cursor: default;"></span>
                                                                        </label>
                                                                        <label>Bật</label>
                                                                    </td>
                                                                </tr>
                                                            `)}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div class="margin20">
                                                        <p style="margin: 0">Điều khiển đèn (Dim - %)</p>

                                                        <div class="square-container">
                                                            ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => {
                                                                const isDisabled = this.dataClick[0].assetInfo?.statusAI !== 'A';
                                                                return html`
                                                                    <div
                                                                            class="square ${this.value === num ? 'active' : ''}"
                                                                            @click="${(e) => {
                                                                               this.selectSquare(e);
                                                                            }}"
                                                                    >
                                                                        ${num}
                                                                    </div>
                                                                `;
                                                            })}
                                                        </div>
                                                        <div style="display: flex;justify-content: flex-end">
                                                            <vaadin-button
                                                                    style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                                                    @click="${this.navigateToDashboard}">
                                                                Hủy
                                                            </vaadin-button>
                                                            <vaadin-button
                                                                    style="background:#4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                                                    @click="${this.handleSaveAttribute}">
                                                                Lưu
                                                            </vaadin-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style="flex: 1">
                                                    <p style="margin:10px 0px"><b>Vị trí</b></p>
                                                    <or-map id="map" class="or-map" style="width: 100%; height: 200px"
                                                            zoom="10">
                                                        <or-map-marker-asset
                                                                .asset=${this.dataClick[0]}
                                                                .config=${this.config?.markers}>
                                                        </or-map-marker-asset>
                                                    </or-map>
                                                    <canvas style="margin-top: 20px" id="myChart"></canvas>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div tab="devices-tab" style="height: 100%">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã kịch bản</th>
                                            <th>Tên kịch bản</th>
                                            <th>Lịch biểu</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                            <th>Chi tiết</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${this.listDataKBADForCabinet?.length !== 0 ? this.listDataKBADForCabinet?.map((item,index) => {
                                            const label =
                                                    item.schType === "ALWAYS" ? "Luôn luôn" :
                                                            item.schType === "REOCC" ? "Lặp lại" :
                                                                    item.schType === "ANOCC" ? "Một lần" :
                                                                            "";

                                            return html`
                                                <tr>
                                                    <td>${index + 1}
                                                    </td>
                                                    <td>${item?.scheduleCode}
                                                    </td>
                                                    <td>${item?.scheduleName}</td>
                                                    <td>${label}</span>
                                                    </td>
                                                    <td>${this.formatDateNoTime(item?.schFromDate)}</td>
                                                    <td>${this.formatDateNoTime(item?.schToDate)}</td>
                                                    <td><a style="color: rgb(25, 118, 210);cursor: pointer;text-decoration: underline" @click="${() => this.openDialogCabinet(item)}">Chi tiết</a></td>
                                                </tr>
                                            `;
                                        }) : html`
                                            <tr>
                                                <td colspan="5">
                                                    <div colspan="5"
                                                         style="height: 200px;display: flex;align-items: center;justify-content: center">
                                                        Không có dữ liệu
                                                    </div>
                                                </td>
                                            </tr>`}

                                        </tbody>
                                    </table>
                                    ${this.renderPagination()}
                                </div>
                            </vaadin-tabsheet>
                        </div>
                    ` : ``}
                    ${this.showLight ? html`
                        <div colspan="4"
                             style="height: 100%;box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white">
                            <div style="display: flex;justify-content:space-between;align-items: center;background: white">
                                <p style="visibility: hidden">
                                    ${this.dataClick[0].assetInfo?.statusAI == 'A' ? 'Hoạt động' : this.dataClick[0].assetInfo?.statusAI == 'M' ? 'Bảo trì' : 'Dừng hoạt động'}</p>
                                <h2 style="text-align: center;margin: 0">
                                    ${this.dataClick[0].asset?.name} <span style="${
                                        this.dataClick[0].assetInfo?.statusAI === 'A'
                                                ? 'color: green;font-size:16px'
                                                : this.dataClick[0].assetInfo?.statusAI === 'I'
                                                        ? 'color: red;font-size:16px'
                                                        : this.dataClick[0].assetInfo?.statusAI === 'D'
                                                                ? 'color: red;font-size:16px'
                                                                : ''
                                }">
                                   ${this.dataClick[0].assetInfo?.statusAI == 'A'
                                           ? 'Bật'
                                           : this.dataClick[0].assetInfo?.statusAI == 'I'
                                                   ? 'Tắt'
                                                   : this.dataClick[0].assetInfo?.statusAI == 'D'
                                                           ? 'Mất kết nối'
                                                           : ''}
                                </span></h2>
                                <h2 style="text-align: center;margin: 0;visibility: hidden">
                                    ${this.dataClick[0].asset?.name}</h2>
                            </div>
                            <vaadin-tabsheet style="">
                                <vaadin-tabs slot="tabs"
                                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                                    <vaadin-tab id="overview-tab">Thông tin đèn</vaadin-tab>
                                    <vaadin-tab id="devices-tab">Kịch bản áp dụng</vaadin-tab>
                                </vaadin-tabs>
                                <div tab="overview-tab" style="height: 100%">
                                      <div style="box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white;height: 100%">
                                <div style="display:flex;background: white;gap:10px"
                                     class="my-layout">
                                    <div style="display: flex;flex:1;flex-direction: column">
                                        <div style="display: flex;justify-content: space-between;align-items: center;margin:0 10px">
                                            <p>Hoạt động lần cuối :
                                                ${this.lastTimective?.timestamp?this.formatDate(this.lastTimective?.timestamp):""}</p>
                                            <or-icon class="beauty-button" icon="refresh" style="color:green;cursor: pointer;margin-left: 10px" @click="${this.reloadBUIE}"></or-icon>
                                        </div>
                                        <canvas id="myChart"></canvas>
                                        <div>
                                            <p style="margin: 0">Điều khiển đèn (Dim - %)</p>

                                            <div class="square-container">
                                                ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => html`
                                                    <div
                                                            class="square ${this.value === num ? 'active' : ''}"
                                                            @click="${this.selectSquare}"
                                                    >
                                                        ${num}
                                                    </div>
                                                `)}

                                            </div>
                                            
                                            <div style="display: flex;justify-content: flex-end">
                                                <vaadin-button
                                                        style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                                        @click="${this.navigateToDashboard}">
                                                    Hủy
                                                </vaadin-button>
                                                <vaadin-button
                                                        style="background: #4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                                        @click="${this.handleSaveAttribute}">
                                                    Lưu
                                                </vaadin-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex;flex:1;flex-direction: column">
                                        <p style="margin:10px 0px"><b>Vị trí</b></p>
                                        <or-map id="map" class="or-map" style="width: 100%; height: 200px" zoom="10">
                                            <or-map-marker-asset
                                                    .asset=${this.dataClick[0]}
                                                    .config=${this.config?.markers}>
                                            </or-map-marker-asset>
                                        </or-map>
                                        <div style="margin-top: 10px;display: flex;flex-direction: column">
                                            <lable style="margin:10px 0px">Thông số kỹ thuật</lable>
                                            <lable style="margin:10px 0px">Mã đèn : ${this.dataClick?.[0].assetInfo?.assetCode}</lable>
                                            <lable style="margin:10px 0px">Công suất : ${this.formatNumber(this.thongsokythuat?.lampType?.powerConsumption)}</lable>
                                            <lable style="margin:10px 0px">Quang thông : ${this.formatNumber(this.thongsokythuat?.lampType?.luminousFlux)}</lable>
                                            <lable style="margin:10px 0px">FirmWare : ${this.thongsokythuat?.assetInfo?.firmwareVersion}</lable>
                                            <lable style="margin:10px 0px">Giờ hoạt động : ${this.formatNumber(this.thongsokythuat?.lampType?.lifeHours)}</lable>
                                        </div>
                                    </div>
                                </div>

                            </div>
                                </div>
                                <div tab="devices-tab" style="height: 100%">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã kịch bản</th>
                                            <th>Tên kịch bản</th>
                                            <th>Lịch biểu</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                            <th>Chi tiết</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${this.listDataKBADForCabinet?.length !== 0 ? this.listDataKBADForCabinet?.map((item,index) => {
                                            const label =
                                                    item.schType === "ALWAYS" ? "Luôn luôn" :
                                                            item.schType === "REOCC" ? "Lặp lại" :
                                                                    item.schType === "ANOCC" ? "Một lần" :
                                                                            "";

                                            return html`
                                                <tr>
                                                    <td>${index + 1}
                                                    </td>
                                                    <td>${item?.scheduleCode}
                                                    </td>
                                                    <td>${item?.scheduleName}</td>
                                                    <td>${label}</span>
                                                    </td>
                                                    <td>${this.formatDateNoTime(item?.schFromDate)}</td>
                                                    <td>${this.formatDateNoTime(item?.schToDate)}</td>
                                                    <td><a style="color: rgb(25, 118, 210);cursor: pointer;text-decoration: underline" @click="${() => this.openDialogCabinet(item)}">Chi tiết</a></td>
                                                </tr>
                                            `;
                                        }) : html`
                                            <tr>
                                                <td colspan="5">
                                                    <div colspan="5"
                                                         style="height: 200px;display: flex;align-items: center;justify-content: center">
                                                        Không có dữ liệu
                                                    </div>
                                                </td>
                                            </tr>`}

                                        </tbody>
                                    </table>
                                    ${this.renderPagination()}
                                </div>
                            </vaadin-tabsheet>
                         

                        </div>
                    ` : ``}
                    ${this.showColumn ? html`
                        <div colspan="4"
                             style="height: 100%;box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white">
                            <div style="display: flex;justify-content:space-between;align-items: center;background: white">
                                <p style="visibility: hidden">
                                    ${this.dataClick[0].assetInfo?.statusAI == 'A' ? 'Hoạt động' : this.dataClick[0].assetInfo?.statusAI == 'M' ? 'Bảo trì' : 'Dừng hoạt động'}</p>
                                <h2 style="text-align: center;margin: 0">
                                    ${this.dataClick[0].asset?.name}</h2>
                              <div>
                                  <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=> this.isDeleteDialogOpenReal = true}">Xóa</vaadin-button>
                              </div>
                            </div>
                            <vaadin-tabsheet style="">
                                <vaadin-tabs slot="tabs"
                                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                                    <vaadin-tab id="overview-tab">Thông tin nhóm</vaadin-tab>
                                    <vaadin-tab id="devices-tab">Kịch bản áp dụng</vaadin-tab>
                                </vaadin-tabs>
                                <div tab="overview-tab" style="height: 100%">
                                      <div style="box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white;height: 100vh">
                                <vaadin-form-layout .responsiveSteps="${responsiveSteps2}"
                                                    style="background: white"
                                                    class="my-layout">
                                    <div style="display: flex;flex-direction: column">
                                        <div style="display: flex;justify-content: space-between;align-items: center;margin:0 10px">
                                            <p>Hoạt động lần cuối :
                                                ${this.lastTimeColumn?this.formatDate(this.lastTimeColumn):""}</p>
                                            <or-icon class="beauty-button" icon="refresh" style="color:green;cursor: pointer;margin-left: 10px" @click="${this.reloadBUIE}"></or-icon>
                                        </div>                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Mã đèn</th>
                                                <th>Tên đèn</th>
                                                <th>U(Volt)</th>
                                                <th>I(A)</th>
                                                <th>P(W)</th>
                                                <th>Cos(φ)</th>
                                                <th>Dim</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            ${this.dataTableLightGroup.map(item => html`
                                                <tr>
                                                    <td>${item.assetCode}</td>
                                                    <td>${item.name}</td>
                                                    <td>${this.formatNumber(item?.attributes?.voltage?.value)}</td>
                                                    <td>${this.formatNumber((item.attributes?.amperage?.value)/1000)}</td>
                                                    <td>${this.formatNumber(item.attributes?.wattage?.value)}</td>
                                                    <td>${this.formatNumber((item.attributes?.wattage?.value)/(item.attributes?.voltage?.value*(item.attributes?.amperage?.value/1000)))}</td>
                                                    <td>${this.formatNumber(item.attributes?.brightness?.value)}</td>
                                                    <td>
                                                         <span
                                                                 style="${
                                                                         item.statusAI === 'A'
                                                                                 ? 'color: green;font-size:16px'
                                                                                 : item.statusAI === 'I'
                                                                                         ? 'color: red;font-size:16px'
                                                                                         : item.statusAI === 'D'
                                                                                                 ? 'color: red;font-size:16px'
                                                                                                 : ''
                                                                 }"
                                                         > 
                                                            ${item.statusAI == 'A'
                                                                    ? 'Bật'
                                                                    : item.statusAI == 'I'
                                                                            ? 'Tắt'
                                                                            : item.statusAI == 'D'
                                                                                    ? 'Mất kết nối'
                                                                                    : ''}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `)}
                                            </tbody>
                                        </table>
                                        <div>
                                            <p style="margin: 0">Điều khiển đèn (Dim - %)</p>

                                            <div class="square-container">
                                                ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => html`
                                                    <div
                                                            class="square ${this.value === num ? 'active' : ''}"
                                                            @click="${this.selectSquare}"
                                                    >
                                                        ${num}
                                                    </div>
                                                `)}

                                            </div>

                                            <div style="display: flex;justify-content: flex-end">
                                                <vaadin-button
                                                        style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                                        @click="${this.navigateToDashboard}">
                                                    Hủy
                                                </vaadin-button>
                                                <vaadin-button
                                                        style="background: #4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                                        @click="${this.handleSaveAttribute}">
                                                    Lưu
                                                </vaadin-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex;flex-direction: column">
                                        <p>Tên nhóm : ${this.dataClick?.[0].asset?.name}</p>
                                        <p>Mã nhóm : ${this.dataClick?.[0].assetInfo?.assetCode}</p>
                                        <p>Loại nhóm: ${this.dataClick?.[0].asset?.type === "FixedGroupAsset" ? "Nhóm cố định": "Nhóm linh hoạt"}</p>
                                        <lable style="margin:10px 0px"><b>Vị trí</b></lable>
                                        <or-map id="map" class="or-map" style="width: 100%; height: 100px !important;" zoom="10">
                                            ${this.listLocationLightGroup?.map(
                                                    (asset) => html`
                                                        <or-map-marker-asset
                                                                .asset=${asset}
                                                                .config=${this.config?.markers}>
                                                        </or-map-marker-asset>
                                                    `
                                            )}
                                        </or-map>
                                        
                                    </div>
                                </vaadin-form-layout>
                            </div>
                                </div>
                                <div tab="devices-tab" style="height: 100%">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã kịch bản</th>
                                            <th>Tên kịch bản</th>
                                            <th>Lịch biểu</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                            <th>Chi tiết</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${this.listDataKBADForCabinet?.length !== 0 ? this.listDataKBADForCabinet?.map((item,index) => {
                                            const label =
                                                    item.schType === "ALWAYS" ? "Luôn luôn" :
                                                            item.schType === "REOCC" ? "Lặp lại" :
                                                                    item.schType === "ANOCC" ? "Một lần" :
                                                                            "";

                                            return html`
                                                <tr>
                                                    <td>${index + 1}
                                                    </td>
                                                    <td>${item?.scheduleCode}
                                                    </td>
                                                    <td>${item?.scheduleName}</td>
                                                    <td>${label}</span>
                                                    </td>
                                                    <td>${this.formatDateNoTime(item?.schFromDate)}</td>
                                                    <td>${this.formatDateNoTime(item?.schToDate)}</td>
                                                    <td><a style="color: rgb(25, 118, 210);cursor: pointer;text-decoration: underline" @click="${() => this.openDialogCabinet(item)}">Chi tiết</a></td>
                                                </tr>
                                            `;
                                        }) : html`
                                            <tr>
                                                <td colspan="5">
                                                    <div colspan="5"
                                                         style="height: 200px;display: flex;align-items: center;justify-content: center">
                                                        Không có dữ liệu
                                                    </div>
                                                </td>
                                            </tr>`}

                                        </tbody>
                                    </table>
                                    ${this.renderPagination()}
                                </div>
                            </vaadin-tabsheet>
                        </div>` : ``}
                    ${this.showFixed ? html`
                        <div colspan="4"
                             style="height: 100%;box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white">
                            <div style="display: flex;justify-content:space-between;align-items: center;background: white">
                                <p style="visibility: hidden">
                                    ${this.dataClick[0].assetInfo?.statusAI == 'A' ? 'Hoạt động' : this.dataClick[0].assetInfo?.statusAI == 'M' ? 'Bảo trì' : 'Dừng hoạt động'}</p>
                                <h2 style="text-align: center;margin: 0">
                                    ${this.dataClick[0].asset?.name}</h2>
                                <div>
                                    <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=> this.isDeleteDialogOpenReal = true}">Xóa</vaadin-button>
                                </div>
                            </div>
                            <vaadin-tabsheet style="">
                                <vaadin-tabs slot="tabs"
                                             style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                                    <vaadin-tab id="overview-tab">Thông tin nhóm</vaadin-tab>
                                    <vaadin-tab id="devices-tab">Kịch bản áp dụng</vaadin-tab>
                                </vaadin-tabs>
                                <div tab="overview-tab" style="height: 100%">
                                     <div style="box-shadow: rgba(99, 99, 99, 0.2) 2px 2px 8px 0px;color: black;background: white;height: 100vh">
                                <vaadin-form-layout .responsiveSteps="${responsiveSteps2}"
                                                    style="background: white;"
                                                    class="my-layout">
                                    <div style="display: flex;flex-direction: column">
                                        <div style="display: flex;justify-content: space-between;align-items: center;margin:0 10px">
                                            <p>Hoạt động lần cuối :
                                                ${this.lastTimeColumn?this.formatDate(this.lastTimeColumn):""}</p>
                                            <or-icon class="beauty-button" icon="refresh" style="color:green;cursor: pointer;margin-left: 10px" @click="${this.reloadBUIE}"></or-icon>
                                        </div>                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Mã đèn</th>
                                                <th>Tên đèn</th>
                                                <th>U(Volt)</th>
                                                <th>I(A)</th>
                                                <th>P(W)</th>
                                                <th>Cos(φ)</th>
                                                <th>Dim</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            ${this.dataTableLightGroup.map(item => html`
                                                <tr>
                                                    <td>${item.assetCode}</td>
                                                    <td>${item.name}</td>
                                                    <td>${this.formatNumber(item?.attributes?.voltage?.value)}</td>
                                                    <td>${this.formatNumber((item.attributes?.amperage?.value)/1000)}</td>
                                                    <td>${this.formatNumber(item.attributes?.wattage?.value)}</td>
                                                    <td>${this.formatNumber((item.attributes?.wattage?.value)/(item.attributes?.voltage?.value*(item.attributes?.amperage?.value/1000)))}</td>
                                                    <td>${this.formatNumber(item.attributes?.brightness?.value)}</td>
                                                    <td>
                                                        <span
                                                                style="${
                                                                        item.statusAI === 'A'
                                                                                ? 'color: green;font-size:16px'
                                                                                : item.statusAI === 'I'
                                                                                        ? 'color: red;font-size:16px'
                                                                                        : item.statusAI === 'D'
                                                                                                ? 'color: red;font-size:16px'
                                                                                                : ''
                                                                }"
                                                               > 
                                                            ${item.statusAI == 'A'
                                                                    ? 'Bật'
                                                                    : item.statusAI == 'I'
                                                                            ? 'Tắt'
                                                                            : item.statusAI == 'D'
                                                                                    ? 'Mất kết nối'
                                                                                    : ''}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `)}
                                            </tbody>
                                        </table>
                                        <div>
                                            <p style="margin: 0">Điều khiển đèn (Dim - %)</p>

                                            <div class="square-container">
                                                ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => html`
                                                    <div
                                                            class="square ${this.value === num ? 'active' : ''}"
                                                            @click="${this.selectSquare}"
                                                    >
                                                        ${num}
                                                    </div>
                                                `)}

                                            </div>

                                            <div style="display: flex;justify-content: flex-end">
                                                <vaadin-button
                                                        style="background: white;color: black;margin-left: 20px;margin-top: 10px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                                                        @click="${this.navigateToDashboard}">
                                                    Hủy
                                                </vaadin-button>
                                                <vaadin-button
                                                        style="background: #4d9d2a;color: white;margin-left: 20px;margin-top: 10px"
                                                        @click="${this.handleSaveAttribute}">
                                                    Lưu
                                                </vaadin-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex;flex-direction: column">
                                        <p>Tên nhóm : ${this.dataClick?.[0].asset?.name}</p>
                                        <p>Mã nhóm : ${this.dataClick?.[0].assetInfo?.assetCode}</p>
                                        <p>Loại nhóm: ${this.dataClick?.[0].asset?.type === "FixedGroupAsset" ? "Nhóm cố định": "Nhóm linh hoạt"}</p>
                                        <lable style="margin:10px 0px"><b>Vị trí</b></lable>
                                        <or-map id="map" class="or-map" style="width: 100%; height: 200px" zoom="10">
                                            <or-map-marker-asset
                                                    .asset=${this.dataClick[0]}
                                                    .config=${this.config?.markers}>
                                            </or-map-marker-asset>
                                        </or-map>
                                       
                                    </div>
                                </vaadin-form-layout>
                            </div>
                                </div>
                                <div tab="devices-tab" style="height: 100%">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã kịch bản</th>
                                            <th>Tên kịch bản</th>
                                            <th>Lịch biểu</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                            <th>Chi tiết</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        ${this.listDataKBADForCabinet?.length !== 0 ? this.listDataKBADForCabinet?.map((item,index) => {
                                            const label =
                                                    item.schType === "ALWAYS" ? "Luôn luôn" :
                                                            item.schType === "REOCC" ? "Lặp lại" :
                                                                    item.schType === "ANOCC" ? "Một lần" :
                                                                            "";

                                            return html`
                                                <tr>
                                                    <td>${index + 1}
                                                    </td>
                                                    <td>${item?.scheduleCode}
                                                    </td>
                                                    <td>${item?.scheduleName}</td>
                                                    <td>${label}</span>
                                                    </td>
                                                    <td>${this.formatDateNoTime(item?.schFromDate)}</td>
                                                    <td>${this.formatDateNoTime(item?.schToDate)}</td>
                                                    <td><a style="color: rgb(25, 118, 210);cursor: pointer;text-decoration: underline" @click="${() => this.openDialogCabinet(item)}">Chi tiết</a></td>
                                                </tr>
                                            `;
                                        }) : html`
                                            <tr>
                                                <td colspan="5">
                                                    <div colspan="5"
                                                         style="height: 200px;display: flex;align-items: center;justify-content: center">
                                                        Không có dữ liệu
                                                    </div>
                                                </td>
                                            </tr>`}

                                        </tbody>
                                    </table>
                                    ${this.renderPagination()}
                                </div>
                              
                            </vaadin-tabsheet>
                          

                        </div>` : ``}
                </vaadin-form-layout>
            </div>
        `;
    }
}
