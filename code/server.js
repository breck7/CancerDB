#!/usr/bin/env node

const { jtree } = require("jtree")
const { TreeBaseServer } = require("jtree/products/treeBaseServer.node.js")

const { folder, builtSiteFolder, ignoreFolder } = require("./folder.js")

const treeBaseServer = new TreeBaseServer(
  folder,
  builtSiteFolder,
  ignoreFolder,
  "https://cancerdb.com"
)

class HealServerCommands {
  startDevServerCommand(port) {
    treeBaseServer.listen(port)
  }

  startProdServerCommand() {
    treeBaseServer.listenProd(ignoreFolder)
  }
}

jtree.Utils.runCommand(
  new HealServerCommands(),
  process.argv[2],
  process.argv[3]
)
