import {LitElement, html, css} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import i18next from "i18next";
import manager, {subscribe, Util, DefaultColor5} from "@openremote/core";
import "@vaadin/button";
import "@vaadin/text-field";
import "@vaadin/grid";
import "@vaadin/dialog";
import  "@vaadin/icon"
@customElement("province-create")
export class MyElement extends LitElement{
    @state() private provinces = [];
    @state() private newProvince = { name: "", status: "", createdBy: "", createdDate: "" };
    @state() private vietnamProvinces = [];
    @state() private showNotificationAdd = false;
    @state() private notificationText = "";
    @state() private notification = { show: false, message: "", isError: false };
    static styles = css`
        :host {
            display: block;
            font-family: Roboto;
            padding: 20px;
            font-size: 24px;
            text-align: center;
        }
        .top-content{
            border-bottom: 1px solid #eee;
        }
        .top-content, .mid-content {
            display: flex;
            background: white;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding: 0 20px;
        }
        .field-label {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            font-weight: 500;
        }
        .required-asterisk {
            color: red;
            margin-left: 4px;
            font-weight: bold;
        }
        .mid-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: white;
            margin: 0px;
            padding: 20px;
            border-radius: 5px;
        }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .container {
            max-width: 1200px;
            margin: 0px auto;
        }

        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            max-width: 250px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .notification.success {
            background-color: #4caf50;
        }

        .notification.error {
            background-color: #f44336;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(120%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        section {
            font-weight: bold;
        }
        vaadin-grid {
            margin-top: 20px;
        }
        vaadin-combo-box {
            font-size: 16px;
        }
        vaadin-text-field::part(error-message) {
            text-align: left;
            margin-left: 0; /* đảm bảo không có lề trái mặc định */
        }
    `;

    async fetchProvinces() {
        try {
            const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
            const data = await response.json();

            // Lọc danh sách chỉ lấy các tỉnh (bỏ thành phố)
            this.vietnamProvinces = data
                .filter(province => province.codename.startsWith("tinh_")) // Chỉ lấy tỉnh
                .map(province => province.name);
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh:", error);
        }
    }

    firstUpdated() {
        this.fetchProvinces();
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchProvinces();
    }
    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };

        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }
    private async addProvince() {
        try {
            const textField = this.shadowRoot?.querySelector('#nameField') as any;
            if (textField) {
                const isValid = textField.validate();
                if (!isValid) return;
            }

            const userResponse = await manager.rest.api.UserResource.getCurrent();
            const currentUser = userResponse?.data?.username || "Không xác định";

            const provinceData = {
                name: this.newProvince.name,
                status: "1",
                createdBy: currentUser,
                createdDate: new Date().toISOString().split("T")[0],
            };

            const response = await manager.rest.api.ProvinceResource.createProvince({
                name: this.newProvince.name,
                createBy: currentUser,
                updateBy: currentUser
            });

            const responseData = response?.data as any;

            if (responseData?.errorCode === "ALREADY_EXISTS") {
                this.notificationText = responseData.errorMessage || "Tỉnh/thành phố này đã tồn tại!";
                this.showNotification(this.notificationText, true);
                return;
            }

            if (responseData && responseData.id) {
                this.showNotification("Thêm tỉnh/thành phố mới thành công");
                setTimeout(() => {
                    this.navigateToMasterData();
                }, 2000);
            }


        } catch (error: any) {
            const errorData = error?.response?.data || error?.body || {};

            if (errorData?.errorCode === "ALREADY_EXISTS") {
                this.notificationText = errorData.errorMessage || "Tỉnh/thành phố đã tồn tại!";
                this.showNotification(this.notificationText, true);
            } else {
                this.notificationText = errorData?.errorMessage || "Đã xảy ra lỗi không xác định!";
                this.showNotification(this.notificationText, true);
            }
        }
    }


    navigateToMasterData() {
        window.location.hash = '/master-data/masterDataPage1';
    }
    render() {
        return html`
            <div class="container">
                
                <label  style="font-size: 14px ;color: #3a9f6f;margin-left: 20px;padding-top: 10px;display: block;cursor: pointer; text-align: left;"  @click="${this.navigateToMasterData}">
                    <vaadin-icon icon="vaadin:arrow-left"></vaadin-icon>
                    Quay lại
                </label>
                <div class="top-content">
                    <vaadin-horizontal-layout style="width: 120%; justify-content: space-between; align-items: center; padding: 16px">
                        <section>Thêm tỉnh mới</section>
                        <vaadin-button @click="${this.addProvince}" style="background: #4caf50; color: white">
                            Lưu
                        </vaadin-button>
                    </vaadin-horizontal-layout>
                </div>
                <div class="mid-content">
                    <div class="input-group" style="display: flex; flex-direction: column">
                        <div class="input-group">
                            <div class="field-label" style="font-size: 14px; font-weight: 500">
                                Tên tỉnh/thành phố
                                <span class="required-asterisk">*</span>
                            </div>
                            <vaadin-text-field
                                    id = "nameField"
                                    required error-message="Tên tỉnh/thành phố không được để trống"
                                    .value="${this.newProvince.name}"
                                    @input="${(e: any) => this.newProvince.name = e.target.value}">
                            </vaadin-text-field>
                        </div>
                </div>
            </div>
                ${this.notification.show ? html`
                    <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                        ${this.notification.message}
                    </div>
                ` : ''}
        `;
    }
}
