require('dotenv').config()
const fs = require('fs-extra')
const csvparse = require('csv-parse/lib/sync')
const airtable = require('airtable')
const PolicyLoader = require('./policy-loader')
const HTMLPolicyLoader = require('./html-policy-loader')

function getCSVPolicies (filePath) {
  const policies = []
  const csv = fs.readFileSync(filePath, 'utf8')
  csvparse(csv, {
    columns: true,
    skip_empty_lines: true
  }).forEach(record => {
    const name = record[`﻿Organization`] // GABE: clean up this unicode char
    const url = record['Policy Link']
    if (!name || !url) { return }
    policies.push({ name, url })
  })
  return policies
}

async function getAirtablePolicies () {
  return new Promise((resolve, reject) => {
    const policies = []
    const base = airtable.base('appIdDbM8UmDkocYT')
    base('#MovingForward Orgs').select({
      fields: ['Organization', 'Policy Link'],
      view: 'Grid view -- All Details'
    }).eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        const name = record.get('Organization')
        const url = record.get('Policy Link')
        if (!name || !url) { return }
        policies.push({ name, url })
      })
      fetchNextPage()
    }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(policies)
      }
    })
  })
}

async function run () {
  let policies = []
  const inputFilePath = process.argv.slice(2)
  if (inputFilePath.length) {
    policies = getCSVPolicies(inputFilePath[0])
  } else if (process.env.AIRTABLE_API_KEY) {
    policies = await getAirtablePolicies()
  }

  if (!policies.length) {
    console.log(`Error loading policies, please check README for usage.`)
    process.exit()
  }

  // Clean out directory
  const outPath = './out/'
  fs.removeSync(outPath)
  fs.mkdirSync(outPath)

  await HTMLPolicyLoader.start()

  for (let policy of policies) {
    const loader = new PolicyLoader(policy.name, policy.url)
    await loader.process()
  }

  await HTMLPolicyLoader.stop()
}

run()
