// Sidebar.ts
import { html, LitElement, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import "@openremote/or-icon";
import { homePageStyles } from "./home-page.styles";

type TreeNode = { id: string; label: string; children?: TreeNode[] };

@customElement("or-sidebar")
export class Sidebar extends LitElement {
  @property() private treeData: TreeNode[] = []; // Initialize with your tree data
  @state() private expanded = new Set<string>();
  static styles = homePageStyles;

  private toggleNode(id: string): void {
    const next = new Set(this.expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded = next;
  }

  updated() {
    console.log("Sidebar treeData:", this.treeData);
  }

  private renderNode(node: TreeNode, level = 1) {
    const hasChildren = !!node.children && node.children.length > 0;
    const isOpen = this.expanded.has(node.id);

    const icon =
      level === 1
        ? "/manager/images/city.png"
        : level === 2
        ? "/manager/images/ward.png"
        : "/manager/images/mute-menu.png";

    return html`
      <li class="tree-item ${isOpen ? "open" : ""}">
        <div class="tree-row" @click=${() => hasChildren && this.toggleNode(node.id)}>
          ${hasChildren
            ? html`<or-icon class="caret" icon=${isOpen ? "chevron-down" : "chevron-right"}></or-icon>`
            : html`<span class="caret spacer"></span>`}

          <img src="${icon}" width="25" height="25" />
          <span class="tree-label">${node.label}</span>
        </div>

        ${hasChildren && isOpen
          ? html`
              <ul class="tree-children">
                ${node.children!.map((child) => this.renderNode(child, level + 1))}
              </ul>
            `
          : null}
      </li>
    `;
  }

  render() {
    return html`
      <aside class="sidepanel">
        <div class="sidepanel-header">Danh mục</div>
        <div class="sidepanel-search">
          <input type="text" placeholder="Nhập mã/ tên" />
          <or-icon class="icon-search" icon="magnify"></or-icon>
        </div>
        <ul class="tree-root">
          ${this.treeData.map((node) => this.renderNode(node))}
        </ul>
      </aside>
    `;
  }
}
