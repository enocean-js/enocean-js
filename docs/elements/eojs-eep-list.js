/* eslint-disable no-undef  */
/* eslint-disable no-unused-vars */
import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import * as EEP from 'https://cdn.jsdelivr.net/npm/enocean-js@0.0.1-beta.23/packages/node_modules/@enocean-js/eep-transcoder/src/eep.js'
import { KaskadiLinkList } from './kaskadi-link-list.js'
import { KaskadiListItem } from './kaskadi-list-item.js'
class EOJSEEPList extends LitElement {
  constructor () {
    super()
    var tmp = []
    for (let eepDesc in EEP) {
      var desc = EEP[eepDesc]
      var kli = document.createElement('kaskadi-list-item')
      kli.data = desc
      kli.setAttribute('eep', desc.eep)
      kli.innerHTML = `<a href="./?eep=${desc.eep}">
          <header>${desc.eep}</header>
          <div class="sub">${desc.title}</div>
        </a>`
      tmp.push(kli)
    }
    this.items = tmp
  }
  static get properties () {
    return {
      eep: { type: String }
    }
  }
  filterList (e) {
    this.shadowRoot.querySelector('kaskadi-link-list').filter('eep', e.target.value)
  }
  find (eep) {
    this.shadowRoot.querySelector('kaskadi-link-list').find('eep', eep)
  }
  render () {
    return html`
    <style>
      kaskadi-link-list{padding:0;margin:0;height: calc(100vh - 100px); overflow: scroll;width:250px}
      kaskadi-link-list::-webkit-scrollbar{width:0 !important}
      kaskadi-link-list {overflow: -moz-scrollbars-none;}
      kaskadi-list-item {
        width:calc(100% - calc(var(--size-space) * 2));
        box-sizing: border-box;
        height:var(--size-cell1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-radius: var(--border-radius);
        border: var(--border-style);
        margin-top:var(--size-space);
        background: white;
        padding:var(--size-space);
        transition: all 0.5s;
      }
      kaskadi-list-item.hidden{
        height:0;
        padding-top:0;
        padding-bottom:0;
        margin:0;
        border-width: 0
      }
      kaskadi-list-item[selected]{
        background:#ffff99
      }
      a{color:black;text-decoration:none}
      .sub{font-size: 8px;padding:0;margin:0}
      #main{display:flex; flex-direction: column; align-items: center}
      .list-control{display:flex; align-items:center; justify-content:center; height: 50px;width:100%}
      header{padding:0;margin:0}
      input{display:bock;height:20px}
    </style>
    <div id="main">
      <div class="list-control">
        <input id="filter-input" type="text" placeholder="filter" @keyup="${this.filterList}"/>
      </div>
      <kaskadi-link-list>
        ${this.items.map(item => {
    if (item.data.eep === this.eep) {
      item.setAttribute('selected', true)
    } else {
      item.removeAttribute('selected')
    }
    return item
  })}
      </kaskadi-link-list>
    </div>
    `
  }
}
customElements.define('eojs-eep-list', EOJSEEPList)
