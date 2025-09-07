import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
const apiClient = EnoceanJSElement.apiClient;

class ConnectionComponent extends EnoceanJSElement {
  constructor() {
    super();
    this.active = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_open = apiClient.on("serialport-open", () => {
      this.active = true;
    });
    this.unsubscribe_close = apiClient.on("serialport-close", () => {
      this.active = false;
    });
    this.unsubscribe_radio = apiClient.on("radio-erp1", () => {
      this.blink();
    });
    (async () => {
      this.active = await apiClient.isPortOpen();
    })();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_open(); // unsubscribe
    this.unsubscribe_close(); // unsubscribe
    this.unsubscribe_radio(); // unsubscribe
  }
  static properties = {
    active: { type: Boolean },
  };
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
  async _toggleConnection() {
    if (this.active) {
      await apiClient.closePort();
    } else {
      await apiClient.openPort("/dev/ttyUSB0");
    }
  }
  async blink() {
    this.shadowRoot.querySelector("#icon").classList.add("blink");
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.shadowRoot.querySelector("#icon").classList.remove("blink");
  }
  render() {
    return html`
      <material-icon
        id="icon"
        title="Serial Port Connection"
        @click="${this._toggleConnection}"
        icon="${this.active ? "bigtop_updates" : "signal_disconnected"}"
      ></material-icon>
    `;
  }
}

customElements.define("connection-component", ConnectionComponent);
