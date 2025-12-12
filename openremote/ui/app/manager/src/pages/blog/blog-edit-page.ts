import { html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import type { Blog, BlogCategory } from "@openremote/model"
import manager from "@openremote/core"
import "@vaadin/button"
import "@vaadin/combo-box"
import "@openremote/or-icon"
// Removed Quill; using custom WYSIWYG editor like create page
import { Page, type AppStateKeyed } from "@openremote/or-app"

@customElement("blog-edit-page")
export class BlogEditPage extends Page<AppStateKeyed> {
    @state() blog: Blog | null = null
    @state() loading = false
    @state() error = ""
    @state() categories: BlogCategory[] = []
    @state() notification = { message: "", isError: false, visible: false }
    @state() formData: any = {}
    @state() errors: { [key: string]: string } = {}
    @state() selectedImage: File | null = null
    @state() imagePreview = ""
    @state() uploadProgress = 0
    editor: any = null
    @state() blogImageUrl = ""

    name = "blog-edit-page"

    stateChanged(state: AppStateKeyed): void {}

    constructor(store?: any) {
        super(store)
    }

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener("hashchange", this._onHashChange)
        this.fetchCategories()
        this.fetchBlog()
        // Keep default layout scrolling behavior
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener("hashchange", this._onHashChange)
        if (this.blogImageUrl) URL.revokeObjectURL(this.blogImageUrl)
        // No runtime overflow override to revert
    }

    // Removed runtime overflow overrides; rely on default app layout scroll

    private _onHashChange = () => {
        this.fetchBlog()
    }

    getIdFromRoute() {
        const match = window.location.hash.match(/\/blog\/edit\/(\d+)$/)
        return match ? match[1] : ""
    }

    async fetchBlog() {
        const id = this.getIdFromRoute()
        if (!id) return

        this.loading = true
        try {
            const response = await manager.rest.api.BlogResource.getBlog({ data: { id: Number(id) } })
            const blogs = response?.data || []
            const numericId = Number(id)
            this.blog = blogs.find((b: any) => Number(b?.id) === numericId) || (blogs.length > 0 ? blogs[0] : null)

            if (!this.blog) {
                this.error = "Không tìm thấy tin tức"
            } else {
                this.formData = { ...this.blog }
                this.selectedImage = null
                await this.loadBlogImage(this.blog.thumbnailUrl)
                setTimeout(() => this.initEditor(), 0)
            }
        } catch (e) {
            this.error = "Lỗi tải tin tức"
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

    initEditor() {
        const editorContainer = this.renderRoot?.querySelector("#editor") as HTMLElement | null
        if (!editorContainer || this.editor) return
        // Build toolbar + editable div like create-page
        editorContainer.innerHTML = ''
        const toolbar = document.createElement('div')
        toolbar.className = 'simple-editor-toolbar'
        toolbar.innerHTML = `
            <div class="toolbar-group">
                <select class="toolbar-select" data-command="fontName">
                    <option value="">Font</option>
                    <option value="Arial">Arial</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                </select>
                <select class="toolbar-select" data-command="fontSize">
                    <option value="">Size</option>
                    <option value="2">12px</option>
                    <option value="3">14px</option>
                    <option value="4">16px</option>
                    <option value="5">18px</option>
                    <option value="6">24px</option>
                    <option value="7">32px</option>
                </select>
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <button type="button" data-command="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
                <button type="button" data-command="italic" title="Italic (Ctrl+I)"><em>I</em></button>
                <button type="button" data-command="underline" title="Underline (Ctrl+U)"><u>U</u></button>
                <button type="button" data-command="strikethrough" title="Strikethrough"><s>S</s></button>
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <button type="button" data-command="formatBlock" data-value="h1" title="Heading 1">H1</button>
                <button type="button" data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
                <button type="button" data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <button type="button" data-command="insertUnorderedList" title="Bullet List">•</button>
                <button type="button" data-command="insertOrderedList" title="Numbered List">1.</button>
                <button type="button" data-command="formatBlock" data-value="blockquote" title="Quote">"</button>
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <button type="button" data-command="createLink" title="Insert Link">🔗</button>
                <button type="button" data-command="insertImageFile" title="Insert Image">🖼️</button>
                <input type="file" accept="image/*" class="toolbar-image-input" style="display:none" />
                <button type="button" data-command="formatBlock" data-value="pre" title="Code Block">&lt;/&gt;</button>
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <input type="color" class="toolbar-color" data-command="foreColor" title="Text color" />
                <input type="color" class="toolbar-color" data-command="backColor" title="Highlight" />
            </div>
            <div class="toolbar-separator"></div>
            <div class="toolbar-group">
                <button type="button" data-command="undo" title="Undo (Ctrl+Z)">↶</button>
                <button type="button" data-command="redo" title="Redo (Ctrl+Y)">↷</button>
            </div>
        `
        const div = document.createElement('div')
        div.className = 'content-editable-editor'
        div.contentEditable = 'true'
        div.innerHTML = this.formData.content || '<p><br></p>'
        editorContainer.appendChild(toolbar)
        editorContainer.appendChild(div)
        this.editor = {
            getContent: () => div.innerHTML,
            setContent: (c: string) => { div.innerHTML = c }
        }

        // Toolbar handlers
        toolbar.addEventListener('click', (e) => {
            const el = e.target as HTMLElement
            const button = el.closest('button') as HTMLButtonElement | null
            if (button) {
                const command = button.getAttribute('data-command')
                const value = button.getAttribute('data-value') || undefined
                if (command === 'insertImageFile') {
                    (toolbar.querySelector('.toolbar-image-input') as HTMLInputElement)?.click()
                    return
                }
                if (command) this.executeWYSIWYGCommand(command, value)
            }
        })
        // Track & restore selection for color/font operations
        let lastRange: Range | null = null
        const captureSelection = () => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) lastRange = sel.getRangeAt(0)
        }
        document.execCommand('styleWithCSS', false, 'true')
        div.addEventListener('mouseup', captureSelection)
        div.addEventListener('keyup', captureSelection)

        const applyWithSelection = (cmd: string, val?: string) => {
            div.focus()
            const sel = window.getSelection()
            if (lastRange && sel) {
                sel.removeAllRanges()
                sel.addRange(lastRange)
            }
            this.executeWYSIWYGCommand(cmd, val)
            captureSelection()
        }

        toolbar.addEventListener('input', (e) => {
            const colorInput = e.target as HTMLInputElement
            if (colorInput && colorInput.classList.contains('toolbar-color')) {
                const cmd = colorInput.getAttribute('data-command') || ''
                const val = colorInput.value
                if (cmd) applyWithSelection(cmd, val)
                return
            }
            const select = e.target as HTMLSelectElement
            if (select && select.classList.contains('toolbar-select')) {
                const cmd = select.getAttribute('data-command') || ''
                const val = select.value
                if (cmd) applyWithSelection(cmd, val)
                return
            }
        })

        toolbar.addEventListener('change', (e) => {
            const select = e.target as HTMLSelectElement
            if (select && select.classList.contains('toolbar-select')) {
                const cmd = select.getAttribute('data-command') || ''
                const val = select.value
                if (cmd) applyWithSelection(cmd, val)
            }
            const colorInput = e.target as HTMLInputElement
            if (colorInput && colorInput.classList.contains('toolbar-color')) {
                const cmd = colorInput.getAttribute('data-command') || ''
                const val = colorInput.value
                if (cmd) applyWithSelection(cmd, val)
            }
        })
        const imageInput = toolbar.querySelector('.toolbar-image-input') as HTMLInputElement
        imageInput?.addEventListener('change', async () => {
            if (imageInput.files && imageInput.files[0]) {
                await this.insertImageFile(div, imageInput.files[0])
                imageInput.value = ''
            }
        })

        // paste/drag-drop images and sanitize pasted content including MS Word HTML
        div.addEventListener('paste', (e: ClipboardEvent) => {
            const dt = e.clipboardData
            if (!dt) return
            const items = dt.items || [] as any
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item.type && item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile()
                    if (file) this.insertImageFile(div, file)
                }
            }
            const html = dt.getData('text/html')
            const text = dt.getData('text/plain')
            if (html || text) {
                e.preventDefault()
                if (html) {
                    const cleaned = html
                        .replace(/<\?xml[^>]*>/gi, '')
                        .replace(/<meta[^>]*>/gi, '')
                        .replace(/<link[^>]*>/gi, '')
                        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
                        .replace(/<!--([\s\S]*?)-->/g, '')
                        .replace(/class=\"Mso[^\"]*\"/gi, '')
                        .replace(/style=\"[^\"]*mso-[^\"]*\"/gi, '')
                        .replace(/style=\"[^\"]*(background(-color)?|font-family|color):[^\";]+;?[^\"]*\"/gi, '')
                        .replace(/(bgcolor|color)=\"[^\"]*\"/gi, '')
                        .replace(/<o:p>.*?<\/o:p>/gi, '')
                        .replace(/&nbsp;+/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .replace(/<span[^>]*>/gi, '<span>')
                        .replace(/ style=\"[^\"]*\"/gi, '')
                        .replace(/<p>\s*<\/p>/gi, '<p><br></p>')
                        .replace(/<div>([\s\S]*?)<\/div>/gi, '<p>$1</p>')
                        .replace(/(<p>(?:\s|<br\s*\/?>|&nbsp;)*<\/p>){1,}/gi, '')
                        .replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br/>')
                        .replace(/\n+/g, '\n')
                    document.execCommand('insertHTML', false, cleaned)
                } else if (text) {
                    const safe = text.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'} as any)[c])
                    const htmlText = safe.split(/\r?\n/).map(l => `<p>${l || '<br>'}</p>`).join('')
                    document.execCommand('insertHTML', false, htmlText)
                }
            }
        })
        div.addEventListener('dragover', (e) => e.preventDefault())
        div.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault()
            const files = e.dataTransfer?.files
            if (files && files.length) this.insertImageFile(div, files[0])
        })

        // Active-state sync
        const sync = () => this.updateToolbarActiveStates(toolbar)
        div.addEventListener('keyup', sync)
        div.addEventListener('mouseup', sync)
        document.addEventListener('selectionchange', sync)
        // Keyboard shortcuts
        div.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b': e.preventDefault(); this.executeWYSIWYGCommand('bold'); break
                    case 'i': e.preventDefault(); this.executeWYSIWYGCommand('italic'); break
                    case 'u': e.preventDefault(); this.executeWYSIWYGCommand('underline'); break
                    case 'z': e.preventDefault(); this.executeWYSIWYGCommand(e.shiftKey ? 'redo' : 'undo'); break
                    case 'y': e.preventDefault(); this.executeWYSIWYGCommand('redo'); break
                }
            }
        })
    }

    handleInputChange(field: string, value: any) {
        this.formData = { ...this.formData, [field]: value }
        this.clearError(field)
    }

    handleTitleChange(e: Event) {
        const title = (e.target as HTMLInputElement).value
        this.handleInputChange("title", title)
        this.generateSlug(title)
    }

    generateSlug(title: string) {
        const slug = title
            .normalize('NFD')
            .replace(/\p{Diacritic}+/gu, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
        this.handleInputChange("slug", slug)
    }

    clearError(field: string) {
        if (this.errors[field]) {
            this.errors = { ...this.errors, [field]: "" }
        }
    }

    validateForm(): boolean {
        const errors: { [key: string]: string } = {}

        if (!this.formData.title?.trim()) {
            errors.title = "Tiêu đề là bắt buộc"
        } else if (this.formData.title.length > 255) {
            errors.title = "Tiêu đề không được vượt quá 255 ký tự"
        }
        
        if (!this.formData.categoryId) errors.categoryId = "Danh mục là bắt buộc"
        const contentText = (this.editor ? this.editor.getContent() : '').replace(/<[^>]*>/g,'').trim()
        if (!contentText) errors.content = "Nội dung là bắt buộc"

        this.errors = errors
        return Object.keys(errors).length === 0
    }

    handleImageSelect(e: Event) {
        const input = e.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            const file = input.files[0]
            this.selectedImage = file

            if (this.blogImageUrl) URL.revokeObjectURL(this.blogImageUrl)

            const reader = new FileReader()
            reader.onload = (ev) => {
                this.blogImageUrl = ev.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    removeImage() {
        this.selectedImage = null
        if (this.blogImageUrl) URL.revokeObjectURL(this.blogImageUrl)
        this.blogImageUrl = ""
        this.formData.thumbnailUrl = ""
    }

    async uploadImage(): Promise<string> {
        if (!this.selectedImage) return this.formData.thumbnailUrl || ""

        this.uploadProgress = 10
        const base64 = await this.fileToBase64(this.selectedImage)
        const fileData = {
            name: this.selectedImage.name,
            contents: base64,
            binary: true,
        }

        const uploadResult = await manager.rest.api.ConfigurationResource.fileUploadExtend(fileData, {
            path: `/${this.selectedImage.name}`,
        })

        this.uploadProgress = 100
        return uploadResult.data?.filePath || uploadResult.data || uploadResult
    }

    fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "")
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    async handleSave() {
        if (!this.validateForm()) return

        this.loading = true
        try {
            if (this.selectedImage) {
                const filePath = await this.uploadImage()
                this.formData.thumbnailUrl = filePath
            }
            // Upload any data URL images inside editor content and replace with server URLs
            await this.replaceEditorDataUrlsWithUploads()
            const content = this.editor ? this.editor.getContent() : ""
            const blogData = {
                ...this.formData,
                content,
            }

            const response = await manager.rest.api.BlogResource.updateBlog(blogData)

            if (response && response.data) {
                this.showNotification("Cập nhật tin tức thành công")
                try {
                    sessionStorage.setItem('blogResetFilters', 'true')
                    if (this.formData?.id) {
                        sessionStorage.setItem('blogEnsureId', String(this.formData.id))
                        sessionStorage.setItem('blogEnsureStatus', String(!!this.formData.status))
                    }
                } catch {}
                setTimeout(() => {
                    window.location.hash = "/blog"
                }, 1200)
            } else {
                throw new Error("Cập nhật thất bại")
            }
        } catch (e) {
            this.showNotification("Có lỗi khi cập nhật", true)
        }
        this.loading = false
    }

    showNotification(message: string, isError = false) {
        this.notification = { message, isError, visible: true }
        setTimeout(() => {
            this.notification = { ...this.notification, visible: false }
        }, 3000)
    }

    async insertImageFile(editorDiv: HTMLElement, file: File) {
        const localReader = new FileReader()
        localReader.onload = () => {
            const dataUrl = localReader.result as string
            if (dataUrl) {
                document.execCommand('insertImage', false, dataUrl)
            }
        }
        localReader.readAsDataURL(file)
    }

    async replaceEditorDataUrlsWithUploads(): Promise<void> {
        const editorDiv = this.renderRoot?.querySelector('.content-editable-editor') as HTMLElement | null
        if (!editorDiv) return
        const imgs = Array.from(editorDiv.querySelectorAll('img')) as HTMLImageElement[]
        for (const img of imgs) {
            if (img.src && img.src.startsWith('data:')) {
                const file = await this.dataUrlToFile(img.src, 'image.png')
                this.selectedImage = file
                try {
                    const urlPath = await this.uploadImage()
                    let finalUrl = urlPath || ''
                    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
                        const base = window.location.origin.replace(/\/$/, '')
                        finalUrl = `${base}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`
                    }
                    if (finalUrl) img.src = finalUrl
                } catch (e) {
                    console.error('Upload image from data URL failed:', e)
                }
            }
        }
    }

    async dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        return new File([blob], filename, { type: blob.type })
    }

    executeWYSIWYGCommand(command: string, value?: string) {
        const editorDiv = this.renderRoot?.querySelector('.content-editable-editor') as HTMLElement
        if (!editorDiv) return
        editorDiv.focus()
        switch (command) {
            case 'bold': document.execCommand('bold', false); break
            case 'italic': document.execCommand('italic', false); break
            case 'underline': document.execCommand('underline', false); break
            case 'strikethrough': document.execCommand('strikeThrough', false); break
            case 'formatBlock': if (value) document.execCommand('formatBlock', false, value); break
            case 'insertUnorderedList': document.execCommand('insertUnorderedList', false); break
            case 'insertOrderedList': document.execCommand('insertOrderedList', false); break
            case 'justifyLeft': document.execCommand('justifyLeft', false); break
            case 'justifyCenter': document.execCommand('justifyCenter', false); break
            case 'justifyRight': document.execCommand('justifyRight', false); break
            case 'createLink': {
                const url = prompt('Nhập URL:', 'https://');
                if (url) document.execCommand('createLink', false, url);
                break
            }
            case 'fontName': if (value) document.execCommand('fontName', false, value); break
            case 'fontSize': if (value) document.execCommand('fontSize', false, value); break
            case 'undo': document.execCommand('undo', false); break
            case 'redo': document.execCommand('redo', false); break
        }
        editorDiv.dispatchEvent(new Event('input', { bubbles: true }))
    }

    updateToolbarActiveStates(toolbar: HTMLElement) {
        const is = (cmd: string) => document.queryCommandState(cmd)
        const toggle = (selector: string, active: boolean) => {
            const btn = toolbar.querySelector(selector) as HTMLElement | null
            if (!btn) return
            if (active) btn.classList.add('active'); else btn.classList.remove('active')
        }
        toggle('button[data-command="bold"]', is('bold'))
        toggle('button[data-command="italic"]', is('italic'))
        toggle('button[data-command="underline"]', is('underline'))
        toggle('button[data-command="strikethrough"]', is('strikeThrough'))
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
                    margin-bottom: 16px;
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
            .form-card {
                background: transparent;
                border-radius: 0;
                box-shadow: none;
                overflow: visible;
                border: none;
                margin-bottom: 0;
                width: 100%;
            }

            .form-content {
                padding: 40px;
                display: flow-root;
            }

            .form-grid {
                display: grid;
                gap: 2rem;
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
            }

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

            .form-select {
                padding: 1rem 1.25rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 1rem;
                background: #fafafa;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: inherit;
            }

            .form-select:focus {
                outline: none;
                border-color: #4D9D2A;
                background: white;
                box-shadow: 0 0 0 4px rgba(77, 157, 42, 0.1);
            }

            .form-select:hover {
                border-color: #9ca3af;
                background: white;
            }

            /* Editor wrapper and toolbar styles (match create page) */
            .editor-wrapper {
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                transition: border-color 0.2s ease;
                overflow: hidden;
                max-width: 100%;
                box-sizing: border-box;
            }
            .editor-wrapper:focus-within { border-color: #4D9D2A; }
            .simple-editor-toolbar {
                display: flex;
                gap: 8px;
                padding: 12px;
                background: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
                border-radius: 8px 8px 0 0;
                flex-wrap: wrap;
                align-items: center;
            }
            .toolbar-group { display: flex; gap: 2px; align-items: center; }
            .toolbar-color { width: 36px; height: 36px; border: 1px solid #d1d5db; border-radius: 6px; padding: 0; background: white; cursor: pointer; }
            .toolbar-separator { width: 1px; height: 24px; background: #d1d5db; margin: 0 4px; }
            .simple-editor-toolbar .toolbar-select {
                height: 36px; border: 1px solid #d1d5db; border-radius: 6px; background: white; padding: 0 8px; color: #374151;
            }
            .simple-editor-toolbar button { padding: 8px 12px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: #374151; }
            .simple-editor-toolbar button:hover { background-color: #e5f6e0; border-color: #4D9D2A; color: #4D9D2A; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(77,157,42,0.2); }
            .simple-editor-toolbar button:active { background-color: #4D9D2A; color: #fff; border-color: #4D9D2A; transform: translateY(0); }
            .simple-editor-toolbar button.active { background-color: #4D9D2A; color: #fff; border-color: #4D9D2A; }
            .content-editable-editor { 
                min-height: 300px; 
                width: 100%; 
                border: none; 
                outline: none; 
                font-family: 'Roboto','Arial',sans-serif; 
                font-size: 16px; 
                line-height: 1.6; 
                padding: 16px; 
                color: #374151; 
                background: white; 
                overflow-y: auto; 
                word-wrap: break-word; 
                word-break: break-word;
                overflow-wrap: anywhere;
                white-space: pre-wrap;
                max-height: none; 
                overflow-x: hidden;
                box-sizing: border-box;
            }
            .content-editable-editor p { margin: 0 0 6px 0; }
            .content-editable-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }

            .image-upload-area {
                border: 2px dashed #d1d5db;
                border-radius: 16px;
                padding: 2rem;
                text-align: center;
                background: #fafafa;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            }

            .image-upload-area:hover {
                border-color: #4D9D2A;
                background: rgba(77, 157, 42, 0.02);
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

            .upload-icon {
                width: 48px;
                height: 48px;
                margin: 0 auto 1rem;
                color: #9ca3af;
            }

            .upload-text {
                font-size: 1.1rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            .upload-hint {
                font-size: 0.9rem;
                color: #9ca3af;
            }

            .file-input {
                position: absolute;
                inset: 0;
                opacity: 0;
                cursor: pointer;
            }

            .remove-image-btn {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            }

            .remove-image-btn:hover {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            }

            .actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                padding: 16px 0 0 0; /* merge with container */
                background: transparent;
                border-top: none;
            }

            .btn-primary {
                background: linear-gradient(135deg, #4D9D2A, #5cb32e);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(77, 157, 42, 0.3);
                min-width: 140px;
            }

            .btn-primary:hover:not(:disabled) {
                background: linear-gradient(135deg, #5cb32e, #4D9D2A);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(77, 157, 42, 0.4);
            }

            .btn-primary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

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

            .error-message {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .error-message::before {
                content: '⚠';
                font-size: 1rem;
            }

            .notification {
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                color: white;
                font-size: 0.875rem;
                font-weight: 500;
                z-index: 1000;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(10px);
                animation: slideInFromRight 0.3s ease;
                max-width: 300px;
            }

            .notification:not(.error) {
                background: linear-gradient(135deg, #4d9d2a, #5cb32e);
            }

            .notification.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
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

            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @media (max-width: 768px) {
                .header-content {
                    padding: 0 1rem;
                }

                .page-title {
                    font-size: 2rem;
                }

                .edit-container {
                    padding: 0 1rem 2rem;
                }

                .form-content { padding: 24px 20px; display: flow-root; }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                .actions {
                    padding: 24px;
                    flex-direction: column;
                }

                .notification {
                    bottom: 1rem;
                    right: 1rem;
                    left: 1rem;
                    max-width: none;
                }
            }
        `,
    ]

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
                    Chỉnh sửa tin tức
                </div>
                    <div class="form-content">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Tiêu đề</label>
                                    <input
                                            class="form-input"
                                            .value="${this.formData.title || ""}"
                                            @input="${this.handleTitleChange}"
                                            placeholder="Nhập tiêu đề tin tức..."
                                    />
                                    ${this.errors.title ? html`<div class="error-message">${this.errors.title}</div>` : ""}
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Danh mục</label>
                                    <select
                                            class="form-select"
                                            .value="${String(this.formData.categoryId ?? "")}"
                                            @change="${(e: any) => this.handleInputChange("categoryId", Number(e.target.value))}"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        ${this.categories.map(
                                                (cat) => html`
                                            <option value="${cat.id}">${cat.name}</option>
                                        `,
                                        )}
                                    </select>
                                    ${this.errors.categoryId ? html`<div class="error-message">${this.errors.categoryId}</div>` : ""}
                                </div>
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">Tóm tắt</label>
                                <input
                                        class="form-input"
                                        .value="${this.formData.summary || ""}"
                                        @input="${(e: any) => this.handleInputChange("summary", e.target.value)}"
                                        placeholder="Nhập tóm tắt ngắn gọn về tin tức..."
                                />
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">Nội dung</label>
                                <div id="editor" class="editor-wrapper"></div>
                                ${this.errors.content ? html`<div class="error-message">${this.errors.content}</div>` : ""}
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">Ảnh thumbnail</label>
                                <div class="image-upload-area ${this.blogImageUrl ? "has-image" : ""}">
                                    ${
                                            this.blogImageUrl
                                                    ? html`
                                                        <img class="image-preview" src="${this.blogImageUrl}" alt="Thumbnail" />
                                                        <button class="remove-image-btn" @click="${(e: Event) => { e.stopPropagation(); this.removeImage(); }}">
                                                            Xóa ảnh
                                                        </button>
                                                    `
                                                    : html`
                                        <div class="upload-icon">📷</div>
                                        <div class="upload-text">Chọn ảnh thumbnail</div>
                                        <div class="upload-hint">PNG, JPG, GIF tối đa 10MB</div>
                                    `
                                    }
                                    ${this.blogImageUrl ? html`` : html`<input
                                            type="file"
                                            class="file-input"
                                            accept="image/*"
                                            @change="${this.handleImageSelect}"
                                    />`}
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Độ ưu tiên</label>
                                    <select
                                            class="form-select"
                                            .value="${this.formData.priorityLevel || ""}"
                                            @change="${(e: any) => this.handleInputChange("priorityLevel", Number(e.target.value))}"
                                    >
                                        <option value="">Chọn độ ưu tiên</option>
                                        <option value="1">Thấp</option>
                                        <option value="2">Trung bình</option>
                                        <option value="3">Cao</option>
                                        <option value="4">Rất cao</option>
                                        <option value="5">Khẩn cấp</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Trạng thái</label>
                                    <select
                                            class="form-select"
                                            .value="${String(this.formData.status)}"
                                            @change="${(e: any) => this.handleInputChange("status", e.target.value === "true")}"
                                    >
                                        <option value="true">✅ Đã xuất bản</option>
                                        <option value="false">📝 Bản nháp</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn-secondary" @click="${() => (window.location.hash = '/blog')}">Hủy bỏ</button>
                        <button class="btn-primary" @click="${() => this.handleSave()}" ?disabled="${this.loading}">
                            ${this.loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
                ${this.notification.visible ? html`<div class="notification ${this.notification.isError ? 'error' : ''}">${this.notification.message}</div>` : ''}
            </div>
            </div>
        `;
    }
}
