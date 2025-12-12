// Declare require method which we'll use for importing webpack resources (using ES6 imports will confuse typescript parser)
import {pageProvisioningProvider} from "./pages/page-provisioning";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import "@openremote/or-app";
import {AppConfig, appReducer, HeaderConfig, HeaderItem, OrApp, PageProvider, RealmAppConfig} from "@openremote/or-app";
import {
    headerItemAccount,
    headerItemAssets, headerItemCabinet,
    headerItemConfiguration, headerItemDashBoard,
    headerItemExport,
    headerItemGatewayConnection,
    headerItemInsights,
    headerItemLanguage,
    headerItemLogout,
    headerItemLogs,
    headerItemMap, headerItemMasterData, headerItemLight, headerItemWarning,
    headerItemProvisioning,
    headerItemRealms, headerItemReport,
    headerItemRoles, headerItemRoute,
    headerItemRules,
    headerItemUsers, headerItemScenario,
    headerItemSchedule,
    headerItemitSupport, headerItemBlog, headerItemBlogPublic
} from "./headers";
import "./pages/page-map";
import {PageMapConfig, pageMapProvider, pageMapReducer} from "./pages/page-map";
import "./pages/report/page-report";
import {PageReport, pageReportProvider} from "./pages/report/page-report";
import "./pages/dashboard/dashboard-home";
import {PageHomeDashBoard, pageDashboardProvider} from "./pages/dashboard/dashboard-home";
import "./pages/routes/routes-home"
import {RoutesHome,pageRoutesProvider} from "./pages/routes/routes-home"
import"./pages/Cabinets/cabinets-home"
import {PageHomeCabinets,pageCabinetsProvider} from "./pages/Cabinets/cabinets-home";
import "./pages/page-assets";
import {PageAssetsConfig, pageAssetsProvider, pageAssetsReducer} from "./pages/page-assets";
import "./pages/page-gateway";
import {pageGatewayProvider} from "./pages/page-gateway";
import "./pages/page-insights";
import {PageInsightsConfig, pageInsightsProvider} from "./pages/page-insights";
import "./pages/page-rules";
import {PageRulesConfig, pageRulesProvider} from "./pages/page-rules";
import "./pages/page-logs";
import {PageLogsConfig, pageLogsProvider} from "./pages/page-logs";
import "./pages/page-account";
import {pageAccountProvider} from "./pages/page-account";
import "./pages/page-users";
import {pageUsersProvider} from "./pages/page-users";
import "./pages/page-roles";
import {pageRolesProvider} from "./pages/page-roles";
import "./pages/page-realms";
import {pageRealmsProvider} from "./pages/page-realms";
import {pageExportProvider} from "./pages/page-export";
import { pageConfigurationProvider } from "./pages/page-configuration";
import { ManagerAppConfig } from "@openremote/model";
import "./pages/light/light-home"
import {LightHome, pageLightProvider} from "./pages/light/light-home";
import "./pages/scenario/scenario-home"
import {ScenarioHome,pageScenarioProvider} from "./pages/scenario/scenario-home";
import {ScheduleHome,pageScheduleProvider} from "./pages/schedule/schedule-home";
import {pageMasterData} from "./pages/master_data/page-masterdata";
import {pageWarning} from "./pages/warning/page-warning";
import {pageitSupportProvider, ItSupportHome} from "./pages/itSupport/itSupport-home";
import {pageItSupportDetailProvider} from "./pages/itSupport/itSupport-detail";
import {pageBlogProvider} from "./pages/blog/blog-home";
import {pageBlogDetailProvider} from "./pages/blog/blog-detail";
import { BlogPublicHome } from "./pages/blog/blog-public-home"
import { BlogPublicDetail } from "./pages/blog/blog-public-detail";
import { BlogCreatePageWrapper } from "./pages/blog/blog-create-page";
import { BlogEditPage } from "./pages/blog/blog-edit-page";

function pageBlogPublicHomeProvider(store: any) {
  return {
    name: "blogPublicHome",
    routes: ["blog-public"],
    pageCreator: () => new BlogPublicHome(store),
  };
}

function pageBlogPublicDetailProvider(store: any) {
  return {
    name: "blogPublicDetail",
    routes: ["blog-public/:id"],
    pageCreator: () => new BlogPublicDetail(store),
  };
}

function pageBlogCreateProvider(store: any) {
  return {
    name: "blogCreatePage",
    routes: ["blog/create"],
    pageCreator: () => new BlogCreatePageWrapper(store),
  };
}

function pageBlogEditProvider(store: any) {
  return {
    name: "blogEditPage",
    routes: ["blog/edit/:id"],
    pageCreator: () => new BlogEditPage(store),
  };
}

declare var CONFIG_URL_PREFIX: string;

const rootReducer = combineReducers({
    app: appReducer,
    map: pageMapReducer,
    assets: pageAssetsReducer
});

type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: rootReducer
});

const orApp = new OrApp(store);

export const DefaultPagesConfig: PageProvider<any>[] = [
    pageMapProvider(store),
    pageAssetsProvider(store),
    pageGatewayProvider(store),
    pageLogsProvider(store),
    pageInsightsProvider(store),
    pageRulesProvider(store),
    pageAccountProvider(store),
    pageRolesProvider(store),
    pageUsersProvider(store),
    pageRealmsProvider(store),
    pageExportProvider(store),
    pageProvisioningProvider(store),
    pageConfigurationProvider(store),
    pageReportProvider(store),
    pageDashboardProvider(store),
    pageRoutesProvider(store),
    pageCabinetsProvider(store),
    pageLightProvider(store),
    pageMasterData(store),
    pageWarning(store),
    pageScenarioProvider(store),
    pageScheduleProvider(store),
    pageitSupportProvider(store),
    pageItSupportDetailProvider(store),
    pageBlogProvider(store),
    pageBlogDetailProvider(store),
    pageBlogCreateProvider(store),
    pageBlogEditProvider(store),
    pageBlogPublicHomeProvider(store),
    pageBlogPublicDetailProvider(store)
];

export const DefaultHeaderMainMenu: {[name: string]: HeaderItem} = {
    // dashboard:headerItemDashBoard(orApp),
    // blogPublic: headerItemBlogPublic(orApp),
    map: headerItemMap(orApp),
    routes:headerItemRoute(orApp),
    cabinets:headerItemCabinet(orApp),
    schedule:headerItemSchedule(orApp),
    //assets: headerItemAssets(orApp),
    rules: headerItemRules(orApp),
    insights: headerItemInsights(orApp),
    report:headerItemReport(orApp),
    // light:headerItemLight(orApp)
    // scenario:headerItemScenario(orApp)
};

export const DefaultHeaderSecondaryMenu: {[name: string]: HeaderItem} = {
    gateway: headerItemGatewayConnection(orApp),
    language: headerItemLanguage(orApp),
    logs: headerItemLogs(orApp),
    account: headerItemAccount(orApp),
    masterdata: headerItemMasterData(orApp),
    users: headerItemUsers(orApp),
    warningConfig:headerItemWarning(orApp),
    roles: headerItemRoles(orApp),
    realms: headerItemRealms(orApp),
    export: headerItemExport(orApp),
    provisioning: headerItemProvisioning(orApp),
    configuration: headerItemConfiguration(orApp),
    assets: headerItemAssets(orApp),
    light:headerItemLight(orApp),
    itSupport: headerItemitSupport(orApp),
    blog: headerItemBlog(orApp),
    logout: headerItemLogout(orApp),

};

export const DefaultHeaderConfig: HeaderConfig = {
    mainMenu: Object.values(DefaultHeaderMainMenu),
    secondaryMenu: Object.values(DefaultHeaderSecondaryMenu)
};

export const DefaultRealmConfig: RealmAppConfig = {
    appTitle: "IOT",
    header: DefaultHeaderConfig
};

export const DefaultAppConfig: AppConfig<RootState> = {
    pages: DefaultPagesConfig,
    superUserHeader: DefaultHeaderConfig,
    realms: {
        default: DefaultRealmConfig
    }
};

// Try and load the app config from JSON and if anything is found amalgamate it with default
const configURL = (CONFIG_URL_PREFIX || "") + "/manager_config.json";

fetch(configURL).then(async (result) => {
    if (!result.ok) {
        return DefaultAppConfig;
    }

    return await result.json() as ManagerAppConfig;

}).then((appConfig: ManagerAppConfig) => {

    // Set locales and load path
    if (!appConfig.manager) {
        appConfig.manager = {};
    }

    if (appConfig.loadLocales) {
        appConfig.manager.loadTranslations = ["app", "or"];

        if (!appConfig.manager.translationsLoadPath) {
            appConfig.manager.translationsLoadPath = "/locales/{{lng}}/{{ns}}.json";
        }
    }

    // Add config prefix if defined (used in dev)
    if (CONFIG_URL_PREFIX) {
        if (appConfig.manager.translationsLoadPath) {
            appConfig.manager.translationsLoadPath = CONFIG_URL_PREFIX + appConfig.manager.translationsLoadPath;
        }
    }

    orApp.managerConfig = appConfig.manager;

    orApp.appConfigProvider = (manager) => {

        // Build pages
        let pages: PageProvider<any>[] = [...DefaultPagesConfig];

        if (!(manager.isSuperUser() && manager.username === "admin") && appConfig.pages) {

            // Replace any supplied page configs
            pages = pages.map(pageProvider => {
                const config = appConfig.pages[pageProvider.name];

                switch (pageProvider.name) {
                    case "dashBoard2": {
                        pageProvider = config ? pageDashboardProvider(store, config as PageHomeDashBoard) : pageProvider;
                        break;
                    }
                    case "cabinets": {
                        pageProvider = config ? pageCabinetsProvider(store, config as PageHomeCabinets) : pageProvider;
                        break;
                    }
                    case "routes": {
                        pageProvider = config ? pageRoutesProvider(store, config as RoutesHome) : pageProvider;
                        break;
                    }
                    case "map": {
                        pageProvider = config ? pageMapProvider(store, config as PageMapConfig) : pageProvider;
                        break;
                    }
                    case "assets": {
                        pageProvider = config ? pageAssetsProvider(store, config as PageAssetsConfig) : pageProvider;
                        break;
                    }
                    case "rules": {
                        pageProvider = config ? pageRulesProvider(store, config as PageRulesConfig) : pageProvider;
                        break;
                    }
                    case "insights": {
                        pageProvider = config ? pageInsightsProvider(store, config as PageInsightsConfig) : pageProvider;
                        break;
                    }
                    case "report": {
                        pageProvider = config ? pageReportProvider(store, config as PageReport) : pageProvider;
                        break;
                    }
                    case "logs": {
                        pageProvider = config ? pageLogsProvider(store, config as PageLogsConfig) : pageProvider;
                        break;
                    }
                    case "scenario": {
                        pageProvider = config ? pageScenarioProvider(store, config as ScenarioHome) : pageProvider;
                        break;
                    }
                    case "schedule": {
                        pageProvider = config ? pageScheduleProvider(store, config as ScheduleHome) : pageProvider;
                        break;
                    }
                    case "light": {
                        pageProvider = config ? pageLightProvider(store, config as LightHome) : pageProvider;
                        break;
                    }
                    case "itSupport": {
                        pageProvider = config ? pageitSupportProvider(store, config as ItSupportHome) : pageProvider;
                        break;
                    }
                }

                return pageProvider;
            });
        }

        const orAppConfig: AppConfig<RootState> = {
            pages: pages,
            superUserHeader: DefaultHeaderConfig
        };

        // Configure realms
        if (!appConfig.realms) {
            orAppConfig.realms = {
                default: {...DefaultRealmConfig, header: DefaultHeaderConfig}
            };
        } else {
            orAppConfig.realms = {};
            const defaultRealm = appConfig.realms.default ? {...DefaultRealmConfig,...appConfig.realms.default} : DefaultRealmConfig;
            orAppConfig.realms.default = defaultRealm;

            Object.entries(appConfig.realms).forEach(([name, realmConfig]) => {

                const normalisedConfig = {...defaultRealm,...realmConfig};

                let headers = DefaultHeaderConfig;

                if (normalisedConfig.headers) {
                    headers = {
                        mainMenu: [],
                        secondaryMenu: []
                    };
                    normalisedConfig.headers.forEach((pageName) => {
                        // Insert header
                        if (DefaultHeaderMainMenu.hasOwnProperty(pageName)) {
                            headers.mainMenu.push(DefaultHeaderMainMenu[pageName]);
                        } else if (DefaultHeaderSecondaryMenu.hasOwnProperty(pageName)) {
                            headers.secondaryMenu!.push(DefaultHeaderSecondaryMenu[pageName]);
                        }
                    });
                }

                orAppConfig.realms[name] = { ...defaultRealm, header: headers, ...(realmConfig as RealmAppConfig) };
            });
        }

        // Check local storage for set language, otherwise use language set in config
        manager.console.retrieveData("LANGUAGE").then((value: string | undefined) => {
            if (value) {
                function getCookie(name){
                    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
                    return match ? decodeURIComponent(match[2]) : null;
                }
                const cookieLang = getCookie('KEYCLOAK_LOCALE2');
                const sessionLanguage = sessionStorage.getItem("KEYCLOAK_LOCALE3");
                // if(sessionLanguage)
                if(sessionLanguage !== ""){
                    manager.language = sessionLanguage;
                }else
                if(cookieLang !== ""){
                    manager.language = cookieLang;
                }else{
                    manager.language = value;
                }
            } else if (orAppConfig.realms[manager.displayRealm]) {
                manager.language = orAppConfig.realms[manager.displayRealm].language
            } else if (orAppConfig.realms['default']) {
                manager.language = orAppConfig.realms['default'].language
            } else {
                manager.language = 'en'
            }
        }).catch(reason => {
            console.error("Failed to initialise app: " + reason);
        })


        // Add config prefix if defined (used in dev)
        if (CONFIG_URL_PREFIX) {
            Object.values(orAppConfig.realms).forEach((realmConfig) => {
                if (typeof (realmConfig.logo) === "string") {
                    realmConfig.logo = CONFIG_URL_PREFIX + realmConfig.logo;
                }
                if (typeof (realmConfig.logoMobile) === "string") {
                    realmConfig.logoMobile = CONFIG_URL_PREFIX + realmConfig.logoMobile;
                }
            });
        }

        return orAppConfig;
    };

    document.body.appendChild(orApp);
});
