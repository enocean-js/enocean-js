import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
const apiClient = EnoceanJSElement.apiClient;

class EditorPropList extends EnoceanJSElement {
  constructor() {
    super();
  }

  static properties = {};
  static styles = css`
    :host {
      cursor: arrow;
      display: block;
    }
    material-icon {
      vertical-align: middle;
    }
    .blink {
      color: green;
    }
  `;
  render() {
    return html` <div>Property List Editor - not implemented yet</div> `;
  }
}

customElements.define("ed-prop-list", EditorPropList);
