import { manager } from "@openremote/core";
import { AppStateKeyed, HeaderItem, OrApp } from "@openremote/or-app";
import { AnyAction } from "@reduxjs/toolkit";
import { getMapRoute, getReportRoute, getReportDashboard } from "./routes";

export function headerItemAdministration<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "cog",
        href: "administration",
        text: "Quản trị"
    };
}

export function headerItemCategoryContent<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "folder-music",
        href: "category-content",
        text: "Chuyên mục và nội dung"
    };
}

export function headerItemHome<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "home",
        value: "home",
        href: "home",
        text: "Home",
    };
}

export function headerItemRapport<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "rapport",
        value: "rapport",
        href: "rapport",
        text: "Rapport",
    };
}

export function headerItemMap<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "map",
        href: getMapRoute(),
        text: "map"
    };
}
export function headerItemDashBoard<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "view-dashboard-edit",
        href: "dashBoard2",
        text: "DashBoard"
    };
}
export function headerItemRoute<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "routes",
        href: "routes",
        text: "Routes"
    };
}
export function headerItemCabinet<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "file-cabinet",
        href: "cabinets",
        text: "Cabinets"
    };
}
export function headerItemLight<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "lightbulb",
        href: "light",
        text: "Light",
        value: "Light",
    };
}
export function headerItemScenario<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "lightbulb",
        href: "scenario",
        text: "Scenario"
    };
}
export function headerItemReport<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "file-excel-box",
        href: "report",
        text: "Report"
    };
}

export function headerItemAssets<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "rhombus-split",
        value: "assets",
        href: "assets",
        text: "asset_plural",
    };
}

export function headerItemRules<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "state-machine",
        href: "rules",
        text: "rule_plural",
        hideMobile: true,
        roles: () => !manager.hasRealmRole("restricted_user")
    };
}

export function headerItemInsights<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "chart-areaspline",
        href: "insights",
        text: "insights"
    };
}

export function headerItemGatewayConnection<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "cloud",
        value: "gateway",
        href: "gateway",
        text: "gatewayConnection",
        roles: ["write:admin", "read:admin"]
    };
}

export function headerItemLanguage<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "web",
        value: "language",
        text: "language",
        action: () => {
            orApp.showLanguageModal();
        }
    };
}

export function headerItemLogout<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "logout",
        value: "logout",
        text: "logout",
        action: () => {
            orApp.logout();
        }
    };
}

export function headerItemLogs<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "text-box-search-outline",
        value: "logs",
        href: "logs",
        text: "logs",
        hideMobile: true
    };
}
export function headerItemAccount<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "account",
        value: "account",
        href: "account",
        text: "account",
        roles: {
            account: ["manage-account"]
        }
    };
}
export function headerItemUsers<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "account-group",
        value: "users",
        href: "users",
        text: "user_plural"
    };
}
export function headerItemRoles<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "account-box-multiple",
        value: "roles",
        href: "roles",
        text: "role_plural",
        roles: ["read:admin", "write:admin"]
    };
}
export function headerItemRealms<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "domain",
        value: "realms",
        href: "realms",
        text: "realm_plural",
        roles: () => manager.isSuperUser()
    };
}

export function headerItemExport<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "database-export",
        value: "export",
        href: "data-export",
        text: "dataExport"
    };
}

export function headerItemProvisioning<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "cellphone-cog",
        value: "provisioning",
        href: "provisioning",
        text: "autoProvisioning",
        roles: () => manager.isSuperUser()
    };
}

export function headerItemConfiguration<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "palette-outline",
        value: "configuration",
        href: "configuration",
        text: "appearance",
        roles: () => manager.isSuperUser()
    };
}

export function headerItemMasterData<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "database",
        value: "masterData",
        href: "master-data",
        text: "masterdata"
    }
}
export function headerItemWarning<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "alert",
        value: "warningConfig",
        href: "warning-config",
        text: "warningConfig"
    }
}

export function headerItemSchedule<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "calendar-clock",
        value: "schedule",
        href: "schedule",
        text: "Schedule"
    }
}

export function headerItemitSupport<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "account-wrench",
        value: "itSupport",
        href: "it-support",
        text: "itSupport",
    }
}

export function headerItemBlog<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "post",
        value: "blog",
        href: "blog",
        text: "Blog",
    }
}

export function headerItemBlogPublic<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "post",
        value: "blog-public",
        href: "blog-public",
        text: "Blog"
    };
}

export function headerItemBroadcastSchedule<S extends AppStateKeyed, A extends AnyAction>(orApp: OrApp<S>): HeaderItem {
    return {
        icon: "calendar-clock",
        value: "broadcastSchedule",
        href: "broadcast-schedule",
        text: "Lịch phát"
    };
}

