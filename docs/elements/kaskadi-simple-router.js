import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
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
