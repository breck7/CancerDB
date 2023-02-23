#!/usr/bin/env node

const path = require("path")
const numeral = require("numeral")
const { Utils } = require("jtree/products/Utils.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")
const { TrueBaseServer } = require("jtree/products/trueBaseServer.node.js")
const { ScrollFile } = require("scroll-cli")
const { GrammarCompiler } = require("jtree/products/GrammarCompiler.js")
const {
  TrueBaseFolder,
  TrueBaseFile
} = require("jtree/products/trueBase.node.js")

const baseFolder = path.join(__dirname, "..")
const truebaseFolder = path.join(baseFolder, "truebase")
const ignoreFolder = path.join(baseFolder, "ignore")
const siteFolder = path.join(baseFolder, "site")
const distFolder = path.join(siteFolder, "dist")
const nodeModulesFolder = path.join(baseFolder, "node_modules")
const jtreeFolder = path.join(nodeModulesFolder, "jtree")
const treatmentsFolder = path.join(siteFolder, "treatments")

const combineJsFiles = (baseDir = "", filepaths = []) =>
  filepaths
    .map(filename => Disk.read(path.join(baseDir, filename)))
    .join(`;\n\n`)

const scrollHeader = new ScrollFile(
  undefined,
  path.join(siteFolder, "header.scroll")
).importResults.code

const scrollFooter = Disk.read(path.join(siteFolder, "footer.scroll"))

class CancerDBFile extends TrueBaseFile {
  get webPermalink() {
    return `/treatments/${this.permalink}`
  }
}

class CancerDBFolder extends TrueBaseFolder {
  createParser() {
    return new TreeNode.Parser(CancerDBFile)
  }

  get filesWithInvalidFilenames() {
    return this.filter(file => file.id !== Utils.titleToPermalink(file.id))
  }
}

const cancerDBFolder = new CancerDBFolder()
  .setDir(path.join(truebaseFolder, "things"))
  .setGrammarDir(path.join(truebaseFolder, "grammar"))
  .loadFolder()

const templates = {}
templates.default = file => `code
 ${file.childrenToString().replace(/\n/g, "\n ")}`
templates.documentary = file =>
  file.has("youtube") ? `youTube ${file.get("youtube")}` : ""

class TreatmentPageTemplate {
  constructor(file) {
    this.file = file
  }

  get quickLinks() {
    const { file } = this

    // Sigh. After learning Material Designs realized
    // it's partially broken on purpose:
    // https://github.com/google/material-design-icons/issues/166
    const SVGS = {
      twitter: `<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
      reddit: `<svg role="img" width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 18.65625 4 C 16.558594 4 15 5.707031 15 7.65625 L 15 11.03125 C 12.242188 11.175781 9.742188 11.90625 7.71875 13.0625 C 6.945313 12.316406 5.914063 12 4.90625 12 C 3.816406 12 2.707031 12.355469 1.9375 13.21875 L 1.9375 13.25 L 1.90625 13.28125 C 1.167969 14.203125 0.867188 15.433594 1.0625 16.65625 C 1.242188 17.777344 1.898438 18.917969 3.03125 19.65625 C 3.023438 19.769531 3 19.882813 3 20 C 3 22.605469 4.574219 24.886719 6.9375 26.46875 C 9.300781 28.050781 12.488281 29 16 29 C 19.511719 29 22.699219 28.050781 25.0625 26.46875 C 27.425781 24.886719 29 22.605469 29 20 C 29 19.882813 28.976563 19.769531 28.96875 19.65625 C 30.101563 18.917969 30.757813 17.777344 30.9375 16.65625 C 31.132813 15.433594 30.832031 14.203125 30.09375 13.28125 L 30.0625 13.25 C 29.292969 12.386719 28.183594 12 27.09375 12 C 26.085938 12 25.054688 12.316406 24.28125 13.0625 C 22.257813 11.90625 19.757813 11.175781 17 11.03125 L 17 7.65625 C 17 6.675781 17.558594 6 18.65625 6 C 19.175781 6 19.820313 6.246094 20.8125 6.59375 C 21.65625 6.890625 22.75 7.21875 24.15625 7.3125 C 24.496094 8.289063 25.414063 9 26.5 9 C 27.875 9 29 7.875 29 6.5 C 29 5.125 27.875 4 26.5 4 C 25.554688 4 24.738281 4.535156 24.3125 5.3125 C 23.113281 5.242188 22.246094 4.992188 21.46875 4.71875 C 20.566406 4.402344 19.734375 4 18.65625 4 Z M 16 13 C 19.152344 13 21.964844 13.867188 23.9375 15.1875 C 25.910156 16.507813 27 18.203125 27 20 C 27 21.796875 25.910156 23.492188 23.9375 24.8125 C 21.964844 26.132813 19.152344 27 16 27 C 12.847656 27 10.035156 26.132813 8.0625 24.8125 C 6.089844 23.492188 5 21.796875 5 20 C 5 18.203125 6.089844 16.507813 8.0625 15.1875 C 10.035156 13.867188 12.847656 13 16 13 Z M 4.90625 14 C 5.285156 14 5.660156 14.09375 5.96875 14.25 C 4.882813 15.160156 4.039063 16.242188 3.53125 17.4375 C 3.277344 17.117188 3.125 16.734375 3.0625 16.34375 C 2.953125 15.671875 3.148438 14.976563 3.46875 14.5625 C 3.472656 14.554688 3.464844 14.539063 3.46875 14.53125 C 3.773438 14.210938 4.3125 14 4.90625 14 Z M 27.09375 14 C 27.6875 14 28.226563 14.210938 28.53125 14.53125 C 28.535156 14.535156 28.527344 14.558594 28.53125 14.5625 C 28.851563 14.976563 29.046875 15.671875 28.9375 16.34375 C 28.875 16.734375 28.722656 17.117188 28.46875 17.4375 C 27.960938 16.242188 27.117188 15.160156 26.03125 14.25 C 26.339844 14.09375 26.714844 14 27.09375 14 Z M 11 16 C 9.894531 16 9 16.894531 9 18 C 9 19.105469 9.894531 20 11 20 C 12.105469 20 13 19.105469 13 18 C 13 16.894531 12.105469 16 11 16 Z M 21 16 C 19.894531 16 19 16.894531 19 18 C 19 19.105469 19.894531 20 21 20 C 22.105469 20 23 19.105469 23 18 C 23 16.894531 22.105469 16 21 16 Z M 21.25 21.53125 C 20.101563 22.597656 18.171875 23.28125 16 23.28125 C 13.828125 23.28125 11.898438 22.589844 10.75 21.65625 C 11.390625 23.390625 13.445313 25 16 25 C 18.554688 25 20.609375 23.398438 21.25 21.53125 Z"/></svg>`,
      wikipedia: `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="98.05px" height="98.05px" viewBox="0 0 98.05 98.05" style="enable-background:new 0 0 98.05 98.05;" xml:space="preserve"><path d="M98.023,17.465l-19.584-0.056c-0.004,0.711-0.006,1.563-0.017,2.121c1.664,0.039,5.922,0.822,7.257,4.327L66.92,67.155 c-0.919-2.149-9.643-21.528-10.639-24.02l9.072-18.818c1.873-2.863,5.455-4.709,8.918-4.843l-0.01-1.968L55.42,17.489 c-0.045,0.499,0.001,1.548-0.068,2.069c5.315,0.144,7.215,1.334,5.941,4.508c-2.102,4.776-6.51,13.824-7.372,15.475 c-2.696-5.635-4.41-9.972-7.345-16.064c-1.266-2.823,1.529-3.922,4.485-4.004v-1.981l-21.82-0.067 c0.016,0.93-0.021,1.451-0.021,2.131c3.041,0.046,6.988,0.371,8.562,3.019c2.087,4.063,9.044,20.194,11.149,24.514 c-2.685,5.153-9.207,17.341-11.544,21.913c-3.348-7.43-15.732-36.689-19.232-44.241c-1.304-3.218,3.732-5.077,6.646-5.213 l0.019-2.148L0,17.398c0.005,0.646,0.027,1.71,0.029,2.187c4.025-0.037,9.908,6.573,11.588,10.683 c7.244,16.811,14.719,33.524,21.928,50.349c0.002,0.029,2.256,0.059,2.281,0.008c4.717-9.653,10.229-19.797,15.206-29.56 L63.588,80.64c0.005,0.004,2.082,0.016,2.093,0.007c7.962-18.196,19.892-46.118,23.794-54.933c1.588-3.767,4.245-6.064,8.543-6.194 l0.032-1.956L98.023,17.465z"/></svg>`
    }

    const links = {
      home: file.get("website"),
      wikipedia: file.get(`wikipedia`),
      reddit: file.get("subreddit"),
      twitter: file.get("twitter"),
      edit: this.sourceUrl
    }
    return Object.keys(links)
      .filter(key => links[key])
      .map(key =>
        SVGS[key]
          ? `<a href="${links[key]}">${SVGS[key]}</a>`
          : `<a href="${links[key]}" class="material-symbols-outlined">${key}</a>`
      )
      .join(" ")
  }

  toScroll() {
    const { file } = this
    const type = file.get("type")
    const title = file.get("title")
    const description = file.get("description")
    const template = templates[type] ?? templates.default
    return `import header.scroll
viewSourceUrl ${this.sourceUrl}
keyboardNav ${this.prevPage} ${this.nextPage}
html <a class="prevLang" href="${
      this.prevPage
    }">&lt;</a><a class="nextLang" href="${this.nextPage}">&gt;</a>

title ${title}

html <div class="quickLinks">${this.quickLinks}</div>

${description ? description : ""}

${template(file)}

import ../footer.scroll
`.replace(/\n\n\n+/g, "\n\n")
  }

  get sourceUrl() {
    return `https://github.com/breck7/CancerDB/blob/main/truebase/things/${this.file.id}.cdb`
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

class CancerDBServer extends TrueBaseServer {
  isProd = false
  constructor(folder, ignoreFolder) {
    super(folder, ignoreFolder)
    this.serveFolder(siteFolder)
    this.buildTqlExtension()
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
      decodeURIComponent(originalQuery).replace(/\r/g, ""),
      this.tqlParser
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

html <script>document.addEventListener("DOMContentLoaded", () => new TrueBaseFrontEndApp().renderSearchPage())</script>

${scrollFooter}
`
    ).html
  }

  buildTqlExtension() {
    if (!Disk.exists(distFolder)) Disk.mkdir(distFolder)
    const tqlPath = path.join(jtreeFolder, "langs", "tql", "tql.grammar")
    const tqlGrammar = new TreeNode(Disk.read(tqlPath))
    const columnNames = new TreeNode(this.folder.grammarCode)
      .get("cdbNode sortTemplate")
      .split(" ")
      .filter(i => i)
      .join(" ")
    tqlGrammar.getNode("columnNameCell").set("enum", columnNames)

    const cancerDbTqlPath = path.join(distFolder, "cdbTql.grammar")
    Disk.write(cancerDbTqlPath, tqlGrammar.toString())
    GrammarCompiler.compileGrammarForBrowser(
      cancerDbTqlPath,
      distFolder + "/",
      false
    )
    const jsPath = GrammarCompiler.compileGrammarForNodeJs(
      cancerDbTqlPath,
      distFolder + "/",
      true
    )
    this.tqlParser = require(jsPath)
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
    this.buildDistFolder()
  }

  buildDistFolder() {
    if (!Disk.exists(distFolder)) Disk.mkdir(distFolder)
    this.server.buildTqlExtension()

    Disk.write(path.join(distFolder, "cdb.grammar"), cancerDBFolder.grammarCode)

    // todo: cleanup
    GrammarCompiler.compileGrammarForBrowser(
      path.join(distFolder, "cdb.grammar"),
      distFolder + "/",
      false
    )

    const combinedJs =
      combineJsFiles(
        path.join(jtreeFolder),
        `products/Utils.browser.js
products/TreeNode.browser.js
products/GrammarLanguage.browser.js
products/GrammarCodeMirrorMode.browser.js
sandbox/lib/codemirror.js
sandbox/lib/show-hint.js`.split("\n")
      ) +
      "\n\n" +
      combineJsFiles(distFolder, "cdb.browser.js tql.browser.js".split(" ")) +
      "\n\n" +
      combineJsFiles(
        path.join(__dirname, "frontEndJavascript"),
        `libs.js autocomplete.js app.js`.split(" ")
      )

    Disk.write(path.join(distFolder, "combined.js"), combinedJs)

    const filepaths = [
      path.join(siteFolder, "scroll.css"),
      path.join(jtreeFolder, "sandbox/lib/codemirror.css"),
      path.join(jtreeFolder, "sandbox/lib/codemirror.show-hint.css"),
      path.join(siteFolder, "style.css")
    ]
    Disk.write(
      path.join(distFolder, "combined.css"),
      filepaths.map(Disk.read).join(`\n\n`)
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

  createFromTsvCommand() {
    TreeNode.fromTsv(
      Disk.read(path.join(ignoreFolder, "create.tsv"))
    ).forEach(node => cancerDBFolder.createFile(node.childrenToString()))
  }

  async crawlWikipediaCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const {
      WikipediaImporter
    } = require("../../truecrawler/wikipedia.org/Wikipedia.js")
    const importer = new WikipediaImporter(cancerDBFolder)
    await importer.fetchAllCommand()

    // return importer.filesWithWikipediaPages.forEach(linkedFile =>
    //   console.log(linkedFile.infoBox)
    // )

    const injectionSet = {
      Intravenous: "intravenous",
      "Intravenous therapy": "intravenous",
      "Topical administration": "topical",
      "Oral administration": "oral",
      "Capsule (pharmacy)": "oral",
      "Subcutaneous injection": "subcutaneousInjection",
      "intravenous infusion": "intravenous",
      "Intramuscular injection": "intramuscularInjection",
      "Subcutaneous administration": "subcutaneousInjection",
      "injectable (intravenous injection or infusion, intrathecal, or subcutaneously)":
        "intravenous",
      intravesical: "intravesical",
      "By mouth": "oral",
      intravenously: "intravenous",
      intravenous: "intravenous",
      Oral: "oral",
      "Topical medication": "topical",
      Intravesical: "intravesical",
      "by mouth, IM": "oral"
    }

    importer.filesWithWikipediaPages.forEach(linkedFile => {
      const { file, infoBox } = linkedFile

      // const { locationCity, locationCountry } = infoBox
      // if (locationCity && !file.has("city")) file.set("city", locationCity)
      // if (locationCountry && !file.has("country"))
      //   file.set("country", locationCountry)

      const { routesOfAdministration } = infoBox
      if (routesOfAdministration) {
        let value = injectionSet[routesOfAdministration]
        if (typeof routesOfAdministration === "object")
          value = routesOfAdministration
            .map(item => injectionSet[item])
            .filter(i => i)
            .join(" ")
        file.set("routesOfAdministration", value)
      }

      const fields = ["medlinePlus", "kegg", "drugBank", "pubChem"]
      fields.forEach(field => {
        const value = infoBox[field]
        if (value) {
          file.set(field, value)
        }
      })

      const { tradename } = infoBox
      if (tradename) {
        file.set(
          "tradenames",
          tradename
            .split(",")
            .map(i => i.trim())
            .filter(i => i.toLowerCase() !== "others")
            .join(" && ")
        )
      }

      file.prettifyAndSave()
    })
  }

  async crawlRedditCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const { RedditImporter } = require("../../truecrawler/reddit.com/Reddit.js")
    const importer = new RedditImporter(cancerDBFolder)
    await importer.fetchAllCommand()
    importer.writeToDatabaseCommand()
  }

  async crawlWebsiteCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const { WebsiteImporter } = require("../../truecrawler/website/Website.js")
    const importer = new WebsiteImporter(cancerDBFolder)
    await importer.downloadAllCommand()
    importer.matches.forEach(file => file.extractPhoneNumber())
  }
}

module.exports = { CancerDBServer, cancerDBFolder }

if (!module.parent)
  Utils.runCommand(
    new CancerDBServerCommands(),
    process.argv[2],
    process.argv[3]
  )
