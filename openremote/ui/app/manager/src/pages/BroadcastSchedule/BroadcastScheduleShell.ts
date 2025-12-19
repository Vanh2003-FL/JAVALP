import { LitElement, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { broadcastScheduleStyles } from "./broadcast-schedule.styles";
import { BroadcastSchedule, DeviceTreeNode, ScheduleStatus } from "./broadcast-schedule-types";
import "@openremote/or-icon";

@customElement("broadcast-schedule-shell")
export class BroadcastScheduleShell extends LitElement {
    static styles = broadcastScheduleStyles;

    // Sub-tab state
    @state() private activeSubTab: 'manage' | 'approve' | 'history' = 'manage';

    // View mode: list or calendar
    @state() private viewMode: 'list' | 'calendar' = 'list';
    @state() private calendarView: 'day' | 'week' | 'month' = 'week';

    // Approval sub-tab
    @state() private approvalTab: 'pending' | 'approved' = 'pending';

    // Device tree
    @state() private selectedDevice: string | null = null;
    @state() private expandedDevices: Set<string> = new Set(['hanoi']);

    // Action menus
    @state() private openActionMenu: string | null = null;

    // Modals
    @state() private showCreateModal: boolean = false;

    // Create Modal States
    @state() private createScheduleType: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'always' = 'weekly';
    @state() private createWeekDays: Set<string> = new Set(['T3']);
    @state() private createMonthDays: string[] = [];
    @state() private createStartDate: string = '';
    @state() private createEndDate: string = '';
    @state() private createSettingsTab: 'device' | 'content' | 'time' = 'device';
    @state() private createContentSource: 'playlist' | 'file' | 'relay' = 'playlist';
    @state() private createSelectedDevices: { id: string; level: string; name: string; area: string }[] = [
        { id: '1', level: 'Thiết bị', name: 'Cụm 01', area: 'Phường Mộ Lao, Thành phố Hà Nội' }
    ];
    @state() private createSelectedContents: { id: string; name: string; count: number; duration: string }[] = [
        { id: '1', name: 'Danh sách bản tin', count: 1, duration: '00:15:00' }
    ];
    @state() private createTimeSlots: { id: string; startTime: string; endTime: string; volume: number }[] = [
        { id: '1', startTime: '', endTime: '', volume: 50 }
    ];
    @state() private createPriority: string = '';
    @state() private createField: string = '';
    @state() private createBitrate: string = '64 kbps';
    @state() private createModalExpandedDevices: Set<string> = new Set(['hanoi', 'badinh']);
    @state() private createModalSelectedDeviceIds: Set<string> = new Set(['cum1']);
    @state() private showSelectionSidebar: boolean = false;

    // Calendar date
    @state() private currentDate: Date = new Date();

    // Mock data - Devices tree
    private devices: DeviceTreeNode[] = [
        {
            id: 'hanoi',
            name: 'Thành phố Hà Nội',
            type: 'city',
            children: [
                {
                    id: 'hoankiem',
                    name: 'Phường Hoàn Kiếm',
                    type: 'ward',
                    children: [
                        { id: 'cum1', name: 'Cụm loa 01', type: 'cluster' },
                        { id: 'cum2', name: 'Cụm loa 02', type: 'cluster' },
                        { id: 'cum3', name: 'Cụm loa 03', type: 'cluster' },
                    ]
                },
                {
                    id: 'badinh',
                    name: 'Phường Ba Đình',
                    type: 'ward',
                    children: [
                        { id: 'cum4', name: 'Cụm loa 01', type: 'cluster' },
                        { id: 'cum5', name: 'Cụm loa 02', type: 'cluster' },
                        { id: 'cum6', name: 'Cụm loa 03', type: 'cluster' },
                    ]
                }
            ]
        }
    ];

    // Mock data - Schedules
    private schedules: BroadcastSchedule[] = [
        {
            id: '1',
            name: 'Phường Mộ Lao',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 1,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'approved',
            areas: [{ id: '1', name: 'Khu vực' }],
            createdBy: 'Nguyễn Văn A',
            createdAt: '15/10/2025 00:00',
            approvedBy: 'Nguyễn Văn A',
            approvedAt: '15/10/2025 00:00',
            priority: 'medium',
            contentType: 'file'
        },
        {
            id: '2',
            name: 'Thông tin chung',
            type: 'daily',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'rejected',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            approvedBy: 'Admin',
            approvedAt: '15/10/2025 00:00',
            priority: 'low',
            contentType: 'playlist'
        },
        {
            id: '3',
            name: 'Thông tin pháp...',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 1,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'rejected',
            areas: [{ id: '1', name: 'Khu vực' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'medium',
            contentType: 'file'
        },
        {
            id: '4',
            name: '94E6865ADE04',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 1,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'approved',
            areas: [{ id: '1', name: 'Khu vực' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'high',
            contentType: 'relay'
        },
        {
            id: '5',
            name: '94E6865ADE04',
            type: 'always',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'rejected',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'low',
            contentType: 'file'
        },
        {
            id: '6',
            name: '94E6865ADE04',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'approved',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'medium',
            contentType: 'playlist'
        },
        {
            id: '7',
            name: '94E6865ADE04',
            type: 'monthly',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'rejected',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'low',
            contentType: 'file'
        },
        {
            id: '8',
            name: '94E6865ADE04',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'approved',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'medium',
            contentType: 'relay'
        },
        {
            id: '9',
            name: '94E6865ADE04',
            type: 'one_time',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'approved',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'medium',
            contentType: 'file'
        },
        {
            id: '10',
            name: '94E6865ADE04',
            type: 'monthly',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'pending',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'high',
            contentType: 'playlist'
        },
        {
            id: '11',
            name: '94E6865ADE04',
            type: 'weekly',
            deviceCount: 5,
            areaCount: 2,
            startDateTime: '15/10/2025 00:00',
            endDateTime: '15/10/2025 00:00',
            status: 'pending',
            areas: [{ id: '1', name: 'Khu vực' }, { id: '2', name: 'Khu vực 2' }],
            createdBy: 'Admin',
            createdAt: '15/10/2025 00:00',
            priority: 'low',
            contentType: 'file'
        }
    ];

    protected render(): TemplateResult {
        return html`
            <div class="page" @click=${() => this.openActionMenu = null}>
                ${this.renderTopRow()}
                <div class="body-row">
                    ${this.renderDeviceSidebar()}
                    ${this.renderMainPanel()}
                </div>
            </div>
            ${this.showCreateModal ? this.renderCreateModal() : null}
        `;
    }

    private renderTopRow(): TemplateResult {
        return html`
            <div class="top-row">
                <div class="sub-tabs">
                    <div class="sub-tab ${this.activeSubTab === 'manage' ? 'active' : ''}"
                         @click=${() => this.activeSubTab = 'manage'}>
                        Quản lý lịch phát
                    </div>
                    <div class="sub-tab ${this.activeSubTab === 'approve' ? 'active' : ''}"
                         @click=${() => this.activeSubTab = 'approve'}>
                        Duyệt lịch phát
                    </div>
                    <div class="sub-tab ${this.activeSubTab === 'history' ? 'active' : ''}"
                         @click=${() => this.activeSubTab = 'history'}>
                        Lịch sử bản tin
                    </div>
                </div>
                <button class="btn-create" style="margin: 8px 0;" @click=${() => this.showCreateModal = true}>
                    <or-icon icon="plus"></or-icon>
                    TẠO LỊCH PHÁT
                </button>
            </div>
        `;
    }

    private renderDeviceSidebar(): TemplateResult {
        return html`
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-search">
                        <input type="text" placeholder="Nhập mã/ tên" />
                        <or-icon icon="magnify"></or-icon>
                    </div>
                </div>
                <div class="sidebar-tree">
                    ${this.devices.map(device => this.renderDeviceNode(device, 0))}
                </div>
            </div>
        `;
    }

    private renderDeviceNode(node: DeviceTreeNode, level: number): TemplateResult {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = this.expandedDevices.has(node.id);
        const isSelected = this.selectedDevice === node.id;

        return html`
            <div class="tree-node">
                <div class="tree-node-row ${isSelected ? 'selected' : ''}"
                     style="padding-left: ${12 + level * 16}px;"
                     @click=${() => this.selectDevice(node.id)}>
                    ${hasChildren ? html`
                        <span class="tree-toggle ${isExpanded ? 'expanded' : ''}"
                              @click=${(e: Event) => { e.stopPropagation(); this.toggleDevice(node.id); }}>
                            <or-icon icon="chevron-right"></or-icon>
                        </span>
                    ` : html`<span class="tree-toggle"></span>`}
                    <span class="tree-icon ${node.type === 'cluster' ? 'device' : ''}">
                        <or-icon icon="${node.type === 'cluster' ? 'volume-high' : 'folder'}"></or-icon>
                    </span>
                    <span>${node.name}</span>
                </div>
                ${hasChildren && isExpanded ? html`
                    <div class="tree-children">
                        ${node.children!.map(child => this.renderDeviceNode(child, level + 1))}
                    </div>
                ` : null}
            </div>
        `;
    }

    private renderMainPanel(): TemplateResult {
        switch (this.activeSubTab) {
            case 'manage':
                return this.renderManagePanel();
            case 'approve':
                return this.renderApprovePanel();
            case 'history':
                return this.renderHistoryPanel();
            default:
                return this.renderManagePanel();
        }
    }

    private renderManagePanel(): TemplateResult {
        return html`
            <div class="main-panel">
                <div class="panel-header">
                    <span class="panel-title">DANH SÁCH LỊCH PHÁT</span>
                    <div class="panel-actions">
                        <div class="view-toggle">
                            <button class="view-toggle-btn ${this.viewMode === 'list' ? 'active' : ''}"
                                    @click=${() => this.viewMode = 'list'}>
                                <or-icon icon="format-list-bulleted"></or-icon>
                            </button>
                            <button class="view-toggle-btn ${this.viewMode === 'calendar' ? 'active' : ''}"
                                    @click=${() => this.viewMode = 'calendar'}>
                                <or-icon icon="calendar"></or-icon>
                            </button>
                        </div>
                        ${this.viewMode === 'calendar' ? html`
                            <div class="calendar-tabs">
                                <button class="calendar-tab ${this.calendarView === 'day' ? 'active' : ''}"
                                        @click=${() => this.calendarView = 'day'}>NGÀY</button>
                                <button class="calendar-tab ${this.calendarView === 'week' ? 'active' : ''}"
                                        @click=${() => this.calendarView = 'week'}>TUẦN</button>
                                <button class="calendar-tab ${this.calendarView === 'month' ? 'active' : ''}"
                                        @click=${() => this.calendarView = 'month'}>THÁNG</button>
                            </div>
                        ` : null}
                    </div>
                </div>
                ${this.renderFilterRow()}
                <div class="panel-body">
                    ${this.viewMode === 'list' ? this.renderScheduleTable() : this.renderCalendarView()}
                </div>
                ${this.viewMode === 'list' ? this.renderPagination() : null}
            </div>
        `;
    }

    private renderFilterRow(): TemplateResult {
        return html`
            <div class="filter-row">
                <input type="text" class="filter-input" placeholder="Bản tin" />
                <select class="filter-select">
                    <option value="">Loại phát</option>
                    <option value="one_time">Một lần</option>
                    <option value="daily">Theo ngày</option>
                    <option value="weekly">Theo tuần</option>
                    <option value="monthly">Theo tháng</option>
                    <option value="always">Luôn luôn</option>
                </select>
                <select class="filter-select">
                    <option value="">Tình trạng</option>
                    <option value="pending">Chưa duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                </select>
                <input type="date" class="filter-input" placeholder="Từ ngày" />
                <input type="date" class="filter-input" placeholder="Đến ngày" />
                <button class="btn-search">
                    <or-icon icon="magnify"></or-icon>
                    Tìm kiếm
                </button>
            </div>
        `;
    }

    private renderScheduleTable(): TemplateResult {
        return html`
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Bản tin</th>
                            <th>Loại phát</th>
                            <th>Thiết bị</th>
                            <th>Ngày giờ bắt đầu</th>
                            <th>Ngày giờ kết thúc</th>
                            <th>Tình trạng</th>
                            <th>Khu vực</th>
                            <th>Người tạo</th>
                            <th>Ngày tạo</th>
                            <th>Người duyệt</th>
                            <th>Ngày duyệt</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.schedules.map(schedule => html`
                            <tr>
                                <td><span class="link">${schedule.name}</span></td>
                                <td>${this.getScheduleTypeLabel(schedule.type)}</td>
                                <td><span class="link">${schedule.deviceCount} thiết bị</span></td>
                                <td>${schedule.startDateTime}</td>
                                <td>${schedule.endDateTime}</td>
                                <td>${this.renderStatusBadge(schedule.status)}</td>
                                <td><span class="link">${schedule.areaCount} Khu vực</span></td>
                                <td>${schedule.createdBy}</td>
                                <td>${schedule.createdAt}</td>
                                <td>${schedule.approvedBy || ''}</td>
                                <td>${schedule.approvedAt || ''}</td>
                                <td>
                                    <div class="action-menu">
                                        <button class="btn-icon" @click=${(e: Event) => this.toggleActionMenu(e, schedule.id)}>
                                            <or-icon icon="dots-horizontal"></or-icon>
                                        </button>
                                        ${this.openActionMenu === schedule.id ? html`
                                            <div class="action-menu-dropdown" @click=${(e: Event) => e.stopPropagation()}>
                                                <button class="action-menu-item">
                                                    <or-icon icon="eye"></or-icon>
                                                    Xem chi tiết
                                                </button>
                                                <button class="action-menu-item">
                                                    <or-icon icon="pencil"></or-icon>
                                                    Sửa
                                                </button>
                                                <button class="action-menu-item">
                                                    <or-icon icon="cancel"></or-icon>
                                                    Hủy lịch
                                                </button>
                                                <button class="action-menu-item">
                                                    <or-icon icon="content-copy"></or-icon>
                                                    Copy lịch
                                                </button>
                                            </div>
                                        ` : null}
                                    </div>
                                </td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `;
    }

    private renderCalendarView(): TemplateResult {
        switch (this.calendarView) {
            case 'day':
                return this.renderDayCalendar();
            case 'week':
                return this.renderWeekCalendar();
            case 'month':
                return this.renderMonthCalendar();
            default:
                return this.renderWeekCalendar();
        }
    }

    private renderDayCalendar(): TemplateResult {
        const timeSlots = this.generateTimeSlots();
        const dateStr = this.formatDate(this.currentDate);

        return html`
            <div>
                <div class="calendar-header">
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(-1)}>
                        <or-icon icon="chevron-left"></or-icon>
                    </button>
                    <span>${dateStr}</span>
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(1)}>
                        <or-icon icon="chevron-right"></or-icon>
                    </button>
                </div>
                <div class="calendar-grid" style="grid-template-columns: 60px 1fr;">
                    <div class="calendar-day-header">Giờ</div>
                    <div class="calendar-day-header">Chương trình</div>
                    ${timeSlots.map(slot => html`
                        <div class="calendar-time-slot">
                            <div class="time-label ${slot.includes(':00') || slot.includes(':30') ? 'highlight' : ''}">${slot}</div>
                            <div class="time-content">
                                ${slot === '00:15' ? html`
                                    <div class="calendar-event">Bản tin Thành phố Hà Nội</div>
                                ` : null}
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    private renderWeekCalendar(): TemplateResult {
        const timeSlots = this.generateTimeSlots();
        const weekRange = this.getWeekRange();
        const days = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];

        return html`
            <div>
                <div class="calendar-header">
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(-7)}>
                        <or-icon icon="chevron-left"></or-icon>
                    </button>
                    <span>${weekRange}</span>
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(7)}>
                        <or-icon icon="chevron-right"></or-icon>
                    </button>
                </div>
                <div class="calendar-grid" style="grid-template-columns: 60px repeat(7, 1fr);">
                    <div class="calendar-day-header">Giờ</div>
                    ${days.map(day => html`<div class="calendar-day-header">${day}</div>`)}
                    ${timeSlots.slice(0, 12).map(slot => html`
                        <div class="time-label ${slot.includes(':00') || slot.includes(':30') ? 'highlight' : ''}">${slot}</div>
                        ${days.map((_, i) => html`
                            <div class="time-content">
                                ${slot === '00:15' && i === 0 ? html`
                                    <div class="calendar-event">Bản tin Thành phố Hà...</div>
                                ` : null}
                            </div>
                        `)}
                    `)}
                </div>
            </div>
        `;
    }

    private renderMonthCalendar(): TemplateResult {
        const monthYear = this.getMonthYear();
        const days = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];
        const calendarDays = this.generateMonthDays();

        return html`
            <div>
                <div class="calendar-header">
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(-30)}>
                        <or-icon icon="chevron-left"></or-icon>
                    </button>
                    <span>${monthYear}</span>
                    <button class="calendar-nav" @click=${() => this.navigateCalendar(30)}>
                        <or-icon icon="chevron-right"></or-icon>
                    </button>
                </div>
                <div class="month-grid">
                    ${days.map(day => html`<div class="calendar-day-header">${day}</div>`)}
                    ${calendarDays.map(day => html`
                        <div class="month-day">
                            <div class="month-day-number">${day.date}</div>
                            <div class="month-day-events">
                                ${day.events.map(evt => html`
                                    <div class="month-event ${evt.status}">${evt.time} ${evt.title}</div>
                                `)}
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    private renderPagination(): TemplateResult {
        return html`
            <div class="pagination">
                <div class="pagination-info">Hiển thị 1-15 of 250 kết quả</div>
                <div class="pagination-controls">
                    <button class="page-btn">
                        <or-icon icon="chevron-left"></or-icon>
                    </button>
                    <button class="page-btn active">1</button>
                    <button class="page-btn">2</button>
                    <button class="page-btn">3</button>
                    <button class="page-btn">4</button>
                    <button class="page-btn">...</button>
                    <button class="page-btn">10</button>
                    <button class="page-btn">
                        <or-icon icon="chevron-right"></or-icon>
                    </button>
                </div>
            </div>
        `;
    }

    private renderApprovePanel(): TemplateResult {
        const filteredSchedules = this.approvalTab === 'pending'
            ? this.schedules.filter(s => s.status === 'pending')
            : this.schedules.filter(s => s.status === 'approved' || s.status === 'rejected');

        return html`
            <div class="main-panel">
                <div class="panel-header">
                    <div class="approval-tabs">
                        <div class="approval-tab ${this.approvalTab === 'pending' ? 'active' : ''}"
                             @click=${() => this.approvalTab = 'pending'}>
                            CHƯA DUYỆT
                        </div>
                        <div class="approval-tab ${this.approvalTab === 'approved' ? 'active' : ''}"
                             @click=${() => this.approvalTab = 'approved'}>
                            ĐÃ DUYỆT
                        </div>
                    </div>
                    ${this.approvalTab === 'pending' ? html`
                        <div class="approval-actions">
                            <button class="btn-approve">
                                <or-icon icon="check"></or-icon>
                                PHÊ DUYỆT
                            </button>
                            <button class="btn-reject">
                                <or-icon icon="close"></or-icon>
                                TỪ CHỐI
                            </button>
                        </div>
                    ` : null}
                </div>
                ${this.renderFilterRow()}
                <div class="panel-body">
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    ${this.approvalTab === 'pending' ? html`<th><input type="checkbox" /></th>` : null}
                                    <th>Bản tin</th>
                                    <th>Loại phát</th>
                                    <th>Thiết bị</th>
                                    <th>Ngày giờ bắt đầu</th>
                                    <th>Ngày giờ kết thúc</th>
                                    <th>Tình trạng</th>
                                    <th>Khu vực</th>
                                    <th>Người tạo</th>
                                    <th>Ngày tạo</th>
                                    ${this.approvalTab === 'approved' ? html`
                                        <th>Người duyệt</th>
                                        <th>Ngày duyệt</th>
                                    ` : null}
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredSchedules.map(schedule => html`
                                    <tr>
                                        ${this.approvalTab === 'pending' ? html`<td><input type="checkbox" /></td>` : null}
                                        <td><span class="link">${schedule.name}</span></td>
                                        <td>${this.getScheduleTypeLabel(schedule.type)}</td>
                                        <td><span class="link">${schedule.deviceCount} thiết bị</span></td>
                                        <td>${schedule.startDateTime}</td>
                                        <td>${schedule.endDateTime}</td>
                                        <td>${this.renderStatusBadge(schedule.status)}</td>
                                        <td><span class="link">${schedule.areaCount} Khu vực</span></td>
                                        <td>${schedule.createdBy}</td>
                                        <td>${schedule.createdAt}</td>
                                        ${this.approvalTab === 'approved' ? html`
                                            <td>${schedule.approvedBy || ''}</td>
                                            <td>${schedule.approvedAt || ''}</td>
                                        ` : null}
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    private renderHistoryPanel(): TemplateResult {
        return html`
            <div class="main-panel">
                <div class="panel-header">
                    <span class="panel-title">LỊCH SỬ BẢN TIN</span>
                </div>
                <div class="filter-row">
                    <input type="text" class="filter-input" placeholder="Bản tin" />
                    <select class="filter-select">
                        <option value="">Loại nội dung</option>
                        <option value="playlist">Danh sách phát</option>
                        <option value="file">File</option>
                        <option value="relay">Tiếp sóng</option>
                    </select>
                    <input type="date" class="filter-input" />
                    <input type="date" class="filter-input" />
                    <button class="btn-search">
                        <or-icon icon="magnify"></or-icon>
                        Tìm kiếm
                    </button>
                </div>
                <div class="panel-body">
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Bản tin</th>
                                    <th>Loại nội dung</th>
                                    <th>Độ ưu tiên</th>
                                    <th>Ngày giờ bắt đầu</th>
                                    <th>Ngày giờ kết thúc</th>
                                    <th>Trạng thái phát</th>
                                    <th>Khu vực</th>
                                    <th>Thiết bị</th>
                                    <th>Người tạo</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.schedules.slice(0, 10).map(schedule => html`
                                    <tr>
                                        <td><span class="link">${schedule.name}</span></td>
                                        <td>${this.getContentTypeLabel(schedule.contentType)}</td>
                                        <td>${this.getPriorityLabel(schedule.priority)}</td>
                                        <td>${schedule.startDateTime}</td>
                                        <td>${schedule.endDateTime}</td>
                                        <td><span class="status-badge status-approved">Đã phát</span></td>
                                        <td><span class="link">${schedule.areaCount} Khu vực</span></td>
                                        <td><span class="link">${schedule.deviceCount} thiết bị</span></td>
                                        <td>${schedule.createdBy}</td>
                                        <td>${schedule.createdAt}</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    private renderCreateModal(): TemplateResult {
        return html`
            <div class="modal-overlay" @click=${() => this.showCreateModal = false}>
                <div class="modal-content" style="max-width: 95%; width: 1200px; max-height: 90vh; display: flex; flex-direction: column;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header" style="background: #1a3a5c; color: white; padding: 16px 20px;">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div class="modal-title" style="color: white; font-size: 16px;">
                                TẠO LỊCH PHÁT
                            </div>
                            <div style="font-size: 13px; margin-left: auto;">
                                Người tạo: <strong>Admin</strong> &nbsp;&nbsp; Ngày tạo: <strong>${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body" style="flex: 1; overflow: auto; padding: 20px;">
                        ${this.renderScheduleTypeSection()}
                        ${this.renderScheduleSettingsSection()}
                    </div>
                    <div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid #dce4f0;">
                        <button class="btn btn-primary">
                            <or-icon icon="content-save"></or-icon>
                            Thêm
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showCreateModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
                ${this.renderCreateModalSidebar()}
            </div>
        `;
    }

    private renderScheduleTypeSection(): TemplateResult {
        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return html`
            <div style="margin-bottom: 24px;">
                <div style="font-weight: 600; margin-bottom: 12px; color: #333;">Lịch phát</div>
                <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
                    <!-- Schedule Type Radio Buttons -->
                    <div style="display: flex; gap: 16px;">
                        ${(['one_time', 'daily', 'weekly', 'monthly', 'always'] as const).map(type => html`
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="radio" name="scheduleType" 
                                    .checked=${this.createScheduleType === type}
                                    @change=${() => this.createScheduleType = type} />
                                ${this.getScheduleTypeLabel(type)}
                            </label>
                        `)}
                    </div>
                    
                    <!-- Date Pickers -->
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <div>
                            <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px;">Ngày bắt đầu</label>
                            <input type="date" style="padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;" 
                                .value=${this.createStartDate}
                                @input=${(e: Event) => this.createStartDate = (e.target as HTMLInputElement).value} />
                        </div>
                        ${this.createScheduleType !== 'always' ? html`
                            <div>
                                <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px;">Ngày kết thúc</label>
                                <input type="date" style="padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;"
                                    .value=${this.createEndDate}
                                    @input=${(e: Event) => this.createEndDate = (e.target as HTMLInputElement).value} />
                            </div>
                        ` : null}
                    </div>
                </div>
                
                <!-- Week Days (for weekly schedule) -->
                ${this.createScheduleType === 'weekly' ? html`
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        ${weekDays.map(day => html`
                            <button style="width: 40px; height: 40px; border: 2px solid ${this.createWeekDays.has(day) ? '#1a73e8' : '#dce4f0'}; border-radius: 4px; background: ${this.createWeekDays.has(day) ? '#e8f0fe' : 'white'}; cursor: pointer; font-weight: 500;"
                                @click=${() => this.toggleCreateWeekDay(day)}>
                                ${day}
                            </button>
                        `)}
                    </div>
                ` : null}
                
                <!-- Month Days (for monthly schedule) -->
                ${this.createScheduleType === 'monthly' ? html`
                    <div style="margin-top: 12px;">
                        <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px;">Ngày trong tháng</label>
                        <select style="padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px; min-width: 200px;">
                            <option value="">Chọn các ngày trong tháng</option>
                            ${Array.from({ length: 31 }, (_, i) => i + 1).map(d => html`
                                <option value="${d}">${d}</option>
                            `)}
                        </select>
                    </div>
                ` : null}
            </div>
        `;
    }

    private renderScheduleSettingsSection(): TemplateResult {
        return html`
            <div>
                <div style="font-weight: 600; margin-bottom: 12px; color: #333;">Cài đặt lịch phát</div>
                
                <!-- Settings Tabs -->
                <div style="display: flex; gap: 0; margin-bottom: 16px; border-bottom: 2px solid #dce4f0;">
                    ${(['device', 'content', 'time'] as const).map(tab => html`
                        <button style="padding: 10px 20px; border: none; background: transparent; cursor: pointer; font-weight: 500; color: ${this.createSettingsTab === tab ? '#1a73e8' : '#666'}; border-bottom: 2px solid ${this.createSettingsTab === tab ? '#1a73e8' : 'transparent'}; margin-bottom: -2px;"
                            @click=${() => this.createSettingsTab = tab}>
                            ${tab === 'device' ? 'Thiết bị' : tab === 'content' ? 'Nội dung' : 'Thời gian phát'}
                        </button>
                    `)}
                </div>
                
                <!-- Tab Content -->
                ${this.createSettingsTab === 'device' ? this.renderDeviceTab() : null}
                ${this.createSettingsTab === 'content' ? this.renderContentTab() : null}
                ${this.createSettingsTab === 'time' ? this.renderTimeTab() : null}
            </div>
        `;
    }

    private renderDeviceTab(): TemplateResult {
        return html`
            <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <button style="width: 32px; height: 32px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                        @click=${() => this.showSelectionSidebar = !this.showSelectionSidebar}>
                        <or-icon icon="plus" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                    </button>
                </div>
                <div style="border: 1px solid #dce4f0; border-radius: 6px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #A8DCFD;">
                                <th style="padding: 10px; text-align: center; width: 60px;">STT</th>
                                <th style="padding: 10px; text-align: left;">Cấp</th>
                                <th style="padding: 10px; text-align: left;">Tên thiết bị</th>
                                <th style="padding: 10px; text-align: left;">Khu vực</th>
                                <th style="padding: 10px; text-align: center; width: 80px;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.createSelectedDevices.map((device, index) => html`
                                <tr style="border-bottom: 1px solid #f0f4fa;">
                                    <td style="padding: 10px; text-align: center;">${(index + 1).toString().padStart(2, '0')}</td>
                                    <td style="padding: 10px;">${device.level}</td>
                                    <td style="padding: 10px;">${device.name}</td>
                                    <td style="padding: 10px;">${device.area}</td>
                                    <td style="padding: 10px; text-align: center;">
                                        <button class="btn-icon" style="color: #ef4444;">
                                            <or-icon icon="delete" style="--or-icon-width: 18px; --or-icon-height: 18px;"></or-icon>
                                        </button>
                                    </td>
                                </tr>
                            `)}
                            <tr style="border-bottom: 1px solid #f0f4fa;"><td colspan="5" style="padding: 30px;">&nbsp;</td></tr>
                            <tr><td colspan="5" style="padding: 30px;">&nbsp;</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    private renderContentTab(): TemplateResult {
        return html`
            <div>
                <!-- Content Source Radio Buttons -->
                <div style="margin-bottom: 16px;">
                    <label style="font-size: 13px; font-weight: 500; margin-right: 16px;">Nguồn nội dung phát <span style="color: red;">*</span></label>
                    <div style="display: inline-flex; gap: 24px;">
                        ${(['playlist', 'file', 'relay'] as const).map(source => html`
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="radio" name="contentSource" 
                                    .checked=${this.createContentSource === source}
                                    @change=${() => this.createContentSource = source} />
                                ${source === 'playlist' ? 'Danh sách phát' : source === 'file' ? 'Theo file' : 'Tiếp sóng'}
                            </label>
                        `)}
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <button style="width: 32px; height: 32px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                        @click=${() => this.showSelectionSidebar = !this.showSelectionSidebar}>
                        <or-icon icon="plus" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                    </button>
                </div>
                
                <div style="border: 1px solid #dce4f0; border-radius: 6px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #A8DCFD;">
                                ${this.createContentSource === 'playlist' ? html`
                                    <th style="padding: 10px; text-align: left;">Tên danh sách phát</th>
                                    <th style="padding: 10px; text-align: left; width: 100px;">Số lần phát</th>
                                ` : this.createContentSource === 'file' ? html`
                                    <th style="padding: 10px; text-align: left;">Tên file</th>
                                    <th style="padding: 10px; text-align: left; width: 100px;">Số lần phát</th>
                                ` : html`
                                    <th style="padding: 10px; text-align: left;">Tên đài tiếp sóng</th>
                                    <th style="padding: 10px; text-align: left;">Link URL</th>
                                `}
                                <th style="padding: 10px; text-align: left; width: 120px;">Thời gian phát</th>
                                <th style="padding: 10px; text-align: center; width: 120px;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.createSelectedContents.map(content => html`
                                <tr style="border-bottom: 1px solid #f0f4fa;">
                                    ${this.createContentSource === 'relay' ? html`
                                        <td style="padding: 10px;">
                                            <or-icon icon="broadcast" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8; margin-right: 6px;"></or-icon>
                                            Phường Mộ Lao
                                        </td>
                                        <td style="padding: 10px;">http://bdcvsdcbsivo</td>
                                    ` : html`
                                        <td style="padding: 10px;">
                                            <or-icon icon="${this.createContentSource === 'playlist' ? 'playlist-music' : 'file-music'}" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8; margin-right: 6px;"></or-icon>
                                            ${content.name}
                                        </td>
                                        <td style="padding: 10px;">${content.count.toString().padStart(2, '0')}</td>
                                    `}
                                    <td style="padding: 10px;">${content.duration}</td>
                                    <td style="padding: 10px; text-align: center;">
                                        <button class="btn-icon" title="Sửa">
                                            <or-icon icon="pencil" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                        </button>
                                        <button class="btn-icon" title="Âm lượng">
                                            <or-icon icon="volume-high" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                        </button>
                                    </td>
                                </tr>
                            `)}
                            <tr style="border-bottom: 1px solid #f0f4fa;">
                                <td colspan="4" style="padding: 10px; text-align: right;">
                                    <button style="padding: 4px 12px; border: 1px solid #dce4f0; background: white; border-radius: 4px; cursor: pointer; margin-right: 8px;">Nghe trước</button>
                                    <button style="padding: 4px 12px; border: 1px solid #dce4f0; background: white; border-radius: 4px; cursor: pointer;">Đổi danh sách</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    private renderTimeTab(): TemplateResult {
        return html`
            <div>
                <!-- Priority and Field Row -->
                <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                    <div style="flex: 1;">
                        <label style="font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">Mức độ ưu tiên</label>
                        <select style="width: 100%; padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;">
                            <option value="">Chọn mức độ</option>
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">Lĩnh vực</label>
                        <select style="width: 100%; padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;">
                            <option value="">Chọn lĩnh vực</option>
                            <option value="news">Thời sự</option>
                            <option value="weather">Thời tiết</option>
                            <option value="emergency">Khẩn cấp</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">Tốc độ phát</label>
                    <input type="text" value="64 kbps" style="padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px; width: 150px;" readonly />
                </div>
                
                <!-- Time Slots Table -->
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <button style="width: 32px; height: 32px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                        @click=${() => this.addTimeSlot()}>
                        <or-icon icon="plus" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                    </button>
                </div>
                
                <div style="border: 1px solid #dce4f0; border-radius: 6px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #A8DCFD;">
                                <th style="padding: 10px; text-align: center; width: 60px;">STT</th>
                                <th style="padding: 10px; text-align: left;">Giờ bắt đầu</th>
                                <th style="padding: 10px; text-align: left;">Giờ kết thúc</th>
                                <th style="padding: 10px; text-align: left; width: 200px;">Âm lượng</th>
                                <th style="padding: 10px; text-align: center; width: 100px;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.createTimeSlots.map((slot, index) => html`
                                <tr style="border-bottom: 1px solid #f0f4fa;">
                                    <td style="padding: 10px; text-align: center;">${(index + 1).toString().padStart(2, '0')}</td>
                                    <td style="padding: 10px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <or-icon icon="clock-outline" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #666;"></or-icon>
                                            <input type="time" style="padding: 6px 10px; border: 1px solid #dce4f0; border-radius: 4px;"
                                                .value=${slot.startTime}
                                                @input=${(e: Event) => this.updateTimeSlot(index, 'startTime', (e.target as HTMLInputElement).value)} />
                                        </div>
                                    </td>
                                    <td style="padding: 10px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <or-icon icon="clock-outline" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #666;"></or-icon>
                                            <input type="time" style="padding: 6px 10px; border: 1px solid #dce4f0; border-radius: 4px;"
                                                .value=${slot.endTime}
                                                @input=${(e: Event) => this.updateTimeSlot(index, 'endTime', (e.target as HTMLInputElement).value)} />
                                        </div>
                                    </td>
                                    <td style="padding: 10px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <or-icon icon="volume-high" style="--or-icon-width: 18px; --or-icon-height: 18px; color: #666;"></or-icon>
                                            <input type="range" min="0" max="100" .value=${slot.volume.toString()}
                                                style="flex: 1;"
                                                @input=${(e: Event) => this.updateTimeSlot(index, 'volume', parseInt((e.target as HTMLInputElement).value))} />
                                            <span style="font-size: 12px; color: #666; min-width: 35px;">${slot.volume}%</span>
                                        </div>
                                    </td>
                                    <td style="padding: 10px; text-align: center;">
                                        <button class="btn-icon" title="Copy">
                                            <or-icon icon="content-copy" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                        </button>
                                        <button class="btn-icon" style="color: #ef4444;" title="Xóa" @click=${() => this.removeTimeSlot(index)}>
                                            <or-icon icon="delete" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                        </button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    private renderCreateModalSidebar(): TemplateResult {
        // Only show popup when showSelectionSidebar is true
        if (!this.showSelectionSidebar) return html``;
        if (this.createSettingsTab === 'time') return html``;

        const title = this.createSettingsTab === 'device' ? 'CHỌN THIẾT BỊ' :
            this.createSettingsTab === 'content' ?
                (this.createContentSource === 'playlist' ? '--Chọn danh sách phát--' :
                    this.createContentSource === 'file' ? '--Chọn file--' : '--Chọn tiếp sóng--') :
                '';

        return html`
            <div class="modal-overlay" style="background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;" @click=${() => this.showSelectionSidebar = false}>
                <div style="width: 350px; max-height: 500px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 1002;" @click=${(e: Event) => e.stopPropagation()}>
                    <div style="padding: 16px; border-bottom: 1px solid #dce4f0;">
                        <div style="font-weight: 600; margin-bottom: 12px;">${title}</div>
                        ${this.createSettingsTab === 'content' ? html`
                            <label style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                                <input type="checkbox" checked />
                                Dùng chung
                            </label>
                        ` : null}
                        <div style="display: flex; gap: 8px;">
                            <input type="text" placeholder="${this.createSettingsTab === 'device' ? 'Nhập mã/ tên' : 'Nhập tên danh sách'}" style="flex: 1; padding: 8px 10px; border: 1px solid #dce4f0; border-radius: 4px; font-size: 13px;" />
                            <button style="padding: 8px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer;">
                                <or-icon icon="magnify" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                            </button>
                        </div>
                    </div>
                    <div style="flex: 1; overflow: auto; padding: 8px; max-height: 300px;">
                        ${this.createSettingsTab === 'device' ? this.renderDeviceTreeForModal() : this.renderContentListForModal()}
                    </div>
                    <div style="padding: 12px 16px; border-top: 1px solid #dce4f0; display: flex; gap: 8px; justify-content: flex-end;">
                        <button style="padding: 8px 16px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;"
                            @click=${() => this.addSelectedItemsToTable()}>
                            <or-icon icon="plus" style="--or-icon-width: 14px; --or-icon-height: 14px;"></or-icon>
                            Thêm
                        </button>
                        <button style="padding: 8px 16px; border: 1px solid #dce4f0; background: white; border-radius: 4px; cursor: pointer;"
                            @click=${() => this.showSelectionSidebar = false}>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderDeviceTreeForModal(): TemplateResult {
        return html`
            <div class="sidebar-tree">
                ${this.devices.map(device => this.renderDeviceNodeForModal(device, 0))}
            </div>
        `;
    }

    private renderDeviceNodeForModal(node: DeviceTreeNode, level: number): TemplateResult {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = this.createModalExpandedDevices.has(node.id);
        const isSelected = this.createModalSelectedDeviceIds.has(node.id);

        return html`
            <div class="tree-node">
                <div class="tree-node-row" style="padding-left: ${8 + level * 16}px; display: flex; align-items: center; gap: 4px; padding-top: 6px; padding-bottom: 6px;">
                    ${hasChildren ? html`
                        <span style="cursor: pointer; display: flex;" @click=${() => this.toggleCreateModalDevice(node.id)}>
                            <or-icon icon="chevron-${isExpanded ? 'down' : 'right'}" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                        </span>
                    ` : html`<span style="width: 16px;"></span>`}
                    <input type="checkbox" .checked=${isSelected} @change=${() => this.toggleCreateModalDeviceSelection(node.id)} />
                    <or-icon icon="${node.type === 'cluster' ? 'volume-high' : 'folder'}" style="--or-icon-width: 16px; --or-icon-height: 16px; color: ${node.type === 'cluster' ? '#1a73e8' : '#f59e0b'};"></or-icon>
                    <span style="font-size: 13px;">${node.name}</span>
                </div>
                ${hasChildren && isExpanded ? html`
                    <div>
                        ${node.children!.map(child => this.renderDeviceNodeForModal(child, level + 1))}
                    </div>
                ` : null}
            </div>
        `;
    }

    private renderContentListForModal(): TemplateResult {
        if (this.createContentSource === 'playlist') {
            const playlists = ['Danh sách bản tin', 'Danh sách tin nhanh', 'Danh sách tin bão'];
            return html`
                <div>
                    ${playlists.map(pl => html`
                        <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.15s;"
                            @mouseover=${(e: any) => e.currentTarget.style.background = '#f5f7fb'}
                            @mouseout=${(e: any) => e.currentTarget.style.background = 'transparent'}>
                            <input type="checkbox" />
                            <or-icon icon="playlist-music" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8;"></or-icon>
                            <span style="font-size: 13px;">${pl}</span>
                        </label>
                    `)}
                </div>
            `;
        } else if (this.createContentSource === 'file') {
            return html`
                <div>
                    <div style="padding: 8px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                        <or-icon icon="chevron-down" style="--or-icon-width: 14px; --or-icon-height: 14px;"></or-icon>
                        <or-icon icon="folder" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #f59e0b;"></or-icon>
                        Thông tin thời sự
                    </div>
                    <div style="padding-left: 24px;">
                        ${['Bản tin thời sự', 'Bản tin cảnh báo', 'Cập nhật lũ'].map(file => html`
                            <label style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; cursor: pointer;">
                                <input type="checkbox" />
                                <or-icon icon="file-music" style="--or-icon-width: 14px; --or-icon-height: 14px; color: #666;"></or-icon>
                                <span style="font-size: 13px;">${file}</span>
                            </label>
                        `)}
                    </div>
                </div>
            `;
        } else {
            const stations = ['VOV 1', 'VOV 1', 'VOV 1'];
            return html`
                <div>
                    ${stations.map(station => html`
                        <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer;">
                            <input type="checkbox" />
                            <or-icon icon="broadcast" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #ef4444;"></or-icon>
                            <span style="font-size: 13px;">${station}</span>
                        </label>
                    `)}
                </div>
            `;
        }
    }

    private toggleCreateWeekDay(day: string): void {
        const newSet = new Set(this.createWeekDays);
        if (newSet.has(day)) {
            newSet.delete(day);
        } else {
            newSet.add(day);
        }
        this.createWeekDays = newSet;
    }

    private toggleCreateModalDevice(id: string): void {
        const newSet = new Set(this.createModalExpandedDevices);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        this.createModalExpandedDevices = newSet;
    }

    private toggleCreateModalDeviceSelection(id: string): void {
        const newSet = new Set(this.createModalSelectedDeviceIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        this.createModalSelectedDeviceIds = newSet;
    }

    private addTimeSlot(): void {
        this.createTimeSlots = [...this.createTimeSlots, { id: Date.now().toString(), startTime: '', endTime: '', volume: 50 }];
    }

    private removeTimeSlot(index: number): void {
        this.createTimeSlots = this.createTimeSlots.filter((_, i) => i !== index);
    }

    private updateTimeSlot(index: number, field: 'startTime' | 'endTime' | 'volume', value: string | number): void {
        this.createTimeSlots = this.createTimeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
    }

    private addSelectedItemsToTable(): void {
        if (this.createSettingsTab === 'device') {
            // Add selected devices to the table
            const newDevices: { id: string; level: string; name: string; area: string }[] = [];
            this.createModalSelectedDeviceIds.forEach(id => {
                // Find device info from tree
                const deviceInfo = this.findDeviceById(id);
                if (deviceInfo && !this.createSelectedDevices.find(d => d.id === id)) {
                    newDevices.push({
                        id,
                        level: deviceInfo.type === 'cluster' ? 'Thiết bị' : deviceInfo.type === 'ward' ? 'Phường/Xã' : 'Tỉnh/TP',
                        name: deviceInfo.name,
                        area: 'Thành phố Hà Nội'
                    });
                }
            });
            this.createSelectedDevices = [...this.createSelectedDevices, ...newDevices];
        } else if (this.createSettingsTab === 'content') {
            // Add selected content to the table (mock implementation)
            const newContent = {
                id: Date.now().toString(),
                name: this.createContentSource === 'playlist' ? 'Danh sách mới' :
                    this.createContentSource === 'file' ? 'File mới' : 'Đài tiếp sóng',
                count: 1,
                duration: '00:10:00'
            };
            this.createSelectedContents = [...this.createSelectedContents, newContent];
        }
        this.showSelectionSidebar = false;
    }

    private findDeviceById(id: string): DeviceTreeNode | null {
        const search = (nodes: DeviceTreeNode[]): DeviceTreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = search(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return search(this.devices);
    }

    // Helper methods
    private renderStatusBadge(status: ScheduleStatus): TemplateResult {
        const labels = {
            pending: 'Chưa duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối'
        };
        const classes = {
            pending: 'status-pending',
            approved: 'status-approved',
            rejected: 'status-rejected'
        };
        return html`<span class="status-badge ${classes[status]}">${labels[status]}</span>`;
    }

    private getScheduleTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'one_time': 'Một lần',
            'daily': 'Theo ngày',
            'weekly': 'Theo tuần',
            'monthly': 'Theo tháng',
            'always': 'Luôn luôn'
        };
        return labels[type] || type;
    }

    private getContentTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'playlist': 'Danh sách phát',
            'file': 'File',
            'relay': 'Tiếp sóng'
        };
        return labels[type] || type;
    }

    private getPriorityLabel(priority: string): string {
        const labels: Record<string, string> = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao',
            'urgent': 'Khẩn cấp'
        };
        return labels[priority] || priority;
    }

    private toggleDevice(id: string): void {
        if (this.expandedDevices.has(id)) {
            this.expandedDevices.delete(id);
        } else {
            this.expandedDevices.add(id);
        }
        this.expandedDevices = new Set(this.expandedDevices);
    }

    private selectDevice(id: string): void {
        this.selectedDevice = id;
    }

    private toggleActionMenu(e: Event, id: string): void {
        e.stopPropagation();
        this.openActionMenu = this.openActionMenu === id ? null : id;
    }

    private generateTimeSlots(): string[] {
        const slots: string[] = [];
        for (let h = 0; h < 3; h++) {
            for (let m = 0; m < 60; m += 15) {
                slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
        return slots;
    }

    private formatDate(date: Date): string {
        return `${date.getDate().toString().padStart(2, '0')} Tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
    }

    private getWeekRange(): string {
        const start = new Date(this.currentDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.getDate().toString().padStart(2, '0')} - ${end.getDate().toString().padStart(2, '0')} Tháng ${end.getMonth() + 1} năm ${end.getFullYear()}`;
    }

    private getMonthYear(): string {
        return `Tháng ${this.currentDate.getMonth() + 1} năm ${this.currentDate.getFullYear()}`;
    }

    private generateMonthDays(): { date: number; events: { time: string; title: string; status: string }[] }[] {
        const days = [];
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

        for (let d = 1; d <= Math.min(daysInMonth, 35); d++) {
            const events = [];
            if (d % 3 === 0) {
                events.push({ time: '19:00', title: 'Bản tin thời tiết', status: 'approved' });
            }
            if (d % 5 === 0) {
                events.push({ time: '08:00', title: 'Bản tin buổi sáng', status: 'pending' });
            }
            days.push({ date: d, events });
        }
        return days;
    }

    private navigateCalendar(days: number): void {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.currentDate = newDate;
    }
}
