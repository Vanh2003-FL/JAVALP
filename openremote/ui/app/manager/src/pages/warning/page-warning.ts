    import { css, html } from "lit";
    import { customElement, property,state } from "lit/decorators.js";
    import { Store } from "@reduxjs/toolkit";
    import { AppStateKeyed, Page, PageProvider } from "@openremote/or-app";
    import i18next from "i18next";
    import "@vaadin/button";
    import "@vaadin/text-field";
    import "@vaadin/grid";
    import "@vaadin/dialog";
    import "@vaadin/icon";
    import "@vaadin/multi-select-combo-box"
    import "@vaadin/number-field"
    import "@vaadin/email-field"
    import manager from "@openremote/core";

    export function pageWarning(store: Store<AppStateKeyed>, config?: PageWarning): PageProvider<AppStateKeyed> {
        return {
            name: "warningConfig",
            routes: [
                "warning-config",
                "warning-config/:id",
                "warning-config/:page/:id"
            ],
            pageCreator: () => new PageWarning(store),
        };
    }

    @customElement("page-warning")
    export class PageWarning extends Page<AppStateKeyed> {
        constructor(store: Store<AppStateKeyed>) {
            super(store);
            this.route = window.location.hash || '#/warning-config';
        }

        @property({ type: String }) // Specify the type as String
        public route?: string; // Change the type to string
        @state() selected :any
        @state() currentUser

        get name(): string {
            return "warning-config";
        }

        stateChanged(state: AppStateKeyed): void {
            // Handle state changes if necessary
        }

        static get styles() {
            return css`
                :host {
                    display: inline-block !important;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
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
        @state() selectIndexWarningInfo = 0
        highlightRowWarningInfo(index) {
            this.selectIndexWarningInfo = index;
        }
        @state() selectIndexWarningEmail = 0
        highlightRowWarningEmail(index) {
            this.selectIndexWarningEmail = index;
        }
        @state() dataEmail
        @state() dataEmailInfo
        @state() dataLo
        @state() dataRoute
        @state() currentPageWarningInfo :any =1
        @state() totalPageWarningInfo :any =1
        @state() currentPageWarningEmail :any =1
        @state() totalPageWarningEmail :any =1
        @state() currentPageWarningLo :any =1
        @state() totalPageWarningLo :any =1
        firstUpdated(){
            console.log('this.dataLo',this.dataLo)
            manager.rest.api.RouteInfoResource.getAll({data:{realm:window.sessionStorage.getItem('realm')}})
                .then((response) => {
                    const routeInfos = response.data.map(item => item.routeInfo);
                    this.dataRoute = routeInfos
                    console.log('getAllRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            console.log("a",{
                page:this.currentPageWarningInfo,size:5
            })
            manager.rest.api.SysWarningRuleResource.getAll({page:this.currentPageWarningInfo,size:5,data:{}})
                .then((response) => {
                    this.dataThongSo = response.data
                    this.dataThongSoInfo = response.data[0]
                    manager.rest.api.SysWarningRuleResource.countData()
                        .then((response) => {
                            this.totalPageWarningInfo = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:response.data?.[0].id})
                        .then((response) => {
                            this.dataEmail = response.data
                            this.dataEmailInfo = response.data?.[0]
                            console.log('idLo',response.data)

                            manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(response.data?.[0].id,{page:this.currentPageWarningLo,size:5})
                                .then((response) => {
                                   this.dataLo = response.data

                                    console.log('warning2',response)
                                })
                                .catch((error) => {
                                    console.error('Lỗi khi lấy dữ liệu:', error);
                                });
                            manager.rest.api.WarningEmailRouteResource.countData(response.data?.[0].id)
                                .then((response) => {
                                    this.totalPageWarningLo = Math.ceil(response.data / 5);
                                    console.log('warning2',response)
                                })
                                .catch((error) => {
                                    console.error('Lỗi khi lấy dữ liệu:', error);
                                });
                            console.log('warning',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:response.data?.[0].id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('totalPageWarningEmail',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    console.log('roadSetup2', response.data)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.UserResource.getCurrent()
                .then((response) => {
                    this.currentUser = response.data
                    console.log('roadSetup2', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }
        handleTabChange(e) {
            this.selected = e.detail.value;
        }
        @state() dataThongSo = []
        @state() dataThongSoInfo
        @state() dataListMail = [
            {
                mtt:1,
                ttt:"Brightness",
                status:"A"
            }
        ]
        @state() private isCreateMailDialogOpen = false;
        @state() private isCreateLoDialogOpen = false;
        @state() private isDeleteLoDialogOpen = false;
        @state() private isEditMailDialogOpen = false;
        @state() private isDeleteMailDialogOpen = false;
        @state() private isCopyMailDialogOpen = false;
        @state() dataEmailEdit
        private responsiveSteps: any = [
            // Use one column by default
            { minWidth: 0, columns: 1 },
            // Use two columns, if layout's width exceeds 500px
            { minWidth: '500px', columns: 2 },
        ];
        handleOpenedChangedCreate(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isCreateMailDialogOpen = false;
            }
        }
        handleOpenedChangedCreateLo(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isCreateLoDialogOpen = false;
            }
        }
        handleOpenedChangedEdit(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isEditMailDialogOpen = false;
            }
        }
        handleOpenedChangedDelete(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isDeleteMailDialogOpen = false;
            }
        }
        handleOpenedChangedDeleteLo(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isDeleteLoDialogOpen = false;
            }
        }
        handleOpenedChangedCopy(e: CustomEvent) {
            // this.codeColumnDialog = undefined
            // this.nameColumnDialog = undefined
            // this.statusDidalog = undefined
            // this.description = undefined
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
                this.isCopyMailDialogOpen = false;
            }
        }
        confirmCreate() {
            const object : any = {
                realm: window.sessionStorage.getItem('realm'),
                email: this.email,
                fullName: this.fullName,
                upperBoundValue: Number(this.maxValue),
                lowerBoundValue: Number(this.minValue),
                warningValue: this.status,
                sysWarningId: this.dataThongSoInfo.id,
                startDate: this.dateAD,
                active: this.dataThongSoInfo?.active,
                // createDate?: DateAsNumber;
                // createBy?: any;
                updateBy:this.currentUser?.username
            }
            const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#emailRequired') as any;
            const isNameValid = lampostCodeField.validate();
            if (!isNameValid) {
                return; // Ngừng lại nếu có lỗi
            }
            console.log("object",object)
            manager.rest.api.WarningEmailConfigResource.create(object)
                .then((response) => {
                    console.log('lamportType', response.data)
                    manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.dataEmail = response.data
                            console.log('warning',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isCreateMailDialogOpen = false;
            this.showCustomNotification("Tạo mới thành công")
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
        confirmCreateLo() {
            console.log('infoLo',this.dataEmailInfo)
            const object = {
                warningEmailId: this.dataEmailInfo?.id,
                routeId: this.routeSelected,
                startDate: this.dateADL,
                createBy: this.currentUser?.username,
                updateBy: this.currentUser?.username
            }
            console.log('object',object)
            manager.rest.api.WarningEmailRouteResource.create(object)
                .then((response:any) => {
                    console.log('lamportType', response.data)
                    if(response.data?.errorMessage){
                        this.showWarningNotification(`${response.data?.errorMessage}`)
                    }else{
                        manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(this.dataEmailInfo?.id,{page:this.currentPageWarningLo,size:5})
                            .then((response) => {
                                this.dataLo = response.data
                                console.log('warning2',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        manager.rest.api.WarningEmailRouteResource.countData(this.dataEmailInfo?.id)
                            .then((response) => {
                                this.totalPageWarningLo = Math.ceil(response.data / 5);
                                console.log('warning2',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                    }
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isCreateLoDialogOpen = false;
            this.showCustomNotification("Tạo mới thành công")
        }
        confirmEdit() {
            const object :any = {
                id:this.dataEmailEdit?.id,
                realm: window.sessionStorage.getItem('realm'),
                email: this.email,
                fullName: this.fullName,
                upperBoundValue: Number(this.maxValue),
                lowerBoundValue: Number(this.minValue),
                warningValue: this.status,
                sysWarningId: this.dataThongSoInfo.id,
                startDate: this.dateAD,
                active: this.dataThongSoInfo?.active,
                // createDate?: DateAsNumber;
                // createBy?: any;
                updateBy:this.currentUser?.username
            }
            const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#emailRequired') as any;
            const isNameValid = lampostCodeField.validate();
            if (!isNameValid) {
                return; // Ngừng lại nếu có lỗi
            }
            manager.rest.api.WarningEmailConfigResource.update(object)
                .then((response) => {
                    console.log('lamportType', response.data)
                    manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.dataEmail = response.data
                            console.log('warning',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isEditMailDialogOpen = false;
            this.showCustomNotification("Chỉnh sửa thành công")
        }
        confirmDelete() {
            console.log('dataDElete',this.dataEmailDelete)
            manager.rest.api.WarningEmailConfigResource.delete(this.dataEmailDelete?.id)
                .then((response) => {
                    manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.dataEmail = response.data
                            console.log('warning',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isDeleteMailDialogOpen = false;
            this.showCustomNotification("Xóa thành công")
        }
        confirmDeleteLo() {
            console.log('dataDElete',this.deleteLo)
            manager.rest.api.WarningEmailRouteResource.delete(this.deleteLo?.id)
                .then((response) => {
                    manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(this.dataEmailInfo?.id,{page:this.currentPageWarningLo,size:5})
                        .then((response) => {
                            this.dataLo = response.data
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailRouteResource.countData(this.dataEmailInfo?.id)
                        .then((response) => {
                            this.totalPageWarningLo = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isDeleteLoDialogOpen  = false;
            this.showCustomNotification("Xóa thành công")
        }
        confirmCopy() {
            const object :any = {
                realm: window.sessionStorage.getItem('realm'),
                email: this.email,
                fullName: this.fullName,
                upperBoundValue: Number(this.maxValue),
                lowerBoundValue: Number(this.minValue),
                warningValue: this.status,
                sysWarningId: this.dataThongSoInfo.id,
                startDate: this.dateAD,
                active: this.dataThongSoInfo?.active,
                // createDate?: DateAsNumber;
                // createBy?: any;
                updateBy:this.currentUser?.username
            }
            manager.rest.api.WarningEmailConfigResource.create(object)
                .then((response) => {
                    console.log('lamportType', response.data)
                    manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.dataEmail = response.data
                            console.log('warning',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo.id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.isCopyMailDialogOpen = false;
            this.showCustomNotification("Tạo mới thành công")
        }
        @state() fullName
        @state() email
        @state() dateAD
        @state() routeSelected
        @state() dateADL
        @state() itemsStatus = [
            { id: "M", name: 'Bảo trì' },
            { id: "P", name: 'Dừng hoạt động' },
            { id: "D", name: 'Mất kết nối' }
        ];
        @state() status
        handleChangeStatus(event){
            console.log('status',event.detail.value)
            const result = event?.detail?.value?.map(item => item.id).join(',');
            console.log('result',result)
            this.status = result
        }
        @state() minValue
        @state() maxValue
        handleMinValueChange(e){
            const value = e.target.value;

            // Nếu nhập không phải số nguyên dương
            if (!/^\d*(\.|,)?\d*$/.test(value)) {
                this.minValue = null;
                return;
            }
            console.log('value', value)
            // Nếu hợp lệ, lưu giá trị
            this.minValue = value;
        }
        handleMaxValueChange(e){
            const value = e.target.value;

            // Nếu nhập không phải số nguyên dương
            if (!/^\d*(\.|,)?\d*$/.test(value)) {
                this.maxValue = null;
                return;
            }
            console.log('value',value)
            // Nếu hợp lệ, lưu giá trị
            this.maxValue = value;
        }
        formCreate(){
            return html`
        <vaadin-dialog-overlay ?opened="${this.isCreateMailDialogOpen}" @opened-changed="${this.handleOpenedChangedCreate}" id="myDialog">
            <style>
                .required::part(label)::after {
                    content: '*';
                    color: red;
                }
                /* Ẩn icon chấm tròn mặc định nếu có */
                .required::part(required-indicator) {
                    display: none;
                }
            </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới email</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isCreateMailDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                label="Họ tên"
                                .value="${this.fullName}"
                                @input="${(e) => this.fullName = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-email-field
                                id="emailRequired"
                                required
                                label="Email"
                                name="email"
                                value="${this.email}"
                                error-message="${this.email?"Email không hợp lệ":"Email không được để trống"}"
                                @input="${(e) => this.email = e.target.value}"
                                clear-button-visible
                        ></vaadin-email-field>
                        ${this.dataThongSoInfo?.valueType === "FV" ? html`<vaadin-multi-select-combo-box
                                auto-expand-horizontally
                                auto-expand-vertically
                                label="Giá trị cảnh báo"
                                item-label-path="name"
                                item-id-path="id"
                                .selectedItems="${this.getSelectedStatus()}"
                                .items="${this.itemsStatus}"
                                @selected-items-changed="${this.handleChangeStatus}"
                        ></vaadin-multi-select-combo-box>`:html``}
                       ${this.dataThongSoInfo?.valueType !== "FV" ? html`<vaadin-number-field label="Giá trị giới hạn dưới" .value="${this.minValue}" @value-changed="${this.handleMinValueChange}">
                        </vaadin-number-field>

                        <vaadin-number-field label="Giá trị giới hạn trên" .value="${this.maxValue}" @value-changed="${this.handleMaxValueChange}">
                        </vaadin-number-field>`:html ``}
                       
                        <vaadin-date-picker  .value="${this.dateAD}"  min="${new Date().toISOString().split("T")[0]}" label="Ngày bắt đầu"  @value-changed="${(e)=>this.dateAD = e.target.value}">
                            
                        </vaadin-date-picker>
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isCreateMailDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmCreate()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
        }
        handleChangeRoute(event){
            console.log('event',event.target.value)
            this.routeSelected = event.target.value
        }
        formCreateLo(){
            return html`
        <vaadin-dialog-overlay ?opened="${this.isCreateLoDialogOpen}" @opened-changed="${this.handleOpenedChangedCreateLo}" id="myDialog">
            <style>
                .required::part(label)::after {
                    content: '*';
                    color: red;
                }
                /* Ẩn icon chấm tròn mặc định nếu có */
                .required::part(required-indicator) {
                    display: none;
                }
            </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Tạo mới lộ</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isCreateLoDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-combo-box
                                placeholder="Lộ/Tuyến"
                                clear-button-visible
                                .value="${this.routeSelected}"
                                .items="${this.dataRoute}"
                                @change="${this.handleChangeRoute}"
                                item-label-path="routeName"
                                item-value-path="id"
                                style="width: 150px;"
                        ></vaadin-combo-box>
                        <vaadin-date-picker min="${new Date().toISOString().split("T")[0]}"  .value="${this.dateADL}" label="Ngày bắt đầu"  @value-changed="${(e)=>this.dateADL = e.target.value}">
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isCreateLoDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmCreateLo()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
        }
        getSelectedStatus() {
            if (!this.status) return []; // tránh lỗi iterable
            const ids = this.status.split(',').map(s => s.trim());
            return this.itemsStatus.filter(item => ids.includes(item.id));
        }
        formEdit(){
            console.log('this.status',typeof this.status)
            return html`
        <vaadin-dialog-overlay ?opened="${this.isEditMailDialogOpen}" @opened-changed="${this.handleOpenedChangedEdit}" id="myDialog">
            <style>
                .required::part(label)::after {
                    content: '*';
                    color: red;
                }
                /* Ẩn icon chấm tròn mặc định nếu có */
                .required::part(required-indicator) {
                    display: none;
                }
            </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Chỉnh sửa email</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isEditMailDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                label="Họ tên"
                                .value="${this.fullName}"
                                @input="${(e) => this.fullName = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-email-field
                                id="emailRequired"
                                required
                                label="Email"
                                name="email"
                                value="${this.email}"
                                error-message="${this.email?"Email không hợp lệ":"Email không được để trống"}"
                                @input="${(e) => this.email = e.target.value}"
                                clear-button-visible
                        ></vaadin-email-field>
                        ${this.dataThongSoInfo?.valueType === "FV" ? html`<vaadin-multi-select-combo-box
                                auto-expand-horizontally
                                auto-expand-vertically
                                label="Giá trị cảnh báo"
                                item-label-path="name"
                                item-id-path="id"
                                .selectedItems="${this.getSelectedStatus()}"
                                .items="${this.itemsStatus}"
                                @selected-items-changed="${this.handleChangeStatus}"
                        ></vaadin-multi-select-combo-box>`:html``}
                        ${this.dataThongSoInfo?.valueType !== "FV" ? html`<vaadin-number-field label="Giá trị giới hạn dưới" .value="${this.minValue}" @value-changed="${this.handleMinValueChange}">
                        </vaadin-number-field>
                        <vaadin-number-field label="Giá trị giới hạn trên" .value="${this.maxValue}" @value-changed="${this.handleMaxValueChange}">
                        </vaadin-number-field>`:html ``}
                        <vaadin-date-picker  .value="${this.dateAD}"  min="${new Date().toISOString().split("T")[0]}" label="Ngày bắt đầu"  @value-changed="${(e)=>this.dateAD = e.target.value}">
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isEditMailDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmEdit()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
        }
        formDelete(){
            return html`
                <vaadin-dialog-overlay ?opened="${this.isDeleteMailDialogOpen}" @opened-changed="${this.handleOpenedChangedDelete}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Xác nhận</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteMailDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <p style="padding: 0">Bạn có chắc chắn muốn xóa email <span style="font-weight: bold">${this.dataEmailDelete?.email}</span>  này?</p>

                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isDeleteMailDialogOpen = false}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Xóa</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
        `
        }
        formDeleteLo(){
            return html`
                <vaadin-dialog-overlay ?opened="${this.isDeleteLoDialogOpen}" @opened-changed="${this.handleOpenedChangedDeleteLo}">
                    <div style="text-align: center;width: 400px">
                        <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                            <p style="visibility: hidden;padding: 0">abc</p>
                            <p style="padding: 0;color: white">Xác nhận</p>
                            <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteLoDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                        </div>
                        <p style="padding: 0">Bạn có chắc chắn muốn xóa lộ <span style="font-weight: bold">${this.deleteLo?.routeName}</span>  này?</p>

                        <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                            <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isDeleteLoDialogOpen = false}">Hủy</vaadin-button>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDeleteLo}">Xóa</vaadin-button>
                        </div>
                    </div>
                </vaadin-dialog-overlay>
        `
        }
        formCopy(){
            return html`
                  <vaadin-dialog-overlay ?opened="${this.isCopyMailDialogOpen}" @opened-changed="${this.handleOpenedChangedCopy}" id="myDialog">
            <style>
                .required::part(label)::after {
                    content: '*';
                    color: red;
                }
                /* Ẩn icon chấm tròn mặc định nếu có */
                .required::part(required-indicator) {
                    display: none;
                }
            </style>
                <div style="width: 600px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Sao chép email</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isCopyMailDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                label="Họ tên"
                                .value="${this.fullName}"
                                @input="${(e) => this.fullName = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-email-field
                                label="Email"
                                name="email"
                                value="${this.email}"
                                error-message="Email không hợp lệ"
                                @input="${(e) => this.email = e.target.value}"
                        ></vaadin-email-field>
                        ${this.dataThongSoInfo?.valueType === "FV" ? html`<vaadin-multi-select-combo-box
                                auto-expand-horizontally
                                auto-expand-vertically
                                label="Giá trị cảnh báo"
                                item-label-path="name"
                                item-id-path="id"
                                .selectedItems="${this.getSelectedStatus()}"
                                .items="${this.itemsStatus}"
                                @selected-items-changed="${this.handleChangeStatus}"
                        ></vaadin-multi-select-combo-box>`:html``}
                        ${this.dataThongSoInfo?.valueType !== "FV" ? html`<vaadin-number-field label="Giá trị giới hạn dưới" .value="${this.minValue}" @value-changed="${this.handleMinValueChange}">
                        </vaadin-number-field>
                        <vaadin-number-field label="Giá trị giới hạn trên" .value="${this.maxValue}" @value-changed="${this.handleMaxValueChange}">
                        </vaadin-number-field>`:html ``}
                        <vaadin-date-picker  .value="${this.dateAD}"  min="${new Date().toISOString().split("T")[0]}" label="Ngày bắt đầu"  @value-changed="${(e)=>this.dateAD = e.target.value}">
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isCopyMailDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmCopy()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
        }
        showInfoThongso(item){
            console.log('item',item)
            this.dataThongSoInfo = item
            this.selectIndexWarningEmail  =undefined
            manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:item.id})
                .then((response) => {
                    this.dataEmail = response.data
                    this.dataEmailInfo = undefined
                    this.dataLo = undefined
                    // manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(response.data?.[0].id)
                    //     .then((response) => {
                    //         this.dataLo = response.data
                    //         console.log('warning2',response)
                    //     })
                    //     .catch((error) => {
                    //         console.error('Lỗi khi lấy dữ liệu:', error);
                    //     });
                    console.log('warning',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:item.id})
                .then((response) => {
                    this.totalPageWarningEmail = Math.ceil(response.data / 5);
                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        @state() dataEmailCopy
        openCopyDialog(item){
            console.log('item',item)
            this.dataEmailCopy = item
            this.fullName= item.fullName
            this.email = item.email
            this.dateAD = this.formatDateChoose(item.startDate)
            this.minValue = item.lowerBoundValue
            this.maxValue = item.upperBoundValue
            this.status = item.warningValue
            this.isCopyMailDialogOpen = true
        }
        formatDateChoose(timestamp) {
            const date = new Date(timestamp);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        openEditDialog(item){
            console.log('item',item)
            this.dataEmailEdit = item
            this.fullName= item.fullName
            this.email = item.email
            this.dateAD = this.formatDateChoose(item.startDate)
            this.minValue = item.lowerBoundValue
            this.maxValue = item.upperBoundValue
            this.status = item.warningValue
            this.isEditMailDialogOpen = true
        }
        @state() dataEmailDelete
        openDeleteDialog(item){
            this.dataEmailDelete = item
            this.isDeleteMailDialogOpen = true
        }
        openCreateDialog(){
            this.fullName = undefined
            this.email=undefined
            this.dateAD = undefined
            this.minValue  = this.dataThongSoInfo?.lowerBoundValue
            this.maxValue = this.dataThongSoInfo?.upperBoundValue
            this.status = this.dataThongSoInfo?.warningValue
            console.log('datathongs',this.dataThongSoInfo)
            this.isCreateMailDialogOpen = true
        }
        formatDate(timestamp) {
            const date = new Date(timestamp);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            return `${day}/${month}/${year}`;
        }
        showEmailInfo(item){
            console.log('itemEmail',item)
            manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(item?.id,{page:this.currentPageWarningLo,size:5})
                .then((response) => {
                    this.dataLo = response.data
                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.WarningEmailRouteResource.countData(this.dataEmailInfo?.id)
                .then((response) => {
                    this.totalPageWarningLo = Math.ceil(response.data / 5);
                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(item?.id,{page:this.currentPageWarningLo,size:5})
                .then((response) => {
                    this.dataLo = response.data

                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.WarningEmailRouteResource.countData(item?.id)
                .then((response) => {
                    this.totalPageWarningLo = Math.ceil(response.data / 5);
                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.dataEmailInfo = item
        }
         translateElectricalTerm(term) {
            console.log('term',term)
            const translations = {
                amperage: 'Cường độ dòng điện(A)',
                wattageActual: 'Công suất thực tế(Wh)',
                voltage: 'Điện áp(V)',
                wattage: 'Công suất(W)',
                status: 'Trạng thái'
            };

            return translations[term] || '';
        }
        openCreateLoDialog(){
            this.routeSelected  =undefined
            this.dateADL  = undefined
            this.isCreateLoDialogOpen = true
        }
        @state() deleteLo
        openDeleteLoDialog(item){
            console.log('item',item)
            this.deleteLo = item
            this.isDeleteLoDialogOpen = true
        }
        navigatePage(page) {
            if (page < 1 || page > this.totalPageWarningInfo) return;
            this.currentPageWarningInfo = page
            console.log('page',page)
            manager.rest.api.SysWarningRuleResource.getAll({page:page,size:5})
                .then((response) => {
                    this.dataThongSo = response.data
                    console.log('roadSetup2', response.data)
                    manager.rest.api.SysWarningRuleResource.countData()
                        .then((response) => {
                            this.totalPageWarningInfo = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }
        navigatePageEmail(page) {
            if (page < 1 || page > this.totalPageWarningEmail) return;
            this.currentPageWarningEmail = page
            console.log('page',page)
            manager.rest.api.WarningEmailConfigResource.getAll({page:page,size:5},{realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo?.id})
                .then((response) => {
                    this.dataEmail = response.data
                    // this.dataEmailInfo = response.data?.[0]
                    console.log('idLo',response.data)
                    manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:this.dataThongSoInfo?.id})
                        .then((response) => {
                            this.totalPageWarningEmail = Math.ceil(response.data / 5);
                            console.log('warning2',response)
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        });
                    // manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(response.data?.[0].id,{page:this.currentPageWarningLo,size:5})
                    //     .then((response) => {
                    //         this.dataLo = response.data
                    //
                    //         console.log('warning2',response)
                    //     })
                    //     .catch((error) => {
                    //         console.error('Lỗi khi lấy dữ liệu:', error);
                    //     });
                    // manager.rest.api.WarningEmailRouteResource.countData(response.data?.[0].id)
                    //     .then((response) => {
                    //         this.totalPageWarningLo = Math.ceil(response.data / 5);
                    //         console.log('warning2',response)
                    //     })
                    //     .catch((error) => {
                    //         console.error('Lỗi khi lấy dữ liệu:', error);
                    //     });
                    console.log('warning',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }
        navigatePageLo(page) {
            if (page < 1 || page > this.totalPageWarningLo) return;
            this.currentPageWarningLo = page
            console.log('page',page)
            manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(this.dataEmailInfo?.id,{page:this.currentPageWarningLo,size:5})
                .then((response) => {
                    this.dataLo = response.data

                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.WarningEmailRouteResource.countData(this.dataEmailInfo?.id)
                .then((response) => {
                    this.totalPageWarningLo = Math.ceil(response.data / 5);
                    console.log('warning2',response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }
        renderPagination() {

            return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePage(1)}"  class="${this.currentPageWarningInfo === 1 ? 'disabled' : ''}" >&laquo;</a></li>
                <li><a @click="${() => this.navigatePage(this.currentPageWarningInfo - 1)}"  class="${this.currentPageWarningInfo === 1 ? 'disabled' : ''}" >&lsaquo;</a></li>
                ${Array.from({ length: this.totalPageWarningInfo }, (_, i) => i + 1).map(page => html`
        <li><a class="${page === this.currentPageWarningInfo ? 'active' : ''}" @click="${() => this.navigatePage(page)}">${page}</a></li>
    `)}
                <li><a @click="${() => this.navigatePage(this.currentPageWarningInfo + 1)}"  class="${this.currentPageWarningInfo === this.totalPageWarningInfo ? 'disabled' : ''}" >&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePage(this.totalPageWarningInfo)}"  class="${this.currentPageWarningInfo === this.totalPageWarningInfo ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
        }
        renderPaginationEmail() {

            return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePageEmail(1)}"  class="${this.currentPageWarningEmail === 1 ? 'disabled' : ''}" >&laquo;</a></li>
                <li><a @click="${() => this.navigatePageEmail(this.currentPageWarningEmail - 1)}"  class="${this.currentPageWarningEmail === 1 ? 'disabled' : ''}" >&lsaquo;</a></li>
                ${Array.from({ length: this.totalPageWarningEmail }, (_, i) => i + 1).map(page => html`
        <li><a class="${page === this.currentPageWarningEmail ? 'active' : ''}" @click="${() => this.navigatePageEmail(page)}">${page}</a></li>
    `)}
                <li><a @click="${() => this.navigatePageEmail(this.currentPageWarningEmail + 1)}"  class="${this.currentPageWarningEmail === this.totalPageWarningEmail ? 'disabled' : ''}" >&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePageEmail(this.totalPageWarningEmail)}"  class="${this.currentPageWarningEmail === this.totalPageWarningEmail ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
        }
        renderPaginationLo() {

            return html`
            <ul class="pagination">
                <li><a @click="${() => this.navigatePageLo(1)}"  class="${this.currentPageWarningLo === 1 ? 'disabled' : ''}" >&laquo;</a></li>
                <li><a @click="${() => this.navigatePageLo(this.currentPageWarningLo - 1)}"  class="${this.currentPageWarningLo === 1 ? 'disabled' : ''}" >&lsaquo;</a></li>
                ${Array.from({ length: this.totalPageWarningLo }, (_, i) => i + 1).map(page => html`
        <li><a class="${page === this.currentPageWarningLo ? 'active' : ''}" @click="${() => this.navigatePageLo(page)}">${page}</a></li>
    `)}
                <li><a @click="${() => this.navigatePageLo(this.currentPageWarningLo + 1)}"  class="${this.currentPageWarningLo === this.totalPageWarningLo ? 'disabled' : ''}" >&rsaquo;</a></li>
                <li><a @click="${() => this.navigatePageLo(this.totalPageWarningLo)}"  class="${this.currentPageWarningLo === this.totalPageWarningLo ? 'disabled' : ''}">&raquo;</a></li>
            </ul>
        `;
        }
        hightLightAndShowInfoThongSo(item,index){
            this.currentPageWarningEmail = 1
            this.showInfoThongso(item)
            this.highlightRowWarningInfo(index)
        }
        hightLightAndShowEmailInfo(item,index){
            this.highlightRowWarningEmail(index)
            this.showEmailInfo(item)
        }
        getWarningDisplayNames(warningValue) {
            const warningMap = {
                M: "Bảo trì",
                P: "Dừng hoạt động",
                D: "Mất kết nối"
            };

            if (!warningValue || typeof warningValue !== "string") return [];

            return warningValue
                .split(",")
                .map(code => warningMap[code.trim()])
                .filter(Boolean)
                .join(", "); // ← thêm dòng này để ghép thành chuỗi với dấu phẩy
        }
        connectedCallback() {
            super.connectedCallback();
            window.addEventListener('session-changed', this._onSessionChanged);
            window.addEventListener('data-updated', (e: CustomEvent) => {
                this.currentPageWarningInfo = 1
                this.currentPageWarningEmail  =1
                this.currentPageWarningLo = 1
                manager.rest.api.RouteInfoResource.getAll({data:{realm:window.sessionStorage.getItem('realm')}})
                    .then((response) => {
                        const routeInfos = response.data.map(item => item.routeInfo);
                        this.dataRoute = routeInfos
                        console.log('getAllRoute', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                console.log("a",{
                    page:this.currentPageWarningInfo,size:5
                })
                manager.rest.api.SysWarningRuleResource.getAll({page:this.currentPageWarningInfo,size:5,data:{}})
                    .then((response) => {
                        this.dataThongSo = response.data
                        this.dataThongSoInfo = response.data[0]
                        manager.rest.api.SysWarningRuleResource.countData()
                            .then((response) => {
                                this.totalPageWarningInfo = Math.ceil(response.data / 5);
                                console.log('warning2',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:window.sessionStorage.getItem('realm'),warning:response.data?.[0].id})
                            .then((response) => {
                                this.dataEmail = response.data
                                this.dataEmailInfo = response.data?.[0]
                                console.log('idLo',response.data)

                                manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(response.data?.[0].id,{page:this.currentPageWarningLo,size:5})
                                    .then((response) => {
                                        this.dataLo = response.data

                                        console.log('warning2',response)
                                    })
                                    .catch((error) => {
                                        console.error('Lỗi khi lấy dữ liệu:', error);
                                    });
                                manager.rest.api.WarningEmailRouteResource.countData(response.data?.[0].id)
                                    .then((response) => {
                                        this.totalPageWarningLo = Math.ceil(response.data / 5);
                                        console.log('warning2',response)
                                    })
                                    .catch((error) => {
                                        console.error('Lỗi khi lấy dữ liệu:', error);
                                    });
                                console.log('warning',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        manager.rest.api.WarningEmailConfigResource.countData({realm:window.sessionStorage.getItem('realm'),warning:response.data?.[0].id})
                            .then((response) => {
                                this.totalPageWarningEmail = Math.ceil(response.data / 5);
                                console.log('totalPageWarningEmail',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        console.log('roadSetup2', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                manager.rest.api.UserResource.getCurrent()
                    .then((response) => {
                        this.currentUser = response.data
                        console.log('roadSetup2', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            window.removeEventListener('session-changed', this._onSessionChanged);
        }
        _onSessionChanged = (e) => {
            const { key, value } = e.detail;
            if (key === 'realm') {
                this.currentPageWarningInfo = 1
                this.currentPageWarningEmail  =1
                this.currentPageWarningLo = 1
                manager.rest.api.RouteInfoResource.getAll({data:{realm:value}})
                    .then((response) => {
                        const routeInfos = response.data.map(item => item.routeInfo);
                        this.dataRoute = routeInfos
                        console.log('getAllRoute', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                console.log("a",{
                    page:this.currentPageWarningInfo,size:5
                })
                manager.rest.api.SysWarningRuleResource.getAll({page:this.currentPageWarningInfo,size:5,data:{}})
                    .then((response) => {
                        this.dataThongSo = response.data
                        this.dataThongSoInfo = response.data[0]
                        manager.rest.api.SysWarningRuleResource.countData()
                            .then((response) => {
                                this.totalPageWarningInfo = Math.ceil(response.data / 5);
                                console.log('warning2',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        manager.rest.api.WarningEmailConfigResource.getAll({page:this.currentPageWarningEmail,size:5},{realm:value,warning:response.data?.[0].id})
                            .then((response) => {
                                this.dataEmail = response.data
                                this.dataEmailInfo = response.data?.[0]
                                console.log('idLo',response.data)

                                manager.rest.api.WarningEmailRouteResource.getEmailRouteByEmailConfigId(response.data?.[0].id,{page:this.currentPageWarningLo,size:5})
                                    .then((response) => {
                                        this.dataLo = response.data

                                        console.log('warning2',response)
                                    })
                                    .catch((error) => {
                                        console.error('Lỗi khi lấy dữ liệu:', error);
                                    });
                                manager.rest.api.WarningEmailRouteResource.countData(response.data?.[0].id)
                                    .then((response) => {
                                        this.totalPageWarningLo = Math.ceil(response.data / 5);
                                        console.log('warning2',response)
                                    })
                                    .catch((error) => {
                                        console.error('Lỗi khi lấy dữ liệu:', error);
                                    });
                                console.log('warning',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        manager.rest.api.WarningEmailConfigResource.countData({realm:value,warning:response.data?.[0].id})
                            .then((response) => {
                                this.totalPageWarningEmail = Math.ceil(response.data / 5);
                                console.log('totalPageWarningEmail',response)
                            })
                            .catch((error) => {
                                console.error('Lỗi khi lấy dữ liệu:', error);
                            });
                        console.log('roadSetup2', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                manager.rest.api.UserResource.getCurrent()
                    .then((response) => {
                        this.currentUser = response.data
                        console.log('roadSetup2', response)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
            }
        }

        render() {
            return html`
                ${this.formCreate()}
                ${this.formCreateLo()}
                ${this.formCopy()}
                ${this.formDelete()}
                ${this.formDeleteLo()}
                ${this.formEdit()}
                <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}" style="height: 100%">
                    <div>
                         <h2 style="margin:10px 0px;font-size: 16px;margin-bottom:20px">Thông số cảnh báo</h2>
                        <table>
                            <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã thuộc tính</th>
                                <th>Tên thuộc tính</th>
                                <th>Trạng thái</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.dataThongSo?.length !== 0 ? this.dataThongSo?.map((item,index) => {
                                const rowNumber = (this.currentPageWarningInfo - 1) * 5 + index + 1
                                return html`
                                    <tr @click="${() => this.hightLightAndShowInfoThongSo(item,index)}"
                                        style="background-color: ${this.selectIndexWarningInfo === index ? '#dbebd4' : 'transparent'}; cursor: pointer;">
                                        <td>${rowNumber}
                                        </td>
                                        <td>${item?.attrCodeName}
                                        </td>
                                        <td>${item?.attrCode}</td>
                                        <td>
                                            ${item?.active === true
                                                    ? "Hoạt động"
                                                    : item?.active === false
                                                            ? "Dừng hoạt động"
                                                            : ""}
                                        </td>
                                    </tr>
                                `;
                            }) : html`
                                <tr>
                                    <td colspan="4">
                                        <div colspan="4"
                                             style="height: 200px;display: flex;align-items: center;justify-content: center">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>`}
                            </tbody>
                        </table>
                        ${this.renderPagination()}
                    </div>
                    <div>
                        <div style="display: flex;justify-content: space-between;">
                            <h2 style="font-size: 16px">Danh sách email nhận cảnh báo</h2>
                            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white;margin:10px 0px;margin-bottom:5;margin-right:10px" @click="${() => this.openCreateDialog()}">Thêm</vaadin-button>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>STT</th>
                                <th>Khách hàng</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Ngày áp dụng</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.dataEmail?.length !== 0 ? this.dataEmail?.map((item,index) => {
                                const rowNumber = (this.currentPageWarningEmail - 1) * 5 + index + 1
                                return html`
                                    <tr @click="${() => this.hightLightAndShowEmailInfo(item,index)}"
                                        style="background-color: ${this.selectIndexWarningEmail === index ? '#dbebd4' : 'transparent'}; cursor: pointer;">
                                        <td>${rowNumber}
                                        </td>
                                        <td>${item?.realm}
                                        </td>
                                        <td>${item?.fullName}</td>
                                        <td>
                                            ${item?.email}
                                        </td>
                                        <td>
                                            ${item.startDate?this.formatDate(item.startDate):""}
                                        </td>
                                        <td>
                                            <vaadin-icon icon="vaadin:copy-o" style="color: black;cursor: pointer" @click="${() => this.openCopyDialog(item)}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:pencil" style="color: black;cursor: pointer;margin: 0 5px" @click="${() => this.openEditDialog(item)}"></vaadin-icon>
                                            <vaadin-icon icon="vaadin:trash" style="color: black;cursor: pointer" @click="${() => this.openDeleteDialog(item)}"></vaadin-icon>
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
                        ${this.renderPaginationEmail()}
                    </div>
                    <div>
                        <vaadin-form-layout .responsiveSteps="responsiveSteps2" style="height: 100%;margin:0 20px">
                            <div style="display: flex;flex-direction: column">
                                <p>Mã thuộc tính : ${this.dataThongSoInfo?.attrCodeName} </p>
                                <p>Tên thuộc tính : ${this.dataThongSoInfo?.attrCode} </p>
                                ${this.dataThongSoInfo?.valueType === "FV" ? html` <p>Giá trị cảnh báo : ${this.getWarningDisplayNames(this.dataThongSoInfo?.warningValue)}</p>`:html`` }
                            </div>
                            <div style="display: flex;flex-direction: column">
                                <p>Trạng thái : ${this.dataThongSoInfo?.active === true
                ? "Hoạt động"
                : this.dataThongSoInfo?.active === false
                    ? "Dừng hoạt động"
                    : ""}</p>
                                 ${this.dataThongSoInfo?.valueType !== "FV" ? html`
                                     <p>Giá trị giới hạn dưới : ${this.dataThongSoInfo?.lowerBoundValue}</p>
                                     <p>Giá trị giới hạn trên : ${this.dataThongSoInfo?.upperBoundValue}</p>`:html``}
                            </div>
                        </vaadin-form-layout>
                    </div>
                    <div>
                        <vaadin-tabs
        selected="${this.selected}"
        @selected-changed="${this.handleTabChange}"
      >
        <vaadin-tab>Thông tin</vaadin-tab>
        <vaadin-tab>Lộ/tuyến áp dụng</vaadin-tab>
      </vaadin-tabs>

      <div style="margin-top: 1rem;">
        ${this.selected === 0 ? html`
            <vaadin-form-layout .responsiveSteps="responsiveSteps2" style="height: 100%;margin:0 20px">
                <div style="display: flex;flex-direction: column">
                    <p>Khách hàng :${this.dataEmailInfo?.realm}</p>
                    <p>Họ tên : ${this.dataEmailInfo?.fullName}</p>
                    ${this.dataThongSoInfo?.valueType === "FV" ? html` <p>Giá trị cảnh báo : ${this.getWarningDisplayNames(this.dataEmailInfo?.warningValue)}</p>`:html``}
                    <p>Ngày áp dụng : ${this.dataEmailInfo?.createDate?this.formatDate(this.dataEmailInfo?.createDate):''}</p>
                </div>
                <div style="display: flex;flex-direction: column">
                    <p>Trạng thái : ${this.dataEmailInfo?.active === true
                ? "Hoạt động"
                : this.dataEmailInfo?.active === false
                        ? "Dừng hoạt động"
                        : ""}</p>
                    <p>Email : ${this.dataEmailInfo?.email}</p>
                     ${this.dataThongSoInfo?.valueType !== "FV" ? html`<p>Giá trị giới hạn dưới :  ${this.dataEmailInfo?.lowerBoundValue}</p>
                     <p>Giá trị giới hạn trên : ${this.dataEmailInfo?.upperBoundValue}</p>`:html``}
                </div>
            </vaadin-form-layout>
        ` : ''}
        ${this.selected === 1 ? html`
            <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white;margin:10px 0px" @click="${() => this.openCreateLoDialog()}">Thêm lộ</vaadin-button>
            <table>
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Lộ/tuyến</th>
                    <th>Ngày áp dụng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                ${this.dataLo?.length !== 0 ? this.dataLo?.map((item,index) => {
                    const rowNumber = (this.currentPageWarningLo - 1) * 5 + index + 1
                    return html`
                                    <tr>
                                        <td >${rowNumber}
                                        </td>
                                        <td>${item?.routeName}
                                        </td>
                                        <td>${item?.startDate?this.formatDate(item?.startDate):''}</td>
                                        <td>
                                            ${item?.active ? "Hoạt động" : "Dừng hoạt động"}
                                        </td>
                                        <td>
                                            <vaadin-icon icon="vaadin:trash" style="color: black;cursor: pointer" @click="${() => this.openDeleteLoDialog(item)}"></vaadin-icon>
                                        </td>
                                        
                                    </tr>
                                `;
                }) : html`
                                <tr>
                                    <td colspan="5">
                                        <div colspan="5"
                                             style="height: 200px;display: flex;align-items: center;justify-content: center">
                                            Không có dữ liệu
                                        </div>
                                    </td>
                                </tr>`}
                </tbody>
            </table>
            ${this.renderPaginationLo()}
        ` : ''}
      </div>
                    </div>
                </vaadin-form-layout>
                
            `;
        }

    }
