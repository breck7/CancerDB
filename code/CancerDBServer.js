#!/usr/bin/env node

const path = require("path")
const { Utils } = require("jtree/products/Utils.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeBaseServer } = require("jtree/products/treeBaseServer.node.js")
const { ScrollFile } = require("scroll-cli")
const {
  TreeBaseFolder,
  TreeBaseBuilder
} = require("jtree/products/treeBase.node.js")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const ignoreFolder = path.join(baseFolder, "ignore")
const siteFolder = path.join(baseFolder, "site")

const folder = new TreeBaseFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

const scrollHeader = new ScrollFile(
  undefined,
  path.join(siteFolder, "header.scroll")
).importResults.code

const scrollFooter = Disk.read(path.join(siteFolder, "footer.scroll"))

class CancerDBServer extends TreeBaseServer {
  isProd = false
  constructor(folder, ignoreFolder) {
    super(folder, ignoreFolder)
    this.serveFolder(siteFolder)
    this.initSearch()
  }

  scrollToHtml(scrollContent) {
    return new ScrollFile(
      `replace BASE_URL ${this.isProd ? "https://cancerdb.com" : ""}

${scrollHeader}

html <div id="successLink"></div><div id="errorMessage" style="color: red;"></div>

${scrollContent}

${scrollFooter}
`
    ).html
  }
}

class CancerDBServerCommands {
  server = new CancerDBServer(folder, ignoreFolder)

  startDevServerCommand(port) {
    this.server.listen(port)
  }

  startProdServerCommand() {
    this.server.listenProd()
  }

  buildAllCommand() {
    new TreeBaseBuilder(folder).compileTreeBaseFilesToScrollFiles(siteFolder)
  }
}

module.exports = { CancerDBServer }

if (!module.parent)
  Utils.runCommand(
    new CancerDBServerCommands(),
    process.argv[2],
    process.argv[3]
  )
