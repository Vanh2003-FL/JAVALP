import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { categoryContentStyles } from "./category-content.styles";
import { DeviceTreeNode, Category, Content, Playlist, CategoryContentSubTab } from "./types";
import "@openremote/or-icon";

@customElement("category-content-shell")
export class CategoryContentShell extends LitElement {
    static styles = [categoryContentStyles];

    @state() private activeSubTab: CategoryContentSubTab = "category";
    @state() private showSharedOnly: boolean = false;
    @state() private searchQuery: string = "";
    @state() private selectedDeviceId: string = "hanoi";
    @state() private expandedDevices: Set<string> = new Set(["hanoi"]);
    @state() private expandedCategories: Set<string> = new Set(["cat1"]);
    @state() private selectedCategories: Set<string> = new Set();
    @state() private openActionMenu: string | null = null;
    @state() private openPlaylistActionMenu: string | null = null;
    @state() private playlistMenuPosition: { top: number; left: number } = { top: 0, left: 0 };

    // Modal states
    @state() private showAddCategoryModal: boolean = false;
    @state() private showAddContentModal: boolean = false;
    @state() private showCreatePlaylistModal: boolean = false;
    @state() private showSelectContentModal: boolean = false;
    @state() private showAddToPlaylistModal: boolean = false;
    @state() private showPlaylistDetailModal: boolean = false;
    @state() private selectedPlaylistId: string | null = null;

    // Add to playlist modal form state
    @state() private newPlaylistName: string = "";
    @state() private newPlaylistIsShared: boolean = false;
    @state() private selectedExistingPlaylists: Set<string> = new Set();
    @state() private addToPlaylistSearchIsShared: boolean = false;

    // Playlist form data
    @state() private playlistFormContents: Content[] = [
        { id: "content1", name: "Tin bão", categoryId: "cat1", format: "mp3", duration: "00:30:00", categoryName: "Bản tin thời sự > Tin Thời tiết" }
    ];
    @state() private playlistDetailContents: Content[] = [];
    @state() private selectContentExpandedCategories: Set<string> = new Set(["cat1", "cat3"]);

    // Mock data for device tree
    private deviceTree: DeviceTreeNode[] = [
        {
            id: "hanoi",
            name: "Thành phố Hà Nội",
            type: "province",
            children: [
                {
                    id: "hoankien",
                    name: "Phường Hoàn Kiếm",
                    type: "ward",
                    children: []
                },
                {
                    id: "badinh",
                    name: "Phường Ba Đình",
                    type: "ward",
                    children: [
                        { id: "cumloa01", name: "Cụm loa 01", type: "device" },
                        { id: "cumloa02", name: "Cụm loa 02", type: "device" },
                        { id: "cumloa03", name: "Cụm loa 03", type: "device" },
                    ]
                },
                { id: "tayho", name: "Phường Tây Hồ", type: "ward" },
                { id: "hadong", name: "Phường Hà Đông", type: "ward" },
            ]
        },
        {
            id: "hcm",
            name: "Thành phố Hồ Chí Minh",
            type: "province",
            children: []
        }
    ];

    // Mock data for categories & contents
    private categories: Category[] = [
        {
            id: "cat1",
            name: "Thông tin thời sự",
            isShared: false,
            children: [
                { id: "cat1-1", name: "Bản tin thời sự", isShared: false, children: [], contents: [] },
            ],
            contents: [
                { id: "content1", name: "Bản tin thời sự", categoryId: "cat1", format: "mp3", duration: "00:10:20" },
            ]
        },
        {
            id: "cat2",
            name: "Bản tin cảnh báo",
            isShared: true,
            children: [],
            contents: [
                { id: "content2", name: "Cập nhật lũ", categoryId: "cat2", format: "mp3", duration: "00:05:30" },
                { id: "content3", name: "Tin bão", categoryId: "cat2", format: "mp3", duration: "00:03:15" },
            ]
        },
        {
            id: "cat3",
            name: "Bản tin của xã",
            isShared: false,
            children: [
                {
                    id: "cat3-1", name: "Bản tin xã An Hòa", isShared: false, children: [], contents: [
                        { id: "content4", name: "Tin người tốt việc tốt", categoryId: "cat3-1", format: "mp3", duration: "00:08:45" },
                    ]
                },
            ],
            contents: []
        },
        {
            id: "cat4",
            name: "Tin bão",
            isShared: true,
            children: [],
            contents: []
        },
    ];

    // Mock data for playlists
    private playlists: Playlist[] = [
        { id: "pl1", name: "DS bản tin", isShared: false, contentCount: 2, areaName: "Phường Văn Quán, Thành phố Hà Nội", createdBy: "Nguyễn Văn A", createdAt: "15/10/2025 00:00" },
        { id: "pl2", name: "DS thời sự", isShared: false, contentCount: 2, areaName: "Phường Văn Quán, Thành phố Hà Nội", createdBy: "Admin", createdAt: "15/10/2025 00:00" },
        { id: "pl3", name: "Bản tin sự kiện", isShared: true, contentCount: 2, areaName: "Phường Văn Quán, Thành phố Hà Nội", createdBy: "Admin", createdAt: "15/10/2025 00:00" },
        { id: "pl4", name: "Bản tin thể thao", isShared: false, contentCount: 2, areaName: "Phường Văn Quán, Thành phố Hà Nội", createdBy: "Admin", createdAt: "15/10/2025 00:00" },
    ];

    private handleClickOutside = (e: Event) => {
        if (this.openActionMenu) {
            this.openActionMenu = null;
        }
    };

    connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('click', this.handleClickOutside);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('click', this.handleClickOutside);
    }

    protected render(): TemplateResult {
        return html`
            <div class="page" @click=${() => { this.openActionMenu = null; this.openPlaylistActionMenu = null; }}>
                ${this.renderTopRow()}
                <div class="body-row">
                    ${this.renderDeviceSidebar()}
                    ${this.renderCategoryPanel()}
                    ${this.renderPlaylistPanel()}
                </div>
            </div>
            ${this.showAddCategoryModal ? this.renderAddCategoryModal() : null}
            ${this.showAddContentModal ? this.renderAddContentModal() : null}
            ${this.showCreatePlaylistModal ? this.renderCreatePlaylistModal() : null}
            ${this.showAddToPlaylistModal ? this.renderAddToPlaylistModal() : null}
            ${this.showPlaylistDetailModal ? this.renderPlaylistDetailModal() : null}
            ${this.renderPlaylistActionDropdown()}
        `;
    }

    private renderTopRow(): TemplateResult {
        return html`
            <!-- Hidden: tabs and checkbox as per user request -->
            <!--
            <div class="top-row">
                <div class="sub-tabs">
                    <div class="sub-tab ${this.activeSubTab === 'category' ? 'active' : ''}"
                         @click=${() => this.activeSubTab = 'category'}>
                        Chuyên mục và nội dung
                    </div>
                    <div class="sub-tab ${this.activeSubTab === 'playlist' ? 'active' : ''}"
                         @click=${() => this.activeSubTab = 'playlist'}>
                        Danh sách phát
                    </div>
                </div>
                <label class="shared-filter">
                    <input type="checkbox" 
                           .checked=${this.showSharedOnly} 
                           @change=${(e: Event) => this.showSharedOnly = (e.target as HTMLInputElement).checked} />
                    Dùng chung
                </label>
            </div>
            -->
        `;
    }

    private renderDeviceSidebar(): TemplateResult {
        return html`
            <div class="sidebar">
                <div class="sidebar-header">
                    <input type="text" class="sidebar-search" placeholder="Nhập mã/ tên"
                           .value=${this.searchQuery}
                           @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value} />
                </div>
                <div class="sidebar-tree">
                    ${this.deviceTree.map(node => this.renderDeviceNode(node, 0))}
                </div>
            </div>
        `;
    }

    private renderDeviceNode(node: DeviceTreeNode, level: number): TemplateResult {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = this.expandedDevices.has(node.id);
        const isSelected = this.selectedDeviceId === node.id;

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
                    <span class="tree-icon ${node.type === 'device' ? 'device' : ''}">
                        <or-icon icon="${node.type === 'device' ? 'volume-high' : 'folder'}"></or-icon>
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

    private renderCategoryPanel(): TemplateResult {
        return html`
            <div class="panel">
                <!-- Header Row 1: Title + Button -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #333;">Chuyên mục và nội dung</span>
                    <button class="btn" style="background: #1a73e8; border: none; color: white; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;" 
                            @click=${() => this.showAddToPlaylistModal = true}>
                        <or-icon icon="playlist-plus" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                        Thêm vào danh sách phát
                    </button>
                </div>
                <!-- Header Row 2: Search + Folder Button -->
                <div style="display: flex; gap: 8px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #dce4f0;">
                    <div style="display: flex; align-items: center; background: white; border: 1px solid #dce4f0; border-radius: 4px; padding: 6px 12px; flex: 1; max-width: 320px;">
                        <input type="text" 
                               style="border: none; outline: none; flex: 1; font-size: 13px; color: #333;" 
                               placeholder="Nhập tên chuyên mục/ tên nội dung" />
                        <or-icon icon="magnify" style="--or-icon-width: 18px; --or-icon-height: 18px; color: #999; cursor: pointer; margin-left: 8px;"></or-icon>
                    </div>
                    <button class="btn" style="background: #f59e0b; border: none; color: white; padding: 8px 10px; border-radius: 4px; display: flex; align-items: center; justify-content: center;" 
                            @click=${() => this.showAddCategoryModal = true} title="Thêm chuyên mục">
                        <or-icon icon="folder-plus" style="--or-icon-width: 18px; --or-icon-height: 18px;"></or-icon>
                    </button>
                </div>
                <div class="panel-body" style="padding: 0;">
                    <div class="category-tree">
                        <!-- Table Header -->
                        <div class="category-table-header">
                            <div>Thao tác</div>
                            <div>Tên chuyên mục/nội dung</div>
                        </div>
                        <!-- Table Body -->
                        ${this.categories.map(cat => this.renderCategoryNode(cat, 0))}
                    </div>
                </div>
                <div class="panel-footer" style="padding: 12px 16px;">
                    <span style="font-size: 13px; color: #1a73e8;">${this.getTotalContentCount()} file nội dung</span>
                </div>
            </div>
        `;
    }

    private renderCategoryNode(category: Category, level: number): TemplateResult {
        const hasChildren = (category.children && category.children.length > 0) || (category.contents && category.contents.length > 0);
        const isExpanded = this.expandedCategories.has(category.id);

        return html`
            <div class="category-node">
                <div class="category-row">
                    <div class="category-actions-cell">
                        <button class="action-menu-btn" @click=${(e: Event) => this.toggleActionMenu(e, category.id)}>
                            <or-icon icon="dots-horizontal"></or-icon>
                        </button>
                        ${this.openActionMenu === category.id ? this.renderCategoryActionMenu(category) : null}
                        ${hasChildren ? html`
                            <span class="tree-toggle ${isExpanded ? 'expanded' : ''}"
                                  @click=${() => this.toggleCategory(category.id)}
                                  style="cursor: pointer;">
                                <or-icon icon="chevron-right"></or-icon>
                            </span>
                        ` : html`<span class="tree-toggle" style="width: 20px;"></span>`}
                    </div>
                    <div class="category-name-cell" style="padding-left: ${12 + level * 24}px;">
                        <input type="checkbox"
                               .checked=${this.selectedCategories.has(category.id)}
                               @change=${() => this.toggleCategorySelection(category.id)} />
                        <or-icon class="folder-icon" icon="folder"></or-icon>
                        <span class="item-name">${category.name}</span>
                    </div>
                </div>
                ${isExpanded ? html`
                    <div class="category-children">
                        ${category.contents?.map(content => this.renderContentRow(content, level + 1))}
                        ${category.children?.map(child => this.renderCategoryNode(child, level + 1))}
                    </div>
                ` : null}
            </div>
        `;
    }

    private renderContentRow(content: Content, level: number): TemplateResult {
        return html`
            <div class="category-row">
                <div class="category-actions-cell">
                    <button class="action-menu-btn" @click=${(e: Event) => this.toggleActionMenu(e, content.id)}>
                        <or-icon icon="dots-horizontal"></or-icon>
                    </button>
                    ${this.openActionMenu === content.id ? this.renderContentActionMenu(content) : null}
                    <span class="tree-toggle" style="width: 20px;"></span>
                </div>
                <div class="category-name-cell" style="padding-left: ${12 + level * 24}px;">
                    <input type="checkbox"
                           .checked=${this.selectedCategories.has(content.id)}
                           @change=${() => this.toggleCategorySelection(content.id)} />
                    <or-icon class="content-icon" icon="file-music"></or-icon>
                    <span class="item-name">${content.name}</span>
                </div>
            </div>
        `;
    }

    private renderCategoryActionMenu(category: Category): TemplateResult {
        return html`
            <div class="action-menu-dropdown" @click=${(e: Event) => e.stopPropagation()}>
                <button class="action-menu-item" @click=${() => this.openAddCategory(category)}>
                    <or-icon icon="folder-plus"></or-icon>
                    Thêm chuyên mục
                </button>
                <button class="action-menu-item" @click=${() => this.openAddContent(category)}>
                    <or-icon icon="file-plus"></or-icon>
                    Thêm nội dung
                </button>
                <button class="action-menu-item">
                    <or-icon icon="pencil"></or-icon>
                    Chỉnh sửa
                </button>
                <button class="action-menu-item">
                    <or-icon icon="${category.isShared ? 'link-off' : 'link'}"></or-icon>
                    ${category.isShared ? 'Hủy dùng chung' : 'Dùng chung'}
                </button>
                <button class="action-menu-item" style="color: #ef4444;">
                    <or-icon icon="delete"></or-icon>
                    Xóa
                </button>
            </div>
        `;
    }

    private renderContentActionMenu(content: Content): TemplateResult {
        return html`
            <div class="action-menu-dropdown" @click=${(e: Event) => e.stopPropagation()}>
                <button class="action-menu-item">
                    <or-icon icon="play"></or-icon>
                    Xem trước
                </button>
                <button class="action-menu-item">
                    <or-icon icon="pencil"></or-icon>
                    Chỉnh sửa
                </button>
                <button class="action-menu-item" style="color: #ef4444;">
                    <or-icon icon="delete"></or-icon>
                    Xóa
                </button>
            </div>
        `;
    }

    private renderPlaylistPanel(): TemplateResult {
        return html`
            <div class="panel">
                <!-- Header Row 1: Title + Button -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #333;">Danh sách phát</span>
                    <button class="btn" style="background: #1a73e8; border: none; color: white; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;" 
                            @click=${() => this.showCreatePlaylistModal = true}>
                        <or-icon icon="plus" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                        Tạo danh sách
                    </button>
                </div>
                <!-- Header Row 2: Search + Checkbox + Search Button -->
                <div style="display: flex; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #dce4f0;">
                    <div style="display: flex; align-items: center; background: white; border: 1px solid #dce4f0; border-radius: 4px; padding: 6px 12px; flex: 1; max-width: 280px;">
                        <input type="text" 
                               style="border: none; outline: none; flex: 1; font-size: 13px; color: #333;" 
                               placeholder="Nhập tên danh sách" />
                    </div>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #333; cursor: pointer;">
                        <input type="checkbox" style="width: 16px; height: 16px;" />
                        Dùng chung
                    </label>
                    <button class="btn" style="background: #6b7280; border: none; color: white; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 13px;">
                        <or-icon icon="magnify" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                        Tìm kiếm
                    </button>
                </div>
                <div class="panel-body table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px; text-align: center;">Thao tác</th>
                                <th>Tên danh sách</th>
                                <th>Dùng chung</th>
                                <th>Số lượng nội dung</th>
                                <th>Khu vực</th>
                                <th>Người tạo</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.playlists.map(pl => html`
                                <tr>
                                    <td style="text-align: center;">
                                        <button class="action-menu-btn" @click=${(e: Event) => this.togglePlaylistActionMenu(e, pl.id)}>
                                            <or-icon icon="dots-horizontal"></or-icon>
                                        </button>
                                    </td>
                                    <td><a href="#" style="color: #1a73e8;" @click=${(e: Event) => this.openPlaylistDetail(e, pl.id)}>${pl.name}</a></td>
                                    <td><input type="checkbox" .checked=${pl.isShared} disabled /></td>
                                    <td>${pl.contentCount} (Thời lượng 00:10:20)</td>
                                    <td>${pl.areaName}</td>
                                    <td>${pl.createdBy}</td>
                                    <td>${pl.createdAt}</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
                <div class="pagination-section">
                    <span class="pagination-info">Hiển thị 1-15 of 25 kết quả</span>
                    <div class="pagination-controls">
                        <a href="#">&lt;</a>
                        <a href="#" class="active">1</a>
                        <a href="#">2</a>
                        <a href="#">3</a>
                        <a href="#">4</a>
                        <a href="#">&gt;</a>
                        <select>
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    private renderPlaylistActionDropdown(): TemplateResult | null {
        if (!this.openPlaylistActionMenu) return null;

        return html`
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999;" @click=${() => this.openPlaylistActionMenu = null}></div>
            <div class="action-menu-dropdown" style="position: fixed; top: ${this.playlistMenuPosition.top}px; left: ${this.playlistMenuPosition.left}px; z-index: 1000;" @click=${(e: Event) => e.stopPropagation()}>
                <button class="action-menu-item">
                    <or-icon icon="eye"></or-icon>
                    Xem trước
                </button>
                <button class="action-menu-item">
                    <or-icon icon="pencil"></or-icon>
                    Chỉnh sửa
                </button>
                <button class="action-menu-item" style="color: #ef4444;">
                    <or-icon icon="delete" style="color: #ef4444;"></or-icon>
                    Xóa
                </button>
            </div>
        `;
    }

    private renderAddToPlaylistModal(): TemplateResult {
        return html`
            <div class="modal-overlay" @click=${() => this.showAddToPlaylistModal = false}>
                <div class="modal-content" style="max-width: 850px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div>
                            <div class="modal-location">Thành phố Hà Nội > Phường Ba Đình</div>
                        </div>
                        <button class="btn-icon" @click=${() => this.showAddToPlaylistModal = false}>
                            <or-icon icon="sync"></or-icon>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; min-height: 300px;">
                            <!-- Left column: Create new playlist -->
                            <div style="padding: 16px; border-right: 1px solid #dce4f0;">
                                <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: #A8DCFD; border-radius: 4px; margin-bottom: 16px;">
                                    <or-icon icon="plus-circle" style="--or-icon-width: 18px; --or-icon-height: 18px; color: #1a73e8;"></or-icon>
                                    <span style="font-weight: 600; color: #333;">Tạo danh sách phát mới</span>
                                </div>
                                
                                <div style="display: flex; gap: 12px; align-items: flex-end; margin-bottom: 16px;">
                                    <div style="flex: 1;">
                                        <label style="font-size: 13px; font-weight: 500; margin-bottom: 4px; display: block;">Tên danh sách <span style="color: red;">*</span></label>
                                        <input type="text" 
                                            style="width: 100%; padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;" 
                                            placeholder="Nhập tên danh sách" 
                                            .value=${this.newPlaylistName}
                                            @input=${(e: Event) => this.newPlaylistName = (e.target as HTMLInputElement).value} />
                                    </div>
                                    <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap; padding-bottom: 8px;">
                                        <input type="checkbox" 
                                            .checked=${this.newPlaylistIsShared}
                                            @change=${(e: Event) => this.newPlaylistIsShared = (e.target as HTMLInputElement).checked} />
                                        Dùng chung
                                    </label>
                                    <button class="btn" style="background: #f59e0b; border: none; color: white; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; gap: 4px;"
                                            @click=${() => this.handleCreateNewPlaylist()}>
                                        <or-icon icon="content-save" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                    </button>
                                    <button class="btn" style="background: #ef4444; border: none; color: white; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                        <or-icon icon="delete" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Right column: Add to existing playlists -->
                            <div style="padding: 16px;">
                                <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: #A8DCFD; border-radius: 4px; margin-bottom: 16px;">
                                    <or-icon icon="playlist-plus" style="--or-icon-width: 18px; --or-icon-height: 18px; color: #1a73e8;"></or-icon>
                                    <span style="font-weight: 600; color: #333;">Thêm nội dung vào danh sách phát</span>
                                </div>
                                
                                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                                    <input type="text" style="flex: 1; padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;" placeholder="Tên danh sách" />
                                    <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                                        <input type="checkbox" 
                                            .checked=${this.addToPlaylistSearchIsShared}
                                            @change=${(e: Event) => this.addToPlaylistSearchIsShared = (e.target as HTMLInputElement).checked} />
                                        Dùng chung
                                    </label>
                                    <button class="btn" style="background: #ef4444; border: none; color: white; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                        <or-icon icon="magnify" style="--or-icon-width: 16px; --or-icon-height: 16px;"></or-icon>
                                        Tìm kiếm
                                    </button>
                                </div>
                                
                                <!-- Playlist list with checkboxes -->
                                <div style="border: 1px solid #dce4f0; border-radius: 6px; max-height: 200px; overflow: auto;">
                                    ${this.playlists.map(pl => html`
                                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid #f0f4fa; cursor: pointer; transition: background 0.15s;"
                                               @mouseover=${(e: any) => e.currentTarget.style.background = '#f5f7fb'}
                                               @mouseout=${(e: any) => e.currentTarget.style.background = 'transparent'}>
                                            <input type="checkbox" 
                                                style="width: 16px; height: 16px;"
                                                .checked=${this.selectedExistingPlaylists.has(pl.id)}
                                                @change=${() => this.toggleExistingPlaylistSelection(pl.id)} />
                                            <or-icon icon="playlist-music" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8;"></or-icon>
                                            <span style="font-size: 13px; color: #333;">${pl.name}</span>
                                        </label>
                                    `)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" @click=${() => this.handleAddToExistingPlaylists()}>
                            <or-icon icon="file-plus"></or-icon>
                            Thêm
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showAddToPlaylistModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderAddCategoryModal(): TemplateResult {
        return html`
            <div class="modal-overlay" @click=${() => this.showAddCategoryModal = false}>
                <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div>
                            <div class="modal-location">Thành phố Hà Nội > Phường Ba Đình</div>
                            <div class="modal-title">
                                <or-icon icon="folder-plus" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #1a73e8;"></or-icon>
                                Tạo mới chuyên mục
                            </div>
                        </div>
                        <button class="btn-icon" @click=${() => this.showAddCategoryModal = false}>
                            <or-icon icon="sync"></or-icon>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Tên chuyên mục <span class="required">*</span></label>
                            <input type="text" class="form-input" placeholder="" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Ghi chú</label>
                                <input type="text" class="form-input" placeholder="" />
                            </div>
                            <div class="form-group">
                                <label class="form-checkbox" style="margin-top: 28px;">
                                    <input type="checkbox" />
                                    Dùng chung
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">
                            <or-icon icon="content-save"></or-icon>
                            Thêm
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showAddCategoryModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderAddContentModal(): TemplateResult {
        return html`
            <div class="modal-overlay" @click=${() => this.showAddContentModal = false}>
                <div class="modal-content" style="max-width: 700px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div>
                            <div class="modal-location">Thành phố Hà Nội > Phường Ba Đình</div>
                            <div class="modal-title">
                                <or-icon icon="file-plus" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #1a73e8;"></or-icon>
                                Tạo mới nội dung
                            </div>
                        </div>
                        <button class="btn-icon" @click=${() => this.showAddContentModal = false}>
                            <or-icon icon="sync"></or-icon>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tên nội dung <span class="required">*</span></label>
                                <input type="text" class="form-input" placeholder="" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ghi chú</label>
                                <input type="text" class="form-input" placeholder="" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chọn tập tin <span class="required">*</span></label>
                            <div class="file-upload">
                                <input type="text" class="form-input file-upload-input" placeholder="" readonly />
                                <button class="file-upload-btn">
                                    <or-icon icon="link" style="--or-icon-width: 18px; --or-icon-height: 18px;"></or-icon>
                                </button>
                                <div class="audio-preview">
                                    <or-icon icon="volume-high"></or-icon>
                                    <span>Nghe trước</span>
                                </div>
                            </div>
                        </div>
                        <div class="file-info">
                            <div class="file-info-item">
                                <div class="file-info-label">Định dạng</div>
                                <div class="file-info-value">-</div>
                            </div>
                            <div class="file-info-item">
                                <div class="file-info-label">Kích thước</div>
                                <div class="file-info-value">-</div>
                            </div>
                            <div class="file-info-item">
                                <div class="file-info-label">Thời gian phát</div>
                                <div class="file-info-value">-</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">
                            <or-icon icon="content-save"></or-icon>
                            Thêm
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showAddContentModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderCreatePlaylistModal(): TemplateResult {
        return html`
            <div class="modal-overlay" @click=${() => this.showCreatePlaylistModal = false}>
                <div class="modal-content" style="max-width: 850px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div>
                            <div class="modal-location">Thành phố Hà Nội > Phường Ba Đình</div>
                            <div class="modal-title">
                                <or-icon icon="playlist-plus" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #1a73e8;"></or-icon>
                                Tạo mới danh sách phát
                            </div>
                        </div>
                        <button class="btn-icon" @click=${() => this.showCreatePlaylistModal = false}>
                            <or-icon icon="sync"></or-icon>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row" style="gap: 16px;">
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Tên danh sách <span class="required">*</span></label>
                                <input type="text" class="form-input" placeholder="" />
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Ghi chú</label>
                                <input type="text" class="form-input" placeholder="" />
                            </div>
                            <div class="form-group" style="display: flex; align-items: flex-end; gap: 16px; padding-bottom: 4px;">
                                <label class="form-checkbox">
                                    <input type="checkbox" />
                                    Dùng chung
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chọn nội dung phát <span class="required">*</span></label>
                            <div style="border: 1px solid #dce4f0; border-radius: 4px; margin-top: 8px;">
                                <table style="margin: 0; border: none;">
                                    <thead>
                                        <tr>
                                            <th style="width: 40px; text-align: center; background: #A8DCFD;">
                                                <button class="btn-icon" style="padding: 4px;" @click=${() => this.showSelectContentModal = true} title="Thêm nội dung">
                                                    <or-icon icon="plus" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8;"></or-icon>
                                                </button>
                                            </th>
                                            <th style="background: #A8DCFD;">Thứ tự phát</th>
                                            <th style="background: #A8DCFD;">Tên nội dung</th>
                                            <th style="background: #A8DCFD;">Định dạng</th>
                                            <th style="background: #A8DCFD;">Thời lượng</th>
                                            <th style="background: #A8DCFD;">Chuyên mục</th>
                                            <th style="background: #A8DCFD; width: 60px;">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.playlistFormContents.map((content, index) => html`
                                            <tr>
                                                <td></td>
                                                <td style="text-align: center;">${String(index + 1).padStart(2, '0')}</td>
                                                <td>${content.name}</td>
                                                <td>${content.format}</td>
                                                <td>${content.duration}</td>
                                                <td>${content.categoryName || ''}</td>
                                                <td style="text-align: center;">
                                                    <button class="btn-icon" @click=${() => this.removePlaylistContent(content.id)} title="Xóa">
                                                        <or-icon icon="delete" style="color: #ef4444;"></or-icon>
                                                    </button>
                                                </td>
                                            </tr>
                                        `)}
                                        ${[...Array(Math.max(0, 4 - this.playlistFormContents.length))].map(() => html`
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        `)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">
                            <or-icon icon="content-save"></or-icon>
                            Thêm
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showCreatePlaylistModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
            ${this.showSelectContentModal ? this.renderSelectContentModal() : null}
        `;
    }

    private renderSelectContentModal(): TemplateResult {
        return html`
            <div class="modal-overlay" style="z-index: 1100;" @click=${() => this.showSelectContentModal = false}>
                <div class="modal-content" style="max-width: 500px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-body" style="padding: 16px;">
                        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                            <input type="text" class="form-input" placeholder="Nhập tên chuyên mục" style="flex: 1;" />
                            <input type="text" class="form-input" placeholder="Nhập tên nội dung" style="flex: 1;" />
                            <button class="btn btn-primary">
                                <or-icon icon="magnify"></or-icon>
                                Tìm kiếm
                            </button>
                        </div>
                        <div style="max-height: 400px; overflow: auto;">
                            ${this.renderSelectContentTree(this.categories, 0)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderSelectContentTree(categories: Category[], level: number): TemplateResult {
        return html`
            ${categories.map(cat => {
            const hasChildren = (cat.children && cat.children.length > 0) || (cat.contents && cat.contents.length > 0);
            const isExpanded = this.selectContentExpandedCategories.has(cat.id);

            return html`
                    <div class="tree-node">
                        <div class="tree-node-row" style="padding-left: ${8 + level * 16}px;">
                            ${hasChildren ? html`
                                <span class="tree-toggle ${isExpanded ? 'expanded' : ''}"
                                      @click=${() => this.toggleSelectContentCategory(cat.id)}>
                                    <or-icon icon="chevron-right"></or-icon>
                                </span>
                            ` : html`<span class="tree-toggle"></span>`}
                            <input type="checkbox" style="margin-right: 4px;" />
                            <or-icon icon="folder" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #f59e0b; margin-right: 4px;"></or-icon>
                            <span>${cat.name}</span>
                        </div>
                        ${isExpanded ? html`
                            ${cat.contents?.map(content => html`
                                <div class="tree-node-row" style="padding-left: ${24 + level * 16}px;">
                                    <span class="tree-toggle"></span>
                                    <input type="checkbox" style="margin-right: 4px;" />
                                    <or-icon icon="file-music" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #1a73e8; margin-right: 4px;"></or-icon>
                                    <span>${content.name}</span>
                                </div>
                            `)}
                            ${cat.children ? this.renderSelectContentTree(cat.children, level + 1) : null}
                        ` : null}
                    </div>
                `;
        })}
        `;
    }

    // Helper methods
    private selectDevice(id: string): void {
        this.selectedDeviceId = id;
    }

    private toggleDevice(id: string): void {
        const next = new Set(this.expandedDevices);
        next.has(id) ? next.delete(id) : next.add(id);
        this.expandedDevices = next;
    }

    private toggleCategory(id: string): void {
        const next = new Set(this.expandedCategories);
        next.has(id) ? next.delete(id) : next.add(id);
        this.expandedCategories = next;
    }

    private toggleCategorySelection(id: string): void {
        const next = new Set(this.selectedCategories);
        next.has(id) ? next.delete(id) : next.add(id);
        this.selectedCategories = next;
    }

    private toggleActionMenu(e: Event, id: string): void {
        e.stopPropagation();
        this.openActionMenu = this.openActionMenu === id ? null : id;
    }

    private openAddCategory(category: Category): void {
        this.openActionMenu = null;
        this.showAddCategoryModal = true;
    }

    private openAddContent(category: Category): void {
        this.openActionMenu = null;
        this.showAddContentModal = true;
    }

    private togglePlaylistActionMenu(e: Event, id: string): void {
        e.stopPropagation();
        if (this.openPlaylistActionMenu === id) {
            this.openPlaylistActionMenu = null;
        } else {
            const button = e.currentTarget as HTMLElement;
            const rect = button.getBoundingClientRect();
            this.playlistMenuPosition = {
                top: rect.bottom + 4,
                left: rect.left
            };
            this.openPlaylistActionMenu = id;
        }
    }

    private removePlaylistContent(contentId: string): void {
        this.playlistFormContents = this.playlistFormContents.filter(c => c.id !== contentId);
    }

    private toggleSelectContentCategory(id: string): void {
        const next = new Set(this.selectContentExpandedCategories);
        next.has(id) ? next.delete(id) : next.add(id);
        this.selectContentExpandedCategories = next;
    }

    private getTotalContentCount(): number {
        let count = 0;
        const countContents = (cats: Category[]) => {
            cats.forEach(cat => {
                count += cat.contents?.length || 0;
                if (cat.children) countContents(cat.children);
            });
        };
        countContents(this.categories);
        return count;
    }

    private openPlaylistDetail(e: Event, playlistId: string): void {
        e.preventDefault();
        this.selectedPlaylistId = playlistId;
        // Load mock contents for this playlist
        this.playlistDetailContents = [
            { id: "pc1", name: "Bản tin thời sự", categoryId: "cat1", format: "mp3", duration: "00:10:20", categoryName: "Bản tin thời sự" },
            { id: "pc2", name: "Tin bão số 5", categoryId: "cat2", format: "mp3", duration: "00:05:30", categoryName: "Bản tin cảnh báo" },
            { id: "pc3", name: "Tin thời tiết", categoryId: "cat1", format: "mp3", duration: "00:03:15", categoryName: "Bản tin thời sự" },
        ];
        this.showPlaylistDetailModal = true;
    }

    private getSelectedPlaylist(): Playlist | undefined {
        return this.playlists.find(pl => pl.id === this.selectedPlaylistId);
    }

    private getSelectedContentsCount(): number {
        // Count selected categories and contents
        return this.selectedCategories.size;
    }

    private toggleExistingPlaylistSelection(playlistId: string): void {
        const next = new Set(this.selectedExistingPlaylists);
        next.has(playlistId) ? next.delete(playlistId) : next.add(playlistId);
        this.selectedExistingPlaylists = next;
    }

    private handleCreateNewPlaylist(): void {
        if (!this.newPlaylistName.trim()) return;

        const newPlaylist: Playlist = {
            id: `pl-${Date.now()}`,
            name: this.newPlaylistName,
            isShared: this.newPlaylistIsShared,
            contentCount: this.getSelectedContentsCount(),
            areaName: "Phường Ba Đình, Thành phố Hà Nội",
            createdBy: "Admin",
            createdAt: new Date().toLocaleDateString('vi-VN')
        };

        this.playlists = [...this.playlists, newPlaylist];
        this.newPlaylistName = "";
        this.newPlaylistIsShared = false;
        this.showAddToPlaylistModal = false;
    }

    private handleAddToExistingPlaylists(): void {
        const countToAdd = this.getSelectedContentsCount();
        this.playlists = this.playlists.map(pl => {
            if (this.selectedExistingPlaylists.has(pl.id)) {
                return { ...pl, contentCount: pl.contentCount + countToAdd };
            }
            return pl;
        });
        this.selectedExistingPlaylists = new Set();
        this.showAddToPlaylistModal = false;
    }

    private handleDragStart(e: DragEvent, index: number): void {
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index.toString());
        }
    }

    private handleDragOver(e: DragEvent): void {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
    }

    private handleDrop(e: DragEvent, targetIndex: number): void {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer?.getData('text/plain') || '0');
        if (sourceIndex === targetIndex) return;

        const items = [...this.playlistDetailContents];
        const [removed] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, removed);
        this.playlistDetailContents = items;
    }

    private removePlaylistDetailContent(contentId: string): void {
        this.playlistDetailContents = this.playlistDetailContents.filter(c => c.id !== contentId);
    }

    private renderPlaylistDetailModal(): TemplateResult {
        const playlist = this.getSelectedPlaylist();
        if (!playlist) return html``;

        return html`
            <div class="modal-overlay" @click=${() => this.showPlaylistDetailModal = false}>
                <div class="modal-content" style="max-width: 800px;" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="modal-header">
                        <div>
                            <div class="modal-location">Thành phố Hà Nội > ${playlist.areaName?.split(',')[0] || 'Phường Ba Đình'}</div>
                            <div class="modal-title">
                                <or-icon icon="playlist-music" style="--or-icon-width: 20px; --or-icon-height: 20px; color: #1a73e8;"></or-icon>
                                Chi tiết danh sách phát: ${playlist.name}
                            </div>
                        </div>
                        <button class="btn-icon" @click=${() => this.showPlaylistDetailModal = false}>
                            <or-icon icon="close"></or-icon>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <label style="font-size: 13px; font-weight: 500; margin-bottom: 4px; display: block;">Tên danh sách <span style="color: red;">*</span></label>
                                <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #dce4f0; border-radius: 4px;" .value=${playlist.name} />
                            </div>
                            <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap; padding-top: 20px;">
                                <input type="checkbox" .checked=${playlist.isShared} />
                                Dùng chung
                            </label>
                        </div>
                        
                        <div style="font-weight: 600; margin-bottom: 12px;">Danh sách nội dung (kéo thả để sắp xếp)</div>
                        <div style="border: 1px solid #dce4f0; border-radius: 6px; overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #A8DCFD;">
                                        <th style="padding: 10px; text-align: center; width: 60px;">STT phát</th>
                                        <th style="padding: 10px; text-align: left;">Tên nội dung</th>
                                        <th style="padding: 10px; text-align: left; width: 80px;">Định dạng</th>
                                        <th style="padding: 10px; text-align: left; width: 100px;">Thời lượng</th>
                                        <th style="padding: 10px; text-align: left;">Chuyên mục</th>
                                        <th style="padding: 10px; text-align: center; width: 60px;">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.playlistDetailContents.map((content, index) => html`
                                        <tr draggable="true" 
                                            @dragstart=${(e: DragEvent) => this.handleDragStart(e, index)}
                                            @dragover=${(e: DragEvent) => this.handleDragOver(e)}
                                            @drop=${(e: DragEvent) => this.handleDrop(e, index)}
                                            style="cursor: grab; border-bottom: 1px solid #f0f4fa; transition: background 0.15s;"
                                            @dragenter=${(e: any) => e.currentTarget.style.background = '#e8f0fe'}
                                            @dragleave=${(e: any) => e.currentTarget.style.background = 'transparent'}>
                                            <td style="padding: 10px; text-align: center; font-weight: 500;">
                                                <or-icon icon="drag" style="--or-icon-width: 16px; --or-icon-height: 16px; color: #999; margin-right: 4px; cursor: grab;"></or-icon>
                                                ${(index + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td style="padding: 10px;">${content.name}</td>
                                            <td style="padding: 10px;">${content.format?.toUpperCase()}</td>
                                            <td style="padding: 10px;">${content.duration}</td>
                                            <td style="padding: 10px;">${content.categoryName}</td>
                                            <td style="padding: 10px; text-align: center;">
                                                <button class="btn-icon" style="color: #ef4444;" @click=${() => this.removePlaylistDetailContent(content.id)}>
                                                    <or-icon icon="delete" style="--or-icon-width: 18px; --or-icon-height: 18px;"></or-icon>
                                                </button>
                                            </td>
                                        </tr>
                                    `)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">
                            <or-icon icon="content-save"></or-icon>
                            Lưu
                        </button>
                        <button class="btn btn-secondary" @click=${() => this.showPlaylistDetailModal = false}>
                            <or-icon icon="close"></or-icon>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "category-content-shell": CategoryContentShell;
    }
}
