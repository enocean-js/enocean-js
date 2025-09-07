import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import "./connection.js";
import "./teach-in-button.js";
import "./material-icon.js";
import "./teach-in-countdown.js";

class HeaderComponent extends LitElement {
  constructor() {
    super();
    this.minimized = true;
  }
  static get properties() {
    return { minimized: { type: Boolean } };
  }
  static styles = css`
    :host {
      width: auto;
      height: calc(100vh - 10px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: block;
      background-color: #f0f0f0;
      color: black;
      padding: 10px 10px;
      font-family: Arial, sans-serif;
      flex-shrink: 0;
    }

    nav {
      font-size: 2em;
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 10px;
      justify-content: start;
      width: 150px;
    }
    nav.hidden {
      width: 40px;
      overflow: hidden;
    }
    nav a {
      color: #333;
      text-decoration: none;
      font-size: 1em;
    }
    nav * {
      cursor: pointer;
    }
    material-icon {
      display: inline-block;
    }
    nav div {
      display: flex;
      gap: 10px;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
    lable {
      font-size: 0.5em;
      width: max-content;
    }

    nav.hidden lable {
      display: none;
    }
    a {
      text-decoration: none;
    }
    teach-in-countdown {
      display: inline-block;
    }
    footer {
      position: fixed;
      bottom: 0;
      font-size: 0.7em;
      padding: 10px;
      color: #666;
      text-align: center;
      box-sizing: border-box;
    }
    footer.hidden {
      display: none;
    }
  `;

  troggleMenue() {
    this.minimized = !this.minimized;
  }
  tibClick() {
    this.shadowRoot.getElementById("tib").toggleTeachIn();
  }
  tspClick() {
    this.shadowRoot.getElementById("tsp")._toggleConnection();
  }
  render() {
    return html`
      <nav class="${this.minimized ? "hidden" : ""}">
        <div @click="${this.troggleMenue}" style="cursor:pointer">
          <material-icon
            icon="${this.minimized ? "menu" : "arrow_back_ios"}"
          ></material-icon>
        </div>
        <div>
          <a href="index.html"
            ><material-icon icon="home"></material-icon>
            <lable>Dashboard</lable>
          </a>
        </div>
        <div>
          <a href="settings.html">
            <material-icon icon="settings"></material-icon>
            <lable>Settings</lable>
          </a>
        </div>
        <div>
          <teach-in-button id="tib"></teach-in-button>
          <lable @click="${this.tibClick}">
            Teach In - <teach-in-countdown></teach-in-countdown
          ></lable>
        </div>
        <div>
          <connection-component id="tsp"></connection-component>
          <lable @click="${this.tspClick}">Serial Port</lable>
        </div>
        <div>
          <a href="monitor.html">
            <material-icon icon="monitor"></material-icon>
            <lable>Monitor</lable>
          </a>
        </div>
      </nav>
      <footer class="${this.minimized ? "hidden" : ""}">
        <div>
          &copy; 2025 by Holger Will <br />
          Licensed under MIT<br />
          <a href="https://github.com/enocean-js/">enocean-js project</a><br />
        </div>
      </footer>
    `;
  }
}
customElements.define("header-component", HeaderComponent);
