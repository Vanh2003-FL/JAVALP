import {html, TemplateResult} from "lit";
import {customElement} from "lit/decorators.js";
import {Page, PageProvider} from "@openremote/or-app";
import {Store} from "@reduxjs/toolkit";
import {AppStateKeyed} from "@openremote/or-app";
import "./AdminShell";

/**
 * Simple wrapper Page to host the Administration shell.
 */
@customElement("page-administration")
export class PageAdministration extends Page<AppStateKeyed> {
    get name(): string {
        return "administration";
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
    }

    protected render(): TemplateResult {
        return html`<admin-shell></admin-shell>`;
    }

    // No-op state listener for now.
    public stateChanged(_state: AppStateKeyed): void {
    }
}

export function pageAdministrationProvider(store: Store<AppStateKeyed>): PageProvider<AppStateKeyed> {
    return {
        name: "administration",
        routes: ["administration"],
        pageCreator: () => new PageAdministration(store),
    };
}

