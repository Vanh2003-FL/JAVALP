import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Page, PageProvider } from "@openremote/or-app";
import { Store } from "@reduxjs/toolkit";
import { AppStateKeyed } from "@openremote/or-app";
import "./BroadcastScheduleShell";

/**
 * Page wrapper for Broadcast Schedule management (Lịch phát).
 */
@customElement("page-broadcast-schedule")
export class PageBroadcastSchedule extends Page<AppStateKeyed> {
    get name(): string {
        return "broadcastSchedule";
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
    }

    protected render(): TemplateResult {
        return html`<broadcast-schedule-shell></broadcast-schedule-shell>`;
    }

    public stateChanged(_state: AppStateKeyed): void {
    }
}

export function pageBroadcastScheduleProvider(store: Store<AppStateKeyed>): PageProvider<AppStateKeyed> {
    return {
        name: "broadcastSchedule",
        routes: ["broadcast-schedule"],
        pageCreator: () => new PageBroadcastSchedule(store),
    };
}
