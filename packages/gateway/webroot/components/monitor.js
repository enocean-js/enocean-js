import {
  html,
  css,
  unsafeHTML,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";

const apiClient = EnoceanJSElement.apiClient;
const utils = EnoceanJSElement.utils;
class EnoceanMonitor extends EnoceanJSElement {
  constructor() {
    super();
    this.lines = [];
    this.filter = "";
  }
  static properties = {
    lines: { type: Array },
    filter: { type: String },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_unknown = apiClient.on("unknown-device", (event) => {
      if (this.filter && event.input_rorg.toString(16) == this.filter) {
        this.printLine(html`${toHTML(event.raw)}`, "unknown-device");
      }
    });
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      //console.log(this.utils.erp1.toHTML(event.raw));
      if (this.filter === "" || event.profile.meta.rorg == this.filter) {
        this.printLine(html`${toHTML(event.raw)}`, "known-device");
      }
    });
    this.unsubscribe_other = apiClient.on("other-data", (event) => {
      console.log(event);
      this.printLine(html`${utils.toString(event)}`, "other-data");
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_unknown(); // unsubscribe
    this.unsubscribe_known(); // unsubscribe
  }
  printLine(text, type = "info") {
    const new_lines = [...this.lines];
    new_lines.push({ text, type });
    if (new_lines.length > 100) {
      new_lines.shift();
    }
    this.lines = new_lines;
  }
  static styles = css`
    :host {
      display: block;
    }
    .line {
      display: flex;
      padding-top: 2px;
      color: #ddd;
      font-family: monospace;
      cursor: pointer;
    }
    .known-device,
    .value.boolean.true {
      color: var(--color-accent, #4caf50);
    }
    .unknown-device {
      color: var(--color-danger, #0e70c0ff);
    }
    .known-device-no-eep,
    .value.boolean.false {
      color: var(--color-danger, #f44336);
    }
    .key {
      color: var(--color-key, #0e70c0ff);
    }
    .value {
      color: var(--color-value, #03a9f4);
    }
    #container {
      padding: 10px;
      height: 80vh;
      overflow: scroll;
      background: var(--color-background, #333);
    }
    .erp1_telegram {
      display: flex;
      color: #555;
    }
    .erp1_telegram div {
      display: flex;
    }
    .erp1_data {
      color: aquamarine;
    }
    .erp1_optional_data {
      color: palegreen;
    }
    .erp1_header {
      color: khaki;
    }
    .erp1_rorg {
      font-weight: bold;
    }
    .erp1_senderId {
      color: lightseagreen;
      font-weight: bold;
    }
    .erp1_destinationId {
      color: springgreen;
      font-weight: bold;
    }

    .erp1_telegram span::before {
      content: ".";
    }
    .erp1_telegram .erp1_syncByte::before {
      content: "" !important;
    }
  `;

  render() {
    const reversed = [...this.lines].reverse();
    return html`<div id="container">
      <div id="content">
        ${reversed.map(
          (line) => html`<div class="line">>&nbsp;${line.text}</div>`
        )}
      </div>
    </div>`;
  }
}
customElements.define("enocean-monitor", EnoceanMonitor);
function toHTML(tel) {
  const telegram = utils.erp1.parse(tel);
  return html`
    <div class="erp1_telegram" style="user-select: text;">
      <span class="erp1_syncByte">${utils.toString(telegram.syncByte)}</span>
      <div class="erp1_header" style="white-space:nowrap;">
        <span class="erp1_length"
          >${utils.toString([0, telegram.header.length])}</span
        ><span class="erp1_optionalLength"
          >${utils.toString(telegram.header.optionalLength)}</span
        ><span class="erp1_packetType"
          >${utils.toString(telegram.header.paketType)}</span
        >
      </div>
      <span class="erp1_HeaderCRC">${utils.toString(telegram.headerCRC)}</span>
      <div class="erp1_body" style="white-space:nowrap;">
        <div class="erp1_data" style="white-space:nowrap;">
          <span class="erp1_rorg">${utils.toString(telegram.data.rorg)}</span
          ><span class="erp1_payload"
            >${utils.toString(telegram.data.payload)}</span
          ><span class="erp1_senderId"
            >${utils.toString(telegram.data.senderId)}</span
          ><span class="erp1_status"
            >${utils.toString(telegram.data.status)}</span
          >
        </div>
        <div class="erp1_optional_data" style="white-space:nowrap;">
          <span class="erp1_subTelNum"
            >${utils.toString(telegram.optionalData.subTelNum)}</span
          ><span class="erp1_destinationId"
            >${utils.toString(telegram.optionalData.destinationId)}</span
          ><span class="erp1_signalStrength"
            >${utils.toString(telegram.optionalData.signalStrength)}</span
          ><span class="erp1_securityLevel"
            >${utils.toString(telegram.optionalData.securityLevel)}</span
          >
        </div>
      </div>
      <span class="erp1_dataCRC">${utils.toString(telegram.dataCRC)}</span>
    </div>
  `;
}
