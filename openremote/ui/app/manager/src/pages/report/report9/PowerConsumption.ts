// Full refactored code without API calls and includes 3 tabs UI structure
import {LitElement, html, css} from "lit";
import {customElement, state} from "lit/decorators.js";
import "@vaadin/tabs";

@customElement("energy-performance-report")
export class EnergyPerformanceReport extends LitElement {

    @state() activeTab = 0;
    @state() tabs = ["Báo cáo theo ngày", "Báo cáo theo tháng", "Báo cáo theo tuỳ chỉnh"];

    static styles = css`
    :host {
      display: block;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    .tab-content {
      margin-top: 20px;
      padding: 20px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    h3 {
      margin: 0 0 10px 0;
    }
  `;

    renderTabs() {
        return html`
      <vaadin-tabs
        .selected="${this.activeTab}"
        @selected-changed="${(e) => this.activeTab = e.detail.value}"
      >
        ${this.tabs.map(label => html`<vaadin-tab>${label}</vaadin-tab>`)}
      </vaadin-tabs>
    `;
    }

    renderTabContent() {
        switch (this.activeTab) {
            case 0:
                return html`<report-tab-day></report-tab-day>`;
            case 1:
                return html`<report-tab-month></report-tab-month>`;
            case 2:
                return html`<report-tab-custom></report-tab-custom>`;
            default:
                return html``;
        }
    }

    render() {
        return html`
      <h2>Báo cáo hiệu suất chiếu sáng</h2>
      ${this.renderTabs()}
      ${this.renderTabContent()}
    `;
    }
}
