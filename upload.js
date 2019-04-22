require('dotenv').config()
const fs = require('fs-extra')
const Octokit = require('@octokit/rest')

const DESTINATION_REPO_OWNER = 'gshahbazian'
const DESTINATION_REPO_NAME = 'movingforward-archive'

function base64File (file) {
  const bitmap = fs.readFileSync(file)
  return Buffer.from(bitmap).toString('base64')
}

async function main () {
  const octokit = new Octokit({
    auth: process.env.GITHUB_API_TOKEN
  })

  const archiveRepo = await octokit.repos.getBranch({
    owner: DESTINATION_REPO_OWNER,
    repo: DESTINATION_REPO_NAME,
    branch: 'master'
  })
  const masterSha = archiveRepo.data.commit.sha

  let treeFiles = []

  const files = await fs.readdir('./out')
  for (let file of files) {
    if (file === '.DS_Store') { continue }

    let filePath = `./out/${file}`
    console.log(`Uploading file`, filePath)

    const blob = await octokit.git.createBlob({
      owner: DESTINATION_REPO_OWNER,
      repo: DESTINATION_REPO_NAME,
      content: base64File(filePath),
      encoding: 'base64'
    })

    treeFiles.push({
      path: file,
      mode: '100644',
      sha: blob.data.sha
    })
  }

  if (!treeFiles.length) {
    console.log(`No files found`)
    return
  }

  const tree = await octokit.git.createTree({
    owner: DESTINATION_REPO_OWNER,
    repo: DESTINATION_REPO_NAME,
    tree: treeFiles
  })

  const now = new Date()
  const commit = await octokit.git.createCommit({
    owner: DESTINATION_REPO_OWNER,
    repo: DESTINATION_REPO_NAME,
    message: `Policies exported on ${now.toDateString()}`,
    tree: tree.data.sha,
    author: { name: 'WeAreMovingForward', email: 'hello@venturemovingforward.org' },
    parents: [masterSha]
  })

  const ref = await octokit.git.updateRef({
    owner: DESTINATION_REPO_OWNER,
    repo: DESTINATION_REPO_NAME,
    ref: 'heads/master',
    sha: commit.data.sha
  })

  console.log(`Published to:`, `https://github.com/${DESTINATION_REPO_OWNER}/${DESTINATION_REPO_NAME}/commit/${ref.data.object.sha}`)
}

main()
