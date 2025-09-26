import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./prop.js";

const apiClient = EnoceanJSElement.apiClient;
const utils = EnoceanJSElement.utils;

class EnoceanTabGroup extends EnoceanJSElement {
  constructor() {
    super();
    this.tabs = [];
    this.selectedIndex = 0;
  }
  static properties = {
    tabs: { type: Array },
    selectedIndex: { type: Number },
  };

  static styles = css`
    .tab-group {
      display: flex;
      flex-direction: column;
    }
    .tab-header {
      padding-top: 4px;
      display: flex;
      border-bottom: 1px solid #ccc;
    }
    .tab-head {
      display: flex;
      align-items: center;
      padding: 4px 10px;
      cursor: pointer;
      background: #f1f1f1;
      border-radius: 8px 8px 0 0;
      border: 1px solid #ccc;
    }
    .tab-head.active {
      font-weight: bold;
      border-bottom: 2px solid blue;
    }
    .tab-content {
      padding: 16px;
    }
    .tab {
      display: none;
    }
    .tab.active {
      display: block;
    }
  `;
  selectTab(index) {
    this.selectedIndex = index;
  }
  render() {
    return html`
      <div class="tab-group">
        <div class="tab-header">
          ${this.tabs.map(
            (tab, index) => html`
              <div
                class="tab-head ${this.selectedIndex === index ? "active" : ""}"
                @click=${() => this.selectTab(index)}
              >
                <material-icon icon="${tab.icon}"></material-icon>
                &nbsp;
                <div>${tab.label}</div>
              </div>
            `
          )}
        </div>
        <div class="tab-content">
          ${this.tabs.map(
            (tab, index) =>
              html`<div
                class="tab ${this.selectedIndex === index ? "active" : ""}"
              >
                ${tab.content}
              </div>`
          )}
        </div>
      </div>
    `;
  }
}
customElements.define("enocean-tab-group", EnoceanTabGroup);
