'use strict'

const getIndent = (indent) => {
  return typeof indent === 'number' ? ' '.repeat(indent) : indent
}

module.exports = exports = function stringify (arg, opts) {
  if (Array.isArray(arg)) {
    return stringifyBlocks(arg, opts)
  }
  if (arg && typeof arg === 'object') {
    if ('tag' in arg) {
      return stringifyTag(arg, opts)
    }
    if ('tags' in arg) {
      return stringifyBlock(arg, opts)
    }
  }
  throw new TypeError('Unexpected argument passed to `stringify`.')
}

const stringifyBlocks = exports.stringifyBlocks = function stringifyBlocks (
  blocks, { indent = '' } = {}
) {
  const indnt = getIndent(indent)
  return blocks.reduce((s, block) => {
    return s + stringifyBlock(block, { indent })
  }, (indnt ? indnt.slice(0, -1) : '') + '/**\n') + indnt + '*/'
}

const stringifyBlock = exports.stringifyBlock = function stringifyBlock (
  block, { indent = '' } = {}
) {
  // block.line
  const indnt = getIndent(indent)
  return (block.description ? `${indnt}${block.description.replace(/^/gm, '* ')}\n${indnt}*\n` : '') +
    block.tags.reduce((s, tag) => {
      return s + stringifyTag(tag, { indent })
    }, '')
}

const stringifyTag = exports.stringifyTag = function stringifyTag (
  tag, { indent = '' } = {}
) {
  const indnt = getIndent(indent)
  const {
    type, name, optional, description, tag: tagName, default: deflt //, line , source
  } = tag
  return indnt + `* @${tagName}` +
    (type ? ` {${type}}` : '') +
    (name ? ` ${
      optional ? '[' : ''
    }${name}${deflt ? `=${deflt}` : ''}${
      optional ? ']' : ''
    }` : '') +
    (description ? ` ${description.replace(/\n/g, '\n' + indnt + '* ')}` : '') + '\n'
}
