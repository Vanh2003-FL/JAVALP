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
import "@vaadin/date-picker"
export function pageScenarioProvider(store: Store<AppStateKeyed>, config?: ScenarioHome): PageProvider<AppStateKeyed> {
    return {
        name: "scenario",
        routes: [
            "scenario",
            "scenario/:id"
        ],
        pageCreator: () => {
            const page = new ScenarioHome(store);
            if (config) {
                page.config = config;
            }
            return page;
        }
    };
}


@customElement("scenario-home")
export class ScenarioHome extends Page<AppStateKeyed>  {
    static get styles() {
        // language=CSS
        return css`
            :host {
                display:inline-block !important;
                font-family: Roboto;
            }
        `;
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
        this.route = window.location.hash || '#/scenario';
        window.addEventListener('hashchange', this.updateRoute.bind(this));
    }
    updateRoute() {
        this.route = window.location.hash || '#/scenario';
    }
    navigateToCreate() {
        window.location.hash = '/scenario/create';
    }
    @property()
    public config?: ScenarioHome;
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
        return "scenario";
    }
    navigateTo(path) {
        window.location.hash = path;
    }
    protected render() {
        return html`
         <div>
             
         </div>
        `;
    }
    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state);
    }
}
