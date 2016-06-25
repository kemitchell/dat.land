var hyperdrive = require('hyperdrive')
var concat = require('concat-stream')
var level = require('level-browserify')
var drop = require('drag-drop')
var fileReader = require('filereader-stream')
var choppa = require('choppa')
var swarm = require('hyperdrive-archive-swarm')
var db = level('./dat.db')
var drive = hyperdrive(db)
var path = require('path')
var explorer = require('hyperdrive-ui')

var $hyperdrive = document.querySelector('#hyperdrive-ui')
var $shareLink = document.getElementById('share-link')

var componentCtors = require('./components')
var components = [
  componentCtors.Help('help'),
  componentCtors.HyperdriveSize('hyperdrive-size'),
  componentCtors.Peers('peers'),
  componentCtors.ResetButton('new', main),
  componentCtors.SpeedDisplay('speed'),
  componentCtors.DownloadButton('download')
]

var store = require('./store')
store.subscribe(function (state) {
  for (var c in components) {
    if (components[c].update) {
      components[c].update(state)
    }
  }
})

var keypath = window.location.hash.substr(1).match('([^/]+)(/?.*)')
var key = keypath ? keypath[1] : null
var file = keypath ? keypath[2] : null
var cwd = '/'

if (file) {
  getArchive(key, function (archive) {
    store.dispatch({ type: 'INIT_ARCHIVE', archive: archive })
    archive.createFileReadStream(file).pipe(concat(function (data) {
      document.write(data)
    }))
  })
} else {
  installDropHandler()
  main(key)
}

function getArchive (key, cb) {
  var archive = drive.createArchive(key, {live: true})
  var sw = swarm(archive)
  sw.on('connection', function (peer) {
    store.dispatch({ type: 'UPDATE_PEERS', peers: sw.connections })
    peer.on('close', function () {
      store.dispatch({ type: 'UPDATE_PEERS', peers: sw.connections })
    })
  })
  archive.open(function () { cb(archive) })
}

function main (key) {
  var help = document.querySelector('#help-text')
  help.innerHTML = 'looking for sources …'
  $hyperdrive.innerHTML = ''

  getArchive(key, function (archive) {
    if (archive.owner) {
      help.innerHTML = 'drag and drop files'
    }
    installDropHandler(archive)
    window.location = '#' + archive.key.toString('hex')
    updateShareLink()

    function onclick (ev, entry) {
      if (entry.type === 'directory') {
        cwd = entry.name
      }
    }
    var tree = explorer(archive, onclick)
    $hyperdrive.appendChild(tree)
    store.dispatch({ type: 'INIT_ARCHIVE', archive: archive })
  })
}

function updateShareLink () {
  $shareLink.value = window.location
}

var clearDrop
function installDropHandler (archive) {
  if (clearDrop) clearDrop()

  if (archive && archive.owner) {
    clearDrop = drop(document.body, function (files) {
      var i = 0
      loop()

      function loop () {
        if (i === files.length) {
          store.dispatch({ type: 'UPDATE_ARCHIVE', archive: archive })
          return console.log('added files to ', archive.key.toString('hex'), files)
        }
        var file = files[i++]
        var stream = fileReader(file)
        var entry = {name: path.join(cwd, file.fullPath), mtime: Date.now(), ctime: Date.now()}
        stream.pipe(choppa(16 * 1024)).pipe(archive.createFileWriteStream(entry)).on('finish', loop)
      }
    })
  } else {
    clearDrop = drop(document.body, function () {
      window.alert('You are not the owner of this drive.  Click "Reset" to create a new drive.')
    })
  }
}
