import {css, html} from "lit";
import {customElement, property, query,state} from "lit/decorators.js";
import "@openremote/or-rules";
import {OrRules, RulesConfig} from "@openremote/or-rules";
import {Store} from "@reduxjs/toolkit";
import {Page, PageProvider} from "@openremote/or-app";
import {AppStateKeyed} from "@openremote/or-app";
import manager from "@openremote/core";
import {createSelector} from "reselect";
import "@vaadin/combo-box"
import "@openremote/or-icon";
import "@vaadin/horizontal-layout"
import"./dashboard-info"
import"./dashboard-edit"
export function pageDashboardProvider(store: Store<AppStateKeyed>, config?: PageHomeDashBoard): PageProvider<AppStateKeyed> {
    return {
        name: "dashBoard2",
        routes: [
            "dashBoard2",
            "dashBoard2/:id"
        ],
        pageCreator: () => {
            const page = new PageHomeDashBoard(store);
            if (config) {
                page.config = config;
            }
            return page;
        }
    };
}


@customElement("page-home-dashboard")
export class PageHomeDashBoard extends Page<AppStateKeyed>  {
    static get styles() {
        // language=CSS
        return css`
            :host {
                display:inline-block !important;
                font-family: Roboto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #4d9d2a;
                color: white;
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
                border-radius: 4px;
                color: #666;
                border: 1px solid #ddd;
            }
            .pagination a.active {
                background-color: #4CAF50;
                color: white;
                border: 1px solid #4CAF50;
            }
            .pagination a:hover {
                background-color: #f1f1f1;
            }
        `;
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
        this.route = window.location.hash || '#/dashBoard2';
        window.addEventListener('hashchange', this.updateRoute.bind(this));
    }
    updateRoute() {
        this.route = window.location.hash || '#/dashBoard2';
    }
    @property()
    public config?: PageHomeDashBoard;
    @property()
    public route?:{}
    @state() items = [
        { id: 1, name: 'John Doe', email: 'john@example.com', email2: 'Active', email3: 'Admin', email45: '2024-03-14', email6: 'Edit' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', email2: 'Inactive', email3: 'User', email45: '2024-03-13', email6: 'Edit' }
    ];

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
        return "dashBoard2";
    }
    navigateTo(path) {
        window.location.hash = path;
    }
    protected render() {
        return html`
            
           
              ${this.route === '#/dashBoard2/info' ? html`<dashboard-info></dashboard-info>` : ''}
            ${this.route === '#/dashBoard2/edit' ? html`<dashboard-edit></dashboard-edit>` : ''}
            ${this.route === '#/dashBoard2' ? html`<div>
                <div style="display: flex;justify-content: space-between;align-items: center;margin-top: 20px;padding: 0 20px">
                    <h1 style="margin: 0">Routes Management</h1>
                    <vaadin-button style="background: #4d9d2a;color: white;">
                        <or-icon icon="plus" slot="prefix"></or-icon>
                        Create new routes
                    </vaadin-button>
                </div>
                <div style="background: white;margin: 10px 20px;padding: 10px 0px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px">
                    <vaadin-horizontal-layout theme="spacing padding">
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
                    </vaadin-horizontal-layout>
                </div>
                <div style="margin:20px 20px">
                    <table>
                        <thead>
                        <tr>
                            <th>Route Code</th>
                            <th>Route Name</th>
                            <th>Area</th>
                            <th>Status</th>
                            <th>Profiles</th>
                            <th>Last Update</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.items.map(item => html`
                            <tr @click="${() => this.navigateTo('/dashBoard2/info')}">
                                <td>${item.id}</td>
                                <td>${item.name}</td>
                                <td>${item.name}</td>
                                <td>${item.name}</td>
                                <td>${item.name}</td>
                                <td>${item.name}</td>
                                <td>${item.name}</td>
                            </tr>
                        `)}
                        </tbody>
                    </table>
                    <ul class="pagination">
                        <li><a href="#">&laquo;</a></li>
                        <li><a class="active" href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">...</a></li>
                        <li><a href="#">10</a></li>
                        <li><a href="#">&raquo;</a></li>
                    </ul>
                </div>
            </div>` : ''} 
          
          
        `;
    }

    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state);
    }
}
