#!/usr/bin/env node
const { TreeBaseBuilder } = require("jtree/products/treeBase.node.js")
const { folder, builtSiteFolder } = require("./folder.js")
new TreeBaseBuilder(folder).compileTreeBaseFilesToScrollFiles(builtSiteFolder)
