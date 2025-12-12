import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LitElement } from "lit";
import "@vaadin/text-field";
import "@vaadin/text-area";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@openremote/or-translate";
import "@openremote/or-icon";
import manager from "@openremote/core";
// TinyMCE sẽ được load từ CDN
import { Blog, BlogCategory } from "@openremote/model";
import { Page } from "@openremote/or-app";
import { router } from "@openremote/or-app";

@customElement("blog-create-page")
export class BlogCreatePage extends LitElement {
    @property({ type: Array }) categories: BlogCategory[] = [];
    @state() loading = false;
    @state() formData = {
        title: "",
        content: "",
        slug: "",
        summary: "",
        thumbnailUrl: "",
        categoryId: null as number | null,
        priorityLevel: 1,
        startDate: "",
        endDate: "",
        status: true
    };
    @state() errors: { [key: string]: string } = {};
    @state() selectedImage: File | null = null;
    @state() imagePreview: string = "";
    @state() uploadProgress = 0;
    @state() editor: any = null;

    static get styles() {
        return css`
            /* RẤT QUAN TRỌNG: Đảm bảo bạn đã tải các biến thể font cần thiết */
            /* Nếu bạn dùng Google Fonts, hãy thêm dòng này vào file HTML chính của bạn (ví dụ: index.html) */
            /* Đảm bảo bao gồm các độ dày (weights) bạn muốn sử dụng, ví dụ: 400 (regular), 700 (bold), 300 (light), v.v. */
            /* Ví dụ cho Roboto với các độ dày phổ biến: */
            /* <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"> */
            /* Nếu bạn tự host font, hãy đảm bảo có các tệp font cho từng độ dày và khai báo đúng @font-face */
            /*
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/Roboto-Regular.woff2') format('woff2');
                font-weight: 400;
                font-style: normal;
            }
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/Roboto-Bold.woff2') format('woff2');
                font-weight: 700; // Đây là biến thể BOLD cần thiết
                font-style: normal;
            }
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/Roboto-Italic.woff2') format('woff2');
                font-weight: 400;
                font-style: italic;
            }
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/Roboto-BoldItalic.woff2') format('woff2');
                font-weight: 700;
                font-style: italic;
            }
            */
            :host {
                display: block;
                min-height: 100vh;
                background: #f8fafc;
                padding: 24px 16px;
                margin: auto;
            }
            .container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                overflow: visible;
                min-height: auto;
                display: flex;
                flex-direction: column;
            }
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
            .page-header {
                background: linear-gradient(135deg, #4D9D2A 0%, #3D7D1A 100%);
                color: white;
                padding: 32px;
                text-align: center;
            }
            .page-title {
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 12px;
                justify-content: center;
            }
            .page-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin-top: 8px;
            }
            .form-content {
                padding: 40px;
            }
            .form-section {
                margin-bottom: 40px;
            }
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding-bottom: 12px;
                border-bottom: 2px solid #e5e7eb;
            }
            .form-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 24px;
            }
            .form-grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            .form-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .form-label {
                font-size: 14px;
                color: #374151;
                font-weight: 600;
                margin: 0;
            }
            .required-asterisk {
                color: #EF4444; /* Màu đỏ cho dấu sao */
                font-weight: 700;
                margin-left: 4px;
            }
            .form-input, .form-textarea, .form-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s ease;
                background: #ffffff;
                font-family: inherit;
                box-sizing: border-box;
            }
            .form-input:focus, .form-textarea:focus, .form-select:focus {
                outline: none;
                border-color: #4D9D2A;
                box-shadow: 0 0 0 3px rgba(77, 157, 42, 0.1);
            }
            .form-input.error, .form-textarea.error, .form-select.error {
                border-color: #dc2626;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
            }
            .form-textarea {
                resize: vertical;
                min-height: 120px;
            }
            .error-message {
                color: #dc2626;
                font-size: 12px;
                margin: 0;
            }
            .image-upload-section {
                background: #f9fafb;
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 32px;
                text-align: center;
                transition: all 0.2s ease;
            }
            .image-upload-section:hover {
                border-color: #4D9D2A;
                background: #f0f9ff;
            }
            .image-preview-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }
            .image-preview {
                width: 200px;
                height: 140px;
                object-fit: cover;
                border-radius: 12px;
                border: 2px solid #e5e7eb;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .remove-image-btn {
                background: #dc2626;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            .remove-image-btn:hover {
                background: #b91c1c;
                transform: translateY(-1px);
            }
            .upload-progress {
                width: 200px;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            .upload-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #4D9D2A, #22c55e);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            /* New wrapper for TinyMCE error styling */
            .editor-wrapper {
                border: 2px solid #e5e7eb; /* Default border */
                border-radius: 8px;
                background: white;
                transition: border-color 0.2s ease;
                overflow: hidden; /* fix right-corner */
                max-width: 100%;
                box-sizing: border-box;
            }
            .editor-wrapper.error {
                border-color: #dc2626;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
            }
            .editor-wrapper:focus-within {
                border-color: #4D9D2A;
            }
            /* TinyMCE Editor Styles */
            #editor {
                min-height: 300px;
                width: 100%;
                border: none;
                outline: none;
                resize: vertical;
                font-family: 'Roboto', 'Arial', sans-serif;
                font-size: 16px;
                line-height: 1.6;
                padding: 16px;
                color: #374151;
                background: white;
                max-height: none;
                overflow: visible;
            }
            #editor:focus {
                outline: none;
            }
            #editor::placeholder {
                color: #9ca3af;
                font-style: italic;
            }

            /* Content Editable Editor Styles */
            .content-editable-editor {
                min-height: 300px;
                width: 100%;
                border: none;
                outline: none;
                font-family: 'Roboto', 'Arial', sans-serif;
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
            .content-editable-editor:focus {
                outline: none;
            }
            .content-editable-editor p {
                margin: 0 0 12px 0;
            }
            .content-editable-editor h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 16px 0 8px 0;
                color: #1f2937;
            }
            .content-editable-editor h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 14px 0 6px 0;
                color: #1f2937;
            }
            .content-editable-editor h3 {
                font-size: 1.25em;
                font-weight: bold;
                margin: 12px 0 4px 0;
                color: #1f2937;
            }
            .content-editable-editor blockquote {
                border-left: 4px solid #4D9D2A;
                padding-left: 16px;
                margin: 16px 0;
                font-style: italic;
                color: #666;
                background: #f9fafb;
                padding: 12px 16px;
                border-radius: 4px;
            }
            .content-editable-editor ul, .content-editable-editor ol {
                padding-left: 24px;
                margin: 12px 0;
            }
            .content-editable-editor li {
                margin-bottom: 4px;
            }
            .content-editable-editor a {
                color: #4D9D2A;
                text-decoration: underline;
            }
            .content-editable-editor a:hover {
                color: #3D7D1A;
            }
            .content-editable-editor img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 8px 0;
            }
            .content-editable-editor pre {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                overflow-x: auto;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                margin: 12px 0;
            }
            .checkbox-field {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-top: 10px;
            }
            .checkbox-field input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #4D9D2A;
            }
            .footer {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-top: 48px;
                padding-top: 32px;
                border-top: 1px solid #e5e7eb;
            }
            vaadin-button {
                --vaadin-button-primary-background: #4D9D2A;
                --vaadin-button-primary-background-hover: #3D7D1A;
                --vaadin-button-primary-background-active: #2D5D0A;
                --vaadin-button-background: #f3f4f6;
                --vaadin-button-background-hover: #e5e7eb;
                --vaadin-button-text-color: #374151;
                min-width: 120px;
                height: 44px;
                border-radius: 8px;
                font-weight: 500;
            }
            .loading {
                opacity: 0.6;
                pointer-events: none;
            }
            .general-error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 24px;
                text-align: center;
            }
            /* Responsive Design */
            @media (max-width: 768px) {
                :host {
                    padding: 16px 8px;
                }
                .container {
                    margin: 0;
                    border-radius: 12px;
                }
                .page-header {
                    padding: 24px 20px;
                }
                .page-title {
                    font-size: 24px;
                }
                .form-content {
                    padding: 24px 20px;
                }
                .form-grid-2 {
                    grid-template-columns: 1fr;
                }
                .section-title {
                    font-size: 16px;
                }
            }
            @media (max-width: 480px) {
                .page-header {
                    padding: 20px 16px;
                }
                .form-content {
                    padding: 20px 16px;
                }
                .page-title {
                    font-size: 20px;
                    flex-direction: column;
                    gap: 8px;
                }
            }
            /* TinyMCE Custom Styles */
            .tox-tinymce {
                border: none !important;
                border-radius: 8px !important;
            }
            .tox .tox-toolbar {
                background: #f8fafc !important;
                border-bottom: 1px solid #e5e7eb !important;
            }
            .tox .tox-tbtn {
                border-radius: 4px !important;
                margin: 2px !important;
            }
            .tox .tox-tbtn:hover {
                background-color: #e5f6e0 !important;
                color: #4D9D2A !important;
            }
            .tox .tox-tbtn--enabled {
                background-color: #4D9D2A !important;
                color: white !important;
            }

            /* Simple Editor Toolbar Styles */
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
            .toolbar-group {
                display: flex;
                gap: 2px;
                align-items: center;
            }
            .toolbar-separator {
                width: 1px;
                height: 24px;
                background: #d1d5db;
                margin: 0 4px;
            }
            .simple-editor-toolbar .toolbar-select {
                height: 36px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                padding: 0 8px;
                color: #374151;
            }
            .simple-editor-toolbar button {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                min-width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #374151;
            }
            .toolbar-color {
                width: 36px;
                height: 36px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 0;
                background: white;
                cursor: pointer;
            }
            .simple-editor-toolbar button:hover {
                background-color: #e5f6e0;
                border-color: #4D9D2A;
                color: #4D9D2A;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(77, 157, 42, 0.2);
            }
            .simple-editor-toolbar button:active {
                background-color: #4D9D2A;
                color: white;
                border-color: #4D9D2A;
                transform: translateY(0);
            }
            .simple-editor-toolbar button.active {
                background-color: #4D9D2A;
                color: #fff;
                border-color: #4D9D2A;
            }
            .simple-editor-toolbar button[data-command="bold"] strong,
            .simple-editor-toolbar button[data-command="italic"] em,
            .simple-editor-toolbar button[data-command="underline"] u,
            .simple-editor-toolbar button[data-command="strikethrough"] s {
                font-weight: bold;
                font-style: normal;
                text-decoration: none;
            }
        `;
    }

    firstUpdated() {
        // Đợi một chút để đảm bảo DOM đã sẵn sàng
        setTimeout(() => {
            this.initEditor();
        }, 100);
    }

    shouldUpdate(changedProps: Map<string | symbol, unknown>): boolean {
        console.log("=== DEBUG: shouldUpdate() called ===");
        console.log("Changed props:", Array.from(changedProps.keys()));
        console.log("Editor exists:", !!this.editor);

        // Luôn cho phép render lần đầu
        if (!this.editor) {
            console.log("Editor chưa tồn tại, cho phép render");
            return true;
        }

        // Chỉ render lại khi thực sự cần thiết
        for (const key of changedProps.keys()) {
            if (key === 'formData') {
                const oldFormData = changedProps.get('formData') as typeof this.formData;
                if (oldFormData) {
                    // Chỉ render lại nếu có thay đổi quan trọng (không phải content)
                    for (const field in this.formData) {
                        if (field !== 'content' && (this.formData as any)[field] !== (oldFormData as any)[field]) {
                            console.log(`Field '${field}' changed, allowing render`);
                            return true;
                        }
                    }
                    // Nếu chỉ content thay đổi, không render lại
                    console.log("Only content changed, preventing render to preserve editor state");
                    return false;
                }
            } else if (key === 'errors') {
                // Cập nhật error state cho editor wrapper mà không render lại
                this.updateEditorErrorState();
                // Chỉ render lại nếu có lỗi mới (không phải content)
                const oldErrors = changedProps.get('errors') as typeof this.errors;
                if (oldErrors) {
                    for (const field in this.errors) {
                        if (field !== 'content' && this.errors[field] !== oldErrors[field]) {
                            console.log(`Error field '${field}' changed, allowing render`);
                            return true;
                        }
                    }
                }
                // Nếu chỉ content error thay đổi, không render lại
                console.log("Only content error changed, preventing render");
                return false;
            } else if (key !== 'editor') {
                console.log(`Key '${String(key)}' changed, allowing render`);
                return true;
            }
        }

        console.log("No important changes, preventing render");
        return false;
    }

    updated(changedProps: Map<string, any>) {
        // Không cần làm gì đặc biệt ở đây
    }

    updateEditorErrorState() {
        const editorWrapper = this.renderRoot.querySelector('.editor-wrapper');
        if (editorWrapper) {
            if (this.errors.content) {
                editorWrapper.classList.add('error');
            } else {
                editorWrapper.classList.remove('error');
            }
        }
    }



    initEditor() {
        console.log("=== DEBUG: initEditor() called ===");

        if (this.editor) {
            console.log("Editor đã được khởi tạo, bỏ qua.");
            return;
        }

        const editorElement = this.renderRoot?.querySelector("#editor");
        console.log("Editor element:", editorElement);

        if (!(editorElement instanceof HTMLElement)) {
            console.error("Editor element không tìm thấy");
            return;
        }

        // Load TinyMCE từ CDN với retry logic
        this.loadTinyMCE();
    }

    loadTinyMCE() {
        console.log("=== DEBUG: loadTinyMCE() called ===");

        // Force fallback to simple editor ngay lập tức để test
        console.log("Forcing fallback to simple editor for testing");
        this.fallbackToSimpleEditor();
        return;

        if ((window as any).tinymce) {
            console.log("TinyMCE đã có sẵn, khởi tạo ngay");
            this.initTinyMCE();
            return;
        }

        // Thử load từ CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js';
        script.onload = () => {
            console.log("TinyMCE loaded successfully from CDN");
            setTimeout(() => {
                this.initTinyMCE();
            }, 100);
        };
        script.onerror = () => {
            console.error("Failed to load TinyMCE from CDN, trying alternative");
            // Thử CDN khác
            const altScript = document.createElement('script');
            altScript.src = 'https://unpkg.com/tinymce@6.8.3/tinymce.min.js';
            altScript.onload = () => {
                console.log("TinyMCE loaded successfully from alternative CDN");
                setTimeout(() => {
                    this.initTinyMCE();
                }, 100);
            };
            altScript.onerror = () => {
                console.error("Failed to load TinyMCE from all CDNs");
                this.fallbackToSimpleEditor();
            };
            document.head.appendChild(altScript);
        };
        document.head.appendChild(script);
    }

    initTinyMCE() {
        console.log("=== DEBUG: initTinyMCE() called ===");

        const tinymce = (window as any).tinymce;
        if (!tinymce) {
            console.error("TinyMCE không được load");
            this.fallbackToSimpleEditor();
            return;
        }

        // Khởi tạo TinyMCE
        tinymce.init({
            selector: '#editor',
            height: 400,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'paste'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: `
                body { font-family: 'Roboto', 'Arial', sans-serif; font-size: 16px; line-height: 1.6; }
                p { margin-bottom: 12px; }
                h1, h2, h3, h4, h5, h6 { margin-top: 16px; margin-bottom: 8px; font-weight: 600; }
                blockquote { border-left: 4px solid #4D9D2A; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666; }
                code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
                pre { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
                ul, ol { padding-left: 24px; }
                li { margin-bottom: 4px; }
                a { color: #4D9D2A; text-decoration: underline; }
                a:hover { color: #3D7D1A; }
                img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
                video { max-width: 100%; border-radius: 8px; margin: 8px 0; }
            `,
            setup: (editor: any) => {
                this.editor = editor;
                console.log("TinyMCE editor đã được khởi tạo:", editor);

                // Đặt nội dung ban đầu
                if (this.formData.content) {
                    editor.setContent(this.formData.content);
                    console.log("Nội dung ban đầu đã được đặt:", this.formData.content);
                }

                // Lắng nghe content change
                editor.on('Change', () => {
                    console.log("=== DEBUG: TinyMCE Change event ===");
                    const content = editor.getContent();
                    console.log("Current content:", content);

                    if (this.errors.content) {
                        this.clearError('content');
                    }

                    // Update formData mà không trigger re-render
                    const newFormData = { ...this.formData };
                    newFormData.content = content;
                    this.formData = newFormData;
                    console.log("FormData.content đã được cập nhật:", this.formData.content);
                });

                // Lắng nghe focus
                editor.on('Focus', () => {
                    console.log("TinyMCE focused");
                });

                // Lắng nghe blur
                editor.on('Blur', () => {
                    console.log("TinyMCE blurred");
                });

                console.log("=== DEBUG: initTinyMCE() completed ===");
            }
        });
    }

    fallbackToSimpleEditor() {
        console.log("=== DEBUG: fallbackToSimpleEditor() called ===");

        const textarea = this.renderRoot?.querySelector("#editor") as HTMLTextAreaElement;
        if (!textarea) {
            console.error("Textarea không tìm thấy");
            return;
        }

        // Tạo simple editor với basic formatting
        this.createSimpleEditor(textarea);
    }

    createSimpleEditor(textarea: HTMLTextAreaElement) {
        console.log("=== DEBUG: createSimpleEditor() called ===");

        // Tạo contenteditable div thay vì dùng textarea
        const editorDiv = document.createElement('div');
        editorDiv.contentEditable = 'true';
        editorDiv.className = 'content-editable-editor';
        editorDiv.innerHTML = textarea.value || '<p><br></p>';

        // Thay thế textarea bằng div
        textarea.parentNode?.replaceChild(editorDiv, textarea);

        // Tạo toolbar với nhiều chức năng hơn
        const toolbar = document.createElement('div');
        toolbar.className = 'simple-editor-toolbar';
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
                <button type="button" data-command="undo" title="Undo (Ctrl+Z)">↶</button>
                <button type="button" data-command="redo" title="Redo (Ctrl+Y)">↷</button>
            </div>
        `;

        // Insert toolbar before editor div
        editorDiv.parentNode?.insertBefore(toolbar, editorDiv);

        // Add event listeners
        toolbar.addEventListener('click', (e) => {
            const el = e.target as HTMLElement;
            const button = el.closest('button') as HTMLButtonElement | null;
            if (button && button.tagName === 'BUTTON') {
                const command = button.getAttribute('data-command');
                const value = button.getAttribute('data-value');
                if (command === 'insertImageFile') {
                    const input = toolbar.querySelector('.toolbar-image-input') as HTMLInputElement;
                    input?.click();
                    return;
                }
                if (command) {
                    this.executeWYSIWYGCommand(command, value);
                }
            }
        });
        const imageInput = toolbar.querySelector('.toolbar-image-input') as HTMLInputElement;
        imageInput?.addEventListener('change', async () => {
            if (imageInput.files && imageInput.files[0]) {
                await this.insertImageFile(editorDiv, imageInput.files[0]);
                imageInput.value = '';
            }
        });
        // Track and restore selection for color/font operations
        let lastRange: Range | null = null;
        const captureSelection = () => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) lastRange = sel.getRangeAt(0);
        };
        document.execCommand('styleWithCSS', false, 'true');
        editorDiv.addEventListener('mouseup', captureSelection);
        editorDiv.addEventListener('keyup', captureSelection);

        const applyWithSelection = (cmd: string, val?: string) => {
            console.debug('[Editor] applyWithSelection', { cmd, val });
            editorDiv.focus();
            const sel = window.getSelection();
            if (lastRange && sel) {
                sel.removeAllRanges();
                sel.addRange(lastRange);
            }
            // If still no selection, select current word under caret to provide immediate feedback
            const sel2 = window.getSelection();
            if (sel2 && sel2.rangeCount > 0 && sel2.getRangeAt(0).collapsed) {
                const r = sel2.getRangeAt(0);
                const node = r.startContainer;
                if (node && node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent || '';
                    const offset = r.startOffset;
                    let start = offset;
                    let end = offset;
                    while (start > 0 && /\S/.test(text[start-1])) start--;
                    while (end < text.length && /\S/.test(text[end])) end++;
                    const wordRange = document.createRange();
                    wordRange.setStart(node, start);
                    wordRange.setEnd(node, Math.max(start+1, end));
                    sel2.removeAllRanges();
                    sel2.addRange(wordRange);
                }
            }
            this.executeWYSIWYGCommand(cmd, val);
            captureSelection();
        };

        toolbar.addEventListener('input', (e) => {
            const select = e.target as HTMLSelectElement;
            if (select && select.classList.contains('toolbar-select')) {
                const cmd = select.getAttribute('data-command') || '';
                const val = select.value;
                console.debug('[Editor] select input change', { cmd, val });
                if (cmd) applyWithSelection(cmd, val);
                return;
            }
        });

        toolbar.addEventListener('change', (e) => {
            const select = e.target as HTMLSelectElement;
            if (select && select.classList.contains('toolbar-select')) {
                const cmd = select.getAttribute('data-command') || '';
                const val = select.value;
                console.debug('[Editor] select change', { cmd, val });
                if (cmd) applyWithSelection(cmd, val);
                return;
            }
        });

        // Add input event listener
        editorDiv.addEventListener('input', () => {
            if (this.errors.content) {
                this.clearError('content');
            }

            const newFormData = { ...this.formData };
            newFormData.content = editorDiv.innerHTML;
            this.formData = newFormData;
            this.updateToolbarActiveStates(toolbar);
        });

        // Sync toolbar state on selection changes
        const sync = () => this.updateToolbarActiveStates(toolbar);
        editorDiv.addEventListener('keyup', sync);
        editorDiv.addEventListener('mouseup', sync);
        document.addEventListener('selectionchange', sync);

        // Paste images and sanitize pasted content spacing/inline styles
        editorDiv.addEventListener('paste', (e: ClipboardEvent) => {
            const dt = e.clipboardData;
            if (!dt) return;
            const items = dt.items || [] as any;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type && item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) this.insertImageFile(editorDiv, file);
                }
            }
            const html = dt.getData('text/html');
            const text = dt.getData('text/plain');
            if (html || text) {
                e.preventDefault();
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
                        .replace(/\n+/g, '\n');
                    document.execCommand('insertHTML', false, cleaned);
                } else if (text) {
                    const safe = text.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'} as any)[c]);
                    const htmlText = safe.split(/\r?\n/).map(l => `<p>${l || '<br>'}</p>`).join('');
                    document.execCommand('insertHTML', false, htmlText);
                }
            }
        });
        // Drag & drop images
        editorDiv.addEventListener('dragover', (e) => { e.preventDefault(); });
        editorDiv.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            const files = e.dataTransfer?.files;
            if (files && files.length) this.insertImageFile(editorDiv, files[0]);
        });

        // Add keyboard shortcuts
        editorDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.executeWYSIWYGCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeWYSIWYGCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.executeWYSIWYGCommand('underline');
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.executeWYSIWYGCommand('redo');
                        } else {
                            e.preventDefault();
                            this.executeWYSIWYGCommand('undo');
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.executeWYSIWYGCommand('redo');
                        break;
                }
            }
        });

        // Focus editor
        editorDiv.focus();

        this.editor = {
            getContent: () => editorDiv.innerHTML,
            setContent: (content: string) => { editorDiv.innerHTML = content; }
        };

        console.log("WYSIWYG editor created successfully");
    }

    updateToolbarActiveStates(toolbar: HTMLElement) {
        const is = (cmd: string) => document.queryCommandState(cmd);
        const toggle = (selector: string, active: boolean) => {
            const btn = toolbar.querySelector(selector) as HTMLElement | null;
            if (!btn) return;
            if (active) btn.classList.add('active'); else btn.classList.remove('active');
        };
        toggle('button[data-command="bold"]', is('bold'));
        toggle('button[data-command="italic"]', is('italic'));
        toggle('button[data-command="underline"]', is('underline'));
        toggle('button[data-command="strikethrough"]', is('strikeThrough'));
    }

    async insertImageFile(editorDiv: HTMLElement, file: File) {
        // Insert a temporary preview immediately for good UX; upload will be handled on save
        const localReader = new FileReader();
        const insertAtCursor = (src: string) => {
            document.execCommand('insertImage', false, src);
            editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
        };
        localReader.onload = () => {
            const dataUrl = localReader.result as string;
            if (dataUrl) insertAtCursor(dataUrl);
        };
        localReader.readAsDataURL(file);
    }

    async replaceEditorDataUrlsWithUploads(): Promise<void> {
        const editorDiv = this.renderRoot?.querySelector('.content-editable-editor') as HTMLElement | null;
        if (!editorDiv) return;
        const imgs = Array.from(editorDiv.querySelectorAll('img')) as HTMLImageElement[];
        for (const img of imgs) {
            if (img.src && img.src.startsWith('data:')) {
                const file = await this.dataUrlToFile(img.src, 'image.png');
                this.selectedImage = file;
                try {
                    const urlPath = await this.uploadImage();
                    let finalUrl = urlPath || '';
                    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
                        const base = window.location.origin.replace(/\/$/, '');
                        finalUrl = `${base}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
                    }
                    if (finalUrl) img.src = finalUrl;
                } catch (e) {
                    console.error('Upload image from data URL failed:', e);
                }
            }
        }
    }

    async dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    }

    executeWYSIWYGCommand(command: string, value?: string) {
        const editorDiv = this.renderRoot?.querySelector('.content-editable-editor') as HTMLElement;
        if (!editorDiv) return;

        // Đảm bảo editor có focus
        editorDiv.focus();

        // Sử dụng document.execCommand để format thật
        console.debug('[Editor] executeWYSIWYGCommand', { command, value });
        switch (command) {
            case 'bold':
                document.execCommand('bold', false);
                break;
            case 'italic':
                document.execCommand('italic', false);
                break;
            case 'underline':
                document.execCommand('underline', false);
                break;
            case 'strikethrough':
                document.execCommand('strikeThrough', false);
                break;
            // Removed color commands per request
            case 'formatBlock':
                if (value) {
                    document.execCommand('formatBlock', false, value);
                }
                break;
            case 'insertUnorderedList':
                document.execCommand('insertUnorderedList', false);
                break;
            case 'insertOrderedList':
                document.execCommand('insertOrderedList', false);
                break;
            case 'justifyLeft':
                document.execCommand('justifyLeft', false);
                break;
            case 'justifyCenter':
                document.execCommand('justifyCenter', false);
                break;
            case 'justifyRight':
                document.execCommand('justifyRight', false);
                break;
            case 'createLink':
                const url = prompt('Nhập URL:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'insertImage':
                const imageUrl = prompt('Nhập URL ảnh:', 'https://');
                if (imageUrl) {
                    document.execCommand('insertImage', false, imageUrl);
                }
                break;
            case 'fontName':
                if (value) document.execCommand('fontName', false, value);
                break;
            case 'fontSize':
                if (value) document.execCommand('fontSize', false, value);
                break;
            case 'undo':
                document.execCommand('undo', false);
                break;
            case 'redo':
                document.execCommand('redo', false);
                break;
        }

        // Trigger input event để cập nhật formData
        editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * Apply inline style to current selection inside the shadow DOM.
     * Returns true if applied, false if could not apply.
     */
    // Color styling helper removed per request

    executeCommand(command: string) {
        const textarea = this.renderRoot?.querySelector("#editor") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        let replacement = '';
        let newCursorPos = start;

        switch (command) {
            case 'bold':
                replacement = `**${selectedText}**`;
                newCursorPos = start + 2;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                newCursorPos = start + 1;
                break;
            case 'underline':
                replacement = `__${selectedText}__`;
                newCursorPos = start + 2;
                break;
            case 'strikethrough':
                replacement = `~~${selectedText}~~`;
                newCursorPos = start + 2;
                break;
            case 'h1':
                replacement = `# ${selectedText}`;
                newCursorPos = start + 2;
                break;
            case 'h2':
                replacement = `## ${selectedText}`;
                newCursorPos = start + 3;
                break;
            case 'h3':
                replacement = `### ${selectedText}`;
                newCursorPos = start + 4;
                break;
            case 'insertUnorderedList':
                replacement = `• ${selectedText}`;
                newCursorPos = start + 2;
                break;
            case 'insertOrderedList':
                replacement = `1. ${selectedText}`;
                newCursorPos = start + 3;
                break;
            case 'blockquote':
                replacement = `> ${selectedText}`;
                newCursorPos = start + 2;
                break;
            case 'code':
                replacement = `\`${selectedText}\``;
                newCursorPos = start + 1;
                break;
            case 'link':
                const url = prompt('Nhập URL:', 'https://');
                if (url) {
                    replacement = `[${selectedText}](${url})`;
                    newCursorPos = start + selectedText.length + 3;
                } else {
                    return;
                }
                break;
            case 'image':
                const imageUrl = prompt('Nhập URL ảnh:', 'https://');
                if (imageUrl) {
                    const altText = prompt('Nhập mô tả ảnh:', selectedText || 'Image');
                    replacement = `![${altText}](${imageUrl})`;
                    newCursorPos = start + altText.length + 4;
                } else {
                    return;
                }
                break;
            case 'justifyLeft':
            case 'justifyCenter':
            case 'justifyRight':
                // Simple alignment with spaces
                const lines = selectedText.split('\n');
                replacement = lines.map(line => `  ${line}`).join('\n');
                newCursorPos = start + 2;
                break;
            case 'undo':
                // Simple undo - just focus the textarea
                textarea.focus();
                return;
            case 'redo':
                // Simple redo - just focus the textarea
                textarea.focus();
                return;
            default:
                replacement = selectedText;
                newCursorPos = start;
        }

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();

        if (selectedText) {
            // Nếu có text được chọn, đặt cursor ở cuối replacement
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
            // Nếu không có text được chọn, đặt cursor ở vị trí mới
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
    }

    handleInputChange(field: string, value: any) {
        this.formData = { ...this.formData, [field]: value };
        this.clearError(field);
        // Specific validation for dates
        if (field === 'startDate' || field === 'endDate') {
            this.validateDateRange();
        }
    }

    handleTitleChange(e: Event) {
        const title = (e.target as HTMLInputElement).value;
        this.handleInputChange("title", title);
        this.generateSlug(title);
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
            .replace(/-+/g, '-');
        this.handleInputChange("slug", slug);
    }

    clearError(field: string) {
        if (this.errors[field]) {
            // Cập nhật lỗi trong state
            const newErrors = { ...this.errors, [field]: "" };
            this.errors = newErrors;

            // Cập nhật error state cho editor wrapper
            if (field === 'content') {
                this.updateEditorErrorState();
            }
        }
    }

    validateDateRange(): boolean {
        let isValid = true;
        const errors = { ...this.errors };
        const startDate = this.formData.startDate ? new Date(this.formData.startDate) : null;
        const endDate = this.formData.endDate ? new Date(this.formData.endDate) : null;

        // Clear previous date errors
        delete errors.startDate;
        delete errors.endDate;

        if (startDate && !endDate) {
            errors.endDate = "Ngày kết thúc là bắt buộc nếu có ngày bắt đầu";
            isValid = false;
        } else if (!startDate && endDate) {
            errors.startDate = "Ngày bắt đầu là bắt buộc nếu có ngày kết thúc";
            isValid = false;
        } else if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
            errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            isValid = false;
        }

        // Update errors state only if there are changes
        if (JSON.stringify(this.errors) !== JSON.stringify(errors)) {
            this.errors = errors;
        }
        return isValid;
    }

    validateForm(): boolean {
        const errors: { [key: string]: string } = {};
        if (!this.formData.title.trim()) {
            errors.title = "Tiêu đề là bắt buộc";
        } else if (this.formData.title.length > 255) {
            errors.title = "Tiêu đề không được vượt quá 255 ký tự";
        }
        if (!this.formData.slug.trim()) errors.slug = "Slug là bắt buộc";
        if (!this.formData.categoryId) errors.categoryId = "Danh mục là bắt buộc";

        // Check editor content
        const editorContent = this.editor ? this.editor.getContent().trim() : '';
        if (editorContent === '<p><br></p>' || editorContent === '' || editorContent === '<p></p>') {
            errors.content = "Nội dung là bắt buộc";
        }

        // Run date validation and merge errors
        this.validateDateRange();
        Object.assign(errors, this.errors);

        this.errors = errors;

        // Cập nhật error state cho editor wrapper
        this.updateEditorErrorState();

        return Object.keys(errors).length === 0;
    }

    handleImageSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.selectedImage = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.imagePreview = ev.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.selectedImage = null;
        this.imagePreview = "";
        this.formData.thumbnailUrl = "";
    }

    async uploadImage(): Promise<string> {
        if (!this.selectedImage) return this.formData.thumbnailUrl || "";
        this.uploadProgress = 10;
        const base64 = await this.fileToBase64(this.selectedImage);
        const fileData = { name: this.selectedImage.name, contents: base64, binary: true };
        const uploadResult = await manager.rest.api.ConfigurationResource.fileUploadExtend(
            fileData,
            { path: `/${this.selectedImage.name}` },
        );
        this.uploadProgress = 100;
        return uploadResult.data?.filePath || uploadResult.data || uploadResult;
    }

    fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "");
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            // Scroll to the first error if validation fails
            const firstErrorField = Object.keys(this.errors).find(key => this.errors[key]);
            if (firstErrorField) {
                const element = this.renderRoot.querySelector(`#${firstErrorField}`);
                // For TinyMCE, scroll to the wrapper
                if (firstErrorField === 'content') {
                    this.renderRoot.querySelector('.editor-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (element instanceof HTMLElement) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return;
        }
        this.loading = true;
        try {
            // Ensure embedded data URL images are uploaded and converted to server URLs before saving
            await this.replaceEditorDataUrlsWithUploads();
            // refresh content in formData
            if (this.editor) {
                const editorDiv = this.renderRoot?.querySelector('.content-editable-editor') as HTMLElement | null;
                if (editorDiv) {
                    const newFormData = { ...this.formData };
                    newFormData.content = editorDiv.innerHTML;
                    this.formData = newFormData;
                }
            }
            if (this.selectedImage) {
                const filePath = await this.uploadImage();
                this.formData.thumbnailUrl = filePath;
            }
            const content = this.editor ? this.editor.getContent() : "";
            const blogData = {
                ...this.formData,
                content,
                startDate: this.formData.startDate ? new Date(this.formData.startDate).getTime() : undefined,
                endDate: this.formData.endDate ? new Date(this.formData.endDate).getTime() : undefined
            };
            const response = await manager.rest.api.BlogResource.createBlog(blogData);
            if (response && response.data) {
                router.navigate('/blog');
            } else {
                throw new Error("Failed to create blog");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            this.errors.general = "Lỗi khi tạo tin tức. Vui lòng thử lại.";
        } finally {
            this.loading = false;
            this.uploadProgress = 0;
        }
    }

    render() {
        console.log("render() called."); // Log để theo dõi khi render được gọi
        const categoryOptions = this.categories.map(cat => ({ value: cat.id.toString(), label: cat.name }));
        const priorityOptions = [
            { value: "1", label: "Thấp" },
            { value: "2", label: "Trung bình" },
            { value: "3", label: "Cao" },
            { value: "4", label: "Rất cao" },
            { value: "5", label: "Khẩn cấp" }
        ];
        return html`
            <div class="container ${this.loading ? 'loading' : ''}">
                <div class="title">
                    <span class="back-button" @click="${() => router.navigate('/blog')}">←</span>
                    Tạo tin tức mới
                </div>
                <div class="form-content">
                    <!-- Thông tin cơ bản -->
                    <div class="form-section">
                        <div class="section-title">
                            <or-icon icon="file-document-edit"></or-icon>
                            Thông tin cơ bản
                        </div>
                        <div class="form-grid-2">
                            <div class="form-field">
                                <label class="form-label" for="title">
                                    Tiêu đề <span class="required-asterisk">*</span>
                                </label>
                                <input
                                        id="title"
                                        class="form-input ${this.errors.title ? "error" : ""}"
                                        type="text"
                                        placeholder="Nhập tiêu đề tin tức..."
                                        .value="${this.formData.title}"
                                        @input="${this.handleTitleChange}"
                                        ?disabled="${this.loading}"
                                >
                                ${this.errors.title ? html`<div class="error-message">${this.errors.title}</div>` : ""}
                            </div>
                            <div class="form-field">
                                <label class="form-label" for="slug">
                                    Slug <span class="required-asterisk">*</span>
                                </label>
                                <input
                                        id="slug"
                                        class="form-input ${this.errors.slug ? "error" : ""}"
                                        type="text"
                                        placeholder="URL slug..."
                                        .value="${this.formData.slug}"
                                        @input="${(e: Event) => this.handleInputChange('slug', (e.target as HTMLInputElement).value)}"
                                        ?disabled="${this.loading}"
                                >
                                ${this.errors.slug ? html`<div class="error-message">${this.errors.slug}</div>` : ""}
                            </div>
                        </div>
                        <div class="form-field">
                            <label class="form-label" for="summary">Tóm tắt</label>
                            <textarea
                                    id="summary"
                                    class="form-textarea"
                                    placeholder="Nhập tóm tắt tin tức..."
                                    .value="${this.formData.summary}"
                                    @input="${(e: Event) => this.handleInputChange('summary', (e.target as HTMLTextAreaElement).value)}"
                                    ?disabled="${this.loading}"
                            ></textarea>
                        </div>
                    </div>
                    <!-- Ảnh đại diện -->
                    <div class="form-section">
                        <div class="section-title">
                            <or-icon icon="image"></or-icon>
                            Ảnh đại diện
                        </div>
                        <div class="image-upload-section">
                            ${this.imagePreview ? html`
                                <div class="image-preview-container">
                                    <img class="image-preview" src="${this.imagePreview}" alt="Preview">
                                    ${this.uploadProgress > 0 && this.uploadProgress < 100 ? html`
                                        <div class="upload-progress">
                                            <div class="upload-progress-bar" style="width: ${this.uploadProgress}%"></div>
                                        </div>
                                    ` : ""}
                                    <button class="remove-image-btn" @click="${this.removeImage}" ?disabled="${this.loading}">Xóa ảnh</button>
                                </div>
                            ` : html`
                                <div>
                                    <or-icon icon="cloud-upload" style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"></or-icon>
                                    <div style="margin-bottom: 16px;">
                                        <strong>Chọn ảnh để tải lên</strong>
                                    </div>
                                    <input type="file" accept="image/*" @change="${this.handleImageSelect}" ?disabled="${this.loading}">
                                    <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">PNG, JPG, GIF tối đa 10MB</div>
                                </div>
                            `}
                        </div>
                    </div>
                    <!-- Nội dung -->
                    <div class="form-section">
                        <div class="section-title">
                            <or-icon icon="text-box"></or-icon>
                            Nội dung <span class="required-asterisk">*</span>
                        </div>
                        <!-- TinyMCE Editor -->
                        <div id="editor-container" class="editor-wrapper">
                            <textarea id="editor"></textarea>
                        </div>
                        ${this.errors.content ? html`<div class="error-message">${this.errors.content}</div>` : ""}
                    </div>
                    <!-- Cài đặt khác -->
                    <div class="form-section">
                        <div class="section-title">
                            <or-icon icon="cog"></or-icon>
                            Cài đặt khác
                        </div>
                        <div class="form-grid-2">
                            <div class="form-field">
                                <label class="form-label" for="category">
                                    Danh mục <span class="required-asterisk">*</span>
                                </label>
                                <select
                                        id="category"
                                        class="form-select ${this.errors.categoryId ? "error" : ""}"
                                        .value="${String(this.formData.categoryId ?? '')}"
                                        @change="${(e: Event) => this.handleInputChange('categoryId', parseInt((e.target as HTMLSelectElement).value) || null)}"
                                        ?disabled="${this.loading}"
                                >
                                    <option value="">Chọn danh mục</option>
                                    ${categoryOptions.map(option => html`<option value="${option.value}">${option.label}</option>`)}
                                </select>
                                ${this.errors.categoryId ? html`<div class="error-message">${this.errors.categoryId}</div>` : ""}
                            </div>
                            <div class="form-field">
                                <label class="form-label" for="priority">Độ ưu tiên</label>
                                <select
                                        id="priority"
                                        class="form-select"
                                        .value="${this.formData.priorityLevel}"
                                        @change="${(e: Event) => this.handleInputChange('priorityLevel', parseInt((e.target as HTMLSelectElement).value))}"
                                        ?disabled="${this.loading}"
                                >
                                    ${priorityOptions.map(option => html`<option value="${option.value}">${option.label}</option>`)}
                                </select>
                            </div>
                        </div>
                        <div class="form-grid-2">
                            <div class="form-field">
                                <label class="form-label" for="startDate">Ngày bắt đầu</label>
                                <input
                                        id="startDate"
                                        class="form-input ${this.errors.startDate ? "error" : ""}"
                                        type="datetime-local"
                                        .value="${this.formData.startDate}"
                                        @input="${(e: Event) => this.handleInputChange('startDate', (e.target as HTMLInputElement).value)}"
                                        ?disabled="${this.loading}"
                                >
                                ${this.errors.startDate ? html`<div class="error-message">${this.errors.startDate}</div>` : ""}
                            </div>
                            <div class="form-field">
                                <label class="form-label" for="endDate">Ngày kết thúc</label>
                                <input
                                        id="endDate"
                                        class="form-input ${this.errors.endDate ? "error" : ""}"
                                        type="datetime-local"
                                        .value="${this.formData.endDate}"
                                        @input="${(e: Event) => this.handleInputChange('endDate', (e.target as HTMLInputElement).value)}"
                                        ?disabled="${this.loading}"
                                >
                                ${this.errors.endDate ? html`<div class="error-message">${this.errors.endDate}</div>` : ""}
                            </div>
                        </div>
                        <div class="checkbox-field">
                            <input type="checkbox" id="status" .checked="${this.formData.status}" @change="${(e: Event) => this.handleInputChange('status', (e.target as HTMLInputElement).checked)}" ?disabled="${this.loading}">
                            <label for="status" class="form-label">Đã xuất bản</label>
                        </div>
                    </div>
                    ${this.errors.general ? html`<div class="general-error">${this.errors.general}</div>` : ""}
                    <div class="footer">
                        <vaadin-button theme="secondary" @click="${() => router.navigate('/blog')}" ?disabled="${this.loading}">Hủy</vaadin-button>
                        <vaadin-button theme="primary" @click="${this.handleSubmit}" ?disabled="${this.loading}">${this.loading ? "Đang tạo..." : "Tạo tin tức"}</vaadin-button>
                    </div>
                </div>
            </div>
        `;
    }
}

export class BlogCreatePageWrapper extends Page<any> {
    @state() categories: BlogCategory[] = [];

    async firstUpdated() {
        try {
            const res = await manager.rest.api.BlogResource.getBlogCategory({});
            this.categories = res.data || [];
        } catch (e) {
            this.categories = [];
        }
    }

    get name() { return "blogCreatePage"; }
    stateChanged(state: any) {}

    render() {
        return html`<blog-create-page .categories=${this.categories}></blog-create-page>`;
    }
}

customElements.define("blog-create-page-wrapper", BlogCreatePageWrapper);

