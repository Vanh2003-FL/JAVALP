import manager from "@openremote/core";
import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import "@vaadin/tabs"
import "@vaadin/tabsheet"
import "@vaadin/details"
import "@vaadin/vertical-layout"
import "@vaadin/card"
import "@vaadin/button"
import { i18next } from "@openremote/or-translate";
import "./lightColumn-create"
import "./lightColumn-edit"
import { Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PieController,
    ArcElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,PieController,
    ArcElement,ChartDataLabels);
@customElement("routes-light")
export class MyElement extends LitElement {
    @state() idEditNema
    @property() infoTable = JSON.parse(localStorage.getItem('selectedRow'));
    static styles = css`
        :host {
            //display: block;
            //box-sizing: border-box;
        }
        //:host #layout {
        //    display: flex;
        //    height: 100%;
        //    justify-content: space-between;
        //    align-items: inherit !important; 
        //}
        .margin20{
            margin: 0 70px;
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
            color:black;
            border-bottom: 1px solid #ddd;
        }
        .required::part(label)::after {
            content: '*';
            color: red;
        }
        /* Ẩn icon chấm tròn mặc định nếu có */
        .required::part(required-indicator) {
            display: none;
        }
        th {
            background-color: #e8ebef;
            text-align: center;
            color: #5d6a79;
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
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }

        /* Hide default HTML checkbox */
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        /* The slider */
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
        }

        input:checked + .slider {
            background-color: #3a9f6f;
        }

        input:focus + .slider {
            box-shadow: 0 0 1px #3a9f6f;
        }

        input:checked + .slider:before {
            -webkit-transform: translateX(26px);
            -ms-transform: translateX(26px);
            transform: translateX(26px);
        }

        /* Rounded sliders */
        .slider.round {
            border-radius: 34px;
        }

        .slider.round:before {
            border-radius: 50%;
        }
        .square-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }

        .square {
            flex: 1;
            height: 40px;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            border: 1px solid black;
        }

        .square:not(:last-child) {
            border-right: none;
        }

        .square.active {
            background-color:#3a9f6f;
            color: white;
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
    @state() mode = 'list';
    @state() selectedItem: any = null;
    @state() selectedTypeLight
    @state() selectedCode
    @state() selectedCodeNema
    @state() private isDeleteDialogOpen = false;
    @state() private isDeleteDialogInfoOpen = false;
    @state() private isCreateDialogOpen = false;
    @state() private isCreateDialogInfoOpen = false;
    @state() private isEditDialogInfoOpen = false;
    @state() private isEditDialogOpen = false;
    @state() listLampType= []
    @state() currentPage :any =1
    @state() totalPage :any =1
    @state() dataInfoRow
    async fetchLightColumn(page) {
        console.log('routeId',typeof window.sessionStorage.getItem('realm'))
        manager.rest.api.LamppostResource.queryLamppost({lamppostId:this.selectedCode,lampTypeId:this.selectedTypeLight,nemaName:this.selectedCodeNema},{realm:window.sessionStorage.getItem('realm'),page:page,size:5,routerId:this.infoTable.routeInfo.id})
            .then((response) => {
                this.lightItems = response.data.items
                this.infoRow = response.data.items[0]
                console.log('response.data.items[0]',response.data.items[0])
                let lamppostId = response.data.items?.[0].lamppostId;

                Promise.all([
                    manager.rest.api.LamppostResource.getWattageActual({lamppostId:lamppostId}),
                    manager.rest.api.LamppostResource.getWattageProduct({lamppostId:lamppostId})
                ])
                    .then(([actualRes, productRes]) => {
                        const getWattageActual = actualRes.data.wattageActual;
                        const getWattageProduct = productRes.data.wattageProduction;
                        const fakeDataChart1 = {
                            labels: ["Lý thuyết","Thực tế"],
                            datasets: [{
                                label:'wattage',
                                data:[getWattageProduct,getWattageActual],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                ],
                                barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                                categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                            }]
                        };
                        this.chart.data.labels = fakeDataChart1.labels;
                        this.chart.data.datasets = fakeDataChart1.datasets;
                        this.chart.options = {
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Năng lượng tiêu thụ đèn tháng 5/2025',
                                },
                                datalabels: {
                                    anchor: 'center',        // Gắn vào giữa thanh
                                    align: 'center',         // Căn vào giữa thanh
                                    offset: -5,           // Dịch lên trên (âm = lên)
                                    formatter: function(value) {
                                        return value;
                                    },
                                }
                            }
                        };
                        this.chart.update()

                        console.log('getWattageActual2', getWattageActual);
                        console.log('getWattageProduct2', getWattageProduct);

                        // Dùng 2 giá trị này ở đây
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });

                // const formattedData = response.data.datasets.map((item, index) => ({
                //     label: translateLabel(item.label),
                //     data: item.data,
                //     borderColor: distinctColors[index % distinctColors.length],
                // }));
                console.log('this.selectedCode',this.selectedCode)
                // manager.rest.api.LamppostResource.getPowerConsumption({lamppostId:response.data.items?.[0].lamppostId})
                //     .then((response) => {
                //         const fakeDataChart1 = {
                //             labels: ["Lý thuyết","Thực tế"],
                //             datasets: [{
                //                 label:'wattage',
                //                 data:[response.data.wattageProduction,response.data.wattageActual],
                //                 backgroundColor: [
                //                     'rgba(255, 99, 132, 0.2)',
                //                     'rgba(54, 162, 235, 0.2)',
                //                 ],
                //                 barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                //                 categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                //             }]
                //         };
                //         this.chart.data.labels = fakeDataChart1.labels;
                //         this.chart.data.datasets = fakeDataChart1.datasets;
                //         this.chart.options = {
                //             plugins: {
                //                 legend: {
                //                     display: false
                //                 },
                //                 title: {
                //                     display: true,
                //                     text: 'Năng lượng tiêu thụ đèn tháng 5/2025',
                //                 },
                //                 datalabels: {
                //                     anchor: 'center',        // Gắn vào giữa thanh
                //                     align: 'center',         // Căn vào giữa thanh
                //                     offset: -5,           // Dịch lên trên (âm = lên)
                //                     formatter: function(value) {
                //                         return value;
                //                     },
                //                 }
                //             }
                //         };
                //         this.chart.update()
                //         console.log('getRealm234Po', response.data)
                //     })
                //     .catch((error) => {
                //         console.error('Lỗi khi lấy dữ liệu:', error);
                //     });

                this.totalPage = Math.ceil(response.data.total / 5)
                // this.lightItems = response.data
                manager.rest.api.LamppostResource.getLightsByLamppostId(response.data.items[0].lamppostId)
                    .then((response) => {
                        this.dataInfoRow = response.data
                        console.log('getRealm234', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                console.log('getRealm23', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    navigatePage(page) {
        if (page < 1 || page > this.totalPage) return;
        this.currentPage = page
        this.fetchLightColumn(page);
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
    @state() chart = null
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
    firstUpdated() {
      this.fetchLightColumn(this.currentPage)
        manager.rest.api.LamppostResource.getLamppostType()
            .then((response) => {
                console.log('lamportType', response.data)
                this.listLampType = response.data
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        this.chart =
            new Chart(ctx, {
            type: 'bar',
                data: {
                    labels: ['Lý thuyết','Thực tế'],
                    datasets: [{
                        label: 'wattage',
                        data: [50, 30.5],
                        barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                        categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                    ]
                },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian', // Nhãn trục X
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Năng lượng(W)', // Nhãn trục Y
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Năng lượng tiêu thụ đèn tháng 5/2025',
                    },
                    datalabels: {
                        anchor: 'center',        // Gắn vào giữa thanh
                        align: 'center',         // Căn vào giữa thanh
                        offset: -5,           // Dịch lên trên (âm = lên)
                        formatter: function(value) {
                            return value;
                        },
                    }
                }
            }
        });
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('data-updated', (e: CustomEvent) => {
            this.fetchLightColumn(1);
        });
    }
    @state() lightItems:any = [];
    @state() route = window.location.hash;
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
    handleOpenedChangedDeleteInfo(e: CustomEvent) {
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
            this.isDeleteDialogInfoOpen = false;
        }
    }
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
            this.isCreateDialogOpen = false;
        }
    }
    handleOpenedChangedCreateInfo(e: CustomEvent) {
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
            this.isCreateDialogInfoOpen = false;
        }
    }
    handleOpenedChangedEditInfo(e: CustomEvent) {
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
            this.isEditDialogInfoOpen = false;
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
            this.isEditDialogOpen = false;
        }
    }
    cancelDelete() {
        this.isDeleteDialogOpen = false;
    }
    confirmDelete() {
        console.log('selectDialog',this.selectDialog)
        manager.rest.api.LamppostResource.delete(this.selectDialog.lamppostId)
            .then((response) => {
                this.currentPage = 1
                this.fetchLightColumn(1)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isDeleteDialogOpen = false;
        this.showCustomNotification("Xóa Cột đèn thành công")
    }
    confirmDeleteInfo() {
        console.log('selectDialog',this.selectDialogInfo?.assetId)
        manager.rest.api.LamppostResource.removeLight(this.selectDialogInfo?.assetId)
            .then((response) => {
                manager.rest.api.LamppostResource.getLightsByLamppostId(this.infoRow?.lamppostId)
                    .then((response) => {
                        this.dataInfoRow = response.data
                        this.lamtypeInfo = undefined
                        this.nemaInfo=undefined
                        this.startDateInfo=undefined
                        this.endDateInfo  =undefined
                        this.descriptionInfo = undefined
                        console.log('getRealm234', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        this.isDeleteDialogInfoOpen = false;
        this.showCustomNotification("Xóa đèn thành công")
    }
    confirmCreate() {
        const objectPush :any= {
            lamppostCode: this.codeColumnDialog,
            routeId: this.infoTable.routeInfo.id,
            lamppostName:this.nameColumnDialog,
            active:this.statusDidalog,
            description:this.description
        }
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lampostCode') as any;
        const lampostNameField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lampostName') as any;
        const isCodeValid = lampostCodeField.validate();
        const isNameValid = lampostNameField.validate();
        if (!isCodeValid || !isNameValid) {
            return; // Ngừng lại nếu có lỗi
        }
        manager.rest.api.LamppostResource.create(objectPush, {
            realm: window.sessionStorage.getItem('realm'),
        })
            .then((response) => {
                this.currentPage = 1; // Reset to first page after creation
                this.fetchLightColumn(this.currentPage); // Fetch updated data
                console.log('Tạo thành công');
                this.codeColumnDialog = undefined
                this.nameColumnDialog = undefined
                this.statusDidalog = undefined
                this.description = undefined
                this.isCreateDialogOpen = false; // Close the dialog
                this.showCustomNotification("Thêm cột đèn thành công"); // Success notification
            })
            .catch((error) => {
                console.error('Lỗi khi tạo cột đèn:', error);
            });
        this.isCreateDialogOpen = false;

    }
    confirmCreateInfo() {
        const object :any= {
            lamppostId:this.infoRow?.lamppostId,
            routeId:this.infoTable.routeInfo.id,
            lightId:this.nemaInfo,
            startDate:this.startDateInfo,
            endDate:this.endDateInfo,
            description:this.descriptionInfo
        }
        console.log('object',this.infoRow)
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lamtypeInfo') as any;
        const lampostCodeField2 = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lamtypeName') as any;
        const isCodeValid = lampostCodeField.validate();
        const isCodeValid2 = lampostCodeField2.validate();
        if (!isCodeValid || !isCodeValid2) {
            return; // Ngừng lại nếu có lỗi
        }
        manager.rest.api.LamppostResource.createLamppostLight(object, {
            realm: window.sessionStorage.getItem('realm'),
        })
            .then((response) => {
                manager.rest.api.LamppostResource.getLightsByLamppostId(this.infoRow?.lamppostId)
                    .then((response) => {
                        this.dataInfoRow = response.data
                        this.lamtypeInfo = undefined
                        this.nemaInfo=undefined
                        this.startDateInfo=undefined
                        this.endDateInfo  =undefined
                        this.descriptionInfo = undefined
                        console.log('getRealm234', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                this.isCreateDialogInfoOpen = false;
                this.showCustomNotification("Thêm đèn thành công"); // Success notification
            })
            .catch((error) => {
                console.error('Lỗi khi tạo cột đèn:', error);
            });
        console.log('objectInfo',object)

    }
    confirmEditInfo() {
        console.log('this.infoRow',this.infoRow)
        const object : any = {
            // lamppostId:this.infoRow?.lamppostId,
            // routeId:this.infoTable.routeInfo.id,
            lampTypeId:this.lamtypeInfo,
            lightId:this.idEditNema,
            startDate:this.startDateInfo,
            endDate:this.endDateInfo,
            description:this.descriptionInfo
        }
        console.log('objectPush',object)
        manager.rest.api.LamppostResource.updateLamppostLight(this.infoRow?.lamppostId,object)
            .then((response) => {
                manager.rest.api.LamppostResource.getLightsByLamppostId(this.infoRow?.lamppostId)
                    .then((response) => {
                        this.dataInfoRow = response.data
                        // this.lamtypeInfo = undefined
                        // this.nemaInfo=undefined
                        // this.startDateInfo=undefined
                        // this.endDateInfo  =undefined
                        // this.descriptionInfo = undefined
                        console.log('getRealm234', response.data)
                    })
                    .catch((error) => {
                        console.error('Lỗi khi lấy dữ liệu:', error);
                    });
                this.isEditDialogInfoOpen = false;
                this.showCustomNotification("Sửa đèn thành công"); // Success notification
            })
            .catch((error) => {
                console.error('Lỗi khi tạo cột đèn:', error);
            });
        console.log('objectInfo',this.infoRow)

    }
    confirmEdit(){
        const objectPush :any= {
            lamppostCode: this.codeColumnDialog,
            routeId: this.infoTable.routeInfo.id,
            lamppostName:this.nameColumnDialog,
            active:this.statusDidalog,
            description:this.description
        }
        console.log("objectPush",objectPush)
        const lampostCodeField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lampostCode') as any;
        const lampostNameField = document.querySelector('vaadin-dialog-overlay')?.querySelector('#lampostName') as any;
        const isCodeValid = lampostCodeField.validate();
        const isNameValid = lampostNameField.validate();
        if (!isCodeValid || !isNameValid) {
            return; // Ngừng lại nếu có lỗi
        }
        console.log('dataEditColumn',this.dataEditColumn)
        manager.rest.api.LamppostResource.update(this.dataEditColumn?.lamppostId,objectPush)
            .then((response) => {
                this.currentPage = 1; // Reset to first page after creation
                this.fetchLightColumn(this.currentPage); // Fetch updated data
                this.isEditDialogOpen  =false
                console.log('Tạo thành công');
                this.showCustomNotification("Sửa cột đèn thành công"); // Success notification
            })
            .catch((error) => {
                console.error('Lỗi khi tạo cột đèn:', error);
            });

    }
    @state() selectDialog
    @state() selectDialogInfo
    openDeleteDialog(user) {
        console.log('user',user)
        this.isDeleteDialogOpen = true;
        this.selectDialog = user
    }
    openDeleteDialogInfo(user) {
        console.log('user',user)
        this.isDeleteDialogInfoOpen = true;
        this.selectDialogInfo = user
    }
    openCreateDialog() {
        this.codeColumnDialog = undefined
        this.nameColumnDialog = undefined
        this.isCreateDialogOpen = true;
    }
    openCreateDialogInfo(){
        this.lamtypeInfo  = undefined
        this.nemaInfo = undefined
        this.startDateInfo = new Date().toISOString().split('T')[0]
        this.endDateInfo  = new Date().toISOString().split('T')[0]
        this.descriptionInfo  =undefined
        this.isCreateDialogInfoOpen = true
    }
    openEditDialogInfo(item){
        console.log('item',item)
        this.idEditNema = item.assetId
   this.lamtypeInfo  =item.lampTypeId
    this.nemaInfo = item.assetId
    this.startDateInfo = this.formatDateChoose(item.startDate)
   this.endDateInfo  =this.formatDateChoose(item.endDate)
        this.descriptionInfo  =item.description
        this.dataEditInfo = item
        this.isEditDialogInfoOpen = true
    }
    private responsiveSteps: any = [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if layout's width exceeds 500px
        { minWidth: '500px', columns: 2 },
    ];
    @state() itemsStatus = [
        { id: 1, name: 'Hoạt động' },
        { id: 0, name: 'Dừng hoạt động' }
    ];
    @state() codeColumnDialog
    @state() nameColumnDialog
    @state() statusDidalog
    @state() description
    @state() dataEditColumn
    @state() dataNemaAndLocation
    @state() lamtypeInfo
    @state() nemaInfo
    @state() startDateInfo
    @state() endDateInfo
    @state() descriptionInfo
    @state() dataEditInfo
    openEditDialog(item){
        this.dataEditColumn = item
        this.codeColumnDialog = item.lamppostCode
        this.nameColumnDialog = item.lamppostName
        this.statusDidalog = item.active
        this.description = item.description
        console.log('dataEditColumn',item)
        this.isEditDialogOpen  =true
    }
    handleLampType(event) {
        this.lamtypeInfo = event.target.value
        manager.rest.api.LamppostResource.getLightByLamppostType(event.target.value,this.infoTable.routeInfo.id)
            .then((response) => {
                this.dataNemaAndLocation = response.data
                console.log('response', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    formCreate(){
        return html`
        <vaadin-dialog-overlay ?opened="${this.isCreateDialogOpen}" @opened-changed="${this.handleOpenedChangedCreate}" id="myDialog">
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
                        <p style="padding: 0;color: white">Tạo mới cột đèn</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isCreateDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                id="lampostCode"
                                required
                                error-message="Mã cột không được để trống"
                                class="required required-field"
                                maxlength="10"
                                label="Mã Cột"
                                .value="${this.codeColumnDialog}"
                                @input="${(e) => this.codeColumnDialog = e.target.value}">
                        </vaadin-text-field>

                        <vaadin-text-field
                                id="lampostName"
                                required
                                error-message="Tên cột không được để trống"
                                class="required required-field"
                                maxlength="10"
                                label="Tên Cột"
                                .value="${this.nameColumnDialog}"
                                @input="${(e) => this.nameColumnDialog = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-combo-box
                                label="Trạng thái"
                                clear-button-visible
                                .value="${this.statusDidalog}"
                                placeholder="Chọn trạng thái"
                                .items="${this.itemsStatus}"
                                @change="${(e)=>this.statusDidalog = e.target.value}"
                                item-label-path="name"
                                item-value-path="id"
                               ></vaadin-combo-box>
                        <vaadin-combo-box
                                style="visibility: hidden"
                                clear-button-visible
                                placeholder="${i18next.t("All status")}"
                                .items="${this.itemsStatus}"
                                item-label-path="name"
                                item-value-path="id"
                        ></vaadin-combo-box>
                        <vaadin-text-area
                                colspan="2"
                                label="Mô tả"
                                .value="${this.description}"
                                @input="${(e)=>this.description = e.target.value}"
                        ></vaadin-text-area>

                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isCreateDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmCreate()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    updateEndDateMin() {
        const endPicker:any = this.shadowRoot.querySelector('vaadin-date-picker[label="Ngày kết thúc"]');
        if (endPicker) {
            endPicker.min = this.startDateInfo;
            if (this.endDateInfo && this.endDateInfo < this.startDateInfo) {
                this.endDateInfo = this.startDateInfo; // reset nếu end nhỏ hơn start
            }
        }
    }
    formCreateInfo(){
        return html`
        <vaadin-dialog-overlay ?opened="${this.isCreateDialogInfoOpen}" @opened-changed="${this.handleOpenedChangedCreateInfo}" id="myDialog">
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
                        <p style="padding: 0;color: white">${this.infoRow?.lamppostName} - ${this.infoRow?.lamppostCode}</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isCreateDialogInfoOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-combo-box
                                id="lamtypeInfo"
                                label="Loại đèn"
                                class="required required-field"
                                required error-message="Loại đèn không được để trống"
                                .items="${this.listLampType}"
                                .value="${this.lamtypeInfo}"
                                @value-changed="${this.handleLampType}"
                                item-label-path="lampTypeName"
                                item-value-path="id"
                        ></vaadin-combo-box>
                        <vaadin-combo-box
                                id="lamtypeName"
                                label="Tên đèn(Nema)"
                                class="required required-field"
                                required error-message="Tên đèn không được để trống"
                                .items="${this.dataNemaAndLocation}"
                                .value="${this.nemaInfo}"
                                @value-changed="${(e)=>this.nemaInfo = e.target.value}"
                                item-label-path="name"
                                item-value-path="id"
                        ></vaadin-combo-box>
                        <vaadin-date-picker  .value="${this.startDateInfo}" label="Ngày bắt đầu"   @value-changed="${(e) => {
                            this.startDateInfo = e.target.value;
                            this.updateEndDateMin(); // cập nhật min cho ngày kết thúc
                        }}">
                        </vaadin-date-picker>
                        <vaadin-date-picker .min="${this.startDateInfo}" .value="${this.endDateInfo}" label="Ngày kết thúc" @value-changed="${(e)=>this.endDateInfo = e.target.value}">
                        </vaadin-date-picker>
                        <vaadin-text-area
                                colspan="2"
                                label="Mô tả"
                                .value="${this.descriptionInfo}"
                                @input="${(e)=>this.descriptionInfo = e.target.value}"
                        ></vaadin-text-area>
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;margin: 10px 20px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isCreateDialogInfoOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmCreateInfo()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formEditInfo(){
        console.log('dataInfo',this.dataEditInfo)
        return html`
        <vaadin-dialog-overlay ?opened="${this.isEditDialogInfoOpen}" @opened-changed="${this.handleOpenedChangedEditInfo}" id="myDialog">
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
                        <p style="padding: 0;color: white">${this.infoRow?.lamppostName} - ${this.infoRow?.lamppostCode}</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isEditDialogInfoOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <div style="margin-top: 10px">
                            Loại đèn: ${this.dataEditInfo?.lampTypeName}
                        </div>
                        <div>
                            Tên đèn: ${this.dataEditInfo?.name}
                        </div>
                        <vaadin-date-picker  .value="${this.startDateInfo}" label="Ngày bắt đầu"   @value-changed="${(e) => {
                            this.startDateInfo = e.target.value;
                            this.updateEndDateMin(); // cập nhật min cho ngày kết thúc
                        }}">
                        </vaadin-date-picker>
                        <vaadin-date-picker .min="${this.startDateInfo}" .value="${this.endDateInfo}" label="Ngày kết thúc" @value-changed="${(e)=>this.endDateInfo = e.target.value}">
                        </vaadin-date-picker>
                        <vaadin-text-area
                                colspan="2"
                                label="Mô tả"
                                .value="${this.descriptionInfo}"
                                @input="${(e)=>this.descriptionInfo = e.target.value}"
                        ></vaadin-text-area>
                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;margin: 10px 20px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isEditDialogInfoOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmEditInfo()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formEdit(){
        return html`
        <vaadin-dialog-overlay ?opened="${this.isEditDialogOpen}" @opened-changed="${this.handleOpenedChangedEdit}" id="myDialog">
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
                        <p style="padding: 0;color: white">Chỉnh sửa cột đèn</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isEditDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="padding-bottom: 19px;margin: 0 20px;gap: 10px">
                        <vaadin-text-field
                                .value="${this.codeColumnDialog}"
                                id="lampostCode"
                                required
                                error-message="Mã cột không được để trống"
                                class="required required-field"
                                maxlength="10"
                                label="Mã Cột"
                                @input="${(e) => this.codeColumnDialog = e.target.value}">
                        </vaadin-text-field>

                        <vaadin-text-field
                                .value="${this.nameColumnDialog}"
                                id="lampostName"
                                required
                                error-message="Tên cột không được để trống"
                                class="required required-field"
                                maxlength="10"
                                label="Tên Cột"
                                @input="${(e) => this.nameColumnDialog = e.target.value}">
                        </vaadin-text-field>
                        <vaadin-combo-box
                                label="Trạng thái"
                                clear-button-visible
                                placeholder="${i18next.t("All status")}"
                                .items="${this.itemsStatus}"
                                .value="${this.statusDidalog ? 1 :0}"
                                @change="${(e)=>this.statusDidalog = e.target.value}"
                                item-label-path="name"
                                item-value-path="id"
                               ></vaadin-combo-box>
                        <vaadin-combo-box
                                style="visibility: hidden"
                                clear-button-visible
                                placeholder="${i18next.t("All status")}"
                                .items="${this.itemsStatus}"
                                item-label-path="name"
                                item-value-path="id"
                        ></vaadin-combo-box>
                        <vaadin-text-area
                                .value="${this.description}"
                                colspan="2"
                                label="Mô tả"
                                @input="${(e)=>this.description = e.target.value}"
                        ></vaadin-text-area>

                    </vaadin-form-layout>
                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isEditDialogOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${()=>this.confirmEdit()}">Lưu</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formDelete(){
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDeleteDialogOpen}" @opened-changed="${this.handleOpenedChangedDeleteInfo}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn xóa <span style="font-weight: bold">${this.selectDialog?.lamppostName}</span>  này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${this.cancelDelete}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDelete}">Xóa</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    formDeleteInfo(){
        console.log('selectDialogInfo',this.selectDialogInfo)
        return html`
            <vaadin-dialog-overlay ?opened="${this.isDeleteDialogInfoOpen}" @opened-changed="${this.handleOpenedChanged}">
                <div style="text-align: center;width: 400px">
                    <div style="display: flex;justify-content: space-between;align-items: center;background: #4D9D2A">
                        <p style="visibility: hidden;padding: 0">abc</p>
                        <p style="padding: 0;color: white">Xác nhận</p>
                        <or-icon style="cursor: pointer;color: white;margin-right: 10px" icon="close" @click="${()=> this.isDeleteDialogInfoOpen = false}" style="color:white;margin-right: 10px"></or-icon>
                    </div>
                    <p style="padding: 0">Bạn có chắc chắn muốn xóa <span style="font-weight: bold">${this.selectDialogInfo?.name}</span>  này?</p>

                    <div style="display: flex; justify-content: space-evenly; gap: 10px;margin-bottom: 10px">
                        <vaadin-button style="cursor: pointer;background: #d9d9d9;color:black" @click="${()=>this.isDeleteDialogInfoOpen = false}">Hủy</vaadin-button>
                        <vaadin-button style="cursor: pointer;background: #4d9d2a;color:white" @click="${this.confirmDeleteInfo}">Xóa</vaadin-button>
                    </div>
                </div>
            </vaadin-dialog-overlay>
        `
    }
    @state() infoRow
    updated(){
        console.log('infoRow',this.infoRow)
    }
    showInfo(item){
        this.infoRow = item
        manager.rest.api.LamppostResource.getLightsByLamppostId(item.lamppostId)
            .then((response) => {
                this.dataInfoRow = response.data
                console.log('getRealm234', response.data)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        let lamppostId = item.lamppostId;

        Promise.all([
            manager.rest.api.LamppostResource.getWattageActual({lamppostId:lamppostId}),
            manager.rest.api.LamppostResource.getWattageProduct({lamppostId:lamppostId})
        ])
            .then(([actualRes, productRes]) => {
                const getWattageActual = actualRes.data.wattageActual;
                const getWattageProduct = productRes.data.wattageProduction;
                const fakeDataChart1 = {
                    labels: ["Lý thuyết","Thực tế"],
                    datasets: [{
                        label:'wattage',
                        data:[getWattageProduct,getWattageActual],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                        ],
                        barPercentage: 0.5,       // Độ rộng thanh (0.1 - 1.0)
                        categoryPercentage: 0.8 ,  // Khoảng cách giữa các thanh
                    }]
                };
                this.chart.data.labels = fakeDataChart1.labels;
                this.chart.data.datasets = fakeDataChart1.datasets;
                this.chart.options = {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Năng lượng tiêu thụ đèn tháng 5/2025',
                        },
                        datalabels: {
                            anchor: 'center',        // Gắn vào giữa thanh
                            align: 'center',         // Căn vào giữa thanh
                            offset: -5,           // Dịch lên trên (âm = lên)
                            formatter: function(value) {
                                return value;
                            },
                        }
                    }
                };
                this.chart.update()

                console.log('getWattageActual2', getWattageActual);
                console.log('getWattageProduct2', getWattageProduct);

                // Dùng 2 giá trị này ở đây
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
    }
    render() {
        console.log('lightItem',this.infoRow)
        return html`
            ${this.formCreate()}
            ${this.formDelete()}
            ${this.formEdit()}
            ${this.formCreateInfo()}
            ${this.formEditInfo()}
            ${this.formDeleteInfo()}
            <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
                <div>
                    <div style="display: flex;justify-content: flex-end;margin: 10px 0px">
                        <vaadin-button style="background: #4d9d2a;color: white;margin-right: 10px" @click="${() => this.openCreateDialog()}">
                            <or-icon icon="plus" slot="prefix"></or-icon>
                            <or-translate value="Tạo mới"></or-translate>
                        </vaadin-button>
                    </div>
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã cột</th>
                                <th>Tên cột</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.lightItems
                                    ? this.lightItems.map((item, index) => {
                                        const rowNumber = (this.currentPage - 1) * 5 + index + 1
                                        return html`
                                            <tr>
                                                <td>${rowNumber}</td>
                                                <td @click="${()=>this.showInfo(item)}">
                                                    ${item.lamppostCode}
                                                </td>
                                                <td @click="${()=>this.showInfo(item)}">${item.lamppostName}</td>
                                                <td>${item.active? "Hoạt động" : "Dừng hoạt động"}</td>
                                                <td>
                                                    <vaadin-icon
                                                            icon="vaadin:pencil"
                                                            style="color: black; cursor: pointer; margin: 0 5px"
                                                            @click="${() => this.openEditDialog(item)}"
                                                    ></vaadin-icon>
                                                    <vaadin-icon
                                                            icon="vaadin:trash"
                                                            style="color: black; cursor: pointer"
                                                            @click="${() => this.openDeleteDialog(item)}"
                                                    ></vaadin-icon>
                                                </td>
                                            </tr>
                                        `;
                                    })
                                    : html`
                                        <tr>
                                            <td colspan="6">
                                                <div
                                                        colspan="6"
                                                        style="height: 200px; display: flex; align-items: center; justify-content: center"
                                                >
                                                    Không có dữ liệu
                                                </div>
                                            </td>
                                        </tr>`}

                            </tbody>
                        </table>
                        ${this.renderPagination()}
                    </div>
                </div>
                <div>
                 
                    <p style="text-align: center;font-size: 20px;font-weight: bold">
                        ${this.infoRow?.lamppostName} <span style="${this.infoRow?.active
                            ? 'color: green;font-size:16px'
                            : 'color:red;font-size:16px'}"">${this.infoRow?.active ? "Hoạt động" : "Dừng hoạt động"}</span>
                    </p>
                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}"
                                        style="border-bottom: 1px solid #D9D9D9;padding-bottom: 19px">
                        <div style="display: flex;flex-direction: column">
                            <p>Mã cột : ${this.infoRow?.lamppostCode}</p>
                            <p>Mô tả : ${this.infoRow?.description}</p>
                        </div>
                        <div style="display: flex;flex-direction: column">
                            <p>Năng lượng tiêu thụ</p>
                            <canvas id="myChart"></canvas>
                        </div>
                    </vaadin-form-layout>
                    <p style="font-size: 20px;font-weight: bold">
                        Hồ sơ chi tiết cột đèn
                    </p>
                    <vaadin-button style="background: #4d9d2a;color: white;margin-right: 10px" @click="${() => this.openCreateDialogInfo()}">
                        <or-icon icon="plus" slot="prefix"></or-icon>
                        <or-translate value="Thêm hồ sơ"></or-translate>
                    </vaadin-button>
                    <table>
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên đèn(Nema)</th>
                            <th>Tên loại đèn</th>
                            <th>Ngày bắt đầu</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.dataInfoRow
                                ? this.dataInfoRow.map((item, index) => {
                                    return html`
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${item.name}</td>
                                            <td>
                                                ${item.lampTypeName}
                                            </td>
                                            <td>${this.formatDate(item.startDate)}</td>
                                            <td>
                                                <vaadin-icon
                                                        icon="vaadin:pencil"
                                                        style="color: black; cursor: pointer; margin: 0 5px"
                                                        @click="${() => this.openEditDialogInfo(item)}"
                                                ></vaadin-icon>
                                                <vaadin-icon
                                                        icon="vaadin:trash"
                                                        style="color: black; cursor: pointer"
                                                        @click="${() => this.openDeleteDialogInfo(item)}"
                                                ></vaadin-icon>
                                            </td>
                                        </tr>
                                    `;
                                })
                                : html`
                                    <tr>
                                        <td colspan="6">
                                            <div
                                                    colspan="6"
                                                    style="height: 200px; display: flex; align-items: center; justify-content: center"
                                            >
                                                Không có dữ liệu
                                            </div>
                                        </td>
                                    </tr>`}

                        </tbody>
                    </table>
                    
                </div>
            </vaadin-form-layout>`
    }
}

