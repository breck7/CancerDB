#!/usr/bin/env node
const path = require("path")
const {
  TreeBaseFolder,
  TreeBaseBuilder
} = require("jtree/products/treeBase.node.js")
const { ScrollFolder } = require("scroll-cli")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const builtSiteFolder = path.join(baseFolder, "site")

const folder = new TreeBaseFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

const builder = new TreeBaseBuilder(folder)
builder.compileTreeBaseFilesToScrollFiles(builtSiteFolder)
new ScrollFolder(builtSiteFolder).buildFiles()
