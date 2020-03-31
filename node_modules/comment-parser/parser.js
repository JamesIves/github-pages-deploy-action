
'use strict'

const PARSERS = require('./parsers')

const MARKER_START = '/**'
const MARKER_START_SKIP = '/***'
const MARKER_END = '*/'

/* ------- util functions ------- */

function find (list, filter) {
  let i = list.length
  let matchs = true

  while (i--) {
    for (const k in filter) {
      if ({}.hasOwnProperty.call(filter, k)) {
        matchs = (filter[k] === list[i][k]) && matchs
      }
    }
    if (matchs) { return list[i] }
  }
  return null
}

/* ------- parsing ------- */

/**
 * Parses "@tag {type} name description"
 * @param {string} str Raw doc string
 * @param {Array<function>} parsers Array of parsers to be applied to the source
 * @returns {object} parsed tag node
 */
function parse_tag (str, parsers) {
  if (typeof str !== 'string' || !(/\s*@/).test(str)) { return null }

  const data = parsers.reduce(function (state, parser) {
    let result

    try {
      result = parser(state.source, Object.assign({}, state.data))
    } catch (err) {
      state.data.errors = (state.data.errors || [])
        .concat(parser.name + ': ' + err.message)
    }

    if (result) {
      state.source = state.source.slice(result.source.length)
      state.data = Object.assign(state.data, result.data)
    }

    return state
  }, {
    source: str,
    data: {}
  }).data

  data.optional = !!data.optional
  data.type = data.type === undefined ? '' : data.type
  data.name = data.name === undefined ? '' : data.name
  data.description = data.description === undefined ? '' : data.description

  return data
}

/**
 * Parses comment block (array of String lines)
 */
function parse_block (source, opts) {
  const trim = opts.trim
    ? s => s.trim()
    : s => s

  const toggleFence = (typeof opts.fence === 'function')
    ? opts.fence
    : line => line.split(opts.fence).length % 2 === 0

  let source_str = source
    .map((line) => { return trim(line.source) })
    .join('\n')

  source_str = trim(source_str)

  const start = source[0].number

  // merge source lines into tags
  // we assume tag starts with "@"
  source = source
    .reduce(function (state, line) {
      line.source = trim(line.source)

      // start of a new tag detected
      if (line.source.match(/^\s*@(\S+)/) && !state.isFenced) {
        state.tags.push({
          source: [line.source],
          line: line.number
        })
      // keep appending source to the current tag
      } else {
        const tag = state.tags[state.tags.length - 1]
        if (opts.join !== undefined && opts.join !== false && opts.join !== 0 &&
            !line.startWithStar && tag.source.length > 0) {
          let source
          if (typeof opts.join === 'string') {
            source = opts.join + line.source.replace(/^\s+/, '')
          } else if (typeof opts.join === 'number') {
            source = line.source
          } else {
            source = ' ' + line.source.replace(/^\s+/, '')
          }
          tag.source[tag.source.length - 1] += source
        } else {
          tag.source.push(line.source)
        }
      }

      if (toggleFence(line.source)) {
        state.isFenced = !state.isFenced
      }
      return state
    }, {
      tags: [{ source: [] }],
      isFenced: false
    })
    .tags
    .map((tag) => {
      tag.source = trim(tag.source.join('\n'))
      return tag
    })

  // Block description
  const description = source.shift()

  // skip if no descriptions and no tags
  if (description.source === '' && source.length === 0) {
    return null
  }

  const tags = source.reduce(function (tags, tag) {
    const tag_node = parse_tag(tag.source, opts.parsers)
    if (!tag_node) { return tags }

    tag_node.line = tag.line
    tag_node.source = tag.source

    if (opts.dotted_names && tag_node.name.includes('.')) {
      let parent_name
      let parent_tag
      let parent_tags = tags
      const parts = tag_node.name.split('.')

      while (parts.length > 1) {
        parent_name = parts.shift()
        parent_tag = find(parent_tags, {
          tag: tag_node.tag,
          name: parent_name
        })

        if (!parent_tag) {
          parent_tag = {
            tag: tag_node.tag,
            line: Number(tag_node.line),
            name: parent_name,
            type: '',
            description: ''
          }
          parent_tags.push(parent_tag)
        }

        parent_tag.tags = parent_tag.tags || []
        parent_tags = parent_tag.tags
      }

      tag_node.name = parts[0]
      parent_tags.push(tag_node)
      return tags
    }

    return tags.concat(tag_node)
  }, [])

  return {
    tags,
    line: start,
    description: description.source,
    source: source_str
  }
}

/**
 * Produces `extract` function with internal state initialized
 */
function mkextract (opts) {
  let chunk = null
  let indent = 0
  let number = 0

  opts = Object.assign({}, {
    trim: true,
    dotted_names: false,
    fence: '```',
    parsers: [
      PARSERS.parse_tag,
      PARSERS.parse_type,
      PARSERS.parse_name,
      PARSERS.parse_description
    ]
  }, opts || {})

  /**
   * Read lines until they make a block
   * Return parsed block once fullfilled or null otherwise
   */
  return function extract (line) {
    let result = null
    const startPos = line.indexOf(MARKER_START)
    const endPos = line.indexOf(MARKER_END)

    // if open marker detected and it's not, skip one
    if (startPos !== -1 && line.indexOf(MARKER_START_SKIP) !== startPos) {
      chunk = []
      indent = startPos + MARKER_START.length
    }

    // if we are on middle of comment block
    if (chunk) {
      let lineStart = indent
      let startWithStar = false

      // figure out if we slice from opening marker pos
      // or line start is shifted to the left
      const nonSpaceChar = line.match(/\S/)

      // skip for the first line starting with /** (fresh chunk)
      // it always has the right indentation
      if (chunk.length > 0 && nonSpaceChar) {
        if (nonSpaceChar[0] === '*') {
          const afterNonSpaceCharIdx = nonSpaceChar.index + 1
          const extraCharIsSpace = line.charAt(afterNonSpaceCharIdx) === ' '
          lineStart = afterNonSpaceCharIdx + (extraCharIsSpace ? 1 : 0)
          startWithStar = true
        } else if (nonSpaceChar.index < indent) {
          lineStart = nonSpaceChar.index
        }
      }

      // slice the line until end or until closing marker start
      chunk.push({
        number,
        startWithStar,
        source: line.slice(lineStart, endPos === -1 ? line.length : endPos)
      })

      // finalize block if end marker detected
      if (endPos !== -1) {
        result = parse_block(chunk, opts)
        chunk = null
        indent = 0
      }
    }

    number += 1
    return result
  }
}

/* ------- Public API ------- */

module.exports = function parse (source, opts) {
  const blocks = []
  const extract = mkextract(opts)
  const lines = source.split(/\n/)

  lines.forEach((line) => {
    const block = extract(line)
    if (block) {
      blocks.push(block)
    }
  })

  return blocks
}

module.exports.PARSERS = PARSERS
module.exports.mkextract = mkextract
