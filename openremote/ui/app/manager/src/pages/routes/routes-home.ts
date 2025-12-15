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
import"./routes-info"
import"./routes-edit"
import"./routes-create"
import '@vaadin/dialog';
import "./lightColumn-create"
import "./routes-devices"

import { dialogRenderer, dialogFooterRenderer } from '@vaadin/dialog/lit.js';
import { i18next } from "@openremote/or-translate";
export function pageRoutesProvider(store: Store<AppStateKeyed>, config?: RoutesHome): PageProvider<AppStateKeyed> {
    return {
        name: "routes",
        routes: [
            "routes",
            "routes/:id",
            "routes/info",
            "routes/info/:id",
            "routes/info/overview",
            "routes/info/overview/:id",
            "routes/info/device",
            "routes/info/device/:id",
            "routes/info/lightColum",
            "routes/info/lightColum/:id",
            "routes/info/lightColum/create"
        ],
        pageCreator: () => {
            const page = new RoutesHome(store);
            if (config) {
                page.config = config;
            }
            return page;
        }
    };
}


@customElement("routes-home")
export class RoutesHome extends Page<AppStateKeyed>  {
    @state() searchQuery = ""
    @state() dialogOpened = false
    @state() itemsStatus = [
        { id: "A", name: 'Hoạt động' },
        { id: "M", name: 'Bảo trì' },
        { id: "P", name: 'Dừng hoạt động' }
    ];
    @state() itemsRealm = [

    ];


    @state() currentPage :any =1
    @state() totalPage :any =1
    @state() listData:any = []
    static get styles() {
        // language=CSS
        return css`
            :host {
                display:inline-block !important;
            }
            vaadin-notification::part(overlay) {
                background: transparent;
                box-shadow: none;
                padding: 0;
                border-radius: 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            th, td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #4d9d2a;
                text-align: center;
                color: white;
            }
            tr{
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
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
        this.route = window.location.hash || '#/routes';
        window.addEventListener('hashchange', this.updateRoute.bind(this));
    }
    updateRoute() {
        this.route = window.location.hash || '#/routes';
    }
    navigateToCreate() {
        window.location.hash = '/routes/create';
    }
    @property()
    public config?: RoutesHome;
    @property()
    public route?:any
    @state() items = [
        { id: 1, name: 'John Doe', email: 'john@example.com', email2: 'Active', email3: 'Admin', email45: '2024-03-14', email6: 'Edit' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', email2: 'Inactive', email3: 'User', email45: '2024-03-13', email6: 'Edit' }
    ];
    @state() items2 = [
        { id: '1', label: 'Root', children: [
                { id: '1-1', label: 'Child 1' },
                { id: '1-2', label: 'Child 2' }
            ]},
        { id: '2', label: 'Root 2', children: [
                { id: '2-1', label: 'Child 1' }
            ]}
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
        return "routes";
    }
    navigateTo(path) {
        window.location.hash = path;
    }

    async fetchUsers(page) {
        manager.rest.api.RouteInfoResource.getAll({keyWord:this.searchQuery,page,size:5,data:{realm:this.realmSelected,status:this.status}})
            .then((response:any) => {
                this.listData = response.data;
                console.log('getAll', response)
            })
            .catch((error) => {
                if (error?.response?.status === 403) {
                    this.showWarningNotification("Bạn không có quyền xem")
                } else {
                    console.error('Lỗi khi gửi request:', error.message);
                }
            });
        manager.rest.api.RouteInfoResource.countData({keyWord:this.searchQuery,data:{realm:this.realmSelected,status:this.status}})
            .then((response) => {
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.RealmResource.getAll()
            .then((response) => {
                this.itemsRealm = response.data
                console.log('getRealm', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }
    firstUpdated(){
        this.fetchUsers(this.currentPage)
    }
    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.fetchUsers(page);
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
    _onSearchQueryChanged(event) {
        this.searchQuery = event.target.value
    }
    handleSearch(){
        this.currentPage = 1
        console.log('this.realmSelected',this.realmSelected)
        this.fetchUsers(this.currentPage)
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
    @state() status;
    @state() realmSelected = sessionStorage.getItem('realm');
    @state() selectDialog;
    handleChangeStatus(event){
        this.status = event.target.value
    }
    handleChangeRealm(event){
        console.log('event',event.target.value)
        this.realmSelected = event.target.value
    }
    // handleDelete(item) {
    //     console.log('item',item)
    //     this.currentPage = 1
    //     manager.rest.api.RouteInfoResource.remove({id:item.id})
    //         .then((response) => {
    //             console.log('roadSetupSearch', response)
    //             this.fetchUsers(this.currentPage)
    //         })
    //         .catch((error) => {
    //             console.error('Lỗi khi lấy dữ liệu:', error);
    //         });
    //     this.close();
    // }

    openDeleteDialog(user) {
        console.log('user',user)
        this.isDeleteDialogOpen = true;
        this.selectDialog = user
    }
    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.currentPage = 1
            this.fetchUsers(this.currentPage)
        }
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('session-changed', this._onSessionChanged);
        window.addEventListener('data-updated', (e: CustomEvent) => {
            console.log('this.realmSelected', window.sessionStorage.getItem('realm'))
            this.realmSelected = window.sessionStorage.getItem('realm')
            this.status = undefined
            this.fetchUsers(1);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }

    _onSessionChanged = (e: CustomEvent) => {
        const { key, value } = e.detail;
        if (key === 'realm') {
            this.currentPage = 1;
            this.realmSelected = value;
            this.fetchUsers(this.currentPage);
        }
    }
    handleOpenedChanged(e: CustomEvent) {
        console.log('ads',e.detail.value)
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
    cancelDelete() {
        this.isDeleteDialogOpen = false;

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

    confirmDelete() {
        console.log('select',this.selectDialog)
        manager.rest.api.RouteInfoResource.remove({id:this.selectDialog.id})
            .then((response) => {
                this.currentPage = 1
                this.fetchUsers(1)
                this.showCustomNotification('Xóa lộ tuyến thành công')
            })
            .catch((error) => {
                if (error?.response?.status === 403) {
                    this.showWarningNotification("Bạn không có quyền xóa")
                } else {
                    console.error('Lỗi khi gửi request:', error.message);
                }
            });
        this.isDeleteDialogOpen = false;

    }
    @state() private isDeleteDialogOpen = false;
    protected render() {
        const hashParts = this.route.split('/');
        const activeTab = this.route.includes('/info/device') ? 'device' :
            this.route.includes('/info/lightColum') ? 'lightColum' :
                this.route.includes('/info') ? 'overview' : '';
        const routeId = hashParts[hashParts.length - 1] && !['overview', 'device', 'lightColum'].includes(hashParts[hashParts.length - 1])
            ? hashParts[hashParts.length - 1] : '';
        return html`
            <vaadin-notification  id="myNotification" duration="3000" position="bottom-end"></vaadin-notification>
            ${this.route === '#/routes/create' ? html`<routes-create></routes-create>` : ''}
            ${this.route === '#/routes/edit' ? html`<routes-edit></routes-edit>` : ''}
            ${this.route.startsWith('#/routes/info')  ? html`<routes-info .activeTab="${activeTab}" .routeId="${routeId}"></routes-info>` : ''}
            ${this.route === '#/routes' ? html`
                  <vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpen}" @opened-changed="${this.handleOpenedChanged}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Xác nhận</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <p style="padding: 0">Bạn có chắc chắn muốn xóa <span style="font-weight: bold">${this.selectDialog?.routeName}</span>  này?</p>

                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDelete}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Xóa</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
                <div>
                    <div style="display: flex;justify-content: space-between;align-items: center;margin-top: 20px;padding: 0 20px">
                        <h1 style="margin: 0">
                            <or-translate value="Routes Management"></or-translate>
                        </h1>
                        <vaadin-button style="background: #4D9D2A;color: white;" @click="${this.navigateToCreate}">
                            <or-icon icon="plus" slot="prefix"></or-icon>
                            <or-translate value="Create new routes"></or-translate>
                        </vaadin-button>
                    </div>
                    <div style="background: white;margin: 10px 20px;padding: 10px 0px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px">
                        <vaadin-horizontal-layout theme="spacing padding" style="flex-wrap: wrap">
                            <vaadin-text-field
                                    @keyup=${this.onKeyUp}
                                    placeholder="${i18next.t("SearchRoute")}"
                                    clear-button-visible
                                    @value-changed="${this._onSearchQueryChanged}"
                            >
                            </vaadin-text-field>
                            <!-- 
                             <vaadin-combo-box
                                    placeholder="${i18next.t("Realm")}"
                                    clear-button-visible
                                    .items="${this.itemsRealm}"
                                    @change="${this.handleChangeRealm}"
                                    item-label-path="displayName"
                                    item-value-path="name"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            !-->
                            <vaadin-combo-box
                                    clear-button-visible
                                    placeholder="${i18next.t("All status")}"
                                    .items="${this.itemsStatus}"
                                    item-label-path="name"
                                    item-value-path="id"
                                    @change="${this.handleChangeStatus}"></vaadin-combo-box>
                            <!--                        <vaadin-date-picker placeholder="Thời gian"></vaadin-date-picker>-->
                            <vaadin-button style="background: #4D9D2A;color: white;" @click="${this.handleSearch}">
                                <or-icon icon="search" slot="prefix"></or-icon>
                                ${i18next.t("Search")}
                            </vaadin-button>
                        </vaadin-horizontal-layout>
                    </div>
                    <div style="margin:20px 20px">
                        <table>
                            <thead>
                            <tr>
                                <th>${i18next.t("Routes Code")}</th>
                                <th>${i18next.t("Routes Name")}</th>
                                <th><or-translate value="Realm"></th>
                                <th><or-translate value="Status"></th>
                                <th>${i18next.t("updateDate")}</th>
                                <th><or-translate value="Action"></th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.listData?.length !== 0 ? this.listData?.map(item => {
                                return html`
                                    <tr>
                                        <td>${item?.routeInfo?.routeCode}
                                        </td>
                                        <td>${item?.routeInfo?.routeName}
                                        </td>
                                        <td>${item?.routeInfo?.realm}</td>
                                        <td><span
                                                style="${item?.routeInfo?.status == 'A'
                                                        ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: #4d9d2a;color: white'
                                                        : item?.routeInfo?.status == 'M'
                                                                ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: #d48806;color: white'
                                                                : 'display: inline-block;padding:5px 10px;border-radius: 10px;background: red;color: white'}"> ${item?.routeInfo?.status == 'A' ? 'Hoạt động' : item?.routeInfo?.status == 'M' ? 'Bảo trì' : 'Dừng hoạt động'}</span>
                                        </td>
                                        <td>${this.formatDate(item?.routeInfo?.updateDate)}</td>
                                        <td>
                                            <vaadin-icon icon="vaadin:eye" style="color:black; cursor: pointer"  @click="${() => {
                                                console.log('Item:', item); // Log dữ liệu của từng item
                                                localStorage.setItem('selectedRow', JSON.stringify(item));
                                                this.navigateTo(`/routes/info/${item.routeInfo.id}`);
                                            }}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:pencil" style="color: black;cursor: pointer;margin: 0 5px"   @click="${() => {
                                                console.log('Item:', item); // Log dữ liệu của từng item
                                                localStorage.setItem('selectedRowEdit', JSON.stringify(item));
                                                this.navigateTo('/routes/edit')
                                            }}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:trash" style="color: black;cursor: pointer"
                                                         @click="${() => this.openDeleteDialog(item?.routeInfo)}"></vaadin-icon>
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
                        ${this.renderPagination()}
                    </div>
                </div>` : ''}
        `;
    }
    public stateChanged(state: AppStateKeyed) {
        this.getRealmState(state);
    }
}
