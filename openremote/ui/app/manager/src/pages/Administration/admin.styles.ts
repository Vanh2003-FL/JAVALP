import { css } from "lit";

// Shared styles for the Administration shell and tabs.
export const adminStyles = css`
    :host {
        display: block;
        height: 100%;
        width: 100%;
        color: var(--or-app-color3, #1f3a52);
        font-family: var(--or-app-font-family, "Roboto", "Helvetica", "Arial", sans-serif);
        box-sizing: border-box;
    }

    .page {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: #f5f7fb;
        box-sizing: border-box;
        padding: 12px 16px;
        gap: 12px;
    }

    .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 16px;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 8px;
        box-sizing: border-box;
    }

    .body-row {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 12px;
        flex: 1 1 auto;
        min-height: 0;
        align-items: stretch;
        width: 100%;
        box-sizing: border-box;
    }

    .sidepanel {
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        min-height: 0;
        overflow: auto;
    }

    .sidepanel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .sidepanel-title {
        font-weight: 700;
        color: #111827;
        font-size: 14px;
    }

    .sidepanel-search {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 0 8px;
        border: 1px solid #cfd6e3;
        border-radius: 6px;
        background: #fff;
        box-sizing: border-box;
    }

    .sidepanel-search input {
        flex: 1 1 auto;
        padding: 8px 6px;
        border: none;
        font-size: 13px;
        outline: none;
        background: transparent;
    }

    .sidepanel-search input::placeholder {
        color: #9ca3af;
    }

    .sidepanel-search:focus-within {
        border-color: #0a73db;
        box-shadow: 0 0 0 2px rgba(10,115,219,0.1);
    }

    .sidepanel-search .icon-search {
        font-size: 14px;
        color: #6b7280;
        cursor: pointer;
        line-height: 1;
        --or-icon-width: 16px;
        --or-icon-height: 16px;
    }

    /* Tree styles */
    .tree-root,
    .tree-children {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .tree-root {
        padding-right: 4px;
    }

    .tree-item {
        margin: 2px 0;
    }

    .tree-row {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        color: #374151;
        font-size: 13px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: calc(100% - 2px);
        min-height: 32px;
    }

    .tree-row:hover {
        background: #e9f3ff;
    }

    .tree-item.open > .tree-row {
        background: #e0e7ff;
        color: #0a73db;
        font-weight: 600;
    }

    .caret {
        width: 14px;
        height: 14px;
        color: #6b7280;
        --or-icon-width: 14px;
        --or-icon-height: 14px;
    }

    .caret.spacer {
        display: inline-block;
        width: 14px;
        height: 14px;
    }

    .tree-icon {
        --or-icon-width: 14px;
        --or-icon-height: 14px;
        color: #0a73db;
    }

    .tree-children {
        margin-left: 14px;
    }

    .tree-label {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* remove duplicate styles that caused overlay */

    .tabs {
        display: flex;
        gap: 12px;
    }

    .tab {
        position: relative;
        cursor: pointer;
        padding: 10px 16px;
        border-radius: 6px 6px 0 0;
        background: transparent;
        color: #4b5563;
        border: none;
        font-weight: 600;
        transition: color 0.15s ease-in-out;
        user-select: none;
    }

    .tab:hover {
        color: #2f7f3b;
    }

    .tab.active {
        color: #2f7f3b;
    }

    .tab.active::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -12px;
        width: 100%;
        height: 3px;
        background-color: #2f7f3b;
        border-radius: 2px;
    }

    .tabs-right {
        display: flex;
        align-items: center;
        position: relative;
    }

    .category-dropdown {
        min-width: 210px;
        height: 40px;
        border: 1px solid #cfd6e3;
        border-radius: 8px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: pointer;
        box-sizing: border-box;
        font-weight: 600;
        color: #1f2937;
        gap: 8px;
    }

    .category-dropdown:hover {
        border-color: #0084D1;
    }

    .category-selected {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .category-menu {
        position: absolute;
        top: 46px;
        right: 0;
        width: 260px;
        background: white;
        border: 1px solid #dfe6f2;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        padding: 12px 14px;
        box-sizing: border-box;
        z-index: 9999;
    }

    .category-placeholder {
        font-style: italic;
        color: #6b7280;
        margin-bottom: 8px;
    }

    .category-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        color: #374151;
        z-index: 20;
    }

    .category-item input {
        width: 16px;
        height: 16px;
        cursor: pointer;
        z-index: 20;
    }

    .content {
        flex: 1 1 auto;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 8px;
        padding: 12px 16px 16px 16px;
        width: 100%;
        box-sizing: border-box;
        min-height: 0;
        overflow: auto;
    }

    .card {
        background: white;
        border: 1px solid #e1e5ed;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        height: 100%;
        box-sizing: border-box;
    }

    .card h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--or-app-color3, #1f3a52);
    }

    .muted {
        color: #6b7280;
        margin: 0;
        font-size: 14px;
    }

    @media screen and (max-width: 768px) {
        .header,
        .tabs,
        .content {
            width: 100%;
            padding-left: 12px;
            padding-right: 12px;
        }

        .tabs {
            flex-wrap: wrap;
        }
    }
`;

