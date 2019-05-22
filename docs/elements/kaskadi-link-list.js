import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
export class KaskadiLinkList extends LitElement {
  constructor () {
    super()
    this.items = []
    this.currentView = []
  }
  static get properties () {
    return {
      items: { type: Array },
      currentView: { type: Array }
    }
  }
  filter (field, value) {
    this.currentView = this.items.filter(item => item[field].includes(value))
  }
}
customElements.define('kaskadi-link-list', KaskadiLinkList)
