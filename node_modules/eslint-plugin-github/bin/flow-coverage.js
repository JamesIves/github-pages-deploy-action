#!/usr/bin/env node
// usage: flow-coverage
//
// Run flow coverage on project.

const childProcess = require('child_process')
const flow = require('flow-bin')
const fs = require('fs')
const {join} = require('path')

const execFile = (file, args) =>
  new Promise((resolve, reject) => {
    childProcess.execFile(
      file,
      args,
      {
        maxBuffer: Infinity
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({stdout, stderr})
        }
      }
    )
  })

async function execFileJSON(file, args) {
  args.push('--json')
  const {stdout, stderr} = await execFile(file, args)
  if (stderr) {
    return JSON.parse(stderr)
  } else {
    return JSON.parse(stdout)
  }
}

function computeCoverage(covered, uncovered) {
  const total = covered + uncovered
  if (total) {
    return 100 * (covered / total)
  } else {
    return 100
  }
}

async function getCoverage(path) {
  const json = await execFileJSON(flow, ['coverage', path])
  if (json && json.expressions) {
    const uncoveredCount = json.expressions['uncovered_count']
    const coveredCount = json.expressions['covered_count']
    const covered = computeCoverage(coveredCount, uncoveredCount)
    return {path, uncoveredCount, coveredCount, covered}
  } else {
    return {path, uncoveredCount: 0, coveredCount: 0, covered: 0}
  }
}

async function startFlow() {
  try {
    await execFile(flow, ['start', '--wait'])
  } catch (error) {
    if (error.code === 11) {
      /* already running */
    } else {
      throw error
    }
  }
}

// const ignore = [/\.flowconfig$/, /\.json$/, /\.test\.js$/, /\/__generated__\//, /\/flow-typed\//, /\/node_modules\//]
//
// async function flowList() {
//   execFile('git', ['grep', '--name-only', '--', '@flow'])
//
//   const paths = await execFileJSON(flow, ['ls'])
//   return paths.filter(path => !ignore.some(re => re.test(path)))
// }

async function grepFlowFiles() {
  const {stdout} = await execFile('git', ['grep', '--null', '--name-only', '--', '@flow'])
  return stdout.split('\0').filter(path => path)
}

;(async function() {
  let threshold = 0

  const packageJsonPath = join(process.cwd(), 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath)
    threshold = (packageJson.flow && packageJson.flow.coverageThreshold) || 0
  }

  await startFlow()

  const files = await grepFlowFiles()

  let totalCoveredCount = 0
  let totalUncoveredCount = 0

  for (const file of files) {
    const {path, covered, coveredCount, uncoveredCount} = await getCoverage(file)
    process.stdout.write(`${covered.toFixed()}\t${path}\n`)
    totalCoveredCount += coveredCount
    totalUncoveredCount += uncoveredCount
  }

  const totalCoverage = computeCoverage(totalCoveredCount, totalUncoveredCount)

  process.stdout.write(`${totalCoverage.toFixed()}\t(total)\n`)
  if (totalCoverage < threshold) {
    process.stderr.write(`expected at least ${threshold}% coverage, but was ${totalCoverage.toFixed()}%\n`)
    process.exit(1)
  }
})().catch(error => {
  process.stderr.write(`${error}\n`)
  process.exit(2)
})
