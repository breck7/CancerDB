#!/usr/bin/env node

const path = require("path")
const { jtree } = require("jtree")
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
  prodUrl = "https://cancerdb.com"
  isProd = false
  scrollToHtml(scrollContent) {
    return new ScrollFile(
      `replace BASE_URL ${this.isProd ? this.prodUrl : ""}
replace BUILD_URL ${this.isProd ? this.prodUrl : "/"}

${scrollHeader}

html <div id="successLink"></div><div id="errorMessage" style="color: red;"></div>

${scrollContent}

${scrollFooter}
`
    ).html
  }
}

const treeBaseServer = new CancerDbServer(folder, builtSiteFolder, ignoreFolder)

class HealServerCommands {
  startDevServerCommand(port) {
    treeBaseServer.listen(port)
  }

  startProdServerCommand() {
    treeBaseServer.isProd = true
    treeBaseServer.listenProd(ignoreFolder)
  }
}

jtree.Utils.runCommand(
  new HealServerCommands(),
  process.argv[2],
  process.argv[3]
)
