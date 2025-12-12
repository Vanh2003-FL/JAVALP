import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import manager from "@openremote/core";
import "@vaadin/button";
import "@vaadin/combo-box";
import "@vaadin/dialog";

@customElement("province-edit")
export class MyElement extends LitElement {
    @state() private provinces = [];
    @state() private newProvince = { name: "", status: 0, updateBy: "", updateDate: Date.now() };
    @state() private vietnamProvinces = [];
    @state() private editedProvince = { id: 0, name: "", status: 0, updateBy: "", updateDate: Date.now() };
    @state() private showDialog = false;
    @state() private notification = { show: false, message: "", isError: false };
    @state() private errorMessage = "";

    static styles = css`
    :host {
      display: block;
      font-family: Roboto;
      padding: 20px;
      font-size: 24px;
      text-align: center;
    }
    .container {
        max-width: 1200px;
        margin: 0px auto;
    }
    .top-content {
      display: flex;
      justify-content: space-between;
      background: white;
      padding: 16px;
      border-radius: 5px;
    }
    .field-label {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-weight: 500;
    }
    .mid-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: white;
      padding: 20px;
      border-radius: 5px;
    }
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            font-size: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
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

        .notification.success {
            background-color: #4caf50;
        }

        .notification.error {
            background-color: #f44336;
        }

        .error-message {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 16px;
            padding: 12px;
            background-color: #fef2f2;
            border-radius: 4px;
            border-left: 4px solid #e74c3c;
        }
  `;

    async fetchProvinces() {
        try {
            const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
            const data = await response.json();
            this.vietnamProvinces = data
                .filter(province => province.codename.startsWith("tinh_"))
                .map(province => province.name.replace("Tỉnh ", ""));
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh:", error);
        }
    }

    firstUpdated() {
        this.fetchProvinces();
    }

    connectedCallback() {
        super.connectedCallback();
        const storedItem = sessionStorage.getItem('editedItem');
        console.log(storedItem)
        if (storedItem) {
            this.editedProvince = JSON.parse(storedItem);
            this.newProvince = {
                ...this.editedProvince,
                updateDate: this.editedProvince.updateDate ? Number(this.editedProvince.updateDate) : Date.now()
            };
        }
    }

    showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };

        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 3000);
    }

    async addProvince() {
        try {
            const textField = this.shadowRoot?.querySelector('#nameField') as any; // Ép kiểu để truy cập validate()
            if (textField) {
                const isValid = textField.validate(); // Kiểm tra required
                if (!isValid) {
                    console.log('Vui lòng điền Tên tủ');
                }else{
                    const userResponse = await manager.rest.api.UserResource.getCurrent();
                    const currentUser = userResponse?.data?.username || "Không xác định";
                    const provinceToUpdate = {
                        ...this.newProvince,
                        updateBy: currentUser,
                        updateDate: Number(this.newProvince.updateDate) || Date.now()
                    };

                    const response = await manager.rest.api.ProvinceResource.update({
                        id: this.editedProvince.id,
                        name: this.newProvince.name,
                        active: this.newProvince.status,
                        updateBy: currentUser
                    });
                    if (response.status === 200 || response.status === 201) {
                        this.showNotification("Cập nhật tỉnh/thành phố thành công");
                        setTimeout(() => {
                            this.navigateToMasterData();
                        }, 2000);
                    } else {
                        console.error("Cập nhật thất bại:", response);
                    }
                }
            }

        } catch (error) {
            console.error("Lỗi khi cập nhật tỉnh:", error);
        }
    }

    navigateToMasterData() {
        this.showDialog = false;
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
          <section>Chỉnh sửa tỉnh/thành phố</section>
          <vaadin-button @click="${this.addProvince}" style="background: #4caf50; color: white">
              Lưu
          </vaadin-button>
        </div>
        <div class="mid-content">
            <div style="padding-top: 8px;
                        padding-bottom: 4px;
                        display: flex;
                        flex-direction: column;">
                <div class="field-label" style="font-size: 14px; font-weight: 500">
                    Tên tỉnh/thành phố
                    <span class="required-asterisk">*</span>
                </div>
                <vaadin-text-field
                        id = "nameField"
                        required error-message="Không được để trống"
                        .value="${this.newProvince.name}"
                        @input="${(e: any) => this.newProvince.name = e.target.value}">
                </vaadin-text-field>
            </div>
          <vaadin-combo-box
            label="Trạng thái"
            .items="${['Hoạt động', 'Không hoạt động']}"
            .value="${this.newProvince.status === 1 ? 'Hoạt động' : 'Không hoạt động'}"
            @value-changed="${(e) => this.newProvince.status = e.detail.value === 'Hoạt động' ? 1 : 0}">
          </vaadin-combo-box>
        </div>

        <!-- Điều kiện kiểm tra hiển thị dialog -->

          ${this.notification.show ? html`
              <div class="notification ${this.notification.isError ? 'error' : 'success'}">
                  ${this.notification.message}
              </div>
          ` : ''}
      </div>
    `;
    }
}
