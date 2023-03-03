#!/usr/bin/env node

const path = require("path")
const tap = require("tap")
const { ScrollFolder, ScrollCli } = require("scroll-cli")
const { CancerDB } = require("./CancerDB.js")
const { TestRacer } = require("jtree/products/TestRacer.js")
const { Utils } = require("jtree/products/Utils.js")

const testTree = {}

testTree.ensureNoErrorsInScrollExtensions = areEqual => {
  const scrollFolder = new ScrollFolder(__dirname)
  const { grammarErrors } = scrollFolder
  if (grammarErrors.length) console.log(grammarErrors)
  areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
}

testTree.ensureGoodFilenames = areEqual => {
  areEqual(
    CancerDB.folder.filesWithInvalidFilenames.length,
    0,
    `all ${CancerDB.folder.length} filenames are valid`
  )
}

testTree.ensureNoErrorsInBlog = areEqual => {
  const checkScroll = folderPath => {
    // Do not check all ~5K generated scroll files for errors b/c redundant and wastes time.
    // Just check the Javascript one below.
    if (folderPath.includes("truebase")) return
    const folder = new ScrollFolder(folderPath)
    areEqual(
      folder.grammarErrors.length + folder.errors.length,
      0,
      `no scroll errors in ${folderPath}`
    )
    //areEqual(folder.errors.length, 0, `no errors in ${folderPath}`)
  }

  const cli = new ScrollCli()
  cli.verbose = false
  Object.keys(cli.findScrollsInDirRecursive(path.join(__dirname, ".."))).map(
    checkScroll
  )
}

testTree.ensureNoErrorsInDb = areEqual => {
  const { errors } = CancerDB.folder
  if (errors.length)
    errors.forEach(err =>
      console.log(
        err._node.root.get("title"),
        err._node.getFirstWordPath(),
        err
      )
    )
  areEqual(errors.length, 0, "no errors in db")
}

testTree.ensureFieldsAreTrimmed = areEqual => {
  const scrollFolder = new ScrollFolder(__dirname)
  const { grammarErrors } = scrollFolder
  if (grammarErrors.length) console.log(grammarErrors)
  areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
}

if (module && !module.parent) TestRacer.testSingleFile(__filename, testTree)

module.exports = { testTree }
