/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
export class KaskadiListItem extends LitElement {
  constructor () {
    super()
    this.data = {}
    this.selected = false
  }
  static get properties () {
    return {
      data: { type: Array },
      selected: { type: Boolean }
    }
  }
  render () {
    return html`
      <style>
      :host{
        display: block
      }
      </style>
      <slot></slot>
    `
  }
}
customElements.define('kaskadi-list-item', KaskadiListItem)
