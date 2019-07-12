/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'

class ServerConnector extends LitElement {
  constructor () {
    super()
    if (localStorage.getItem('server-list') === null) {
      localStorage.setItem('server-list', '[{"name":"none","url":""}{"name":"localhost","url":"http://localhost:4242"},{"name":"RasPi","url":"http://192.168.178.43:4242"}]')
    }
    this.serverList = JSON.parse(localStorage.getItem('server-list'))
    this.socket = io({ autoConnect: false })
    this.connected = false
    this.url = 'http://192.168.178.43:4242'
    this.packetCount = 0
    this.edit = false
    this.rssi = 100
    this._rssi_total = 100
    // this.socket.open()
  }

  static get properties () {
    return {
      url: { type: String },
      connected: { type: Boolean }
    }
  }

  render () {
    return html`
    <style>
      :host{display:flex;position:relative;background:white;color:black;width:210px}
      .connected:before{content:'✔';color:#ddd;}
      .disconnected:before{content:'⛔';color:#ddd;}
      .spacer{flex-grow:1}
      #edit{position:absolute;top:25px;z-index:10;background:white;width:200px;height:200px;box-shadow:2px 2px 10px #555;}
      button{background:none;border:1px solid white;;padding:3px;border-radius:3px;color:#333;border-radius:3px;font-weight:bold;outline:none;}
      button:hover{border:1px solid #333;}
      select{background:none;border:1px solid white;outline:none;padding:3px;border-radius:3px;}
      select:hover{border:1px solid #333;}
      #counter{color:#ddd}
      rssi-indicator{width:14px;height:14px;--fill-color:#ddd;--empty-color:#666;}
      header{color:#ddd;padding:3px;font-size: 12px;display:flex;flex-direction:row;background:#333;width:calc(210px - 6px);align-items:center;justify-content:space-between}
      header *{margin-left:3px}
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
    <div>
      <header>
          <div>enocean-js</div>
          <div class="spacer"></div>
          <div id="counter">${this.packetCount.toString().padStart(5, '0')}</div>
          <div id="status" class="${this.connected ? 'connected' : 'disconnected'}"></div>
          <rssi-indicator value="${this.rssi}"></rssi-indicator>
      </header>
      <button @click="${this.toggle}">⚙</button>
      <select id="addr_input" @change="${this.urlchange}">
        ${this.serverList.map(item => html`<option value="${item.url}">${item.name}</option>`)}
      </select>

      <div id="edit" style="display:${this.edit ? 'block' : 'none'}">
        ${!this.connected ? html`<button @click="${this.connect}">connect</button>` : html`<button @click="${this.disconnect}">disconnect</button>`}
      </div>
    </div>`
  }

  connectHandler () {
    console.log('connected')
    this.connected = true
    this.requestUpdate()
  }

  disconnectHandler () {
    console.log('lost connection')
    this.connected = false
    this.requestUpdate()
  }

  connect () {
    this.socket = io.connect(this.url, { reconnection: false })
    this.socket.on('connect_error', () => { console.warn('connection failed') })
    this.socket.on('connect', this.connectHandler.bind(this))
    this.socket.on('data', data => {
      this.packetCount++
      this.rssi = this._rssi_total / this.packetCount
      this.requestUpdate()
      this.dispatchEvent(new CustomEvent('data', { detail: data }))
    })
    this.socket.on('disconnect', this.disconnectHandler.bind(this))
  }

  disconnect () {
    this.socket.close()
  }

  urlchange (e) {
    this.socket.close()
    console.log('url changed')
    this.url = e.target.value
    this.connect()
  }

  toggle () {
    this.edit = !this.edit
    this.requestUpdate()
  }
}
customElements.define('server-connector', ServerConnector)
