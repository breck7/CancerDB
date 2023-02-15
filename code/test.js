#!/usr/bin/env node

const tap = require("tap")
const { ScrollFolder } = require("scroll-cli")
const { CancerDBServer } = require("./CancerDBServer.js")

const runTree = testTree =>
  Object.keys(testTree).forEach(key => {
    testTree[key](tap.equal)
  })

const testTree = {}

testTree.ensureNoErrorsInScrollExtensions = areEqual => {
  const scrollFolder = new ScrollFolder(__dirname)
  const { grammarErrors } = scrollFolder
  if (grammarErrors.length) console.log(grammarErrors)
  areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
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

testTree.ensureFieldsAreTrimmed = areEqual => {
  const scrollFolder = new ScrollFolder(__dirname)
  const { grammarErrors } = scrollFolder
  if (grammarErrors.length) console.log(grammarErrors)
  areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
}

if (module && !module.parent) runTree(testTree)

module.exports = { testTree }
