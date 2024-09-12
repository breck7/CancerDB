#! /usr/bin/env node

const path = require("path")
const { Utils } = require("scrollsdk/products/Utils.js")
const { ScrollSetCLI } = require("scroll-cli/ScrollSetCLI.js")

class CancerDBCli extends ScrollSetCLI {
  baseFolder = __dirname
  conceptsFolder = path.join(__dirname, "concepts")
  parsersFile = path.join(__dirname, "code", "measures.parsers")
  scrollSetName = "cancerdb"
  compiledConcepts = "./cancerdb.json"
}

module.exports = { CancerDBCli }

if (!module.parent)
  Utils.runCommand(new CancerDBCli(), process.argv[2], process.argv[3])
