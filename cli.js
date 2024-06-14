#! /usr/bin/env node

const path = require("path")
const { Utils } = require("scrollsdk/products/Utils.js")
const { ScrollSetCLI } = require("./ScrollSet.js")

class CancerDBCli extends ScrollSetCLI {
  conceptsFolder = path.join(__dirname, "concepts")
  grammarFile = "code/measures.scroll"
  scrollSetName = "cancerdb"
  compiledConcepts = "./cancerdb.json"
}

module.exports = { CancerDBCli }

if (!module.parent)
  Utils.runCommand(new CancerDBCli(), process.argv[2], process.argv[3])
