class TrueBaseBrowserApp {
  static getApp() {
    if (!window.app) window.app = new TrueBaseBrowserApp()
    return window.app
  }

  localStorageKeys = {
    email: "email",
    password: "password",
    staged: "staged",
    author: "author",
    confetti: "confetti"
  }

  get store() {
    return window.localStorage
  }

  get loggedInUser() {
    return this.store.getItem(this.localStorageKeys.email)
  }

  get isLoggedIn() {
    return !!this.loggedInUser
  }

  get author() {
    try {
      const author = this.store.getItem(this.localStorageKeys.author)
      if (author) return author
      const email = this.loggedInUser
      if (!email) return ""
      const name = email.split("@")[0]
      return `${name} <${email}>`
    } catch (err) {
      console.error(err)
    }

    return ""
  }

  render() {
    this.initAutocomplete("trueBaseThemeHeaderSearch")
    return this
  }

  // This method is currently used to enable autocomplete on: the header search, front page search, 404 page search
  initAutocomplete(elementId) {
    const autocompleteSearchIndex = window.autocompleteJs || [] // todo: cleanup?
    const input = document.getElementById(elementId)
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get("q")
    if (query) input.value = query
    autocomplete({
      input,
      minLength: 1,
      emptyMsg: "No matching entities found",
      preventSubmit: true,
      fetch: async (query, update) => {
        const text = query.toLowerCase()
        const suggestions = autocompleteSearchIndex.filter(entity => entity.label.toLowerCase().startsWith(text))

        const htmlEncodedQuery = query.replace(/</g, "&lt;")

        suggestions.push({
          label: `Full text search for "${htmlEncodedQuery}"`,
          id: "",
          url: `/fullTextSearch?q=${htmlEncodedQuery}`
        })
        update(suggestions)
      },
      onSelect: item => {
        const { url, id } = item
        if (id) window.location = url
        else window.location = "/fullTextSearch?q=" + encodeURIComponent(input.value)
      }
    })
  }

  hideUserAccountsButtons() {
    jQuery(".loggedIn,.notLoggedIn").hide()
  }

  revealUserAccountButtons() {
    if (this.loggedInUser) jQuery("#logoutButton").attr("title", `Logout of ${this.store.getItem(this.localStorageKeys.email)}`)
    else {
      jQuery(".loggedIn").hide()
      jQuery(".notLoggedIn").show()
    }
  }

  logoutCommand() {
    this.store.clear()
    this.redirectToLogoutPage()
  }

  redirectToLogoutPage() {
    window.location = "/loggedOut.html"
  }

  async attemptLoginCommand() {
    const params = new URLSearchParams(window.location.search)
    const email = params.get("email")
    const password = params.get("password")
    window.history.replaceState({}, null, "login.html")
    if (this.loggedInUser) {
      jQuery("#loginResult").html(`You are already logged in as ${this.loggedInUser}`)
      return
    }
    if (!email || !password) {
      jQuery("#loginResult").html(`Email and password not in url. Try clicking your link again? If you think this is a bug please email us.`)
      return
    }

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const el = document.querySelector("#loginResult")
    if (response.status === 200) {
      el.innerHTML = `You are logged in as ${email}`
      this.store.setItem(this.localStorageKeys.email, email)
      this.store.setItem(this.localStorageKeys.password, password)
      this.hideUserAccountsButtons()
      this.revealUserAccountButtons()
      this.shootConfettiCommand()
    } else {
      console.error(response)
      el.innerHTML = `Sorry. Something went wrong. If you think this is a bug please email us.`
    }
  }

  get loginMessageElement() {
    return document.querySelector("#loginMessage")
  }

  get loginEmailElement() {
    return document.querySelector("#loginEmail")
  }

  async verifyEmailAndSendLoginLinkCommand() {
    const { loginEmailElement, loginMessageElement } = this
    const email = loginEmailElement.value
    const htmlEscapedEmail = Utils.htmlEscaped(email)
    loginMessageElement.style.display = "inline-block"
    if (!Utils.isValidEmail(email)) {
      loginMessageElement.innerHTML = `<span class="error">'${htmlEscapedEmail}' is not a valid email.</span>`
      return
    }
    jQuery(".notLoggedIn").hide()

    let elapsed = 0
    const interval = setInterval(() => (loginMessageElement.innerHTML = `Sending login link... ${++elapsed / 10}s`), 100)

    const response = await fetch("/sendLoginLink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })
    clearInterval(interval)
    const text = await response.text()

    if (response.status === 200) loginMessageElement.innerHTML = `Login link sent to '${htmlEscapedEmail}'.`
    else loginMessageElement.innerHTML = `<span class="error">Error: ${text}</span>`
  }

  renderSearchPage() {
    this.startTQLCodeMirror()
    if (this.isLoggedIn) {
      if (this.store.getItem(this.localStorageKeys.confetti) === "true") {
        this.store.clear(this.localStorageKeys.confetti)
        this.shootConfettiCommand()
      }
      jQuery("#publishQuery").html(`<button onclick="app.publishQueryCommand()">Publish query</button>`)
    }
  }

  async publishQueryCommand() {
    const response = await fetch("/publishQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ author: this.author, query: this.value })
    })
    const json = await response.json()
    if (response.status === 200) {
      this.store.setItem(this.localStorageKeys.confetti, "true")
      window.location = `/queries/${json.permalink}.html`
    } else jQuery("#publishQuery").html(`<span class="error">Error: ${response}</span>`)
  }

  startTQLCodeMirror() {
    this.fileParser = tqlParser
    this.codeMirrorInstance = new GrammarCodeMirrorMode("custom", () => tqlParser, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("tqlInput"), {
      lineWrapping: false,
      lineNumbers: false
    })

    this.codeMirrorInstance.setSize(400, 100)
    this.codeMirrorInstance.on("keyup", () => this._onCodeKeyUp())
  }

  _onCodeKeyUp() {
    const code = this.value
    if (this._code === code) return
    this._code = code
    this.program = new this.fileParser(code)
    const errs = this.program.scopeErrors.concat(this.program.getAllErrors())

    const errMessage = errs.length ? errs.map(err => err.message).join(" ") : "&nbsp;"
    document.getElementById("tqlErrors").innerHTML = errMessage
  }

  get value() {
    return this.codeMirrorInstance.getValue()
  }

  async renderEditPage() {
    this.renderCodeEditorStuff()
    await this.initEditData()
  }

  renderCreatePage() {
    this.renderCodeEditorStuff()
    try {
      // todo: there's gotta be a better way
      const example = new this.fileParser().root.definition.filter(node => node.has("root"))[0].examples[0].childrenToString()
      document.getElementById("exampleSection").innerHTML = `Example:<br><pre>${example}</pre>`
    } catch (err) {
      console.log(err)
    }
  }

  renderCodeEditorStuff() {
    this.renderForm()
    this.startCodeMirrorEditor()
    this.bindStageButton()
    this.renderStage()
  }

  async initEditData() {
    const { filename, currentFileId } = this
    const localValue = this.stagedFiles.getNode(filename)
    let response = await fetch(`/edit.json?id=${currentFileId}`)
    const data = await response.json()

    if (data.error) return (document.getElementById("formHolder").innerHTML = data.error)

    const id = this.currentFileId
    document.getElementById("pageTitle").innerHTML = `Improve <i><a href="/concepts/${id}.html">${filename}</a></i>`

    this.codeMirrorInstance.setValue(localValue ? localValue.childrenToString() : data.content)
    const title = new TreeNode(this.value).get("title") || filename
    document.getElementById("topMissingMeasurements").innerHTML = `<h3>Missing measurements about ${title}</h3>
    ${data.topMissingMeasurements
      .slice(0, 8)
      .map(measure => `<div title="${measure.column}">${measure.question}</div>`)
      .join("")}`

    document.getElementById("helpfulResearchLinks").innerHTML = data.helpfulResearchLinks

    Mousetrap.bind("left", evt => {
      window.location = `/editPrevious/${id}`
      return false
    })

    Mousetrap.bind("right", evt => {
      window.location = `/editNext/${id}`
      return false
    })
  }

  renderStage() {
    const { stagedFiles } = this

    const isLoggedIn = false // Temporarily disabling login

    const fileCount = stagedFiles.length
    const el = document.getElementById("stagedStatus")
    el.style.display = "none"
    if (!stagedFiles.length) return
    el.innerHTML = `<div>You have <b>${fileCount} staged file${fileCount > 1 ? "s" : ""}</b> ready to submit. ${isLoggedIn ? "Author: " : ""}<span id="authorLabel" class="linkButton" onClick="app.changeAuthor()"></span></div>
 <textarea id="patch" name="patch" readonly></textarea><br>
 <input type="hidden" name="author" id="author" />
 ${isLoggedIn ? '<input type="submit" value="Commit and push" id="saveCommitAndPushButton"/>' : "" /* "<a href='/loginOrJoin.html'>Login</a> to submit." */}
  <a class="linkButton" onClick="app.clearChanges()">Clear local changes</a>`
    el.style.display = "block"
    document.getElementById("patch").value = stagedFiles.asString
    document.getElementById("authorLabel").innerHTML = Utils.htmlEscaped(this.author)
    document.getElementById("author").value = this.author
  }

  bindStageButton() {
    const el = document.getElementById("stageButton")
    el.onclick = () => {
      const tree = this.stagedFiles
      tree.touchNode(this.filename).setChildren(this.value)
      this.setStage(tree.asString)
    }

    Mousetrap.bind("mod+s", evt => {
      el.click()
      evt.preventDefault()
      return false
    })
  }

  setStage(str) {
    this.store.setItem(this.localStorageKeys.staged, str)
    this.renderStage()
  }

  get stagedFiles() {
    const str = this.store.getItem(this.localStorageKeys.staged)
    return str ? new TreeNode(str) : new TreeNode()
  }

  renderForm() {
    document.getElementById("formHolder").innerHTML = `<form method="POST" action="/saveCommitAndPush" id="stagedStatus" style="display: none;"></form>
<div id="editForm">
 <div class="cell" id="leftCell">
   <textarea id="fileContent"></textarea>
   <div id="tqlErrors"></div> <!-- todo: cleanup. -->
 </div>
 <div class="cell">
   <div id="topMissingMeasurements"></div>
   <div id="helpfulResearchLinks"></div>
   <div id="exampleSection"></div>
 </div>
 <div>
   <button id="stageButton">Stage</button>
 </div>
</div>`
  }

  clearChanges() {
    if (confirm("Are you sure you want to delete all local changes? This cannot be undone.")) this.setStage("")
  }

  async startCodeMirrorEditor() {
    this.fileParser = SERVER_TIME_PARSER_NAME // replaced at server time.
    this.codeMirrorInstance = new GrammarCodeMirrorMode("custom", () => SERVER_TIME_PARSER_NAME, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("fileContent"), {
      lineWrapping: false,
      lineNumbers: true
    })

    this.codeMirrorInstance.setSize(this.codeMirrorWidth, 500)
    this.codeMirrorInstance.on("keyup", () => this._onCodeKeyUp())
  }

  get currentFileId() {
    return new URLSearchParams(window.location.search).get("id")
  }

  get fileExtension() {
    return new this.fileParser().fileExtension
  }

  get filename() {
    if (location.pathname.includes("create.html")) return "create"
    return this.currentFileId + "." + this.fileExtension
  }

  get codeMirrorWidth() {
    return document.getElementById("leftCell").width
  }

  get store() {
    return window.localStorage
  }

  saveAuthor(name) {
    try {
      this.store.setItem(this.localStorageKeys.author, name)
    } catch (err) {
      console.error(err)
    }
  }

  changeAuthor() {
    const newValue = prompt(`Enter author name and email formatted like "Breck Yunits <by@breckyunits.com>". This information is recorded in the public Git log.`, this.author)
    if (newValue === "") this.saveAuthor(this.defaultAuthor)
    if (newValue) this.saveAuthor(newValue)
    this.renderStage()
  }

  get route() {
    return location.pathname.split("/")[1]
  }

  renderThankYouCommand(GIT_URL) {
    // todo: clean up vars
    const commit = new URLSearchParams(window.location.search).get("commit") || ""
    document.getElementById("commitHash").innerHTML = `<a href="${GIT_URL}/commit/${commit}">${commit.substring(0, 7)}</a>`
    this.shootConfettiCommand()
  }

  async fetchAndVisualizeDb() {
    const response = await fetch("/visData.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const json = await response.json()
    if (response.status === 200) {
      this.visualizeDb(json.columns, json.rows)
    }
  }

  visualizeDb(columnValues, rowValues, elementId = "modelVis") {
    // Use the golden ratio for visually appealing image dimensions
    let goldenRatio = 1.618
    let width = Math.round(Math.sqrt((columnValues.length + rowValues.length) * goldenRatio))
    let height = Math.round(width / goldenRatio)
    let canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext("2d")
    let imageData = ctx.createImageData(width, height)

    const scale = `#ebedf0 8
#c7e9c0 16
#a1d99b 32
#74c476 64
#41ab5d 128
#238b45 256
#005a32 512`

    const hexToRGBA = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255]

    const thresholds = []
    const colors = []
    scale.split("\n").map(line => {
      const parts = line.split(" ")
      thresholds.push(parseFloat(parts[1]))
      colors.push(hexToRGBA(parts[0]))
    })
    const colorCount = colors.length
    const heatMap = value => {
      if (isNaN(value)) return "" // #ebedf0
      for (let index = 0; index < colorCount; index++) {
        const threshold = thresholds[index]
        if (value <= threshold) return colors[index]
      }
      return colors[colorCount - 1]
    }

    for (let i = 0; i < columnValues.length; i++) {
      let x = i % width
      let y = Math.floor(i / width)
      let pixelIndex = (y * width + x) * 4
      let color = heatMap(columnValues[i])
      if (pixelIndex < imageData.data.length) {
        imageData.data.set(color, pixelIndex)
      }
    }

    let offset = Math.ceil(columnValues.length / width) * width

    for (let i = 0; i < rowValues.length; i++) {
      let x = (i + offset) % width
      let y = Math.floor((i + offset) / width)
      let pixelIndex = (y * width + x) * 4
      let color = heatMap(rowValues[i])
      if (pixelIndex < imageData.data.length) {
        imageData.data.set(color, pixelIndex)
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Append the image to a specific element on your HTML page
    document.getElementById(elementId).appendChild(canvas)
  }

  shootConfettiCommand(duration = 500) {
    var count = 200
    var defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio, opts) {
      confetti(
        Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        })
      )
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55
    })
    fire(0.2, {
      spread: 60
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    })
    return this
  }
}
