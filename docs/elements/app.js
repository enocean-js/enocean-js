import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'
import { KaskadiSimpleRouter } from './kaskadi-simple-router.js'
class EOJSWebApp extends KaskadiSimpleRouter {
  render () {
    var url = new URL(window.location.href)
    var eep = url.searchParams.get('eep')
    return html`
      <a href="/?eep=f6-02-01">f6-02-01</a>
      <eojs-eep-descriptor eep="${eep}"></eojs-eep-descriptor>
      `
  }
}
customElements.define('eojs-webapp', EOJSWebApp)
