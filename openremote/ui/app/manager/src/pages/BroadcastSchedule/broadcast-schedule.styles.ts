import { css } from "lit";

export const broadcastScheduleStyles = css`
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

    /* Top row with sub-tabs - matches Administration style */
    .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 6px;
        padding: 0 16px;
    }

    .sub-tabs {
        display: flex;
        gap: 0;
    }

    .sub-tab {
        padding: 14px 24px;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
        position: relative;
    }

    .sub-tab:hover {
        color: #333;
        background: #f5f7fb;
    }

    .sub-tab.active {
        color: #1a73e8;
        border-bottom-color: #1a73e8;
        background: transparent;
    }

    .btn-create {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-create:hover {
        background: #1557b0;
    }

    /* Body layout - sidebar + content */
    .body-row {
        display: grid;
        grid-template-columns: 220px 1fr;
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
        display: flex;
        align-items: center;
        gap: 8px;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        padding: 0 10px;
    }

    .sidebar-search input {
        flex: 1;
        height: 34px;
        border: none;
        outline: none;
        font-size: 13px;
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
        transition: transform 0.2s;
    }

    .tree-toggle.expanded {
        transform: rotate(90deg);
    }

    .tree-icon {
        display: flex;
        color: #666;
    }

    .tree-icon.device {
        color: #1a73e8;
    }

    /* Main content panel */
    .main-panel {
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
        background: #fafbfc;
    }

    .panel-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }

    .panel-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .view-toggle {
        display: flex;
        gap: 4px;
    }

    .view-toggle-btn {
        padding: 6px 10px;
        border: 1px solid #dce4f0;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.2s;
    }

    .view-toggle-btn:first-child {
        border-radius: 4px 0 0 4px;
    }

    .view-toggle-btn:last-child {
        border-radius: 0 4px 4px 0;
    }

    .view-toggle-btn.active {
        background: #1a73e8;
        border-color: #1a73e8;
        color: white;
    }

    .calendar-tabs {
        display: flex;
        gap: 4px;
    }

    .calendar-tab {
        padding: 6px 14px;
        border: 1px solid #dce4f0;
        background: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .calendar-tab.active {
        background: #1a73e8;
        border-color: #1a73e8;
        color: white;
    }

    .panel-body {
        flex: 1;
        overflow: auto;
        padding: 0;
    }

    /* Filter row */
    .filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #dce4f0;
        flex-wrap: wrap;
    }

    .filter-input {
        height: 36px;
        padding: 0 10px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
        min-width: 120px;
    }

    .filter-input:focus {
        outline: none;
        border-color: #1a73e8;
    }

    .filter-select {
        height: 36px;
        padding: 0 10px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
        background: white;
        min-width: 120px;
    }

    .btn-search {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
    }

    .btn-search:hover {
        background: #1557b0;
    }

    /* Table styles */
    .table-wrapper {
        overflow: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid #f0f4fa;
    }

    th {
        background: #A8DCFD;
        font-weight: 600;
        color: #333;
        white-space: nowrap;
    }

    tr:hover {
        background: #f5f7fb;
    }

    /* Status badges */
    .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .status-pending {
        background: #fef3c7;
        color: #92400e;
    }

    .status-approved {
        background: #d1fae5;
        color: #065f46;
    }

    .status-rejected {
        background: #fee2e2;
        color: #991b1b;
    }

    /* Link styles */
    .link {
        color: #1a73e8;
        text-decoration: underline;
        cursor: pointer;
    }

    .link:hover {
        color: #1557b0;
    }

    /* Action buttons */
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        color: #666;
        transition: all 0.15s;
    }

    .btn-icon:hover {
        background: #f0f4fa;
        color: #333;
    }

    .action-menu {
        position: relative;
    }

    .action-menu-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 140px;
        z-index: 1000;
    }

    .action-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 14px;
        border: none;
        background: none;
        font-size: 13px;
        cursor: pointer;
        text-align: left;
        color: #333;
        transition: background 0.15s;
    }

    .action-menu-item:hover {
        background: #f5f7fb;
    }

    /* Pagination */
    .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

    .page-btn {
        min-width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #dce4f0;
        background: white;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s;
    }

    .page-btn:hover:not(:disabled) {
        background: #f5f7fb;
    }

    .page-btn.active {
        background: #1a73e8;
        border-color: #1a73e8;
        color: white;
    }

    .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Calendar view styles */
    .calendar-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 12px;
        font-size: 14px;
        font-weight: 500;
    }

    .calendar-nav {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: #666;
    }

    .calendar-grid {
        display: grid;
        border: 1px solid #dce4f0;
    }

    .calendar-day-header {
        padding: 10px;
        background: #A8DCFD;
        font-weight: 600;
        text-align: center;
        font-size: 13px;
    }

    .calendar-time-slot {
        display: flex;
        border-bottom: 1px solid #f0f4fa;
    }

    .time-label {
        width: 60px;
        padding: 8px;
        font-size: 12px;
        color: #666;
        border-right: 1px solid #f0f4fa;
        background: #fafbfc;
    }

    .time-label.highlight {
        background: #fff3cd;
        color: #856404;
    }

    .time-content {
        flex: 1;
        min-height: 32px;
        padding: 4px 8px;
        border-right: 1px solid #f0f4fa;
    }

    .calendar-event {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: #d1fae5;
        color: #065f46;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
    }

    .calendar-event.pending {
        background: #fef3c7;
        color: #92400e;
    }

    /* Month calendar */
    .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border: 1px solid #dce4f0;
    }

    .month-day {
        min-height: 100px;
        border-right: 1px solid #f0f4fa;
        border-bottom: 1px solid #f0f4fa;
        padding: 8px;
    }

    .month-day-number {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
    }

    .month-day-events {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .month-event {
        font-size: 11px;
        padding: 2px 6px;
        background: #d1fae5;
        color: #065f46;
        border-radius: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .month-event.pending {
        background: #fef3c7;
        color: #92400e;
    }

    /* Approval sub-tabs */
    .approval-tabs {
        display: flex;
        border-bottom: 1px solid #dce4f0;
    }

    .approval-tab {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: #666;
        transition: all 0.2s;
    }

    .approval-tab:hover {
        color: #333;
    }

    .approval-tab.active {
        color: #1a73e8;
        border-bottom-color: #1a73e8;
    }

    .approval-actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
        padding-right: 16px;
    }

    .btn-approve {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
    }

    .btn-approve:hover {
        background: #16a34a;
    }

    .btn-reject {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
    }

    .btn-reject:hover {
        background: #dc2626;
    }

    /* Checkbox */
    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    /* Modal styles */
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
        z-index: 10000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #dce4f0;
        background: #fafbfc;
    }

    .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .modal-body {
        flex: 1;
        overflow: auto;
        padding: 20px;
    }

    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid #dce4f0;
        background: #fafbfc;
    }

    /* Form styles */
    .form-section {
        margin-bottom: 24px;
    }

    .form-section-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
    }

    .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        flex: 1;
    }

    .form-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #333;
        margin-bottom: 6px;
    }

    .form-label .required {
        color: #ef4444;
    }

    .form-input {
        width: 100%;
        height: 38px;
        padding: 0 12px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        font-size: 13px;
    }

    .form-input:focus {
        outline: none;
        border-color: #1a73e8;
    }

    .form-radio-group {
        display: flex;
        gap: 20px;
    }

    .form-radio {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
    }

    .day-selector {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .day-btn {
        width: 40px;
        height: 40px;
        border: 1px solid #dce4f0;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s;
    }

    .day-btn.active {
        background: #1a73e8;
        border-color: #1a73e8;
        color: white;
    }

    /* Tabs in modal */
    .modal-tabs {
        display: flex;
        border-bottom: 1px solid #dce4f0;
        margin-bottom: 16px;
    }

    .modal-tab {
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: #666;
        transition: all 0.2s;
    }

    .modal-tab:hover {
        color: #333;
    }

    .modal-tab.active {
        color: #1a73e8;
        border-bottom-color: #1a73e8;
    }

    /* Button styles */
    .btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary {
        background: #1a73e8;
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background: #1557b0;
    }

    .btn-secondary {
        background: white;
        color: #333;
        border: 1px solid #dce4f0;
    }

    .btn-secondary:hover {
        background: #f5f7fb;
    }
`;
