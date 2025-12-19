import { AppStateKeyed, PageProvider } from "@openremote/or-app";
import { HomePage } from "./home-page";

export function homePageProvider(store: any): PageProvider<AppStateKeyed> {
  return {
    name: "home",
    routes: ["home"],
    pageCreator: () => new HomePage(store),
  };
}
