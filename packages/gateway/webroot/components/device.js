import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";

const apiClient = EnoceanJSElement.apiClient;

const deviceIconMap = {
  "f6-02-01": "switch",
  "a5-10-03": "thermostat",
};

class EnoceanDevice extends EnoceanJSElement {
  constructor() {
    super();
    this.profile = {};
    this.last_telegram = "";
  }
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .device {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      margin: 10px;
      border-radius: 10px;
    }
    .data {
      padding: 10px;
    }
    .header {
      padding: 5px;
      border-radius: 10px 10px 0 0;
      display: flex;
      gap: 10px;
      font-weight: bold;
      font-size: 1.2em;
      background: #38a;
      color: white;
    }
    .header.new {
      background: #3a8;
    }
    .info {
      font-size: 0.8em;
      align-self: center;
    }
    .footer {
      padding: 5px;
      border-radius: 0 0 10px 10px;
      font-size: 0.7em;
      color: #222;
      text-align: right;
    }
  `;
  static properties = {
    profile: { type: String },
    name: { type: String },
    eep: { type: String },
    id: { type: String },
    last_telegram: { type: String },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      //console.log("device data", event);
      if (event.senderId == this.id) {
        this.last_telegram = JSON.stringify(event);
      }
    });
  }

  async setName(e) {
    console.log("set name", e.target.innerText);
    const newName = e.target.innerText;
    await apiClient.setDeviceName(this.id, newName);
    this.name = newName;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_known(); // unsubscribe
  }

  render() {
    const profile = JSON.parse(this.profile || "{}");
    const last = this.last_telegram
      ? JSON.parse(this.last_telegram)
      : { data: { data: { name: "foo", type: "bar" } } };
    const findReading = (name) => {
      let ret = profile.readings.find((r) => r.name === name);
      return ret;
    };
    console.log("render device", this.name, this.name == "New Device");
    return html` <div class="device">
      <div class="header ${this.name == "New Device" ? "new" : ""}">
        <material-icon
          icon="${deviceIconMap[this.eep] || "speed"}"
        ></material-icon>
        <div contenteditable="true" @focusout="${this.setName}">
          ${this.name}
        </div>
      </div>
      <div class="data">
        ${Object.keys(last.data)
          .map(
            (key) =>
              html`<span class="key">${key}</span> =
                <span
                  class="value ${findReading(key).type} 
                    ${last.data[key] == true ? "true" : "false"}"
                  >${last.data[key]}</span
                >`
          )
          .reduce((prev, curr) => [prev, ", ", curr])}
      </div>
      <div class="footer">${this.id} - ${this.eep}</div>
    </div>`;
  }
}
customElements.define("enocean-device", EnoceanDevice);
