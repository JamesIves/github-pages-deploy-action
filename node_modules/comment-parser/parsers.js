'use strict'

function skipws (str) {
  let i = 0
  do {
    if (str[i] !== ' ' && str[i] !== '\t') { return i }
  } while (++i < str.length)
  return i
}

/* ------- default parsers ------- */

const PARSERS = {}

PARSERS.parse_tag = function parse_tag (str) {
  const result = str.match(/^\s*@(\S+)/)
  if (!result) { throw new Error('Invalid `@tag`, missing @ symbol') }

  return {
    source: result[0],
    data: { tag: result[1] }
  }
}

PARSERS.parse_type = function parse_type (str, data) {
  if (data.errors && data.errors.length) { return null }

  let pos = skipws(str)
  let res = ''
  let curlies = 0

  if (str[pos] !== '{') { return null }

  while (pos < str.length) {
    curlies += (str[pos] === '{' ? 1 : (str[pos] === '}' ? -1 : 0))
    res += str[pos]
    pos++
    if (curlies === 0) { break }
  }

  if (curlies !== 0) { throw new Error('Invalid `{type}`, unpaired curlies') }

  return {
    source: str.slice(0, pos),
    data: { type: res.slice(1, -1) }
  }
}

PARSERS.parse_name = function parse_name (str, data) {
  if (data.errors && data.errors.length) { return null }

  let pos = skipws(str)
  let name = ''
  let brackets = 0
  let res = { optional: false }

  // if it starts with quoted group assume it is a literal
  const quotedGroups = str.slice(pos).split('"')
  if (quotedGroups.length > 1 && quotedGroups[0] === '' && quotedGroups.length % 2 === 1) {
    name = quotedGroups[1]
    pos += name.length + 2
  // assume name is non-space string or anything wrapped into brackets
  } else {
    while (pos < str.length) {
      brackets += (str[pos] === '[' ? 1 : (str[pos] === ']' ? -1 : 0))
      name += str[pos]
      pos++
      if (brackets === 0 && /\s/.test(str[pos])) { break }
    }

    if (brackets !== 0) { throw new Error('Invalid `name`, unpaired brackets') }

    res = { name: name, optional: false }

    if (name[0] === '[' && name[name.length - 1] === ']') {
      res.optional = true
      name = name.slice(1, -1)

      if (name.indexOf('=') !== -1) {
        const parts = name.split('=')
        name = parts[0]
        res.default = parts[1].replace(/^(["'])(.+)(\1)$/, '$2')
      }
    }
  }

  res.name = name

  return {
    source: str.slice(0, pos),
    data: res
  }
}

PARSERS.parse_description = function parse_description (str, data) {
  if (data.errors && data.errors.length) { return null }

  const result = str.match(/^\s+((.|\s)+)?/)

  if (result) {
    return {
      source: result[0],
      data: { description: result[1] === undefined ? '' : result[1] }
    }
  }

  return null
}

module.exports = PARSERS
