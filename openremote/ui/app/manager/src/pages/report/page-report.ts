import {css, html} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import "@openremote/or-rules";
import {OrRules, RulesConfig} from  "@openremote/or-rules";
import {Store} from "@reduxjs/toolkit";
import {Page, PageProvider} from  "@openremote/or-app";
import {AppStateKeyed} from  "@openremote/or-app";
import manager from  "@openremote/core";
import {createSelector} from "reselect";
import i18next from "i18next";
import"@vaadin/app-layout/vaadin-drawer-toggle.js"
import "@vaadin/date-picker"
import "@vaadin/combo-box"
import"@vaadin/app-layout"
import"@vaadin/side-nav"
import "./report1"
import "./report2"
import"./report3"
import"./report6"
import"./report9/report9"
import  "@openremote/or-icon";

export interface PageRulesConfig {
    rules: RulesConfig;
}


export function pageReportProvider(store: Store<AppStateKeyed>, config?: PageReport): PageProvider<AppStateKeyed> {
    return {
        name: "report",
        routes: [
            "report",
            "report/:id"
        ],
        pageCreator: () => {
            const page = new PageReport(store);
            if (config) {
                page.config = config;
            }
            return page;
        }
    };
}


@customElement("page-report")
export class PageReport extends Page<AppStateKeyed>  {
    constructor(store: Store<AppStateKeyed>) {
        super(store);
        this.route = window.location.hash || '#/report';
        window.addEventListener('hashchange', this.updateRoute.bind(this));
    }
    static get styles() {
        // language=CSS
        return css`
            :host {
                display:inline-block !important;
            }
            or-rules {
                width: 100%;
                height: 100%;
            }
            vaadin-side-nav-item.active {
                border-left: 5px solid green;
                font-weight: bold;
            }
        `;
    }

    @property()
    public config?: PageReport;
    @property()
    public route?:{}

    @query("#rules")
    protected _orRules!: OrRules;

    protected _realmSelector = (state: AppStateKeyed) => state.app.realm || manager.displayRealm;

    protected getRealmState = createSelector(
        [this._realmSelector],
        async (realm) => {
            if (this._orRules) {
                this._orRules.refresh();
            }
        }
    )
    static properties = {
        route: { type: String }
    };


    get name(): string {
        return "report";
    }
    updateRoute() {
        this.route = window.location.hash || '#/report';
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    protected render() {
        console.log("aaa")
        let newText =  i18next.t("PeriodicElectricalCabinetCapacityReport").replace("của tủ điện theo kỳ", "").replace("Periodic electrical cabinet", "").trim();
        let newText2 =  i18next.t("ReportLampOperatingStatus").replace("hoạt động của đèn", "").replace("lamp operating", "").trim();
        return html`
            <vaadin-app-layout>
                <vaadin-scroller slot="drawer" class="p-s">
                    <section aria-labelledby="personal-title" style="padding-top: 71px;
    background: #4d9d2a;
    font-weight: 500;
    font-size: 16px;
    color:white;
    padding-bottom: 13px;padding-left: 18px">
                        ${i18next.t("Report")}
                    </section>
                    <vaadin-side-nav id="sideNav">
                        <vaadin-side-nav-item class="${this.route === '#/report/Dashboard' ? 'active' : ''}" @click="${() => this.navigateTo('/report/Dashboard')}">
                            ${i18next.t("dashBoardReport")}
                        </vaadin-side-nav-item>
                        <vaadin-side-nav-item class="${this.route === '#/report/ReportLampOperatingStatus' ? 'active' : ''}" @click="${() => this.navigateTo('/report/ReportLampOperatingStatus')}">
                            ${newText2}
                        </vaadin-side-nav-item>
                        <vaadin-side-nav-item class="${this.route === '#/report/EnergyReport' ? 'active' : ''}" @click="${() => this.navigateTo('/report/EnergyReport')}">
                            ${i18next.t("Energy Report")}
                        </vaadin-side-nav-item>

                    </vaadin-side-nav>
                </vaadin-scroller>
                <main>
                    <div class="tab">
                        ${this.route === '#/report/lightingReport' ? html`<lighting-report></lighting-report>` : ''}
                    </div>
                    ${this.route === '#/report/ReportLampOperatingStatus' ? html`<reportlampoperating-status></reportlampoperating-status>` : ''}
                    ${this.route === '#/report/Reportonlightingperformanceandefficiencybyperiod' ? html`<reportonlightingperformanceandefficiencyby-period></reportonlightingperformanceandefficiencyby-period>` : ''}
                    ${this.route === '#/report/Dashboard' ? html`<chartbycabinet-date></chartbycabinet-date>` : ''}
                    ${this.route === '#/report/EnergyReport' ? html`<energy-performance-report></energy-performance-report>` : ''}

                </main>
            </vaadin-app-layout>
           
        `;
    }

    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state);
    }
}
