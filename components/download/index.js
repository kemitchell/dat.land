var pump = require('pump')
var yo = require('yo-yo')
var path = require('path')
var through = require('through2')
var tar = require('tar-stream')

module.exports = DownloadButton

function DownloadButton (el) {
  if (!(this instanceof DownloadButton)) return new DownloadButton(el)
  var self
  this._component = this._render()
  this.$el = document.getElementById(el)
  if (this.$el) this.$el.appendChild(this._component)
}

DownloadButton.prototype.update = function (state) {
  var self = this
  if (state && state.archiveReducer) {
    self.archive = state.archiveReducer.archive
  }
  yo.update(this._component, this._render())
}

DownloadButton.prototype._render = function () {
  var self = this
  return yo`<button id="download" onclick=${create} class="button">Download .zip</button>`

  function create () {
    archive = self.archive
    var pack = tar.pack()
    var tarFiles = through.obj(function (entry, enc, next) {
      entry.mtime = new Date(entry.mtime)
      entry.ctime = new Date(entry.ctime)
      entry.size = entry.length
      entry.name = path.relative('/', entry.name)
      var writeStream = pack.entry(entry, next)
      var content = archive.createFileReadStream(entry)
      console.log('writing', entry)
      pump(content, writeStream, function (err) {
        if (err) throw err
        console.log('done pumping')
      })
    })

    pump(archive.list(), tarFiles, function (err) {
      if (err) throw err
      pack.finalize()
    })
  }

}
