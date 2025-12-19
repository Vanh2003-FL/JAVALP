import {html, LitElement, TemplateResult} from "lit";
import {customElement} from "lit/decorators.js";
import {adminStyles} from "../admin.styles";

@customElement("admin-settings-tab")
export class AdminSettingsTab extends LitElement {
    static styles = [adminStyles];

    protected render(): TemplateResult {
        return html`
            <div class="card">
                <h3>Cấu hình</h3>
                <p class="muted">Placeholder: các thiết lập cấu hình chung.</p>
            </div>
        `;
    }
}

