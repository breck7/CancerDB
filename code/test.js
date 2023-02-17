#!/usr/bin/env node

const tap = require("tap")
const { ScrollFolder } = require("scroll-cli")
const { CancerDBServer, cancerDBFolder } = require("./CancerDBServer.js")
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
  let invalidIds = 0
  let validIds = 0
  cancerDBFolder.forEach(file => {
    if (file.id !== Utils.titleToPermalink(file.id)) invalidIds++
    else validIds++
  })

  if (!invalidIds) {
    areEqual(0, 0, `all ${validIds} filenames are valid`)
    // We can abort early to print a lot of test output
    return
  }

  cancerDBFolder.forEach(file =>
    areEqual(
      file.id,
      Utils.titleToPermalink(file.id),
      `${file.id} is a valid filename`
    )
  )
}

// todo
testTree.ensureNoErrorsInBlog = areEqual => {
  const checkScroll = folderPath => {
    const folder = new ScrollFolder(folderPath)
    areEqual(
      folder.grammarErrors.length,
      0,
      `no grammarErrors in ${folderPath}`
    )
    //areEqual(folder.errors.length, 0, `no errors in ${folderPath}`)
  }
}

testTree.ensureNoErrorsInDb = areEqual => {
  const { errors } = cancerDBFolder
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
