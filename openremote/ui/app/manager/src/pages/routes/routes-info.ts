import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
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
import "@vaadin/form-layout"
import "@vaadin/vertical-layout"
import "./routes-overview"
import "./routes-devices"
import "./routes-lightColumn"
pdfMake.vfs = pdfFonts.vfs;

@customElement("routes-info")
export class MyElement extends LitElement {
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    @property() activeTab = 'overview'; // Nhận từ routes-home
    @property() routeId = '';

    static styles = css`
        :host {
          
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
        vaadin-text-field::part(input-field) {
            background: white !important;
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        }
        vaadin-combo-box::part(input-field) {
            background: white !important;
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        }
        vaadin-card {
            --vaadin-card-background: white !important;
        }
        p{
            margin-left:10px;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            color: #4D9D2A;
            font-weight: 500;
            padding: 10px;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .back-link:hover {
            opacity: 0.8;
        }

        .back-link vaadin-icon {
            margin-right: 8px;
        }
    `;
    navigateToDashboard() {
        window.location.hash = '/routes';
    }
    @state() private selectedIndex = 0;
    private tabRoutes = ['overview', 'device', 'lightColum'];
    connectedCallback() {
        super.connectedCallback();
        this.updateTabFromProp();
        window.addEventListener('hashchange', this.handleHashChange);
        console.log('Connected, activeTab:', this.activeTab, 'hash:', window.location.hash, 'selectedIndex:', this.selectedIndex);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    private handleHashChange = () => {
        this.updateTabFromPropAndHash();
        console.log('Hash changed to:', window.location.hash, 'selectedIndex:', this.selectedIndex);
    };

    private updateTabFromPropAndHash() {
        const hash = window.location.hash.replace(/^#/, '');
        const hashParts = hash.split('/');
        const tabName = hashParts[hashParts.length - 2] || this.activeTab || 'overview';
        const idFromHash = hashParts[hashParts.length - 1] && !this.tabRoutes.includes(hashParts[hashParts.length - 1])
            ? hashParts[hashParts.length - 1] : this.routeId;

        const tabIndex = this.tabRoutes.indexOf(tabName);
        this.selectedIndex = tabIndex !== -1 ? tabIndex : 0;

        if (tabIndex === -1) {
            history.replaceState(null, '', `#/routes/info/${this.tabRoutes[0]}${idFromHash ? '/' + idFromHash : ''}`);
        }

        this.routeId = idFromHash;

        console.log('Parsed hash:', hash, 'Tab name:', tabName, 'ID:', idFromHash, 'Selected index:', this.selectedIndex);
        this.requestUpdate();
    }

    private updateTabFromProp() {
        const tabIndex = this.tabRoutes.indexOf(this.activeTab);
        this.selectedIndex = tabIndex !== -1 ? tabIndex : 0;
        console.log('Updated from prop, activeTab:', this.activeTab, 'selectedIndex:', this.selectedIndex);
        this.requestUpdate();
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('activeTab')) {
            this.updateTabFromProp();
        }
    }

    private handleTabChange(e: CustomEvent) {
        const index = (e.target as any).selected;
        if (this.selectedIndex !== index) {
            this.selectedIndex = index;
            const tabHash = this.tabRoutes[index];
            history.replaceState(null, '', `#/routes/info/${tabHash}${this.routeId ? '/' + this.routeId : ''}`);
            console.log('Tab changed to:', tabHash, 'Index:', index);
            this.requestUpdate();
        }
    }


    render() {
        const component = this.selectedIndex === 0 ? html`<routes-overview></routes-overview>` :
            this.selectedIndex === 1 ? html`<routes-devices></routes-devices>` :
                this.selectedIndex === 2 ? html`<routes-light></routes-light>` :
                    html`<div>Không tìm thấy component</div>`;
        console.log('infoTable',this.infoTable.routeInfo)
        console.log('infoTable',this.infoTable.routeInfo)
        return html`
            <div style="height: calc(100vh - 167px);">
                <div class="back-link" @click="${this.navigateToDashboard}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </div>
                <div style="${this.infoTable.routeInfo.status == 'A' ? 'background: #4D9D2A;padding:10px' :
                        this.infoTable.routeInfo.status == 'M' ? 'background: #F0B200;color:black;padding:10px' :
                                'background: #d32230;padding:10px'}">
                    <h2 style="margin: 0;color: white">${this.infoTable.routeInfo.routeName}</h2>
                    <h3 style="margin: 0;color: white">${this.infoTable.routeInfo.routeCode}</h3>
                </div>
                 <vaadin-tabs
                    slot="tabs"
                    .selected=${this.selectedIndex}
                    @selected-changed=${this.handleTabChange}
                    style="background: white; box-shadow: rgba(99,99,99,0.2) 0px 2px 8px 0px;"
                >
                    <vaadin-tab>Thông tin</vaadin-tab>
                    <vaadin-tab>Thiết bị</vaadin-tab>
                    <vaadin-tab>Cột đèn</vaadin-tab>
                </vaadin-tabs>
                <div class="tab-content">
                    ${component}
                </div>
            </div>

        `;
    }
}
