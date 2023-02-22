class TrueBaseFrontEndApp {
	constructor() {
		window.app = this
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
