/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'

class RSSIIndicator extends LitElement {
  constructor () {
    super()
    this.value = 20
  }

  static get properties () {
    return {
      value: { type: Number }
    }
  }

  render () {
    return html`
    <style>
      :host {display:block}
      rect.filled {fill: var(--fill-color, green)}
      rect {fill: var(--empty-color, #ddd)}
    </style>
    <div title="-${this.value} dBm">
    <svg viewBox="0 0 36 36" >
      <g transform="translate(-0.5,-0.5)">
        <rect class="${(this.value < 80) ? 'filled' : ''}" x="2" y="26" width="5" height="8"/>
        <rect class="${(this.value < 70) ? 'filled' : ''}" x="10" y="18" width="5" height="16"/>
        <rect class="${(this.value < 60) ? 'filled' : ''}" x="18" y="10" width="5" height="24"/>
        <rect class="${(this.value < 50) ? 'filled' : ''}" x="26" y="2" width="5" height="32"/>
      </g>
    </svg>
    </div>`
  }
}
customElements.define('rssi-indicator', RSSIIndicator)
