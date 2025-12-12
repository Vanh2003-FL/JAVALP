import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/tabs';
import './report-tab-power';
import './report-tab-voltage';
import './report-tab-amperage';
import { i18next } from "@openremote/or-translate";
import "@openremote/or-translate"; // Đảm bảo đã import thẻ or-translate

@customElement('energy-performance-report')
export class EnergyPerformanceReport extends LitElement {
    @state() activeTab = 0;

    static styles = css`
      :host {
        display: block;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .tab-content {
        margin-top: 20px;
        border-radius: 8px;
        padding: 16px;
        width: 100%;
        max-width: 1295px;
        overflow: auto;
        box-sizing: border-box;
      }
      
    `;


    renderTabs() {
        return html`
            <div style="text-align: center; margin-top: 16px;">
                <vaadin-tabs
                        .selected=${this.activeTab}
                        @selected-changed=${(e) => this.activeTab = e.detail.value}
                        style="display: inline-block;"
                >
                    <vaadin-tab><or-translate value="power_consumption"></or-translate></vaadin-tab>
                    <vaadin-tab><or-translate value="voltage_consumption"></or-translate></vaadin-tab>
                    <vaadin-tab><or-translate value="amperage_consumption"></or-translate></vaadin-tab>
                </vaadin-tabs>
            </div>
        `;
    }

    renderTabContent() {
        return html`
            <div class="tab-content">
                ${this.activeTab === 0 ? html`<report-tab-power></report-tab-power>` : ''}
                ${this.activeTab === 1 ? html`<report-tab-voltage></report-tab-voltage>` : ''}
                ${this.activeTab === 2 ? html`<report-tab-amperage></report-tab-amperage>` : ''}
            </div>
        `;
    }

    render() {
        return html`
            <div style="display: flex;align-items: center;border-bottom: 1px solid #e3e6ea;padding-bottom: 1px;">
                <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                <div style="font-weight: 500;font-size: 16px">
                    <or-translate value="energy_report"></or-translate>
                </div>
            </div>
            ${this.renderTabs()}
            ${this.renderTabContent()}
        `;
    }
}
