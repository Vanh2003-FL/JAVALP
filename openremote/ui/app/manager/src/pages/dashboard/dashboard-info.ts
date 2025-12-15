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
pdfMake.vfs = pdfFonts.vfs;

@customElement("dashboard-info")
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

    `;
    navigateToDashboard() {
        window.location.hash = '/dashBoard2';
    }
    navigateToDashboardEdit() {
        window.location.hash = '/dashBoard2/edit';
    }
    render() {
        return html`
                <vaadin-button style="background: #3a9f6f;color: white;margin-left: 20px;margin-top: 10px" @click="${this.navigateToDashboard}">
                    Back to Route
                </vaadin-button>
                <div style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border: 5px;margin: 0 20px;margin-top: 10px">
                    <vaadin-horizontal-layout theme="spacing padding" style="margin-left: 20px;justify-content: space-between;align-items: center" >
                        <div style="display: flex;flex-direction: column">
                            <h2>
                                HaNoiCompany
                            </h2>
                            <h4>Route Code:2001</h4>
                        </div>
                        <div>
                            <vaadin-button style="background: #3a9f6f;color: white;margin-left: 20px;margin-top: 10px" @click="${this.navigateToDashboard}">
                                Report
                            </vaadin-button>
                            <vaadin-button style="background: #3a9f6f;color: white;margin-left: 20px;margin-top: 10px" @click="${this.navigateToDashboardEdit}">
                              Edit
                            </vaadin-button>
                            <vaadin-button style="background: #3a9f6f;color: white;margin-left: 20px;margin-top: 10px" @click="${this.navigateToDashboard}">
                               New profiles
                            </vaadin-button>
                        </div>
                    </vaadin-horizontal-layout>
                </div>
                <vaadin-tabsheet style="margin: 10px 20px">
                    <vaadin-tabs slot="tabs" style="background: white;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
                        <vaadin-tab id="overview-tab">OverView</vaadin-tab>
                        <vaadin-tab id="profiles-tab">Profiles</vaadin-tab>
                        <vaadin-tab id="devices-tab">Devices</vaadin-tab>
                        <vaadin-tab id="alert-tab">Alert</vaadin-tab>  
                        <vaadin-tab id="history-tab">History</vaadin-tab>
                    </vaadin-tabs>
                    <div tab="overview-tab">
                        <div style="margin-top: 10px">
                            <vaadin-text-field
                                    aria-label="search"
                                    placeholder="Search"
                                    clear-button-visible
                            >
                                <or-icon icon="magnify" slot="suffix"></or-icon>
                            </vaadin-text-field>
                            <vaadin-combo-box
                                    placeholder="All area"
                                    clear-button-visible
                                    item-label-path="label"
                                    item-value-path="value"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-combo-box
                                    placeholder="All status"
                                    clear-button-visible
                                    item-label-path="label"
                                    item-value-path="value"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-combo-box
                                    placeholder="All time"
                                    clear-button-visible
                                    item-label-path="label"
                                    item-value-path="value"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-card>
                                <p>
                                    Lapland is the northern-most region of Finland and an active outdoor destination that's
                                    known for its incredible, year-round light phenomena, vast arctic nature, and Santa Claus.
                                </p>
                                <p>
                                    The land of the indigenous Sámi people, known as Sámi homeland or Sápmi, also crosses the
                                    northern part of the region.
                                </p>
                            </vaadin-card>
                        </div>
                    </div>
                    <div tab="profiles-tab">
                    </div>
                    <div tab="devices-tab">This is the Shipping tab content</div>
                </vaadin-tabsheet>
            
           
        `;
    }
}
