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
import "@vaadin/dialog"
import "@openremote/or-icon";
import "@vaadin/horizontal-layout"
import "./cabinets-info"
import "./cabinets-edit"
import "@vaadin/dialog"
import "./cabinets-create"
import {i18next} from "@openremote/or-translate"
export function pageCabinetsProvider(store: Store<AppStateKeyed>, config?: PageHomeCabinets): PageProvider<AppStateKeyed> {
    return {
        name: "cabinets",
        routes: [
            "cabinets",
            "cabinets/:id"
        ],
        pageCreator: () => {
            const page = new PageHomeCabinets(store);
            if (config) {
                page.config = config;
            }
            return page;
        }
    };
}


@customElement("page-home-cabinets")
export class PageHomeCabinets extends Page<AppStateKeyed>  {
    @state() private isDeleteDialogOpen = false;
    static get styles() {
        // language=CSS
        return css`
            :host {
                display: block !important;
              box-sizing: border-box;
                
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
        this.route = window.location.hash || '#/cabinets';
        window.addEventListener('hashchange', this.updateRoute.bind(this));
    }
    updateRoute() {
        this.route = window.location.hash || '#/cabinets';
    }
    @property()
    public config?: PageHomeCabinets;
    @property()
    public route?:{}
    @state() items = [
        { id: 1, cabinetCode: 'Mã tủ 1', cabinetName: 'Tên tủ 1', type: 'Tủ', location: 'Hà Nội', status: 'Hoạt động', action: 'Edit' },
        { id: 2, cabinetCode: 'Mã tủ 2', cabinetName: 'Tên tủ 2', type: 'Tủ', location: 'Thanh Hóa', status: 'Hoạt động', action: 'Edit' },
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
        return "cabinets";
    }
    navigateTo(path) {
        window.location.hash = path;
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
    async fetchUsers(page) {
        // manager.rest.api.UserResource.getCurrent()
        //     .then((response) => {
        //         this.realmSelected = response.data.realm
        //         console.log('roadSetup2', response)
        //     })
        //     .catch((error) => {
        //         console.error('Lỗi khi lấy dữ liệu:', error);
        //     });
        console.log('this.reale',this.realmSelected)
        manager.rest.api.CabinetResource.getAll({keyWord:this.searchQuery,page,size:5,data:{assetInfo:{status:this.status},cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"},routeInfo:{id:this.routeSelected}}})
            .then((response) => {
                this.listData = response.data;
                console.log('getAllCabinets', response)
            })
            .catch((error) => {
                if (error?.response?.status === 403) {
                    this.showWarningNotification("Bạn không có quyền xem")
                } else {
                    console.error('Lỗi khi gửi request:', error.message);
                }
            });
        manager.rest.api.CabinetResource.countData({keyWord:this.searchQuery,data:{assetInfo:{status:this.status},cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"},routeInfo:{id:this.routeSelected}}})
            .then((response) => {
                console.log('countData',response.data)
                this.totalPage = Math.ceil(response.data / 5);
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.RealmResource.getAll()
            .then((response) => {
                // this.itemsRealm = response.data
                console.log('getRealm', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.requestUpdate();
    }
    @state() dataRoute = []
    firstUpdated(){
        this.fetchUsers(this.currentPage)
        manager.rest.api.RealmResource.getAll()
            .then((response) => {
                this.itemsRealm = response.data
                console.log('getRealm', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.RouteInfoResource.getAll({data:{realm:window.sessionStorage.getItem('realm')}})
            .then((response) => {
                const routeInfos = response.data.map(item => item.routeInfo);
                this.dataRoute = routeInfos
                console.log('getAllRoute', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });

    }
    @state() searchQuery = ""
    @state() currentPage :any =1
    @state() totalPage :any =1
    @state() listData = []
    _onSearchQueryChanged(event) {
        this.searchQuery = event.target.value
    }
    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.realmSelected = sessionStorage.getItem('realm')
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
    handleSearch(){
        this.currentPage = 1
        // this.realmSelected = sessionStorage.getItem('realm')
        this.fetchUsers(this.currentPage)
    }
    @state() status;
    @state() itemsStatus = [
        { id: "A", name: 'Hoạt động' },
        { id: "M", name: 'Bảo trì' },
        { id: "P", name: 'Dừng hoạt động' }
    ];
    handleChangeStatus(event){
        this.status = event.target.value
    }
    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.currentPage = 1
            this.fetchUsers(this.currentPage)
        }
    }
    @state() itemsRealm = [

    ];
    @state() realmSelected = sessionStorage.getItem('realm');
    @state() routeSelected;
    handleChangeRealm(event){
        console.log('event',event.target.value)
        this.realmSelected = event.target.value
    }
    handleChangeRoute(event){
        console.log('event',event.target.value)
        this.routeSelected = event.target.value
    }
    @state() idDelete
    openDeleteDialog(itemId) {
        console.log('itemId',itemId)
        this.idDelete = itemId
        this.isDeleteDialogOpen = true;
    }

    cancelDelete() {
        this.isDeleteDialogOpen = false;

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
        console.log('idDelete',this.idDelete)
        manager.rest.api.CabinetResource.remove({id:this.idDelete?.cabinetAsset.id,type:"ElectricalCabinetAsset"})
            .then((response) => {
                this.realmSelected = sessionStorage.getItem('realm')
                this.fetchUsers(1)
                this.showCustomNotification('Xóa tủ điện thành công')
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
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('session-changed', this._onSessionChanged);
        window.addEventListener('data-updated', (e: CustomEvent) => {
            this.realmSelected = window.sessionStorage.getItem('realm')
            this.fetchUsers(1);
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }
    _onSessionChanged = (e) => {
        const { key, value } = e.detail;
        if (key === 'realm') {
            this.currentPage =1
            this.realmSelected = value;
            this.fetchUsers(this.currentPage); // gọi lại API
            manager.rest.api.RouteInfoResource.getAll({data:{realm:value}})
                .then((response) => {
                    const routeInfos = response.data.map(item => item.routeInfo);
                    this.dataRoute = routeInfos
                    console.log('getAllRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
    }

    protected render() {
        return html`
            ${this.route === '#/cabinets/create' ? html`<cabinets-create></cabinets-create>` : ''}
              ${this.route === '#/cabinets/info' ? html`<cabinet-info></cabinet-info>` : ''}
            ${this.route === '#/cabinets/edit' ? html`<cabinets-edit></cabinets-edit>` : ''}
            ${this.route === '#/cabinets' ? html`<div>
                <vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpen}" @opened-changed="${this.handleOpenedChanged}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Xác nhận</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <p style="padding: 0">Bạn có chắc chắn muốn xóa <span style="font-weight: bold">${this.idDelete?.cabinetAsset?.name}</span>  này?</p>
                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDelete}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Xóa</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
                <div style="display: flex;justify-content: space-between;align-items: center;margin-top: 20px;padding: 0 20px">
                    <h1 style="margin: 0"><or-translate value="${i18next.t("Cabinets Management")}"></or-translate></h1>
                    <vaadin-button style="background: #4d9d2a;color: white;" @click="${() => this.navigateTo('/cabinets/create')}">
                        <or-icon icon="plus" slot="prefix"></or-icon>
                        <or-translate value="${i18next.t("Create new cabinet")}"></or-translate>
                    </vaadin-button>
                </div>
                <div style="background: white;margin: 10px 20px;padding: 10px 0px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px">
                    <vaadin-horizontal-layout theme="spacing padding" style="justify-content: space-between;flex-wrap: wrap">
                        <div style="display: flex;flex-wrap: wrap;gap:12px">
                            <vaadin-text-field
                                    @keyup=${this.onKeyUp}
                                    aria-label="search"
                                    placeholder="${i18next.t("SearchCabinet")}"
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
                                    placeholder="Lộ/Tuyến"
                                    clear-button-visible
                                    .items="${this.dataRoute}"
                                    @change="${this.handleChangeRoute}"
                                    item-label-path="routeName"
                                    item-value-path="id"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-combo-box
                                    .items="${this.itemsStatus}"
                                    placeholder="${i18next.t("Status")}"
                                    clear-button-visible
                                    item-label-path="name"
                                    item-value-path="id"
                                    @change="${this.handleChangeStatus}"
                                    style="width: 150px;"
                            ></vaadin-combo-box>
                            <vaadin-button style="background: #4d9d2a;color: white;margin-right: 10px" @click="${this.handleSearch}">
                                Tìm kiếm
                            </vaadin-button>
                        </div>
                    </vaadin-horizontal-layout>
                </div>
                <div style="margin:20px 20px">
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th><or-translate value="Cabinet Code"></or-translate></th>
                            <th><or-translate value="Cabinet Name"></or-translate></th>
                            <th>Tên Lộ/Tuyến</th>
                            <th><or-translate value="Realm"></th>
                            <th><or-translate value="Status"></th>
                            <th><or-translate value="Action"></th>
                        </tr>
                        </thead>
                        <tbody>
                        ${ this.listData.length !== 0 ? this.listData.map((item, index) => {
                            const rowNumber = (this.currentPage - 1) * 5 + index + 1
                            return html`
    <tr>
      <td>${rowNumber}</td>
      <td>${item.assetInfo.assetCode}</td>
      <td>${item.cabinetAsset.name}</td>
      <td>${item.routeInfo?.routeName}</td>
      <td>${item.cabinetAsset.realm}</td>
      <td>
        <span
          style="${item.assetInfo.status == 'A'
                  ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: #4d9d2a;color: white'
                  : item.assetInfo.status == 'M'
                          ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: #d48806;color: white'
                          : item.assetInfo.status == 'P'
                                  ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: red;color: white'
                                  : item.assetInfo.status == 'D'
                                          ? 'display: inline-block;padding:5px 10px;border-radius: 10px;background: red;color: white'
                                          : ''}"
        >
         ${item.assetInfo.status == 'A'
                 ? 'Hoạt động'
                 : item.assetInfo.status == 'M'
                         ? 'Bảo trì'
                         : item.assetInfo.status == 'P'
                                 ? 'Dừng hoạt động'
                                 : item.assetInfo.status == 'D'
                                         ? 'Mất kết nối'
                                         : ''}
        </span>
      </td>
      <td>
          <vaadin-icon icon="vaadin:eye" style="color: black; cursor: pointer"    @click="${() => {
              console.log('Item clicked:', item);
              localStorage.setItem('selectedRowInfoCabinet', JSON.stringify(item));
              this.navigateTo('/cabinets/info');
          }}"></vaadin-icon>
          <vaadin-icon icon="vaadin:pencil" style="color: black;cursor: pointer;margin: 0 5px"    @click="${() => {
              console.log('Item to edit:', item);
              localStorage.setItem('selectedRowEditCabinet', JSON.stringify(item));
              this.navigateTo('/cabinets/edit');
          }}"></vaadin-icon>
          <vaadin-icon icon="vaadin:trash" style="color: black;cursor: pointer"
                       @click="${(e) => {
                           this.openDeleteDialog(item)
                       }}"></vaadin-icon>
      </td>
    </tr>
  `;
                        }): html`
                                <tr>
                                    <td colspan="7">
                                        <div colspan="7"
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
