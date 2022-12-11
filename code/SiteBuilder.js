#!/usr/bin/env node
const path = require("path")
const lodash = require("lodash")
const { jtree } = require("jtree")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeBaseFolder } = require("jtree/products/treeBase.node.js")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const builtSiteFolder = path.join(baseFolder, "site")

const folder = new TreeBaseFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

class TreeBasePageTemplate {
  constructor(file) {
    this.file = file
  }

  toScroll() {
    const { file, typeName, title } = this
    const { id } = file

    return `title ${title}

import settings.scroll
htmlTitle ${title} - ${lodash.upperFirst(typeName)}

html
 <a class="prevLang" href="${this.prevPage}">&lt;</a>
 <a class="nextLang" href="${this.nextPage}">&gt;</a>

viewSourceUrl https://github.com/breck7/CancerDB/blob/main/database/things/${id}.cancerdb

html
 <div class="quickLinks">${this.quickLinks}</div>

keyboardNav ${this.prevPage} ${this.nextPage}
`.replace(/\n\n\n+/g, "\n\n")
  }

  get type() {
    return this.file.get("title")
  }

  get typeName() {
    return ""
  }

  get quickLinks() {
    return ""
  }

  get prevPage() {
    return ""
  }

  get nextPage() {
    return ""
  }
}

class SiteBuilder {
  buildDatabasePagesCommand() {
    folder.forEach(file => {
      Disk.write(
        path.join(builtSiteFolder, `${file.id}.scroll`),
        new TreeBasePageTemplate(file).toScroll()
      )
    })
  }
}

if (!module.parent)
  jtree.Utils.runCommand(new SiteBuilder(), process.argv[2], process.argv[3])
