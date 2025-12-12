import { html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import type { Blog, BlogCategory } from "@openremote/model"
import manager from "@openremote/core"
import "@vaadin/button"
import "@vaadin/combo-box"
import "@openremote/or-icon"
import { Page, type AppStateKeyed, type PageProvider } from "@openremote/or-app"
import type { Store } from "@reduxjs/toolkit";
import { unsafeHTML } from "lit/directives/unsafe-html.js"

export function pageBlogDetailProvider(store: Store<any>): PageProvider<any> {
    return {
        name: "blogDetail",
        routes: ["blog/:id"],
        pageCreator: () => new BlogDetail(store),
    };
}

@customElement("blog-detail")
export class BlogDetail extends Page<AppStateKeyed> {
    @state() blog: Blog | null = null
    @state() loading = false
    @state() error = ""
    @state() categories: BlogCategory[] = []
    @state() blogImageUrl = ""

    name = "blog-detail"

    stateChanged(state: AppStateKeyed): void {}

    constructor(store?: any) {
        super(store)
    }

    connectedCallback() {
        super.connectedCallback()
        this.fetchCategories()
        this.fetchBlog()
        // Re-fetch when navigating between different blog IDs without destroying the element
        window.addEventListener("hashchange", this._onHashChange)
        // Keep default layout scrolling behavior
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        if (this.blogImageUrl) URL.revokeObjectURL(this.blogImageUrl)
        window.removeEventListener("hashchange", this._onHashChange)
        // No runtime overflow override to revert
    }

    // Removed runtime overflow overrides; rely on default app layout scroll

    private _onHashChange = () => {
        this.fetchBlog()
    }

    getIdFromRoute() {
        const match = window.location.hash.match(/\/blog\/(\d+)$/)
        return match ? match[1] : ""
    }

    async fetchBlog() {
        const id = this.getIdFromRoute()
        if (!id) return

        this.loading = true
        try {
            const response = await manager.rest.api.BlogResource.getBlog({ data: { id: Number(id) } })
            const blogs = response?.data || []
            // Find exact blog by id in case backend ignores filter and returns multiple
            const numericId = Number(id)
            this.blog = blogs.find((b: any) => Number(b?.id) === numericId) || (blogs.length > 0 ? blogs[0] : null)

            if (!this.blog) {
                this.error = "Không tìm thấy blog"
            } else {
                await this.loadBlogImage(this.blog.thumbnailUrl)
            }
        } catch (e) {
            this.error = "Lỗi tải blog"
        }
        this.loading = false
    }

    async loadBlogImage(filename: string) {
        if (this.blogImageUrl) URL.revokeObjectURL(this.blogImageUrl)
        if (!filename) {
            this.blogImageUrl = ""
            return
        }

        try {
            const response = await manager.rest.api.AssetInfoResource.getStream({ filename }, { responseType: "blob" })
            const blob = response.data
            this.blogImageUrl = URL.createObjectURL(blob)
        } catch (e) {
            this.blogImageUrl = ""
        }
    }

    async fetchCategories() {
        try {
            const response = await manager.rest.api.BlogResource.getBlogCategory({})
            this.categories = response?.data || []
        } catch (e) {
            this.categories = []
        }
    }

    getCategoryName(categoryId: number) {
        const category = this.categories.find((cat) => cat.id === categoryId)
        return category ? category.name : "Không xác định"
    }

    getPriorityDisplay(priority: number) {
        const map = {
            1: "Thấp",
            2: "Trung bình",
            3: "Cao",
            4: "Rất cao",
            5: "Khẩn cấp",
        }
        return map[priority] || "Không xác định"
    }

    getPriorityIcon(priority: number) {
        const icons = {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }
        return icons[priority] || ""
    }

    getStatusDisplay(status: boolean) {
        return status ? "Đã xuất bản" : "Bản nháp"
    }

    render() {
        if (this.loading && !this.blog) {
            return html`
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                </div>
            `;
        }
        if (this.error) {
            return html`<div class="error-state">${this.error}</div>`;
        }
        if (!this.blog) return html``;
        return html`
            <div class="page-body">
            <div class="edit-container">
                <div class="form-card">
                    <div class="title">
                        <span class="back-button" @click="${() => (window.location.hash = '/blog')}">←</span>
                        Xem chi tiết tin tức
                    </div>
                    <div class="form-content">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Tiêu đề</label>
                                    <div class="form-input multiline-readonly" title="${this.blog.title || ''}">${this.blog.title || ''}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Danh mục</label>
                                    <div class="form-input multiline-readonly" title="${this.getCategoryName(this.blog.categoryId)}">${this.getCategoryName(this.blog.categoryId)}</div>
                                </div>
                            </div>
                            <div class="form-group full-width">
                                <label class="form-label">Tóm tắt</label>
                                <div class="form-input multiline-readonly" title="${this.blog.summary || ''}">${this.blog.summary || ''}</div>
                            </div>
                            <div class="form-group full-width">
                                <label class="form-label">Nội dung</label>
                                <div class="content-view" style="min-height:200px">${unsafeHTML(this.blog.content || '')}</div>
                            </div>
                            <div class="form-group full-width">
                                <label class="form-label">Ảnh thumbnail</label>
                                <div class="image-upload-area ${this.blogImageUrl ? 'has-image' : ''}">
                                    ${this.blogImageUrl
                                        ? html`<img class="image-preview" src="${this.blogImageUrl}" alt="Thumbnail" />`
                                        : html`<div class="upload-text">Không có ảnh</div>`}
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Độ ưu tiên</label>
                                    <div class="form-input multiline-readonly" title="${this.getPriorityIcon(this.blog.priorityLevel)} ${this.getPriorityDisplay(this.blog.priorityLevel)}">${this.getPriorityIcon(this.blog.priorityLevel)} ${this.getPriorityDisplay(this.blog.priorityLevel)}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Trạng thái</label>
                                    <div class="form-input multiline-readonly" title="${this.getStatusDisplay(this.blog.status)}">${this.getStatusDisplay(this.blog.status)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn-secondary" @click="${() => (window.location.hash = '/blog')}">Quay lại</button>
                    </div>
                </div>
            </div>
            </div>
        `;
    }

    static styles = [
        css`
            :host {
                background: #f8fafc !important;
                display: block;
                padding-bottom: 24px;
                min-height: 100vh;
            }
            .page-body { display: block; width: 100%; padding: 0 16px; min-height: auto; overflow: visible; }
            .edit-container {
                max-width: 1000px;
                margin: 0 auto;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                padding: 40px;
                padding-bottom: 41px; /* prevent bottom margin collapse so container wraps */
                position: relative;
                z-index: 1;
                margin-bottom: 24px;
                min-height: auto;
                display: flow-root; /* establish BFC without inner scroll */
                box-sizing: border-box;
                overflow: visible;
            }
            .edit-container::after { content: ""; display: table; clear: both; }
            .title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #222;
                display: flex;
                align-items: center;
                margin-bottom: 24px;
                margin-top: 15px;
            }
            .back-button {
                margin-right: 12px;
                cursor: pointer;
                color: #4D9D2A;
                font-size: 1.7rem;
                border: none;
                background: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .back-button:hover {
                background: #e5f6e0;
            }
            @media (max-width: 768px) {
                .edit-container {
                    padding: 24px 20px;
                }
                .title {
                    font-size: 1.1rem;
                }
                .back-button {
                    width: 32px;
                    height: 32px;
                    font-size: 1.1rem;
                }
            }
        `,
        css`
            .form-card { background: transparent; border-radius: 0; box-shadow: none; overflow: visible; border: none; margin-bottom: 0; }
            .form-content { padding: 40px; display: flow-root; }
            .form-grid {
                display: grid;
                gap: 2rem;
            }
            .multiline-readonly {
                white-space: normal;
                overflow-wrap: anywhere;
                word-break: break-word;
                line-height: 1.5;
                height: 60px;
                overflow-y: auto;
                background: #fafafa;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 1rem 1.25rem;
                user-select: text;
                box-sizing: border-box;
                resize: none;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            .form-group {
                display: flex;
                flex-direction: column;
            }
            .form-group.full-width {
                grid-column: 1 / -1;
            }
            .form-label {
                font-size: 0.95rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .form-label::before {
                content: '';
                width: 4px;
                height: 16px;
                background: linear-gradient(135deg, #4D9D2A, #5cb32e);
                border-radius: 2px;
            }
            .form-input {
                padding: 1rem 1.25rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
                background: #fafafa;
                font-family: inherit;
                height: 60px;
                overflow-y: auto;
            }
            .content-view {
                white-space: normal;
                overflow-wrap: anywhere;
                word-break: break-word;
                line-height: 1.6;
                min-height: 200px;
                max-height: none;
                overflow: visible;
            }
            .content-view img { max-width: 100%; height: auto; border-radius: 8px; }
            .form-input:focus {
                outline: none;
                border-color: #4D9D2A;
                background: white;
                box-shadow: 0 0 0 4px rgba(77, 157, 42, 0.1);
                transform: translateY(-1px);
            }
            .form-input:hover {
                border-color: #9ca3af;
                background: white;
            }
            .image-upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 16px;
                padding: 2rem;
                text-align: center;
                background: #fafafa;
                transition: all 0.3s ease;
                position: relative;
            }
            .image-upload-area.has-image {
                padding: 1rem;
                border-style: solid;
                border-color: #4D9D2A;
                background: rgba(77, 157, 42, 0.05);
            }
            .image-preview {
                width: 100%;
                max-width: 300px;
                height: 200px;
                object-fit: cover;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                margin-bottom: 1rem;
            }
            .upload-text {
                font-size: 1.1rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .actions { display: flex; gap: 1rem; justify-content: center; padding: 16px 0 0 0; background: transparent; border-top: none; }
            .btn-secondary {
                background: white;
                color: #6b7280;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
            }
            .btn-secondary:hover {
                background: #f9fafb;
                border-color: #d1d5db;
                color: #374151;
                transform: translateY(-1px);
            }
            .loading-overlay {
                position: fixed;
                inset: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(4px);
            }
            .loading-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #4D9D2A;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            .error-state {
                text-align: center;
                padding: 4rem 2rem;
                color: #ef4444;
                font-size: 1.2rem;
                font-weight: 600;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @media (max-width: 768px) {
                .form-content { padding: 24px 20px; display: flow-root; }
                .form-row {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .actions { padding: 24px; flex-direction: column; }
            }
        `,
    ]
}
