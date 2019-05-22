import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import { KaskadiSimpleRouter } from './kaskadi-simple-router.js'
import './eojs-eep-descriptor.js'
import './eojs-eep-list.js'
class EOJSWebApp extends KaskadiSimpleRouter {
  static get styles () {
    return css`
      div{display:flex}
      eojs-eep-list{min-width:200px}
      :host{
        --color1: #99ff99;
        --color2: #ffff99;
        --color3: #99ccff;
        --radius: 5px;
        --border: 2px solid #ccc;
      }
      eojs-eep-descriptor{
        --rorg-color: var(--color3);
        --func-color: var(--color2);
        --type-color: var(--color1);
        --border-style: var(--border);
        --border-radius: var(--radius);
      }
      eojs-eep-list{
        --border-style: var(--border);
        --border-radius: var(--radius);
      }
      div{background:#eee;}
    `
  }
  render () {
    var url = new URL(window.location.href)
    var eep = url.searchParams.get('eep')
    return html`
      <div>
        <eojs-eep-list></eojs-eep-list>
        <eojs-eep-descriptor eep="${eep}"></eojs-eep-descriptor>
      </div>`
  }
}
customElements.define('eojs-webapp', EOJSWebApp)
