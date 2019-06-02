/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
export class KaskadiCollapse extends LitElement {
  constructor () {
    super()
    this.items = []
    this.collapsed = true
  }
  static get properties () {
    return {
      title: { type: String },
      collapsed: { type: Boolean },
      xyz: { type: Boolean }
    }
  }
  toggle (e) {
    this.collapsed = !this.collapsed
  }
  render () {
    return html`
    <style>
    :host{
      display: block;
      padding:0;
      margin:5px;
      background:white;
      border-radius: var(--border-radius);
      border: var(--border-style);
      overflow:hidden;
    }
    .spacer{flex-grow:1}
    #content{
      padding:5px
    }
    #header{
      border-radius: calc(var(--border-radius) - 8px) calc(var(--border-radius) - 8px) 0 0;
    }
    #collapse-container[collapsed=true]{
      max-height:var(--collapsed-height, 25px);
    }
    #collapse-container{
      position:relative;
      overflow:hidden;
    }
    #collapse-container[collapsed=true]::after{
        display: var(--fader-display,block);
        pointer-events:none;
        content:"";
        position:absolute;
        bottom:0;
        left:0;
        width:100%;
        height: 15px;
        background:linear-gradient(0deg,rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      }


    #moreOrLess{cursor:pointer;color:blue;user-select: none;}
    #header{display:flex;background:var(--header-background,white);color:var(--header-color,#333);padding:5px}
    #title{font-size:14px;font-weight:bold}
    </style>
    <div id="collapse-container" collapsed="${this.collapsed}"  bla="${this.xyz}">
      <div id="header">
        <div id="title">${this.title}</div>
        <div class="spacer"></div>
        <div id="moreOrLess" @click="${this.toggle}">${this.collapsed ? 'show more...' : 'show less...'}</div>
      </div>
      <div id="content" >
        <slot></slot>
      </div>
    </div>
    `
  }
}
customElements.define('kaskadi-collapse', KaskadiCollapse)
