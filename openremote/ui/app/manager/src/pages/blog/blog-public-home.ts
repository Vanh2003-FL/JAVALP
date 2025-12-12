import {html, css} from "lit";
import {customElement, state} from "lit/decorators.js";
import {Page, type AppStateKeyed} from "@openremote/or-app";

@customElement("blog-public-home")
export class BlogPublicHome extends Page<AppStateKeyed> {
    @state() loading = false;

    get name() {
        return "blogPublicHome";
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
                <h2>Danh sách tin tức</h2>
                <p>Trang công khai hiển thị danh sách tin tức.</p>
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

export default BlogPublicHome;


