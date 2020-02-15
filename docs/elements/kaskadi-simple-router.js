/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://cdn.klimapartner.net/modules/lit-element/lit-element.js'
export class KaskadiSimpleRouter extends LitElement {
  constructor () {
    super()
    window.onpopstate = e => {
      this.requestUpdate()
    }
    this.addEventListener('click', function (e) {
      var a = e.path.find(item => item.nodeName === 'A')
      if (a && a.getAttribute('href').substr(0, 4) !== 'http') {
        history.pushState(null, null, a.getAttribute('href'))
        this.requestUpdate()
        e.preventDefault()
        return false
      }
    }, false)
  }
}
customElements.define('kaskadi-simple-router', KaskadiSimpleRouter)
