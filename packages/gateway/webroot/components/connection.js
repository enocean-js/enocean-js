import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

class ConnectionComponent extends LitElement {
  constructor() {
    super();
    this.connected = false;
    isPortOpen().then((isOpen) => {
      console.log("Port open:", isOpen, this);
      this.enocean_connected = isOpen;
      this.requestUpdate();
    });
  }
  connectedCallback() {
    super.connectedCallback();
    window.eventSource.addEventListener("serialport-open", (event) => {
      this.enocean_connected = true;
    });
    window.eventSource.addEventListener("serialport-close", (event) => {
      this.enocean_connected = false;
    });
    window.eventSource.addEventListener("radio-erp1", (event) => {
      this.blink();
    });
  }
  static properties = {
    enocean_connected: { type: Boolean },
  };
  static styles = css`
    :host {
      cursor: arrow;
      display: block;
      background-color: #333;
      color: white;
    }
    .symbol {
      transition: color 0.1s;
      user-select: none;
      font-family: "Material Symbols Rounded";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: "liga";
      -webkit-font-smoothing: antialiased;
      color: #ddd;
      box-sizing: border-box;
    }
    .blink {
      color: green;
    }
  `;
  async _toggleConnection() {
    if (this.enocean_connected) {
      await closePort();
    } else {
      await openPort("/dev/ttyUSB0");
    }
  }
  async blink() {
    this.shadowRoot.querySelector(".symbol").classList.add("blink");
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.shadowRoot.querySelector(".symbol").classList.remove("blink");
  }
  render() {
    return html`
      <div @click=${this._toggleConnection} title="Connection Status">
        ${this.enocean_connected
          ? html`<span class="symbol">bigtop_updates</span>`
          : html`<span class="symbol">signal_disconnected</span>`}
      </div>
    `;
  }
}

async function isPortOpen() {
  const portStatusResponse = await fetch("/api/port_status");
  return (await portStatusResponse.json()).isOpen;
}
async function openPort(port) {
  const openPortResponse = await fetch(`/api/open_port?port=${port}`);
  return await openPortResponse.json();
}
async function closePort() {
  const closePortResponse = await fetch(`/api/close_port`);
  return await closePortResponse.json();
}

customElements.define("connection-component", ConnectionComponent);
