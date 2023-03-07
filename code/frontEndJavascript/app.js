const localStorageKeys = {
	email: "email",
	password: "password"
}

class TrueBaseFrontEndApp {
	constructor() {
		window.app = this
	}

	get store() {
		return window.localStorage
	}

	get loggedInUser() {
		return this.store.getItem(localStorageKeys.email)
	}

	hideUserAccountsButtons() {
		jQuery(".loggedIn,.notLoggedIn").hide()
	}

	revealUserAccountButtons() {
		if (this.loggedInUser) {
			jQuery(".loggedIn").show()
			jQuery("#logoutButton").attr(
				"title",
				`Logout of ${this.store.getItem(localStorageKeys.email)}`
			)
		} else jQuery(".notLoggedIn").show()
	}

	logoutCommand() {
		this.store.clear()
		jQuery(".loginMessage").show()
		jQuery(".loginMessage").html(`You are now logged out.`)
		this.hideUserAccountsButtons()
		this.revealUserAccountButtons()
	}

	attemptLoginCommand() {
		const params = new URLSearchParams(window.location.search)
		const email = params.get("email")
		const password = params.get("password")
		window.history.replaceState({}, null, "login.html")
		if (this.loggedInUser) {
			jQuery("#loginResult").html(
				`You are already logged in as ${this.loggedInUser}`
			)
			return
		}
		if (!email || !password) {
			jQuery("#loginResult").html(
				`Email and password not in url. Try clicking your link again? If you think this is a bug please email loginProblems@cancerdb.com`
			)
			return
		}
		jQuery.post("/login", { email, password }, data => {
			if (data === "OK") {
				jQuery("#loginResult").html(`You are logged in as ${email}`)
				this.store.setItem(localStorageKeys.email, email)
				this.store.setItem(localStorageKeys.password, password)
				this.hideUserAccountsButtons()
				this.revealUserAccountButtons()
			} else
				jQuery("#loginResult").html(
					"Sorry. Something went wrong. If you think this is a bug please email loginProblems@cancerdb.com"
				)
		})
	}

	verifyEmailAndSendLoginLinkCommand() {
		// send link
		const email = jQuery("#loginEmail").val()
		const htmlEscapedEmail = Utils.htmlEscaped(email)
		if (!Utils.isValidEmail(email)) {
			jQuery(".loginMessage").show()
			jQuery(".loginMessage").html(
				`'${htmlEscapedEmail}' is not a valid email.`
			)
			return
		}
		jQuery(".notLoggedIn").hide()
		jQuery.post("/sendLoginLink", { email }, data => {
			jQuery(".loginMessage").show()
			console.log(data)
			jQuery(".loginMessage").html(`Login link sent to '${htmlEscapedEmail}'.`)
		})
	}

	renderSearchPage() {
		this.startTQLCodeMirror()
	}

	async startTQLCodeMirror() {
		this.programCompiler = tqlNode
		this.codeMirrorInstance = new GrammarCodeMirrorMode(
			"custom",
			() => tqlNode,
			undefined,
			CodeMirror
		)
			.register()
			.fromTextAreaWithAutocomplete(document.getElementById("tqlInput"), {
				lineWrapping: false,
				lineNumbers: false
			})

		this.codeMirrorInstance.setSize(400, 100)
		this.codeMirrorInstance.setValue(
			(new URLSearchParams(window.location.search).get("q") || "").replace(
				/\r/g,
				""
			)
		)
		this.codeMirrorInstance.on("keyup", () => this._onCodeKeyUp())
	}

	_onCodeKeyUp() {
		const code = this.value
		if (this._code === code) return
		this._code = code
		this.program = new this.programCompiler(code)
		const errs = this.program.scopeErrors.concat(this.program.getAllErrors())

		const errMessage = errs.length
			? errs.map(err => err.getMessage()).join(" ")
			: "&nbsp;"
		document.getElementById("tqlErrors").innerHTML = errMessage
	}

	get value() {
		return this.codeMirrorInstance.getValue()
	}
}
