import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import "./connection.js";

class HeaderComponenet extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: #333;
      color: white;
      padding: 10px 20px;
      font-family: Arial, sans-serif;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h1 {
      margin: 0;
      font-size: 1.5em;
    }
    nav a {
      color: white;
      text-decoration: none;
      margin-left: 15px;
      font-size: 1em;
    }
    nav a:hover {
      text-decoration: underline;
    }
  `;

  render() {
    return html`
      <header>
        <h1>Enocean-JS Gateway</h1>
        <nav>
          <connection-component></connection-component>
        </nav>
      </header>
    `;
  }
}
customElements.define("header-component", HeaderComponenet);
