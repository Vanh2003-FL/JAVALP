import { html, LitElement, type TemplateResult, css } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import "@openremote/or-icon"
import "@vaadin/dialog"
import "@openremote/or-map"
import manager from "@openremote/core"

type ActivityStatus = "playing" | "stopped" | "error" | "paused" | "locked" | "connected"

interface ImportResult {
  success: boolean
  totalRecords: number
  successCount: number
  failedCount: number
  errors: ImportError[]
}

interface ImportError {
  row: number
  field: string
  message: string
  value: string
}

interface Equipment {
  id: string
  code: string
  name: string
  category: string
  status: "active" | "inactive" | "warning"
  activityStatus: ActivityStatus
  location: string
  phoneNumber: string
  group: string
  creator: string
  createdDate: string
  statusText: string
  activityText: string
}

// NewsCategoryData interface for API (local definition)
interface NewsCategoryData {
  id?: string
  title?: string
  description?: string
  createdBy?: string
  createdAt?: number
  updatedBy?: string
  updatedAt?: number
  realmName?: string | null
  isDeleted?: boolean
}

// Source (Nguồn tiếp sóng) interface
interface SourceData {
  id?: string
  name?: string
  description?: string
  createdBy?: string
  createdAt?: number
  realmName?: string | null
}

// Channel (Kênh) interface
interface ChannelData {
  id?: string
  name?: string
  sourceId?: string
  sourceName?: string
  description?: string
  createdBy?: string
  createdAt?: number
  realmName?: string | null
}

// LiveStream (Tiếp sóng) interface
interface LiveStreamData {
  id?: string
  title?: string
  url?: string
  isShare?: boolean
  areaId?: string
  description?: string
  sourceId?: string
  channelId?: string
  status?: number
  createdBy?: string
  createdAt?: string
  realmName?: string | null
}

type CategoryKey = "audio" | "warning" | "micro" | "relay" | "news" | "admin" | "vendor" | "maker" | "adminUnit" | "source" | "channel";

@customElement("admin-catalog-tab")
export class AdminCatalogTab extends LitElement {
  @property({ type: String }) selectedCategory: CategoryKey = "audio"
  static styles = css`
    :host {
      --primary-color: #0a73db;
      --success-color: #1aaa55;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --border-color: #dfe6f2;
      --bg-light: #f5f7fb;
      --text-primary: #111827;
      --text-secondary: #6b7280;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background-color: white;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #eef0f3;
      padding: 10px 12px;
      border-radius: 6px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .filters-section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      box-sizing: border-box;
      position: relative;
      z-index: 50;
    }

    .filter-group {
      display: flex;
      gap: 6px;
      align-items: center;
      min-width: 180px;
      flex: 0 0 auto;
      position: relative;
    }

    .filter-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }

    .filter-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #cfd6e3;
      border-radius: 6px;
      font-size: 14px;
      background-color: white;
      color: var(--text-primary);
      box-sizing: border-box;
      height: 38px;
    }

    .filter-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .search-box {
      flex: 0 0 320px;
      position: relative;
    }

    .filters-section .filter-group:not(.search-box) {
      width: 200px;
      flex: 0 0 200px;
    }

    .search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      --or-icon-width: 16px;
      --or-icon-height: 16px;
      pointer-events: none;
    }

    .btn.btn-primary.primary-color {
      background-color: #0a73db;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 20px;
      color: #fff;
      font-weight: 500;
      font-size: 14px;
      border-radius: 6px;
      cursor: pointer;
      height: 38px;
      justify-content: center;
      white-space: nowrap;
      flex: 0 0 auto;
      transition: all 0.2s;
    }

    .btn.btn-primary.primary-color:hover {
      background-color: #0962c0;
      transform: translateY(-1px);
    }

    .btn.btn-primary.primary-color or-icon {
      --or-icon-width: 18px;
      --or-icon-height: 18px;
      --or-icon-fill: white;
    }

    .dropdown {
      position: relative;
    }

    .dropdown-trigger {
      width: 100%;
      height: 38px;
      border: 1px solid #cfd6e3;
      border-radius: 6px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
      box-sizing: border-box;
    }

    .dropdown-trigger:hover {
      border-color: #0084D1;
    }

    .dropdown-menu {
      position: absolute;
      top: 42px;
      left: 0;
      width: 240px;
      background: white;
      border: 1px solid #dfe6f2;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      padding: 10px 12px;
      box-sizing: border-box;
      z-index: 1000;
    }

    .dropdown-placeholder {
      font-style: italic;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
      color: #374151;
    }

    .dropdown-item input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .btn.btn-primary.primary-color:hover {
      background-color: #0076bc;
      border-color: #0076bc;
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    table {
      width: 100%;
      min-width: 1200px;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background-color: #A8DCFD;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 700;
      color: #1f2937;
      white-space: nowrap;
      height: 44px;
      box-sizing: border-box;
      border-right: 1px solid #dfe6f2;
    }

    th:last-child {
      border-right: none;
    }

    tbody tr {
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.15s;
    }

    tbody tr:nth-child(even) {
      background-color: #f9fbff;
    }

    tbody tr:hover {
      background-color: #eef5ff;
    }

    td {
      padding: 10px 12px;
      color: var(--text-primary);
      border-right: 1px solid #dfe6f2;
      box-sizing: border-box;
    }

    td:last-child {
      border-right: none;
    }

    .status-text {
      font-weight: 600;
    }

    .status-active {
      color: #1aaa55;
    }

    .status-warning {
      color: #f59e0b;
    }

    .status-inactive {
      color: #6b7280;
    }

    .code-link {
      color: #0a73db;
      text-decoration: none;
      cursor: pointer;
      font-weight: 600;
    }

    .code-link:hover {
      text-decoration: underline;
    }

    .action-icons {
      display: flex;
      gap: 6px;
      justify-content: center;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      --or-icon-width: 16px;
      --or-icon-height: 16px;
      --or-icon-fill: white;
    }

    .action-btn:hover {
      opacity: 0.85;
    }

    .action-btn.download {
      background-color: #0a73db;
      color: white;
    }

    .action-btn.edit {
      background-color: #1aaa55;
      color: white;
    }

    .action-btn.delete {
      background-color: #ef4444;
      color: white;
    }

    /* Activity status styles */
    .activity-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
    }

    .activity-status or-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
    }

    .activity-playing {
      color: #1aaa55;
    }

    .activity-stopped {
      color: #6b7280;
    }

    .activity-error {
      color: #f59e0b;
    }

    .activity-paused {
      color: #3b82f6;
    }

    .activity-locked {
      color: #eab308;
    }

    .activity-connected {
      color: #10b981;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .pagination-info {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .pagination-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 2px;
    }

    .pagination-list li a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid var(--border-color);
      background-color: white;
      color: var(--text-primary);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .pagination-list li a:hover:not(.disabled):not(.active) {
      border-color: var(--primary-color);
      background-color: #eef5ff;
    }

    .pagination-list li a.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .pagination-list li a.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .pagination-list li a.page-nav {
      font-weight: bold;
    }

    .ellipsis {
      padding: 0 8px;
      color: var(--text-secondary);
    }

    .select {
      padding: 6px 8px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: white;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.875rem;
    }

    .page-size-select {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: white;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 14px;
      min-width: 70px;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px;
    }

    .page-size-select:hover {
      border-color: var(--primary-color);
    }

    .page-size-select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(10, 115, 219, 0.1);
    }

    .pagination-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
    }

    .icon-square {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: white;
      cursor: pointer;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      color: #0a73db;
    }

    .icon-square:hover {
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .icon-square.teal {
      color: #0bb9c5;
      border-color: #0bb9c5;
    }

    .icon-square.green {
      color: #1aaa55;
      border-color: #1aaa55;
    }

    .icon-square.blue {
      color: #0a73db;
      border-color: #0a73db;
    }

    /* Toolbar buttons */
    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
      position: relative;
      z-index: 1;
    }

    .toolbar-btn {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      --or-icon-width: 20px;
      --or-icon-height: 20px;
      --or-icon-fill: white;
    }

    .toolbar-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .toolbar-btn.import {
      background: #22c55e;
      color: white;
    }

    .toolbar-btn.import or-icon {
      --or-icon-fill: white;
    }

    .toolbar-btn.export {
      background: #dbeafe;
      color: #2563eb;
    }

    .toolbar-btn.export or-icon {
      --or-icon-fill: #2563eb;
    }

    .toolbar-btn.create {
      background-color: #22c55e;
      color: white;
    }

    .toolbar-btn.create or-icon {
      --or-icon-fill: white;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .modal-body {
      padding: 24px 20px;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .file-upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .file-upload-area:hover {
      border-color: #0a73db;
      background-color: #f0f7ff;
    }

    .file-upload-area or-icon {
      --or-icon-width: 24px;
      --or-icon-height: 24px;
      color: #6b7280;
    }

    .file-upload-area .file-text {
      color: #6b7280;
      font-size: 14px;
    }

    .file-upload-area .file-name {
      color: #1f2937;
      font-weight: 500;
    }

    .file-upload-area input[type="file"] {
      display: none;
    }

    .modal-btn {
      padding: 10px 24px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .modal-btn:hover {
      background-color: #f9fafb;
    }

    .modal-btn.primary {
      background-color: #0a73db;
      color: white;
      border-color: #0a73db;
    }

    .modal-btn.primary:hover {
      background-color: #0966c3;
    }

    .modal-btn.danger {
      color: #ef4444;
      border-color: #ef4444;
    }

    .modal-btn or-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
    }

    /* Result modal */
    .result-message {
      text-align: center;
      padding: 16px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
    }

    /* Equipment Detail Modal */
    .detail-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .detail-modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .detail-modal-body {
      display: flex;
      flex: 1;
      min-height: 500px;
    }

    .detail-form-section {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      border-right: 1px solid #e5e7eb;
    }

    .detail-map-section {
      flex: 1;
      position: relative;
      min-height: 400px;
    }

    .detail-map-section or-map {
      width: 100%;
      height: 100%;
    }

    .detail-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .detail-title h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .refresh-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-btn:hover {
      background-color: #f3f4f6;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group.full-width {
      flex: none;
      width: 100%;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .form-group label .required {
      color: #ef4444;
    }

    .form-input {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: white;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #0a73db;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .form-select {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: white;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .form-textarea {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: white;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #0a73db;
    }

    .detail-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #f9fafb;
    }

    .map-search-box {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      display: flex;
      align-items: center;
      background: white;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 8px 12px;
      gap: 8px;
    }

    .map-search-box input {
      border: none;
      outline: none;
      font-size: 14px;
      width: 200px;
    }

    .map-search-box input::placeholder {
      color: #9ca3af;
    }

    /* Micro IP Modal Styles */
    .micro-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .micro-modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .micro-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .micro-tabs {
      display: flex;
      gap: 24px;
    }

    .micro-tab {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      padding: 8px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .micro-tab:hover {
      color: #0a73db;
    }

    .micro-tab.active {
      color: #0a73db;
      border-bottom-color: #0a73db;
    }

    .micro-refresh-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .micro-modal-body {
      display: flex;
      flex: 1;
      min-height: 450px;
      overflow: hidden;
    }

    .micro-form-section {
      flex: 1;
      padding: 24px;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;
    }

    .micro-tree-section {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .micro-section-title {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      text-transform: uppercase;
    }

    .micro-tree-search {
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 16px;
    }

    .micro-tree-search input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
    }

    .micro-tree-container {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }

    /* Tree with checkboxes */
    .device-tree {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .device-tree-item {
      margin: 2px 0;
    }

    .device-tree-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .device-tree-row:hover {
      background: #f3f4f6;
    }

    .device-tree-caret {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      --or-icon-width: 14px;
      --or-icon-height: 14px;
      color: #6b7280;
    }

    .device-tree-caret.spacer {
      visibility: hidden;
    }

    .device-tree-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .device-tree-checkbox.checked {
      background: #0a73db;
      border-color: #0a73db;
    }

    .device-tree-checkbox.partial {
      background: #0a73db;
      border-color: #0a73db;
    }

    .device-tree-checkbox or-icon {
      --or-icon-width: 12px;
      --or-icon-height: 12px;
      color: white;
    }

    .device-tree-icon {
      --or-icon-width: 16px;
      --or-icon-height: 16px;
      color: #6b7280;
    }

    .device-tree-icon.city {
      color: #0a73db;
    }

    .device-tree-icon.ward {
      color: #0a73db;
    }

    .device-tree-icon.speaker {
      color: #ef4444;
    }

    .device-tree-label {
      font-size: 13px;
      color: #374151;
    }

    .device-tree-children {
      list-style: none;
      padding: 0;
      margin: 0;
      margin-left: 24px;
    }

    /* History Table */
    .history-table-container {
      flex: 1;
      padding: 24px;
      overflow: auto;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
    }

    .history-table th {
      background: #d4e8f8;
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .history-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      color: #4b5563;
    }

    .history-table tr:nth-child(even) td {
      background: #f9fafb;
    }

    .micro-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: center;
      gap: 12px;
      background: #f9fafb;
    }
  `

  private currentPage = 1
  private itemsPerPage = 10

  @state() private isImportModalOpen = false
  @state() private isResultModalOpen = false
  @state() private selectedFile: File | null = null
  @state() private importResult: ImportResult | null = null
  @state() private isDetailModalOpen = false
  @state() private selectedEquipment: Equipment | null = null
  @state() private statusOpen = false

  // Micro IP Modal states
  @state() private isMicroModalOpen = false
  @state() private isMicroCreateModalOpen = false
  @state() private activeMicroTab: "info" | "history" = "info"
  @state() private microExpandedNodes = new Set<string>(["hanoi", "bd"])
  @state() private selectedDevices = new Set<string>(["c1", "c3"])

  // Micro IP API data
  @state() private microItems: any[] = []
  @state() private microTotal: number = 0
  @state() private microCurrentPage: number = 1
  @state() private microPageSize: number = 15
  @state() private microSearchQuery: string = ""
  @state() private isMicroLoading: boolean = false
  @state() private selectedMicroItem: any = null
  @state() private microFormData: any = { device_code: "", device_name: "", is_locked: false }
  @state() private microAreaItems: any[] = [] // Area items for Micro dropdown
  @state() private microDeviceTree: any[] = [] // Device tree: Province → Ward → Area
  @state() private microSelectedAreaId: string = "" // Selected Area ID from tree
  @state() private microTreeExpanded: Set<string> = new Set() // Expanded node IDs
  @state() private microTreeSearch: string = "" // Search filter for tree

  // Relay (Tiếp sóng) Modal states
  @state() private isRelayModalOpen = false

  // News (Lĩnh vực bản tin) Modal states
  @state() private isNewsModalOpen = false
  @state() private isNewsCreateModalOpen = false
  @state() private isNewsDeleteModalOpen = false
  @state() private newsItemToDelete: NewsCategoryData | null = null
  @state() private newsCategories: NewsCategoryData[] = []
  @state() private newsCategoryTotal: number = 0
  @state() private newsCurrentPage: number = 1
  @state() private newsPageSize: number = 15
  @state() private newsSearchQuery: string = ""
  @state() private isNewsLoading: boolean = false
  @state() private selectedNewsCategory: NewsCategoryData | null = null
  @state() private newsCategoryFormData: NewsCategoryData = { title: "", description: "" }

  // Admin Unit (Đơn vị hành chính) Modal states
  @state() private isAdminUnitModalOpen = false
  @state() private isAdminUnitCreateModalOpen = false
  @state() private isDeleteConfirmModalOpen = false
  @state() private itemToDelete: any = null

  // Admin Unit (Area) API data
  @state() private areaItems: any[] = []
  @state() private areaTotal: number = 0
  @state() private areaCurrentPage: number = 1
  @state() private areaPageSize: number = 15
  @state() private areaSearchQuery: string = ""
  @state() private areaCodeFilter: string = ""
  @state() private areaShortNameFilter: string = ""
  @state() private isAreaLoading: boolean = false
  @state() private selectedAreaItem: any = null
  @state() private areaFormData: any = { name: "", wardId: null }

  // Province and Ward dropdowns for Area modal
  @state() private areaProvinces: any[] = []
  @state() private areaWards: any[] = []
  @state() private selectedAreaProvinceId: string = ""
  @state() private selectedAreaWardId: string = ""

  // Source (Nguồn tiếp sóng) states
  @state() private isSourceModalOpen = false
  @state() private isSourceCreateModalOpen = false
  @state() private isSourceDeleteModalOpen = false
  @state() private sourceItems: SourceData[] = []
  @state() private sourceTotal: number = 0
  @state() private sourceCurrentPage: number = 1
  @state() private sourcePageSize: number = 15
  @state() private sourceSearchQuery: string = ""
  @state() private isSourceLoading: boolean = false
  @state() private selectedSource: SourceData | null = null
  @state() private sourceFormData: SourceData = { name: "", description: "" }
  @state() private sourceItemToDelete: SourceData | null = null

  // Channel (Kênh) states  
  @state() private isChannelModalOpen = false
  @state() private isChannelCreateModalOpen = false
  @state() private isChannelDeleteModalOpen = false
  @state() private channelItems: ChannelData[] = []
  @state() private channelTotal: number = 0
  @state() private channelCurrentPage: number = 1
  @state() private channelPageSize: number = 15
  @state() private channelSearchQuery: string = ""
  @state() private isChannelLoading: boolean = false
  @state() private selectedChannel: ChannelData | null = null
  @state() private channelFormData: ChannelData = { name: "", sourceId: "", description: "" }

  // Relay (Tiếp sóng - LiveStream) states
  @state() private isRelayDetailModalOpen = false
  @state() private isRelayCreateModalOpen = false
  @state() private isRelayDeleteModalOpen = false
  @state() private relayItems: LiveStreamData[] = []
  @state() private relayTotal: number = 0
  @state() private relayCurrentPage: number = 1
  @state() private relayPageSize: number = 15
  @state() private relaySearchQuery: string = ""
  @state() private isRelayLoading: boolean = false
  @state() private selectedRelay: LiveStreamData | null = null
  @state() private relayFormData: LiveStreamData = { title: "", url: "", isShare: false, description: "" }
  @state() private relayItemToDelete: LiveStreamData | null = null

  // Device tree data for Micro IP modals
  private deviceTreeData = [
    {
      id: "hanoi",
      label: "Thành phố Hà Nội",
      icon: "office-building",
      type: "city",
      children: [
        { id: "hk", label: "Phường Hoàn Kiếm", icon: "office-building", type: "ward", children: [] },
        {
          id: "bd",
          label: "Phường Ba Đình",
          icon: "office-building",
          type: "ward",
          children: [
            { id: "c1", label: "Cụm loa 01", icon: "speaker", type: "speaker" },
            { id: "c2", label: "Cụm loa 02", icon: "speaker", type: "speaker" },
            { id: "c3", label: "Cụm loa 03", icon: "speaker", type: "speaker" },
          ]
        },
      ]
    }
  ]

  // Track previous category for auto-loading
  private previousCategory: CategoryKey = "audio"

  // Lifecycle: auto-load data when switching categories
  protected updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties)
    if (changedProperties.has('selectedCategory')) {
      // Auto-load when switching to news category
      if (this.selectedCategory === 'news' && this.previousCategory !== 'news') {
        this.loadNewsCategories()
      }
      // Auto-load when switching to micro category
      if (this.selectedCategory === 'micro' && this.previousCategory !== 'micro') {
        this.loadMicroItems()
      }
      // Auto-load when switching to admin (Đơn vị hành chính) category
      if (this.selectedCategory === 'admin' && this.previousCategory !== 'admin') {
        this.loadAreaItems()
        this.loadAreaProvinces() // Load provinces cho filter
      }
      // Auto-load when switching to source (Nguồn tiếp sóng) category
      if (this.selectedCategory === 'source' && this.previousCategory !== 'source') {
        this.loadSources()
      }
      // Auto-load when switching to channel (Kênh) category
      if (this.selectedCategory === 'channel' && this.previousCategory !== 'channel') {
        this.loadChannels()
      }
      // Auto-load when switching to relay (Tiếp sóng) category
      if (this.selectedCategory === 'relay' && this.previousCategory !== 'relay') {
        this.loadRelays()
      }
      this.previousCategory = this.selectedCategory
    }
  }

  private toggleStatus(): void {
    this.statusOpen = !this.statusOpen
  }

  private openMicroModal(): void {
    this.isMicroModalOpen = true
    this.activeMicroTab = "info"
  }

  private closeMicroModal(): void {
    this.isMicroModalOpen = false
  }

  // Relay Modal methods
  private openRelayModal(): void {
    this.isRelayModalOpen = true
  }

  private closeRelayModal(): void {
    this.isRelayModalOpen = false
  }

  // News Modal methods
  private openNewsModal(): void {
    this.isNewsModalOpen = true
  }

  private closeNewsModal(): void {
    this.isNewsModalOpen = false
  }

  // News Create Modal methods
  private openNewsCreateModal(): void {
    this.newsCategoryFormData = { title: "", description: "" }
    this.isNewsCreateModalOpen = true
  }

  private closeNewsCreateModal(): void {
    this.isNewsCreateModalOpen = false
  }

  // News Category API methods
  private async loadNewsCategories(): Promise<void> {
    this.isNewsLoading = true
    try {
      const filterDTO = {
        page: this.newsCurrentPage,
        size: this.newsPageSize,
        keyWord: this.newsSearchQuery?.trim() || undefined, // Backend uses keyWord for search
        data: {
          realmName: window.sessionStorage.getItem('realm')
        }
      }
      console.log('[NewsCategory] Searching with filterDTO:', filterDTO)
      const response = await manager.rest.api.NewsCategoryResource.getNewsCategory(filterDTO as any)
      this.newsCategories = (response.data || []) as NewsCategoryData[]

      const countResponse = await manager.rest.api.NewsCategoryResource.countNewsCategory(filterDTO as any)
      this.newsCategoryTotal = countResponse.data || 0
    } catch (error) {
      console.error('Error loading news categories:', error)
    } finally {
      this.isNewsLoading = false
    }
  }

  // Handle search button click for News Categories
  private async handleNewsSearch(): Promise<void> {
    this.newsCurrentPage = 1 // Reset to first page
    await this.loadNewsCategories()
  }

  private async createNewsCategory(): Promise<void> {
    if (!this.newsCategoryFormData.title) {
      alert('Vui lòng nhập tên lĩnh vực!')
      return
    }
    try {
      await manager.rest.api.NewsCategoryResource.createNewsCategory({
        ...this.newsCategoryFormData,
        realmName: window.sessionStorage.getItem('realm')
      } as any)
      this.closeNewsCreateModal()
      await this.loadNewsCategories()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('Error creating news category:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async deleteNewsCategory(category: NewsCategoryData): Promise<void> {
    this.newsItemToDelete = category
    this.isNewsDeleteModalOpen = true
  }

  private closeNewsDeleteModal(): void {
    this.isNewsDeleteModalOpen = false
    this.newsItemToDelete = null
  }

  private async confirmDeleteNewsCategory(): Promise<void> {
    if (!this.newsItemToDelete) return
    try {
      await manager.rest.api.NewsCategoryResource.removeNewsCategory(this.newsItemToDelete as any)
      this.closeNewsDeleteModal()
      await this.loadNewsCategories()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('Error deleting news category:', error)
      this.showNotification('Có lỗi xảy ra!')
      this.closeNewsDeleteModal()
    }
  }

  private async updateNewsCategory(): Promise<void> {
    if (!this.selectedNewsCategory || !this.selectedNewsCategory.title) {
      alert('Vui lòng nhập tên lĩnh vực!')
      return
    }
    try {
      await manager.rest.api.NewsCategoryResource.updateNewsCategory(this.selectedNewsCategory as any)
      this.closeNewsModal()
      await this.loadNewsCategories()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('Error updating news category:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private showNotification(message: string): void {
    const existing = document.getElementById('custom-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.id = 'custom-toast'
    toast.textContent = message
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      background: #1aaa55; color: white;
      padding: 12px 20px; border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 9999; transform: translateX(100%);
      opacity: 0; transition: transform 0.4s ease-out, opacity 0.4s;
    `
    document.body.appendChild(toast)
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)'
      toast.style.opacity = '1'
    })
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      toast.style.opacity = '0'
      toast.addEventListener('transitionend', () => toast.remove())
    }, 3000)
  }

  // Render pagination pages for News tab (similar to Audio tab)
  private renderNewsPaginationPages(totalPages: number): TemplateResult[] {
    const pages: TemplateResult[] = []
    const maxVisiblePages = 5
    const current = this.newsCurrentPage

    if (totalPages <= 0) return pages

    let startPage: number, endPage: number

    if (totalPages <= maxVisiblePages) {
      startPage = 1
      endPage = totalPages
    } else {
      const middlePage = Math.floor(maxVisiblePages / 2)
      if (current <= middlePage + 1) {
        startPage = 1
        endPage = maxVisiblePages
      } else if (current >= totalPages - middlePage) {
        startPage = totalPages - maxVisiblePages + 1
        endPage = totalPages
      } else {
        startPage = current - middlePage
        endPage = current + middlePage
      }
    }

    // First page
    if (startPage > 1) {
      pages.push(html`
        <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.newsCurrentPage = 1; this.loadNewsCategories(); }}>1</a></li>
      `)
      if (startPage > 2) {
        pages.push(html`<li><span class="ellipsis">...</span></li>`)
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(html`
        <li>
          <a href="#" 
             class="${i === current ? 'active' : ''}"
             @click=${(e: Event) => { e.preventDefault(); this.newsCurrentPage = i; this.loadNewsCategories(); }}
          >${i}</a>
        </li>
      `)
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(html`<li><span class="ellipsis">...</span></li>`)
      }
      pages.push(html`
        <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.newsCurrentPage = totalPages; this.loadNewsCategories(); }}>${totalPages}</a></li>
      `)
    }

    return pages
  }

  // ============ MICRO IP API METHODS ============
  private async openMicroCreateModal(): Promise<void> {
    this.microFormData = { device_code: "", device_name: "", is_locked: false }
    this.microSelectedAreaId = ""
    this.microTreeExpanded = new Set()
    this.microTreeSearch = ""
    await this.buildMicroDeviceTree()
    this.isMicroCreateModalOpen = true
  }

  // Build device tree: Province → Ward → Area
  private async buildMicroDeviceTree(): Promise<void> {
    try {
      console.log('[MicroIP] Building device tree...')

      // 1. Load all provinces
      const provinceResponse = await manager.rest.api.ProvinceResource.getAll({
        page: 1,
        size: 100,
        data: { deleted: 0 }
      } as any)
      const provinces = (provinceResponse?.data || []).filter((p: any) => p.deleted === 0)
      console.log('[MicroIP] Provinces:', provinces.length)

      // 2. Build tree structure
      const tree: any[] = []

      for (const province of provinces) {
        // Load wards for this province
        const wardResponse = await manager.rest.api.WardResource.getAll({
          page: 1,
          size: 200,
          data: { provinceId: province.id, deleted: 0 }
        } as any)
        const wards = (wardResponse?.data || []).filter((w: any) => w.deleted === 0)

        const wardNodes: any[] = []
        for (const ward of wards) {
          // Load areas for this ward
          console.log('[MicroIP] Loading areas for ward:', ward.id, ward.name)
          const areaResponse = await manager.rest.api.AreaResource.getArea({
            page: 1,
            size: 200,
            data: { wardId: ward.id } // Backend expects wardId in data object
          } as any)
          const areas = areaResponse?.data || []
          console.log('[MicroIP] Areas for ward', ward.name, ':', areas.length, areas)

          const areaNodes = areas.map((area: any) => ({
            id: `area_${area.id}`,
            areaId: area.id,
            label: area.name || area.code,
            type: 'area',
            icon: 'map-marker' // Icon định vị cho Khu vực
          }))

          if (areaNodes.length > 0 || true) { // Include wards even without areas
            wardNodes.push({
              id: `ward_${ward.id}`,
              wardId: ward.id,
              label: ward.name,
              type: 'ward',
              icon: 'office-building', // Icon tòa nhà cho Phường
              children: areaNodes
            })
          }
        }

        if (wardNodes.length > 0) {
          tree.push({
            id: `province_${province.id}`,
            provinceId: province.id,
            label: province.name,
            type: 'province',
            icon: 'domain', // Icon tòa nhà cao tầng cho Thành phố
            children: wardNodes
          })
        }
      }

      this.microDeviceTree = tree
      console.log('[MicroIP] Device tree built:', tree)
    } catch (error) {
      console.error('[MicroIP] Error building device tree:', error)
      this.microDeviceTree = []
    }
  }

  private closeMicroCreateModal(): void {
    this.isMicroCreateModalOpen = false
  }

  // Load Area items for Micro dropdown
  private async loadMicroAreaItems(): Promise<void> {
    try {
      const filterDTO = { limit: 200, offset: 0, entity: {} }
      const response = await manager.rest.api.AreaResource.getArea(filterDTO as any)
      if (response?.data) {
        this.microAreaItems = response.data
      }
    } catch (error) {
      console.error('[Micro] Error loading area items:', error)
      this.microAreaItems = []
    }
  }

  private async openMicroDetailModal(item: any): Promise<void> {
    this.selectedMicroItem = { ...item }
    this.isMicroModalOpen = true
    this.activeMicroTab = 'info'

    // Load device tree first
    await this.buildMicroDeviceTree()

    // Get area_id (from BE or fallback to finding by area_name for backward compatibility)
    let foundAreaId = item.area_id || ''

    // Fallback: If no area_id, try to find it from area_name
    if (!foundAreaId && item.area_name) {
      for (const province of this.microDeviceTree) {
        for (const ward of province.children || []) {
          for (const area of ward.children || []) {
            if (area.label === item.area_name) {
              foundAreaId = area.areaId
              break
            }
          }
          if (foundAreaId) break
        }
        if (foundAreaId) break
      }
    }

    // Set current area_id as selected
    this.microSelectedAreaId = foundAreaId

    // Auto-expand tree to show selected area
    if (this.microSelectedAreaId) {
      // Find and expand parent nodes
      for (const province of this.microDeviceTree) {
        for (const ward of province.children || []) {
          for (const area of ward.children || []) {
            if (area.areaId === this.microSelectedAreaId) {
              // Expand province and ward
              this.microTreeExpanded.add(province.id)
              this.microTreeExpanded.add(ward.id)
              this.microTreeExpanded = new Set(this.microTreeExpanded)
              // Save area_id to selectedMicroItem for update
              this.selectedMicroItem.area_id = area.areaId
              return
            }
          }
        }
      }
    }
  }

  private closeMicroDetailModal(): void {
    this.isMicroModalOpen = false
    this.selectedMicroItem = null
  }

  private async loadMicroItems(): Promise<void> {
    this.isMicroLoading = true
    try {
      const filterDTO = {
        limit: this.microPageSize,
        offset: (this.microCurrentPage - 1) * this.microPageSize,
        filter: {
          name: this.microSearchQuery || undefined,
          realmName: window.sessionStorage.getItem('realm')
        }
      }

      const response = await manager.rest.api.WarningMicroIPResource.getAllWarningMicroIP(filterDTO as any)
      // Map response to ensure area_id is included (BE now returns it)
      this.microItems = (response.data || []).map((item: any) => ({
        ...item,
        area_id: item.area_id || item.areaId // Support both formats for backward compatibility
      }))
      this.microTotal = this.microItems.length
    } catch (error) {
      console.error('[MicroIP] Error loading items:', error)
    } finally {
      this.isMicroLoading = false
    }
  }

  private async createMicroItem(): Promise<void> {
    if (!this.microFormData.device_code || !this.microFormData.device_name || !this.microSelectedAreaId) {
      this.showNotification('Vui lòng nhập mã thiết bị, tên thiết bị và chọn khu vực!')
      return
    }

    try {
      const payload = {
        device_code: this.microFormData.device_code,
        device_name: this.microFormData.device_name,
        is_locked: this.microFormData.is_locked || false,
        area_id: this.microSelectedAreaId, // Backend expects area_id (not area_name)
        realm_name: window.sessionStorage.getItem('realm') || 'master'
      }

      console.log('[MicroIP] Creating with payload:', payload)
      await manager.rest.api.WarningMicroIPResource.createWarningMicroIP(payload as any)

      this.closeMicroCreateModal()
      await this.loadMicroItems()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('[MicroIP] Error creating item:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async updateMicroItem(): Promise<void> {
    if (!this.selectedMicroItem || !this.selectedMicroItem.device_name) {
      this.showNotification('Vui lòng nhập tên thiết bị!')
      return
    }

    try {
      const payload = {
        id: this.selectedMicroItem.id,
        device_name: this.selectedMicroItem.device_name,
        is_locked: this.selectedMicroItem.is_locked || false,
        area_id: this.selectedMicroItem.area_id || this.microSelectedAreaId,
        update_by: window.sessionStorage.getItem('userId') || ''
      }

      console.log('[MicroIP] Updating with payload:', payload)
      await manager.rest.api.WarningMicroIPResource.updateWarningMicroIP(payload as any)

      this.closeMicroDetailModal()
      await this.loadMicroItems()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('[MicroIP] Error updating item:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async deleteMicroItem(item: any): Promise<void> {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${item.name}"?`)) return

    try {
      await manager.rest.api.WarningMicroIPResource.removeWarningMicroIP(item as any)

      await this.loadMicroItems()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('[MicroIP] Error deleting item:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  // Admin Unit Modal methods
  private openAdminUnitModal(): void {
    this.isAdminUnitModalOpen = true
  }

  private closeAdminUnitModal(): void {
    this.isAdminUnitModalOpen = false
    this.selectedAreaItem = null
  }

  private openAdminUnitCreateModal(): void {
    this.areaFormData = { name: "", wardId: null }
    this.selectedAreaProvinceId = ""
    this.selectedAreaWardId = ""
    this.areaWards = []
    this.loadAreaProvinces()
    this.isAdminUnitCreateModalOpen = true
  }

  private closeAdminUnitCreateModal(): void {
    this.isAdminUnitCreateModalOpen = false
  }

  private openAdminUnitDetailModal(item: any): void {
    this.selectedAreaItem = { ...item }
    this.isAdminUnitModalOpen = true
  }

  // ============ AREA API METHODS ============
  private async loadAreaItems(): Promise<void> {
    this.isAreaLoading = true
    console.log('[Area] Loading items...')

    try {
      // Build filter object based on current filter values
      const entity: any = {}

      if (this.areaSearchQuery?.trim()) {
        entity.name = this.areaSearchQuery.trim()
      }
      if (this.selectedAreaWardId) {
        entity.wardId = parseInt(this.selectedAreaWardId)
      }

      const filterDTO = {
        limit: this.areaPageSize,
        offset: (this.areaCurrentPage - 1) * this.areaPageSize,
        entity: entity
      }

      console.log('[Area] Filter DTO:', filterDTO)
      const response = await manager.rest.api.AreaResource.getArea(filterDTO as any)
      console.log('[Area] API response:', response)

      if (response && response.data) {
        // Client-side filter for code and shortName if needed
        let items = response.data

        if (this.areaCodeFilter?.trim()) {
          items = items.filter((item: any) =>
            item.code?.toLowerCase().includes(this.areaCodeFilter.toLowerCase())
          )
        }

        if (this.areaShortNameFilter?.trim()) {
          items = items.filter((item: any) =>
            item.shortName?.toLowerCase().includes(this.areaShortNameFilter.toLowerCase())
          )
        }

        this.areaItems = items
      } else {
        this.areaItems = []
      }

      // Get total count
      const countResponse = await manager.rest.api.AreaResource.countArea(filterDTO as any)
      if (countResponse && countResponse.data) {
        this.areaTotal = countResponse.data
      }

      console.log('[Area] Loaded items:', this.areaItems.length, 'Total:', this.areaTotal)
    } catch (error) {
      console.error('[Area] Error loading items:', error)
      this.areaItems = []
      this.areaTotal = 0
    } finally {
      this.isAreaLoading = false
    }
  }

  // Handle search button click
  private async handleAreaSearch(): Promise<void> {
    this.areaCurrentPage = 1 // Reset to first page
    await this.loadAreaItems()
  }

  private async createAreaItem(): Promise<void> {
    console.log('[Area] createAreaItem called, formData:', this.areaFormData)

    if (!this.areaFormData.name || !this.areaFormData.code || !this.selectedAreaWardId) {
      console.log('[Area] Validation failed - missing required fields')
      this.showNotification('Vui lòng nhập mã đơn vị, tên đơn vị và chọn xã/phường!')
      return
    }

    try {
      const payload = {
        code: this.areaFormData.code.trim(),
        name: this.areaFormData.name.trim(),
        shortName: this.areaFormData.shortName?.trim() || null,
        wardId: parseInt(this.selectedAreaWardId),
        realmName: window.sessionStorage.getItem('realm') || 'master'
      }

      console.log('[Area] Creating with payload:', payload)
      await manager.rest.api.AreaResource.createArea(payload as any)

      this.closeAdminUnitCreateModal()
      await this.loadAreaItems()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('[Area] Error creating item:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async updateAreaItem(): Promise<void> {
    if (!this.selectedAreaItem) return

    try {
      await manager.rest.api.AreaResource.updateArea(this.selectedAreaItem as any)

      this.closeAdminUnitModal()
      await this.loadAreaItems()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('[Area] Error updating item:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  // Delete confirmation modal methods
  private openDeleteConfirmModal(item: any): void {
    this.itemToDelete = item
    this.isDeleteConfirmModalOpen = true
  }

  private closeDeleteConfirmModal(): void {
    this.isDeleteConfirmModalOpen = false
    this.itemToDelete = null
  }

  private async confirmDeleteAreaItem(): Promise<void> {
    if (!this.itemToDelete) return

    try {
      await manager.rest.api.AreaResource.deleteArea(this.itemToDelete as any)

      this.closeDeleteConfirmModal()
      await this.loadAreaItems()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('[Area] Error deleting item:', error)
      this.showNotification('Có lỗi xảy ra!')
      this.closeDeleteConfirmModal()
    }
  }

  // Fetch provinces for Area modal dropdown
  private async loadAreaProvinces(): Promise<void> {
    try {
      const filterDTO = {
        page: 1,
        size: 100,
        data: { deleted: 0 }
      }
      const response = await manager.rest.api.ProvinceResource.getAll(filterDTO as any)
      if (response?.data) {
        this.areaProvinces = response.data.filter((p: any) => p.deleted === 0)
      }
    } catch (error) {
      console.error('[Area] Error loading provinces:', error)
    }
  }

  // Fetch wards by province for Area modal dropdown  
  private async loadAreaWardsByProvince(provinceId: string): Promise<void> {
    if (!provinceId) {
      this.areaWards = []
      return
    }

    try {
      const filterDTO = {
        page: 1,
        size: 200,
        data: { provinceId: parseInt(provinceId), deleted: 0 }
      }
      const response = await manager.rest.api.WardResource.getAll(filterDTO as any)
      if (response?.data) {
        this.areaWards = response.data.filter((w: any) => w.deleted === 0)
      }
    } catch (error) {
      console.error('[Area] Error loading wards:', error)
      this.areaWards = []
    }
  }
  private toggleMicroNode(id: string): void {
    const next = new Set(this.microExpandedNodes)
    next.has(id) ? next.delete(id) : next.add(id)
    this.microExpandedNodes = next
  }

  private toggleDeviceSelection(id: string): void {
    const next = new Set(this.selectedDevices)

    // Find the node in tree
    const node = this.findNodeById(id, this.deviceTreeData)
    if (!node) return

    // Get all child leaf node ids
    const allIds = this.getAllLeafIds(node)

    // Check if all are currently selected
    const allSelected = allIds.every(nodeId => next.has(nodeId))

    if (allSelected) {
      // Deselect all
      allIds.forEach(nodeId => next.delete(nodeId))
    } else {
      // Select all
      allIds.forEach(nodeId => next.add(nodeId))
    }

    this.selectedDevices = next
  }

  private findNodeById(id: string, nodes: any[]): any | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = this.findNodeById(id, node.children)
        if (found) return found
      }
    }
    return null
  }

  private getAllLeafIds(node: any): string[] {
    if (!node.children || node.children.length === 0) {
      return [node.id]
    }
    return node.children.flatMap((child: any) => this.getAllLeafIds(child))
  }

  private mockData: Equipment[] = [
    {
      id: "94E685AEDE04",
      code: "94E685AEDE04",
      name: "Cụm 01",
      category: "Cụm",
      status: "active",
      activityStatus: "playing",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Nguyễn Văn A",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang phát",
    },
    {
      id: "94E685AEDE05",
      code: "94E685AEDE05",
      name: "Bộ lọc chỉ dùng T1 tương",
      category: "Bộ lọc",
      status: "active",
      activityStatus: "stopped",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang tắt",
    },
    {
      id: "94E685AEDE06",
      code: "94E685AEDE06",
      name: "Cụm 02 TT A",
      category: "Cụm",
      status: "active",
      activityStatus: "stopped",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang tắt",
    },
    {
      id: "94E685AEDE07",
      code: "94E685AEDE07",
      name: "Cụm 03 TT C",
      category: "Cụm",
      status: "active",
      activityStatus: "stopped",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang tắt",
    },
    {
      id: "94E685AEDE08",
      code: "94E685AEDE08",
      name: "Cụm 04 TT D",
      category: "Cụm",
      status: "active",
      activityStatus: "stopped",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang tắt",
    },
    {
      id: "94E685AEDE09",
      code: "94E685AEDE09",
      name: "Cụm 05 TT D",
      category: "Cụm",
      status: "warning",
      activityStatus: "error",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang lỗi",
    },
    {
      id: "94E685AEDE10",
      code: "94E685AEDE10",
      name: "Cụm 06 TT D",
      category: "Cụm",
      status: "active",
      activityStatus: "paused",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Dừng phát",
    },
    {
      id: "94E685AEDE11",
      code: "94E685AEDE11",
      name: "Cụm 07 TT D",
      category: "Cụm",
      status: "warning",
      activityStatus: "locked",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Tạm khóa",
    },
    {
      id: "94E685AEDE12",
      code: "94E685AEDE12",
      name: "Cụm 08 TT D",
      category: "Cụm",
      status: "active",
      activityStatus: "playing",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang phát",
    },
    {
      id: "94E685AEDE13",
      code: "94E685AEDE13",
      name: "Cụm 09 TT D",
      category: "Cụm",
      status: "active",
      activityStatus: "connected",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang kết nối",
    },
    {
      id: "94E685AEDE14",
      code: "94E685AEDE14",
      name: "Cụm 10 TT D",
      category: "Cụm",
      status: "active",
      activityStatus: "playing",
      location: "Phương Văn Quân, Thạnh p...",
      phoneNumber: "0123456789",
      group: "Thiết bị truyền thành",
      creator: "Admin",
      createdDate: "15/10/2025 00:00",
      statusText: "Đang sử dụng",
      activityText: "Đang phát",
    },
  ]

  private usageOptions = [
    { id: "using", label: "Đang sử dụng" },
    { id: "stop", label: "Ngưng sử dụng" },
  ];

  private activeOptions = [
    { id: "play", label: "Đang phát" },
    { id: "pause", label: "Dừng phát" },
    { id: "connect", label: "Đang kết nối" },
    { id: "error", label: "Đang lỗi" },
    { id: "off", label: "Đang tắt" },
    { id: "lock", label: "Tạm khóa" },
  ];

  @state() private usageOpen = false;
  @state() private activeOpen = false;
  @state() private selectedUsage = new Set<string>(["using", "stop"]);
  @state() private selectedActive = new Set<string>(["play", "pause"]);

  private toggleUsage(): void {
    this.usageOpen = !this.usageOpen;
    this.activeOpen = false;
  }

  private toggleActive(): void {
    this.activeOpen = !this.activeOpen;
    this.usageOpen = false;
  }

  private toggleUsageItem(id: string): void {
    const next = new Set(this.selectedUsage);
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedUsage = next;
  }

  private toggleActiveItem(id: string): void {
    const next = new Set(this.selectedActive);
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedActive = next;
  }

  private getStatusClass(status: string): string {
    switch (status) {
      case "active":
        return "status-active"
      case "warning":
        return "status-warning"
      case "inactive":
        return "status-inactive"
      default:
        return "status-active"
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "active":
        return "active"
      case "warning":
        return "warning"
      case "inactive":
        return "inactive"
      default:
        return "active"
    }
  }

  private getActivityStatusClass(status: ActivityStatus): string {
    switch (status) {
      case "playing":
        return "activity-playing"
      case "stopped":
        return "activity-stopped"
      case "error":
        return "activity-error"
      case "paused":
        return "activity-paused"
      case "locked":
        return "activity-locked"
      case "connected":
        return "activity-connected"
      default:
        return "activity-stopped"
    }
  }

  private getActivityIcon(status: ActivityStatus): string {
    switch (status) {
      case "playing":
        return "volume-high"
      case "stopped":
        return "volume-off"
      case "error":
        return "alert-circle"
      case "paused":
        return "pause-circle"
      case "locked":
        return "lock"
      case "connected":
        return "lan-connect"
      default:
        return "volume-off"
    }
  }

  private getPaginatedData(): Equipment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    return this.mockData.slice(startIndex, endIndex)
  }

  private getTotalPages(): number {
    return Math.ceil(this.mockData.length / this.itemsPerPage)
  }

  private handlePageChange(page: number): void {
    const totalPages = this.getTotalPages()
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page
      this.requestUpdate()
    }
  }

  // Import Excel methods
  private openImportModal(): void {
    this.isImportModalOpen = true
    this.selectedFile = null
  }

  private closeImportModal(): void {
    this.isImportModalOpen = false
    this.selectedFile = null
  }

  private handleFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]
    }
  }

  private async handleUpload(): Promise<void> {
    if (!this.selectedFile) return

    // Simulate file processing and validation
    // In real implementation, this would call an API
    const mockErrors: ImportError[] = [
      { row: 5, field: "code", message: "Mã thiết bị đã tồn tại", value: "ABC123" },
      { row: 12, field: "phoneNumber", message: "Số điện thoại không hợp lệ", value: "123" },
      { row: 18, field: "name", message: "Tên thiết bị không được để trống", value: "" },
    ]

    // Mock result - in real implementation, this would come from API response
    this.importResult = {
      success: false,
      totalRecords: 35,
      successCount: 32,
      failedCount: 3,
      errors: mockErrors
    }

    this.closeImportModal()

    if (this.importResult.failedCount > 0) {
      this.isResultModalOpen = true
    }
  }

  private downloadErrorFile(): void {
    if (!this.importResult) return

    // Create CSV content with error details
    const headers = ["Dòng", "Trường", "Giá trị", "Lỗi"]
    const rows = this.importResult.errors.map(err =>
      [err.row.toString(), err.field, err.value, err.message]
    )

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "import_errors.csv"
    link.click()
    URL.revokeObjectURL(url)

    this.closeResultModal()
  }

  private closeResultModal(): void {
    this.isResultModalOpen = false
    this.importResult = null
  }

  private handleExport(): void {
    // TODO: Implement export functionality
    console.log("Export clicked")
  }

  private handleCreate(): void {
    // TODO: Implement create functionality
    console.log("Create clicked")
  }

  private renderImportModal(): TemplateResult | null {
    if (!this.isImportModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeImportModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">Nhập dữ liệu thiết bị từ excel</div>
          <div class="modal-body">
            <label class="file-upload-area">
              <or-icon icon="paperclip"></or-icon>
              <span class="${this.selectedFile ? 'file-name' : 'file-text'}">
                ${this.selectedFile ? this.selectedFile.name : 'Chọn file tải lên'}
              </span>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv"
                @change=${this.handleFileSelect}
              />
            </label>
          </div>
          <div class="modal-footer">
            <button class="modal-btn primary" @click=${this.handleUpload} ?disabled=${!this.selectedFile}>
              <or-icon icon="cloud-upload"></or-icon>
              Tải lên
            </button>
            <button class="modal-btn danger" @click=${this.closeImportModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderResultModal(): TemplateResult | null {
    if (!this.isResultModalOpen || !this.importResult) return null

    return html`
      <div class="modal-overlay" @click=${this.closeResultModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-body">
            <div class="result-message">
              Import dữ liệu không thành công, có ${this.importResult.failedCount} bản ghi không hợp lệ.<br/>
              Vui lòng tải file để xem chi tiết.
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn primary" @click=${this.downloadErrorFile}>
              <or-icon icon="download"></or-icon>
              Tải file
            </button>
            <button class="modal-btn danger" @click=${this.closeResultModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // Equipment Detail Modal methods
  private openEquipmentDetail(item: Equipment): void {
    this.selectedEquipment = item
    this.isDetailModalOpen = true
  }

  private closeDetailModal(): void {
    this.isDetailModalOpen = false
    this.selectedEquipment = null
  }

  private renderDetailModal(): TemplateResult | null {
    if (!this.isDetailModalOpen) return null

    return html`
      <div class="detail-modal-overlay" @click=${this.closeDetailModal}>
        <div class="detail-modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="detail-modal-body">
            <!-- Left: Form Section -->
            <div class="detail-form-section">
              <div class="detail-title">
                <button class="refresh-btn" title="Làm mới">
                  <or-icon icon="refresh"></or-icon>
                </button>
                <h2>THÔNG TIN THIẾT BỊ</h2>
              </div>

              <!-- Khu vực -->
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Khu vực <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="Phường Tây Hồ, Thành phố Hà Nội" 
                         value="${this.selectedEquipment?.location || ''}" />
                </div>
              </div>

              <!-- Mã thiết bị + Tên thiết bị -->
              <div class="form-row">
                <div class="form-group">
                  <label>Mã thiết bị <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="Nhập mã thiết bị"
                         value="${this.selectedEquipment?.code || ''}" />
                </div>
                <div class="form-group">
                  <label>Tên thiết bị <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="Nhập tên thiết bị"
                         value="${this.selectedEquipment?.name || ''}" />
                </div>
              </div>

              <!-- Số điện thoại -->
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Số điện thoại</label>
                  <input type="text" class="form-input" placeholder="Nhập số điện thoại"
                         value="${this.selectedEquipment?.phoneNumber || ''}" />
                </div>
              </div>

              <!-- Địa chỉ lắp đặt row 1 -->
              <div class="form-row">
                <div class="form-group">
                  <label>Địa chỉ lắp đặt</label>
                  <select class="form-select">
                    <option value="">Tỉnh/Thành</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>&nbsp;</label>
                  <select class="form-select">
                    <option value="">Xã/ Phường</option>
                  </select>
                </div>
              </div>

              <!-- Địa chỉ lắp đặt row 2 -->
              <div class="form-row">
                <div class="form-group">
                  <select class="form-select">
                    <option value="">Thôn xóm/Khu phố</option>
                  </select>
                </div>
                <div class="form-group">
                  <input type="text" class="form-input" placeholder="Địa chỉ cụ thể" />
                </div>
              </div>

              <!-- Nhà sản xuất + Nhà cung cấp + Số seri -->
              <div class="form-row">
                <div class="form-group">
                  <label>Nhà sản xuất</label>
                  <select class="form-select">
                    <option value=""></option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Nhà cung cấp</label>
                  <select class="form-select">
                    <option value=""></option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Số seri</label>
                  <input type="text" class="form-input" placeholder="" />
                </div>
              </div>

              <!-- Ghi chú -->
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea class="form-textarea" placeholder=""></textarea>
                </div>
              </div>
            </div>

            <!-- Right: Map Section -->
            <div class="detail-map-section">
<!--              <div class="map-search-box">-->
<!--                <input type="text" placeholder="Nhập địa chỉ" />-->
<!--                <or-icon icon="magnify"></or-icon>-->
<!--              </div>-->
              <or-map style="width: 100%; height: 100%;" lat="21.0285" lng="105.8542" zoom="6">
              </or-map>
            </div>
          </div>

          <div class="detail-modal-footer">
            <button class="modal-btn primary">
              <or-icon icon="content-save"></or-icon>
              Thêm thiết bị
            </button>
            <button class="modal-btn danger" @click=${this.closeDetailModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderPaginationPages(totalPages: number): TemplateResult[] {
    const pages: TemplateResult[] = []
    const maxVisiblePages = 5
    const current = this.currentPage

    let startPage: number, endPage: number

    if (totalPages <= maxVisiblePages) {
      startPage = 1
      endPage = totalPages
    } else {
      const middlePage = Math.floor(maxVisiblePages / 2)
      if (current <= middlePage + 1) {
        startPage = 1
        endPage = maxVisiblePages
      } else if (current >= totalPages - middlePage) {
        startPage = totalPages - maxVisiblePages + 1
        endPage = totalPages
      } else {
        startPage = current - middlePage
        endPage = current + middlePage
      }
    }

    // First page
    if (startPage > 1) {
      pages.push(html`
        <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(1); }}>1</a></li>
      `)
      if (startPage > 2) {
        pages.push(html`<li><span class="ellipsis">...</span></li>`)
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(html`
        <li>
          <a href="#" 
             class="${i === current ? 'active' : ''}"
             @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(i); }}
          >${i}</a>
        </li>
      `)
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(html`<li><span class="ellipsis">...</span></li>`)
      }
      pages.push(html`
        <li><a href="#" @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(totalPages); }}>${totalPages}</a></li>
      `)
    }

    return pages
  }

  private renderTableRow(item: Equipment): TemplateResult {
    return html`
      <tr>
        <td>
          <span class="code-link" @click=${() => this.openEquipmentDetail(item)} style="cursor: pointer;">${item.code}</span>
        </td>
        <td>${item.name}</td>
        <td>
          <span class="activity-status ${this.getActivityStatusClass(item.activityStatus)}">
            <or-icon icon="${this.getActivityIcon(item.activityStatus)}"></or-icon>
            ${item.activityText}
          </span>
        </td>
        <td>${item.location}</td>
        <td>${item.phoneNumber}</td>
        <td>${item.group}</td>
        <td>${item.creator}</td>
        <td>${item.createdDate}</td>
        <td>
          <span class="status-text ${this.getStatusClass(item.status)}">
            ${item.statusText}
          </span>
        </td>
        <td>
          <div class="action-icons">
            <button class="action-btn download" title="Download">
              <or-icon icon="download"></or-icon>
            </button>
            <button class="action-btn edit" title="Edit">
              <or-icon icon="pencil"></or-icon>
            </button>
            <button class="action-btn delete" title="Delete">
              <or-icon icon="delete"></or-icon>
            </button>
          </div>
        </td>
      </tr>
    `
  }

  protected render(): TemplateResult {
    // Render different content based on selectedCategory
    switch (this.selectedCategory) {
      case "audio":
        return this.renderAudioTab()
      case "micro":
        return this.renderMicroTab()
      case "relay":
        return this.renderRelayTab()
      case "news":
        return this.renderNewsTab()
      case "admin":
        return this.renderAdminUnitTab()
      case "source":
        return this.renderSourceTab()
      case "channel":
        return this.renderChannelTab()
      default:
        return this.renderAudioTab() // Default to audio
    }
  }

  private renderAudioTab(): TemplateResult {
    const totalPages = this.getTotalPages()
    const paginatedData = this.getPaginatedData()
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.mockData.length)

    return html`
      <div class="container">
        <div class="header">DANH MỤC THIẾT BỊ ÂM THANH</div>

        <div class="filters-section">
          <div class="filter-group search-box">
            <input
              type="text"
              class="filter-input"
              placeholder="Nhập mã/ tên thiết bị"
            />
            <or-icon class="search-icon" icon="magnify"></or-icon>
          </div>
          <div class="filter-group dropdown">
            <div class="dropdown-trigger" @click=${this.toggleUsage}>
              <span class="dropdown-label">Trạng thái sử dụng</span>
              <or-icon icon="chevron-down"></or-icon>
            </div>
            ${this.usageOpen ? html`
              <div class="dropdown-menu">
                <div class="dropdown-placeholder">-- Trạng thái sử dụng --</div>
                ${this.usageOptions.map(opt => html`
                  <label class="dropdown-item">
                    <input
                      type="checkbox"
                      .checked=${this.selectedUsage.has(opt.id)}
                      @change=${() => this.toggleUsageItem(opt.id)}
                    />
                    <span>${opt.label}</span>
                  </label>
                `)}
              </div>
            ` : null}
          </div>

          <div class="filter-group dropdown">
            <div class="dropdown-trigger" @click=${this.toggleActive}>
              <span class="dropdown-label">Trạng thái hoạt động</span>
              <or-icon icon="chevron-down"></or-icon>
            </div>
            ${this.activeOpen ? html`
              <div class="dropdown-menu">
                <div class="dropdown-placeholder">-- Trạng thái hoạt động --</div>
                ${this.activeOptions.map(opt => html`
                  <label class="dropdown-item">
                    <input
                      type="checkbox"
                      .checked=${this.selectedActive.has(opt.id)}
                      @change=${() => this.toggleActiveItem(opt.id)}
                    />
                    <span>${opt.label}</span>
                  </label>
                `)}
              </div>
            ` : null}
          </div>
          <button class="btn btn-primary primary-color">
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions">
            <button class="toolbar-btn import" title="Import Excel" @click=${this.openImportModal}>
              <or-icon icon="file-import"></or-icon>
            </button>
            <button class="toolbar-btn export" title="Export Excel" @click=${this.handleExport}>
              <or-icon icon="file-export"></or-icon>
            </button>
            <button class="toolbar-btn create" title="Tạo mới" @click=${this.handleCreate}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã thiết bị</th>
                <th>Tên thiết bị</th>
                <th>Trạng thái hoạt động</th>
                <th>Khu vực</th>
                <th>Số điện thoại</th>
                <th>Nhóm thiết bị</th>
                <th>Người tạo</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th style="width: 120px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData.map((item) => this.renderTableRow(item))}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span class="pagination-info">
            Hiển thị ${startIndex} - ${endIndex} trên ${this.mockData.length} kết quả
          </span>
          <ul class="pagination-list">
            <li>
              <a href="#" 
                 class="page-nav ${this.currentPage === 1 ? 'disabled' : ''}"
                 @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(1); }}
              >&laquo;</a>
            </li>
            <li>
              <a href="#" 
                 class="page-nav ${this.currentPage === 1 ? 'disabled' : ''}"
                 @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(this.currentPage - 1); }}
              >&lt;</a>
            </li>
            ${this.renderPaginationPages(totalPages)}
            <li>
              <a href="#" 
                 class="page-nav ${this.currentPage === totalPages ? 'disabled' : ''}"
                 @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(this.currentPage + 1); }}
              >&gt;</a>
            </li>
            <li>
              <a href="#" 
                 class="page-nav ${this.currentPage === totalPages ? 'disabled' : ''}"
                 @click=${(e: Event) => { e.preventDefault(); this.handlePageChange(totalPages); }}
              >&raquo;</a>
            </li>
          </ul>
        </div>
      </div>
      ${this.renderImportModal()}
      ${this.renderResultModal()}
      ${this.renderDetailModal()}
    `
  }

  // ============ MICRO IP MODAL ============
  private renderDeviceTreeNode(node: any): TemplateResult {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = this.microExpandedNodes.has(node.id)
    const isSelected = this.selectedDevices.has(node.id)

    // Calculate partial/fully selected for parent nodes
    let isFullySelected = false
    let isPartial = false
    if (hasChildren) {
      const childIds = this.getAllChildIds(node)
      const selectedCount = childIds.filter(id => this.selectedDevices.has(id)).length
      if (selectedCount === childIds.length && childIds.length > 0) {
        isFullySelected = true
      } else if (selectedCount > 0) {
        isPartial = true
      }
    } else {
      isFullySelected = isSelected
    }

    const isHighlighted = isFullySelected || isPartial

    return html`
      <div class="tree-node" style="padding: 2px 0;">
        <div class="tree-row" style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 4px; cursor: pointer; ${isHighlighted ? 'background: #eef5ff;' : ''}" 
             @click=${() => hasChildren && this.toggleMicroNode(node.id)}>
          ${hasChildren
        ? html`<or-icon icon="${isExpanded ? 'chevron-down' : 'chevron-right'}" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #6b7280; cursor: pointer;"></or-icon>`
        : html`<span style="width: 16px;"></span>`
      }
          <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
            ${isPartial ? html`
              <div style="width: 18px; height: 18px; background: #0a73db; border-radius: 3px; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                   @click=${(e: Event) => { e.stopPropagation(); this.toggleDeviceSelection(node.id); }}>
                <span style="color: white; font-weight: bold; font-size: 16px; line-height: 1;">−</span>
              </div>
            ` : html`
              <input type="checkbox" 
                     .checked=${isFullySelected}
                     @click=${(e: Event) => e.stopPropagation()}
                     @change=${() => this.toggleDeviceSelection(node.id)}
                     style="width: 18px; height: 18px; cursor: pointer; accent-color: #0a73db;" />
            `}
          </div>
          <or-icon icon="${node.type === 'speaker' ? 'speaker' : 'office-building-outline'}" style="--or-icon-width: 18px; --or-icon-height: 18px; color: ${isHighlighted ? '#0a73db' : (node.type === 'speaker' ? '#ef4444' : '#6b7280')};"></or-icon>
          <span style="font-size: 14px; color: #374151;">${node.label}</span>
        </div>
        ${hasChildren && isExpanded ? html`
          <div class="tree-children" style="margin-left: 24px;">
            ${node.children.map((child: any) => this.renderDeviceTreeNode(child))}
          </div>
        ` : null}
      </div>
    `
  }

  private getAllChildIds(node: any): string[] {
    if (!node.children || node.children.length === 0) return [node.id]
    return node.children.flatMap((child: any) => this.getAllChildIds(child))
  }

  private renderMicroModal(): TemplateResult | null {
    if (!this.isMicroModalOpen || !this.selectedMicroItem) return null

    return html`
      <div class="micro-modal-overlay" @click=${() => this.closeMicroDetailModal()}>
        <div class="micro-modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header">
            <div class="micro-tabs">
              <div class="micro-tab ${this.activeMicroTab === 'info' ? 'active' : ''}"
                   @click=${() => this.activeMicroTab = 'info'}>THÔNG TIN</div>
              <div class="micro-tab ${this.activeMicroTab === 'history' ? 'active' : ''}"
                   @click=${() => this.activeMicroTab = 'history'}>LỊCH SỬ HOẠT ĐỘNG</div>
            </div>
            <button class="micro-refresh-btn" @click=${() => this.closeMicroDetailModal()}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          ${this.activeMicroTab === 'info' ? html`
            <div class="micro-modal-body">
              <!-- Left: Form Section -->
              <div class="micro-form-section">
                <div class="micro-section-title">THÔNG TIN CHUNG</div>
                
                <div class="form-row">
                  <div class="form-group full-width">
                    <label>Khu vực <span class="required">*</span></label>
                    <input type="text" class="form-input" placeholder="Khu vực" readonly
                           .value=${this.selectedMicroItem.area_name || ''} />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Mã thiết bị Micro <span class="required">*</span></label>
                    <input type="text" class="form-input" placeholder="Nhập mã thiết bị" readonly
                           .value=${this.selectedMicroItem.device_code || ''} />
                  </div>
                  <div class="form-group">
                    <label>Tên thiết bị Micro <span class="required">*</span></label>
                    <input type="text" class="form-input" placeholder="Nhập tên thiết bị"
                           .value=${this.selectedMicroItem.device_name || ''}
                           @input=${(e: Event) => this.selectedMicroItem = { ...this.selectedMicroItem, device_name: (e.target as HTMLInputElement).value }} />
                  </div>
                </div>

                <div class="form-row">
                  <label style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
                    <input type="checkbox" 
                           .checked=${this.selectedMicroItem.is_locked || false}
                           @change=${(e: Event) => this.selectedMicroItem = { ...this.selectedMicroItem, is_locked: (e.target as HTMLInputElement).checked }} />
                    <span>Tạm khóa</span>
                  </label>
                </div>
              </div>

              <!-- Right: Tree Section -->
              <div class="micro-tree-section">
                <div class="micro-section-title">THÔNG TIN THIẾT BỊ</div>
                
                <div class="micro-tree-search">
                  <input type="text" placeholder="Nhập mã/ tên" />
                  <or-icon icon="magnify"></or-icon>
                </div>

                <div class="micro-tree-container">
                  <ul class="device-tree">
                    ${this.microDeviceTree.map(node => this.renderMicroTreeNode(node))}
                  </ul>
                </div>
              </div>
            </div>
          ` : html`
            <div class="history-table-container">
              <table class="history-table">
                <thead>
                  <tr>
                    <th style="width: 180px;">Thời điểm</th>
                    <th>Hoạt động</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">Chưa có lịch sử hoạt động</td></tr>
                </tbody>
              </table>
            </div>
          `}

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateMicroItem()}>
              <or-icon icon="content-save"></or-icon>
              Lưu
            </button>
            <button class="modal-btn danger" @click=${() => this.closeMicroDetailModal()}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ============ MICRO IP CREATE MODAL ============
  private renderMicroCreateModal(): TemplateResult | null {
    if (!this.isMicroCreateModalOpen) return null

    return html`
      <div class="micro-modal-overlay" @click=${() => this.closeMicroCreateModal()}>
        <div class="micro-modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header">
            <div class="micro-tabs">
              <div class="micro-tab active">THÔNG TIN</div>
              <div class="micro-tab" style="opacity: 0.5; cursor: not-allowed;">LỊCH SỬ HOẠT ĐỘNG</div>
            </div>
            <button class="micro-refresh-btn" @click=${() => this.closeMicroCreateModal()}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          <div class="micro-modal-body">
            <!-- Left: Form Section -->
            <div class="micro-form-section">
              <div class="micro-section-title">THÔNG TIN CHUNG</div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Mã thiết bị Micro <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="Nhập mã thiết bị"
                         .value=${this.microFormData.device_code || ''}
                         @input=${(e: Event) => this.microFormData = { ...this.microFormData, device_code: (e.target as HTMLInputElement).value }} />
                </div>
                <div class="form-group">
                  <label>Tên thiết bị Micro <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="Nhập tên thiết bị"
                         .value=${this.microFormData.device_name || ''}
                         @input=${(e: Event) => this.microFormData = { ...this.microFormData, device_name: (e.target as HTMLInputElement).value }} />
                </div>
              </div>

              <div class="form-row">
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
                  <input type="checkbox" 
                         .checked=${this.microFormData.is_locked || false}
                         @change=${(e: Event) => this.microFormData = { ...this.microFormData, is_locked: (e.target as HTMLInputElement).checked }} />
                  <span>Tạm khóa</span>
                </label>
              </div>
            </div>

            <!-- Right: Tree Section -->
            <div class="micro-tree-section">
              <div class="micro-section-title">THÔNG TIN THIẾT BỊ</div>
              
              <div class="micro-tree-search">
                <input type="text" placeholder="Nhập mã/ tên" 
                       .value=${this.microTreeSearch}
                       @input=${(e: Event) => this.microTreeSearch = (e.target as HTMLInputElement).value} />
                <or-icon icon="magnify"></or-icon>
              </div>

              <div class="micro-tree-container">
                <ul class="device-tree">
                  ${this.microDeviceTree.map(provinceNode => this.renderMicroTreeNode(provinceNode))}
                </ul>
              </div>
            </div>
          </div>

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.createMicroItem()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${() => this.closeMicroCreateModal()}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // Render tree node for Province/Ward/Area hierarchy
  private renderMicroTreeNode(node: any): TemplateResult {
    const isExpanded = this.microTreeExpanded.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isArea = node.type === 'area'
    const isSelected = isArea && node.areaId === this.microSelectedAreaId

    // Filter by search
    if (this.microTreeSearch) {
      const searchLower = this.microTreeSearch.toLowerCase()
      const nodeMatches = node.label?.toLowerCase().includes(searchLower)
      const childMatches = node.children?.some((child: any) =>
        child.label?.toLowerCase().includes(searchLower) ||
        child.children?.some((c: any) => c.label?.toLowerCase().includes(searchLower))
      )
      if (!nodeMatches && !childMatches) return html``
    }

    return html`
      <li class="tree-node ${node.type}">
        <div class="tree-node-content" style="display: flex; align-items: center; padding: 6px 8px; cursor: pointer; ${isSelected ? 'background: #e3f2fd; border-radius: 4px;' : ''}"
             @click=${() => {
        if (isArea) {
          this.microSelectedAreaId = node.areaId
        } else if (hasChildren) {
          if (isExpanded) {
            this.microTreeExpanded.delete(node.id)
          } else {
            this.microTreeExpanded.add(node.id)
          }
          this.microTreeExpanded = new Set(this.microTreeExpanded)
        }
      }}>
          ${hasChildren ? html`
            <or-icon icon="${isExpanded ? 'chevron-down' : 'chevron-right'}" style="font-size: 16px; color: #6b7280; margin-right: 4px;"></or-icon>
          ` : html`<span style="width: 20px;"></span>`}
          
          ${isArea ? html`
            <input type="checkbox" .checked=${isSelected} style="margin-right: 8px;"
                   @click=${(e: Event) => e.stopPropagation()}
                   @change=${() => { this.microSelectedAreaId = isSelected ? '' : node.areaId }} />
            <or-icon icon="${node.icon || 'map-marker'}" style="font-size: 18px; color: #ef4444; margin-right: 8px;"></or-icon>
          ` : html`
            <or-icon icon="${node.icon || 'folder'}" style="font-size: 18px; color: #3b82f6; margin-right: 8px;"></or-icon>
          `}
          <span style="font-size: 14px; ${isSelected ? 'font-weight: 600; color: #1e40af;' : ''}">${node.label}</span>
        </div>
        ${hasChildren && isExpanded ? html`
          <ul class="tree-children" style="margin-left: 20px; list-style: none; padding: 0;">
            ${node.children.map((child: any) => this.renderMicroTreeNode(child))}
          </ul>
        ` : ''}
      </li>
    `
  }



  // ============ NEWS (LĨNH VỰC BẢN TIN) MODAL ============
  private renderNewsModal(): TemplateResult | null {
    if (!this.isNewsModalOpen || !this.selectedNewsCategory) return null

    return html`
      <div class="modal-overlay" @click=${this.closeNewsModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeNewsModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.selectedNewsCategory.title || ''}
                       @input=${(e: Event) => { if (this.selectedNewsCategory) this.selectedNewsCategory = { ...this.selectedNewsCategory, title: (e.target as HTMLInputElement).value } }} />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5" placeholder=""
                          .value=${this.selectedNewsCategory.description || ''}
                          @input=${(e: Event) => { if (this.selectedNewsCategory) this.selectedNewsCategory = { ...this.selectedNewsCategory, description: (e.target as HTMLTextAreaElement).value } }}></textarea>
              </div>
            </div>
          </div>

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateNewsCategory()}>
              <or-icon icon="content-save"></or-icon>
              Lưu
            </button>
            <button class="modal-btn danger" @click=${this.closeNewsModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ============ NEWS DELETE CONFIRMATION MODAL ============
  private renderNewsDeleteModal(): TemplateResult | null {
    if (!this.isNewsDeleteModalOpen || !this.newsItemToDelete) return null

    return html`
      <div class="modal-overlay" @click=${this.closeNewsDeleteModal}>
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Header xanh dương -->
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: center; align-items: center; position: relative;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white; text-align: center;">Xác nhận</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px; position: absolute; right: 16px;" @click=${this.closeNewsDeleteModal}>
              <or-icon icon="close" style="color: white; font-size: 20px;"></or-icon>
            </button>
          </div>
          <!-- Content -->
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Bạn có chắc chắn muốn xóa <strong style="color: #111827;">${this.newsItemToDelete?.title || ''}</strong> này?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 8px 24px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${this.closeNewsDeleteModal}>
                Hủy
              </button>
              <button style="padding: 8px 24px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${() => this.confirmDeleteNewsCategory()}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // ============ MICRO IP TAB ============
  private renderMicroTab(): TemplateResult {
    const totalPages = Math.ceil(this.microTotal / this.microPageSize)
    const startIndex = this.microTotal > 0 ? (this.microCurrentPage - 1) * this.microPageSize + 1 : 0
    const endIndex = Math.min(this.microCurrentPage * this.microPageSize, this.microTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC MICRO IP</div>
        <div class="filters-section">
          <div class="filter-group search-box">
            <input type="text" class="filter-input" placeholder="Nhập tên thiết bị"
                   .value=${this.microSearchQuery}
                   @input=${(e: Event) => this.microSearchQuery = (e.target as HTMLInputElement).value} />
          </div>
          <button class="btn btn-primary primary-color" @click=${() => this.loadMicroItems()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions">
            <button class="toolbar-btn create" title="Tạo mới" @click=${() => this.openMicroCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã thiết bị</th>
                <th>Tên thiết bị</th>
                <th style="width: 80px; text-align: center;">Tạm khóa</th>
                <th>Khu vực</th>
                <th>Người tạo</th>
                <th>Ngày tạo</th>
                <th style="width: 100px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isMicroLoading ? html`
                <tr>
                  <td colspan="7" style="text-align: center; padding: 24px;">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ` : this.microItems.length === 0 ? html`
                <tr>
                  <td colspan="7" style="text-align: center; padding: 24px; color: #6b7280;">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ` : this.microItems.map(item => html`
                <tr>
                  <td>${item.device_code || ''}</td>
                  <td>
                    <span class="code-link" style="cursor: pointer;" 
                          @click=${() => this.openMicroDetailModal(item)}>
                      ${item.device_name || 'N/A'}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    ${item.is_locked ? html`
                      <or-icon icon="lock" style="color: #ef4444;"></or-icon>
                    ` : ''}
                  </td>
                  <td>${item.area_name || ''}</td>
                  <td>${item.create_by || ''}</td>
                  <td>${item.create_at ? new Date(item.create_at).toLocaleDateString('vi-VN') + ' ' + new Date(item.create_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => this.openMicroDetailModal(item)}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.deleteMicroItem(item)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span class="pagination-info">
            ${this.microTotal > 0
        ? `Hiển thị ${startIndex} - ${endIndex} trên ${this.microTotal} kết quả`
        : 'Chưa có dữ liệu'}
          </span>
          <div class="pagination-right">
            <ul class="pagination-list">
              <li>
                <a href="#" class="page-nav ${this.microCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.microCurrentPage > 1) { this.microCurrentPage = 1; this.loadMicroItems(); } }}>&laquo;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.microCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.microCurrentPage > 1) { this.microCurrentPage--; this.loadMicroItems(); } }}>&lt;</a>
              </li>
              <li><a href="#" class="active">${this.microCurrentPage}</a></li>
              <li>
                <a href="#" class="page-nav ${this.microCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.microCurrentPage < totalPages) { this.microCurrentPage++; this.loadMicroItems(); } }}>&gt;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.microCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.microCurrentPage < totalPages) { this.microCurrentPage = totalPages; this.loadMicroItems(); } }}>&raquo;</a>
              </li>
            </ul>
            <select class="page-size-select" .value=${String(this.microPageSize)}
                    @change=${(e: Event) => { this.microPageSize = Number((e.target as HTMLSelectElement).value); this.microCurrentPage = 1; this.loadMicroItems(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderMicroModal()}
      ${this.renderMicroCreateModal()}
    `
  }

  // ============ TIẾP SÓNG TAB ============
  private renderRelayTab(): TemplateResult {
    const totalPages = Math.ceil(this.relayTotal / this.relayPageSize)
    const startIndex = this.relayTotal > 0 ? (this.relayCurrentPage - 1) * this.relayPageSize + 1 : 0
    const endIndex = Math.min(this.relayCurrentPage * this.relayPageSize, this.relayTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC TIẾP SÓNG</div>
        <div class="filters-section" style="gap: 12px;">
          <div class="filter-group" style="min-width: 200px;">
            <input type="text" class="filter-input" placeholder="Nhập tiêu đề" style="width: 100%;"
                   .value=${this.relaySearchQuery}
                   @input=${(e: Event) => this.relaySearchQuery = (e.target as HTMLInputElement).value}
                   @keypress=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleRelaySearch() }} />
          </div>
          <button style="background: #0a73db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-weight: 500;" @click=${() => this.handleRelaySearch()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions" style="margin-left: auto;">
            <button class="toolbar-btn create" style="background: #0a73db;" title="Tạo mới" @click=${() => this.openRelayCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Tiêu đề</th>
                <th style="width: 20%;">URL</th>
                <th style="width: 8%; text-align: center;">Dùng chung</th>
                <th style="width: auto;">Ghi chú</th>
                <th style="width: 10%;">Ngày tạo</th>
                <th style="width: 10%; text-align: center;">Trạng thái</th>
                <th style="width: 100px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isRelayLoading ? html`
                <tr><td colspan="7" style="text-align: center; padding: 24px;">Đang tải dữ liệu...</td></tr>
              ` : this.relayItems.length === 0 ? html`
                <tr><td colspan="7" style="text-align: center; padding: 24px; color: #6b7280;">Chưa có dữ liệu</td></tr>
              ` : this.relayItems.map(item => html`
                <tr>
                  <td>
                    <span class="code-link" style="cursor: pointer;" @click=${() => this.openRelayDetailModal(item)}>
                      ${item.title || 'N/A'}
                    </span>
                  </td>
                  <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="${item.url || '#'}" target="_blank" class="code-link" title="${item.url || ''}">${item.url || ''}</a>
                  </td>
                  <td style="text-align: center;"><input type="checkbox" .checked=${item.isShare || false} disabled /></td>
                  <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.description || ''}</td>
                  <td>${item.createdAt || ''}</td>
                  <td style="text-align: center;">
                    <span class="status-text ${item.status === 1 ? 'status-active' : 'status-inactive'}">
                      ${item.status === 1 ? 'Đang sử dụng' : 'Ngưng sử dụng'}
                    </span>
                  </td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => this.openRelayDetailModal(item)}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.deleteRelay(item)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination-section" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; flex-wrap: wrap; gap: 12px;">
          <span class="pagination-info" style="font-size: 13px; color: #6b7280;">Hiển thị ${startIndex} - ${endIndex} of ${this.relayTotal} kết quả</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <ul class="pagination-list" style="display: flex; list-style: none; padding: 0; margin: 0; gap: 4px;">
              <li><a href="#" class="page-nav ${this.relayCurrentPage === 1 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.relayCurrentPage > 1) { this.relayCurrentPage--; this.loadRelays(); } }}>&lt;</a></li>
              <li><a href="#" class="active" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 4px; text-decoration: none; background: #0a73db; color: white; font-size: 13px;">${this.relayCurrentPage}</a></li>
              <li><a href="#" class="page-nav ${this.relayCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.relayCurrentPage < totalPages) { this.relayCurrentPage++; this.loadRelays(); } }}>&gt;</a></li>
            </ul>
            <select class="page-size-select" style="padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background: white; cursor: pointer; appearance: auto;" .value=${String(this.relayPageSize)}
                    @change=${(e: Event) => { this.relayPageSize = Number((e.target as HTMLSelectElement).value); this.relayCurrentPage = 1; this.loadRelays(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderRelayModal()}
      ${this.renderRelayCreateModal()}
      ${this.renderRelayDeleteModal()}
    `
  }

  // ============ LĨNH VỰC BẢN TIN TAB ============
  private renderNewsTab(): TemplateResult {
    const totalPages = Math.ceil(this.newsCategoryTotal / this.newsPageSize)
    const startIndex = (this.newsCurrentPage - 1) * this.newsPageSize + 1
    const endIndex = Math.min(this.newsCurrentPage * this.newsPageSize, this.newsCategoryTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC LĨNH VỰC BẢN TIN</div>
        <div class="filters-section" style="gap: 12px;">
          <div class="filter-group" style="min-width: 200px;">
            <input type="text" class="filter-input" placeholder="Tên lĩnh vực" style="width: 100%;"
                   .value=${this.newsSearchQuery}
                   @input=${(e: Event) => this.newsSearchQuery = (e.target as HTMLInputElement).value}
                   @keypress=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleNewsSearch() }} />
          </div>
          <button style="background: #0a73db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-weight: 500;" @click=${() => this.handleNewsSearch()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions" style="margin-left: auto;">
            <button class="toolbar-btn create" style="background: #0a73db;" title="Tạo mới" @click=${() => this.openNewsCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Tiêu đề</th>
                <th style="width: auto;">Mô tả</th>
                <th style="width: 100px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isNewsLoading ? html`
                <tr>
                  <td colspan="3" style="text-align: center; padding: 24px;">
                    <or-icon icon="loading" style="animation: spin 1s linear infinite;"></or-icon>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ` : this.newsCategories.length === 0 ? html`
                <tr>
                  <td colspan="3" style="text-align: center; padding: 24px; color: #6b7280;">
                    Chưa có dữ liệu. Nhấn "Tìm kiếm" để tải dữ liệu.
                  </td>
                </tr>
              ` : this.newsCategories.map(category => html`
                <tr>
                  <td>
                    <span class="code-link" style="cursor: pointer;" @click=${() => { this.selectedNewsCategory = category; this.openNewsModal(); }}>
                      ${category.title}
                    </span>
                  </td>
                  <td>${category.description || ''}</td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => { this.selectedNewsCategory = category; this.openNewsModal(); }}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.deleteNewsCategory(category)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span class="pagination-info">
            ${this.newsCategoryTotal > 0
        ? `Hiển thị ${startIndex} - ${endIndex} trên ${this.newsCategoryTotal} kết quả`
        : 'Chưa có dữ liệu'}
          </span>
          <div class="pagination-right">
            <ul class="pagination-list">
              <li>
                <a href="#" class="page-nav ${this.newsCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.newsCurrentPage > 1) { this.newsCurrentPage = 1; this.loadNewsCategories(); } }}>&laquo;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.newsCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.newsCurrentPage > 1) { this.newsCurrentPage--; this.loadNewsCategories(); } }}>&lt;</a>
              </li>
              ${this.renderNewsPaginationPages(totalPages)}
              <li>
                <a href="#" class="page-nav ${this.newsCurrentPage === totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.newsCurrentPage < totalPages) { this.newsCurrentPage++; this.loadNewsCategories(); } }}>&gt;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.newsCurrentPage === totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.newsCurrentPage < totalPages) { this.newsCurrentPage = totalPages; this.loadNewsCategories(); } }}>&raquo;</a>
              </li>
            </ul>
            <select class="page-size-select" .value=${String(this.newsPageSize)}
                    @change=${(e: Event) => { this.newsPageSize = Number((e.target as HTMLSelectElement).value); this.newsCurrentPage = 1; this.loadNewsCategories(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderNewsModal()}
      ${this.renderNewsCreateModal()}
      ${this.renderNewsDeleteModal()}
    `
  }

  // ============ NEWS CREATE MODAL ============
  private renderNewsCreateModal(): TemplateResult | null {
    if (!this.isNewsCreateModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeNewsCreateModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">TẠO MỚI LĨNH VỰC BẢN TIN</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeNewsCreateModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.newsCategoryFormData.title}
                       @input=${(e: Event) => this.newsCategoryFormData = { ...this.newsCategoryFormData, title: (e.target as HTMLInputElement).value }} />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5" placeholder=""
                          .value=${this.newsCategoryFormData.description || ''}
                          @input=${(e: Event) => this.newsCategoryFormData = { ...this.newsCategoryFormData, description: (e.target as HTMLTextAreaElement).value }}></textarea>
              </div>
            </div>
          </div>

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.createNewsCategory()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeNewsCreateModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ============ ADMIN UNIT (ĐƠN VỊ HÀNH CHÍNH) MODAL ============
  private renderAdminUnitModal(): TemplateResult | null {
    if (!this.isAdminUnitModalOpen || !this.selectedAreaItem) return null

    return html`
      <div class="modal-overlay" @click=${this.closeAdminUnitModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">CHI TIẾT ĐƠN VỊ HÀNH CHÍNH</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeAdminUnitModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group">
                <label>Mã đơn vị <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập mã đơn vị"
                       .value=${this.selectedAreaItem?.code || ''}
                       @input=${(e: Event) => this.selectedAreaItem = { ...this.selectedAreaItem, code: (e.target as HTMLInputElement).value }} />
              </div>
              <div class="form-group">
                <label>Tên đơn vị <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tên đơn vị"
                       .value=${this.selectedAreaItem?.name || ''}
                       @input=${(e: Event) => this.selectedAreaItem = { ...this.selectedAreaItem, name: (e.target as HTMLInputElement).value }} />
              </div>
              <div class="form-group">
                <label>Tên viết tắt</label>
                <input type="text" class="form-input" placeholder="Nhập tên viết tắt"
                       .value=${this.selectedAreaItem?.shortName || ''}
                       @input=${(e: Event) => this.selectedAreaItem = { ...this.selectedAreaItem, shortName: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
          </div>

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateAreaItem()}>
              <or-icon icon="content-save"></or-icon>
              Lưu
            </button>
            <button class="modal-btn danger" @click=${this.closeAdminUnitModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ============ ADMIN UNIT CREATE MODAL ============
  private renderAdminUnitCreateModal(): TemplateResult | null {
    if (!this.isAdminUnitCreateModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeAdminUnitCreateModal}>
        <div class="modal-content" style="max-width: 800px;" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">TẠO MỚI ĐƠN VỊ HÀNH CHÍNH</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeAdminUnitCreateModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>

          <div style="padding: 20px 24px;">
            <!-- Thông tin đơn vị hành chính -->
            <div style="font-weight: 600; color: #374151; margin-bottom: 16px;">Thông tin đơn vị hành chính</div>
            
            <!-- Chọn khu vực -->
            <div class="form-row" style="margin-bottom: 20px; align-items: flex-start;">
              <div class="form-group" style="flex: 0 0 auto; padding-top: 8px;">
                <label style="white-space: nowrap;">Chọn khu vực <span class="required">*</span></label>
              </div>
              <div class="form-group" style="flex: 0 0 180px;">
                <select class="form-input"
                        .value=${this.selectedAreaWardId}
                        ?disabled=${!this.selectedAreaProvinceId}
                        @change=${(e: Event) => {
        this.selectedAreaWardId = (e.target as HTMLSelectElement).value
      }}>
                  <option value="">Xã/ Phường</option>
                  ${this.areaWards.map(w => html`
                    <option value="${w.id}">${w.name}</option>
                  `)}
                </select>
              </div>
              <div class="form-group" style="flex: 0 0 180px;">
                <select class="form-input"
                        .value=${this.selectedAreaProvinceId}
                        @change=${async (e: Event) => {
        this.selectedAreaProvinceId = (e.target as HTMLSelectElement).value
        this.selectedAreaWardId = ""
        await this.loadAreaWardsByProvince(this.selectedAreaProvinceId)
      }}>
                  <option value="">Tỉnh/Thành</option>
                  ${this.areaProvinces.map(p => html`
                    <option value="${p.id}">${p.name}</option>
                  `)}
                </select>
              </div>
            </div>

            <!-- Mã đơn vị, Tên đơn vị, Tên viết tắt -->
            <div class="form-row">
              <div class="form-group">
                <label>Mã đơn vị <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập  mã đơn vị"
                       .value=${this.areaFormData.code || ''}
                       @input=${(e: Event) => this.areaFormData = { ...this.areaFormData, code: (e.target as HTMLInputElement).value }} />
              </div>
              <div class="form-group">
                <label>Tên đơn vị <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tên đơn vị"
                       .value=${this.areaFormData.name || ''}
                       @input=${(e: Event) => this.areaFormData = { ...this.areaFormData, name: (e.target as HTMLInputElement).value }} />
              </div>
              <div class="form-group">
                <label>Tên viết tắt</label>
                <input type="text" class="form-input" placeholder="Nhập tên viết tắt"
                       .value=${this.areaFormData.shortName || ''}
                       @input=${(e: Event) => this.areaFormData = { ...this.areaFormData, shortName: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
          </div>

          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.createAreaItem()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeAdminUnitCreateModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ============ DELETE CONFIRMATION MODAL ============
  private renderDeleteConfirmModal(): TemplateResult | null {
    if (!this.isDeleteConfirmModalOpen || !this.itemToDelete) return null

    return html`
      <div class="modal-overlay" @click=${this.closeDeleteConfirmModal}>
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Header xanh dương -->
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: center; align-items: center; position: relative;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white; text-align: center;">Xác nhận</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px; position: absolute; right: 16px;" @click=${this.closeDeleteConfirmModal}>
              <or-icon icon="close" style="color: white; font-size: 20px;"></or-icon>
            </button>
          </div>
          <!-- Content -->
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Bạn có chắc chắn muốn xóa <strong style="color: #111827;">${this.itemToDelete?.name || this.itemToDelete?.code || ''}</strong> này?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 8px 24px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${this.closeDeleteConfirmModal}>
                Hủy
              </button>
              <button style="padding: 8px 24px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${() => this.confirmDeleteAreaItem()}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // ============ ADMIN UNIT (ĐƠN VỊ HÀNH CHÍNH) TAB ============
  private renderAdminUnitTab(): TemplateResult {
    const totalPages = Math.ceil(this.areaTotal / this.areaPageSize)
    const startIndex = this.areaTotal > 0 ? (this.areaCurrentPage - 1) * this.areaPageSize + 1 : 0
    const endIndex = Math.min(this.areaCurrentPage * this.areaPageSize, this.areaTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC ĐƠN VỊ HÀNH CHÍNH</div>
        <div class="filters-section" style="flex-wrap: wrap; gap: 12px;">
          <!-- Tỉnh/Thành dropdown -->
          <div class="filter-group" style="min-width: 140px;">
            <select class="filter-input" style="width: 100%;"
                    .value=${this.selectedAreaProvinceId}
                    @change=${async (e: Event) => {
        this.selectedAreaProvinceId = (e.target as HTMLSelectElement).value
        this.selectedAreaWardId = ""
        await this.loadAreaWardsByProvince(this.selectedAreaProvinceId)
      }}>
              <option value="">Tỉnh/Thành</option>
              ${this.areaProvinces.map(p => html`
                <option value="${p.id}">${p.name}</option>
              `)}
            </select>
          </div>
          <!-- Xã/Phường dropdown -->
          <div class="filter-group" style="min-width: 140px;">
            <select class="filter-input" style="width: 100%;"
                    .value=${this.selectedAreaWardId}
                    ?disabled=${!this.selectedAreaProvinceId}
                    @change=${(e: Event) => {
        this.selectedAreaWardId = (e.target as HTMLSelectElement).value
      }}>
              <option value="">Xã/ Phường</option>
              ${this.areaWards.map(w => html`
                <option value="${w.id}">${w.name}</option>
              `)}
            </select>
          </div>
          <!-- Mã đơn vị input -->
          <div class="filter-group" style="min-width: 120px;">
            <input type="text" class="filter-input" placeholder="Mã đơn vị" style="width: 100%;"
                   .value=${this.areaCodeFilter}
                   @input=${(e: Event) => this.areaCodeFilter = (e.target as HTMLInputElement).value} />
          </div>
          <!-- Tên viết tắt input -->
          <div class="filter-group" style="min-width: 120px;">
            <input type="text" class="filter-input" placeholder="Tên viết tắt" style="width: 100%;"
                   .value=${this.areaShortNameFilter}
                   @input=${(e: Event) => this.areaShortNameFilter = (e.target as HTMLInputElement).value} />
          </div>
          <!-- Tên đơn vị input -->
          <div class="filter-group" style="min-width: 140px;">
            <input type="text" class="filter-input" placeholder="Tên đơn vị"
                   .value=${this.areaSearchQuery}
                   @input=${(e: Event) => this.areaSearchQuery = (e.target as HTMLInputElement).value} />
          </div>
          <!-- Tìm kiếm button -->
          <button style="background: #0a73db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-weight: 500;" @click=${() => this.handleAreaSearch()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions" style="margin-left: auto;">
            <button class="toolbar-btn import" title="Import Excel" @click=${this.openImportModal}>
              <or-icon icon="file-excel"></or-icon>
            </button>
            <button class="toolbar-btn create" style="background: #0a73db;" title="Tạo mới" @click=${() => this.openAdminUnitCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 20%;">Mã đơn vị</th>
                <th style="width: 15%;">Tên viết tắt</th>
                <th style="width: 45%;">Tên đơn vị</th>
                <th style="width: 20%; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isAreaLoading ? html`
                <tr>
                  <td colspan="4" style="text-align: center; padding: 24px;">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ` : this.areaItems.length === 0 ? html`
                <tr>
                  <td colspan="4" style="text-align: center; padding: 24px; color: #6b7280;">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ` : this.areaItems.map(item => html`
                <tr>
                  <td>${item.code || 'N/A'}</td>
                  <td>
                    <span class="code-link" style="cursor: pointer;" 
                          @click=${() => this.openAdminUnitDetailModal(item)}>
                      ${item.shortName || item.name || 'N/A'}
                    </span>
                  </td>
                  <td>${item.name || ''}</td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => this.openAdminUnitDetailModal(item)}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.openDeleteConfirmModal(item)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span class="pagination-info">
            ${this.areaTotal > 0
        ? `Hiển thị ${startIndex} - ${endIndex} trên ${this.areaTotal} kết quả`
        : 'Chưa có dữ liệu'}
          </span>
          <div class="pagination-right">
            <ul class="pagination-list">
              <li>
                <a href="#" class="page-nav ${this.areaCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.areaCurrentPage > 1) { this.areaCurrentPage = 1; this.loadAreaItems(); } }}>&laquo;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.areaCurrentPage === 1 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.areaCurrentPage > 1) { this.areaCurrentPage--; this.loadAreaItems(); } }}>&lt;</a>
              </li>
              <li><a href="#" class="active">${this.areaCurrentPage}</a></li>
              <li>
                <a href="#" class="page-nav ${this.areaCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.areaCurrentPage < totalPages) { this.areaCurrentPage++; this.loadAreaItems(); } }}>&gt;</a>
              </li>
              <li>
                <a href="#" class="page-nav ${this.areaCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}"
                   @click=${(e: Event) => { e.preventDefault(); if (this.areaCurrentPage < totalPages) { this.areaCurrentPage = totalPages; this.loadAreaItems(); } }}>&raquo;</a>
              </li>
            </ul>
            <select class="page-size-select" .value=${String(this.areaPageSize)}
                    @change=${(e: Event) => { this.areaPageSize = Number((e.target as HTMLSelectElement).value); this.areaCurrentPage = 1; this.loadAreaItems(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderAdminUnitModal()}
      ${this.renderAdminUnitCreateModal()}
      ${this.renderDeleteConfirmModal()}
    `
  }

  // ============ SOURCE (NGUỒN TIẾP SÓNG) TAB ============
  private renderSourceTab(): TemplateResult {
    const totalPages = Math.ceil(this.sourceTotal / this.sourcePageSize)
    const startIndex = this.sourceTotal > 0 ? (this.sourceCurrentPage - 1) * this.sourcePageSize + 1 : 0
    const endIndex = Math.min(this.sourceCurrentPage * this.sourcePageSize, this.sourceTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC NGUỒN TIẾP SÓNG</div>
        <div class="filters-section" style="gap: 12px;">
          <div class="filter-group" style="min-width: 200px;">
            <input type="text" class="filter-input" placeholder="Tên nguồn" style="width: 100%;"
                   .value=${this.sourceSearchQuery}
                   @input=${(e: Event) => this.sourceSearchQuery = (e.target as HTMLInputElement).value}
                   @keypress=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleSourceSearch() }} />
          </div>
          <button style="background: #0a73db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-weight: 500;" @click=${() => this.handleSourceSearch()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions" style="margin-left: auto;">
            <button class="toolbar-btn create" style="background: #0a73db;" title="Tạo mới" @click=${() => this.openSourceCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Tên nguồn</th>
                <th style="width: auto;">Mô tả</th>
                <th style="width: 100px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isSourceLoading ? html`
                <tr><td colspan="3" style="text-align: center; padding: 24px;">Đang tải dữ liệu...</td></tr>
              ` : this.sourceItems.length === 0 ? html`
                <tr><td colspan="3" style="text-align: center; padding: 24px; color: #6b7280;">Chưa có dữ liệu</td></tr>
              ` : this.sourceItems.map(item => html`
                <tr>
                  <td>
                    <span class="code-link" style="cursor: pointer;" @click=${() => this.openSourceDetailModal(item)}>
                      ${item.name || 'N/A'}
                    </span>
                  </td>
                  <td>${item.description || ''}</td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => this.openSourceDetailModal(item)}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.deleteSource(item)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination-section" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; flex-wrap: wrap; gap: 12px;">
          <span class="pagination-info" style="font-size: 13px; color: #6b7280;">Hiển thị ${startIndex} - ${endIndex} of ${this.sourceTotal} kết quả</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <ul class="pagination-list" style="display: flex; list-style: none; padding: 0; margin: 0; gap: 4px;">
              <li><a href="#" class="page-nav ${this.sourceCurrentPage === 1 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.sourceCurrentPage > 1) { this.sourceCurrentPage--; this.loadSources(); } }}>&lt;</a></li>
              <li><a href="#" class="active" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 4px; text-decoration: none; background: #0a73db; color: white; font-size: 13px;">${this.sourceCurrentPage}</a></li>
              <li><a href="#" class="page-nav ${this.sourceCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.sourceCurrentPage < totalPages) { this.sourceCurrentPage++; this.loadSources(); } }}>&gt;</a></li>
            </ul>
            <select class="page-size-select" style="padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background: white; cursor: pointer; appearance: auto;" .value=${String(this.sourcePageSize)}
                    @change=${(e: Event) => { this.sourcePageSize = Number((e.target as HTMLSelectElement).value); this.sourceCurrentPage = 1; this.loadSources(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderSourceModal()}
      ${this.renderSourceCreateModal()}
      ${this.renderSourceDeleteModal()}
    `
  }

  // Source API methods
  private async loadSources(): Promise<void> {
    this.isSourceLoading = true
    try {
      const filterDTO = {
        page: this.sourceCurrentPage,
        size: this.sourcePageSize,
        keyWord: this.sourceSearchQuery?.trim() || undefined
      }
      const response = await manager.rest.api.SourceResource.getAllSource(filterDTO as any)
      this.sourceItems = (response?.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        realmName: item.realmName
      }))
      this.sourceTotal = this.sourceItems.length
      console.log('[Source] Loaded:', this.sourceItems.length, 'items')
    } catch (error) {
      console.error('[Source] Error loading:', error)
      this.sourceItems = []
      this.sourceTotal = 0
    } finally {
      this.isSourceLoading = false
    }
  }

  private async handleSourceSearch(): Promise<void> {
    this.sourceCurrentPage = 1
    await this.loadSources()
  }

  private openSourceCreateModal(): void {
    this.sourceFormData = { name: '', description: '' }
    this.isSourceCreateModalOpen = true
  }

  private closeSourceCreateModal(): void {
    this.isSourceCreateModalOpen = false
  }

  private openSourceDetailModal(item: SourceData): void {
    this.selectedSource = { ...item }
    this.isSourceModalOpen = true
  }

  private closeSourceModal(): void {
    this.isSourceModalOpen = false
    this.selectedSource = null
  }

  private deleteSource(item: SourceData): void {
    this.sourceItemToDelete = item
    this.isSourceDeleteModalOpen = true
  }

  private closeSourceDeleteModal(): void {
    this.isSourceDeleteModalOpen = false
    this.sourceItemToDelete = null
  }

  private async confirmDeleteSource(): Promise<void> {
    if (!this.sourceItemToDelete) return
    try {
      await manager.rest.api.SourceResource.removeSource({ id: this.sourceItemToDelete.id } as any)
      this.closeSourceDeleteModal()
      await this.loadSources()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('[Source] Error deleting:', error)
      this.showNotification('Có lỗi xảy ra!')
      this.closeSourceDeleteModal()
    }
  }

  private async createSource(): Promise<void> {
    if (!this.sourceFormData.name) {
      this.showNotification('Vui lòng nhập tên nguồn!')
      return
    }
    try {
      const payload = {
        name: this.sourceFormData.name,
        description: this.sourceFormData.description || ''
      }
      await manager.rest.api.SourceResource.createSource(payload as any)
      this.closeSourceCreateModal()
      await this.loadSources()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('[Source] Error creating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async updateSource(): Promise<void> {
    if (!this.selectedSource?.name) {
      this.showNotification('Vui lòng nhập tên nguồn!')
      return
    }
    try {
      const payload = {
        id: this.selectedSource.id,
        name: this.selectedSource.name,
        description: this.selectedSource.description || ''
      }
      await manager.rest.api.SourceResource.updateSource(payload as any)
      this.closeSourceModal()
      await this.loadSources()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('[Source] Error updating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  // Source Modals
  private renderSourceModal(): TemplateResult | null {
    if (!this.isSourceModalOpen || !this.selectedSource) return null

    return html`
      <div class="modal-overlay" @click=${this.closeSourceModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeSourceModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.selectedSource.name || ''}
                       @input=${(e: Event) => { if (this.selectedSource) this.selectedSource = { ...this.selectedSource, name: (e.target as HTMLInputElement).value } }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5"
                          .value=${this.selectedSource.description || ''}
                          @input=${(e: Event) => { if (this.selectedSource) this.selectedSource = { ...this.selectedSource, description: (e.target as HTMLTextAreaElement).value } }}></textarea>
              </div>
            </div>
          </div>
          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateSource()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeSourceModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderSourceCreateModal(): TemplateResult | null {
    if (!this.isSourceCreateModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeSourceCreateModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeSourceCreateModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.sourceFormData.name || ''}
                       @input=${(e: Event) => this.sourceFormData = { ...this.sourceFormData, name: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5"
                          .value=${this.sourceFormData.description || ''}
                          @input=${(e: Event) => this.sourceFormData = { ...this.sourceFormData, description: (e.target as HTMLTextAreaElement).value }}></textarea>
              </div>
            </div>
          </div>
          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.createSource()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeSourceCreateModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderSourceDeleteModal(): TemplateResult | null {
    if (!this.isSourceDeleteModalOpen || !this.sourceItemToDelete) return null

    return html`
      <div class="modal-overlay" @click=${this.closeSourceDeleteModal}>
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: center; align-items: center; position: relative;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white; text-align: center;">Xác nhận</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px; position: absolute; right: 16px;" @click=${this.closeSourceDeleteModal}>
              <or-icon icon="close" style="color: white; font-size: 20px;"></or-icon>
            </button>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Bạn có chắc chắn muốn xóa <strong style="color: #111827;">${this.sourceItemToDelete?.name || ''}</strong> này?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 8px 24px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${this.closeSourceDeleteModal}>
                Hủy
              </button>
              <button style="padding: 8px 24px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${() => this.confirmDeleteSource()}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // ============ CHANNEL (KÊNH) TAB ============
  private renderChannelTab(): TemplateResult {
    const totalPages = Math.ceil(this.channelTotal / this.channelPageSize)
    const startIndex = this.channelTotal > 0 ? (this.channelCurrentPage - 1) * this.channelPageSize + 1 : 0
    const endIndex = Math.min(this.channelCurrentPage * this.channelPageSize, this.channelTotal)

    return html`
      <div class="container">
        <div class="header">DANH MỤC KÊNH</div>
        <div class="filters-section" style="gap: 12px;">
          <div class="filter-group" style="min-width: 200px;">
            <input type="text" class="filter-input" placeholder="Tên kênh" style="width: 100%;"
                   .value=${this.channelSearchQuery}
                   @input=${(e: Event) => this.channelSearchQuery = (e.target as HTMLInputElement).value}
                   @keypress=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleChannelSearch() }} />
          </div>
          <button style="background: #0a73db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: white; font-weight: 500;" @click=${() => this.handleChannelSearch()}>
            <or-icon icon="magnify"></or-icon>
            Tìm kiếm
          </button>
          <div class="toolbar-actions" style="margin-left: auto;">
            <button class="toolbar-btn create" style="background: #0a73db;" title="Tạo mới" @click=${() => this.openChannelCreateModal()}>
              <or-icon icon="plus"></or-icon>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">Tên kênh</th>
                <th style="width: 20%;">Nguồn</th>
                <th style="width: auto;">Mô tả</th>
                <th style="width: 100px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.isChannelLoading ? html`
                <tr><td colspan="4" style="text-align: center; padding: 24px;">Đang tải dữ liệu...</td></tr>
              ` : this.channelItems.length === 0 ? html`
                <tr><td colspan="4" style="text-align: center; padding: 24px; color: #6b7280;">Chưa có dữ liệu</td></tr>
              ` : this.channelItems.map(item => html`
                <tr>
                  <td>
                    <span class="code-link" style="cursor: pointer;" @click=${() => this.openChannelDetailModal(item)}>
                      ${item.name || 'N/A'}
                    </span>
                  </td>
                  <td>${item.sourceName || ''}</td>
                  <td>${item.description || ''}</td>
                  <td>
                    <div class="action-icons">
                      <button class="action-btn edit" @click=${() => this.openChannelDetailModal(item)}>
                        <or-icon icon="pencil"></or-icon>
                      </button>
                      <button class="action-btn delete" @click=${() => this.deleteChannel(item)}>
                        <or-icon icon="delete"></or-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <div class="pagination-section" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; flex-wrap: wrap; gap: 12px;">
          <span class="pagination-info" style="font-size: 13px; color: #6b7280;">Hiển thị ${startIndex} - ${endIndex} of ${this.channelTotal} kết quả</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <ul class="pagination-list" style="display: flex; list-style: none; padding: 0; margin: 0; gap: 4px;">
              <li><a href="#" class="page-nav ${this.channelCurrentPage === 1 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.channelCurrentPage > 1) { this.channelCurrentPage--; this.loadChannels(); } }}>&lt;</a></li>
              <li><a href="#" class="active" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 4px; text-decoration: none; background: #0a73db; color: white; font-size: 13px;">${this.channelCurrentPage}</a></li>
              <li><a href="#" class="page-nav ${this.channelCurrentPage >= totalPages || totalPages === 0 ? 'disabled' : ''}" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 4px; text-decoration: none; color: #374151; font-size: 13px;"
                     @click=${(e: Event) => { e.preventDefault(); if (this.channelCurrentPage < totalPages) { this.channelCurrentPage++; this.loadChannels(); } }}>&gt;</a></li>
            </ul>
            <select class="page-size-select" style="padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background: white; cursor: pointer; appearance: auto;" .value=${String(this.channelPageSize)}
                    @change=${(e: Event) => { this.channelPageSize = Number((e.target as HTMLSelectElement).value); this.channelCurrentPage = 1; this.loadChannels(); }}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      ${this.renderChannelModal()}
      ${this.renderChannelCreateModal()}
      ${this.renderChannelDeleteModal()}
    `
  }

  // Channel API methods
  private async loadChannels(): Promise<void> {
    this.isChannelLoading = true
    try {
      const filterDTO = {
        page: this.channelCurrentPage,
        size: this.channelPageSize,
        keyWord: this.channelSearchQuery?.trim() || undefined
      }
      const response = await manager.rest.api.ChannelResource.getAllWarningMicroIP(filterDTO as any)
      this.channelItems = (response?.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        sourceId: item.source_id,
        sourceName: item.source_name,
        description: item.description,
        createdBy: item.created_by,
        createdAt: item.created_at,
        realmName: item.realm_name
      }))
      this.channelTotal = this.channelItems.length
      console.log('[Channel] Loaded:', this.channelItems.length, 'items')
    } catch (error) {
      console.error('[Channel] Error loading:', error)
      this.channelItems = []
      this.channelTotal = 0
    } finally {
      this.isChannelLoading = false
    }
  }

  private async handleChannelSearch(): Promise<void> {
    this.channelCurrentPage = 1
    await this.loadChannels()
  }

  private openChannelCreateModal(): void {
    this.channelFormData = { name: '', sourceId: '', description: '' }
    this.isChannelCreateModalOpen = true
    // Load sources for dropdown
    this.loadSources()
  }

  private closeChannelCreateModal(): void {
    this.isChannelCreateModalOpen = false
  }

  private openChannelDetailModal(item: ChannelData): void {
    this.selectedChannel = { ...item }
    this.isChannelModalOpen = true
    // Load sources for dropdown
    this.loadSources()
  }

  private closeChannelModal(): void {
    this.isChannelModalOpen = false
    this.selectedChannel = null
  }

  private deleteChannel(item: ChannelData): void {
    this.channelFormData = item
    this.isChannelDeleteModalOpen = true
  }

  private closeChannelDeleteModal(): void {
    this.isChannelDeleteModalOpen = false
  }

  private async confirmDeleteChannel(): Promise<void> {
    try {
      await manager.rest.api.ChannelResource.removeChannel({ id: this.channelFormData.id } as any)
      this.closeChannelDeleteModal()
      await this.loadChannels()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('[Channel] Error deleting:', error)
      this.showNotification('Có lỗi xảy ra!')
      this.closeChannelDeleteModal()
    }
  }

  private async createChannel(): Promise<void> {
    if (!this.channelFormData.name) {
      this.showNotification('Vui lòng nhập tên kênh!')
      return
    }
    try {
      const payload = {
        name: this.channelFormData.name,
        source_id: this.channelFormData.sourceId || '',
        description: this.channelFormData.description || ''
      }
      await manager.rest.api.ChannelResource.createChannel(payload as any)
      this.closeChannelCreateModal()
      await this.loadChannels()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('[Channel] Error creating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async updateChannel(): Promise<void> {
    if (!this.selectedChannel?.name) {
      this.showNotification('Vui lòng nhập tên kênh!')
      return
    }
    try {
      const payload = {
        id: this.selectedChannel.id,
        name: this.selectedChannel.name,
        source_id: this.selectedChannel.sourceId || '',
        description: this.selectedChannel.description || ''
      }
      await manager.rest.api.ChannelResource.updateChannel(payload as any)
      this.closeChannelModal()
      await this.loadChannels()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('[Channel] Error updating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  // Channel Modals
  private renderChannelModal(): TemplateResult | null {
    if (!this.isChannelModalOpen || !this.selectedChannel) return null

    return html`
      <div class="modal-overlay" @click=${this.closeChannelModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeChannelModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.selectedChannel.name || ''}
                       @input=${(e: Event) => { if (this.selectedChannel) this.selectedChannel = { ...this.selectedChannel, name: (e.target as HTMLInputElement).value } }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Nguồn <span class="required">*</span></label>
                <select class="form-input"
                        .value=${this.selectedChannel.sourceId || ''}
                        @change=${(e: Event) => { if (this.selectedChannel) this.selectedChannel = { ...this.selectedChannel, sourceId: (e.target as HTMLSelectElement).value } }}>
                  <option value="">Chọn nguồn</option>
                  ${this.sourceItems.map(s => html`<option value="${s.id}">${s.name}</option>`)}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5"
                          .value=${this.selectedChannel.description || ''}
                          @input=${(e: Event) => { if (this.selectedChannel) this.selectedChannel = { ...this.selectedChannel, description: (e.target as HTMLTextAreaElement).value } }}></textarea>
              </div>
            </div>
          </div>
          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateChannel()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeChannelModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderChannelCreateModal(): TemplateResult | null {
    if (!this.isChannelCreateModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeChannelCreateModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="micro-modal-header" style="border-bottom: none; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</span>
            </div>
            <button class="micro-refresh-btn" @click=${this.closeChannelCreateModal}>
              <or-icon icon="close"></or-icon>
            </button>
          </div>
          <div style="padding: 20px 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tên <span class="required">*</span></label>
                <input type="text" class="form-input" placeholder="Nhập tiêu đề"
                       .value=${this.channelFormData.name || ''}
                       @input=${(e: Event) => this.channelFormData = { ...this.channelFormData, name: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Nguồn <span class="required">*</span></label>
                <select class="form-input"
                        .value=${this.channelFormData.sourceId || ''}
                        @change=${(e: Event) => this.channelFormData = { ...this.channelFormData, sourceId: (e.target as HTMLSelectElement).value }}>
                  <option value="">Chọn nguồn</option>
                  ${this.sourceItems.map(s => html`<option value="${s.id}">${s.name}</option>`)}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="5"
                          .value=${this.channelFormData.description || ''}
                          @input=${(e: Event) => this.channelFormData = { ...this.channelFormData, description: (e.target as HTMLTextAreaElement).value }}></textarea>
              </div>
            </div>
          </div>
          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.createChannel()}>
              <or-icon icon="content-save"></or-icon>
              Thêm
            </button>
            <button class="modal-btn danger" @click=${this.closeChannelCreateModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderChannelDeleteModal(): TemplateResult | null {
    if (!this.isChannelDeleteModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeChannelDeleteModal}>
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: center; align-items: center; position: relative;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white; text-align: center;">Xác nhận</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px; position: absolute; right: 16px;" @click=${this.closeChannelDeleteModal}>
              <or-icon icon="close" style="color: white; font-size: 20px;"></or-icon>
            </button>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Bạn có chắc chắn muốn xóa <strong style="color: #111827;">${this.channelFormData?.name || ''}</strong> này?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 8px 24px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${this.closeChannelDeleteModal}>
                Hủy
              </button>
              <button style="padding: 8px 24px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${() => this.confirmDeleteChannel()}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // ============ RELAY (TIẾP SÓNG) API METHODS ============
  private async loadRelays(): Promise<void> {
    this.isRelayLoading = true
    try {
      const filterDTO = {
        page: this.relayCurrentPage,
        size: this.relayPageSize,
        keyWord: this.relaySearchQuery?.trim() || undefined
      }
      const response = await manager.rest.api.LiveStreamChannelResource.getLiveStreamChannels(filterDTO as any)
      this.relayItems = (response?.data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        isShare: item.isShare,
        areaId: item.areaId,
        description: item.description,
        sourceId: item.sourceId,
        channelId: item.channelId,
        status: item.status,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        realmName: item.realmName
      }))
      this.relayTotal = this.relayItems.length
      console.log('[Relay] Loaded:', this.relayItems.length, 'items')
    } catch (error) {
      console.error('[Relay] Error loading:', error)
      this.relayItems = []
      this.relayTotal = 0
    } finally {
      this.isRelayLoading = false
    }
  }

  private async handleRelaySearch(): Promise<void> {
    this.relayCurrentPage = 1
    await this.loadRelays()
  }

  private openRelayCreateModal(): void {
    this.relayFormData = { title: '', url: '', isShare: false, description: '', sourceId: '', channelId: '', areaId: '' }
    this.isRelayCreateModalOpen = true
    // Load sources, channels and areas for dropdowns
    this.loadSources()
    this.loadChannels()
    this.loadAreaItems()
  }

  private closeRelayCreateModal(): void {
    this.isRelayCreateModalOpen = false
  }

  private openRelayDetailModal(item: LiveStreamData): void {
    this.selectedRelay = { ...item }
    this.isRelayDetailModalOpen = true
  }

  private closeRelayDetailModal(): void {
    this.isRelayDetailModalOpen = false
    this.selectedRelay = null
  }

  private deleteRelay(item: LiveStreamData): void {
    this.relayItemToDelete = item
    this.isRelayDeleteModalOpen = true
  }

  private closeRelayDeleteModal(): void {
    this.isRelayDeleteModalOpen = false
    this.relayItemToDelete = null
  }

  private async confirmDeleteRelay(): Promise<void> {
    if (!this.relayItemToDelete) return
    try {
      await manager.rest.api.LiveStreamChannelResource.deleteLiveStreamChannel({ id: this.relayItemToDelete.id } as any)
      this.closeRelayDeleteModal()
      await this.loadRelays()
      this.showNotification('Xóa thành công!')
    } catch (error) {
      console.error('[Relay] Error deleting:', error)
      this.showNotification('Có lỗi xảy ra!')
      this.closeRelayDeleteModal()
    }
  }

  private async createRelay(): Promise<void> {
    if (!this.relayFormData.title) {
      this.showNotification('Vui lòng nhập tiêu đề!')
      return
    }
    try {
      const payload = {
        title: this.relayFormData.title,
        url: this.relayFormData.url || '',
        isShare: this.relayFormData.isShare || false,
        description: this.relayFormData.description || '',
        sourceId: this.relayFormData.sourceId || '',
        channelId: this.relayFormData.channelId || '',
        areaId: this.relayFormData.areaId || '',
        status: 1
      }
      await manager.rest.api.LiveStreamChannelResource.createLiveStreamChannel(payload as any)
      this.closeRelayCreateModal()
      await this.loadRelays()
      this.showNotification('Tạo mới thành công!')
    } catch (error) {
      console.error('[Relay] Error creating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  private async updateRelay(): Promise<void> {
    if (!this.selectedRelay?.title) {
      this.showNotification('Vui lòng nhập tiêu đề!')
      return
    }
    try {
      const payload = {
        id: this.selectedRelay.id,
        title: this.selectedRelay.title,
        url: this.selectedRelay.url || '',
        isShare: this.selectedRelay.isShare || false,
        description: this.selectedRelay.description || '',
        status: this.selectedRelay.status
      }
      await manager.rest.api.LiveStreamChannelResource.updateLiveStreamChannel(payload as any)
      this.closeRelayDetailModal()
      await this.loadRelays()
      this.showNotification('Cập nhật thành công!')
    } catch (error) {
      console.error('[Relay] Error updating:', error)
      this.showNotification('Có lỗi xảy ra!')
    }
  }

  // ============ RELAY MODALS ============
  private renderRelayCreateModal(): TemplateResult | null {
    if (!this.isRelayCreateModalOpen) return null

    return html`
      <div class="modal-overlay" @click=${this.closeRelayCreateModal}>
        <div class="modal-content" style="max-width: 900px; width: 95%; padding: 0; overflow: hidden; background: white; border-radius: 8px;" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Header -->
          <div style="background: white; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">THÔNG TIN CHI TIẾT</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px;">
              <or-icon icon="refresh" style="color: #6b7280;"></or-icon>
            </button>
          </div>
          
          <!-- Body -->
          <div style="padding: 20px 24px;">
            <!-- Row 1: Khu vực (full width) -->
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">Khu vực <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box; background: white; appearance: auto;"
                      .value=${this.relayFormData.areaId || ''}
                      @change=${(e: Event) => this.relayFormData = { ...this.relayFormData, areaId: (e.target as HTMLSelectElement).value }}>
                <option value="">Chọn khu vực</option>
                ${this.areaItems.map(a => html`<option value="${a.id}">${a.name}</option>`)}
              </select>
            </div>

            <!-- Row 2: Tiêu đề, URL, Dùng chung -->
            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; margin-bottom: 16px; align-items: end;">
              <div>
                <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">Tiêu đề <span style="color: red;">*</span></label>
                <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box;" placeholder="Nhập tiêu đề"
                       .value=${this.relayFormData.title || ''}
                       @input=${(e: Event) => this.relayFormData = { ...this.relayFormData, title: (e.target as HTMLInputElement).value }} />
              </div>
              <div>
                <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">URL <span style="color: red;">*</span></label>
                <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box;" placeholder="Nhập link"
                       .value=${this.relayFormData.url || ''}
                       @input=${(e: Event) => this.relayFormData = { ...this.relayFormData, url: (e.target as HTMLInputElement).value }} />
              </div>
              <div style="padding-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #374151; white-space: nowrap;">
                  <input type="checkbox" style="width: 16px; height: 16px;"
                         .checked=${this.relayFormData.isShare || false}
                         @change=${(e: Event) => this.relayFormData = { ...this.relayFormData, isShare: (e.target as HTMLInputElement).checked }} />
                  Dùng chung
                </label>
              </div>
            </div>

            <!-- Row 3: Nguồn, Kênh -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">Nguồn <span style="color: red;">*</span></label>
                <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box; background: white; appearance: auto;"
                        .value=${this.relayFormData.sourceId || ''}
                        @change=${(e: Event) => this.relayFormData = { ...this.relayFormData, sourceId: (e.target as HTMLSelectElement).value }}>
                  <option value="">Chọn nguồn</option>
                  ${this.sourceItems.map(s => html`<option value="${s.id}">${s.name}</option>`)}
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">Kênh <span style="color: red;">*</span></label>
                <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box; background: white; appearance: auto;"
                        .value=${this.relayFormData.channelId || ''}
                        @change=${(e: Event) => this.relayFormData = { ...this.relayFormData, channelId: (e.target as HTMLSelectElement).value }}>
                  <option value="">Chọn kênh</option>
                  ${this.channelItems.map(c => html`<option value="${c.id}">${c.name}</option>`)}
                </select>
              </div>
            </div>

            <!-- Row 4: Ghi chú -->
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151;">Ghi chú</label>
              <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box; resize: vertical;" rows="4"
                        .value=${this.relayFormData.description || ''}
                        @input=${(e: Event) => this.relayFormData = { ...this.relayFormData, description: (e.target as HTMLTextAreaElement).value }}></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div style="display: flex; justify-content: center; gap: 12px; padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
            <button style="background: #0a73db; color: white; border: none; padding: 10px 28px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;" @click=${() => this.createRelay()}>
              <or-icon icon="content-save" style="font-size: 16px;"></or-icon>
              Thêm
            </button>
            <button style="background: white; color: #dc2626; border: 1px solid #dc2626; padding: 10px 28px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;" @click=${this.closeRelayCreateModal}>
              <or-icon icon="close" style="font-size: 16px;"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderRelayDeleteModal(): TemplateResult | null {
    if (!this.isRelayDeleteModalOpen || !this.relayItemToDelete) return null

    return html`
      <div class="modal-overlay" @click=${this.closeRelayDeleteModal}>
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: center; align-items: center; position: relative;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white; text-align: center;">Xác nhận</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px; position: absolute; right: 16px;" @click=${this.closeRelayDeleteModal}>
              <or-icon icon="close" style="color: white; font-size: 20px;"></or-icon>
            </button>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Bạn có chắc chắn muốn xóa <strong style="color: #111827;">${this.relayItemToDelete?.title || ''}</strong> này?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button style="padding: 8px 24px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${this.closeRelayDeleteModal}>
                Hủy
              </button>
              <button style="padding: 8px 24px; border: none; background: #22c55e; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;" @click=${() => this.confirmDeleteRelay()}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private renderRelayModal(): TemplateResult | null {
    if (!this.isRelayDetailModalOpen || !this.selectedRelay) return null

    return html`
      <div class="modal-overlay" @click=${this.closeRelayDetailModal}>
        <div class="modal-content" style="max-width: 600px; padding: 0; overflow: hidden;" @click=${(e: Event) => e.stopPropagation()}>
          <div style="background: #0a73db; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white;">Chi tiết tiếp sóng</h3>
            <button style="background: transparent; border: none; cursor: pointer; padding: 4px;" @click=${this.closeRelayDetailModal}>
              <or-icon icon="close" style="color: white;"></or-icon>
            </button>
          </div>
          <div class="micro-modal-body" style="padding: 24px;">
            <div class="form-row">
              <div class="form-group full-width">
                <label>Tiêu đề <span style="color: red;">*</span></label>
                <input type="text" class="form-input"
                       .value=${this.selectedRelay.title || ''}
                       @input=${(e: Event) => this.selectedRelay = { ...this.selectedRelay!, title: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>URL</label>
                <input type="text" class="form-input"
                       .value=${this.selectedRelay.url || ''}
                       @input=${(e: Event) => this.selectedRelay = { ...this.selectedRelay!, url: (e.target as HTMLInputElement).value }} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox"
                         .checked=${this.selectedRelay.isShare || false}
                         @change=${(e: Event) => this.selectedRelay = { ...this.selectedRelay!, isShare: (e.target as HTMLInputElement).checked }} />
                  Dùng chung
                </label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Trạng thái</label>
                <select class="form-input"
                        .value=${String(this.selectedRelay.status || 1)}
                        @change=${(e: Event) => this.selectedRelay = { ...this.selectedRelay!, status: Number((e.target as HTMLSelectElement).value) }}>
                  <option value="1">Đang sử dụng</option>
                  <option value="0">Ngưng sử dụng</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Mô tả</label>
                <textarea class="form-textarea" rows="4"
                          .value=${this.selectedRelay.description || ''}
                          @input=${(e: Event) => this.selectedRelay = { ...this.selectedRelay!, description: (e.target as HTMLTextAreaElement).value }}></textarea>
              </div>
            </div>
          </div>
          <div class="micro-modal-footer">
            <button class="modal-btn primary" @click=${() => this.updateRelay()}>
              <or-icon icon="content-save"></or-icon>
              Cập nhật
            </button>
            <button class="modal-btn danger" @click=${this.closeRelayDetailModal}>
              <or-icon icon="close"></or-icon>
              Hủy
            </button>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "admin-catalog-tab": AdminCatalogTab
  }
}
