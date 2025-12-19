import {html, css} from "lit";
import {customElement, state} from "lit/decorators.js";
import {Page, type AppStateKeyed} from "@openremote/or-app";

@customElement("blog-public-detail")
export class BlogPublicDetail extends Page<AppStateKeyed> {
    @state() loading = false;

    get name() {
        return "blogPublicDetail";
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    stateChanged(state: AppStateKeyed): void {}

    render() {
        return html`
            <div class="container">
                <h2>Chi tiết tin tức</h2>
                <p>Trang công khai hiển thị chi tiết tin tức.</p>
            </div>
        `;
    }

    static styles = [
        css`
            :host { display: block; background: #f8fafc; min-height: 100vh; }
            .container { padding: 16px 20px; }
            h2 { margin: 12px 0; font-size: 20px; }
        `,
    ];
}

export default BlogPublicDetail;


