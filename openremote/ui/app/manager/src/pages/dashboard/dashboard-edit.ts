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
pdfMake.vfs = pdfFonts.vfs;

@customElement("dashboard-edit")
export class MyElement extends LitElement {
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
    `;
    navigateToDashboard() {
        window.location.hash = '/dashBoard2';
    }
    render() {
        return html`
             <div>
                 
             </div>
            
           
        `;
    }
}
