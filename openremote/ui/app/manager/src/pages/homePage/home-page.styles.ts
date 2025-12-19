import { css } from "lit";

export const homePageStyles = css`
  :host {
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: #f5f7fa;
    font-family: Arial, sans-serif;
  }

  /* ========== PAGE ========== */
  .page {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    gap: 16px;
  }

  /* ========== SIDEBAR ========== */
  .sidepanel {
    width: 15%;
    background: #fff;
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
  }

  .sidepanel-header {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .sidepanel-search {
    position: relative;
    margin-bottom: 12px;
  }

  .sidepanel-search input {
    width: 80%;
    padding: 8px 32px 8px 10px;
    border-radius: 6px;
    border: 1px solid #d9d9d9;
    outline: none;
  }

  .icon-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
  }

  ul.tree-root {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  ul.tree-children {
    list-style: none;
    padding: 0;
    margin-left: 10px;
  }

  .tree-item {
    margin: 4px 0;
  }

  .tree-row {
    display: flex;
    align-items: center;
    padding: 6px 8px 6px 0;
    border-radius: 4px;
    cursor: pointer;
    gap: 6px;
  }

  .tree-row:hover {
    background: #f0f5ff;
  }

  .caret {
    width: 16px;
  }

  .spacer {
    display: inline-block;
    width: 16px;
  }

  .tree-label {
    font-size: 14px;
  }

  /* ========== CONTENT ========== */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 6px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .headerHomepage {
    display: flex;
    padding: 15px;
    gap: 10px;
  }

  .equipmentInformation {
    width: 10%;
    padding: 5px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .txtEquipment {
    padding: 0;
    margin: 0;
  }

  /* Container */
  .content-tables {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

   /* ========== Bảng thiết bị ========== */
  .device-wrapper {
    flex: 1;
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    box-sizing: border-box;
    overflow-x: auto;
  }

  .device-wrapper h2 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .table-responsive-wrapper{
    width: 100%;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .table-responsive-wrapper table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .table-responsive-wrapper th {
    background-color: #a8dcfd;
    color: #000000ff;
  }

  .table-responsive-wrapper th,
  .table-responsive-wrapper td,
  .schedule-table-wrapper th,
  .schedule-table-wrapper td {
    height: 40px;
    line-height: 40px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    padding: 0 12px;
    text-align: center;
  }

  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  tr:hover {
    background: #f9f9f9;
  }

  /* Action buttons */
  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }

  .edit {
    background: #1890ff;
    color: white;
    margin-right: 6px;
  }

  .delete {
    background: #ff4d4f;
    color: white;
  }

  .empty-state {
    padding: 30px 0;
    color: #888;
  }

  /* --- OVERLAY --- */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  /* --- POPUP BOX --- */
  .popup-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    background: #fff;
    padding: 12px;
    border-radius: 10px;
    z-index: 1001;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }

  /* --- HEADER --- */
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .popup-header h2 {
    font-size: 16px;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  .popup-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .popup-content table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .popup-content th {
    background-color: #a8dcfd;
    color: #000000ff;
    height: 40px;
    line-height: 40px;
    border: 1px solid #ddd;
    text-align: center;
  }

  /* Row cells */
  .popup-content td {
    height: 40px;
    line-height: 40px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    padding: 0 12px;
    text-align: center;
  }

   /* ========== Thao tac radiobutton ========== */
  .row-menu {
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 999;
    left: 0; /* căn trái */
    margin-top: 4px;
  }

  .row-menu label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    cursor: pointer;
  }

  .context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 9999;
  }

  /* edit volune */
  .volume-popup {
    width: 450px;
    text-align: center;
  }

  .volume-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 18px;
    color: #333;
  }

  .volume-body {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 0;
    justify-content: center;
  }

  .volume-slider {
    width: 70%;
    accent-color: #1545be;
  }

  .volume-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }

  .btn-save,
  .btn-cancel {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-radius: 6px;
    border: 1px solid #ddd;
    cursor: pointer;
    background: #fff;
    font-size: 14px;
  }

  .btn-save:hover {
    background: #e3f2ff;
  }

  .btn-cancel:hover {
    background: #ffecec;
  }

  /* information equipment */
  .device-info-popup {
    width: 90%;
    max-width: 1200px;
    height: 75%;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
  }

  .popup-title {
    text-align: center;
    font-size: 20px;
    margin-bottom: 15px;
  }

  .device-info-container {
    display: flex;
    gap: 20px;
    height: 100%;
  }

  .device-info-left {
    flex: 1.2;
    font-size: 14px;
  }

  .device-info-left h4 {
    margin-top: 20px;
    margin-bottom: 8px;
    color: #1545be;
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }

  .label {
    margin-right: 10px;
    font-weight: 600;
  }

  .value {
    flex: 1;
  }

  .device-info-map {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .map-img {
    width: 100%;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .popup-actions {
    margin-top: 30px;
    display: flex;
    gap: 10px;
  }

  .btn-save,
  .btn-cancel {
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }

  .btn-save,
  .btn-cancel {
    color: #000000ff;
    border: 1px solid #504f4fff
    border-radius: 5px;
    box-shadow: 0 2px 5px #504f4fff;
  }

  // icon bút
  .action-btn.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: 0.2s;
}

.action-btn.edit-btn:hover {
  background: #e6f0ff;
  color: #1545BE;
}

 /* btn trang thai */
.icon-btn {
  background: #f3f3f3;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: 0.2s;
}

.icon-btn:hover {
  background: #e8edff;
}

.icon-btn:active {
  transform: scale(0.92);
}

.tab-btn {
  padding: 6px 12px;
  border: none;
  background: #ffffff; /* sửa #ffffffff -> #ffffff */
  cursor: pointer;
  font-size: 17px;
  font-weight: 500;
  position: relative;
}

.tab-btn:hover {
  color: #1545BE;
}

.tab-btn[active] {
  color: #1545BE;
}

.tab-btn[active]::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #1545BE;
}

  @media (max-width: 1024px) {
    .content-tables {
      flex-direction: column;
    }
    .schedule-wrapper,
    .device-wrapper {
      max-width: 100%;
      flex: 1;
    }
  }
`;
