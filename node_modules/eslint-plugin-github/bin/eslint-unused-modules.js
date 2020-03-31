#!/usr/bin/env node

const {CLIEngine} = require('eslint')

// TODO: Figure out how to deactive other rules.
let cli = new CLIEngine({
  rules: {
    'github/dependency-graph': 1
  }
})
cli.executeOnFiles(process.argv.slice(2))

// TODO: Figure out how to deactive other rules.
cli = new CLIEngine({
  rules: {
    'github/unused-export': 2,
    'github/unused-module': 2
  }
})

const report = cli.executeOnFiles(process.argv.slice(2))
const formatter = cli.getFormatter()

process.stdout.write(formatter(report.results))

if (report.errorCount > 0) {
  process.exit(1)
}
