import { css } from "lit";

export const rapportPageStyles = css`
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

  .value {
    flex: 1;
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

.search-header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.search-input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 6px 14px;
  background: #1545BE;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.search-btn:hover {
  background: #0f3795;
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
