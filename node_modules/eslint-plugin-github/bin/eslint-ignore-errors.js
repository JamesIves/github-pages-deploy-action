#!/usr/bin/env node
// Disables eslint rules in a JavaScript file with next-line comments. This is
// useful when introducing a new rule that causes many failures. The comments
// can be fixed and removed at while updating the file later.
//
// Usage:
//
//  eslint-ignore-errors app/assets/javascripts/something.js

const fs = require('fs')
const execFile = require('child_process').execFile

execFile('eslint', ['--format', 'json', process.argv[2]], (error, stdout) => {
  for (const result of JSON.parse(stdout)) {
    const filename = result.filePath
    const jsLines = fs.readFileSync(filename, 'utf8').split('\n')
    const offensesByLine = {}
    let addedLines = 0

    // Produces {47: ['github/no-d-none', 'github/no-blur'], 83: ['github/no-blur']}
    for (const message of result.messages) {
      if (offensesByLine[message.line]) {
        offensesByLine[message.line].push(message.ruleId)
      } else {
        offensesByLine[message.line] = [message.ruleId]
      }
    }

    for (const line of Object.keys(offensesByLine)) {
      const lineIndex = line - 1 + addedLines
      const previousLine = jsLines[lineIndex - 1]
      const ruleIds = offensesByLine[line].join(', ')
      if (isDisableComment(previousLine)) {
        jsLines[lineIndex - 1] = previousLine.replace(/\s?\*\/$/, `, ${ruleIds} */`)
      } else {
        const leftPad = ' '.repeat(jsLines[lineIndex].match(/^\s*/g)[0].length)
        jsLines.splice(lineIndex, 0, `${leftPad}/* eslint-disable-next-line ${ruleIds} */`)
      }
      addedLines += 1
    }

    if (result.messages.length !== 0) {
      fs.writeFileSync(filename, jsLines.join('\n'), 'utf8')
    }
  }
})

function isDisableComment(line) {
  return line.match(/\/\* eslint-disable-next-line .+\*\//)
}
