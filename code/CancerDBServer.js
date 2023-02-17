#!/usr/bin/env node

const path = require("path")
const numeral = require("numeral")
const { Utils } = require("jtree/products/Utils.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")
const { TreeBaseServer } = require("jtree/products/treeBaseServer.node.js")
const { ScrollFile } = require("scroll-cli")
const {
  TreeBaseFolder,
  TreeBaseFile
} = require("jtree/products/treeBase.node.js")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const ignoreFolder = path.join(baseFolder, "ignore")
const siteFolder = path.join(baseFolder, "site")
const treatmentsFolder = path.join(siteFolder, "treatments")

const scrollHeader = new ScrollFile(
  undefined,
  path.join(siteFolder, "header.scroll")
).importResults.code

const scrollFooter = Disk.read(path.join(siteFolder, "footer.scroll"))

class CancerDBFile extends TreeBaseFile {
  get webPermalink() {
    return `/treatments/${this.permalink}`
  }
}

class CancerDBFolder extends TreeBaseFolder {
  createParser() {
    return new TreeNode.Parser(CancerDBFile)
  }
}

const cancerDBFolder = new CancerDBFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

class TreatmentPageTemplate {
  constructor(file) {
    this.file = file
  }

  toScroll() {
    const { file, typeName, title } = this
    const { id } = file

    return `import header.scroll
title ${title}

html <a class="prevLang" href="${
      this.prevPage
    }">&lt;</a><a class="nextLang" href="${this.nextPage}">&gt;</a>

code
 ${this.file.childrenToString().replace(/\n/g, "\n ")}

viewSourceUrl ${this.sourceUrl}

keyboardNav ${this.prevPage} ${this.nextPage}

import ../footer.scroll
`.replace(/\n\n\n+/g, "\n\n")
  }

  get sourceUrl() {
    return `https://github.com/breck7/CancerDB/blob/main/database/things/${this.id}.cancerdb`
  }

  get title() {
    return this.file.get("title")
  }

  get typeName() {
    return ""
  }

  get quickLinks() {
    return ""
  }

  get prevPage() {
    return this.file.getPrevious().permalink
  }

  get nextPage() {
    return this.file.getNext().permalink
  }
}

const delimitedEscapeFunction = value =>
  value.includes("\n") ? value.split("\n")[0] : value
const delimiter = " DeLiM "

class CancerDBServer extends TreeBaseServer {
  isProd = false
  constructor(folder, ignoreFolder) {
    super(folder, ignoreFolder)
    this.serveFolder(siteFolder)
    this.initSearch()
    this.buildAutocomplete()
  }

  buildAutocomplete() {
    const { folder } = this
    Disk.writeIfChanged(
      path.join(siteFolder, "autocomplete.json"),
      JSON.stringify(
        folder.map(file => {
          return {
            label: file.get("title"),
            id: file.id,
            url: `/treatments/${file.id}.html`
          }
        }),
        undefined,
        2
      )
    )
  }

  initSearch() {
    super.initSearch()
    const { app } = this

    const searchCache = {}
    app.get("/search.html", (req, res) => {
      const { searchServer } = this
      const query = req.query.q ?? ""
      searchServer.logQuery(query, req.ip, "scroll")
      if (!searchCache[query]) searchCache[query] = this.searchToHtml(query)

      res.send(searchCache[query])
    })

    app.get("/fullTextSearch", (req, res) =>
      res.redirect(`/search.html?q=includes+${req.query.q}`)
    )
  }

  // todo: cleanup
  searchToHtml(originalQuery) {
    const {
      hits,
      queryTime,
      columnNames,
      errors,
      title,
      description
    } = this.searchServer.search(
      decodeURIComponent(originalQuery).replace(/\r/g, "")
    )
    const { folder } = this
    const results = new TreeNode(hits)._toDelimited(
      delimiter,
      columnNames,
      delimitedEscapeFunction
    )
    const encodedTitle = Utils.escapeScrollAndHtml(title)
    const encodedDescription = Utils.escapeScrollAndHtml(description)

    return new ScrollFile(
      `${scrollHeader}

html
 <link rel="stylesheet" type="text/css" href="/jtree/sandbox/lib/codemirror.css" />
 <link rel="stylesheet" type="text/css" href="/jtree/sandbox/lib/codemirror.show-hint.css" />
 <script src="/dist/editorLibCode.js"></script>

title Search Results
 hidden

html <form method="get" action="search.html" class="tqlForm"><textarea id="tqlInput" name="q"></textarea><input type="submit" value="Search"></form>
html <div id="tqlErrors"></div>

* Searched ${numeral(folder.length).format("0,0")} files and found ${
        hits.length
      } matches in ${queryTime}s. 
 class searchResultsHeader

${title ? `# ${encodedTitle}` : ""}
${description ? `* ${encodedDescription}` : ""}

table ${delimiter}
 ${results.replace(/\n/g, "\n ")}

html <script>document.addEventListener("DOMContentLoaded", () => new TreeBaseFrontEndApp().renderSearchPage())</script>

${scrollFooter}
`
    ).html
  }
}

class CancerDBServerCommands {
  server = new CancerDBServer(cancerDBFolder, ignoreFolder)

  startDevServerCommand(port) {
    this.server.listen(port)
  }

  startProdServerCommand() {
    this.server.listenProd()
  }

  buildAllCommand() {
    cancerDBFolder.forEach(file =>
      Disk.write(
        path.join(treatmentsFolder, `${file.id}.scroll`),
        new TreatmentPageTemplate(file).toScroll()
      )
    )
  }

  formatCommand() {
    cancerDBFolder.forEach(file => {
      file.prettifyAndSave()
      // todo: fix this bug upstream in jtree.
      file.setChildren(file.childrenToString().replace(/\n\n+/g, "\n\n"))
      file.save()
    })
  }

  createFromTreeCommand() {
    TreeNode.fromDisk(path.join(ignoreFolder, "create.tree")).forEach(node =>
      cancerDBFolder.createFile(node.childrenToString())
    )
  }

  createFromCsvCommand() {
    TreeNode.fromCsv(
      Disk.read(path.join(ignoreFolder, "create.csv"))
    ).forEach(node => cancerDBFolder.createFile(node.childrenToString()))
  }
}

module.exports = { CancerDBServer, cancerDBFolder }

if (!module.parent)
  Utils.runCommand(
    new CancerDBServerCommands(),
    process.argv[2],
    process.argv[3]
  )
