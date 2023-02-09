#!/usr/bin/env node

const path = require("path")
const { Utils } = require("jtree/products/Utils.js")
const { TreeBaseServer } = require("jtree/products/treeBaseServer.node.js")
const { ScrollFile, getFullyExpandedFile } = require("scroll-cli")
const { folder, builtSiteFolder, ignoreFolder } = require("./folder.js")

const scrollHeader = getFullyExpandedFile(
  path.join(builtSiteFolder, "header.scroll")
).code

const scrollFooter = getFullyExpandedFile(
  path.join(builtSiteFolder, "footer.scroll")
).code

class CancerDbServer extends TreeBaseServer {
  isProd = false
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

  prep() {
    this.serveFolder(builtSiteFolder)
    return this
  }
}

class CancerDbServerCommands {
  server = new CancerDbServer(folder, ignoreFolder).prep()

  startDevServerCommand(port) {
    this.server.listen(port)
  }

  startProdServerCommand() {
    this.server.listenProd()
  }
}

module.exports = { CancerDbServer }

if (!module.parent)
  Utils.runCommand(new CancerDbServerCommands(), process.argv[2], process.argv[3])
