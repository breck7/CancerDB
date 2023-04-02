#!/usr/bin/env node

/*
* To investigate slowdowns:
code
 node --cpu-prof --cpu-prof-name=test.cpuprofile ./code/CancerDB.js testPerf
* Then:
- open a new Chrome tab
- open devtools
- click Performance
- click "Load Profile..."
- select your test.cpuprofile
*/

const path = require("path")
const lodash = require("lodash")
const numeral = require("numeral")
const { Utils } = require("jtree/products/Utils.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")
const { TrueBaseServer } = require("truebase/server/TrueBaseServer.js")
const { TrueBaseFolder, TrueBaseFile } = require("truebase/server/TrueBase.js")

const baseFolder = path.join(__dirname, "..")
const ignoreFolder = path.join(baseFolder, "ignore")
const siteFolder = path.join(baseFolder, "site")
const pagesDir = path.join(siteFolder, "pages")

class CancerDBFile extends TrueBaseFile {
  get names() {
    return [
      this.id,
      this.title,
      this.get("uscsId"),
      this.get("standsFor"),
      ...this.getAll("aka")
    ].filter(i => i)
  }

  get quickLinks() {
    // Sigh. After learning Material Designs realized
    // it's partially broken on purpose:
    // https://github.com/google/material-design-icons/issues/166
    // https://ionic.io/ionicons/ is awesome though!
    const SVGS = {
      twitter: `<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
      reddit: `<svg role="img" width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 18.65625 4 C 16.558594 4 15 5.707031 15 7.65625 L 15 11.03125 C 12.242188 11.175781 9.742188 11.90625 7.71875 13.0625 C 6.945313 12.316406 5.914063 12 4.90625 12 C 3.816406 12 2.707031 12.355469 1.9375 13.21875 L 1.9375 13.25 L 1.90625 13.28125 C 1.167969 14.203125 0.867188 15.433594 1.0625 16.65625 C 1.242188 17.777344 1.898438 18.917969 3.03125 19.65625 C 3.023438 19.769531 3 19.882813 3 20 C 3 22.605469 4.574219 24.886719 6.9375 26.46875 C 9.300781 28.050781 12.488281 29 16 29 C 19.511719 29 22.699219 28.050781 25.0625 26.46875 C 27.425781 24.886719 29 22.605469 29 20 C 29 19.882813 28.976563 19.769531 28.96875 19.65625 C 30.101563 18.917969 30.757813 17.777344 30.9375 16.65625 C 31.132813 15.433594 30.832031 14.203125 30.09375 13.28125 L 30.0625 13.25 C 29.292969 12.386719 28.183594 12 27.09375 12 C 26.085938 12 25.054688 12.316406 24.28125 13.0625 C 22.257813 11.90625 19.757813 11.175781 17 11.03125 L 17 7.65625 C 17 6.675781 17.558594 6 18.65625 6 C 19.175781 6 19.820313 6.246094 20.8125 6.59375 C 21.65625 6.890625 22.75 7.21875 24.15625 7.3125 C 24.496094 8.289063 25.414063 9 26.5 9 C 27.875 9 29 7.875 29 6.5 C 29 5.125 27.875 4 26.5 4 C 25.554688 4 24.738281 4.535156 24.3125 5.3125 C 23.113281 5.242188 22.246094 4.992188 21.46875 4.71875 C 20.566406 4.402344 19.734375 4 18.65625 4 Z M 16 13 C 19.152344 13 21.964844 13.867188 23.9375 15.1875 C 25.910156 16.507813 27 18.203125 27 20 C 27 21.796875 25.910156 23.492188 23.9375 24.8125 C 21.964844 26.132813 19.152344 27 16 27 C 12.847656 27 10.035156 26.132813 8.0625 24.8125 C 6.089844 23.492188 5 21.796875 5 20 C 5 18.203125 6.089844 16.507813 8.0625 15.1875 C 10.035156 13.867188 12.847656 13 16 13 Z M 4.90625 14 C 5.285156 14 5.660156 14.09375 5.96875 14.25 C 4.882813 15.160156 4.039063 16.242188 3.53125 17.4375 C 3.277344 17.117188 3.125 16.734375 3.0625 16.34375 C 2.953125 15.671875 3.148438 14.976563 3.46875 14.5625 C 3.472656 14.554688 3.464844 14.539063 3.46875 14.53125 C 3.773438 14.210938 4.3125 14 4.90625 14 Z M 27.09375 14 C 27.6875 14 28.226563 14.210938 28.53125 14.53125 C 28.535156 14.535156 28.527344 14.558594 28.53125 14.5625 C 28.851563 14.976563 29.046875 15.671875 28.9375 16.34375 C 28.875 16.734375 28.722656 17.117188 28.46875 17.4375 C 27.960938 16.242188 27.117188 15.160156 26.03125 14.25 C 26.339844 14.09375 26.714844 14 27.09375 14 Z M 11 16 C 9.894531 16 9 16.894531 9 18 C 9 19.105469 9.894531 20 11 20 C 12.105469 20 13 19.105469 13 18 C 13 16.894531 12.105469 16 11 16 Z M 21 16 C 19.894531 16 19 16.894531 19 18 C 19 19.105469 19.894531 20 21 20 C 22.105469 20 23 19.105469 23 18 C 23 16.894531 22.105469 16 21 16 Z M 21.25 21.53125 C 20.101563 22.597656 18.171875 23.28125 16 23.28125 C 13.828125 23.28125 11.898438 22.589844 10.75 21.65625 C 11.390625 23.390625 13.445313 25 16 25 C 18.554688 25 20.609375 23.398438 21.25 21.53125 Z"/></svg>`,
      wikipedia: `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="98.05px" height="98.05px" viewBox="0 0 98.05 98.05" style="enable-background:new 0 0 98.05 98.05;" xml:space="preserve"><path d="M98.023,17.465l-19.584-0.056c-0.004,0.711-0.006,1.563-0.017,2.121c1.664,0.039,5.922,0.822,7.257,4.327L66.92,67.155 c-0.919-2.149-9.643-21.528-10.639-24.02l9.072-18.818c1.873-2.863,5.455-4.709,8.918-4.843l-0.01-1.968L55.42,17.489 c-0.045,0.499,0.001,1.548-0.068,2.069c5.315,0.144,7.215,1.334,5.941,4.508c-2.102,4.776-6.51,13.824-7.372,15.475 c-2.696-5.635-4.41-9.972-7.345-16.064c-1.266-2.823,1.529-3.922,4.485-4.004v-1.981l-21.82-0.067 c0.016,0.93-0.021,1.451-0.021,2.131c3.041,0.046,6.988,0.371,8.562,3.019c2.087,4.063,9.044,20.194,11.149,24.514 c-2.685,5.153-9.207,17.341-11.544,21.913c-3.348-7.43-15.732-36.689-19.232-44.241c-1.304-3.218,3.732-5.077,6.646-5.213 l0.019-2.148L0,17.398c0.005,0.646,0.027,1.71,0.029,2.187c4.025-0.037,9.908,6.573,11.588,10.683 c7.244,16.811,14.719,33.524,21.928,50.349c0.002,0.029,2.256,0.059,2.281,0.008c4.717-9.653,10.229-19.797,15.206-29.56 L63.588,80.64c0.005,0.004,2.082,0.016,2.093,0.007c7.962-18.196,19.892-46.118,23.794-54.933c1.588-3.767,4.245-6.064,8.543-6.194 l0.032-1.956L98.023,17.465z"/></svg>`,
      wolframAlpha: `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path d="M 25.53125 0.15625 L 20.28125 9.03125 L 10.875 5.15625 L 11.71875 15.3125 L 1.78125 17.65625 L 8.96875 24.5 L 0.90625 32.46875 L 11.5625 34.21875 L 9.9375 46 L 19.8125 40.28125 L 24.96875 49.875 L 30.1875 40.625 L 39.34375 45.375 L 39.125 34.875 L 48.90625 33.6875 L 42.1875 25.3125 L 48.78125 17.40625 L 39.25 15.78125 L 40 5.40625 L 30.375 9.15625 Z M 33.59375 13.09375 L 33.40625 22.6875 L 38.6875 29.3125 L 30.09375 31.6875 L 25.3125 39.09375 L 20.3125 31.6875 L 11.8125 28.8125 L 17.1875 21.90625 L 16.8125 13.1875 L 25 16.5 Z M 20 21 L 20 23 L 30 23 L 30 21 Z M 20 26 L 20 28 L 30 28 L 30 26 Z"/></svg>`,
      facebook: `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Logo Facebook</title><path d="M480 257.35c0-123.7-100.3-224-224-224s-224 100.3-224 224c0 111.8 81.9 204.47 189 221.29V322.12h-56.89v-64.77H221V208c0-56.13 33.45-87.16 84.61-87.16 24.51 0 50.15 4.38 50.15 4.38v55.13H327.5c-27.81 0-36.51 17.26-36.51 35v42h62.12l-9.92 64.77H291v156.54c107.1-16.81 189-109.48 189-221.31z" fill-rule="evenodd"/></svg>`,
      pinterest: `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Logo Pinterest</title><path d="M256.05 32c-123.7 0-224 100.3-224 224 0 91.7 55.2 170.5 134.1 205.2-.6-15.6-.1-34.4 3.9-51.4 4.3-18.2 28.8-122.1 28.8-122.1s-7.2-14.3-7.2-35.4c0-33.2 19.2-58 43.2-58 20.4 0 30.2 15.3 30.2 33.6 0 20.5-13.1 51.1-19.8 79.5-5.6 23.8 11.9 43.1 35.4 43.1 42.4 0 71-54.5 71-119.1 0-49.1-33.1-85.8-93.2-85.8-67.9 0-110.3 50.7-110.3 107.3 0 19.5 5.8 33.3 14.8 43.9 4.1 4.9 4.7 6.9 3.2 12.5-1.1 4.1-3.5 14-4.6 18-1.5 5.7-6.1 7.7-11.2 5.6-31.3-12.8-45.9-47-45.9-85.6 0-63.6 53.7-139.9 160.1-139.9 85.5 0 141.8 61.9 141.8 128.3 0 87.9-48.9 153.5-120.9 153.5-24.2 0-46.9-13.1-54.7-27.9 0 0-13 51.6-15.8 61.6-4.7 17.3-14 34.5-22.5 48a225.13 225.13 0 0063.5 9.2c123.7 0 224-100.3 224-224S379.75 32 256.05 32z"/></svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Logo Instagram</title><path d="M349.33 69.33a93.62 93.62 0 0193.34 93.34v186.66a93.62 93.62 0 01-93.34 93.34H162.67a93.62 93.62 0 01-93.34-93.34V162.67a93.62 93.62 0 0193.34-93.34h186.66m0-37.33H162.67C90.8 32 32 90.8 32 162.67v186.66C32 421.2 90.8 480 162.67 480h186.66C421.2 480 480 421.2 480 349.33V162.67C480 90.8 421.2 32 349.33 32z"/><path d="M377.33 162.67a28 28 0 1128-28 27.94 27.94 0 01-28 28zM256 181.33A74.67 74.67 0 11181.33 256 74.75 74.75 0 01256 181.33m0-37.33a112 112 0 10112 112 112 112 0 00-112-112z"/></svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Logo Linkedin</title><path d="M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32zm-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43 0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c-.01 19.14-13.31 34.43-34.66 34.43zm264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44-17.74 0-28.24 12-32.91 23.69-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44 42.13 0 74 27.77 74 87.64z"/></svg>`
    }

    const links = {
      home: this.get("website"),
      wikipedia: this.get(`wikipedia`),
      reddit: this.get("subreddit"),
      twitter: this.get("twitter"),
      smart_display: this.get("youTubeChannel"),
      linkedin: this.get("linkedin"),
      facebook: this.get("facebook"),
      instagram: this.get("instagram"),
      pinterest: this.get("pinterest"),
      wolframAlpha: this.get("wolframAlpha"),
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
    const type = this.get("type")
    const title = this.get("title")
    const description = this.get("description")
    const template = templates[type] ?? templates.default
    const references = this.findNodes("reference")
      .map(node => node.content)
      .map(
        link =>
          `<a href="${link}">${new URL(link).hostname.replace("www.", "")}</a>`
      )
      .join(" · ")

    const prevPage = this.previous.permalink
    const nextPage = this.next.permalink

    return `import ../header.scroll
viewSourceUrl ${this.sourceUrl}

baseUrl https://cancerdb.com/truebase/

keyboardNav ${prevPage} ${nextPage}
<a class="trueBaseThemePreviousItem" href="${prevPage}">&lt;</a><a class="trueBaseThemeNextItem" href="${nextPage}">&gt;</a>

title ${title}

<div class="trueBaseThemeQuickLinks">${this.quickLinks}</div>

${description ? description : ""}

${template(this)}

${references ? `- Read more about ${title} on ${references}` : ""}

code
 ${this.childrenToString().replace(/\n/g, "\n ")}

import ../footer.scroll
`.replace(/\n\n\n+/g, "\n\n")
  }
}

class CancerDBFolder extends TrueBaseFolder {
  // todo: move these to .truebase settings file
  thingsViewSourcePath = `https://github.com/breck7/CancerDB/blob/main/things/`
  grammarViewSourcePath = `https://github.com/breck7/CancerDB/blob/main/grammar/`
  computedsViewSourcePath = `https://github.com/breck7/CancerDB/blob/main/code/CancerDB.js`

  createParserCombinator() {
    return new TreeNode.ParserCombinator(CancerDBFile)
  }

  // todo: upstream
  get sources() {
    const sources = Array.from(
      new Set(
        this.grammarCode
          .split("\n")
          .filter(line => line.includes("string sourceDomain"))
          .map(line => line.split("string sourceDomain")[1].trim())
      )
    )
    return sources.sort()
  }

  get cancerTypeMap() {
    return this.getCustomIndex("oncoTreeId")
  }

  get subTypesMap() {
    return this.getCustomIndex("parentOncoTreeId")
  }

  getCancerTypeFile(query) {
    if (!this.quickCache.cancerTypesSearchIndex)
      this.quickCache.cancerTypesSearchIndex = this.makeNameSearchIndex(
        this.filter(item => item.get("type") === "cancerType")
      )
    query = query.toLowerCase()
    const hit =
      this.quickCache.cancerTypesSearchIndex.get(query) ||
      this.quickCache.cancerTypesSearchIndex.get(query + " cancer")
    return hit ? this.getFile(hit) : undefined
  }
}

const templates = {}
templates.default = file => ``
// todo: improve scroll image tag to be able to accept html attributes
templates.nciCancerCenter = file => `image ${file.get("nciImage")}
 class nciImage`
templates.cancerType = file => {
  const title = file.get("title")
  const keyMap = new TreeNode(`cancerDotGov Cancer.gov
cancerDotOrg Cancer.org
wikipedia Wikipedia.org
wolframAlpha WolframAlpha`).toObject()
  let pages = Object.keys(keyMap)
    .filter(key => file.has(key))
    .map(key => `<a href="${file.get(key)}">${keyMap[key]}</a>`)
    .join(" · ")

  const parentType = file.get("parentOncoTreeId")
  let parentMessage = ""
  if (parentType && parentType !== "TISSUE") {
    const parent = file.parent.cancerTypeMap[parentType][0]
    parentMessage = `* ${title} is a type of ${parent.link}`
  }
  const oncoTreeId = file.get("oncoTreeId")
  let subTypesMessage = ""
  if (oncoTreeId) {
    const subTypes = file.parent.subTypesMap[oncoTreeId]
    if (subTypes)
      subTypesMessage = `* Subtypes of ${title} include ${subTypes
        .map(file => file.link)
        .join(", ")}`
  }

  //   uscsDeathsPerYear 16757
  // uscsCasesPerYear 74949
  // uscsMortalityRate 22%
  const uscsMortalityRate = file.get("uscsMortalityRate")
  let kpiTable = ""
  if (uscsMortalityRate) {
    kpiTable = `kpiTable
 ${numeral(file.get("uscsDeathsPerYear")).format("0,0")} U.S. deaths per year
 ${numeral(file.get("uscsCasesPerYear")).format("0,0")} U.S. cases per year
 ${file.get("uscsMortalityRate")} U.S. mortality rate`
  }

  if (pages) pages = `* ${title} on ${pages}`
  return `${kpiTable}

${pages}
${parentMessage}
${subTypesMessage}
`
}
templates.documentary = file =>
  file.has("watchOnYouTube") ? `youTube ${file.get("watchOnYouTube")}` : ""

class CancerDBServer extends TrueBaseServer {
  // todo: should we do this?
  get grammarId() {
    return "cdb"
  }

  importFromOncoTreeCommand() {
    const walkType = (tree, items, oncoTreeLevel, parentOncoTreeId) => {
      const oncoTreeId = tree.get("code")
      const title = tree.get("name")
      const mainType = tree.get("mainType")
      const umls = tree.get("externalReferences UMLS 0")
      const nciCode = tree.get("externalReferences NCI 0")
      const tissue = tree.get("tissue")
      const kids = tree.getNode("children")
      const currentCount = items.length
      if (!title) return

      if (kids)
        kids.forEach(node =>
          walkType(node, items, oncoTreeLevel + 1, oncoTreeId)
        )

      items.push({
        title,
        type: "cancerType",
        mainType,
        oncoTreeId,
        parentOncoTreeId,
        tissue,
        umls,
        nciCode,
        oncoTreeLevel,
        subTypes: kids ? items.length - currentCount : 0
      })
    }
    const items = []
    const tree = TreeNode.fromDisk(path.join(ignoreFolder, "oncoTree.tree"))
    walkType(tree.nodeAt(0), items, 0)
    items.pop()

    const theSet = new Set()
    items.forEach(item => {
      if (!item.umls) delete item.umls
      if (!item.nciCode) delete item.nciCode

      if (theSet.has(item.title)) item.title = item.title + " " + item.tissue
      theSet.add(item.title)
    })

    const typeCount = items.length
    const output = new TreeNode(items)
    Disk.write(path.join(ignoreFolder, "types.csv"), output.asCsv)
    const patch = new TreeNode()
    items.forEach(item =>
      this.applyPatch(
        new TreeNode().appendLineAndChildren("create", item).asString
      )
    )
  }

  async crawlCdcCommand() {
    // https://www.cdc.gov/cancer/uscs/dataviz/download_data.htm
    const rows = TreeNode.fromDelimited(
      Disk.read(path.join(ignoreFolder, "BYAGE.TXT")),
      "|"
    )
    const toAdd = {}
    rows
      .filter(
        row =>
          row.get("YEAR") === "2019" &&
          row.get("RACE") === "All Races" &&
          row.get("SEX") !== "Male and Female"
      )
      .forEach(row => {
        const SITE = row.get("SITE")
        const cancerTypePage = this.folder.getCancerTypeFile(SITE)
        if (!cancerTypePage) console.log(`MISSING: ` + SITE)
        if (cancerTypePage) {
          // AGE|CI_LOWER|CI_UPPER|COUNT|EVENT_TYPE|POPULATION|RACE|RATE|SEX|SITE|YEAR
          // 1-4|~|~|~|Mortality|7493614|All Races|~|Female|Colon and Rectum|1999
          //console.log(row.toString())
          const id = cancerTypePage.id
          if (!toAdd[id]) toAdd[id] = {}
          const entry = toAdd[id]
          const sex = row.get("SEX") === "Male" ? "M" : "F"
          const age = row.get("AGE") === "<1" ? "0" : row.get("AGE")
          const count = row.get("COUNT")
          const eventType = row.get("EVENT_TYPE")
          const population = row.get("POPULATION")
          const sexGenderKey = sex + age
          if (!entry[sexGenderKey])
            entry[sexGenderKey] = {
              sex,
              age,
              population,
              cases: "",
              deaths: ""
            }
          if (eventType === "Mortality") entry[sexGenderKey].deaths = count
          else entry[sexGenderKey].cases = count
        }
      })
    Object.keys(toAdd).forEach(id => {
      const file = this.folder.getFile(id)
      const sorted = lodash.sortBy(toAdd[id], "sex", row => parseInt(row.age))
      const tree = new TreeNode(sorted)
      if (!file.has("uscsTable"))
        file.appendLineAndChildren("uscsTable 2019", tree.toDelimited("|"))
      const deaths = lodash.sum(
        sorted.map(item => parseInt(item.deaths)).filter(num => !isNaN(num))
      )
      if (deaths) file.set("uscsDeathsPerYear", deaths.toString())
      const cases = lodash.sum(
        sorted.map(item => parseInt(item.cases)).filter(num => !isNaN(num))
      )
      if (cases) file.set("uscsCasesPerYear", cases.toString())

      if (cases && deaths)
        file.set(
          "uscsMortalityRate",
          numeral((100 * deaths) / cases).format("0") + "%"
        )
      file.prettifyAndSave()
    })
  }

  async crawlWikipediaCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const {
      WikipediaImporter
    } = require("../../truecrawler/wikipedia.org/Wikipedia.js")
    const importer = new WikipediaImporter(this.folder)
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
    const importer = new RedditImporter(this.folder)
    await importer.fetchAllCommand()
    importer.writeToDatabaseCommand()
  }

  async crawlWebsiteCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const { WebsiteImporter } = require("../../truecrawler/website/Website.js")
    const importer = new WebsiteImporter(this.folder)
    await importer.downloadAllCommand()
    importer.matches.forEach(file => file.extractAll())
  }

  async crawlNciCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have truecrawler project installed separateely.
    const { WebsiteImporter } = require("../../truecrawler/website/Website.js")
    const importer = new WebsiteImporter(this.folder, "nciLink")
    await importer.downloadAllCommand()
    importer.matches.forEach(wrappedFile => {
      if (!Disk.exists(wrappedFile.cachePath)) return
      const { content, file } = wrappedFile

      const imageMatch = content.match(
        /property\="og\:image" content\="([^"]+)"/
      )
      if (imageMatch && !file.has("nciImage"))
        file.set("nciImage", imageMatch[1])

      file.prettifyAndSave()
      console.log(imageMatch)

      if (file.has("phoneNumber")) return
      const hits = content
        .match(/href="tel:([^"]+)"/g)
        .filter(l => !l.includes("1-800-4-CANCER"))
        .map(
          i =>
            "1-" +
            i
              .trim()
              .replace('href="tel:', "")
              .replace('"', "")
              .replace("(", "")
              .replace(")", "")
              .replace(" ", "-")
              .replace(/^1-/, "")
        )
      console.log(hits)
      file.appendUniqueLine(`phoneNumber ${hits[0]}`)
      file.prettifyAndSave()
    })
  }

  async crawlWhoIsCommand() {
    const { WhoIsImporter } = require("../../truecrawler/whois/WhoIs.js")
    const importer = new WhoIsImporter(this.folder)
    await importer.updateAllCommand()
  }

  makeUscsTable(columnName) {
    const query = `select uscsDeathsPerYear uscsTable
notMissing uscsDeathsPerYear
sortBy uscsDeathsPerYear
reverse`
    const data = new TreeNode(this._initSearch().searchServer.tree(query))
    const groupedByTypeAndAgeBuckets = {}
    data.forEach(cancerType => {
      const buckets = {}
      const table = TreeNode.fromDelimited(
        cancerType.getNode("uscsTable").content +
          "\n" +
          cancerType.getNode("uscsTable").childrenToString(),
        "|"
      )
      buckets["Age"] =
        `<a href='${cancerType.get("titleLink")}'>` +
        cancerType
          .get("title")
          .replace("Cancer", "")
          .trim() +
        "</a>"
      table.forEach(row => {
        const age = parseInt(row.get("age"))
        const amount = parseInt(row.get(columnName))
        let bucket
        if (age < 10) bucket = "@@0-10"
        else if (age < 20) bucket = "@@10-20"
        else if (age < 30) bucket = "@@20-30"
        else if (age < 40) bucket = "@@30-40"
        else if (age < 50) bucket = "@@40-50"
        else if (age < 60) bucket = "@@50-60"
        else if (age < 70) bucket = "@@60-70"
        else if (age < 80) bucket = "@@70-80"
        else bucket = "@@80+"
        const currentAmount = buckets[bucket] || 0
        buckets[bucket] = currentAmount + (isNaN(amount) ? 0 : amount)
      })
      groupedByTypeAndAgeBuckets[cancerType.get("title")] = buckets
    })
    return groupedByTypeAndAgeBuckets
  }

  makeMagicSquaresOutput(groupedByTypeAndAgeBuckets) {
    const dataTable = this.transposeTSV(
      new TreeNode(groupedByTypeAndAgeBuckets).asTsv
    )
    return {
      dataTable: Utils.stripHtml(dataTable.replace(/\n/g, "\n ")).replace(
        /@@/g,
        ""
      ),
      magicSquares: dataTable.replace(/\n/g, "\n \t\t")
    }
  }

  get overviewTables() {
    const deathGroups = this.makeUscsTable("deaths")
    const casesGroups = this.makeUscsTable("cases")

    const deaths = this.makeMagicSquaresOutput(deathGroups)
    const cases = this.makeMagicSquaresOutput(casesGroups)

    Object.keys(deathGroups).forEach(key => {
      const type = deathGroups[key]
      Object.keys(type).forEach(bucket => {
        if (bucket === "Age") return
        const numerator = type[bucket]
        const denominator = casesGroups[key][bucket]
        type[bucket] = numeral(
          denominator ? numerator / denominator : 0
        ).format("0.00")
      })
    })

    const mortality = this.makeMagicSquaresOutput(deathGroups)

    return {
      DEATHS_SQUARES: deaths.magicSquares,
      DEATHS_TABLE: deaths.dataTable,
      CASES_SQUARES: cases.magicSquares,
      CASES_TABLE: cases.dataTable,
      MORTALITY_SQUARES: mortality.magicSquares,
      MORTALITY_TABLE: mortality.dataTable
    }
  }

  // Written by ChatGPT :)
  transposeTSV(tsvString) {
    // Split the TSV string into rows
    const rows = tsvString.trim().split("\n")

    // Split each row into columns
    const columns = rows.map(row => row.split("\t"))

    // Transpose the matrix (i.e., swap rows and columns)
    const transposedColumns = columns[0].map((_, columnIndex) =>
      columns.map(row => row[columnIndex])
    )

    // Convert the transposed matrix back into a TSV string
    const transposedRows = transposedColumns.map(row => row.join("\t"))
    const transposedTsvString = transposedRows.join("\n")

    return transposedTsvString
  }
}

const cancerDBFolder = new CancerDBFolder().setSettings({
  thingsFolder: path.join(baseFolder, "things"),
  grammarFolder: path.join(baseFolder, "grammar")
})

const CancerDB = new CancerDBServer(
  path.join(baseFolder, "cancerdb.truebase"),
  cancerDBFolder
)

module.exports = { CancerDB }

if (!module.parent) Utils.runCommand(CancerDB, process.argv[2], process.argv[3])
