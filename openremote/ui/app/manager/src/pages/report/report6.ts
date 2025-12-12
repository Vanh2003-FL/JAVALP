import { LitElement, html, css } from "lit";
import { customElement, property,state} from "lit/decorators.js";
import i18next from "i18next";
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
Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,PieController,
    ArcElement,);
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import "@vaadin/form-layout"
import "@vaadin/text-field"
import "@vaadin/password-field"
import "@vaadin/card"
import "@vaadin/scroller"
import "@vaadin/progress-bar"
import"@openremote/or-icon"
import"@vaadin/button"
import "@vaadin/progress-bar"
import manager from "@openremote/core";
import { CabinetDto } from "@openremote/model";
pdfMake.vfs = pdfFonts.vfs;
@customElement("chartbycabinet-date")
export class MyElement extends LitElement {
    @property({ type: String }) name = "LitElement";
    @state() ngayThangNam = "";
    @state() gio = "";
    @state() intervalId: any = null;
    @state() listLight = [];
    @state() loading = false;
    @state() dataChart = {};
    @state() dataPha : CabinetDto = {};
    @state() nameCabinet = "";
    private dateNow = `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`
    @state()  dataRoad = []
    @state()  dataCabinet = []
    @state()  idRoad =""
    @state()  idCabinet =""
    @state()  dataFilterCabinet = []
    private chart: Chart | null = null
    private chart2: Chart | null = null
    private chart3: any | null = null
    private chart4: any | null = null
    private chart5: any | null = null
    private needleValue: number = 0; // Giá trị kim
    private needleValue2: number = 0; // Giá trị kim
    private needleValue5: number = 0; // Giá trị kim
    private responsiveSteps: any[] = [
        { minWidth: 0, columns: 1 },
        { minWidth: '200px', columns: 3 },
    ];
    private responsiveSteps2: any[] = [
        { minWidth: 0, columns: 1 },
        { minWidth: '500px', columns: 4},
    ];
    private responsiveSteps2c: any[] = [
        { minWidth: 0, columns: 1 },
        { minWidth: '500px', columns: 4},
    ];
    private responsiveSteps3: any[] = [
        { minWidth: 0, columns: 1 },
        { minWidth: '100px', columns: 2},
    ];
    static styles = css`
        :host {
            display: block;
            box-sizing: border-box;
            margin:0;
            padding:0;
            height: calc(100vh - 50px);
        }
        .custom-layout{
            display: flex
        ;
            flex-direction: row;
            height: calc(100vh - 96px);
        }
        canvas {
            height: 266px !important;
            //pointer-events: auto;
        }
        .card-custom{
            border: 1px solid green;
            display: block;
            background: white;
            padding: 20px;
            border-radius: 10px;
        }
        #submitBtn{
            width: 150px !important;
        }
        /* Thay đổi màu thanh cuộn */
        ::-webkit-scrollbar {
            width: 5px; /* Độ rộng thanh cuộn dọc */
            height: 5px; /* Độ cao thanh cuộn ngang */
        }

        /* Thay đổi màu nền thanh cuộn */
        ::-webkit-scrollbar-track {
            background: #f1f1f1; /* Màu nền */
            border-radius: 10px;
        }

        /* Thay đổi màu phần kéo cuộn */
        ::-webkit-scrollbar-thumb {
            background: #c1c1c1; /* Màu của thanh cuộn */
            border-radius: 10px;
        }

        /* Hover vào thanh cuộn */
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        .chart-container{
            //width: 420px !important;
            //max-width: 500px !important;
            overflow: hidden; /* Ngăn nội dung tràn ra ngoài */
            border: 1px solid green;
            border-radius: 10px;
            margin-top:10px
        }
        @media (max-height: 900px) {
            canvas {
                height: 161px !important; /* Khi màn hình có chiều cao dưới 800px */
            }
            vaadin-scroller{
                height: 455px !important;
            }
        }
    `;
    updateNeedle(value: number): void {
        this.needleValue = value;
        if (this.chart3) {
            this.chart3.update(); // Cập nhật biểu đồ
        }
    }
    updateNeedle2(value: number): void {
        this.needleValue2 = value;
        if (this.chart4) {
            this.chart4.update(); // Cập nhật biểu đồ
        }
    }
    updateNeedle5(value: number): void {
        this.needleValue5 = value;
        if (this.chart5) {
            this.chart5.update(); // Cập nhật biểu đồ
        }
    }
    @state() realmSelected
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('session-changed', this._onSessionChanged);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('session-changed', this._onSessionChanged);
    }

    _onSessionChanged = (e: CustomEvent) => {
        const { key, value } = e.detail;
        if (key === 'realm') {
            this.realmSelected = value
            this.idRoad = undefined
            this.idCabinet = undefined
            manager.rest.api.RouteInfoResource.getAll({data:{realm: value}})
                .then((response) => {
                    const routeInfoList = response.data.map(item => item.routeInfo);
                    console.log('routeInfoList',routeInfoList)
                    this.dataRoad = routeInfoList
                    console.log('getAlldataRoute', response)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:value,type:"ElectricalCabinetAsset"}}})
                .then((response) => {
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                    this.idCabinet = cabinetAssets?.[0].id
                    console.log('getAllCabinets', cabinetAssets)
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
            this.handleSearch()
        }
    }
    async firstUpdated() {
        this.realmSelected = window.sessionStorage.getItem('realm')
        manager.rest.api.UserResource.getCurrent()
            .then((response) => {
                console.log('roadSetup2', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        manager.rest.api.RouteInfoResource.getAll({data:{realm: this.realmSelected}})
            .then((response) => {
                const routeInfoList = response.data.map(item => item.routeInfo);
                console.log('routeInfoList',routeInfoList)
                this.dataRoad = routeInfoList
                console.log('getAlldataRoute', response)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        const fetchData = () => {
            console.log("2p 1 lan",this.idCabinet)
            manager.rest.api.AssetDatapointResource.getDashboardReport({
                cabinetId:this.idCabinet,
                realm:this.realmSelected
            })
                .then((response) => {
                    console.log('response',response.data)
                    const generateRandomColor = () => {
                        // Hue (màu sắc): 0-360 độ, ngẫu nhiên để có các màu khác nhau
                        const hue = Math.floor(Math.random() * 360);
                        // Saturation (độ bão hòa): 50-100% để màu không quá nhạt
                        const saturation = Math.floor(Math.random() * 51) + 50; // 50-100
                        // Lightness (độ sáng): 40-70% để tránh màu quá tối hoặc quá sáng
                        const lightness = Math.floor(Math.random() * 31) + 40; // 40-70

                        // Chuyển HSL sang RGB
                        const hslToRgb = (h, s, l) => {
                            s /= 100;
                            l /= 100;
                            const c = (1 - Math.abs(2 * l - 1)) * s;
                            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                            const m = l - c / 2;
                            let r, g, b;

                            if (h >= 0 && h < 60) {
                                r = c; g = x; b = 0;
                            } else if (h >= 60 && h < 120) {
                                r = x; g = c; b = 0;
                            } else if (h >= 120 && h < 180) {
                                r = 0; g = c; b = x;
                            } else if (h >= 180 && h < 240) {
                                r = 0; g = x; b = c;
                            } else if (h >= 240 && h < 300) {
                                r = x; g = 0; b = c;
                            } else {
                                r = c; g = 0; b = x;
                            }

                            // Chuyển sang giá trị RGB (0-255)
                            r = Math.round((r + m) * 255);
                            g = Math.round((g + m) * 255);
                            b = Math.round((b + m) * 255);

                            return `rgb(${r}, ${g}, ${b})`;
                        };

                        return hslToRgb(hue, saturation, lightness);
                    };
                    this.listLight = response.data.lightDtos
                    this.dataPha = response.data.cabinetDto
                    const formattedData = response.data.dataChart.wattageData.map(item => ({
                        label: item.label,
                        data: item.data,
                        borderColor:generateRandomColor(),
                    }));
                    const fakeDataChart1 = {
                        labels: response.data.dataChart.xAxis,
                        datasets:formattedData
                    };
                    console.log('fake',response.data.cabinetDto?.amperagePhase1)
                    this.chart.data.labels = fakeDataChart1.labels;
                    this.chart.data.datasets = fakeDataChart1.datasets;
                    this.chart.update()
                    this.nameCabinet = response.data.name
                    const formattedData2 = response.data.dataChart.amperageData.map(item => ({
                        label: item.label,
                        data: item.data,
                        borderColor:generateRandomColor(),
                    }));
                    const fakeDataChart2 = {
                        labels: response.data.dataChart.xAxis,
                        datasets:formattedData2
                    };
                    this.chart2.data.labels = fakeDataChart2.labels;
                    this.chart2.data.datasets = fakeDataChart2.datasets;
                    this.chart2.update()
                    console.log('response', response)
                    this.updateNeedle(typeof response.data.cabinetDto?.voltagePhase1  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase1)
                    this.updateNeedle2(typeof response.data.cabinetDto?.voltagePhase2  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase2)
                    this.updateNeedle5(typeof response.data.cabinetDto?.voltagePhase3  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase3)
                    this.ngayThangNam = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`;
                    this.gio = `${new Date().getHours()}:${new Date().getMinutes()}`;
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                })
                .finally(() => {
                    this.loading = false; // Dừng loading
                });
        };
        manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"}}})
            .then((response) => {
                const cabinetAssets = response.data.map(item => item.cabinetAsset);
                this.dataFilterCabinet = cabinetAssets
                setTimeout(() => {
                    this.idCabinet = cabinetAssets?.[0]?.id || null;
                    if (this.idCabinet) {
                        fetchData();
                    }
                }, 0);
                console.log('getAllCabinets', cabinetAssets)
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });
        console.log('skid', this.idCabinet)
        //Chart1:Biểu đồ công xuất tủ hiện tại
        const canvas = this.renderRoot.querySelector("#myChart");
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        this.chart =  new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio:false,
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
                            text: 'Công suất (kW)', // Nhãn trục Y
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        display: false // <<< Chặn vẽ số trên biểu đồ
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            label: function (tooltipItem) {
                                return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ công suất tủ hiện tại',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        },
                        color: '#333'
                    },
                    legend: {
                        position: 'bottom'
                    },
                },
            }
        });

        //Chart2:Biểu đồ dòng điện tủ hiện tại
        const canvas2 = this.renderRoot.querySelector("#myChart2");
        if (!(canvas2 instanceof HTMLCanvasElement)) return;
        const ctx2 = canvas2.getContext("2d", { willReadFrequently: true });
        if (!ctx2) return;
        this.chart2 =  new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio:false,
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
                            text: 'Dòng điện (A)', // Nhãn trục Y
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#333'
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        display: false // <<< Chặn vẽ số trên biểu đồ
                    },
                    tooltip: {
                        mode: 'nearest', // Chỉ hiển thị tooltip khi hover vào điểm gần nhất
                        intersect: true, // Chỉ hiển thị khi di chuột vào điểm
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                            }
                        }
                    },
                    title: {
                        display: true, // Hiển thị tiêu đề
                        text: 'Biểu đồ dòng điện tủ hiện tại', // Nội dung tiêu đề
                        font: {
                            size: 12, // Cỡ chữ tiêu đề
                            weight: 'bold' // Độ đậm
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        },
                        color: '#333' // Màu chữ tiêu đề
                    },
                    legend: {
                        position: 'bottom' // Đặt legend ở dưới biểu đồ
                    },
                }
            }
        });
        //Chart3:Pha 1
        const canvas3 = this.renderRoot.querySelector("#myChart3");
        if (!(canvas3 instanceof HTMLCanvasElement)) return;
        if ((canvas3 instanceof HTMLCanvasElement)){
            const ctx3 = canvas3.getContext("2d");
            if (!ctx3) return;

            let needleValue = 50; // Kim ban đầu chỉ lên trên (90°)
            // Plugin vẽ kim
            const maxPhaseValue = 500; // Tổng giá trị của các pha

// Xác định giá trị normalized dựa trên các pha

            const needlePlugin = {
                id: 'needle',
                afterDraw(chart) {
                    const { ctx, _metasets } = chart;
                    if (!ctx || !_metasets || !_metasets[0] || !_metasets[0].data[0]) return;

                    const meta = _metasets[0].data[0];
                    const centerX = meta.x;
                    const centerY = meta.y;
                    const needleLength = meta.outerRadius * 0.9;
                    const getNormalizedValue = (value) => {
                        if (value <= 220) {
                            return (value / 220) * 0.33; // Pha 1 (0% → 33%)
                        } else if (value <= 260) {
                            return 0.33 + ((value - 220) / (260 - 220)) * 0.33; // Pha 2 (34% → 66%)
                        } else {
                            return 0.66 + ((value - 260) / (500 - 260)) * 0.34; // Pha 3 (67% → 100%)
                        }
                    };

                    const normalizedValue = getNormalizedValue(needleValue);
                    const angle = normalizedValue * Math.PI - Math.PI / 2;

                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -needleLength);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.restore();
                }
            };
// Kiểm tra nếu biểu đồ đã tồn tại trước khi tạo mới
            if (this.chart3) {
                this.chart3.destroy(); // Xóa biểu đồ cũ
            }

// Tạo biểu đồ
            this.chart3 = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Pha 1', 'Pha 2', 'Pha 3'],
                    datasets: [{
                        label: 'Công suất',
                        data: [220, 40, 140],
                        backgroundColor: ['green', 'yellow', 'red']
                    }],
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    rotation: -90,  // Xoay để bắt đầu từ 90°
                    circumference: 180,
                    cutout: '60%',
                    plugins: {
                        datalabels: {
                            display: false // <<< Chặn vẽ số trên biểu đồ
                        },
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [needlePlugin]
            });


            this.updateNeedle = function(value) {
                needleValue = value;
                this.chart3.update(); // Cập nhật biểu đồ
            };
        }
//Chart3:Pha 2
        const canvas4 = this.renderRoot.querySelector("#myChart4");
        if (!(canvas4 instanceof HTMLCanvasElement)) return;
        if ((canvas4 instanceof HTMLCanvasElement)){
            const ctx4 = canvas4.getContext("2d");

            if (!ctx4) return;

            let needleValue = 50; // Kim ban đầu chỉ lên trên (90°)
            // Plugin vẽ kim
            const maxPhaseValue = 500; // Tổng giá trị của các pha

// Xác định giá trị normalized dựa trên các pha

            const needlePlugin2 = {
                id: 'needle2',
                afterDraw(chart) {
                    const { ctx, _metasets } = chart;
                    if (!ctx || !_metasets || !_metasets[0] || !_metasets[0].data[0]) return;

                    const meta = _metasets[0].data[0];
                    const centerX = meta.x;
                    const centerY = meta.y;
                    const needleLength = meta.outerRadius * 0.9;
                    const getNormalizedValue = (value) => {
                        if (value <= 220) {
                            return (value / 220) * 0.33; // Pha 1 (0% → 33%)
                        } else if (value <= 260) {
                            return 0.33 + ((value - 220) / (260 - 220)) * 0.33; // Pha 2 (34% → 66%)
                        } else {
                            return 0.66 + ((value - 260) / (500 - 260)) * 0.34; // Pha 3 (67% → 100%)
                        }
                    };

                    const normalizedValue = getNormalizedValue(needleValue);
                    const angle = normalizedValue * Math.PI - Math.PI / 2;

                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -needleLength);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.restore();
                }
            };

// Đăng ký plugin mới
            // Nếu plugin đã tồn tại, hủy đăng ký trước


// Sau đó, đăng ký lại plugin



// Kiểm tra nếu biểu đồ đã tồn tại trước khi tạo mới
            if (this.chart4) {
                this.chart4.destroy();
            }

// Tạo biểu đồ mới
            this.chart4 = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: ['Pha 1', 'Pha 2', 'Pha 3'],
                    datasets: [{
                        label: 'Công suất',
                        data: [220, 40, 140],
                        backgroundColor: ['green', 'yellow', 'red']
                    }]
                },
                options: {
                    responsive: false,
                    rotation: -90,
                    maintainAspectRatio: false,
                    circumference: 180,
                    cutout: '60%',
                    plugins: {
                        datalabels: {
                            display: false // <<< Chặn vẽ số trên biểu đồ
                        },
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [needlePlugin2] // ✅ Sử dụng đối tượng plugin thay vì chuỗi
            });


            this.updateNeedle2 = function(value) {
                needleValue = value;
                this.chart4.update(); // Cập nhật biểu đồ
            };

        }


        const canvas5 = this.renderRoot.querySelector("#myChart5");
        if (!(canvas5 instanceof HTMLCanvasElement)) return;
        if ((canvas5 instanceof HTMLCanvasElement)){
            const ctx5 = canvas5.getContext("2d");

            if (!ctx5) return;

            let needleValue = 50;
            // Plugin vẽ kim
            const maxPhaseValue = 500; // Tổng giá trị của các pha

// Xác định giá trị normalized dựa trên các pha

            const needlePlugin = {
                id: 'needle5',
                afterDraw(chart) {
                    const { ctx, _metasets } = chart;
                    if (!ctx || !_metasets || !_metasets[0] || !_metasets[0].data[0]) return;

                    const meta = _metasets[0].data[0];
                    const centerX = meta.x;
                    const centerY = meta.y;
                    const needleLength = meta.outerRadius * 0.9;
                    const getNormalizedValue = (value) => {
                        if (value <= 220) {
                            return (value / 220) * 0.33; // Pha 1 (0% → 33%)
                        } else if (value <= 260) {
                            return 0.33 + ((value - 220) / (260 - 220)) * 0.33; // Pha 2 (34% → 66%)
                        } else {
                            return 0.66 + ((value - 260) / (500 - 260)) * 0.34; // Pha 3 (67% → 100%)
                        }
                    };

                    const normalizedValue = getNormalizedValue(needleValue);
                    const angle = normalizedValue * Math.PI - Math.PI / 2;

                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -needleLength);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.restore();
                }
            };
// Đăng ký plugin mới
            // Nếu plugin đã tồn tại, hủy đăng ký trước

// Sau đó, đăng ký lại plugin


// Kiểm tra nếu biểu đồ đã tồn tại trước khi tạo mới
            if (this.chart5) {
                this.chart5.destroy();
            }

// Tạo biểu đồ mới
            this.chart5 = new Chart(ctx5, {
                type: 'doughnut',
                data: {
                    labels: ['Pha 1', 'Pha 2', 'Pha 3'],
                    datasets: [{
                        label: 'Công suất',
                        data: [220, 40, 140],
                        backgroundColor: ['green', 'yellow', 'red']
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    rotation: -90,
                    circumference: 180,
                    cutout: '60%',
                    plugins: {
                        datalabels: {
                            display: false // <<< Chặn vẽ số trên biểu đồ
                        },
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [needlePlugin] // ✅ Sử dụng đối tượng plugin thay vì chuỗi
            });

            this.updateNeedle5 = function(value) {
                needleValue = value;
                this.chart5.update(); // Cập nhật biểu đồ
            };
        }
        //call api


        this.intervalId = setInterval(() => {
            console.log('dang bi goi lai o fistUpdate')
            fetchData();
        }, 300000)
    }
    protected handleSelectRoad(event) {
        const routeId = event.detail.value?.id || "";
        this.idRoad = routeId;
        if(this.idCabinet !== ""){
            this.idCabinet = ""
        }
        if (event.target.value) {
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"},routeInfo:{id:event.target.value}}})
                .then((response) => {
                    console.log('responseHandle',response)
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });

        }else{
            manager.rest.api.CabinetResource.getAll({data:{cabinetAsset:{realm:this.realmSelected,type:"ElectricalCabinetAsset"}}})
                .then((response) => {
                    console.log('responseHandle',response)
                    const cabinetAssets = response.data.map(item => item.cabinetAsset);
                    this.dataFilterCabinet = cabinetAssets
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                });
        }
        console.log('this.dataFilterCabinet', this.dataFilterCabinet)
        if (!event.detail.value) {
            this.idRoad = ""
        }
    }
    protected handleCabinet(e) {
        if (!e.detail.value) {
            this.idCabinet = ""
        } else {
            this.idCabinet = e.detail.value.id;
        }
        console.log('Chọn tủ:', this.idCabinet)
    }

    stopAutoFetch() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Đã hủy auto fetch!");
        }
    }
    handleSearch() {
        const comboBox = this.shadowRoot?.querySelector('#nameField') as any; // Ép kiểu để truy cập validate()
        if (comboBox) {
            const isValid = comboBox.validate();
            if (!isValid) {

            }else{
                const fetchData = () => {
                    console.log("2p 1 lan")
                    this.loading = true

                    manager.rest.api.AssetDatapointResource.getDashboardReport({
                        cabinetId:this.idCabinet,
                        realm:this.realmSelected
                    })
                        .then((response) => {
                            const generateRandomColor = () => {
                                // Hue (màu sắc): 0-360 độ, ngẫu nhiên để có các màu khác nhau
                                const hue = Math.floor(Math.random() * 360);
                                // Saturation (độ bão hòa): 50-100% để màu không quá nhạt
                                const saturation = Math.floor(Math.random() * 51) + 50; // 50-100
                                // Lightness (độ sáng): 40-70% để tránh màu quá tối hoặc quá sáng
                                const lightness = Math.floor(Math.random() * 31) + 40; // 40-70

                                // Chuyển HSL sang RGB
                                const hslToRgb = (h, s, l) => {
                                    s /= 100;
                                    l /= 100;
                                    const c = (1 - Math.abs(2 * l - 1)) * s;
                                    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                                    const m = l - c / 2;
                                    let r, g, b;

                                    if (h >= 0 && h < 60) {
                                        r = c; g = x; b = 0;
                                    } else if (h >= 60 && h < 120) {
                                        r = x; g = c; b = 0;
                                    } else if (h >= 120 && h < 180) {
                                        r = 0; g = c; b = x;
                                    } else if (h >= 180 && h < 240) {
                                        r = 0; g = x; b = c;
                                    } else if (h >= 240 && h < 300) {
                                        r = x; g = 0; b = c;
                                    } else {
                                        r = c; g = 0; b = x;
                                    }

                                    // Chuyển sang giá trị RGB (0-255)
                                    r = Math.round((r + m) * 255);
                                    g = Math.round((g + m) * 255);
                                    b = Math.round((b + m) * 255);

                                    return `rgb(${r}, ${g}, ${b})`;
                                };

                                return hslToRgb(hue, saturation, lightness);
                            };
                            this.listLight = response.data.lightDtos
                            this.dataPha = response.data.cabinetDto
                            const formattedData = response.data.dataChart.wattageData.map(item => ({
                                label: item.label,
                                data: item.data,
                                borderColor:generateRandomColor(),
                            }));
                            const fakeDataChart1 = {
                                labels: response.data.dataChart.xAxis,
                                datasets:formattedData
                            };
                            console.log('fake',response.data.cabinetDto?.amperagePhase1)
                            this.chart.data.labels = fakeDataChart1.labels;
                            this.chart.data.datasets = fakeDataChart1.datasets;
                            this.chart.update()
                            this.nameCabinet = response.data.name
                            const formattedData2 = response.data.dataChart.amperageData.map(item => ({
                                label: item.label,
                                data: item.data,
                                borderColor:generateRandomColor(),
                            }));
                            const fakeDataChart2 = {
                                labels: response.data.dataChart.xAxis,
                                datasets:formattedData2
                            };
                            this.chart2.data.labels = fakeDataChart2.labels;
                            this.chart2.data.datasets = fakeDataChart2.datasets;
                            this.chart2.update()
                            console.log('response', response)
                            this.updateNeedle(typeof response.data.cabinetDto?.voltagePhase1  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase1)
                            this.updateNeedle2(typeof response.data.cabinetDto?.voltagePhase2  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase2)
                            this.updateNeedle5(typeof response.data.cabinetDto?.voltagePhase3  === "undefined" ? 0 : response.data.cabinetDto?.voltagePhase3)
                            this.ngayThangNam = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`;
                            this.gio = `${new Date().getHours()}:${new Date().getMinutes()}`;
                        })
                        .catch((error) => {
                            console.error('Lỗi khi lấy dữ liệu:', error);
                        })
                        .finally(() => {
                            this.loading = false; // Dừng loading
                        });
                };
                fetchData()
                this.stopAutoFetch();
                this.intervalId = setInterval(fetchData, 300000);

            }
        }
    }

    render() {
        console.log('idCabi',this.idCabinet)
        return html`
            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    
                    <span slot="navbar"> ${i18next.t("dashBoardReport")}</span>
                </div>
            </div>
            <div class="custom-layout">
                <vaadin-form-layout .responsiveSteps="${this.responsiveSteps2c}" style="border-bottom: 1px solid #e3e6ea;
    background: white;
    margin: 20px;
    padding: 5px 20px 5px 20px;
    border-radius: 10px;">
                    <h2 colspan="4" style="margin:10px">Thông tin tìm kiếm</h2>
                    <vaadin-combo-box
                            
                            clear-button-visible
                            label="Lộ/Tuyến"
                            item-label-path="routeName"
                            item-value-path="id"
                            .items="${this.dataRoad}"
                            .value="${this.idRoad}"
                            @selected-item-changed="${this.handleSelectRoad}"
                            style="width: 150px;"
                    ></vaadin-combo-box>
                    <vaadin-combo-box
                            id="nameField"
                            clear-button-visible
                            label="Tên tủ"
                            item-label-path="name"
                            item-value-path="id"
                            .value="${this.idCabinet}"
                            .items="${this.dataFilterCabinet}"
                            required
                            error-message="Vui lòng chọn Tên tủ"
                            @selected-item-changed="${this.handleCabinet}"
                            style="width: 150px;"
                    ></vaadin-combo-box>


                    <vaadin-button @click="${this.handleSearch}" id="submitBtn">
                        <or-icon icon="magnify" slot="prefix"></or-icon>
                        Tìm kiếm
                    </vaadin-button>
                </vaadin-form-layout>
                
                <vaadin-form-layout   .responsiveSteps="${this.responsiveSteps2}" style="
    background: white;
    padding:10px;
    margin: 20px;
    border-radius: 10px;
">
                    <vaadin-form-layout  .responsiveSteps="${this.responsiveSteps}" colspan="3" >
                        <div style="text-align: center;margin:10px 0px;font-weight: bold">
                            <div  style="${this?.dataPha.status == 'A'
                                    ? 'color:white;background: green;border: 1px solid green;padding: 5px 0px;border-radius: 10px'
                                    : this?.dataPha.status == 'M'
                                            ? 'color: yellow;border: 1px solid green;padding: 5px 0px;border-radius: 10px'
                                            : this?.dataPha.status == 'P'
                                                    ? 'color: red;border: 1px solid green;padding: 5px 0px;border-radius: 10px'
                                                    : this?.dataPha.status == 'D'
                                                            ? 'color: red;border: 1px solid green;padding: 5px 0px;border-radius: 10px'
                                                            : ''}"
                                  >Tủ điện Hoàng Minh ${this.nameCabinet ? `:` + this.nameCabinet : ``}
                            </div>
                        </div>
                        <div colspan="2"></div>
                        <vaadin-card theme="outlined"
                                     style="background: white;border-radius:10px;margin-right: 0;margin-right:5px">
                            <div style="border: 1px solid green;
    border-radius: 10px;">
                                <div slot="title" style="text-align: center;padding:10px">Pha 1</div>
                                <div style="padding:0 10px;display: flex;align-items: center">

                                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps3}"
                                                        style="padding: 0 0px 10px 20px">
                                        <div colspan="3">
                                            <or-icon icon="lightning-bolt" style="color:#ffc000"></or-icon>
                                            ${typeof this.dataPha?.voltagePhase1 === "undefined" ? 0 : this.dataPha?.voltagePhase1}
                                            (V)
                                        </div>
                                        <div colspan="3">
                                            <or-icon icon="power-plug" style="color:#289bd3"></or-icon>
                                            ${typeof this.dataPha?.amperagePhase1 === "undefined" ? 0 : this.dataPha?.amperagePhase1}
                                            (A)
                                        </div>
                                        <div colspan="3">
                                            <div style="display: flex;align-items: center">
                                                <div>
                                                    <or-icon icon="calendar-range" style="color:#f04141"></or-icon>
                                                </div>
                                                <div style="padding-left: 5px">
                                                    <div>
                                                        ${this.ngayThangNam}
                                                    </div>
                                                    <div>
                                                        ${this.gio}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </vaadin-form-layout>
                                    <div>
                                        <canvas id="myChart3" style="height: 40px !important"></canvas>
                                        <h3 style="text-align: center;margin: 0">(V)</h3>
                                    </div>
                                </div>


                            </div>

                        </vaadin-card>
                        <vaadin-card theme="outlined"
                                     style="background: white;border-radius:10px;margin: 0;margin-right:5px">
                            <div style="border: 1px solid green;
    border-radius: 10px;">
                                <div slot="title" style="text-align: center;padding:10px">Pha 2</div>
                                <div style="padding:0 10px;display: flex;align-items: center">
                                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps3}"
                                                        style="padding: 0 0px 10px 20px">
                                        <div colspan="3">
                                            <or-icon icon="lightning-bolt" style="color:#ffc000"></or-icon>
                                            ${typeof this.dataPha?.voltagePhase2 === "undefined" ? 0 : this.dataPha?.voltagePhase2}
                                            (V)
                                        </div>
                                        <div colspan="3">
                                            <or-icon icon="power-plug" style="color:#289bd3"></or-icon>
                                            ${typeof this.dataPha?.amperagePhase2 === "undefined" ? 0 : this.dataPha?.amperagePhase2}
                                            (A)
                                        </div>
                                        <div colspan="3">
                                            <div style="display: flex;align-items: center">
                                                <div>
                                                    <or-icon icon="calendar-range" style="color:#f04141"></or-icon>
                                                </div>
                                                <div style="padding-left: 5px">
                                                    <div>
                                                        ${this.ngayThangNam}
                                                    </div>
                                                    <div>
                                                        ${this.gio}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </vaadin-form-layout>
                                    <div>
                                        <canvas id="myChart4" style="height: 40px !important"></canvas>
                                        <h3 style="text-align: center;margin: 0">(V)</h3>
                                    </div>

                                </div>
                            </div>
                        </vaadin-card>
                        <vaadin-card style="background: white;border-radius:10px;margin: 0;margin-right:5px">
                            <div style="border: 1px solid green;
    border-radius: 10px;">
                                <div slot="title" style="text-align: center;padding:10px">Pha 3</div>
                                <div style="padding:0 10px;display: flex;align-items: center">
                                    <vaadin-form-layout .responsiveSteps="${this.responsiveSteps3}"
                                                        style="padding: 0 0px 10px 20px">
                                        <div colspan="3">
                                            <or-icon icon="lightning-bolt" style="color:#ffc000"></or-icon>
                                            ${typeof this.dataPha?.voltagePhase3 === "undefined" ? 0 : this.dataPha?.voltagePhase3}
                                            (V)
                                        </div>
                                        <div colspan="3">
                                            <or-icon icon="power-plug" style="color:#289bd3"></or-icon>
                                            ${typeof this.dataPha?.amperagePhase3 === "undefined" ? 0 : this.dataPha?.amperagePhase3}
                                            (A)
                                        </div>
                                        <div colspan="3">
                                            <div style="display: flex;align-items: center">
                                                <div>
                                                    <or-icon icon="calendar-range" style="color:#f04141"></or-icon>
                                                </div>
                                                <div style="padding-left: 5px">
                                                    <div>
                                                        ${this.ngayThangNam}
                                                    </div>
                                                    <div>
                                                        ${this.gio}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </vaadin-form-layout>
                                    <div>
                                        <canvas id="myChart5" style="height: 40px !important"></canvas>
                                        <h3 style="text-align: center;margin: 0">(V)</h3>
                                    </div>

                                </div>
                            </div>
                        </vaadin-card>
                        <div class="chart-container canvas-custom" colspan="3" style="position: relative;">
                            ${this.loading ? html`
                                <vaadin-progress-bar indeterminate
                                                     style="position: absolute; top: 0; left: 0; width: 100%; z-index: 10;">
                                </vaadin-progress-bar>
                            ` : null}
                            <canvas id="myChart"
                                    style="background: white;border-radius: 10px;padding: 10px;height: 215px !important;">
                            </canvas>
                        </div>

                        <div class="chart-container canvas-custom" colspan="3" style="position: relative;">
                            ${this.loading ? html`
        <vaadin-progress-bar indeterminate
            style="position: absolute; top: 0; left: 0; width: 100%; z-index: 10;">
        </vaadin-progress-bar>
    ` : null}
                            <canvas id="myChart2"
                                    style="background: white;border-radius: 10px;padding: 10px;height: 215px !important;">
                            </canvas>
                        </div>

                    </vaadin-form-layout>
                    <div>
                        <div style="text-align: center;margin:10px 0px;font-weight: bold;border: 1px solid green;
    padding: 5px 0px;border-radius: 10px">
                            <div>${this.dateNow}</div>
                        </div>
                        <vaadin-scroller
                                scroll-direction="vertical"
                                style="border-bottom: 1px solid black; padding: 10px 16px;height:664px;border: 1px solid green;
    border-radius: 10px;"
                        >
                            <section aria-labelledby="personal-title">
                                <h3 id="personal-title" style="margin: 0">Tủ Hoàng Minh
                                    ${this.nameCabinet ? `:` + this.nameCabinet : ``}</h3>
                                ${
                                        this.listLight?.length !== 0 ? html`    ${this.listLight?.map((item) => {
                                            console.log('a', this.listLight)
                                            const formattedDate = item.lastTimeActive?.replace(
                                                    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):.*$/,
                                                    (_, year, month, day, hour, minute) => `${parseInt(day)}/${parseInt(month)}/${year} ${hour}:${minute}`
                                            );
                                            return html`
                                                <vaadin-card theme="outlined" class="card-custom" style="margin-top: 10px">
                                                    <div slot="title">${item.lightName}</div>
                                                    <div slot="subtitle"
                                                         style="display: flex;align-items: center;margin-top: 10px">
                                                        <or-icon icon="lightbulb"
                                                                 style="${
                                                                         item.statusLight === 'A'
                                                                                 ? 'color: #ffc000;font-size:16px'
                                                                                 : item.statusLight === 'I'
                                                                                         ? 'color: red;font-size:16px'
                                                                                         : item.statusLight === 'D'
                                                                                                 ? 'color: red;font-size:16px'
                                                                                                 : ''
                                                                 }"></or-icon>
                                                        <vaadin-progress-bar min="0" max="100"
                                                                             value="${item.brightness === 0 || typeof item.brightness === "undefined" ? 0 : item.brightness}"></vaadin-progress-bar>
                                                        <div style="padding: 0 10px">
                                                            ${item.brightness === 0 || typeof item.brightness === "undefined" ? 0 : item.brightness}
                                                        </div>
                                                    </div>
                                                    <div style="margin-top: 10px">
                                                        <or-icon icon="lightning-bolt" style="color:#ffc000"></or-icon>
                                                        Điện áp(V): ${item.voltage}
                                                    </div>
                                                    <div style="margin-top: 10px">
                                                        <or-icon icon="power-plug" style="color:#289bd3"></or-icon>
                                                        Dòng điện(A): ${item.amperage}
                                                    </div>
                                                    <div style="margin-top: 10px">
                                                        <or-icon icon="battery-charging" style="color:green"></or-icon>
                                                        Công suất tiêu thụ(W): ${item.wattageActual}
                                                    </div>
                                                    <div style="margin-top: 10px">
                                                        <or-icon icon="speedometer" style="color:#c62166"></or-icon>
                                                        Hiệu suất sáng(Lm/W): ${item.luminousEfficacy}
                                                    </div>
                                                    <div style="margin-top: 10px">
                                                        <or-icon icon="calendar-range" style="color:#f04141"></or-icon>
                                                        Thời gian: ${formattedDate}
                                                    </div>
                                                </vaadin-card>`
                                        })}` : html`
                                            <vaadin-card theme="outlined" class="card-custom" style="margin-top: 10px">
                                                <div slot="title">Tên đèn</div>
                                                <div slot="subtitle"
                                                     style="display: flex;align-items: center;margin-top: 10px">
                                                    <or-icon icon="lightbulb"
                                                    ></or-icon>
                                                    <vaadin-progress-bar min="0" max="100"
                                                                         value="0"></vaadin-progress-bar>
                                                    <div style="padding: 0 10px">
                                                        0
                                                    </div>
                                                </div>
                                                <div style="margin-top: 10px">
                                                    <or-icon icon="lightning-bolt" style="color:#ffc000"></or-icon>
                                                    Điện áp(V):
                                                </div>
                                                <div style="margin-top: 10px">
                                                    <or-icon icon="power-plug" style="color:#289bd3"></or-icon>
                                                    Dòng điện(mA):
                                                </div>
                                                <div style="margin-top: 10px">
                                                    <or-icon icon="battery-charging" style="color:green"></or-icon>
                                                    Công suất tiêu thụ(W):
                                                </div>
                                                <div style="margin-top: 10px">
                                                    <or-icon icon="speedometer" style="color:#c62166"></or-icon>
                                                    Hiệu suất sáng(Lm/W):
                                                </div>
                                                <div style="margin-top: 10px">
                                                    <or-icon icon="calendar-range" style="color:#f04141"></or-icon>
                                                    Thời gian:
                                                </div>
                                            </vaadin-card>`
                                }

                            </section>
                        </vaadin-scroller>
                    </div>
                </vaadin-form-layout>
            </div>
        `;
    }
}
