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
      var readStream = archive.createFileReadStream(entry)
      entry.size = entry.length
      entry.mtime = new Date(entry.mtime)
      entry.ctime = new Date(entry.ctime)
      var writeStream = pack.entry(entry, function (err) {
        if (err) throw err
        console.log('write stream end')
      })
      console.log('writing', entry)
      console.log('write stream', writeStream)
      pump(readStream, writeStream, function (err) {
        if (err) return pack.destroy(err)
        next()
      })
    })

    pump(archive.list(), tarFiles, function (err) {
      if (err) return pack.destroy(err)
      console.log('list done')
      pack.finalize()
    })

    pack.on('error', function (err) {
      throw err
    })

    pack.on('end', function () {
      console.log('done')
    })
  }

}
