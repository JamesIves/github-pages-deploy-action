
'use strict'

const fs = require('fs')
const stream = require('stream')

const parse = require('./parser')

const stringify = require('./stringifier')

module.exports = parse

module.exports.stringify = stringify

/* ------- Transform stream ------- */

class Parser extends stream.Transform {
  constructor (opts) {
    opts = opts || {}
    super({ objectMode: true })
    this._extract = parse.mkextract(opts)
  }

  _transform (data, encoding, done) {
    let block
    const lines = data.toString().split(/\n/)

    while (lines.length) {
      block = this._extract(lines.shift())
      if (block) {
        this.push(block)
      }
    }

    done()
  }
}

module.exports.stream = function stream (opts) {
  return new Parser(opts)
}

/* ------- File parser ------- */

module.exports.file = function file (file_path, done) {
  let opts = {}
  const collected = []

  if (arguments.length === 3) {
    opts = done
    done = arguments[2]
  }

  return fs.createReadStream(file_path, { encoding: 'utf8' })
    .on('error', done)
    .pipe(new Parser(opts))
    .on('error', done)
    .on('data', function (data) {
      collected.push(data)
    })
    .on('finish', function () {
      done(null, collected)
    })
}
