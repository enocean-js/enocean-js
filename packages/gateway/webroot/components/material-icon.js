import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

class MaterialIcon extends LitElement {
  constructor() {
    super();
  }
  static get properties() {
    return {
      icon: { type: String },
    };
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    .symbol {
      user-select: none;
      font-family: "Material Symbols Rounded";
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: "liga";
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      vertical-align: middle;
    }
  `;

  render() {
    return html`<span class="symbol">${this.icon}</span>`;
  }
}
customElements.define("material-icon", MaterialIcon);
