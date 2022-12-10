#!/usr/bin/env node

const { jtree } = require("jtree")
const path = require("path")
const fs = require("fs")
const https = require("https")
const express = require("express")
const bodyParser = require("body-parser")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeBaseFolder } = require("jtree/products/treeBase.node.js")
const { SearchServer } = require("jtree/products/treeBaseSearchServer.node.js")
const { ScrollFile, getFullyExpandedFile } = require("scroll-cli")

const baseFolder = path.join(__dirname, "..")
const databaseFolder = path.join(baseFolder, "database")
const ignoreFolder = path.join(baseFolder, "ignore")
const builtSiteFolder = path.join(baseFolder, "site")

const folder = new TreeBaseFolder()
  .setDir(path.join(databaseFolder, "things"))
  .setGrammarDir(path.join(databaseFolder, "grammar"))
  .loadFolder()

const scrollSettings = getFullyExpandedFile(
  path.join(builtSiteFolder, "settings.scroll")
).code

class HealServer {
  homepage = Disk.read(path.join(builtSiteFolder, "index.html"))

  app = undefined
  constructor() {
    const app = express()
    this.app = app
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      )
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      )
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })

    app.get("/", (req, res) => res.send(this.homepage))

    app.use(express.static(__dirname))
    app.use(express.static(builtSiteFolder))

    const searchServer = new SearchServer(folder)
    const searchLogPath = path.join(ignoreFolder, "searchLog.tree")
    Disk.touch(searchLogPath)

    const searchHTMLCache = {}
    app.get("/search", (req, res) => {
      const originalQuery = req.query.q ?? ""

      searchServer.logQuery(searchLogPath, originalQuery, req.ip)

      if (!searchHTMLCache[originalQuery])
        searchHTMLCache[originalQuery] = this.scrollToHtml(
          searchServer.search(
            originalQuery,
            "html",
            ["id", "title", "type", "appeared"],
            "id"
          )
        )

      res.send(searchHTMLCache[originalQuery])
    })
  }

  listen(port = 4444) {
    this.app.listen(port, () =>
      console.log(
        `HealServer server running: \ncmd+dblclick: http://localhost:${port}/`
      )
    )
    return this
  }

  scrollToHtml(scrollContent) {
    return new ScrollFile(
      `replace BASE_URL ${this.isProd ? "https://cancerdb.com" : ""}
replace BUILD_URL ${this.isProd ? "https://heal.cancerdb.com" : "/"}

${scrollSettings}

css
 #editForm {
  width: 100%;
  height: 80%;
 }
 .cell {
   width: 48%;
   display: inline-block;
   vertical-align: top;
   padding: 5px;
 }
 #quickLinks, .missingRecommendedColumns {
   font-size: 80%;
 }

import header.scroll

html
 <div id="successLink"></div>
 <div id="errorMessage" style="color: red;"></div>

${scrollContent}

import footer.scroll
`
    ).html
  }

  isProd = false

  listenProd() {
    this.isProd = true
    const key = fs.readFileSync(path.join(ignoreFolder, "privkey.pem"))
    const cert = fs.readFileSync(path.join(ignoreFolder, "fullchain.pem"))
    https
      .createServer(
        {
          key,
          cert
        },
        this.app
      )
      .listen(443)

    const redirectApp = express()
    redirectApp.use((req, res) =>
      res.redirect(301, `https://${req.headers.host}${req.url}`)
    )
    redirectApp.listen(80, () => console.log(`Running redirect app`))
    return this
  }
}

class HealServerCommands {
  startDevServerCommand(port) {
    new HealServer().listen(port)
  }

  startProdServerCommand() {
    new HealServer().listenProd()
  }
}

export { HealServer }

if (!module.parent)
  jtree.Utils.runCommand(
    new HealServerCommands(),
    process.argv[2],
    process.argv[3]
  )
