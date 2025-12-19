import { css } from "lit";

export const categoryContentStyles = css`
    :host {
        display: block;
        height: 100%;
        width: 100%;
        background: #f0f4fa;
    }

    * {
        box-sizing: border-box;
    }

    .page {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 12px;
        gap: 12px;
    }

    /* Top row with sub-tabs and filters */
    .top-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .sub-tabs {
        display: flex;
        gap: 8px;
    }

    .sub-tab {
        padding: 10px 20px;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        color: #333;
        transition: all 0.2s;
    }

    .sub-tab:hover {
        background: #f5f7fb;
    }

    .sub-tab.active {
        background: #1a73e8;
        color: white;
        border-color: #1a73e8;
    }

    .shared-filter {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #333;
    }

    .shared-filter input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    /* Body layout - 3 columns */
    .body-row {
        display: grid;
        grid-template-columns: 220px 1fr 1fr;
        gap: 12px;
        flex: 1;
        min-height: 0;
    }

    /* Sidebar - Device tree */
    .sidebar {
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .sidebar-header {
        padding: 12px;
        border-bottom: 1px solid #dce4f0;
    }

    .sidebar-search {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
    }

    .sidebar-search:focus {
        outline: none;
        border-color: #1a73e8;
    }

    .sidebar-tree {
        flex: 1;
        overflow: auto;
        padding: 8px 0;
    }

    /* Tree nodes */
    .tree-node {
        display: flex;
        flex-direction: column;
    }

    .tree-node-row {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        cursor: pointer;
        gap: 6px;
        font-size: 13px;
        color: #333;
        transition: background 0.15s;
    }

    .tree-node-row:hover {
        background: #f5f7fb;
    }

    .tree-node-row.selected {
        background: #e8f0fe;
        color: #1a73e8;
    }

    .tree-toggle {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .tree-toggle or-icon {
        --or-icon-width: 14px;
        --or-icon-height: 14px;
        color: #666;
        transition: transform 0.2s;
    }

    .tree-toggle.expanded or-icon {
        transform: rotate(90deg);
    }

    .tree-icon or-icon {
        --or-icon-width: 16px;
        --or-icon-height: 16px;
        color: #f59e0b;
    }

    .tree-icon.device or-icon {
        color: #1a73e8;
    }

    .tree-children {
        padding-left: 20px;
    }

    /* Panels */
    .panel {
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #dce4f0;
        gap: 12px;
        flex-wrap: wrap;
    }

    .panel-title {
        font-size: 15px;
        font-weight: 600;
        color: #111827;
    }

    .panel-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .panel-search {
        height: 36px;
        padding: 0 12px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
        min-width: 200px;
    }

    .panel-search:focus {
        outline: none;
        border-color: #1a73e8;
    }

    .panel-body {
        flex: 1;
        overflow: auto;
    }

    /* Buttons */
    .btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s;
    }

    .btn or-icon {
        --or-icon-width: 16px;
        --or-icon-height: 16px;
    }

    .btn-primary {
        background: #1a73e8;
        color: white;
        border-color: #1a73e8;
    }

    .btn-primary:hover {
        background: #1557b0;
    }

    .btn-secondary {
        background: white;
        color: #333;
        border-color: #dce4f0;
    }

    .btn-secondary:hover {
        background: #f5f7fb;
    }

    .btn-icon {
        padding: 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }

    .btn-icon:hover {
        background: #f0f4fa;
    }

    .btn-icon or-icon {
        --or-icon-width: 18px;
        --or-icon-height: 18px;
        color: #1a73e8;
    }

    /* Table */
    .table-wrapper {
        flex: 1;
        overflow-x: auto;
        overflow-y: visible;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    thead {
        background: #A8DCFD;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    th {
        padding: 10px 12px;
        text-align: left;
        font-weight: 600;
        color: #111827;
        border-right: 1px solid #dce4f0;
        white-space: nowrap;
    }

    th:last-child {
        border-right: none;
    }

    tbody tr {
        border-bottom: 1px solid #f0f0f0;
    }

    tbody tr:hover {
        background: #f8fafc;
    }

    td {
        padding: 10px 12px;
        color: #333;
        border-right: 1px solid #f0f0f0;
    }

    td:last-child {
        border-right: none;
    }

    /* Pagination */
    .pagination-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-top: 1px solid #dce4f0;
    }

    .pagination-info {
        font-size: 13px;
        color: #666;
    }

    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .pagination-controls a {
        min-width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
        color: #333;
        text-decoration: none;
        background: white;
    }

    .pagination-controls a:hover {
        background: #f5f7fb;
    }

    .pagination-controls a.active {
        background: #1a73e8;
        color: white;
        border-color: #1a73e8;
    }

    .pagination-controls select {
        height: 28px;
        padding: 0 8px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
        margin-left: 8px;
    }

    /* Category tree in panel - Updated to match design */
    .category-tree {
        width: 100%;
    }

    .category-table-header {
        display: grid;
        grid-template-columns: 100px 1fr;
        background: #A8DCFD;
        font-weight: 600;
        font-size: 13px;
        color: #111827;
    }

    .category-table-header > div {
        padding: 10px 12px;
        border-right: 1px solid rgba(0,0,0,0.1);
    }

    .category-table-header > div:last-child {
        border-right: none;
    }

    .category-node {
        display: flex;
        flex-direction: column;
    }

    .category-row {
        display: grid;
        grid-template-columns: 100px 1fr;
        align-items: center;
        border-bottom: 1px solid #f0f0f0;
        min-height: 44px;
    }

    .category-row:hover {
        background: #f8fafc;
    }

    .category-actions-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        position: relative;
    }

    .category-name-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: 13px;
        color: #333;
    }

    .category-name-cell input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        flex-shrink: 0;
    }

    .category-name-cell .folder-icon {
        --or-icon-width: 18px;
        --or-icon-height: 18px;
        color: #f59e0b;
        flex-shrink: 0;
    }

    .category-name-cell .content-icon {
        --or-icon-width: 18px;
        --or-icon-height: 18px;
        color: #1a73e8;
        flex-shrink: 0;
    }

    .category-name-cell .item-name {
        flex: 1;
    }

    .category-children {
        padding-left: 0;
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #dce4f0;
    }

    .modal-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
    }

    .modal-location {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
    }

    .modal-body {
        padding: 20px;
        flex: 1;
        overflow: auto;
    }

    .modal-footer {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid #dce4f0;
    }

    /* Form */
    .form-group {
        margin-bottom: 16px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 6px;
    }

    .form-label .required {
        color: #ef4444;
    }

    .form-input {
        width: 100%;
        height: 40px;
        padding: 0 12px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 14px;
    }

    .form-input:focus {
        outline: none;
        border-color: #1a73e8;
    }

    .form-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }

    .form-checkbox input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    /* File upload */
    .file-upload {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .file-upload-input {
        flex: 1;
    }

    .file-upload-btn {
        padding: 8px 12px;
        background: #f0f4fa;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        cursor: pointer;
    }

    .file-upload-btn:hover {
        background: #e5e9f0;
    }

    .file-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 16px;
    }

    .file-info-item {
        background: #f5f7fb;
        padding: 12px;
        border-radius: 4px;
    }

    .file-info-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
    }

    .file-info-value {
        font-size: 14px;
        font-weight: 500;
        color: #333;
    }

    .audio-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .audio-preview or-icon {
        --or-icon-width: 32px;
        --or-icon-height: 32px;
        color: #1a73e8;
        cursor: pointer;
    }

    .audio-preview span {
        font-size: 12px;
        color: #666;
    }

    /* Action menu */
    .action-menu {
        position: relative;
    }

    .action-menu-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
    }

    .action-menu-btn:hover {
        background: #f0f4fa;
    }

    .action-menu-btn or-icon {
        --or-icon-width: 18px;
        --or-icon-height: 18px;
        color: #666;
    }

    .action-menu-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 180px;
        z-index: 1000;
    }

    .action-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #333;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
    }

    .action-menu-item:hover {
        background: #f5f7fb;
    }

    .action-menu-item or-icon {
        --or-icon-width: 16px;
        --or-icon-height: 16px;
        color: #666;
    }

    /* Footer info */
    .panel-footer {
        padding: 10px 16px;
        border-top: 1px solid #dce4f0;
        font-size: 13px;
        color: #666;
    }
`;
