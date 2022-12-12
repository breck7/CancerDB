const path = require("path")
const { TreeBaseFolder } = require("jtree/products/treeBase.node.js")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const ignoreFolder = path.join(baseFolder, "ignore")
const builtSiteFolder = path.join(baseFolder, "site")

const folder = new TreeBaseFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

module.exports = { folder, ignoreFolder, builtSiteFolder }
