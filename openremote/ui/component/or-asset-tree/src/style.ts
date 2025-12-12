import {css, unsafeCSS} from "lit";
import { DefaultColor1, DefaultColor2, DefaultColor4, DefaultColor5, DefaultColor8 } from "@openremote/core";
import {mdiChevronRight} from "@mdi/js";
import {mdiChevronDown} from "@mdi/js";

// language=CSS
export const style = css`

    :host {       
        --internal-or-asset-tree-header-color: var(--or-asset-tree-header-color, var(--or-app-color4, ${unsafeCSS(DefaultColor4)}));     
        --internal-or-asset-tree-header-text-color: var(--or-asset-tree-header-text-color, var(--or-app-color8, ${unsafeCSS(DefaultColor8)}));
        --internal-or-asset-tree-header-menu-background-color: var(--or-asset-tree-header-menu-background-color, var(--internal-or-asset-tree-header-text-color));
        --internal-or-asset-tree-header-menu-text-color: var(--or-asset-tree-header-menu-text-color, inherit);
        --internal-or-asset-tree-header-height: var(--or-asset-tree-header-height, 48px);
        --internal-or-asset-tree-background-color: var(--or-asset-tree-background-color, var(--or-app-color1, ${unsafeCSS(DefaultColor1)}));
        --internal-or-asset-tree-text-color: var(--or-asset-tree-text-color, inherit);
        --internal-or-asset-tree-item-height: var(--or-asset-tree-item-height, 24px);
        --internal-or-asset-tree-item-padding: var(--or-asset-tree-item-padding, 10px);
        --internal-or-asset-tree-selected-background-color: var(--or-asset-tree-selected-background-color, var(--or-app-color2, ${unsafeCSS(DefaultColor2)}));
        --internal-or-asset-tree-selected-color: var(--or-asset-tree-selected-color, var(--or-app-color4, ${unsafeCSS(DefaultColor4)}));
        --internal-or-asset-tree-button-color: var(--or-asset-tree-button-color, var(--or-app-color4, ${unsafeCSS(DefaultColor4)}));
        --internal-or-asset-tree-line-color: var(--or-asset-tree-line-color, var(--or-app-color5, ${unsafeCSS(DefaultColor5)}));
        
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: var(--internal-or-asset-tree-background-color);
    }
    
    *[hidden] {
        display: none;
    }
    
    button {
        background-color: var(--internal-or-asset-tree-button-color);
        color: var(--internal-or-asset-tree-background-color);
        --or-icon-width: 20px;
        --or-icon-height: 20px;
        --or-icon-fill: var(--internal-or-asset-tree-background-color);
        border: none;
        padding: 0 6px;
        display: inline-block;
        cursor: pointer;
        opacity: 0.8;
    }

    button:focus, button:hover {
        outline: 0;
        opacity: 1;
    }
    
    #header {
        background-color: var(--internal-or-asset-tree-header-color);
        display: flex;
        align-items: center;
        width: 100%;        
        height: var(--internal-or-asset-tree-header-height);
        border-bottom: 1px solid ${unsafeCSS(DefaultColor5)};
        z-index: 1000;
        line-height: var(--internal-or-asset-tree-header-height);
        color: var(--internal-or-asset-tree-header-text-color);
        --or-icon-fill: var(--internal-or-asset-tree-header-text-color);
    }
   
    #title-container {
        flex: 1 0 auto;
        flex-direction: row;
        text-transform: capitalize;
        padding-left: 15px;
    }
    
    #title {
        font-weight: 500;
        font-size: 16px;        
    }
    
    #realm-picker {
        outline: none;
        margin-left: 5px;
        text-transform: none;
        font-size: 14px;
    }
    
    #header-btns {
        display: flex;
        flex-direction: row;
        padding-right: 5px;
    }

    #list-container {
        flex: 1 1 auto;
        overflow: auto;
        font-size: 14px;
    }
    
    #list {
        margin: 0;
        color: var(--internal-or-asset-tree-text-color);
        padding: 0;
    }
    
    #list, ol {
        list-style-type: none;
    }
        
    li ol {
        padding: 0;
    }
    
    #list li:not([data-expanded]) > ol {
        display: none;
    }
    
    #list li[data-selected] > .node-container, #list li > .node-container:hover {
        background-color: var(--internal-or-asset-tree-selected-background-color);
    }
    
    #list li[data-selected] > .node-container {
        border-left-color: var(--internal-or-asset-tree-selected-color);
    }
          
    .asset-list-element .over {
        background-color: ${unsafeCSS(DefaultColor5)};
    }
    
    .in-between-element {
        height: 3px;
    }

    .end-element {
        height: 15px;
    }
    
    .node-container {
        display: flex;
        border-left: 4px solid transparent;
        user-select: none;
        cursor: pointer;
        min-height: 40px;
        height: auto;
        align-items: center;
        padding: 8px 0;
        min-width: 0;
    }

    .node-container > * {
        flex: 0 0 auto;
    }
    
    .node-container > .node-name {
        flex: 1 1 auto;
        min-width: 0;
    }
    
    .expander {
        width: 36px;
        min-width: 36px;
        height: 40px;
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-repeat: no-repeat;                
        background-size: 18px;
        background-position: center;
        margin-left: -4px;
        border-left: 4px solid transparent;
        flex-shrink: 0;
    }
    
    .expander[data-expandable] {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='rgb(204, 204, 204)' viewBox='0 0 24 24'%3E%3Cpath d='${unsafeCSS(mdiChevronRight)}'/%3E%3C/svg%3E");
        cursor: pointer;
    }

    .expander[data-expandable]:hover {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='${unsafeCSS(mdiChevronRight)}'/%3E%3C/svg%3E");
        opacity: 0.8;
    }
    
    li[data-expanded] > .node-container .expander {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='${unsafeCSS(mdiChevronDown)}'/%3E%3C/svg%3E") !important;
    }
    
    .node-name {
        margin: -4px 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        min-width: 0;
        width: 100%;
        position: relative;
        padding-right: 60px;
    }
    
    .node-name > span {
        vertical-align: middle;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        font-size: 14px !important;
        color: inherit !important;
    }
    
    .asset-name-text {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        font-size: 14px !important;
        color: #000 !important;
        width: auto !important;
        max-width: 100% !important;
    }
    
    .node-name > or-icon {
        --or-icon-width: 18px;
        --or-icon-height: 18px;
        margin-right: 8px;
    }
    
    #loading {
        flex: 1 0 auto;
        display: inline-flex;
        align-items: center;
        text-align: center;
        margin: 0 auto;
        font-size: 14px;        
    }    
    
     @media only screen and (min-width: 768px){
        .expander {
            width: 26px;
        }
    }
    
    .mdc-list-item__graphic {
        margin-left: auto;
        display: flex;
        margin-right: 0;
        padding-right: 12px;
        flex-shrink: 0;
        align-items: center;
        gap: 6px;
        z-index: 10;
        pointer-events: auto;
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        height: 100%;
    }
    
    .mdc-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        min-width: 24px;
        min-height: 24px;
        cursor: pointer;
        position: relative;
        z-index: 11;
        pointer-events: auto;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
    }
    
    .mdc-checkbox or-icon {
        height: 24px;
        width: 24px;
        min-width: 24px;
        min-height: 24px;
        color: #666;
        display: block;
        pointer-events: none;
    }
    .mdc-checkbox or-icon.mdc-checkbox--parent {
        height: 20px;
        width: 20px;
        min-width: 20px;
        min-height: 20px;
    }

    .mdc-checkbox or-icon[icon="checkbox-marked"],
    .mdc-checkbox or-icon[icon="checkbox-multiple-marked"],
    .mdc-checkbox or-icon[icon="checkbox-multiple-marked-outline"] {
        color: var(--internal-or-asset-tree-selected-color, #4CAF50);
    }
    
    .mdc-checkbox or-icon[icon="checkbox-blank-outline"] {
        color: #666;
        opacity: 1;
    }
    
    .mdc-checkbox:hover or-icon[icon="checkbox-blank-outline"] {
        color: #333;
        opacity: 1;
    }
    
    #asset-tree-filter {
        display: flex;
        align-items: center;
        position: relative;
        background-color: var(--internal-or-asset-tree-selected-background-color);
    }
    
    #filterInput {
        padding: 7px 12px 7px 7px;
    }

    #filterAssetTypeDownIcon {
        width: 16px;
        height: 16px;
        position: absolute;
        right: 20px;
        padding-right: 14px;
        cursor: pointer;
    }
    
    #filterSettingsIcon {
        cursor: pointer;
        margin-right: 12px;
    }
    
    #asset-tree-filter-setting {
        position: absolute;
        background-color: var(--internal-or-asset-tree-background-color);
        top: calc(var(--internal-or-asset-tree-header-height) + var(--internal-or-header-height, 50px) - 1px);
        display: none;
        width: 300px;
        z-index: 100;
        box-shadow: rgb(0 0 0 / 21%) 0px 1px 3px 0px;
        box-sizing: border-box;
        padding: 10px;
    }

    #asset-tree-filter-setting .advanced-filter {
        display: flex;
        flex-direction: column;
    }

    #asset-tree-filter-setting.visible {
        display: block;
    }
    
    .filterAssetType {
        display: flex;
        align-items: center;
    }
    
    #clearIconContainer.visible {
        display: block;
    }

    #noAssetsFound {
        flex: 1 0 auto;
        display: inline-flex;
        align-items: center;
        text-align: center;
        margin: 0 auto;
        font-size: 14px;
    }
    
    .filterMatching {
        color: #808080;
    }
    
    .draggable {
        cursor: pointer;
    }
    
    .draggable:active {
        cursor: grabbing;
    }
`;
