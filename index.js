const Maybe = require('folktale/maybe')

const { buildSummary, fileEntry, dirEntry } = require('./renderer')
const processTree = require('./processor')
const {
  getPathTree,
  readFile,
  writeSummaryFile,
  isReadmeExistingInDir
} = require('./fs')

const { resolve } = require('path');

const print = str => x => { console.log(str, x); return x }

module.exports = {
  hooks: {
    init: async function () {
      try {
        const root = resolve('')
        const config = getConfig(root)

        await plan(config)
          .run()
          .promise()

        console.info(`\x1b[36mgitbook-plugin-summary: \x1b[32m${config.summaryFilename} generated successfully.`)
      } catch (e) {
        console.error('\n\n', e)
      }
    }
  }
}

const plan = config =>
  getPathTree(config)
    .map(getTreeInfo(config))
    .chain(processTree(config))
    .map(renderEntries(config))
    .map(buildSummary(config))
    .map(writeSummaryFile(config))

const getTreeInfo = config => tree =>
  tree.map(getNeededInfo(config))

const getNeededInfo = config => fileType =>
  fileType
    .map(
      readFile(config),
      isReadmeExistingInDir(config)
    )

const renderEntries = config => tree =>
  tree
    .map(renderEntry(config))

const renderEntry = config => file =>
  file.fold(
    fileEntry(config.isReadme),
    dirEntry(config.readmeFilename)
  )

const getConfig = (root) => {
  const readmeFilename = 'README.md'
  const summaryFilename = 'SUMMARY.md'
  const bookTitle = 'My Book'

  return {
    root,
    bookTitle: 'My Book',
    isReadme: path => path.includes(readmeFilename),
    summaryFilename,
    readmeFilename,
  }
}
