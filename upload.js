const fs = require('fs-extra')
const git = require('simple-git/promise')

async function moveFiles (from, to) {
  const files = await fs.readdir(from)
  for (let file of files) {
    console.log(`Moving file`, file)
    fs.copyFileSync(`${from}/${file}`, `${to}/${file}`)
  }
}

async function cleanDestDirectory (to) {
  const files = await fs.readdir(to)
  for (let file of files) {
    const stat = await fs.stat(`${to}/${file}`)
    if (stat.isFile()) {
      fs.removeSync(`${to}/${file}`)
    }
  }
}

async function main () {
  const repoDir = process.argv.slice(2)[0]
  await fs.ensureDir(repoDir)
  await fs.ensureDir('./out')

  const repo = git(repoDir)
  try {
    await repo.fetch('origin', 'master')
    await repo.reset('hard')
    await repo.pull()
  } catch (err) {
  }

  await cleanDestDirectory(repoDir)
  await moveFiles('./out', repoDir)

  const now = new Date()
  await repo.commit(`Policies exported on ${now.toDateString()}`, '.')
  await repo.push()

  const remotes = await repo.remote(['show', 'origin'])

  let commitURL = ''
  const urlMatches = /Push\s*URL:\s(http.*).git$/gm.exec(remotes).slice(1)
  if (urlMatches.length) {
    const hash = (await repo.log()).latest.hash
    commitURL = `${urlMatches[0]}/commit/${hash}`
  }

  console.log(`Uploaded:`, commitURL)
}

main()
