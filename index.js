const fs = require('fs-extra')
const csvparse = require('csv-parse/lib/sync')
const PolicyLoader = require('./policy-loader')
const HTMLPolicyLoader = require('./html-policy-loader')

const inputFilePath = process.argv.slice(2)
if (!inputFilePath.length) {
  console.log(`
    missing path to csv download
    ex: npm start ~/#MovingForward.csv
  `)
  process.exit()
}

const csv = fs.readFileSync(inputFilePath[0], 'utf8')

const records = csvparse(csv, {
  columns: true,
  skip_empty_lines: true
})

const outPath = './out/'
fs.removeSync(outPath)
fs.mkdirSync(outPath)

async function run () {
  await HTMLPolicyLoader.start()

  for (let record of records) {
    const name = record[`﻿Organization`] // GABE: clean up this unicode char
    const policyURL = record['Policy Link']

    if (!name || !policyURL) { continue }

    const loader = new PolicyLoader(name, policyURL)
    await loader.process()
  }

  await HTMLPolicyLoader.stop()
}

run()
