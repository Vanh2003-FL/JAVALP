import {css, html} from "lit";
import {customElement, property} from "lit/decorators.js";
import "@openremote/or-log-viewer";
import {ViewerConfig} from "@openremote/or-log-viewer";
import {Page, PageProvider} from "@openremote/or-app";
import {AppStateKeyed} from "@openremote/or-app";
import {Store} from "@reduxjs/toolkit";
import "./page-log-mail"
import "./page-firmware"
export interface PageLogsConfig {
    viewer?: ViewerConfig
}

export function pageLogsProvider(store: Store<AppStateKeyed>, config?: PageLogsConfig): PageProvider<AppStateKeyed> {
    return {
        name: "logs",
        routes: [
            "logs"
        ],
        pageCreator: () => {
            const page = new PageLogs(store);
            if(config) page.config = config;
            return page;
        }
    };
}

@customElement("page-logs")
export class PageLogs extends Page<AppStateKeyed> {

    static get styles() {
        // language=CSS
        return css`
            :host {
                flex: 1;
                width: 100%;            
            }
            
            or-log-viewer {
                width: 100%;
            }
            page-log-mail{
                width: 100%;
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
        `;
    }

    @property()
    public config?: PageLogsConfig;

    get name(): string {
        return "logs";
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
    }

    public stateChanged(state: AppStateKeyed) {
    }

    protected render() {
        return html`
            <vaadin-tabsheet style="width: 100%">
                <vaadin-tabs slot="tabs">
                    <vaadin-tab id="log-tab">Logs</vaadin-tab>
                    <vaadin-tab id="email-tab">Email Log</vaadin-tab>
                    <vaadin-tab id="firmware-tab">Quản lý firmWare</vaadin-tab>
                </vaadin-tabs>
                <div tab="log-tab">
                    <or-log-viewer .config="${this.config?.viewer}"></or-log-viewer>
                </div>
                <div tab="email-tab">
                    <page-log-mail></page-log-mail>
                </div>
                <div tab="firmware-tab">
                    <page-firmware></page-firmware>
                </div>
            </vaadin-tabsheet>
           
        `;
    }
}
