// Import Lit from CDN
import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

class CardElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: #fff;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("card-element", CardElement);
// Usage: <card-element>...</card-element>
