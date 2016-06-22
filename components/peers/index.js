var yo = require('yo-yo')

module.exports = Peers

function Peers (el, store) {
  if (!(this instanceof Peers)) return new Peers(el, store)
  var self = this
  this.$el = document.getElementById(el)
  this._component = this._render()
  this._peers = 0
  this._store = store
  this._store.subscribe(function (state) {
    debugger
    self.update(state)
  })
  if (this.$el) this.$el.appendChild(this._component)
}

Peers.prototype.update = function (state) {
  debugger
  if (state && state.peersReducer) {
    this._updateNumPeers(state)
    yo.update(this._component, this._render())
  }
}

Peers.prototype._render = function () {
  var peers = this._peers || 0
  var pl = peers > 1 || peers === 0 ? 's' : ''
  var component = yo`<span>${peers} Source${pl}</span>`
  return component
}

Peers.prototype._updateNumPeers = function (state) {
  if (state.peersReducer && state.peersReducer.peers) {
    this._peers = state.peersReducer.peers
  } else {
    this._peers = 0
  }
  return this._peers
}
