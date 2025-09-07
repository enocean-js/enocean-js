import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
const apiClient = EnoceanJSElement.apiClient;

class EnoceanTeachInCountdown extends EnoceanJSElement {
  constructor() {
    super();
    this.timer = 60;
  }
  static properties = {
    timer: { type: Number },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_countdown = apiClient.on("teach-in-countdown", (event) => {
      this.timer = event.timeLeft / 1000;
    });
    this.unsubscribe_start = apiClient.on("teach-in-started", (event) => {
      this.timer = event.timeout / 1000;
    });
    this.unsubscribe_stop = apiClient.on("teach-in-stopped", (event) => {
      this.timer = event.timeout / 1000;
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_countdown(); // unsubscribe
    this.unsubscribe_start(); // unsubscribe
    this.unsubscribe_stop(); // unsubscribe
  }
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`${Math.round(this.timer).toString().padStart(2, "0")}s`;
  }
}
customElements.define("teach-in-countdown", EnoceanTeachInCountdown);
