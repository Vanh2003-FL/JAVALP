# SCHEDULE HISTORY API DOCUMENTATION

API READ-ONLY cho xem Lịch sử phát (Schedule History)

**⚠️ LƯU Ý:** Đây là API READ-ONLY (chỉ xem), KHÔNG CÓ tạo/sửa/xóa vì lịch sử không nên thay đổi.

---

## 📡 BASE URL & ENDPOINTS

**Base URL:** `http://localhost:8080/api/master`

**Resource Path:** `/schedule-history`

---

## 🔑 AUTHENTICATION

Tất cả endpoints yêu cầu Bearer Token authentication (hiện đang tạm thời comment out để test).

---

## 📊 DATA MODEL

```typescript
interface ScheduleHistory {
  id: string;                    // UUID
  scheduleId: string;            // ID của lịch phát
  status: number;                // Trạng thái (0=chưa phát, 1=đang phát, 2=đã phát, 3=hủy)
  description: string | null;    // Mô tả/Ghi chú
  createdBy: string;             // User tạo
  createdAt: string;             // Thời gian tạo
  updatedBy: string;             // User cập nhật
  updatedAt: string;             // Thời gian cập nhật
  realmName: string;             // Realm
  isDeleted: boolean;            // Đã xóa chưa
}
```

---

## 1️⃣ GET LIST - Lấy danh sách lịch sử

```http
POST /schedule-history/get
Content-Type: application/json
```

### Request Body:

```json
{
  "keyword": "test",
  "status": 2,
  "scheduleId": "550e8400-e29b-41d4-a716-446655440001",
  "page": 0,
  "size": 10
}
```

**Parameters:**
- `keyword` (string, optional): Tìm kiếm trong mô tả
- `status` (integer, optional): Lọc theo trạng thái (0/1/2/3)
- `scheduleId` (string, optional): Lọc theo ID lịch phát
- `page` (integer, optional): Trang hiện tại (default: 0)
- `size` (integer, optional): Số lượng/trang (default: 10)

### Response 200 OK:

```json
{
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "scheduleId": "550e8400-e29b-41d4-a716-446655440001",
      "status": 2,
      "description": "Phát thành công lịch 01",
      "createdBy": "admin",
      "createdAt": "2025-12-19T10:00:00",
      "updatedBy": "admin",
      "updatedAt": "2025-12-19T10:30:00",
      "realmName": "master",
      "isDeleted": false
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "scheduleId": "550e8400-e29b-41d4-a716-446655440002",
      "status": 1,
      "description": "Đang phát lịch 02",
      "createdBy": "admin",
      "createdAt": "2025-12-19T11:00:00",
      "updatedBy": "admin",
      "updatedAt": "2025-12-19T11:00:00",
      "realmName": "master",
      "isDeleted": false
    }
  ],
  "total": 25
}
```

---

## 2️⃣ GET BY ID - Lấy chi tiết lịch sử

```http
POST /schedule-history/get-by-id
Content-Type: application/json
```

### Request Body:

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001"
}
```

### Response 200 OK:

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "scheduleId": "550e8400-e29b-41d4-a716-446655440001",
  "status": 2,
  "description": "Phát thành công lịch 01",
  "createdBy": "admin",
  "createdAt": "2025-12-19T10:00:00",
  "updatedBy": "admin",
  "updatedAt": "2025-12-19T10:30:00",
  "realmName": "master",
  "isDeleted": false
}
```

### Response 404 Not Found:

```json
{
  "error": "Not Found",
  "message": "Schedule history not found",
  "status": 404
}
```

---

## 📊 STATUS VALUES

| Value | Description |
|-------|-------------|
| 0 | Chưa phát |
| 1 | Đang phát |
| 2 | Đã phát |
| 3 | Đã hủy |

---

## 🔥 FRONTEND REST CLIENT USAGE

### TypeScript/JavaScript

```typescript
import rest from "@openremote/rest";

// GET List
const response = await rest.api.ScheduleHistoryResource.getScheduleHistories({
  keyword: "test",
  status: 2,
  scheduleId: "550e8400-e29b-41d4-a716-446655440001",
  page: 0,
  size: 10
});

const histories = response.data.data;
const total = response.data.total;
```

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import rest from "@openremote/rest";

export const ScheduleHistoryList: React.FC = () => {
  const [histories, setHistories] = useState<ScheduleHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const loadHistories = async () => {
    setLoading(true);
    try {
      const response = await rest.api.ScheduleHistoryResource.getScheduleHistories({
        status: statusFilter,
        page,
        size: 10
      });
      setHistories(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to load histories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistories();
  }, [page, statusFilter]);

  return (
    <div className="history-list">
      {/* Status Filter */}
      <select value={statusFilter || ""} onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Tất cả trạng thái</option>
        <option value="0">Chưa phát</option>
        <option value="1">Đang phát</option>
        <option value="2">Đã phát</option>
        <option value="3">Đã hủy</option>
      </select>

      {loading && <div>Loading...</div>}
      <table>
        <thead>
          <tr>
            <th>Schedule ID</th>
            <th>Status</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{history.scheduleId}</td>
              <td>{getStatusLabel(history.status)}</td>
              <td>{history.description}</td>
              <td>{history.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button disabled={(page + 1) * 10 >= total} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
      <p>Total: {total} histories</p>
    </div>
  );
};

function getStatusLabel(status: number): string {
  switch (status) {
    case 0: return "Chưa phát";
    case 1: return "Đang phát";
    case 2: return "Đã phát";
    case 3: return "Đã hủy";
    default: return "Unknown";
  }
}
```

---

## 📝 MOCK DATA EXAMPLES

```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "scheduleId": "550e8400-e29b-41d4-a716-446655440001",
    "status": 2,
    "description": "Phát thành công lịch thông báo buổi sáng",
    "createdBy": "admin",
    "createdAt": "2025-12-19T07:00:00",
    "updatedBy": "admin",
    "updatedAt": "2025-12-19T07:30:00",
    "realmName": "master",
    "isDeleted": false
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440002",
    "scheduleId": "550e8400-e29b-41d4-a716-446655440002",
    "status": 2,
    "description": "Phát lịch thông báo chiều thành công",
    "createdBy": "admin",

// GET by ID
const detail = await rest.api.ScheduleHistoryResource.getById({
  id: "650e8400-e29b-41d4-a716-446655440001"
});

// COUNT
const countResult = await rest.api.ScheduleHistoryResource.countScheduleHistories({
  status: 2
});
console.log(`Total: ${countResult.data.total}`);
    "createdAt": "2025-12-19T14:00:00",
    "updatedBy": "admin",
    "updatedAt": "2025-12-19T14:30:00",
    "realmName": "master",
    "isDeleted": false
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440003",
    "scheduleId": "550e8400-e29b-41d4-a716-446655440003",
    "status": 3,
    "description": "Hủy lịch phát do lỗi thiết bị",
    "createdBy": "admin",
    "createdAt": "2025-12-19T16:00:00",
    "updatedBy": "admin",
    "updatedAt": "2025-12-19T16:05:00",
    "realmName": "master",
    "isDeleted": false
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440004",
    "scheduleId": "550e8400-e29b-41d4-a716-446655440004",
    "status": 1,
    "description": "Đang phát lịch khẩn cấp",
    "createdBy": "admin",
    "createdAt": "2025-12-19T18:00:00",
    "updatedBy": "admin",
    "updatedAt": "2025-12-19T18:00:00",
    "realmName": "master",
    "isDeleted": false
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440005",
    "scheduleId": "550e8400-e29b-41d4-a716-446655440005",
    "status": 0,
    "description": "Chờ phát lịch tối",
    "createdBy": "admin",
    "createdAt": "2025-12-19T19:00:00",
    "updatedBy": "admin",
    "updatedAt": "2025-12-19T19:00:00",
    "realmName": "master",
    "isDeleted": false
  }
]
```

---

## ⚠️ ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Schedule ID is required",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "status": 401
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Schedule history not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "status": 500
}
```

---

## 📌 SUMMARY

**REST Client Class:** `rest.api.ScheduleHistoryResource`

**Available Methods:**
1. `getScheduleHistories(params)` - GET list with filters
2. `getById({ id })` - GET by ID
3. `create(history)` - CREATE new
4. `update(history)` - UPDATE existing
5. `deleteScheduleHistory({ id })` - DELETE (soft)
6. `countScheduleHistories(params)` - COUNT with filters

**Auto-managed fiel (READ-ONLY):**
1. `getScheduleHistories(params)` - GET list with filters & pagination
2. `getById({ id })` - GET by ID
3. `countScheduleHistories(params)` - COUNT with filters

**Filter Options:**
- `keyword` - Tìm kiếm trong description
- `status` - Lọc theo trạng thái (0/1/2/3)
- `scheduleId` - Lọc theo ID lịch phát
- `page`, `size` - Pagination

**Status Values:**
- `0` - Chưa phát
- `1` - Đang phát
- `2` - Đã phát
- `3` - Đã hủy

**⚠️ Quan trọng:**
- Đây là API READ-ONLY (chỉ xem lịch sử)
- KHÔNG có create/update/delete vì lịch sử không nên thay đổi
- Dữ liệu lịch sử được hệ thống tự động tạo khi phát lịch
