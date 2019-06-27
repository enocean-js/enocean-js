/* eslint-disable no-undef  */
import { html, css, LitElement } from './lit-element/lit-element.js'
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
