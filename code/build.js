#!/usr/bin/env node
const { TreeBaseBuilder } = require("jtree/products/treeBase.node.js")
const { ScrollFolder } = require("scroll-cli")

const { folder, builtSiteFolder } = require("./folder.js")

new TreeBaseBuilder(folder).compileTreeBaseFilesToScrollFiles(builtSiteFolder)
new ScrollFolder(builtSiteFolder).buildFiles()
