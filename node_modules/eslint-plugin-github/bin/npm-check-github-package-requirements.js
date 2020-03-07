#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const checks = []
function check(name, callback) {
  checks.push([checks.length + 1, name, callback])
}

function run() {
  process.stdout.write(`1..${checks.length}\n`)
  checks.forEach(([count, name, callback]) => {
    Promise.resolve()
      .then(callback)
      .then(() => {
        process.stdout.write(`ok ${count} - ${name}\n`)
      })
      .catch(error => {
        process.stdout.write(`not ok ${count} - ${name}\n  ${error}\n`)
      })
  })
}

const packageRoot = process.argv[2]

check('package.json exists', () => {
  const packageJsonPath = path.join(packageRoot, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json does not exist')
  }
})

check('package.json license is set', () => {
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  if (!pkg.license) {
    throw new Error('license not set')
  }
})

run()
