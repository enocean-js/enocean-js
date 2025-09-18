import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
const apiClient = EnoceanJSElement.apiClient;

class EditorPropSimple extends EnoceanJSElement {
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
    .small {
      width: 100px;
    }
  `;
  render() {
    return html``;
  }
}

customElements.define("ed-prop-simple", EditorPropSimple);
