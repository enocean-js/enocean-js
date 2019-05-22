/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import * as EEP from 'https://cdn.jsdelivr.net/npm/enocean-js@0.0.1-beta.23/packages/node_modules/@enocean-js/eep-transcoder/src/eep.js'
import { KaskadiLinkList } from './kaskadi-link-list.js'
class EOJSEEPList extends KaskadiLinkList {
  constructor () {
    super()
    var tmp = []
    for (let eepDesc in EEP) {
      var desc = EEP[eepDesc]
      tmp.push(desc)
    }
    this.items = tmp
    this.currentView = tmp.map(item => item)
  }
  filterList (e) {
    this.filter('eep', e.target.value)
  }
  render () {
    return html`
    <style>
      ul{padding:0;margin:0}
      li{
        list-style-type:none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-radius: var(--border-radius);
        border: var(--border-style);
        margin:2px;
        background: white;
        padding:5px
      }
      a{color:black;text-decoration:none}
      div{font-size: 8px;padding:0;margin:0}
      header{padding:0;margin:0}
    </style>
    <input id="filter-input" type="text" placeholder="filter" @keyup="${this.filterList}"/>
    <ul>
      ${this.currentView.map(item => {
        return html`
        <li>
          <a href="./?eep=${item.eep}">
            <header>${item.eep}</header>
            <div>${item.title}</div>
          </a>
        </li>`
      })}
    </ul>
    `
  }
}
customElements.define('eojs-eep-list', EOJSEEPList)
