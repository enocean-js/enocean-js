import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./prop.js";

const apiClient = EnoceanJSElement.apiClient;

const deviceIconMap = {
  "f6-02-01": "switch",
  "a5-10-03": "thermostat",
};

class EnoceanDevice extends EnoceanJSElement {
  constructor() {
    super();
    this.profile = {};
    this.last_telegram = JSON.stringify({
      data: { data: { name: "foo", type: "bar" } },
    });
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .delete {
      cursor: pointer;
      color: #f44;
    }
    #name {
    
      font-size: 1em;
      font-weight: bold;
      border: none;
      background: transparent;
      color: white;
      width: 100%;
    }
    #name:focus {
      outline: none;
  `;
  static properties = {
    profile: { type: String },
    name: { type: String },
    eep: { type: String },
    id: { type: String },
    com_type: { type: String },
    output_eep: { type: String },
    output_id: { type: String },
    direction: { type: Number },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      if (event.input_id == this.id) {
        this.profile = JSON.stringify(event.profile);
        this.requestUpdate();
      }
    });
  }

  async setName(e) {
    const newName = e.target.value;
    await apiClient.setDeviceName(this.id, newName);
    this.name = newName;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_known(); // unsubscribe
  }

  deleteDevice(id, eep) {
    return async () => {
      if (confirm(`Are you sure to delete device ${id} (${eep})?`)) {
        await apiClient.removeDevice(id, eep);
        this.dispatchEvent(
          new CustomEvent("deleted", {
            detail: { id: id, eep: eep },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
  }

  render() {
    const profile = JSON.parse(this.profile || "{}");
    let channels = [];
    if (profile.channels) {
      channels = profile.channels;
    } else {
      channels = [profile];
    }

    return html` <div class="device">
      <div class="header ${this.name == "New Device" ? "new" : ""} ">
        <material-icon
          icon="${deviceIconMap[this.eep] || "speed"}"
        ></material-icon>
        <input
          id="name"
          type="text"
          @change="${this.setName}"
          value="${this.name}"
        />
        <material-icon
          icon="${this.direction == 1 ? "arrow_back" : "arrow_forward"}"
          title="${this.direction == 1 ? "input" : "output"}"
        ></material-icon>
        ${this.com_type == "bidi"
          ? html`<material-icon
              icon="${this.direction == 1 ? "arrow_forward" : "arrow_back"}"
              title="${this.direction == 1 ? "input" : "output"}"
            ></material-icon>`
          : ""}
        <material-icon
          icon="delete"
          class="delete"
          @click="${this.deleteDevice(this.id, this.eep)}"
        ></material-icon>
      </div>
      <div class="data">
        ${channels.map((ch, index) => {
          return html`<div>
            ${channels.length == 1 ? "" : html`<div>Channel ${index + 1}</div>`}
            ${ch.props.map(
              (prop) => html`<enocean-prop
                .prop="${prop}"
                deviceId="${this.id}"
                eep="${this.eep}"
                output_id="${this.output_id}"
                output_eep="${this.output_eep}"
                channel="${index + 1}"
              ></enocean-prop>`
            )}
          </div>`;
        })}
      </div>
      <div class="footer">${this.id} - ${this.eep}</div>
    </div>`;
  }
}
customElements.define("enocean-device", EnoceanDevice);
