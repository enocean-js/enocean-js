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
  listchanged (e) {
    this._items[`${e.target.senderId}_${e.target.eep}`][e.detail.attribute] = e.detail.newValue
    let event = new Event('change')
    this.dispatchEvent(event)
  }
  deleteItem (e) {
    delete this._items[e.detail.id]
    console.log(this._item)
    let event = new Event('change')
    this.dispatchEvent(event)
    this.requestUpdate()
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
    return html`<sensor-list-item @request_delete="${this.deleteItem}" @updated="${this.listchanged}" name="${item.name ? item.name : ''}" senderId="${item.senderId}" eep="${item.eep}" rssi="${item.rssi}" info="${item.info}"></sensor-list-item>`
  })}
    </div>`
  }
  addItem (item) {
    this._items[`${item.senderId}_${item.eep}`] = item
    this.requestUpdate()
  }
  getList () {
    var ret = []
    for (var id in this._items) {
      let item = this._items[id]
      ret.push({
        senderId: item.senderId,
        eep: item.eep,
        rssi: item.rssi,
        name: item.name
      })
    }
    return ret
  }
}
customElements.define('sensor-list', SensorList)
