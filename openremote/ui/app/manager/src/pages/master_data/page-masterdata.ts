    import { css, html } from "lit";
    import { customElement, property } from "lit/decorators.js";
    import { Store } from "@reduxjs/toolkit";
    import { AppStateKeyed, Page, PageProvider } from "@openremote/or-app";
    import i18next from "i18next";
    import "@vaadin/button";
    import "@vaadin/text-field";
    import "@vaadin/grid";
    import "@vaadin/dialog";
    import "@vaadin/icon";
    import "./page1";
    import "./page2";
    import "./page4";
    import "./page5";
    import "./page6";
    import "./province/province-create";
    import "./province/province-edit";
    import "./district/district-create"
    import "./district/district-edit"
    import "./ward/ward-create";
    import "./ward/ward-edit"
    import "./supplier/supplier-create";
    import "./supplier/supplier-edit";
    import "./lamptype/lamptype-create";
    import "./lamptype/lamptype-edit";
    export function pageMasterData(store: Store<AppStateKeyed>, config?: PageMasterData): PageProvider<AppStateKeyed> {
        return {
            name: "masterData",
            routes: [
                "master-data",
                "master-data/:id",
                "master-data/:page/:id"
            ],
            pageCreator: () => new PageMasterData(store),
        };
    }

    @customElement("page-master-data")
    export class PageMasterData extends Page<AppStateKeyed> {
        constructor(store: Store<AppStateKeyed>) {
            super(store);
            this.route = window.location.hash || '#/master-data';
            window.addEventListener('hashchange', this.updateRoute.bind(this));
        }

        @property({ type: String }) // Specify the type as String
        public route?: string; // Change the type to string
        @property({ type: Array })
        public provinces: Array<{ id: string; name: string; status: string; createdBy: string; createdDate: string }> = [];

        get name(): string {
            return "master-data";
        }

        stateChanged(state: AppStateKeyed): void {
            // Handle state changes if necessary
        }

        static get styles() {
            return css`
                :host {
                    display: inline-block !important;
                }
                .active {
                    border-left: 5px solid green;
                    font-weight: bold;
                }
                #side-bar-title {
                    margin: 0px;
                }
            `;
        }

        updateRoute() {
            this.route = window.location.hash || '#/master-data';
            this.requestUpdate();
        }

        navigateTo(path: string) {
            window.location.hash = path;
        }

        render() {

            const routeParts = this.route?.split('/') || [];
            const isDistrictEdit = this.route?.startsWith('#/master-data/district-edit');
            const districtParams = isDistrictEdit ? this.getDistrictParams() : null;
            return html`
                <vaadin-app-layout>
                    <vaadin-scroller slot="drawer">
                        <section aria-labelledby="personal-title" style="background: #4d9d2a; font-weight: 500; font-size: 16px; color: white; padding-top: 71px">
                            <h3 id="side-bar-title" style="padding: 0px 0px 13px 18px">${i18next.t("MasterData")}</h3>
                        </section>
                        <vaadin-side-nav style="width:100%" id="sideNav">
                            <vaadin-side-nav-item class="${this.route === '#/master-data/masterDataPage1' ? 'active' : ''}" @click="${() => this.navigateTo('/master-data/masterDataPage1')}">
                                <or-translate value="Province"></or-translate>
                            </vaadin-side-nav-item>
                            <vaadin-side-nav-item class="${this.route === '#/master-data/masterDataPage2' ? 'active' : ''}" @click="${() => this.navigateTo('/master-data/masterDataPage2')}">
                                <or-translate value="District"></or-translate>
                            </vaadin-side-nav-item>
                            <vaadin-side-nav-item class="${this.route === '#/master-data/masterDataPage4' ? 'active' : ''}" @click="${() => this.navigateTo('/master-data/masterDataPage4')}">
                                <or-translate value="Ward"></or-translate>
                            </vaadin-side-nav-item>
                            <vaadin-side-nav-item class="${this.route === '#/master-data/masterDataPage5' ? 'active' : ''}" @click="${() => this.navigateTo('/master-data/masterDataPage5')}">
                                <or-translate value="Supplier"></or-translate>
                            </vaadin-side-nav-item>
                            <vaadin-side-nav-item class="${this.route === '#/master-data/masterDataPage6' ? 'active' : ''}" @click="${() => this.navigateTo('/master-data/masterDataPage6')}">
                                <or-translate value="Lamp type"></or-translate>
                            </vaadin-side-nav-item>
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <main>
                        <div class="tab">
                            ${this.route === '#/master-data/masterDataPage1' ? html`<master-data-page1></master-data-page1>` : ''}
                            ${this.route === '#/master-data/masterDataPage2' ? html`<master-data-page2></master-data-page2>` : ''}
                            ${this.route === '#/master-data/masterDataPage4' ? html`<master-data-page4></master-data-page4>` : ''}
                            ${this.route === '#/master-data/masterDataPage5' ? html`<master-data-page5></master-data-page5>` : ''}
                            ${this.route === '#/master-data/masterDataPage6' ? html`<master-data-page6></master-data-page6>` : ''}
                            ${this.route === '#/master-data/ward-create' ? html`<ward-create></ward-create>` : ''}
                            ${this.route.startsWith('#/master-data/ward-edit') ? html`<ward-edit .editedWard="${this.getEditedWardData()}"></ward-edit>` : ''}
                            ${this.route === '#/master-data/supplier-create' ? html`<supplier-create></supplier-create>` : ''}
                            ${this.route.startsWith('#/master-data/supplier-edit') ? html`<supplier-edit .editedSupplier="${this.getEditedSupplierData()}"></supplier-edit>` : ''}
                            ${this.route === '#/master-data/lamptype-create' ? html`<lamptype-create></lamptype-create>` : ''}
                            ${this.route.startsWith('#/master-data/lamptype-edit') ? html`<lamptype-edit .editedlamptype="${this.getEditedLamtypeData()}"></lamptype-edit>` : ''}
                            ${this.route === '#/master-data/province-create' ? html`<province-create></province-create>` : ''}
                            ${this.route === '#/master-data/district-create' ? html`<district-create></district-create>` : ''}
                            ${isDistrictEdit && districtParams ? html`<district-edit .district="${districtParams}"></district-edit>` : ''}
                            ${this.route.startsWith('#/master-data/province-edit') ? html`<province-edit .editedProvince="${this.getEditedProvinceData()}"></province-edit>` : ''}
                        </div>
                    </main>
                    
                    
                </vaadin-app-layout>
            `;
        }

        getDistrictParams() {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            return {
                id: params.get('id') || "",
                name: params.get('name') || "",
                district: params.get('district') || "",
                status: params.get('status') || "",
                createdBy: params.get('createdBy') || "",
                createdDate: params.get('createdDate') || ""
            };
        }
        getEditedProvinceData() {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            return {
                id: params.get('id') || "",
                name: params.get('name') || "",
                status: params.get('status') || "",
                createdBy: params.get('createdBy') || "",
                createdDate: params.get('createdDate') || ""
            };
        }

        getEditedWardData() {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            return {
                id: params.get('id') || "",
                name: params.get('name') || "",
                status: params.get('status') || "",
                createdBy: params.get('createdBy') || "",
                createdDate: params.get('createdDate') || ""
            };
        }
        getEditedSupplierData() {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            return {
                id: params.get('id') || "",
                name: params.get('name') || "",
                status: params.get('status') === "Hoạt động" ? "1" : "0", // Thêm chuyển đổi trạng thái
                createdBy: params.get('createdBy') || "",
                createdDate: params.get('createdDate') || "",
                // Thêm các trường khác nếu cần
            };
        }
        getEditedLamtypeData() {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            return {
                id: params.get('id') || "",
                name: params.get('name') || "",
                status: params.get('status') === "Hoạt động" ? "1" : "0", // Thêm chuyển đổi trạng thái
                createdBy: params.get('createdBy') || "",
                createdDate: params.get('createdDate') || "",
                // Thêm các trường khác nếu cần
            };
        }
    }
