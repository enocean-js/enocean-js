import {
  css,
  html,
  when,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";

const apiClient = EnoceanJSElement.apiClient;

class EnoceanProp extends EnoceanJSElement {
  constructor() {
    super();
  }
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
      font-size: 0.8em;
    }
    button {
      margin: 2px;
      padding: 5px;
      border: none;
      border-radius: 5px;
      background: #eee;
      cursor: pointer;
    }

    .prop {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      border-bottom: 1px solid #ccc;
    }
  `;
  static properties = {
    prop: { type: Object },
    deviceId: { type: String },
    eep: { type: String },
    channel: { type: Number },
    output_id: { type: String },
    output_eep: { type: String },
  };
  action(outputId, prop, val) {
    return async () => {
      console.log("Action", outputId, prop, val);
      await apiClient.doAction({
        id: this.output_id,
        eep: this.output_eep,
        actions: [{ name: prop.name, value: val, channel: this.channel }],
      });
    };
  }
  render() {
    return html` <div class="prop">
      <div class="name">${this.prop.name}</div>
      ${when(
        this.prop.role?.includes("switch") && this.prop.write == true,
        () =>
          html`<div>
            <material-icon
              @click="${this.action(
                this.output_id,
                this.prop,
                !this.prop.value
              )}"
              style="font-size:2em;"
              icon="${this.prop.value == true ? "toggle_on" : "toggle_off"}"
            ></material-icon>
          </div>`,
        () => {}
      )}
      ${when(
        this.prop.type == "boolean" && this.prop.write == false,
        () =>
          html`<div class="value boolean ${this.prop.value}">
            <material-icon
              icon="${this.prop.value
                ? "radio_button_checked"
                : "radio_button_unchecked"}"
            ></material-icon>
          </div>`,
        () => {}
      )}
      ${when(
        this.prop.role == "button" && this.prop.write == true,
        () =>
          html`<div class="value boolean ${this.prop.value}">
            <button
              @mousedown="${this.action(this.output_id, this.prop, true)}"
              @mouseup="${this.action(this.output_id, this.prop, false)}"
            >
              press
            </button>
          </div>`,
        () => {}
      )}
      ${when(
        this.prop.type == "number" && this.prop.write != true,
        () =>
          html`<div class="value boolean ${this.prop.value}">
            ${this.prop.value} ${this.prop.unit || ""}
          </div>`,
        () => {}
      )}
      ${when(
        this.prop.type == "number" && this.prop.write == true,
        () =>
          html`<div class="value boolean ${this.prop.value}">
            <input
              style="text-align:right"
              type="text"
              value="${this.prop.value}"
            />
          </div>`,
        () => {}
      )}
    </div>`;
  }
}
customElements.define("enocean-prop", EnoceanProp);
