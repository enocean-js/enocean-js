import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
const apiClient = EnoceanJSElement.apiClient;

class EnoceanTeachInButton extends EnoceanJSElement {
  constructor() {
    super();
    this.active = false;
  }
  static properties = {
    active: { type: Boolean },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_start = apiClient.on("teach-in-started", (event) => {
      this.active = true;
    });
    this.unsubscribe_stop = apiClient.on("teach-in-stopped", (event) => {
      this.active = false;
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_start(); // unsubscribe
    this.unsubscribe_stop(); // unsubscribe
  }
  static styles = css`
    :host {
      display: block;
    }
    material-icon {
      vertical-align: middle;
      color: var(--color-accent, #4caf50);
    }
    material-icon[icon="stop_circle"] {
      color: var(--color-danger, #f44336);
    }
  `;

  async toggleTeachIn() {
    if (this.active) {
      await apiClient.stopTeachIn();
    } else {
      await apiClient.startTeachIn(60000);
    }
  }
  render() {
    return html` <material-icon
      title="Teach-In"
      @click="${this.toggleTeachIn}"
      icon="${this.active ? "stop_circle" : "play_circle"}"
    ></material-icon>`;
  }
}
customElements.define("teach-in-button", EnoceanTeachInButton);
