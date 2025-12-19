import { AppStateKeyed, PageProvider } from "@openremote/or-app";
import { RapportPage } from "./rapport-page";

export function rapportPageProvider(store: any): PageProvider<AppStateKeyed> {
  return {
    name: "rapport",
    routes: ["rapport"],
    pageCreator: () => new RapportPage(store),
  };
}
