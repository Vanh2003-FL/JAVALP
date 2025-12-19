import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Page, PageProvider } from "@openremote/or-app";
import { Store } from "@reduxjs/toolkit";
import { AppStateKeyed } from "@openremote/or-app";
import "./CategoryContentShell";

/**
 * Page wrapper for Categories and Content management.
 */
@customElement("page-category-content")
export class PageCategoryContent extends Page<AppStateKeyed> {
    get name(): string {
        return "categoryContent";
    }

    constructor(store: Store<AppStateKeyed>) {
        super(store);
    }

    protected render(): TemplateResult {
        return html`<category-content-shell></category-content-shell>`;
    }

    public stateChanged(_state: AppStateKeyed): void {
    }
}

export function pageCategoryContentProvider(store: Store<AppStateKeyed>): PageProvider<AppStateKeyed> {
    return {
        name: "categoryContent",
        routes: ["category-content"],
        pageCreator: () => new PageCategoryContent(store),
    };
}
