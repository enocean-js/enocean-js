/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'

class SensorList extends LitElement {
  constructor () {
    super()
    this._items = {}
  }

  static get properties () {
    return {}
  }

  render () {
    return html`
    <style>
      :host[hidden]{display:none}
      :host{display: flex;flex-direction: column;}
      rssi-indicator {--fill-color: var(--rssi-fill-color,blue)}
    </style>
    <div>
      ${Object.keys(this._items).map(key => {
    var item = this._items[key]
    return html`<sensor-list-item senderid="${item.senderId}" rorg="${item.RORG}" rssi="${item.RSSI}"></sensor-list-item>`
  })}
    </div>`
  }

  addItem (item) {
    if (!(item.senderId in this._items)) {
      this._items[item.senderId] = item
      this.requestUpdate()
    }
  }
}
customElements.define('sensor-list', SensorList)
