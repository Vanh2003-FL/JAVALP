import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@openremote/or-icon"; // Ensure or-icon is imported
import manager from "@openremote/core";

interface FormErrors {
    name?: string;
    description?: string;
}

@customElement("blog-category-create-modal")
export class BlogCategoryCreateModal extends LitElement {
    @property({ type: Boolean }) opened = false;
    @state() private categoryName = "";
    @state() private categoryDescription = "";
    @state() private errors: FormErrors = {};
    @state() private loading = false;
    @state() private notification = {
        show: false,
        message: "",
        isError: false,
    };

    static styles = css`
    :host {
      font-family: Roboto, sans-serif;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
      padding: 20px;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: modalIn 0.3s ease-out;
      display: flex;
      flex-direction: column;
    }
    @keyframes modalIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    .modal-header {
      background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
      color: white;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-icon {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px;
      border-radius: 8px;
      font-size: 16px;
    }
    .close-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
    }
    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .modal-content {
      padding: 32px;
      overflow-y: auto;
      flex: 1;
    }
    .form-section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E5E7EB;
    }
    .form-field {
      margin-bottom: 24px;
    }
    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .required-asterisk {
      color: #EF4444;
      font-weight: 700;
    }
    .form-input, .form-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
      background: white;
      box-sizing: border-box;
    }
    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #4D9D2A;
      box-shadow: 0 0 0 3px rgba(77, 157, 42, 0.1);
    }
    .form-textarea {
      min-height: 120px;
      resize: vertical;
      font-family: inherit;
    }
    .form-input.error, .form-textarea.error {
      border-color: #EF4444;
      background: #FEF2F2;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    .error-text {
      color: #EF4444;
      font-size: 12px;
      font-weight: 500;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .modal-footer {
      padding: 24px 32px;
      border-top: 1px solid #E5E7EB;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      background: #F9FAFB;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-cancel {
      background: #F3F4F6;
      color: #374151;
      border: 1px solid #D1D5DB;
    }
    .btn-cancel:hover:not(:disabled) {
      background: #E5E7EB;
    }
    .btn-primary {
      background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(77, 157, 42, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(77, 157, 42, 0.4);
    }
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .notification {
      position: fixed;
      bottom: 16px;
      right: 16px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-size: 13px;
      font-weight: 500;
      max-width: 280px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      animation: slideIn 0.3s ease-out forwards;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .notification.success {
      background: linear-gradient(135deg, #4d9d2a 0%, #5cb32e 100%);
    }
    .notification.error {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @media (max-width: 768px) {
      .modal {
        margin: 10px;
        max-width: calc(100vw - 20px);
      }
      .modal-header {
        padding: 20px;
      }
      .modal-content {
        padding: 20px;
      }
      .modal-footer {
        padding: 20px;
        flex-direction: column-reverse;
      }
      .btn {
        justify-content: center;
      }
    }
  `;

    private validateForm(): boolean {
        const errors: FormErrors = {};
        if (!this.categoryName.trim()) {
            errors.name = "Vui lòng nhập tên danh mục";
        }
        if (!this.categoryDescription.trim()) {
            errors.description = "Vui lòng nhập mô tả danh mục";
        }
        this.errors = errors;
        return Object.keys(errors).length === 0;
    }

    private clearError(field: keyof FormErrors) {
        if (this.errors[field]) {
            this.errors = { ...this.errors };
            delete this.errors[field];
        }
    }

    private handleNameInput(e: Event) {
        this.categoryName = (e.target as HTMLInputElement).value;
        this.clearError("name");
    }

    private handleDescriptionInput(e: Event) {
        this.categoryDescription = (e.target as HTMLTextAreaElement).value;
        this.clearError("description");
    }

    private async handleSubmit() {
        if (!this.validateForm()) {
            this.showNotification("Vui lòng điền đầy đủ thông tin bắt buộc", true);
            return;
        }
        this.loading = true;

        try {
            const newCategory = {
                name: this.categoryName,
                description: this.categoryDescription,
            };
            const response = await manager.rest.api.BlogResource.createBlogCategory(newCategory);
            if (response && response.data) {
                this.dispatchEvent(
                    new CustomEvent("category-created", {
                        detail: response.data,
                        bubbles: true,
                        composed: true,
                    })
                );
                this.showNotification("Tạo loại tin tức thành công!", false);
                this.resetForm();
                setTimeout(() => {
                    this.handleClose();
                }, 1500);
            } else {
                throw new Error("Failed to create blog category");
            }
        } catch (error) {
            console.error("Error creating blog category:", error);
            this.showNotification("Có lỗi xảy ra khi tạo loại tin tức. Vui lòng thử lại.", true);
        } finally {
            this.loading = false;
        }
    }

    private resetForm() {
        this.categoryName = "";
        this.categoryDescription = "";
        this.errors = {};
    }

    private handleClose() {
        this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
        this.resetForm();
    }

    private showNotification(message: string, isError = false) {
        this.notification = { show: true, message, isError };
        setTimeout(() => {
            this.notification = { ...this.notification, show: false };
        }, 4000);
    }

    private handleOverlayClick(event: Event) {
        if (event.target === event.currentTarget) {
            this.handleClose();
        }
    }

    render() {
        if (!this.opened) return html``;

        const isFormValid = this.categoryName.trim() && this.categoryDescription.trim();

        return html`
      <div class="modal-overlay" @click="${this.handleOverlayClick}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h2 class="modal-title">
              <or-icon icon="folder-plus"></or-icon>
              Tạo loại tin tức mới
            </h2>
            <button class="close-button" @click="${this.handleClose}">
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div class="modal-content">
            <div class="form-section">
              <div class="section-title">
                <or-icon icon="info"></or-icon>
                Thông tin danh mục
              </div>
              <div class="form-field">
                <label class="form-label">
                  Tên danh mục
                  <span class="required-asterisk">*</span>
                </label>
                <input
                  class="form-input ${this.errors.name ? "error" : ""}"
                  type="text"
                  placeholder="Nhập tên danh mục"
                  .value="${this.categoryName}"
                  @input="${this.handleNameInput}"
                >
                ${this.errors.name
            ? html`
                      <div class="error-text">
                        <or-icon icon="alert-circle"></or-icon>
                        ${this.errors.name}
                      </div>
                    `
            : ""}
              </div>
              <div class="form-field">
                <label class="form-label">
                  Mô tả
                  <span class="required-asterisk">*</span>
                </label>
                <textarea
                  class="form-textarea ${this.errors.description ? "error" : ""}"
                  placeholder="Nhập mô tả danh mục"
                  .value="${this.categoryDescription}"
                  @input="${this.handleDescriptionInput}"
                ></textarea>
                ${this.errors.description
            ? html`
                      <div class="error-text">
                        <or-icon icon="alert-circle"></or-icon>
                        ${this.errors.description}
                      </div>
                    `
            : ""}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="${this.handleClose}" ?disabled="${this.loading}">
              <or-icon icon="x"></or-icon>
              Hủy bỏ
            </button>
            <button
              class="btn btn-primary"
              @click="${this.handleSubmit}"
              ?disabled="${!isFormValid || this.loading}"
            >
              ${this.loading
            ? html`
                    <div class="loading-spinner"></div>
                    Đang tạo...
                  `
            : html`
                    <or-icon icon="plus"></or-icon>
                    Tạo danh mục
                  `}
            </button>
          </div>
        </div>
      </div>
      ${this.notification.show
            ? html`
            <div class="notification ${this.notification.isError ? "error" : "success"}">
              <or-icon icon="${this.notification.isError ? "alert-circle" : "check-circle"}"></or-icon>
              ${this.notification.message}
            </div>
          `
            : ""}
    `;
    }
}
