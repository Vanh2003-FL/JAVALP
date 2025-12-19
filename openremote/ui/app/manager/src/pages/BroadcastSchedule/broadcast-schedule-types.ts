// TypeScript interfaces for Broadcast Schedule feature (Lịch phát loa phường)

export interface BroadcastSchedule {
    id: string;
    name: string;                    // Tên bản tin
    type: ScheduleType;              // Loại phát
    deviceCount: number;             // Số thiết bị
    areaCount: number;               // Số khu vực
    startDateTime: string;           // Ngày giờ bắt đầu
    endDateTime: string;             // Ngày giờ kết thúc
    status: ScheduleStatus;          // Tình trạng
    areas: AreaInfo[];               // Danh sách khu vực
    createdBy: string;               // Người tạo
    createdAt: string;               // Ngày tạo
    approvedBy?: string;             // Người duyệt
    approvedAt?: string;             // Ngày duyệt
    priority: PriorityLevel;         // Mức độ ưu tiên
    contentType: ContentSourceType;  // Loại nội dung
}

export type ScheduleType = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'always';
export type ScheduleStatus = 'pending' | 'approved' | 'rejected';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type ContentSourceType = 'playlist' | 'file' | 'relay';
export type PlaybackStatus = 'played' | 'cancelled';

export interface AreaInfo {
    id: string;
    name: string;
}

export interface DeviceTreeNode {
    id: string;
    name: string;
    type: 'city' | 'district' | 'ward' | 'cluster' | 'device';
    children?: DeviceTreeNode[];
    checked?: boolean;
    expanded?: boolean;
}

export interface PlaylistItem {
    id: string;
    name: string;
    duration: string;
    playCount: number;
}

export interface ContentFile {
    id: string;
    name: string;
    duration: string;
    format: string;
    playCount: number;
}

export interface RelayStation {
    id: string;
    name: string;
    url: string;
}

export interface TimeSlotConfig {
    id: string;
    startTime: string;
    endTime: string;
    volume: number;       // 0-100
}

export interface ScheduleFormData {
    name: string;
    type: ScheduleType;
    selectedDays: number[];        // 0-6 for Sun-Sat, or 1-31 for monthly
    startDate: string;
    endDate: string;
    devices: string[];             // Device IDs
    contentSource: ContentSourceType;
    playlists?: PlaylistItem[];
    files?: ContentFile[];
    relay?: RelayStation;
    priority: PriorityLevel;
    field: string;                 // Lĩnh vực
    bitrate: number;               // Tốc độ phát (kbps)
    timeSlots: TimeSlotConfig[];
}

export interface PlaybackHistory {
    id: string;
    name: string;                  // Tên bản tin
    contentType: ContentSourceType;
    priority: PriorityLevel;
    deviceName: string;
    startDateTime: string;
    endDateTime: string;
    status: PlaybackStatus;
    area: string;
    createdBy: string;
    createdAt: string;
}

// Calendar event for views
export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: ScheduleStatus;
    date: string;
}
