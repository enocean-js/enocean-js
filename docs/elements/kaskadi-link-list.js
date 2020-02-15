/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://cdn.klimapartner.net/modules/lit-element/lit-element.js'
export class KaskadiLinkList extends LitElement {
  constructor () {
    super()
    this.items = []
  }
  static get properties () {
    return {
      items: { type: Array }
    }
  }
  filter (field, value) {
    this.shadowRoot.querySelector('slot').assignedNodes().forEach(item => {
      if (item.nodeName === 'KASKADI-LIST-ITEM') {
        if (item.data[field].includes(value)) {
          item.classList.remove('hidden')
        } else {
          item.classList.add('hidden')
        }
      }
    })
  }
  find (field, value) {
    var elem = this.shadowRoot.querySelector('slot').assignedNodes().find(item => {
      if (item.nodeName === 'KASKADI-LIST-ITEM') {
        if (item.data[field].includes(value)) {
          return item
        }
      }
    })
    elem.scrollIntoView()
  }
  render () {
    return html`
    <style>
    :host{
      display: block
    }
    #list-container{
      display: flex;
      flex-direction: column;
      align-items: center
    }
    </style>
    <div id="list-container">
      <slot></slot>
    </div>
    `
  }
}
customElements.define('kaskadi-link-list', KaskadiLinkList)
