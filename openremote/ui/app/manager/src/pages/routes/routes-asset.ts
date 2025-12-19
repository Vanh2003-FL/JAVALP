import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import "@vaadin/date-picker"
import "@vaadin/combo-box"
import "@vaadin/form-layout"
import "@vaadin/multi-select-combo-box"
import "@vaadin/grid"
import "@vaadin/grid/vaadin-grid-column-group.js"
import "@vaadin/notification"
import "@vaadin/progress-bar"
import "@vaadin/button"
import "@vaadin/horizontal-layout"
import "@vaadin/tabs"
import "@vaadin/tabsheet"
import "@openremote/or-map"
import"@vaadin/card"
import "@vaadin/text-area"
import "@vaadin/button"
import "@vaadin/upload"
pdfMake.vfs = pdfFonts.vfs;

@customElement("routes-edit")
export class MyElement extends LitElement {
    private object1 = {
        "asset": {
            "id": "3sDwquxO4H4P9Utkw6J5ql",
            "version": 2,
            "createdOn": 1741924838095,
            "name": "Consoles",
            "accessPublicRead": false,
            "realm": "master",
            "type": "LightAsset",
            "path": [
                "3sDwquxO4H4P9Utkw6J5ql"
            ],
            "attributes": {
                "location": {
                    "name": "location",
                    "type": "GEO_JSONPoint",
                    "meta": {},
                    "value": {
                        "coordinates": [
                            105.82882099838179,
                            21.011307529835292
                        ],
                        "type": "Point"
                    },
                    "timestamp": 1742184724673
                }
            }
        },
        "assetInfo": {
            "isControlByCabinet": true,
            "active": true
        }
    }
    @state() file=[]
    static styles = css`
        :host {
    
        }
        vaadin-tabs {
            --vaadin-tabs-selected-text-color: green; /* Màu chữ của tab khi chọn */
            --vaadin-tabs-border-color: transparent; /* Ẩn đường viền mặc định */
        }
        vaadin-tab[selected] {
            color: green; /* Màu chữ khi tab được chọn */
            font-weight: bold;
        }
        vaadin-text-area::part(input-field) {
            border-top-left-radius: 10px;
            border-top-right-radius: 10px
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
        h1,h2,h3{
            margin: 0;
            font-size: 16px;
        }

        @mixin tablet-and-up {
            @media screen and (min-width: 769px) { @content; }
        }
        @mixin mobile-and-up {
            @media screen and (min-width: 601px) { @content; }
        }
        @mixin tablet-and-down  {
            @media screen and (max-width: 768px) { @content; }
        }
        @mixin mobile-only {
            @media screen and (max-width: 600px) { @content; }
        }


        ul, li{
            list-style: none;
            padding: 0;
        }

        .container{
            display: flex;
            justify-content: center;
            align-items: center;
        }
       
        .sessions{
            margin-top: 2rem;
            border-radius: 12px;
            position: relative;
        }
        .custom-timeline{
            padding-bottom: 1.5rem;
            border-left: 1px solid #CECECF;
            position: relative;
            padding-left: 20px;
            margin-left: 10px;
            &:last-child{
                border: 0px;
                padding-bottom: 0;
            }
            &:before{
                content: '';
                width: 15px;
                height: 15px;
                background: white;
                border: 1px solid #4e5ed3;
                box-shadow: 3px 3px 0px #bab5f8;
                box-shadow: 3px 3px 0px #bab5f8;
                border-radius: 50%;
                position: absolute;
                left: -10px;
                top: 0px;
            }
        }
        .time{
            color: #2a2839;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            @include mobile-and-up{
                font-size: .9rem;
            }
            @include mobile-only{
                margin-bottom: .3rem;
                font-size: 0.85rem;
            }

        }
        p{
            color: #4f4f4f;
            font-family: sans-serif;
            line-height: 1.5;
            margin-top:0.4rem;
            @include mobile-only{
                font-size: .9rem;
            }
        }
        .wrapper{
            padding: 16px;
        }
        vaadin-upload-file {
            display: none !important;
        }
    `;
    navigateToDashboard() {
        window.location.hash = '/routes';
    }
    firstUpdated() {
        const upload = this.shadowRoot.querySelector('vaadin-upload');
        // Ngăn upload lên server
        upload.addEventListener('upload-before', (event) => {
            event.preventDefault(); // Chặn upload
        });

        // Khi file được chọn
        upload.addEventListener('files-changed', () => {
            this.handleFileSelection(upload.files);
        });
    }
    handleFileSelection(files) {
        if (!files || files.length === 0) return;

        const upload = this.shadowRoot.querySelector('vaadin-upload');

        let newFiles = [...files];

        // Kiểm tra file trùng (dựa trên name)
        newFiles = newFiles.filter(file =>
            !this.file.some(f => f.name === file.name)
        );

        if (newFiles.length === 0) {
            alert("File đã tồn tại trong danh sách!");
            return;
        }

        // Tạo URL tải về từ Blob
        newFiles = newFiles.map(file => {
            const extension = file.name.split('.').pop().toLowerCase();

            let icon = 'file-account';  // Mặc định
            let color = 'black';

            if (extension === 'pdf') {
                icon = 'file-pdf-box';
                color = 'red';
            } else if (['xls', 'xlsx'].includes(extension)) {
                icon = 'file-excel';
                color = 'green';
            } else if (['doc', 'docx'].includes(extension)) {
                icon = 'file-document';
                color = '#0067b3';
            } else if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                icon = 'image';
                color = 'purple';
            }

            return {
                name: file.name,
                size: file.size,
                type: extension.toUpperCase(),
                icon: icon,
                color: color, // Gán màu cho file
                uploadTime: new Date().toLocaleString(),
                downloadUrl: URL.createObjectURL(file)
            };
        });

        console.log("Files Added:", newFiles); // Kiểm tra file name & size

        // Cập nhật danh sách file
        this.file = [...this.file, ...newFiles];

        // Xóa file đã xử lý khỏi vaadin-upload
        upload.files = upload.files.filter(file =>
            !newFiles.some(newFile => newFile.name === file.name)
        );

        this.requestUpdate();
    }


    removeFile(index) {
        const upload = this.shadowRoot.querySelector('vaadin-upload');

        // Giải phóng URL khi xóa file
        URL.revokeObjectURL(this.file[index].downloadUrl);

        // Cập nhật danh sách file
        this.file.splice(index, 1);

        // Xóa file khỏi vaadin-upload
        upload.files = [];

        this.requestUpdate();
    }


    downloadFile(file) {
        const a = document.createElement('a');
        a.href = file.downloadUrl;
        a.download = file.name;
        a.click();
    }

    render() {
        const responsiveSteps: any = [
            // Use one column by default
            { minWidth: 0, columns: 1 },
            // Use two columns, if layout's width exceeds 500px
            { minWidth: '500px', columns: 2 },
        ];
        const make = [
            {"name": "Device 1", "lat": 10.7769, "lng": 106.6957},
            {"name": "Device 2", "lat": 10.7890, "lng": 106.7000}
        ]
        let events = [
            { date: '2025-01-01', description: 'Sự kiện 1' },
            { date: '2025-02-01', description: 'Sự kiện 2' },
        ];
        return html`
             <div style="margin-top: 10px">
                 <vaadin-horizontal-layout style="display: flex; flex-wrap: wrap; gap: 10px; width: 100%;height: calc(100vh - 114px);">
                     <div style=" flex: 4 1 800px; 
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;padding: 0px;background: white">
                         <h1 style="padding: 10px">General Information</h1>
                         <vaadin-form-layout .responsiveSteps="${responsiveSteps}" style="padding: 10px">
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Profile Type</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Dual Date</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Assignee</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Assignee</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Assignee</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                             <div>
                                 <h2 style="margin: 0;font-size: 20px;font-weight: 100">Assignee</h2>
                                 <h3 style="margin: 0;;font-size: 20px;font-weight: 600">Technical</h3>
                             </div>
                         </vaadin-form-layout>
                         <h1 style="padding: 10px">Description</h1>
                         <h3 style="padding: 10px">Regular</h3>
                         <h1 style="padding: 10px">Location</h1>
                         <or-map  style="width: 100%;height: 400px" lat="21.0285" lng="105.8542" zoom="10">
                             <or-map-marker-asset .asset="${this.object1}"></or-map-marker-asset>
                         </or-map>
                         <h1 style="padding: 10px">Attached Documents</h1>
                         <vaadin-upload
                                 style="margin-left:10px "
                                 max-files="3"
                                 nodrop
                                 accept=".pdf,.docx,.xlsx"
                         >
                             <vaadin-button  slot="add-button">
                                 <or-icon icon="cloud-upload" style="color: #01aae9"></or-icon>
                             </vaadin-button>
                         </vaadin-upload>

                         <div class="file-list">
                             ${this.file.length > 0 ? this.file.map((file, index) => html`
                                         <div class="file-item" style="padding: 10px">
                                             <div style="display: flex;justify-content: space-between;margin: 0 10px;align-items: center;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;padding: 10px">
                                                 <div style="display: flex;flex-direction: row;align-items: center">
                                                     <or-icon icon="${file.icon}" slot="suffix" style="color: ${file.color}"></or-icon>
                                                     <div style="padding-left:10px ">
                                                         <p>${file.name}</p>
                                                         <p>${file.type} - ${(file.size / 1024).toFixed(2)} KB - ${file.uploadTime}</p>
                                                     </div>
                                                 </div>
                                                 <div>
                                                     <or-icon icon="delete-outline" slot="suffix" style="color: red" @click=${() => this.removeFile(index)}></or-icon>
                                                     <or-icon icon="download-outline" slot="suffix" style="color: #0067b3" @click=${() => this.downloadFile(file)}></or-icon>
                                                 </div>
                                             </div>
                                            
                                         </div>
                                     `) : html`<p style="margin-left:10px ">Chưa có file nào được tải lên.</p>`}
                         </div>
                     </div>
                     <div  style=" flex: 1 1 100px; 
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;padding: 0px;background: white">
                         <div style="display: flex;flex-direction: column;justify-content: space-between;height: 100%">
                             <div class="container">
                                 <div class="wrapper">
                                     <h1> Activity Timeline</h1>
                                     <ul class="sessions">
                                         <li class="custom-timeline">
                                             <div class="time" style="display: flex;justify-content: space-between">
                                                 <span style="display: block">StatusChange</span>
                                                 <span style="display: block;margin-right: 10px;color:#CECECF">09:00 AM</span>
                                             </div>
                                             <p style="color:#CECECF;font-weight: 600">Status changed from New to Processing by David Tran</p>
                                         </li>
                                         <li  class="custom-timeline">
                                             <div class="time" style="display: flex;justify-content: space-between">
                                                 <span style="display: block">StatusChange</span>
                                                 <span style="display: block;margin-right: 10px;color:#CECECF">09:00 AM</span>
                                             </div>
                                             <p style="color:#CECECF;font-weight: 600">Status changed from New to Processing by David Tran</p>
                                         </li>
                                     </ul>
                                 </div>
                             </div>
                             <div style="display: flex;flex-direction: column">
                                 <vaadin-text-area
                                         style="padding: 0 20px"
                                         placeholder="Add comment"
                                 ></vaadin-text-area>
                                 <vaadin-button style="background: #3a9f6f;color: white;margin: 10px 77px"
                                 >
                                     Add comment
                                 </vaadin-button>
                             </div>

                         </div>

                     </div>
                 </vaadin-horizontal-layout>
             </div>
        `;
    }
}
